# An API with route handlers

`lib/notes.js` is given, with `listNotes()`, `getNote(id)`, `addNote(text)` and `deleteNote(id)`. Ids are numbers. `deleteNote` returns `true` if it removed something.

Write the two route handler files.

## `app/api/notes/route.js`

| Request | Response |
| --- | --- |
| `GET /api/notes` | 200 and the array of notes |
| `POST /api/notes` with `{"text": "..."}` | 201 and the new note: `{"id": 1, "text": "..."}`. The text is trimmed. |
| `POST` with a missing or blank text | 400 `{"error": "text is required"}` |
| `POST` with a body that is not JSON | 400 `{"error": "invalid JSON"}` |

## `app/api/notes/[id]/route.js`

| Request | Response |
| --- | --- |
| `GET /api/notes/1` | 200 and the note, or 404 `{"error": "not found"}` |
| `DELETE /api/notes/1` | 204 with no body, or 404 `{"error": "not found"}` |

This exercise uses the Next.js package set. Download it once from Setup, or run `python3 check.py prefetch next`.
