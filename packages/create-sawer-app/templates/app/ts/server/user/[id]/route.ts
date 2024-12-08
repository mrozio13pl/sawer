import type { Request, Response, Params } from 'sawer';
import { users } from '../../users.ts';

export function GET(req: Request, res: Response, params: Params<'id'>) {
    const user = users.find((user) => user.id === +params.id)!;

    res.statusCode = 200;
    res.end(JSON.stringify({ name: user.name }));
}
