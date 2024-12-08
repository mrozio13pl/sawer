import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';

export default defineConfig({
    plugins: [tsconfigPaths(), react(), UnoCSS()],
});
