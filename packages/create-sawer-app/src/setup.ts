import * as p from '@clack/prompts';
import logger from '@sawerjs/logger';
import pc from 'picocolors';
import isInteractive from 'is-interactive';
import updateNotifier from 'tiny-update-notifier';
import { detect } from 'package-manager-detector/detect';
import { isValidPackageManager, validatePath } from './helpers';
import * as packageJson from '../package.json' assert { type: 'json' };
import type { CreateSawerAppOptions } from './types';
import type { AgentName } from 'package-manager-detector';

export async function setupProject(options: Partial<CreateSawerAppOptions> = {}) {
    if (isInteractive()) {
        p.intro(pc.cyan('create-sawer-app'));
    }

    if (typeof options.javascript !== 'undefined') {
        options.typescript = !options.javascript;
    }

    if (options.yes) {
        const validatedPath = validatePath(options.path!);

        if (validatedPath) {
            logger.error(validatedPath);
            process.exit(1);
        }

        if (options.install && !isValidPackageManager(options.pkgManager!)) {
            logger.error(`Invalid package manager: "${options.pkgManager}"`);
            process.exit(1);
        }

        return {
            path: options.path!,
            typescript: options.typescript ?? true,
            javascript: options.javascript ?? false,
            jsdoc: options.jsdoc ?? true,
            install: options.install ?? true,
            packageManager: options.pkgManager ?? (((await detect())?.name || 'npm') as AgentName),
        };
    }

    const s = p.spinner();
    s.start('Checking for updates...');

    try {
        const update = await updateNotifier({
            pkg: {
                name: packageJson.name,
                version: packageJson.version,
            },
            timeout: 3000,
            cache: false,
        });

        if (update) {
            s.stop('Update available!', 4);
            p.note(`Update: ${update.current} → ${update.latest} (${update.type})`);
        } else {
            s.stop('Using latest version.', 1);
        }
    } catch {
        s.stop("Couldn't get the latest version.", 1);
    }

    const project = await p.group(
        {
            path: async () => {
                if (options.path) {
                    return options.path!;
                }

                return p.text({
                    message: 'What is your project named?',
                    placeholder: 'my-app',
                    validate: validatePath,
                });
            },
            typescript: async () =>
                options.typescript ??
                p.confirm({
                    message: `Do you want to use ${pc.blue('TypeScript')}?`,
                    initialValue: true,
                }),
            jsdoc: async ({ results }) => {
                if (results.typescript) {
                    return true;
                }

                return (
                    options.jsdoc ??
                    p.confirm({
                        message: `Do you want to use ${pc.yellow('JSDoc')}?`,
                        initialValue: true,
                    })
                );
            },
            install: async () =>
                options.install ??
                p.confirm({
                    message: 'Install dependencies?',
                    initialValue: true,
                }),
            packageManager: async ({ results }) => {
                if (options.pkgManager) return options.pkgManager;

                if (results.install) {
                    return p.select({
                        message: 'Choose a package manager',
                        options: [
                            { label: 'NPM', value: 'npm' },
                            { label: 'Yarn', value: 'yarn' },
                            { label: 'PNPM', value: 'pnpm' },
                            { label: 'Bun', value: 'bun' },
                        ],
                        initialValue: (await detect())?.name || 'npm',
                    });
                }
            },
        },
        {
            onCancel: () => {
                p.cancel('Operation cancelled.');
                process.exit(0);
            },
        },
    );

    return project;
}
