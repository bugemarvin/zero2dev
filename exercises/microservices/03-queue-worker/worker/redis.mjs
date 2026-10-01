// A minimal Redis client using only node:net. Given: do not edit.
//
//   const redis = await connect(process.env.REDIS_HOST);
//   await redis.command("SET", "key", "value");      // "OK"
//   await redis.command("GET", "key");               // "value", or null
//   await redis.command("BRPOP", "jobs", "5");       // ["jobs", value], or null after 5 seconds
import net from "node:net";

function parse(buffer, start = 0) {
  // Returns [value, nextIndex], or null if the reply is not complete yet.
  const lineEnd = buffer.indexOf("\r\n", start);
  if (lineEnd < 0) return null;
  const type = String.fromCharCode(buffer[start]);
  const line = buffer.toString("utf8", start + 1, lineEnd);
  const next = lineEnd + 2;
  if (type === "+") return [line, next];
  if (type === "-") return [new Error(line), next];
  if (type === ":") return [Number(line), next];
  if (type === "$") {
    const length = Number(line);
    if (length < 0) return [null, next];
    if (buffer.length < next + length + 2) return null;
    return [buffer.toString("utf8", next, next + length), next + length + 2];
  }
  if (type === "*") {
    const count = Number(line);
    if (count < 0) return [null, next];
    const items = [];
    let position = next;
    for (let i = 0; i < count; i++) {
      const item = parse(buffer, position);
      if (item === null) return null;
      items.push(item[0]);
      position = item[1];
    }
    return [items, position];
  }
  throw new Error("unexpected reply from Redis");
}

function open(host) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port: 6379 });
    socket.once("connect", () => resolve(socket));
    socket.once("error", reject);
  });
}

export async function connect(host = "localhost") {
  let socket;
  for (let attempt = 0; ; attempt++) {
    try {
      socket = await open(host);
      break;
    } catch (error) {
      if (attempt >= 40) throw error;                  // Redis may still be starting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  const waiting = [];
  let buffer = Buffer.alloc(0);
  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    for (let reply = parse(buffer); reply !== null && waiting.length > 0; reply = parse(buffer)) {
      buffer = buffer.subarray(reply[1]);
      const { resolve, reject } = waiting.shift();
      if (reply[0] instanceof Error) reject(reply[0]);
      else resolve(reply[0]);
    }
  });
  socket.on("error", (error) => {
    while (waiting.length > 0) waiting.shift().reject(error);
  });
  return {
    command(...args) {
      return new Promise((resolve, reject) => {
        waiting.push({ resolve, reject });
        const parts = args.map((arg) => {
          const text = String(arg);
          return `$${Buffer.byteLength(text)}\r\n${text}\r\n`;
        });
        socket.write(`*${args.length}\r\n${parts.join("")}`);
      });
    },
    close() {
      socket.end();
    },
  };
}
