import { defineConfig } from 'sawer/config';

export default defineConfig({
    outDir: './dist',
    port: 3000,
    cleanDist: true,
    esbuild: {
        minify: false,
    },
    server: {
        prefixUrl: '/api',
        dir: './app',
    },
});
