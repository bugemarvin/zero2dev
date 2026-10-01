def word_count(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts


def most_common(text):
    counts = word_count(text)
    if not counts:
        return None
    return min(counts, key=lambda word: (-counts[word], word))
