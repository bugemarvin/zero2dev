// The orders service. Given: do not edit.
import { createServer } from "node:http";
import { orders } from "./data.mjs";

const USERS_URL = process.env.USERS_URL ?? "http://localhost:3001";

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function getUser(id) {
  const response = await fetch(`${USERS_URL}/users/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`users service answered ${response.status}`);
  }
  return response.json();
}

createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }
  const match = req.url.match(/^\/orders\/(\d+)$/);
  if (req.method === "GET" && match) {
    const order = orders.find((o) => o.id === Number(match[1]));
    if (!order) {
      return sendJson(res, 404, { error: "order not found" });
    }
    try {
      const user = await getUser(order.userId);
      return sendJson(res, 200, { id: order.id, item: order.item, user });
    } catch {
      return sendJson(res, 502, { error: "users service unavailable" });
    }
  }
  sendJson(res, 404, { error: "not found" });
}).listen(3000, () => console.log("orders listening on 3000"));
