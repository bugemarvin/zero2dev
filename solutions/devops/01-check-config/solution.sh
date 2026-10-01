#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "usage: $0 ENV_FILE [KEY...]" >&2
    exit 2
fi
file="$1"
shift
if [[ ! -f "$file" ]]; then
    echo "error: $file not found" >&2
    exit 2
fi

missing=0
for key in "$@"; do
    if ! grep -q "^${key}=." "$file"; then
        echo "missing: $key"
        missing=$((missing + 1))
    fi
done

if [[ "$missing" -gt 0 ]]; then
    exit 1
fi
echo "ok"
