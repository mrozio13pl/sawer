import { users } from '../users.js';

/**
 * @param {import('sawer').Request} req
 * @param {import('sawer').Response} res
 */
export function GET(req, res) {
    res.statusCode = 200;
    res.end(JSON.stringify({ users }));
}

/**
 * @param {import('sawer').Request} req
 * @param {import('sawer').Response} res
 */
export function POST(req, res) {
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
        const parsedBody = JSON.parse(body);

        users.push(parsedBody);
        res.statusCode = 201;
        res.end(JSON.stringify(parsedBody));
    });
}
