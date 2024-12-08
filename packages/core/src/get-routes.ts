import path from 'node:path';
import { joinURL } from 'ufo';
import { fdir } from 'fdir';
import { convertDynamicRoute, parseRoute } from './parse-route';
import type { RoutePath, RouteType, SawerConfig } from '@sawerjs/types';

const routeFiles = [
    'route',
    'middleware',
    'error',
] satisfies RouteType[] as string[];

export async function getRoutes(config: SawerConfig): Promise<RoutePath[]> {
    const { dir } = config.server;

    return (
        await new fdir()
            .filter((pathname) => {
                const filename = path.parse(pathname).name;
                return routeFiles.includes(filename);
            })
            .withFullPaths()
            .withPathSeparator('/')
            .crawl(dir)
            .withPromise()
    ).map((pathname) => {
        const route = path.relative(dir, pathname).replace(/\\/g, '/');
        const relative = path.relative(process.cwd(), pathname);
        const routeName =
            path.dirname(route) === '.' ? '/' : path.dirname(route);
        const routePath = joinURL(config.server.prefixUrl, routeName);

        return {
            ...parseRoute(routePath),
            type: path.parse(route).name as RouteType,
            path: convertDynamicRoute(relative),
        };
    });
}
