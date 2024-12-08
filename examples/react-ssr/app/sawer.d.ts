import type http from 'node:http';

declare module 'sawer' {
    interface Request extends http.IncomingMessage {
        json<T = any>(): Promise<T>;
    }

    interface Response extends http.ServerResponse {
        json<T = any>(data: T): void;
    }
}
