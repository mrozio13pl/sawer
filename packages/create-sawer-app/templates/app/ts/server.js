import { sawer, router, port } from './dist/index.js';
import http from 'node:http';
import fs from 'node:fs';

const server = http.createServer();
const index = fs.readFileSync('./index.html', 'utf-8');

server.on('request', async (req, res) => {
    router.get('/', (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(index);
    });

    await sawer(req, res);

    // a simple example of logging
    console.log(req.method, req.url, res.statusCode);
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
