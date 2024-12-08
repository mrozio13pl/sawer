/**
 * @param {Error} error
 * @param {import('sawer').Request} req
 * @param {import('sawer').Response} res
 */
export default function handleError(error, req, res) {
    console.error(error);
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Not Found' }));
}
