# Semantic versions

Write four functions in `solution.py`.

## `parse(version)`

Turns `"2.4.1"` into the tuple `(2, 4, 1)`. A leading `v` is allowed: `"v2.4.1"`. Anything that is not three whole numbers separated by dots raises `ValueError`.

## `bump(version, part)`

Returns the next version as a string without a `v`. `part` is `"major"`, `"minor"` or `"patch"`. The parts to the right of the one that increases become 0. Another `part` raises `ValueError`.

## `next_version(version, commits)`

`commits` is a list of commit messages in the Conventional Commits format. Returns the version the next release should have:

- any breaking change gives a **major** bump: a `!` right before the colon, as in `feat!: ...` or `fix(api)!: ...`, or the text `BREAKING CHANGE` anywhere in the message;
- otherwise any `feat` gives a **minor** bump;
- otherwise any `fix` gives a **patch** bump;
- otherwise the version is unchanged.

A type may have a scope in brackets: `feat(cart): ...`. Only the **first line** of a message decides its type.

## `newest(versions)`

Returns the highest version of a list, as it was written. Compare as numbers: `"1.10.0"` is newer than `"1.9.0"`. An empty list raises `ValueError`.
