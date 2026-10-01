#!/usr/bin/env bash

if [[ $# -eq 0 ]]; then
    echo "usage: card.sh NAME [CITY]" >&2
    exit 2
fi
name="$1"
city="${2:-unknown}"
printf 'Name: %s\n' "$name"
printf 'City: %s\n' "$city"
printf 'Length: %s\n' "${#name}"
