import { defu } from 'defu';
import { defaults } from './defaults';
import type { SawerConfig } from '@sawerjs/types';
import type { PartialDeep } from 'type-fest';

export function defineConfig(config: PartialDeep<SawerConfig>): SawerConfig {
    return defu(config, defaults) as SawerConfig;
}
