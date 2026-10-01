# The agent loop

Write `run_agent(client, functions, question, max_steps=5)` in `solution.py`.

- `functions` maps tool names to Python functions, for example `{"add": add, "get_order": get_order}`.
- Start with one message: `{"role": "user", "content": question}`.
- Call `client.create(model="demo-model", max_tokens=500, messages=messages)`. The response is a dictionary with `content` (a list of blocks) and `stop_reason`.
- Append the model's turn: `{"role": "assistant", "content": response["content"]}`.
- If `stop_reason` is not `"tool_use"`, you are done: return the text of the answer, which is the `text` of all blocks of type `text` joined together.
- Otherwise run **every** block of type `tool_use`. Such a block looks like `{"type": "tool_use", "id": "t1", "name": "add", "input": {"a": 2, "b": 3}}`. Call the function with the input as keyword arguments.
- Append **one** user message whose content is the list of results, in the same order. A result is `{"type": "tool_result", "tool_use_id": ID, "content": TEXT}`, where `TEXT` is `str` of what the function returned.
- A tool that raises an exception must not stop the loop. Its result has the content `error: ` followed by the exception's text, and the extra field `"is_error": True`.
- A tool name that is not in `functions` gives the result `error: unknown tool NAME`, also with `"is_error": True`.
- If the model still wants tools after `max_steps` calls to the model, raise `RuntimeError("too many steps")`.

The tests use a **fake client**, so nothing here needs an API key, an account or the internet. The fake has the same shape as a real one: you call `client.create(...)` and get a response dictionary back.
