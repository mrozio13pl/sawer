import * as p from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import stripComments from 'strip-comments';
import isInteractive from 'is-interactive';
import { resolveCommand } from 'package-manager-detector/commands';
import { x } from 'tinyexec';
import { fdir } from 'fdir';
import { setupProject } from './setup';
import * as packageJson from '../package.json' assert { type: 'json' };
import type * as npm from '@npm/types';
import type { AgentName } from 'package-manager-detector';
import type { CreateSawerAppOptions } from './types';

export async function createSawerApp(options: Partial<CreateSawerAppOptions> = {}) {
    const project = await setupProject(options);

    const templatesDir = path.join(import.meta.dirname, '../templates/app');
    const template = path.join(templatesDir, project.typescript ? 'ts' : 'js');

    await fs.promises.mkdir(project.path);

    const s = isInteractive() ? p.spinner() : void 0;
    s?.start('Creating project...');

    await fs.promises.cp(template, project.path, { recursive: true });

    if (!project.jsdoc) {
        const paths = await new fdir().withFullPaths().crawl(path.join(project.path, 'server')).withPromise();

        for (const pathname of paths) {
            const content = await fs.promises.readFile(pathname, 'utf8');
            await fs.promises.writeFile(pathname, stripComments(content), 'utf8');
        }
    }

    s?.message('Creating package.json...');

    const pkgJson: npm.PackageJSON = {
        name: project.path,
        description: 'Sawer app bootstrapped with create-sawer-app',
        version: '0.0.0',
        type: 'module',
        private: true,
        scripts: {
            start: 'sawer start',
            build: 'sawer build',
            dev: 'sawer dev',
        },
        dependencies: {
            sawer: packageJson.version,
        },
        devDependencies: {
            'sawer-cli': packageJson.version,
        },
    };

    if (project.typescript) {
        pkgJson.devDependencies!['typescript'] = '^5';
        pkgJson.devDependencies!['@types/node'] = '^22';
    }

    await fs.promises.writeFile(path.join(project.path, 'package.json'), JSON.stringify(pkgJson, null, 2));

    if (project.install) {
        s?.message('Installing dependencies...');

        const pkgManager = (project.packageManager || 'npm') as AgentName;
        const { command, args } = resolveCommand(pkgManager, 'install', [])!;

        await x(command, args, {
            nodeOptions: { cwd: project.path },
        });
    }

    s?.stop(pc.green('Done!'));

    const $ = pc.gray('$');

    if (isInteractive()) {
        p.note(`${$} cd ${project.path}\n${!project.install ? $ + ' npm i\n' : ''}${$} npm run dev`, 'Next steps:');
        p.note(pc.cyan('https://github.com/mrozio13pl/sawer'), 'Learn more:');
        p.outro('Happy hacking! ' + pc.red('<3'));
    }
}
