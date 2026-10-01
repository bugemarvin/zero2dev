# A notes API with net/http

Finish the server in `main.go`. It keeps notes in memory.

| Request | Answer |
| --- | --- |
| `GET /notes` | 200 and the list of notes, `[]` when there are none |
| `POST /notes` with `{"text": "..."}` | 201 and the new note: `{"id": 1, "text": "..."}`. Ids start at 1 and go up. |
| `POST /notes` with an empty or missing text | 400 and `{"error": "text is required"}` |
| `POST /notes` with a body that is not JSON | 400 and `{"error": "invalid JSON"}` |
| `GET /notes/{id}` | 200 and the note, or 404 and `{"error": "not found"}` |
| `DELETE /notes/{id}` | 204 with no body, or 404 and `{"error": "not found"}` |

The health route and the `writeJSON` helper are given. Handlers run at the same time, so protect the notes with the mutex.

The first run compiles the web server, which takes a while. Later runs are faster.
