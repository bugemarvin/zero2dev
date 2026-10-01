# Count logins from JSON events

This exercise needs a running PostgreSQL server (`./setup/install.sh --stack postgres`).

The table `events` has two columns: `id` and `payload`, which is `JSONB`. Each payload looks like one of these:

```text
{"type": "login", "user": "ada", "device": {"os": "linux"}}
{"type": "purchase", "user": "ada", "total": 42.5}
```

Count the **login** events of each user. Show two columns: `user_name` and `logins`. Order by `logins`, highest first, then by `user_name`.

Write your answer in `query.sql`. To see what it returns: `python3 check.py show sql/14-jsonb-logins`
