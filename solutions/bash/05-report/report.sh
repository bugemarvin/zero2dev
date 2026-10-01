#!/usr/bin/env bash

input="$(cat)"
if [[ -z "$input" ]]; then
    echo "highest: none"
    exit 0
fi
printf '%s\n' "$input" | awk -F, '{ total[$2] += $3; count[$2]++ } END { for (d in total) print d, total[d], count[d] }' | sort
printf '%s\n' "$input" | sort -t, -k3 -n -r | head -n 1 | awk -F, '{ print "highest: " $1, $3 }'
