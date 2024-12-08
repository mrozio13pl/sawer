import type { Request, Response } from 'sawer';

export function GET(req: Request, res: Response) {
    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'Hello World' }));
}
