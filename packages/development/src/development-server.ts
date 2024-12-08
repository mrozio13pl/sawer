import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import watcher from '@parcel/watcher';
import { parseRoute, getRoutes, transpileFile, type ExternalImports } from '@sawerjs/core';
import { loadFile } from '@sawerjs/load-file';
import { pathEqual } from 'path-equal';
import { TypedEmitter } from 'tiny-typed-emitter';
import type { SawerConfig } from '@sawerjs/config';
import type { RoutePath, RouteHandlers, Middleware, Method, RouteType, Request, Response, ErrorHandler } from '@sawerjs/types';

interface DevelopmentServerEvents {
    res: (err: Error | null, req: http.IncomingMessage, res: http.ServerResponse) => void;
    compiling: (path: string, route: string, type: RouteType) => void;
    listening: () => void;
}

export interface DevelopmentServerOptions {
    port: number;
    host: string;
}

export class DevelopmentServer extends TypedEmitter<DevelopmentServerEvents> {
    public config: SawerConfig;
    public server: http.Server;
    public watcher!: watcher.AsyncSubscription;
    public imports: ExternalImports = new Map();
    public paths: RoutePath[] = [];
    public middlewares: Map<string, Middleware> = new Map();
    public routes: Map<string, RouteHandlers> = new Map();

    constructor(config: SawerConfig, public options: DevelopmentServerOptions) {
        super();
        this.config = config;
        this.server = http.createServer();
    }

    public async start() {
        if (!fs.existsSync(this.config.server.dir)) {
            console.error(`Directory "${this.config.server.dir}" does not exist`);
            return;
        }

        this.paths = await getRoutes(this.config);

        this.watcher = await watcher.subscribe(this.config.server.dir, this.handleWatcherEvents.bind(this));

        this.server.on('request', this.handleRequest.bind(this));

        this.server.listen(this.options.port, this.options.host, () => {
            this.emit('listening');
        });
    }

    public async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        if (!req.url) {
            req.url = '/';
        }

        const sendError = (err: Error) => {
            if (!res.closed) {
                res.statusCode = 500;
                res.end('Internal Server Error');
            }

            this.emit('res', err, req, res);
        };

        try {
            const pathname = req.url;
            const fileHandlers = this.paths.filter((route) => route.pattern.test(pathname));
            const routeHandler = fileHandlers.find((route) => route.type === 'route');
            const middlewareFiles = fileHandlers.filter((route) => route.type === 'middleware');
            const errorFiles = fileHandlers.filter((route) => route.type === 'error');

            const handleRoute = async (req: Request, res: Response) => {
                if (!routeHandler) {
                    res.statusCode = 404;
                    res.write('Not Found');
                    res.end();
                    return;
                }

                const route =
                    this.routes.get(routeHandler.path) || (await this.loadFile<RouteHandlers>(routeHandler.path, req.url!, 'route'));
                const method = req.method?.toUpperCase() as Method;

                if (!route[method]) {
                    res.statusCode = 405;
                    res.end();
                    return;
                }

                try {
                    await route[method](req, res, {});
                    this.routes.set(routeHandler.path, route);
                } catch (error: any) {
                    if (errorFiles.length) {
                        const errorFile = errorFiles[0];
                        const errorHandler = await this.loadFile<ErrorHandler>(errorFile.path, req.url!, 'error');
                        errorHandler(error, req, res, {});
                    } else {
                        sendError(error);
                    }
                }
            };

            if (middlewareFiles.length) {
                const abortController = new AbortController();
                const { signal } = abortController;

                res.on('close', () => {
                    abortController.abort();
                });

                for (let i = 0; i < middlewareFiles.length; i++) {
                    if (signal.aborted) break;

                    const isLast = i === middlewareFiles.length - 1;
                    const middlewareFile = middlewareFiles[i];

                    let middleware =
                        this.middlewares.get(middlewareFile.path) ||
                        (await this.loadFile<Middleware>(middlewareFile.path, req.url!, 'middleware'));
                    middleware = (middleware as any).default || middleware; // support both esm and cjs
                    this.middlewares.set(middlewareFile.path, middleware);

                    const promise = new Promise<void>((resolve, reject) => {
                        const next = isLast ? handleRoute : (req: Request, res: Response) => resolve();

                        if (signal.aborted) {
                            return reject(new Error('Operation aborted'));
                        }

                        try {
                            middleware(req, res, next, {});
                        } catch (err) {
                            reject(err);
                        }
                    });

                    try {
                        await promise;
                    } catch (err) {
                        if (!signal.aborted) {
                            throw err;
                        }
                    }
                }
            } else {
                await handleRoute(req, res);
            }

            this.emit('res', null, req, res);
        } catch (error: any) {
            sendError(error);
        }
    }

    public handleWatcherEvents(err: Error | null, events: watcher.Event[]) {
        if (err) {
            console.error(err);
            return;
        }

        for (const event of events) {
            const type = path.parse(event.path).name as RouteType;

            if (event.type === 'create') {
                this.paths.push({
                    ...parseRoute(event.path),
                    path: event.path,
                    type,
                });
                continue;
            }

            // remove cached paths
            this.paths = this.paths.filter((route) => !pathEqual(route.path, event.path));

            if (type === 'middleware') {
                this.middlewares.delete(event.path);
            }

            if (type === 'route') {
                this.routes.delete(event.path);
            }
        }
    }

    /** Utility for loading files */
    public async loadFile<T>(pathname: string, route: string, type: RouteType): Promise<T> {
        this.emit('compiling', pathname, route, type);

        if (!fs.existsSync(this.config.outDir)) {
            await fs.promises.mkdir(this.config.outDir, { recursive: true });
        }

        const { code, importPath } = await transpileFile(this.config, this.config.outDir, pathname, this.imports);

        await fs.promises.writeFile(importPath, code, 'utf8');

        return await loadFile<T>(importPath);
    }
}
