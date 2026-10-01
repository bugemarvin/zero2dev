---
title: Tools and agents
summary: Let a model call your functions, and run the loop that turns a chatbot into something that gets work done.
---

## Why tools

A model alone can only produce text. It cannot look up an order, do exact arithmetic, read today's news or send an email. **Tools** close the gap: you describe functions to the model, and it can ask you to call them.

The model never runs anything. It **requests** a call, your code runs it, and you send the result back. You stay in control of what really happens.

## Describing a tool

A tool has a name, a description and a schema for its input:

```python
tools = [
    {
        "name": "get_order",
        "description": "Look up an order by its number. Returns the status and the items. "
                       "Use this whenever the customer mentions an order number.",
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string", "description": "The order number, such as A-1042"},
            },
            "required": ["order_id"],
        },
    }
]
```

The **description is a prompt**. It is how the model decides when to use the tool and what to pass. Say what the tool does, when to use it, and what it returns.

## The exchange

```python
response = client.messages.create(model="claude-sonnet-5-5", max_tokens=500, tools=tools, messages=messages)
```

When the model wants a tool, the response has `stop_reason` `"tool_use"` and a block like this:

```json
{"type": "tool_use", "id": "toolu_01", "name": "get_order", "input": {"order_id": "A-1042"}}
```

You run your function, then continue the conversation with two more messages: the model's turn, and a `user` message carrying the result:

```python
messages.append({"role": "assistant", "content": response.content})
messages.append({
    "role": "user",
    "content": [
        {"type": "tool_result", "tool_use_id": "toolu_01", "content": '{"status": "shipped"}'},
    ],
})
```

The `tool_use_id` connects the result to the request. The model then answers in words, or asks for another tool.

## The agent loop

Repeat that exchange until the model stops asking for tools, and you have an **agent**:

```python
def run_agent(client, tools, functions, question, max_steps=10):
    messages = [{"role": "user", "content": question}]
    for _ in range(max_steps):
        response = client.messages.create(model=MODEL, max_tokens=1000, tools=tools, messages=messages)
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason != "tool_use":
            return response

        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = functions[block.name](**block.input)
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(output)})
        messages.append({"role": "user", "content": results})
    raise RuntimeError("too many steps")
```

That is the whole idea behind coding assistants, research agents and support bots: a model, some tools, and a loop. A response can contain several tool requests. Answer all of them in one message.

## Errors are results

When a tool fails, do not crash the loop. Tell the model:

```python
{"type": "tool_result", "tool_use_id": block.id, "content": "error: order not found", "is_error": True}
```

It will often try something else: correct a typo in the id, ask the user, or explain what went wrong.

## Limits

An agent can loop for ever, or burn money going in circles. Always set:

- a **maximum number of steps**;
- a **budget** in tokens or money;
- a **timeout** per tool call.

## Safety

A tool is real power. The model decides when to use it, and its decision can be steered by any text it reads, including a web page or an email written by an attacker ([prompt injection](llm/03-prompting)).

| Rule | Why |
| --- | --- |
| **least privilege** | give read-only tools unless writing is needed |
| **validate tool input** | treat it like input from an anonymous user |
| **ask a human** before irreversible actions | paying, deleting, sending |
| **scope the access** | the tool for customer 42 can read only customer 42's orders. Enforce it in the tool, not in the prompt. |
| **log every call** | you will need to explain what happened |

Never rely on the prompt to keep the model from doing harm. Rely on what the tools **can** do.

## Designing good tools

- **Few and distinct.** Ten overlapping tools confuse the model.
- **Named by intent**: `search_orders`, not `query_db`.
- **Return what matters**, briefly. The result goes into the context window.
- **Helpful errors**: "no order with that id. Order ids look like A-1042" lets the model fix its call.

## Workflow or agent?

If you know the steps in advance, write them as ordinary code with model calls where needed. That is a **workflow**: predictable, cheap, easy to test. Use an **agent** when the steps depend on what is found along the way. Start with the simplest thing that works.

## Common mistakes

- **No step limit.**
- **A vague tool description.**
- **Powerful tools with no confirmation.**
- **Raising an exception** when a tool fails, in place of returning the error to the model.
- **Huge tool results** that fill the context.
- **Trusting the model to respect a rule** that the tool itself should enforce.
