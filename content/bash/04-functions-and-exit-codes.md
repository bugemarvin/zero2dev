---
title: Functions and exit codes
summary: Split a script into named pieces, pass values in and get results out.
---

## Defining a function

```bash
greet() {
    echo "Hello, $1!"
}

greet "Sam"
```

A function is called like a command. Inside it, `$1`, `$2`, `$#` and `"$@"` are the **function's** arguments, not the script's.

Define functions before the code that calls them.

## Local variables

Variables are global unless you say otherwise. Always declare a function's own variables with `local`, or two functions using the name `i` or `result` will overwrite each other:

```bash
count_lines() {
    local file="$1"
    local n
    n="$(wc -l < "$file")"
    echo "$n"
}
```

## Two ways to return something

A function has two channels, and they mean different things.

**1. Its output**, captured with `$( )`. Use this to hand back **data**.

```bash
to_upper() {
    echo "${1^^}"
}

loud="$(to_upper "hello")"
```

**2. Its exit code**, set with `return`. Use this for **yes or no, success or failure**. It is a number from 0 to 255, where 0 means true.

```bash
is_even() {
    (( $1 % 2 == 0 ))
}

if is_even 4; then
    echo "even"
fi
```

A function returns the exit code of its last command, so `is_even` needs no explicit `return`. The arithmetic command `(( ))` exits with 0 when the expression is true.

Do not use `return` to carry data. `return 300` does not work, and `return 5` reads as "failed".

## Error handling inside functions

Report the problem on standard error, and return a non-zero code:

```bash
require_file() {
    if [[ ! -f "$1" ]]; then
        echo "error: $1 not found" >&2
        return 1
    fi
}

require_file "$config" || exit 1
```

`return` leaves the function. `exit` ends the whole script.

## A main function

Putting the script's logic in a `main` function keeps the file readable from top to bottom:

```bash
#!/usr/bin/env bash

usage() {
    echo "usage: $0 FILE" >&2
}

main() {
    if [[ $# -ne 1 ]]; then
        usage
        return 2
    fi
    count_lines "$1"
}

main "$@"
```

## Libraries

A file of functions can be loaded into another script with `source`:

```bash
source "$(dirname "$0")/lib.sh"
```

`$(dirname "$0")` is the folder of the running script, so the library is found wherever the script is called from.

## Checking what a command did

```bash
if cp "$src" "$dst"; then
    echo "copied"
else
    echo "copy failed" >&2
fi
```

Test the command directly in the `if`. Avoid running it and then inspecting `$?` on the next line: any command in between, even an `echo`, replaces `$?`.

## Common mistakes

- **Forgetting `local`.**
- **`local n="$(command)"`.** `local` itself succeeds, which hides a failure of the command. Declare first, assign on the next line.
- **Returning data with `return`.**
- **Printing debug text on standard output** inside a function whose output is captured. It ends up in the captured value. Use `>&2`.
- **Using `exit` inside a function** that is meant to be reusable.
