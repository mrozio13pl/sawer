import fs from 'node:fs';
import path from 'node:path';
import { defaultConfig } from '@sawerjs/config';
import { loadFile } from '@sawerjs/load-file';
import type { SawerConfig } from '@sawerjs/types';

export async function loadConfig(filename = 'sawer.config', cwd = process.cwd()): Promise<SawerConfig> {
    const joinCwd = path.join.bind(path, cwd) as typeof path.join;

    const extensions = ['.js', '.cjs', '.mjs', '.ts'];
    const configPath =
        extensions.map((ext) => filename + ext).find((file) => fs.existsSync(joinCwd(file))) ||
        (fs.existsSync(joinCwd(filename)) && filename);

    if (!configPath) {
        return defaultConfig;
    }

    const config = await loadFile(configPath, cwd);

    return config?.default ?? config;
}
