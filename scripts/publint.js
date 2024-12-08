import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { publint } from 'publint';
import { formatMessage } from 'publint/utils';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const workspaceDir = path.join(__dirname, '../packages');

async function readDirs(fp) {
    const entries = await fs.promises.readdir(fp, { withFileTypes: true });

    const dirs = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(entry.path, entry.name));

    return dirs;
}

// read all packages in the workspace
const packages = await readDirs(workspaceDir);

for (let i = 0; i < packages.length; i++) {
    const pkgDir = packages[i];
    const pkgJson = JSON.parse(
        await fs.promises.readFile(path.join(pkgDir, 'package.json'))
    );
    const { messages } = await publint({ pkgDir });

    if (!messages.length) {
        console.log(`✅ ${pkgJson.name}`);
    } else {
        console.error(`❌ ${pkgJson.name}`);
    }

    messages.forEach((message) => {
        console.log(formatMessage(message, pkgJson));
    });
}
