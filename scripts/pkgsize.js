import pkgSize from 'pkg-size';
import byteSize from 'byte-size';
import columnify from 'columnify';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const workspaceDir = path.join(__dirname, '../packages');

async function readDirs(fp) {
    const entries = await fs.readdir(fp, { withFileTypes: true });

    const dirs = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(entry.path, entry.name));

    return dirs;
}

const packages = await readDirs(workspaceDir);
const results = [];

for (let i = 0; i < packages.length; i++) {
    const pkgDir = packages[i];
    const pkgJson = JSON.parse(
        await fs.readFile(path.join(pkgDir, 'package.json'))
    );

    try {
        const { tarballSize, files } = await pkgSize.default(pkgDir, {
            sizes: ['size', 'gzip', 'brotli'],
        });
        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        const gzip = files.reduce((acc, file) => acc + file.sizeGzip, 0);
        const brotli = files.reduce((acc, file) => acc + file.sizeBrotli, 0);

        results.push({
            name: pkgJson.name,
            totalSize: byteSize(totalSize),
            tarballSize: byteSize(tarballSize),
            gzip: byteSize(gzip),
            brotli: byteSize(brotli),
        });
    } catch (e) {
        console.error(`${pkgJson.name}: ${e.message}`);
    }
}

console.log(columnify(results));
