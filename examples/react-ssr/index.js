import { sawer, router, port } from './dist/index.js';
import http from 'node:http';
import fs from 'node:fs';

const server = http.createServer();
const index = fs.readFileSync('./index.html', 'utf-8');

async function handleJSONBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });

        req.on('error', (err) => {
            reject(err);
        });
    });
}

server.on('request', async (req, res) => {
    // cors
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    router.get('/', (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(index);
    });

    // add custom method for handling JSON body
    req['json'] = async () => await handleJSONBody(req);
    res['json'] = (data) => res.end(JSON.stringify(data));

    await sawer(req, res);

    // a simple example of logging
    console.log(req.method, req.url, res.statusCode);
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
