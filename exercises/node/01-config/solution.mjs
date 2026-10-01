export function parseArgs(argv) {
  return { command: null, options: {}, rest: [] };
}

export function loadConfig(env) {
  return { port: 3000, databaseUrl: "", debug: false };
}
