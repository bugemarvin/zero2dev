# One service calls another

The system has two services, each in its own container. `compose.yaml` and both Dockerfiles are given.

- **users** is complete. `GET /users/1` returns `{"id": 1, "name": "Ada"}`, and an unknown id gives 404.
- **orders** is yours to write, in `orders/server.mjs`. Its data is in `orders/data.mjs`: each order has an `id`, an `item` and a `userId`.

Make the orders service answer:

| Request | Response |
| --- | --- |
| `GET /health` | 200 `{"status": "ok"}` |
| `GET /orders/1` | 200 `{"id": 1, "item": "Book", "user": {"id": 1, "name": "Ada"}}` |
| an order whose user does not exist | 200 with `"user": null` |
| an unknown order id | 404 `{"error": "order not found"}` |
| the users service cannot be reached or answers 5xx | 502 `{"error": "users service unavailable"}` |
| anything else | 404 `{"error": "not found"}` |

The user comes from the users service, whose address is in the environment variable `USERS_URL`. Listen on port 3000.

The checker starts both containers with Compose and calls the orders service.

To run it yourself: `PORT=8080 docker compose up -d --build`, then `curl http://127.0.0.1:8080/health`, and `PORT=8080 docker compose down` when you are done. `docker compose logs -f` shows what the services print.
