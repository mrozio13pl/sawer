import { parse } from 'regexparam';

export function convertDynamicRoute(route: string) {
    return route
        .split('/')
        .map((p) => {
            if (p.startsWith('[') && p.endsWith(']')) {
                p = ':' + p.slice(1, -1);
            }
            return p;
        })
        .join('/');
}

export function parseRoute(route: string) {
    route = convertDynamicRoute(route);

    return { route, ...parse(route) };
}
