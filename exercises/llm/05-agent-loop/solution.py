def run_agent(client, functions, question, max_steps=5):
    messages = [{"role": "user", "content": question}]
    response = client.create(model="demo-model", max_tokens=500, messages=messages)
    return ""
