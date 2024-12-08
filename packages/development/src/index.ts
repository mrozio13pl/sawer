import { loadConfig } from '@sawerjs/load-config';
import {
    DevelopmentServer,
    type DevelopmentServerOptions,
} from './development-server';

export async function createDevelopmentServer(
    options: DevelopmentServerOptions
) {
    const config = await loadConfig();
    const developmentServer = new DevelopmentServer(config, options);
    return developmentServer;
}

export * from './development-server';
