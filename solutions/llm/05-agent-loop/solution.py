def run_agent(client, functions, question, max_steps=5):
    messages = [{"role": "user", "content": question}]
    for _ in range(max_steps):
        response = client.create(model="demo-model", max_tokens=500, messages=messages)
        messages.append({"role": "assistant", "content": response["content"]})
        if response["stop_reason"] != "tool_use":
            return "".join(block["text"] for block in response["content"] if block["type"] == "text")
        results = []
        for block in response["content"]:
            if block["type"] != "tool_use":
                continue
            result = {"type": "tool_result", "tool_use_id": block["id"]}
            function = functions.get(block["name"])
            if function is None:
                result.update(content=f"error: unknown tool {block['name']}", is_error=True)
            else:
                try:
                    result["content"] = str(function(**block["input"]))
                except Exception as error:
                    result.update(content=f"error: {error}", is_error=True)
            results.append(result)
        messages.append({"role": "user", "content": results})
    raise RuntimeError("too many steps")
