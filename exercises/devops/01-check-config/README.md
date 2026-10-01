# A configuration check

Write `solution.sh`: a script that a deployment runs before starting a service, to check that its configuration is complete.

```console
$ bash solution.sh app.env DATABASE_URL PORT SECRET_KEY
missing: SECRET_KEY
```

- The first argument is an env file with lines such as `PORT=8080`. The other arguments are the keys that must be set.
- For every required key that is not in the file, or whose value is empty, print `missing: KEY`, in the order the keys were given. Then exit with code **1**.
- When nothing is missing, print `ok` and exit with code **0**.
- Lines starting with `#` and blank lines are not settings.
- A key must match a whole name at the start of a line: `PORT` is not set by a line `SUPPORT=yes`.
- With no arguments, or when the file does not exist, print a message to **standard error** and exit with code **2**. Nothing goes to standard output.
