import { createServer } from "node:http";

const USERS_URL = process.env.USERS_URL ?? "http://localhost:3001";
const ORDERS_URL = process.env.ORDERS_URL ?? "http://localhost:3002";

const routes = [
  { prefix: "/api/users", target: USERS_URL },
  { prefix: "/api/orders", target: ORDERS_URL },
];

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function findRoute(path) {
  return routes.find((route) => path === route.prefix || path.startsWith(route.prefix + "/"));
}

async function forward(req, res, route) {
  const path = req.url.slice("/api".length);
  let upstream;
  try {
    upstream = await fetch(route.target + path, { method: req.method });
  } catch {
    return sendJson(res, 502, { error: "service unavailable" });
  }
  const body = await upstream.text();
  res.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") ?? "application/json" });
  res.end(body);
}

async function check(url) {
  try {
    const response = await fetch(url + "/health");
    return response.ok ? "ok" : "down";
  } catch {
    return "down";
  }
}

createServer(async (req, res) => {
  const path = req.url.split("?")[0];
  if (req.method === "GET" && path === "/health") {
    const [users, orders] = await Promise.all([check(USERS_URL), check(ORDERS_URL)]);
    const allOk = users === "ok" && orders === "ok";
    return sendJson(res, allOk ? 200 : 503, { status: allOk ? "ok" : "degraded", services: { users, orders } });
  }
  const route = findRoute(path);
  if (route) {
    return forward(req, res, route);
  }
  sendJson(res, 404, { error: "no such route" });
}).listen(3000, () => console.log("gateway listening on 3000"));
