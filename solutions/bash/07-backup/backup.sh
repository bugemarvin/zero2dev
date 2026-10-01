#!/usr/bin/env bash

set -euo pipefail

usage() {
    echo "usage: backup.sh [-v] [-d DIR] FILE..." >&2
}

verbose=0
outdir="backup"
while getopts "vd:" option; do
    case "$option" in
        v) verbose=1 ;;
        d) outdir="$OPTARG" ;;
        *) usage; exit 2 ;;
    esac
done
shift $((OPTIND - 1))

if [[ $# -eq 0 ]]; then
    usage
    exit 2
fi

for file in "$@"; do
    if [[ ! -f "$file" ]]; then
        echo "error: $file not found" >&2
        exit 1
    fi
done

mkdir -p "$outdir"
for file in "$@"; do
    cp -- "$file" "$outdir/$file.bak"
    if (( verbose )); then
        echo "copied $file"
    fi
done
