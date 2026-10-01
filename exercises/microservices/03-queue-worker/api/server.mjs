// The API service. Given: do not edit.
//
//   POST /jobs {"text": "..."}  -> 202 {"id": N, "status": "pending"}, and the job is pushed on the list "jobs"
//   GET  /jobs/N                -> {"id": N, "status": "pending"}  or  {"id": N, "status": "done", "result": {...}}
import { createServer } from "node:http";
import { connect } from "./redis.mjs";

const redis = await connect(process.env.REDIS_HOST);

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  let text = "";
  for await (const chunk of req) text += chunk;
  return JSON.parse(text);
}

createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      return sendJson(res, 200, { status: "ok" });
    }
    if (req.method === "POST" && req.url === "/jobs") {
      let body;
      try {
        body = await readJson(req);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      if (typeof body.text !== "string") {
        return sendJson(res, 400, { error: "text is required" });
      }
      const id = await redis.command("INCR", "job:next-id");
      await redis.command("LPUSH", "jobs", JSON.stringify({ id, text: body.text }));
      return sendJson(res, 202, { id, status: "pending" });
    }
    const match = req.url.match(/^\/jobs\/(\d+)$/);
    if (req.method === "GET" && match) {
      const id = Number(match[1]);
      const last = Number(await redis.command("GET", "job:next-id"));
      if (id < 1 || id > last) {
        return sendJson(res, 404, { error: "no such job" });
      }
      const stored = await redis.command("GET", `result:${id}`);
      if (stored === null) {
        return sendJson(res, 200, { id, status: "pending" });
      }
      return sendJson(res, 200, { id, status: "done", result: JSON.parse(stored) });
    }
    sendJson(res, 404, { error: "not found" });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "internal error" });
  }
}).listen(3000, () => console.log("api listening on 3000"));
