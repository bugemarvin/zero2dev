import { createServer } from "node:http";

const USERS_URL = process.env.USERS_URL ?? "http://localhost:3001";
const ORDERS_URL = process.env.ORDERS_URL ?? "http://localhost:3002";

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

createServer(async (req, res) => {
  // route /api/users/..., /api/orders/... and /health here
  sendJson(res, 404, { error: "no such route" });
}).listen(3000, () => console.log("gateway listening on 3000"));
