#!/usr/bin/env bash

if [[ $# -ne 1 ]]; then
    echo "usage: kind.sh PATH" >&2
    exit 2
fi
path="$1"
if [[ -d "$path" ]]; then
    echo "directory"
elif [[ ! -e "$path" ]]; then
    echo "missing"
elif [[ ! -s "$path" ]]; then
    echo "empty file"
elif [[ "$path" == *.sh ]]; then
    echo "script"
else
    echo "file"
fi
