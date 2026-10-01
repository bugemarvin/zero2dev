# A client wrapper with retries

Write two functions in `solution.py`. They receive a `client` whose `create` method takes keyword arguments and returns a dictionary:

```python
{
    "content": [{"type": "text", "text": "The answer."}],
    "stop_reason": "end_turn",
    "usage": {"input_tokens": 12, "output_tokens": 5},
}
```

## `ask(client, question, system=None, history=None, max_tokens=500)`

- Calls `client.create(model="demo-model", max_tokens=..., messages=...)`.
- `messages` is the `history` (a list of earlier messages, or nothing) followed by `{"role": "user", "content": question}`. The `history` list itself is not changed.
- The keyword `system` is passed **only** when a system prompt was given.
- Returns the text of the answer: the `text` of every block of type `text`, joined together.
- When the response's `stop_reason` is `max_tokens`, raise `ValueError("the answer was cut off")`.

## `ask_with_retry(client, question, attempts=3, sleep=time.sleep)`

Calls `ask(client, question)`. The fake client may raise `RateLimited` or `BadRequest`, both defined in the starter.

- On `RateLimited`, wait and try again: `sleep(1)` after the first failure, `sleep(2)` after the second, `sleep(4)` after the third, and so on.
- After `attempts` failed tries, let the last `RateLimited` exception out. Do not sleep after the final failure.
- A `BadRequest` is never retried: it goes straight out.

`sleep` is a parameter so that the tests do not really wait.

The tests use a **fake client**, so nothing here needs an API key, an account or the internet. The fake has the same shape as a real one: you call `client.create(...)` and get a response dictionary back.
