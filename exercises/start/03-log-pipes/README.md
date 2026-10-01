# Answer questions about a log

Your working folder contains `access.log`. Each line has a time, a level and a user name:

```text
09:00 INFO alice
09:02 ERROR bob
```

Using pipes and redirection, create three files:

1. `errors.txt`: every line that contains `ERROR`, in the original order.
2. `error-count.txt`: just the number of `ERROR` lines.
3. `users.txt`: every user name exactly once, sorted alphabetically.

Do not edit the files by hand, and do not change `access.log`.
