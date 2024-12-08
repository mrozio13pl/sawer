import { users } from '../../users.js';

/**
 * @param {import('sawer').Request} req
 * @param {import('sawer').Response} res
 * @param {import('sawer').Params<'id'>} params
 */
export function GET(req, res, params) {
    const user = users.find((user) => user.id === +params.id);

    res.statusCode = 200;
    res.end(JSON.stringify({ name: user.name }));
}
