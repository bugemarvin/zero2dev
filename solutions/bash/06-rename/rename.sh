#!/usr/bin/env bash

while IFS= read -r name || [[ -n "$name" ]]; do
    name="${name,,}"
    name="${name// /_}"
    if [[ "$name" == *.jpeg ]]; then
        name="${name%.jpeg}.jpg"
    fi
    printf '%s\n' "$name"
done
