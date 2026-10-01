# Extract and validate JSON

Write three functions in `solution.py`.

## `extract_json(text)`

Finds the JSON object in a model's answer and returns it as a dictionary.

- The answer may be plain JSON, JSON inside a code fence (three backticks, with or without `json` after them), or JSON with sentences before and after.
- Take the text from the first `{` to the last `}` and parse it.
- When there is no object, or it does not parse, raise `ValueError`.

## `validate(data, schema)`

`schema` maps field names to types, for example `{"vendor": str, "amount": float, "due": (str, type(None))}`. A tuple means "any of these".

- Every field of the schema must be present, otherwise raise `ValueError("missing field: NAME")`.
- Each value must have the right type, otherwise raise `ValueError("wrong type for NAME")`.
- Where the schema says `float`, an `int` is accepted too. A `bool` is **never** accepted as a number.
- Fields that are not in the schema raise `ValueError("unexpected field: NAME")`.
- Check the fields in the order of the schema, then the unexpected ones in alphabetical order. Returns `data` when everything is right.

## `ask_json(client, prompt, schema, attempts=3)`

- Sends `messages` to `client.create(model="demo-model", max_tokens=500, messages=messages)`, starting with one user message holding the prompt.
- The answer text is `response["content"][0]["text"]`.
- If `extract_json` and `validate` both succeed, return the data.
- Otherwise append two messages and try again: the model's answer as an `assistant` message, and a `user` message with the content `That was not valid: ERROR. Reply with corrected JSON only.`, where `ERROR` is the text of the `ValueError`.
- After `attempts` failed tries, raise `ValueError("no valid answer after N attempts")`.

The tests use a **fake client**, so nothing here needs an API key, an account or the internet. The fake has the same shape as a real one: you call `client.create(...)` and get a response dictionary back.
