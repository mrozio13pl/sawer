import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
        },
    },
    plugins: [swc.vite()],
});
