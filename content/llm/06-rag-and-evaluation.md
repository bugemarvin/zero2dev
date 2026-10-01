---
title: Retrieval and evaluation
summary: Answer from your own documents, and measure whether the system is any good.
---

## The problem

A model does not know your company's handbook, yesterday's tickets or your product catalogue. You could paste everything into the prompt, until it no longer fits, or costs too much, or the relevant paragraph is lost among a thousand others.

**Retrieval-augmented generation (RAG)** is the standard answer: **find** the few passages that matter for this question, and put only those in the prompt.

```text
question -> search your documents -> top passages -> prompt -> answer, with sources
```

## Embeddings

To find passages by **meaning**, not only by shared words, we use **embeddings**. An embedding model turns a text into a list of numbers, a **vector**, such that texts with similar meaning get vectors that point in similar directions.

```python
embed("How do I reset my password?")     # [0.021, -0.433, 0.118, ...]  hundreds of numbers
embed("I forgot my login")               # a vector close to the first
embed("Opening hours of the shop")       # a vector far away
```

Embedding models are separate from chat models: small, fast and cheap.

## Cosine similarity

The usual measure of closeness is the **cosine** of the angle between two vectors:

```python
import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    length_a = math.sqrt(sum(x * x for x in a))
    length_b = math.sqrt(sum(y * y for y in b))
    return dot / (length_a * length_b)
```

| Value | Meaning |
| --- | --- |
| 1 | the same direction: very similar |
| 0 | unrelated |
| -1 | opposite |

## Chunking

A whole manual is too big to embed as one piece, and too vague: its vector would be the average of everything. Split documents into **chunks** of a few hundred words.

- Split at natural borders where you can: headings, paragraphs.
- Let neighbouring chunks **overlap** a little, so that a sentence cut at a border is whole in one of them.
- Keep with each chunk where it came from: the document, the section, the page. You need it for citations.

Chunk size is a trade-off. Small chunks match precisely and lack context. Large chunks carry context and match loosely.

## The pipeline

**Once, and whenever documents change (indexing):**

1. Load the documents and split them into chunks.
2. Embed every chunk.
3. Store the vectors with their text and source.

**For each question:**

1. Embed the question.
2. Find the `k` chunks with the highest similarity.
3. Build a prompt with those chunks and the question.
4. Ask the model to answer **from the chunks only**, and to cite them.

```text
Answer the question using only the passages below.
Cite the passage number for each claim, like [2].
If the passages do not contain the answer, say that you do not know.

<passage id="1" source="handbook.md#returns">
...
</passage>
<passage id="2" source="faq.md#shipping">
...
</passage>

Question: Can I return a bike after 40 days?
```

For a few thousand chunks, a list in memory and a loop are enough. Larger collections use a **vector database**, or the vector extension of a database you already run, such as `pgvector` for PostgreSQL.

## When retrieval goes wrong

Most bad answers of a RAG system come from retrieval, not from the model: the right passage was not found, so the model had nothing to work with.

| Problem | Remedy |
| --- | --- |
| exact terms are missed: product codes, names | combine with keyword search (**hybrid search**) |
| the right chunk is ranked 8th of 10 | a **reranking** step on the top results |
| the question is vague or refers to earlier turns | rewrite it into a standalone question first |
| the answer needs several documents | retrieve more, or let an agent search several times |

Look at what was retrieved before blaming the prompt.

## Evaluation

"It looked good when I tried it" is not a measurement. LLM systems change behaviour with every edit to a prompt, a model version or a chunk size. Without tests you cannot tell an improvement from a regression.

Build an **evaluation set**: 30 to 100 real questions, each with what a good answer must contain. Then measure, automatically, on every change:

| Check | How |
| --- | --- |
| retrieval: is the right passage among the top `k`? | compare ids with the expected ones: **recall@k** |
| exact answers: labels, numbers, extracted fields | compare with the expected value |
| format: valid JSON, required fields | code |
| free-text quality | a second model acting as a **judge**, with a clear rubric. Spot-check its verdicts by hand. |
| safety: refusals, leaks, injections | a set of adversarial inputs |

Start small. Ten test cases that you run on every change are worth more than a thousand you never run.

Also record, in production: the question, what was retrieved, the answer, the time, the cost, and whether the user was satisfied. Failures found there become new test cases.

## The rest of the picture

- **Cost and latency** are part of quality. Track both per request.
- **Privacy**: know what data you send to a provider, and what its terms allow.
- **Fallbacks**: decide what the product does when the model is down or unsure.
- **People**: for decisions that matter, keep a human in the loop.

## Common mistakes

- **No evaluation set**, and changes made on a feeling.
- **Chunks without their source**, so answers cannot be checked.
- **Blaming the model** for an answer whose passage was never retrieved.
- **Stuffing 50 chunks into the prompt** in the hope that one is right.
- **Letting the model answer from its own memory** when the passages do not cover the question.
