import { createServer } from "node:http";

const INVENTORY_URL = process.env.INVENTORY_URL ?? "http://localhost:3001";

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }
  // GET /product/:item and GET /slow-product/:item go here
  sendJson(res, 404, { error: "not found" });
}).listen(3000, () => console.log("shop listening on 3000"));
