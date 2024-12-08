import { users } from '../../users.js';

/**
 * @param {import('sawer').Request} req
 * @param {import('sawer').Response} res
 * @param {import('sawer').NextFunction} next
 * @param {import('sawer').Params<'id'>} params
 */
export default function middleware(req, res, next, params) {
    if (users.find((user) => user.id === +params.id)) {
        next(req, res);
        return;
    }

    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'User not found' }));
}
