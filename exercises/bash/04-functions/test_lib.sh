#!/usr/bin/env bash

# Test driver. Do not edit.
source "$(dirname "$0")/lib.sh"

case "${1:-}" in
    even)
        for n in 4 7 0 -2 -3; do
            if is_even "$n"; then echo "$n even"; else echo "$n odd"; fi
        done
        echo "output of is_even 4: [$(is_even 4)]"
        ;;
    max)
        echo "$(max 3 9) $(max 9 3) $(max -5 -2) $(max 4 4)"
        ;;
    repeat)
        echo "[$(repeat ab 3)] [$(repeat x 1)] [$(repeat x 0)] [$(repeat 'a b' 2)]"
        ;;
    upper)
        echo "$(to_upper hello) $(to_upper 'Mixed Case 42')"
        ;;
    locals)
        text="outer" n="outer" out="outer" i="outer"
        repeat zz 2 > /dev/null
        echo "$text $n $out $i"
        ;;
esac
