# A backup script with options

Write `backup.sh`:

```text
usage: backup.sh [-v] [-d DIR] FILE...
```

- It copies each `FILE` to `DIR/FILE.bak`. `DIR` defaults to `backup` and is created if it does not exist.
- `-d DIR` chooses another directory.
- `-v` prints `copied FILE` for each file, in order. Without `-v` it prints nothing.
- If any `FILE` does not exist, it prints `error: FILE not found` to standard error and exits with code 1 **without copying anything**: check all the files before you copy the first.
- With no `FILE`, or with an unknown option, it prints the usage line to standard error and exits with code 2.

Parse the options with `getopts`, and start the script with `set -euo pipefail`.
