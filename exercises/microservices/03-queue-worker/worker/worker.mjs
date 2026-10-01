import { connect } from "./redis.mjs";

const redis = await connect(process.env.REDIS_HOST);
console.log("worker started");

// Loop for ever: take a job from the list "jobs", compute its result, store it under result:ID.
