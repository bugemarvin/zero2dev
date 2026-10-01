# Resolve a merge conflict

On `main`, the file `colors.txt` says `favorite: green`. On `feature/blue` the same line says `favorite: blue`.

1. Merge `feature/blue` into `main`. Git stops with a conflict.
2. Edit `colors.txt` so that it has exactly these two lines and no markers:

```text
Colors we like
favorite: blue-green
```

3. Stage the file and commit to finish the merge.
