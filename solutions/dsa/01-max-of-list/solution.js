const tokens = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const n = tokens[0];
let best = tokens[1];
for (let i = 2; i <= n; i++) {
  if (tokens[i] > best) best = tokens[i];
}
console.log(best);
