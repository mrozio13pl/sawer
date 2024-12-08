/**
 * @param {import('sawer').Request} req
 * @param {import('sawer').Response} res
 */
export function GET(req, res) {
    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'Hello World' }));
}
