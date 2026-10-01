# Your first documents

Work in the collection `tasks`. It starts empty.

1. Insert these three documents. Give each the `_id` shown.

| `_id` | `title` | `done` | `priority` |
| --- | --- | --- | --- |
| 1 | `"Write report"` | `false` | 2 |
| 2 | `"Buy milk"` | `true` | 3 |
| 3 | `"Call Sam"` | `false` | 1 |

2. Mark the task with `_id` 3 as done, using `updateOne` and `$set`.
3. Delete the task with `_id` 2.
4. Put the remaining tasks in a variable named `result`: only the fields `title` and `done` (no `_id`), sorted by `title`.

Write your commands in `query.js`. **Show result** runs the file on the sample data and prints `result`. Each run starts from a fresh copy of the data, so you can experiment freely.
