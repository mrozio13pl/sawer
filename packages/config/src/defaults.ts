import type { SawerConfig } from '@sawerjs/types';

export const defaults: SawerConfig = {
    outDir: './dist',
    port: 8080,
    cleanDist: false,
    server: {
        dir: './server',
        prefixUrl: '/api',
    },
    experimental: {
        cleanTempFiles: true,
    },
};
