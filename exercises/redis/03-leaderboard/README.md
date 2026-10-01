# A leaderboard

Build the sorted set `game:scores`.

1. Add five players with these scores: `ada` 1200, `sam` 800, `kim` 1500, `lee` 300, `zoe` 950.
2. `sam` wins a match: add 500 to sam's score with `ZINCRBY`.
3. `lee` leaves the game: remove lee.
4. Store the **top three** in a second key: copy them, highest first, into the **list** `game:top3` with `RPUSH`. Look at the board with `ZREVRANGE game:scores 0 2` to see who they are.

Write one command per line in `commands.redis`. Lines starting with `#` are comments. **Run commands** shows the reply to each line. Every run starts with an empty database.
