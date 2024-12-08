import { codeToHtml } from 'shiki'; // 8.76 MB
import type { Request, Response } from 'sawer';

export async function GET(req: Request, res: Response) {
    res.end(JSON.stringify({ message: 'Hello, world!' }));
}
