import { createServer } from "node:http";

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let text = "";
  for await (const chunk of req) {
    text += chunk;
  }
  return text;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }
  if (req.method === "GET" && url.pathname === "/hello") {
    const name = url.searchParams.get("name") || "world";
    return sendJson(res, 200, { message: `Hello, ${name}!` });
  }
  if (req.method === "POST" && url.pathname === "/echo") {
    try {
      return sendJson(res, 200, JSON.parse(await readBody(req)));
    } catch {
      return sendJson(res, 400, { error: "invalid JSON" });
    }
  }
  sendJson(res, 404, { error: "not found" });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`listening on ${port}`));
