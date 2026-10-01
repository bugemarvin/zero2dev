# A card that survives odd input

Write `card.sh`. It takes a name and, optionally, a city:

```console
$ bash card.sh "Grace Hopper" "New York"
Name: Grace Hopper
City: New York
Length: 12
```

- `Length` is the number of characters in the name.
- If no city is given, print `City: unknown`.
- With no arguments at all, print a usage message to standard error and exit with code 2.

The tests pass names with spaces and a name that is just `*`. Quote your variables and they will come through unchanged.
