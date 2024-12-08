import path from 'node:path';
import process from 'node:process';

export const joinCwd = path.join.bind(path, process.cwd()) as typeof path.join;

export function JSONParse<T>(data: string): T {
    return JSON.parse(data) as T;
}

export function niceTry<T>(fn: () => T | Promise<T>): T extends Promise<any> ? Promise<Awaited<T> | null> : T | null {
    try {
        const result = fn();

        if (result instanceof Promise) {
            return result.then((value) => value).catch(() => null) as T extends Promise<any> ? Promise<Awaited<T> | null> : never;
        }

        return result as any;
    } catch {
        return null as any;
    }
}

export async function asyncMap<T, U>(iterable: T[], mapper: (item: T, index: number, array: T[]) => Promise<U>): Promise<U[]> {
    const result: U[] = [];
    let index = 0;

    for (const value of iterable) {
        result.push(await mapper(await value, index++, iterable));
    }

    return result;
}

export function withTimeout<T>(fn: () => T, timeout: number, fallback: T): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
        setTimeout(() => {
            reject(fallback);
        }, timeout);
    });

    const functionPromise = fn();

    return Promise.race([functionPromise, timeoutPromise]);
}
