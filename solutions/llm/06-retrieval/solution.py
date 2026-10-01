import math

HEADER = ("Answer using only the passages below. Cite passage ids like [id]. "
          "If the answer is not in them, say you do not know.")


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    length_a = math.sqrt(sum(x * x for x in a))
    length_b = math.sqrt(sum(y * y for y in b))
    if length_a == 0 or length_b == 0:
        return 0.0
    return dot / (length_a * length_b)


def chunk(words, size, overlap):
    chunks = []
    step = size - overlap
    start = 0
    while start < len(words):
        chunks.append(words[start:start + size])
        if start + size >= len(words):
            break
        start += step
    return chunks


def top_k(query, documents, k):
    ranked = sorted(documents, key=lambda doc: cosine(query, doc["vector"]), reverse=True)
    return ranked[:k]


def build_prompt(question, passages):
    parts = [HEADER]
    for passage in passages:
        parts.append(f'<passage id="{passage["id"]}">\n{passage["text"]}\n</passage>')
    parts.append(f"Question: {question}")
    return "\n\n".join(parts)


def recall_at_k(retrieved_ids, relevant_ids, k):
    if not relevant_ids:
        return 1.0
    found = set(retrieved_ids[:k]) & set(relevant_ids)
    return len(found) / len(set(relevant_ids))
