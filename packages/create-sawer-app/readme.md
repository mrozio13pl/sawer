# Create Sawer App

The easiest way to get start is by using [`create-sawer-app`](https://github.com/mrozio13pl/sawer/tree/main/packages/create-sawer-app). For more advanced ones check out [examples](https://github.com/mrozio13pl/sawer/tree/main/examples) in the repository.

### Interactive CLI

Get started by using the following command:

```bash
npx create-sawer-app@latest
# via yarn
yarn create sawer-app
# via pnpm
pnpm create sawer-app
# via bun
bunx create-sawer-app
```

You will be asked to fill out a few questions to set up your app:

```bash
◇  What is your project named?
│   my-app
│
◆  Do you want to use TypeScript?
│   ● Yes / ○ No
└
```

After that, the app will be created in the `my-app` directory.

### Non-interactive

You can also create an app using command line arguments. Use `--help` to see all available options:

```bash
Usage:
  create-sawer-app [flags...] [project name]

Flags:
  -h, --help                       Show help
  -i, --install                    Install dependencies
  -j, --javascript                 Use JavaScript
  -d, --jsdoc                      Use JSDoc
  -p, --pkg-manager <value>        Package manager
  -t, --typescript                 Use TypeScript
      --version                    Show version
```

## License

This project is licensed under the [MIT](https://github.com/mrozio13pl/sawer/blob/main/license) License ❤️
