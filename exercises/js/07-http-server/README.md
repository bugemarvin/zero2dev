# A server with node:http

Complete `server.mjs`, using only `node:http`. Every response is JSON, with the header `Content-Type: application/json`.

| Request | Response |
| --- | --- |
| `GET /health` | 200 `{"status": "ok"}` |
| `GET /hello?name=Sam` | 200 `{"message": "Hello, Sam!"}` |
| `GET /hello` | 200 `{"message": "Hello, world!"}` |
| `POST /echo` with a JSON body | 200 and the same JSON back |
| `POST /echo` with a body that is not valid JSON | 400 `{"error": "invalid JSON"}` |
| anything else | 404 `{"error": "not found"}` |

The server must listen on the port given in the `PORT` environment variable.

In the app, **Start app** runs your server so you can open it in a browser tab.
