# Retrieval from scratch

Build the core of a RAG system in `solution.py`. Real systems get their vectors from an embedding model. Here the tests supply small vectors, so that you can check every number by hand.

## `cosine(a, b)`

The cosine similarity of two vectors of equal length. If either vector has length 0, return `0.0`.

## `chunk(words, size, overlap)`

Splits a list of words into chunks of at most `size` words. Each chunk starts `size - overlap` words after the previous one. The last chunk may be shorter. Stop as soon as a chunk reaches the end of the list. An empty list gives no chunks.

`chunk(["a", "b", "c", "d", "e"], 3, 1)` is `[["a", "b", "c"], ["c", "d", "e"]]`.

## `top_k(query, documents, k)`

`documents` is a list of dictionaries with the keys `id`, `text` and `vector`. Returns the `k` documents most similar to the `query` vector, most similar first. Documents with equal similarity keep their original order.

## `build_prompt(question, passages)`

`passages` is a list of documents as above. Returns exactly this layout, with one `<passage>` block per document:

```text
Answer using only the passages below. Cite passage ids like [id]. If the answer is not in them, say you do not know.

<passage id="p1">
First text
</passage>

<passage id="p2">
Second text
</passage>

Question: What is it?
```

## `recall_at_k(retrieved_ids, relevant_ids, k)`

Evaluation: the fraction of the relevant ids that appear among the first `k` retrieved ids. With no relevant ids, return `1.0`.
