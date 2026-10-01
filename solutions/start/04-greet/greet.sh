#!/usr/bin/env bash
if [ "$#" -eq 0 ]; then
    echo "usage: greet.sh NAME" >&2
    exit 1
fi
echo "Hello, $1!"
