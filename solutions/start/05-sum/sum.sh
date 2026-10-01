#!/usr/bin/env bash
total=0
while read -r number; do
    total=$((total + number))
done
echo "$total"
