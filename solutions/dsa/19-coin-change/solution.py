import sys


def min_coins(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        best = INF
        for c in coins:
            if c <= a and dp[a - c] + 1 < best:
                best = dp[a - c] + 1
        dp[a] = best
    return dp[amount] if dp[amount] != INF else -1


def main():
    data = sys.stdin.read().split()
    n, amount = int(data[0]), int(data[1])
    coins = [int(x) for x in data[2:2 + n]]
    print(min_coins(coins, amount))


main()
