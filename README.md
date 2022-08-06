# Logging

This module will log your terminal output to a `.log` file under the directory
`./logs/` whenever you use the `console.error`, `console.warn`, `console.log`,
`console.info`, and `console.debug`. This module also replaces the default
`console.time`, `console.timeLog`, and `console.timeEnd` with my own
implementation to also record their terminal output down. The way you use these
functions will not change.

This module also has an addon.ts import which will merge your logs that are a day+ old and zip them. As long as the format of the logs follows that of the mod.ts outputs, there will be no problem. Allowing you to merge logs from several programs into one. The merged logs will be sorted.

## Usage mod.ts

### main.ts

```ts
import 'https://deno.land/x/logging@v1.0.0/mod.ts';

console.log('Hello World');
```

### terminal

```
[1970-00-01T00:00:00.000Z] [log] Hello World
```

### ./log/1970-00-01T00:00:00Z.log

```
[1970-00-01T00:00:00.000Z] [log] Hello World
```

## Usage addon.ts

```ts
import mergeLogs from 'https://deno.land/x/logging@v1.0.0/addon.ts';

await mergeLogs(quiet: boolean = false)
```
