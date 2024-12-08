<div align="center">
    <img src="./sawer.png" alt="sawer" />
    <p>sawer <i>/sah-ver/</i></p>
    <p>A minimalistic, pure HTTP framework for backend applications 🕳</p>
    <a href="https://npm.im/sawer">
        <img src="https://img.shields.io/npm/v/sawer?style=flat-square&color=%23fff&label=sawer&labelColor=%23111" />
        <img src="https://img.shields.io/npm/dm/sawer?style=flat-square&color=%23fff&labelColor=%23111" />
    </a>
    <br />
</div>

<br />
<br />

> The easiest way to get start is by using [`create-sawer-app`](https://github.com/mrozio13pl/sawer/tree/main/packages/create-sawer-app).

## Installation

Installing the core package:

```bash
$ npm install sawer
```

Installing CLI package:

```bash
$ npm install sawer-cli -D
```

## Getting started

Create a route:

```ts
// server/route.ts
import type { Request, Response } from 'sawer';

export async function GET(req: Request, res: Response) {
    res.end('Hello, world!');
}
```

Create build:

```bash
$ sawer build
```

Run build:

```bash
$ sawer start
```

## Creating custom server

A final build exposes many methods that can be used to create a custom server.\
Including `sawer` which is the main route handler for incoming requests.

```js
// server.js
import { sawer, config } from '../dist/index.js';
import http from 'node:http';

const server = http.createServer();
const port = config.port || 3000;

server.on('request', async (req, res) => {
    // some custom logic
    if (req.url === '/') {
        res.end('<h1>Hello, world!</h1>');
        return;
    }

    await sawer(req, res);
});

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
```

In order to run it, create a build and execute the file:

```bash
$ sawer build
$ node server.js
```

## Disclaimer

> ⚠ This is still being developed. It's not ready for production yet.

## License

This project is licensed under the [MIT](https://github.com/mrozio13pl/sawer/blob/main/license) License ❤️
