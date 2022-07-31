# Logging

This module will log your terminal output to a `.log` file under the directory
`./logs/` whenever you use the `console.error`, `console.warn`, `console.log`,
`console.info`, and `console.debug`. This module also replaces the default
`console.time`, `console.timeLog`, and `console.timeEnd` with my own
implementation to also record their terminal output down. The way you use these
functions will not change.

## Usage

### main.ts

```ts
import 'https://deno.land/x/logging@v0.0.0/mod.ts';

console.log('Hello World');
```

### terminal

```
[1970-00-01T00:00:00Z] [log] Hello World
```

### ./log/1970-00-01T00:00:00Z.log

```
[1970-00-01T00:00:00Z] [log] Hello World
```
