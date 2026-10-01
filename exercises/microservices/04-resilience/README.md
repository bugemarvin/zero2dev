# Survive a flaky service

Two services. **inventory** is given, and it misbehaves on purpose. Read the comment at the top of `inventory/server.mjs`.

Write the **shop** service in `shop/server.mjs`, so that it copes.

| Request | Response |
| --- | --- |
| `GET /health` | 200 `{"status": "ok"}` |
| `GET /product/ITEM` | 200 `{"item": "apple", "stock": 12}`, taking the stock from `GET /stock/ITEM` of the inventory service |
| `GET /slow-product/ITEM` | the same, taking the stock from `GET /slow/ITEM` |

Rules for every call to the inventory service:

- a **timeout** of 500 milliseconds;
- up to **3 attempts** when the call times out, cannot connect, or answers 5xx;
- a 404 from inventory is **not retried**: answer 404 `{"error": "unknown item"}`;
- if all 3 attempts fail, answer 200 with a **fallback**: `{"item": "melon", "stock": null, "degraded": true}`.

A stock of `0` is a valid answer, not a failure.

The inventory address is in the environment variable `INVENTORY_URL`. `AbortSignal.timeout(500)` gives `fetch` a timeout.

To run it yourself: `PORT=8080 docker compose up -d --build`, then `curl http://127.0.0.1:8080/health`, and `PORT=8080 docker compose down` when you are done. `docker compose logs -f` shows what the services print.
