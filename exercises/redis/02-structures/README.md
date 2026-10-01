# A user, a queue and tags

Write the commands for three small tasks.

## A user as a hash

Create the hash `user:1` with the fields `name` = `Ada`, `email` = `ada@example.com` and `logins` = `0`. Then add 1 to `logins` **twice** with `HINCRBY`.

## A queue as a list

Jobs arrive in this order: `a`, `b`, `c`, `d`. Add them to the list `jobs` so that the **oldest is taken first**, then take the first two off the queue. At the end the list holds `c` then `d`.

## Tags as sets

- The set `post:1:tags` contains `redis`, `cache` and `database`.
- The set `post:2:tags` contains `cache`, `python` and `database`.
- Store the tags that **both** posts have in the set `common:tags`, using `SINTERSTORE`.

Write one command per line in `commands.redis`. Lines starting with `#` are comments. **Run commands** shows the reply to each line. Every run starts with an empty database.
