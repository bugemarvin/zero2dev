# Strings, counters and expiry

Write the commands that leave Redis in this state:

1. The key `site:name` holds the text `zero2dev`.
2. The key `page:home:views` is a counter with the value `5`. Reach it with `INCR` or `INCRBY`, not by setting 5 directly.
3. The key `session:abc` holds the text `user:42` and expires in **300 seconds**.
4. The key `temp` is set and then deleted again, so it does not exist at the end.
5. The key `lock:report` is set to `worker-1` with `NX`, and then a second `SET ... NX` tries to set it to `worker-2`. The first one must win.

Write one command per line in `commands.redis`. Lines starting with `#` are comments. **Run commands** shows the reply to each line. Every run starts with an empty database.
