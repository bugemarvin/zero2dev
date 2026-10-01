// The inventory service. Given: do not edit. It misbehaves on purpose.
//
//   GET /stock/ITEM  fails with 500 on every odd-numbered call for that item, and answers on the even ones.
//                    The item "melon" always fails. An unknown item answers 404.
//   GET /slow/ITEM   answers correctly, after 3 seconds.
import { createServer } from "node:http";

const stock = { apple: 12, pear: 0, melon: 5 };
const calls = {};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }
  const match = req.url.match(/^\/(stock|slow)\/([a-z]+)$/);
  if (req.method !== "GET" || !match) {
    return sendJson(res, 404, { error: "not found" });
  }
  const [, kind, item] = match;
  if (!(item in stock)) {
    return sendJson(res, 404, { error: "unknown item" });
  }
  if (kind === "slow") {
    return setTimeout(() => sendJson(res, 200, { item, stock: stock[item] }), 3000);
  }
  calls[item] = (calls[item] ?? 0) + 1;
  if (item === "melon" || calls[item] % 2 === 1) {
    console.log(`stock/${item}: call ${calls[item]} fails`);
    return sendJson(res, 500, { error: "temporary failure" });
  }
  console.log(`stock/${item}: call ${calls[item]} answers`);
  sendJson(res, 200, { item, stock: stock[item] });
}).listen(3000, () => console.log("inventory listening on 3000"));
