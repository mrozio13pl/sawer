import { transform, type JscTarget } from '@swc/core';
import { JSONParse, niceTry } from '@sawerjs/utils';
import { getTsconfig } from 'get-tsconfig';
import fileUrl from 'file-url';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import type * as npm from '@npm/types';

const require = Module.createRequire(import.meta.url);

/**
 * Transpile Typescript content using SWC
 *
 * @param content - Typescript code to transpile
 * @param filename - Filename used to find tsconfig
 * @param cwd (default: `process.cwd()`)
 */
export async function transpileTypescript(filename: string, cwd = process.cwd()): Promise<{ code: string; isEsm: boolean }> {
    const joinCwd = path.join.bind(path, cwd) as typeof path.join;
    const fullPath = joinCwd(filename);

    const tsConfig = getTsconfig(fullPath)?.config;
    const pkgJson = niceTry(() => JSONParse<npm.PackageJSON>(fs.readFileSync(joinCwd('./package.json'), 'utf-8')));

    const isEsm = tsConfig?.compilerOptions?.module === 'esnext' || pkgJson?.type === 'module';

    const content = await fs.promises.readFile(fullPath, 'utf8');

    const { code } = await transform(content, {
        jsc: {
            target: (tsConfig?.compilerOptions?.target as JscTarget) || 'es2022',
            parser: {
                syntax: 'typescript',
                tsx: !!tsConfig?.compilerOptions?.jsx,
            },
            transform: {
                react: {
                    runtime: tsConfig?.compilerOptions?.jsx === 'react-jsx' ? 'automatic' : 'classic',
                },
            },
        },
        module: {
            type: isEsm ? 'es6' : 'commonjs',
        },
        sourceMaps: tsConfig?.compilerOptions?.sourceMap || false,
    });

    return { code, isEsm };
}

/**
 * Load and parse a file.
 *
 * @param filename - The file to load
 * @param cwd (default: `process.cwd()`)
 */
export async function loadFile<T = any>(filename: string, cwd = process.cwd()): Promise<T> {
    const joinCwd = path.join.bind(path, cwd) as typeof path.join;
    const fullPath = joinCwd(filename);

    const pkgJson = niceTry(() => JSONParse<npm.PackageJSON>(fs.readFileSync(joinCwd('./package.json'), 'utf-8')));

    const ext = path.extname(filename);

    // transpile typescript files
    if (ext === '.ts') {
        const { code, isEsm } = await transpileTypescript(filename, cwd);

        const tempFile = `${path.parse(filename).name}.${Date.now()}.${isEsm ? 'mjs' : 'cjs'}`;
        await fs.promises.writeFile(joinCwd(tempFile), code, 'utf8');
        const config = await loadFile(tempFile, cwd);
        await fs.promises.unlink(joinCwd(tempFile));
        return config;
    }

    // dynamically import es modules or require commonjs modules
    const importEsm = async () => await import(fileUrl(fullPath));

    if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
        if (ext === '.cjs') {
            return require(fullPath);
        }
        if (ext === '.mjs') {
            return await importEsm();
        }

        return pkgJson?.type === 'module' ? await importEsm() : require(fullPath);
    }

    throw new Error(`Unsupported file extension: ${ext}`);
}
