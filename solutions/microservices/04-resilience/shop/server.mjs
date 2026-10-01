import { createServer } from "node:http";

const INVENTORY_URL = process.env.INVENTORY_URL ?? "http://localhost:3001";

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// Up to `attempts` tries, each with a timeout. Returns the response, or throws after the last failure.
async function getWithRetry(url, attempts, timeoutMs) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (response.status < 500) {
        return response;
      }
      lastError = new Error(`status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function product(res, item, endpoint) {
  let response;
  try {
    response = await getWithRetry(`${INVENTORY_URL}/${endpoint}/${item}`, 3, 500);
  } catch {
    return sendJson(res, 200, { item, stock: null, degraded: true });
  }
  if (response.status === 404) {
    return sendJson(res, 404, { error: "unknown item" });
  }
  const data = await response.json();
  sendJson(res, 200, { item, stock: data.stock });
}

createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }
  const match = req.url.match(/^\/(product|slow-product)\/([a-z]+)$/);
  if (req.method === "GET" && match) {
    return product(res, match[2], match[1] === "product" ? "stock" : "slow");
  }
  sendJson(res, 404, { error: "not found" });
}).listen(3000, () => console.log("shop listening on 3000"));
