import * as acorn from 'acorn';
import path from 'node:path';
import fs from 'node:fs/promises';
import Module from 'node:module';
import detective from 'detective';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath, findStaticImports, resolveImports, findExports, pathToFileURL } from 'mlly';
import { transpileTypescript } from '@sawerjs/load-file';
import { joinCwd, niceTry } from '@sawerjs/utils';
import { createRollup } from './create-rollup';
import type { SawerConfig } from '@sawerjs/types';
import type { Node } from 'estree';

export type ExternalImports = Map<string, string>;

const typescriptPaths = ['.ts', '.mts', '.cts', '.tsx', '.mtsx', '.ctsx'];

function findDynamicImports(code: string): string[] {
    const dynamicImports: string[] = [];

    const ast = acorn.parse(code, {
        ecmaVersion: 'latest',
        sourceType: 'module',
    });

    function traverseNode(node: Node) {
        try {
            if (node.type === 'ImportExpression' && node.source && node.source.type === 'Literal') {
                const source = node.source.value;

                if (!source) return;

                dynamicImports.push(source.toString());
            }

            for (const key in node) {
                const value = node[key as keyof Node];
                if (value && typeof value === 'object') {
                    traverseNode(value as any);
                }
            }
        } catch {}
    }

    // @ts-expect-error
    traverseNode(ast);

    return dynamicImports;
}

export async function findImportsAndReexports(code: string) {
    const imports = findStaticImports(code);
    const exports = findExports(code).filter(({ specifier }) => specifier);
    const dynamicImports =
        niceTry(() => findDynamicImports(code))?.map((imp) => ({
            type: 'dynamic',
            code: `import {} from '${imp}';`,
            specifier: imp,
        })) || [];

    return [...dynamicImports, ...imports, ...exports] as const;
}

export async function transpileFile(config: SawerConfig, tempDir: string, routePath: string, imports: ExternalImports) {
    const isTypescript = typescriptPaths.includes(path.extname(routePath));
    const fileUuid = uuidv4();

    let importPath = fileUuid;
    let code = await fs.readFile(routePath, 'utf8');

    if (isTypescript) {
        const { code: tsCode, isEsm } = await transpileTypescript(routePath);

        importPath = path.join(tempDir, `${path.parse(importPath).name}.${isEsm ? 'mjs' : 'cjs'}`);
        code = tsCode;
    } else {
        importPath = path.join(tempDir, importPath + '.js');
    }

    const reqs = niceTry(() => detective(code));

    if (reqs?.length) {
        const require = Module.createRequire(pathToFileURL(routePath).toString());

        for (const req of reqs) {
            const resolved = require.resolve(req).replace(/\\/g, '/');

            imports.set(req, resolved);
            code = code.replace(req, resolved);
        }
    }

    const imps = await findImportsAndReexports(code);

    for (const imp of imps) {
        const resolved = await resolveImports(imp.code, {
            url: joinCwd(routePath),
        });
        let specifier = (await findImportsAndReexports(resolved))[0]?.specifier;

        if (!specifier) continue;
        if (!path.isAbsolute(fileURLToPath(specifier))) specifier = pathToFileURL(path.join(path.dirname(routePath), specifier));
        if (specifier === routePath) continue;
        // console.log('>', specifier, routePath);

        const updatedImp = imp.code.replace(imp.specifier!, specifier!);

        let importPath = imports.get(specifier!);

        if (!importPath) {
            const tempPath = `${uuidv4()}-detective.js`;
            const fullPath = path.join(tempDir, tempPath);

            await fs.writeFile(fullPath, updatedImp, 'utf8');
            const {
                code,
                importPath: newImportPath,
                imports: newImports,
            } = await transpileFile(config, tempDir, path.relative(process.cwd(), fileURLToPath(specifier!).toString()), imports);

            imports = newImports;
            importPath = newImportPath;
            imports.set(specifier!, importPath);

            await fs.writeFile(importPath, code, 'utf8');

            // overwrite the original file
            const bundle = await createRollup(
                {
                    input: importPath,
                    output: {
                        dir: tempDir,
                        format: 'esm',
                    },
                },
                config,
            );
            await bundle.write({
                format: 'es',
                dir: tempDir,
            });
        }

        if (imp.type === 'dynamic') {
            code = code.replace(imp.specifier!, `../../${importPath}`);
        } else {
            code = code.replace(imp.code, imp.code.replace(imp.specifier!, `../../${importPath}`));
        }
    }

    return {
        importPath: importPath.replace(/\\/g, '/'),
        code,
        isTypescript,
        imports,
    };
}
