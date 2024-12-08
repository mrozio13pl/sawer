import type { IncomingMessage, ServerResponse } from 'node:http';

/** @type {import('node:http').IncomingMessage} */
export type Request = IncomingMessage;

/** @type {import('node:http').ServerResponse} */
export type Response = ServerResponse;

export type Params<K extends string = string> = Record<K, string>;
export type NextFunction = (req: Request, res: Response) => void;

export type Middleware = (req: Request, res: Response, next: NextFunction, params: Params) => void;

export type ErrorHandler = (error: Error, req: Request, res: Response, params: Params) => void;

export interface RoutePath {
    type: RouteType;
    keys: string[];
    pattern: RegExp;
    path: string;
    route: string;
}

export type RouteType = 'route' | 'middleware' | 'error';

export type RouteHandler = (req: Request, res: Response, params: Params) => Promise<void>;

export type RouteHandlers = {
    POST: RouteHandler;
    GET: RouteHandler;
    PUT: RouteHandler;
    DELETE: RouteHandler;
    PATCH: RouteHandler;
    OPTIONS: RouteHandler;
    HEAD: RouteHandler;
    CONNECT: RouteHandler;
    TRACE: RouteHandler;
};

export type Method = keyof RouteHandlers;

export type SawerRequestHandler = (req: Request, res: Response) => Promise<void>;
