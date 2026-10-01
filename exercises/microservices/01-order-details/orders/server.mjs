import { createServer } from "node:http";
import { orders } from "./data.mjs";

const USERS_URL = process.env.USERS_URL ?? "http://localhost:3001";

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }
  // GET /orders/:id goes here
  sendJson(res, 404, { error: "not found" });
}).listen(3000, () => console.log("orders listening on 3000"));
