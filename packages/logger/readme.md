# @sawerjs/logger

Simple logger used by sawer.

This should be preferably used only in development mode for now as it brings [`picocolors`](https://npm.im/picocolors) dependency with it. If that's not a problem for you and you just want a simple logger, feel free to use it.

## Usage

A basic example:

```js
import logger from '@sawerjs/logger';

logger.success('Hello, world!');
// "● Hello, world!"
```

### Create a new logger

Create a new instance of the logger with `new Logger()`:

```js
import { Logger } from '@sawerjs/logger';

const logger = new Logger();
```

### Enable debug mode

Enable debug mode with `Logger.setDebug(true)`:

```js
import logger from '@sawerjs/logger';

logger.setDebug(true);
logger.debug('Debug message');
// "● Debug message"
```

Alternatively you can enable debug mode when creating a logger:

```js
import { Logger } from '@sawerjs/logger';

const logger = new Logger({ debug: true });
```

## API

-   `log.success(...args)` calls `console.log` with green dot (`●`) prefix

-   `log.info(...args)` calls `console.log` with blue dot (`●`) prefix

-   `log.warn(...args)` calls `console.log` with yellow dot (`●`) prefix

-   `log.error(...args)` calls `console.log` with red dot (`●`) prefix

-   `log.debug(...args)` calls `console.log` with magenta dot (`●`)

    Note that debug mode must be enabled with `Logger.setDebug(true)`

-   `log.log(...args)` simply calls `console.log(...args)`

-   `log.setDebug(debug)` sets debug mode

-   `log.enableDebug` variable is `true` when debug mode is enabled

## License

This project is licensed under the [MIT](https://github.com/mrozio13pl/sawer/blob/main/license) License ❤️
