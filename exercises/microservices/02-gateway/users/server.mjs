// The users service. Given: do not edit.
import { createServer } from "node:http";

const users = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Linus" },
];

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }
  const match = req.url.match(/^\/users\/(\d+)$/);
  if (req.method === "GET" && match) {
    const user = users.find((u) => u.id === Number(match[1]));
    return user ? sendJson(res, 200, user) : sendJson(res, 404, { error: "user not found" });
  }
  sendJson(res, 404, { error: "not found" });
}).listen(3000, () => console.log("users listening on 3000"));
