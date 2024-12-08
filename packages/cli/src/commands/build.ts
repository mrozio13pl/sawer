import { createBuild } from '@sawerjs/build';
import logger from '@sawerjs/logger';

function formatTime(time: number) {
    if (time < 1000) {
        return time + 'ms';
    }

    return Math.ceil(time / 1000) + 's';
}

export async function build() {
    const start = Date.now();
    const builder = await createBuild();
    await builder.build();
    logger.success('Build complete in', formatTime(Date.now() - start));
}
