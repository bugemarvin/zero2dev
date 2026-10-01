---
title: Automation
summary: Find files, act on many at once, schedule jobs, and combine everything into a useful report.
---

## find

`find` walks a directory tree and prints what matches.

```bash
find . -name "*.log"                 # by name
find . -type f -size +10M            # files larger than 10 MB
find . -type d -name node_modules    # directories
find . -mtime -1                     # changed in the last 24 hours
find /var/log -name "*.log" -mtime +30    # older than 30 days
```

Run a command on each result with `-exec`. `{}` stands for the file, and `+` passes many files in one call:

```bash
find . -name "*.tmp" -exec rm -- {} +
find . -name "*.sh" -exec chmod +x {} +
```

Print the list first. Add the `-exec` only when the list is right.

## xargs

`xargs` turns lines of input into arguments of a command:

```bash
find . -name "*.txt" -print0 | xargs -0 wc -l
```

`-print0` and `-0` separate names with a zero byte, which is the only safe way when names contain spaces or newlines.

`xargs -P 4` runs four commands at a time, an easy way to use several processor cores.

## Redirection in full

| Form | Effect |
| --- | --- |
| `> file` | standard output to the file, replacing it |
| `>> file` | append |
| `2> file` | standard error to the file |
| `> file 2>&1` | both to the file |
| `2>/dev/null` | throw error messages away |
| `< file` | read from the file |
| `<<< "text"` | read from the string |
| `cmd1 \| tee file \| cmd2` | save a copy on the way through |

`/dev/null` is a file that discards everything written to it.

## Running in the background

```bash
long_task &             # start it and continue
pid=$!                  # its process id
wait "$pid"             # wait for it; the exit code becomes available
```

`nohup command &` keeps a job running after you close the terminal.

## Scheduling with cron

`cron` runs commands on a schedule. Edit your table with `crontab -e`. Each line has five time fields and a command:

```text
# minute  hour  day-of-month  month  day-of-week   command
  0       2     *             *      *             /home/sam/bin/backup.sh
  */15    *     *             *      *             /home/sam/bin/check-disk.sh
  0       9     *             *      1-5           /home/sam/bin/report.sh
```

The first runs at 02:00 every day, the second every 15 minutes, the third at 09:00 on weekdays.

Jobs run with a minimal environment: a short `PATH` and no terminal. So in a script meant for cron:

- use full paths, or set `PATH` at the top;
- send output to a log file: `backup.sh >> /home/sam/backup.log 2>&1`;
- test it by running it with a nearly empty environment: `env -i /bin/bash script.sh`.

## A real report

Everything in this track comes together in scripts like this one, which summarises a log file whose lines look like `2025-05-03 10:21:07 ERROR disk almost full`:

```bash
#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "usage: $0 LOGFILE" >&2
    exit 2
fi
log="$1"
if [[ ! -f "$log" ]]; then
    echo "error: $log not found" >&2
    exit 1
fi

echo "lines: $(wc -l < "$log")"
for level in INFO WARN ERROR; do
    count="$(grep -c " $level " "$log" || true)"
    echo "$level: $count"
done

echo "most common error:"
grep " ERROR " "$log" | cut -d' ' -f4- | sort | uniq -c | sort -rn | head -n 1
```

`grep -c` exits with 1 when it counts zero matches, which under `set -e` would stop the script. `|| true` says that zero is fine.

## When to stop using Bash

Bash is the right tool for gluing programs together: run this, then that, move these files. It becomes the wrong tool when a script needs data structures, careful error handling, arithmetic with fractions, or more than about a hundred lines. Move to Python at that point. Knowing where that line is, is part of knowing Bash.

## Common mistakes

- **`find ... | xargs rm`** without `-print0` and `-0`.
- **Deleting with `-exec rm`** before looking at what `find` matched.
- **Cron jobs that work in the terminal and fail silently at night**, because of `PATH` or relative paths.
- **`2>&1 > file`** in the wrong order. Write `> file 2>&1`.
- **A long Bash script** that should have been a Python program.
