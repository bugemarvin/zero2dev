# A notes API

Finish `index.php`. It answers every request, because the server is started with it as the router script.

| Request | Answer |
| --- | --- |
| `GET /notes` | 200 and the list of notes, `[]` when there are none |
| `POST /notes` with `{"text": "..."}` | 201 and the new note: `{"id": 1, "text": "..."}`. The text is trimmed. Ids start at 1 and are never reused. |
| `POST /notes` with an empty or missing text | 400 and `{"error": "text is required"}` |
| `POST /notes` with a body that is not JSON | 400 and `{"error": "invalid JSON"}` |
| `GET /notes/{id}` | 200 and the note, or 404 and `{"error": "not found"}` |
| `DELETE /notes/{id}` | 204 with no body, or 404 |
| anything else | 404 and `{"error": "not found"}` |

A PHP script forgets everything when the request ends. Keep the notes in the file whose path is in `$file`: the `load` and `save` functions are given.
