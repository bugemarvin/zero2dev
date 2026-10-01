# Arguments and configuration

Write two functions in `solution.mjs`. Both are pure: they receive their input as arguments and do not read `process` themselves, which is what makes them testable.

## `parseArgs(argv)`

Receives the arguments after the script name, for example `["serve", "site", "--port", "8080", "--verbose"]`, and returns:

```javascript
{ command: "serve", options: { port: "8080", verbose: true }, rest: ["site"] }
```

- The first argument that does not start with `--` is the `command`. With none, `command` is `null`.
- `--name value` sets `options.name` to the text `value`.
- `--name` followed by another option, or by nothing, sets `options.name` to `true`.
- `--name=value` works too.
- Later arguments that do not start with `--` and are not the value of an option go into `rest`.

## `loadConfig(env)`

Receives an object such as `process.env` and returns `{ port, databaseUrl, debug }`.

- `port` is a number: `env.PORT` converted, or `3000` when it is missing. If it is not a whole number from 1 to 65535, throw an `Error` whose message is `PORT must be a number from 1 to 65535`.
- `databaseUrl` is `env.DATABASE_URL`. When it is missing or empty, throw an `Error` whose message is `DATABASE_URL is required`.
- `debug` is `true` only when `env.DEBUG` is exactly `"1"` or `"true"`.
