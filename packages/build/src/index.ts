import { Builder } from './builder';
import { loadConfig } from '@sawerjs/load-config';

export async function createBuild() {
    const config = await loadConfig();
    return new Builder(config);
}

export { Builder };
