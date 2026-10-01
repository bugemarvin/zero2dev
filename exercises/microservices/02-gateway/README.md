# An API gateway

Three services. **users** and **orders** are complete and are not reachable from outside. Write the **gateway**, the only published service, in `gateway/server.mjs`.

| Request to the gateway | What it does |
| --- | --- |
| `GET /api/users/...` | forwards to the users service as `/users/...` |
| `GET /api/orders/...` | forwards to the orders service as `/orders/...` |
| `GET /health` | asks both services for their `/health` |
| anything else | 404 `{"error": "no such route"}` |

Forwarding means: the client receives the **same status and the same JSON body** that the service returned, including 404s.

`/api/usersettings` must **not** match the users route: a prefix only matches when it is followed by `/` or is the whole path.

`GET /health` answers 200 `{"status": "ok", "services": {"users": "ok", "orders": "ok"}}` when both are healthy. If one cannot be reached or does not answer 200, its entry is `"down"`, the overall status is `"degraded"` and the HTTP status is 503.

The addresses are in the environment variables `USERS_URL` and `ORDERS_URL`. If a service cannot be reached while forwarding, answer 502 `{"error": "service unavailable"}`.

To run it yourself: `PORT=8080 docker compose up -d --build`, then `curl http://127.0.0.1:8080/health`, and `PORT=8080 docker compose down` when you are done. `docker compose logs -f` shows what the services print.
