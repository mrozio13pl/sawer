import { cli, command } from 'cleye';
import { version } from '../package.json' assert { type: 'json' };

const argv = cli({
    name: 'sawer',
    version,
    description: 'CLI for sawer',
    commands: [
        command({
            name: 'dev',
            description: 'Start development server',
            flags: {
                port: {
                    alias: 'p',
                    type: Number,
                    description: 'Port number',
                    default: 3000,
                },
                host: {
                    type: String,
                    description: 'Host address',
                    default: 'localhost',
                },
            },
        }),
        command({
            name: 'build',
            description: 'Build app',
        }),
        command({
            name: 'start',
            description: 'Start sawer app',
        }),
    ],
});

switch (argv.command) {
    case 'dev': {
        await (await import('./commands/dev')).dev(argv.flags);
        break;
    }
    case 'build': {
        await (await import('./commands/build')).build();
        break;
    }
    case 'start': {
        await (await import('./commands/start')).start();
        break;
    }
    default: {
        console.error('Command not found');
    }
}
