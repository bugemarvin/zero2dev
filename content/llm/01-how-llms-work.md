---
title: How language models work
summary: Tokens, context windows and sampling: enough of the inside to use a model well.
---

This track is about **using** large language models (LLMs) as a component of software. You need [Python](python/01-basics). You do not need any mathematics.

## What a model does

An LLM is a program that, given some text, predicts what comes next. It produces one small piece, adds it to the text, and predicts again. A whole essay comes out of that one loop.

It learned to predict by reading an enormous amount of text. Nothing in it is a database of facts or a list of rules. It is a very large function with numbers (the **weights**) that were adjusted until its predictions were good.

Three consequences follow, and they explain most of what you will see:

- It is **fluent before it is correct**. A plausible wrong answer and a right answer look the same from the inside. When it invents a fact, a quote or a function that does not exist, that is called a **hallucination**.
- It knows nothing after its **training cutoff**, and nothing about your private data, unless you put that in the text you send.
- It has **no memory between calls**. Each request starts from zero. A chat "remembers" because the application sends the whole conversation again every time.

## Tokens

Models read and write **tokens**, not characters or words. A token is a common piece of text: a short word, part of a longer word, a punctuation mark.

```text
"Unbelievable results!"  ->  ["Un", "believ", "able", " results", "!"]
```

Rules of thumb for English: one token is about **four characters**, and 100 tokens are about 75 words. Code and other languages use more tokens per word.

Tokens matter because they are the unit of everything:

- **limits**: a model accepts only so many tokens;
- **cost**: you pay per token, usually more for output than for input;
- **speed**: output is generated token by token, so long answers are slow.

## The context window

The **context window** is the maximum number of tokens a model can consider at once: your instructions, the conversation so far, any documents you included, and the answer it is writing.

Whatever is not in the window does not exist for the model. Whatever is in it costs money and attention on every call. Deciding what goes into the window is the central skill of building with LLMs. It is called **context engineering**.

A long conversation eventually exceeds the window. The application must then drop or summarise old messages. The usual policy keeps the instructions and the most recent turns.

## Sampling and temperature

For each next token the model produces a probability for every possible token. Then one is **sampled**.

- **Temperature 0** always takes the most likely token. The output is nearly the same on every run: use it for extraction, classification and code.
- A **higher temperature** takes less likely tokens more often. The output varies more: use it for brainstorming and creative writing.

Even at temperature 0, do not rely on identical output from run to run. Write your code so that it does not matter.

## What models are good and bad at

| Good at | Poor at |
| --- | --- |
| summarising, rewriting, translating | exact arithmetic on large numbers |
| extracting structured data from messy text | recalling precise facts, quotes, links |
| classifying and routing | anything after the training cutoff |
| writing and explaining code | knowing what they do not know |
| answering questions about text you provide | counting characters or words exactly |

The fix for most weaknesses is the same: **do not ask the model to remember, give it the material**. Put the document in the prompt. Let it call a calculator or a search function ([lesson 5](llm/05-tools-and-agents)). Check its output with ordinary code.

## The mental model to keep

Treat an LLM as a very well-read, very fast assistant who has never seen your project, forgets everything between conversations, and never says "I am not sure" unless you make room for it. Everything in this track follows from that.

## Common mistakes

- **Trusting an answer because it sounds confident.**
- **Asking for facts it cannot have**: today's prices, your database, last week's news.
- **Sending the whole history for ever**, until the context limit is hit in production.
- **Using a high temperature** for a task that needs the same answer each time.
- **Counting in characters or words** when the limits are in tokens.
