import math


def estimate_tokens(text):
    return math.ceil(len(text) / 4)


def count_tokens(messages):
    return sum(estimate_tokens(m["content"]) + 4 for m in messages)


def trim_history(messages, limit):
    system = [m for m in messages if m["role"] == "system"]
    budget = limit - count_tokens(system)
    kept = set()
    for index in range(len(messages) - 1, -1, -1):
        message = messages[index]
        if message["role"] == "system":
            continue
        cost = count_tokens([message])
        if cost > budget:
            break
        budget -= cost
        kept.add(index)
    return [m for i, m in enumerate(messages) if m["role"] == "system" or i in kept]
