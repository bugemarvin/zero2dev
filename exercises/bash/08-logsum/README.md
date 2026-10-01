# Summarise a log file

Write `logsum.sh`. It takes the name of a log file whose lines look like this:

```text
2025-05-03 10:01:13 ERROR disk almost full
```

That is: a date, a time, a level (`INFO`, `WARN` or `ERROR`) and a message.

It prints five lines:

```console
$ bash logsum.sh app.log
lines: 7
INFO: 3
WARN: 1
ERROR: 3
top error: disk almost full
```

- `top error` is the `ERROR` message that occurs most often. If two are equally frequent, print the one that comes first alphabetically. If there are no errors, print `top error: none`.
- If the file does not exist, print `error: NAME not found` to standard error and exit with code 1.
- With no argument, print a usage message to standard error and exit with code 2.

Careful with `set -e`: `grep -c` exits with 1 when the count is zero.
