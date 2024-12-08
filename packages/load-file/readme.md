# @sawerjs/load-file

Load Typescript & Javascript files for both commonjs and esm using
[swc](https://swc.rs/).

## Usage

```ts
// some-file.ts
export const foo = 'bar';
```

```ts
import { loadFile } from '@sawerjs/load-file';

const { foo } = await loadFile('./some-file.ts');
// => bar
```

### Arguments

-   **filename**: The path to the file to load.
-   **cwd** (optional): The current working directory.

### Using with CommonJS

```js
const { loadFile } = require('@sawerjs/load-file');
```

<hr />

This package is part of [sawer](https://github.com/mrozio13pl/sawer.js).
