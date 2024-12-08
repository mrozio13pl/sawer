import defu from 'defu';
import { rollup, type RollupOptions } from 'rollup';
import type { SawerConfig } from '@sawerjs/types';

// rollup plugins
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import dynamicImportVariables from '@rollup/plugin-dynamic-import-vars';
import esbuild, { type Options as EsbuildOptions } from 'rollup-plugin-esbuild';

export function createRollup(rollupOptions: RollupOptions, config: SawerConfig) {
    const esbuildOptions: EsbuildOptions = defu(config.esbuild, {
        minify: true,
    });

    // @ts-expect-error rollup options
    const options: RollupOptions = defu(rollupOptions, {
        output: {
            format: 'esm',
            // exports: 'named',
        },
        plugins: [nodeResolve(), commonjs(), json(), dynamicImportVariables(), esbuild(esbuildOptions)],
    });

    return rollup(options);
}
