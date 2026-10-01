# What kind of thing is this path?

Write `kind.sh`. It takes one path and prints one word or phrase:

| The path is | Print |
| --- | --- |
| a directory | `directory` |
| a regular file with nothing in it | `empty file` |
| a regular file whose name ends in `.sh` | `script` |
| any other regular file | `file` |
| not there | `missing` |

With no argument, or more than one, print a usage message to standard error and exit with code 2.

```console
$ bash kind.sh notes.txt
file
```
