import type { Request, Response, Params } from 'sawer';
import { users, type User } from '../users.ts';

export function GET(req: Request, res: Response) {
    res.statusCode = 200;
    res.end(JSON.stringify({ users }));
}

export function POST(req: Request, res: Response) {
    if (req.headers['content-type'] !== 'application/json') {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Invalid content type' }));
        return;
    }

    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const parsedBody = JSON.parse(body) as User;

        users.push(parsedBody);
        res.statusCode = 201;
        res.end(JSON.stringify(parsedBody));
    });
}
