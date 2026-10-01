#!/usr/bin/env bash

is_even() {
    (( $1 % 2 == 0 ))
}

max() {
    if (( $1 > $2 )); then
        echo "$1"
    else
        echo "$2"
    fi
}

repeat() {
    local text="$1"
    local n="$2"
    local out=""
    local i
    for (( i = 0; i < n; i++ )); do
        out+="$text"
    done
    echo "$out"
}

to_upper() {
    echo "${1^^}"
}
