import path from 'node:path';
import fs from 'node:fs';
import { TypedEmitter } from 'tiny-typed-emitter';
import { createRollup, getRoutes, randomExport, transpileFile, type ExternalImports } from '@sawerjs/core';
import { asyncMap } from '@sawerjs/utils';
import type { SawerConfig } from '@sawerjs/types';

export class Builder extends TypedEmitter<{
    build: () => void;
}> {
    constructor(public config: SawerConfig) {
        super();
    }

    async build() {
        const routes = await getRoutes(this.config);

        if (this.config.cleanDist)
            await fs.promises.rm(this.config.outDir, {
                recursive: true,
                force: true,
            });

        let imports: ExternalImports = new Map();
        const routesTempDir = path.join(this.config.outDir, 'routes');

        if (!fs.existsSync(routesTempDir)) {
            await fs.promises.mkdir(routesTempDir, { recursive: true });
        }

        const entryContent = `import Router, { METHODS } from 'sawer/router';

const router = new Router();
const middleware = new Router();
const error = new Router();

// Sawer config
export const config = ${JSON.stringify(this.config, null, 4)};

${(
    await asyncMap(routes, async (route) => {
        const { importPath, imports: newImports, code } = await transpileFile(this.config, routesTempDir, route.path, imports);
        const exportName = randomExport();
        newImports.forEach((value, key) => {
            imports.set(key, value);
        });

        await fs.promises.writeFile(importPath, code, 'utf8');

        return `
// ${route.route}
import * as ${exportName} from '../${importPath}';

${
    route.type === 'middleware'
        ? `// ${route.route} middleware
middleware.use('${route.route}', ${exportName}.default);`
        : ''
}

${
    route.type === 'route'
        ? `Object.keys(${exportName}).forEach((key) => {
  if (METHODS.includes(key)) {
    router.add(key, '${route.route}', ${exportName}[key]);
  }
});`
        : ''
}

${
    route.type === 'error'
        ? `// ${route.route} error handler
error.use('${route.route}', ${exportName}.default);`
        : ''
}`;
    })
).join('\n')}

// route handler
const sawer = async (req, res) => {
    const [path, method] = [req.url, req.method?.toUpperCase()];
    const { handlers, params } = router.find(method, path);
    const { handlers: middlewareHandlers } = middleware.find(method, path);

    async function errorHandler(err, req, res) {
        const { handlers: errorHandlers } = error.find(method, path);

        if (errorHandlers.length) {
            for (const handler of errorHandlers) {
                await handler(err, req, res, params);
            }
        } else {
            throw err;
        }
    }

    async function handleRoute(req, res) {
        const abortController = new AbortController();

        await new Promise(async (resolve, reject) => {
            res.on('close', () => {
                abortController.abort();
                resolve();
            });

            try {
                for (const handler of handlers) {
                    await handler(req, res, params);
                }
            } catch (err) {
                await errorHandler(err, req, res);
            }
        })
    }

    // (req, res, next, params)
    if (middlewareHandlers.length) {
        const abortController = new AbortController();
        const { signal } = abortController;

        res.on('close', () => {
            abortController.abort();
        });

        for (let i = 0; i < middlewareHandlers.length; i++) {
            if (signal.aborted) break;
            const isLast = i === middlewareHandlers.length - 1;
            const middlewareHandler = middlewareHandlers[i];

            const promise = new Promise((resolve, reject) => {
                const next = isLast ? handleRoute : resolve;

                if (signal.aborted) {
                    return reject(new Error('Operation aborted'));
                }

                try {
                    middlewareHandler(req, res, next, params);
                } catch (err) {
                    reject(err);
                }
            });

            try {
                await promise;
            } catch (err) {
                if (!signal.aborted) {
                    await errorHandler(err, req, res);
                }
            }
        }
    } else {
        await handleRoute(req, res);
    }
};

const port = ${this.config.port};

export { sawer, router, middleware, error as errorHandler, port };
`;

        if (!fs.existsSync(this.config.outDir)) await fs.promises.mkdir(this.config.outDir, { recursive: true });

        const tempFile = path.join(this.config.outDir, `sawer-template.${Date.now()}.js`);

        await fs.promises.writeFile(tempFile, entryContent, 'utf8');

        const bundle = await createRollup(
            {
                input: tempFile,
                output: {
                    dir: this.config.outDir,
                    format: 'esm',
                    name: 'index.js',
                    entryFileNames: '[name]-sawer.js',
                },
            },
            this.config,
        );
        const { output } = await bundle.write({
            entryFileNames: 'index.js',
            dir: this.config.outDir,
            format: 'esm',
            inlineDynamicImports: true,
        });

        await fs.promises.writeFile(
            path.join(this.config.outDir, 'index.d.ts'),
            `// Type definitions for sawer
import type { Request, Response, SawerConfig } from 'sawer';
import type Router from 'sawer/router';

declare const config: SawerConfig;

declare const router: Router;
declare const middleware: Router;
declare const errorHandler: Router;
declare const port: number;

declare function sawer(req: Request, res: Response): Promise<void>;

export { config, port, sawer, router, middleware, errorHandler };`,
            'utf8',
        );

        if (this.config.experimental.cleanTempFiles) {
            await fs.promises.unlink(tempFile);
            await fs.promises.rm(routesTempDir, {
                recursive: true,
                force: true,
            });
        }

        return { output };
    }
}
