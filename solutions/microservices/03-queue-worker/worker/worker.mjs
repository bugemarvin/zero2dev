import { connect } from "./redis.mjs";

const redis = await connect(process.env.REDIS_HOST);
console.log("worker started");

function compute(job) {
  return {
    upper: job.text.toUpperCase(),
    words: job.text.split(/\s+/).filter(Boolean).length,
  };
}

while (true) {
  const reply = await redis.command("BRPOP", "jobs", "5");
  if (reply === null) {
    continue;
  }
  const job = JSON.parse(reply[1]);
  await redis.command("SET", `result:${job.id}`, JSON.stringify(compute(job)));
  console.log(`job ${job.id} done`);
}
