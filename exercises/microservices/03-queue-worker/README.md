# A queue and a worker

Three containers: **api**, **worker** and **redis**. The API and a small Redis client, `redis.mjs`, are given. Read `api/server.mjs` to see what it puts on the queue.

- `POST /jobs` with `{"text": "..."}` answers 202 at once, and pushes a job `{"id": N, "text": "..."}`, as JSON, onto the Redis list `jobs` with `LPUSH`.
- `GET /jobs/N` answers `pending` until a result is stored under the key `result:N`.

Write the worker in `worker/worker.mjs`. In an endless loop it:

1. takes the next job from the list `jobs` with `BRPOP jobs 5`, which waits up to 5 seconds and returns `null` if nothing came;
2. computes the result: `{"upper": the text in upper case, "words": the number of words in the text}`, where words are separated by whitespace;
3. stores it as JSON under `result:ID` with `SET`.

`BRPOP` returns an array: the list name, then the value.

The Redis host is in the environment variable `REDIS_HOST`. The worker is not a web server: it has no port.

To run it yourself: `PORT=8080 docker compose up -d --build`, then `curl http://127.0.0.1:8080/health`, and `PORT=8080 docker compose down` when you are done. `docker compose logs -f` shows what the services print.
