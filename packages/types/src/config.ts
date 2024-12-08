import type { Options } from 'rollup-plugin-esbuild';
import type { RollupOptions, Plugin } from 'rollup';

export interface ServerConfig {
    dir: string;
    prefixUrl: string;
}

export interface SawerConfig {
    outDir: string;
    port: number;
    cleanDist: boolean;
    server: ServerConfig;
    esbuild?: Options;
    rollupConfig?: Omit<RollupOptions, 'plugins'>;
    rollupPlugins?: Plugin<any>[];
    experimental: {
        cleanTempFiles?: boolean;
    };
}
