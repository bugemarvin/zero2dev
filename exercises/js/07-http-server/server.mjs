import { createServer } from "node:http";

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  // route the request here
  sendJson(res, 404, { error: "not found" });
});

server.listen(3000);
