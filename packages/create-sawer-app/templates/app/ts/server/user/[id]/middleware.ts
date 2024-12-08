import type { Request, Response, NextFunction, Params } from 'sawer';
import { users } from '../../users.ts';

export default function middleware(
    req: Request,
    res: Response,
    next: NextFunction,
    params: Params<'id'>
) {
    if (users.find((user) => user.id === +params.id)) {
        next(req, res);
        return;
    }

    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'User not found' }));
}
