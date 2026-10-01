# Fit a conversation into the context window

A chat application sends the whole conversation with every request. When it grows past the model's limit, old messages must go. Write three functions in `solution.py`.

A message is a dictionary such as `{"role": "user", "content": "Hello"}`. The roles are `system`, `user` and `assistant`.

## `estimate_tokens(text)`

Returns a rough token count: the number of characters divided by 4, rounded **up**. An empty text is 0 tokens.

## `count_tokens(messages)`

Returns the total for a list of messages: the estimate for each `content`, plus **4** tokens of overhead per message.

## `trim_history(messages, limit)`

Returns a new list that fits in `limit` tokens (by `count_tokens`), built like this:

- Every `system` message is always kept.
- Of the other messages, keep as many of the **most recent** ones as fit. Stop at the first one that does not fit: do not skip it and keep older ones.
- The result is in the original order.
- The input list is not changed.

If even the system messages do not fit, return only the system messages.

The tests use a **fake client**, so nothing here needs an API key, an account or the internet. The fake has the same shape as a real one: you call `client.create(...)` and get a response dictionary back.
