# Fewest coins

**Input:** the first line holds `n` and `amount`. The second line holds `n` different coin values. You may use each coin value as many times as you like.

**Output:** the smallest number of coins that add up to exactly `amount`, or `-1` if it cannot be done. An amount of 0 needs 0 coins.

```text
input      output
3 6        2
1 3 4
```

Two coins: 3 + 3. Always taking the largest coin first would give 4 + 1 + 1, which is three.

The amount can be 100,000, so trying every combination is hopeless. Build a table of the answer for every amount from 0 upwards.
