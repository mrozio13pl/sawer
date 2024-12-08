import pc from 'picocolors';

export class Logger {
    enableDebug = false;

    public constructor({ debug }: { debug: boolean } = { debug: false }) {
        this.enableDebug = debug;
    }

    setDebug(enableDebug: boolean) {
        this.enableDebug = enableDebug;
    }

    debug(...args: any[]) {
        if (this.enableDebug) {
            console.log(pc.magenta('●'), ...args);
        }
    }

    log(...args: any[]) {
        console.log(...args);
    }

    success(...args: any[]) {
        console.log(pc.green('●'), ...args);
    }

    warn(...args: any[]) {
        console.warn(pc.yellow('●'), ...args);
    }

    error(...args: any[]) {
        console.error(pc.red('●'), ...args);
    }

    info(...args: any[]) {
        console.log(pc.bold('○'), ...args);
    }
}
