export function parseArgs(argv) {
  const result = { command: null, options: {}, rest: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const body = arg.slice(2);
      const equals = body.indexOf("=");
      if (equals >= 0) {
        result.options[body.slice(0, equals)] = body.slice(equals + 1);
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        result.options[body] = argv[i + 1];
        i++;
      } else {
        result.options[body] = true;
      }
    } else if (result.command === null) {
      result.command = arg;
    } else {
      result.rest.push(arg);
    }
  }
  return result;
}

export function loadConfig(env) {
  const port = env.PORT === undefined || env.PORT === "" ? 3000 : Number(env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a number from 1 to 65535");
  }
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  return { port, databaseUrl: env.DATABASE_URL, debug: env.DEBUG === "1" || env.DEBUG === "true" };
}
