import type { Request, Response } from 'sawer';

export default function handleError(error: Error, req: Request, res: Response) {
    console.error(error);
    res.statusCode = 500;
    res.end('Internal Server Error');
}
