#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "usage: logsum.sh LOGFILE" >&2
    exit 2
fi
log="$1"
if [[ ! -f "$log" ]]; then
    echo "error: $log not found" >&2
    exit 1
fi

echo "lines: $(wc -l < "$log" | tr -d ' ')"
for level in INFO WARN ERROR; do
    count="$(awk -v level="$level" '$3 == level { n++ } END { print n + 0 }' "$log")"
    echo "$level: $count"
done

top="$(awk '$3 == "ERROR" { $1 = $2 = $3 = ""; sub(/^ +/, ""); print }' "$log" | sort | uniq -c | sort -k1,1nr -k2 | head -n 1 | sed -E 's/^ *[0-9]+ //')"
echo "top error: ${top:-none}"
