#!/usr/bin/env bash

if [[ $# -eq 0 ]]; then
    echo "usage: stats.sh NUMBER..." >&2
    exit 2
fi
sum=0
min="$1"
max="$1"
for n in "$@"; do
    sum=$((sum + n))
    (( n < min )) && min="$n"
    (( n > max )) && max="$n"
done
echo "count: $#"
echo "sum: $sum"
echo "min: $min"
echo "max: $max"
