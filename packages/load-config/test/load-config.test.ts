import { loadConfig } from '../src';
import { joinCwd } from '@sawerjs/utils';
import { defaultConfig } from '@sawerjs/config';
import { expect, test } from 'vitest';

test('loadConfig commonjs', async () => {
    const config = await loadConfig(
        void 0,
        joinCwd('./test/__fixtures__/workspace-cjs')
    );
    expect(config.port).toEqual(2000);
});

test('loadConfig commonjs (cjs)', async () => {
    const config = await loadConfig(
        void 0,
        joinCwd('./test/__fixtures__/workspace-cjs2')
    );
    expect(config.port).toEqual(2000);
});

test('loadConfig esm', async () => {
    const config = await loadConfig(
        void 0,
        joinCwd('./test/__fixtures__/workspace-esm')
    );
    expect(config.port).toEqual(2000);
});

test('loadConfig typescript', async () => {
    const config = await loadConfig(
        void 0,
        joinCwd('./test/__fixtures__/workspace-ts')
    );
    expect(config.port).toEqual(2000);
});

test('loadConfig defaults', async () => {
    const config = await loadConfig(
        void 0,
        joinCwd('./test/__fixtures__/workspace-empty')
    );
    expect(config).toStrictEqual(defaultConfig);
});
