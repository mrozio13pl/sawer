import { defineConfig } from 'sawer/config';

export default defineConfig({
    outDir: './dist',
    port: 3000,
    cleanDist: true,
    server: {
        prefixUrl: '/api',
    },
});
