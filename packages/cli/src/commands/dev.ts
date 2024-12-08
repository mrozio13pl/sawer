import pc from 'picocolors';
import PrettyError from 'pretty-error';
import logger from '@sawerjs/logger';
import { createDevelopmentServer, type DevelopmentServerOptions } from '@sawerjs/dev';
import { version } from '../../package.json' assert { type: 'json' };

export async function dev(options: DevelopmentServerOptions) {
    logger.warn(
        `This command is still work in progress, please for now use the ${pc.bold('sawer build')} command and start the server instead.`,
    );

    const prettyError = new PrettyError();
    prettyError.skipNodeFiles();
    prettyError.appendStyle({
        'pretty-error > header': {
            marginTop: '1',
        },
    });

    const developmentServer = await createDevelopmentServer(options);

    developmentServer.on('listening', () => {
        logger.log(`
    ${pc.black('▼ Saver.js ' + version)}
    - Listening on http://${options.host}:${options.port}
  `);
    });

    developmentServer.on('compiling', (path, route, type) => {
        logger.log(type === 'middleware' ? '●' : '○', 'Compiling', route);
    });

    developmentServer.on('res', (err, req, res) => {
        const statusCode = res.statusCode || 500;
        const method = req.method?.toUpperCase() || 'GET';

        if (statusCode >= 400) {
            logger.error(pc.bold(method), req.url, pc.red(statusCode));
        } else if (statusCode >= 300) {
            logger.warn(pc.bold(method), req.url, pc.yellow(statusCode));
        } else {
            logger.success(pc.bold(method), req.url, pc.green(statusCode));
        }

        if (err) {
            logger.log(prettyError.render(err));
        }
    });

    await developmentServer.start();
}
