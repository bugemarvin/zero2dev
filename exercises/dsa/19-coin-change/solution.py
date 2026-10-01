import sys


def min_coins(coins, amount):
    # Return the fewest coins that add up to amount, or -1.
    pass


def main():
    data = sys.stdin.read().split()
    n, amount = int(data[0]), int(data[1])
    coins = [int(x) for x in data[2:2 + n]]
    print(min_coins(coins, amount))


main()
