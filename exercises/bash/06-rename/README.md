# Clean up file names

Write `rename.sh`. It reads file names from standard input, one per line, and prints the cleaned-up name for each:

1. everything in lower case,
2. every space replaced by an underscore,
3. the extension `.jpeg` changed to `.jpg`.

```console
$ printf 'My Photo.JPEG\nNotes 2024.txt\n' | bash rename.sh
my_photo.jpg
notes_2024.txt
```

It only prints names. It does not rename anything.

Use Bash's own parameter expansion: `${name,,}`, `${name// /_}` and `${name%.jpeg}`. No `sed` or `tr` is needed.
