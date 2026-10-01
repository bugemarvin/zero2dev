---
title: Shell scripts
summary: Put commands in a file and you have a program. Variables, arguments, decisions and loops in Bash.
---

## Your first script

A shell script is a text file of commands. Create `hello.sh` with this inside:

```bash
#!/usr/bin/env bash
echo "Hello from a script"
```

The first line is the **shebang**. It tells the system which program should read the file, here Bash. Run the script either way:

```console
$ bash hello.sh
Hello from a script
$ chmod +x hello.sh
$ ./hello.sh
Hello from a script
```

## Variables

```bash
name="Sam"
echo "Hello, $name"
```

- **No spaces around `=`.** `name = "Sam"` is an error, because the shell reads `name` as a command.
- Use `$name` to read the value.
- Put variables inside **double quotes**. Without them, a value containing spaces splits into several words.

Capture the output of a command with `$( )`:

```bash
today=$(date +%A)
echo "Today is $today"
```

## Arguments

Words after the script name arrive as `$1`, `$2` and so on. `$#` is how many there are, and `$0` is the script's own name.

```bash
#!/usr/bin/env bash
echo "First: $1"
echo "Count: $#"
```

```console
$ bash args.sh apple banana
First: apple
Count: 2
```

## Decisions

```bash
if [ "$#" -eq 0 ]; then
    echo "No arguments given"
elif [ "$1" = "hi" ]; then
    echo "Hello to you"
else
    echo "You said: $1"
fi
```

The spaces inside `[ ... ]` are required. The common tests:

| Test | True when |
| --- | --- |
| `[ "$a" = "$b" ]` | the two strings are equal |
| `[ "$a" != "$b" ]` | they differ |
| `[ -z "$a" ]` | the string is empty |
| `[ "$n" -eq 5 ]` | numbers are equal (`-ne`, `-lt`, `-le`, `-gt`, `-ge`) |
| `[ -f path ]` | a file exists |
| `[ -d path ]` | a folder exists |

## Loops

Loop over a list:

```bash
for fruit in apple banana cherry; do
    echo "I like $fruit"
done
```

Loop over the lines of standard input:

```bash
total=0
while read -r number; do
    total=$((total + number))
done
echo "$total"
```

`read -r number` puts one line into the variable and fails when the input ends, which stops the loop. `$(( ))` does whole-number arithmetic.

## Exit codes

Every command finishes with a number. **0 means success**, anything else means failure. Your script decides its own with `exit`:

```bash
if [ "$#" -eq 0 ]; then
    echo "usage: greet.sh NAME" >&2
    exit 1
fi
```

`>&2` sends the message to standard error, where error messages belong. After any command, `$?` holds its exit code:

```console
$ ls nothing-here
ls: cannot access 'nothing-here': No such file or directory
$ echo $?
2
```

## Common mistakes

- **Spaces around `=`** in an assignment.
- **Missing spaces inside `[ ]`.** `["$a" = "b"]` fails. Write `[ "$a" = "b" ]`.
- **Unquoted variables.** `[ $name = Sam ]` breaks when `name` is empty. Always write `"$name"`.
- **Windows line endings.** A script saved by a Windows editor can fail with `$'\r': command not found`. Save it with LF line endings (VS Code shows `CRLF` or `LF` at the bottom right; click it to change).
