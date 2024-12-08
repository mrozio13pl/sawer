import { cli } from 'cleye';
import { createSawerApp } from './create-sawer-app';
import isInteractive from 'is-interactive';
import { isValidPackageManager } from './helpers';
import { version } from '../package.json' assert { type: 'json' };
import type { Agent } from 'package-manager-detector';

function PackageManager(value: string): Agent {
    if (!isValidPackageManager(value)) {
        throw new Error(`Invalid package manager: "${value}"`);
    }

    return value as Agent;
}

const argv = cli({
    name: 'create-sawer-app',
    version,
    description: 'Create sawer app',
    parameters: ['[project name]'],
    flags: {
        typescript: {
            type: Boolean,
            description: 'Use TypeScript',
            alias: 't',
        },
        javascript: {
            type: Boolean,
            description: 'Use JavaScript',
            alias: 'j',
        },
        jsdoc: {
            type: Boolean,
            description: 'Use JSDoc',
            alias: 'd',
        },
        install: {
            type: Boolean,
            description: 'Install dependencies',
            alias: 'i',
        },
        pkgManager: {
            type: PackageManager,
            description: 'Package manager',
            alias: 'p',
        },
        yes: {
            type: Boolean,
            description: 'Skip prompts',
            alias: 'y',
            default: !isInteractive(),
        },
    },
});

createSawerApp({
    path: argv._['projectName'],
    ...argv.flags,
});
