# A todo API with Express

Complete `server.mjs`. Keep the todos in an array in memory. Ids start at 1 and go up by one.

| Request | Response |
| --- | --- |
| `GET /todos` | 200 and the array of todos |
| `POST /todos` with `{"title": "..."}` | 201 and the new todo: `{"id": 1, "title": "...", "done": false}`. The title is trimmed. |
| `POST /todos` with a missing or blank title | 400 `{"error": "title is required"}` |
| `GET /todos/:id` | 200 and the todo, or 404 `{"error": "not found"}` |
| `PATCH /todos/:id` with `{"done": true}` | 200 and the updated todo, or 404 |
| `DELETE /todos/:id` | 204 with no body, or 404 |

Listen on the port in the `PORT` environment variable.

This exercise uses Express from the Node package set. If the app says it is not downloaded yet, use the Download button, or run `python3 check.py prefetch node` once.
