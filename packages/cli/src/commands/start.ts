import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { loadConfig } from '@sawerjs/load-config';
import type { SawerRequestHandler } from '@sawerjs/types';

export async function start() {
    const config = await loadConfig();
    const mainFile = path.join(process.cwd(), config.outDir, 'index.js');

    if (!fs.existsSync(mainFile)) {
        const { default: pc } = await import('picocolors');
        await import('@sawerjs/logger').then(({ default: logger }) => {
            logger.error(`File ${pc.yellow(path.join(config.outDir, 'index.js'))} does not exist, create a build first.`);
        });
        return;
    }
    const { sawer } = (await import(pathToFileURL(mainFile).toString())) as {
        sawer: SawerRequestHandler;
    };
    const server = createServer(sawer);

    server.on('request', sawer);

    server.listen(config.port, () => {
        console.log(`Server running at http://localhost:${config.port}`);
    });
}
