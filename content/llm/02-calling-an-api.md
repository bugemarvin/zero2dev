---
title: Calling a model
summary: Requests, roles, system prompts, limits and errors, with a real client and with any provider.
---

## Models are web services

You do not run a large model yourself. You send an HTTP request to a provider and get the answer back. Every provider has the same ingredients:

| Ingredient | Meaning |
| --- | --- |
| an **API key** | identifies and bills you. A secret. |
| a **model** name | which model to use. Bigger models are smarter, slower and dearer. |
| **messages** | the conversation so far |
| a **system prompt** | standing instructions: role, tone, rules |
| a **maximum number of output tokens** | where the answer is cut off |

## A request

With Anthropic's Python library (`pip install anthropic`):

```python
import anthropic

client = anthropic.Anthropic()          # reads the key from the environment variable ANTHROPIC_API_KEY

response = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=500,
    system="You are a concise assistant for a bicycle shop.",
    messages=[
        {"role": "user", "content": "Which tyre pressure for a road bike?"},
    ],
)

print(response.content[0].text)
```

Model names change as new ones are released. Look them up in the provider's documentation when you start a project.

Other providers differ in spelling, not in ideas. With OpenAI's library the system prompt is a message with the role `system` and the call is `client.chat.completions.create(...)`. What you learn here carries over.

## Roles

A conversation is a list of messages that alternate between two roles:

```python
messages = [
    {"role": "user", "content": "My name is Sam."},
    {"role": "assistant", "content": "Nice to meet you, Sam."},
    {"role": "user", "content": "What is my name?"},
]
```

- `user`: what the person, or your program, says.
- `assistant`: what the model said earlier.

To continue a conversation, append the model's answer and the next user message, and send **everything** again.

## The response

```python
response.content            # a list of blocks. A text answer has one block of type "text".
response.stop_reason        # why the model stopped
response.usage.input_tokens
response.usage.output_tokens
```

| `stop_reason` | Meaning |
| --- | --- |
| `end_turn` | the model finished its answer |
| `max_tokens` | it hit your limit: **the answer is cut off** |
| `stop_sequence` | it produced a text you told it to stop at |
| `tool_use` | it wants to call a tool ([lesson 5](llm/05-tools-and-agents)) |

Always check the stop reason. An answer cut at `max_tokens` can look complete and be missing its second half, or be JSON without its closing brace.

## Keys are secrets

```console
$ export ANTHROPIC_API_KEY="..."
```

- Never write a key in the source code and never commit it.
- Never put a key in a web page or a mobile app. Anything shipped to a user's device can be read. Calls to the model go through **your server**.
- Give each environment its own key, and set a spending limit.

## Things go wrong

A call over the network to a busy service fails sometimes. Plan for it:

| Problem | Typical status | What to do |
| --- | --- | --- |
| rate limit: too many requests | 429 | wait and retry |
| the service is overloaded or down | 500, 529 | wait and retry |
| a network timeout | | retry |
| a bad request: wrong parameter, too many tokens | 400 | do not retry: fix the request |
| a wrong key | 401 | do not retry |

Retry with **exponential backoff**: wait 1 second, then 2, then 4, and give up after a few attempts.

```python
import time

def call_with_retry(send, attempts=4):
    for attempt in range(attempts):
        try:
            return send()
        except anthropic.RateLimitError:
            if attempt == attempts - 1:
                raise
            time.sleep(2 ** attempt)
```

The official libraries retry a couple of times by themselves. You still need to decide what your application does when the model is unavailable: queue the work, show a message, fall back to something simpler.

## Streaming

A long answer takes many seconds. With **streaming**, the text arrives piece by piece as it is generated, and the user starts reading at once:

```python
with client.messages.stream(model="claude-sonnet-5-5", max_tokens=500, messages=messages) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

Use it for anything a person waits for.

## Cost and speed

- You pay for **input and output tokens**. A long system prompt is paid on every call.
- **Output is the slow part.** Ask for short answers when short is enough.
- Use the **smallest model that does the job well**. Classifying support tickets does not need the largest model.
- Providers offer **prompt caching**: a long, unchanging start of a prompt is processed once and reused at a discount.

## Common mistakes

- **A key in the code or in the browser.**
- **Not checking `stop_reason`.**
- **Retrying a 400**, which fails the same way for ever.
- **No timeout and no limit on retries.**
- **Forgetting to send the earlier messages** and wondering why the model lost the thread.
- **The largest model for every task.**
