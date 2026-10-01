import json


def extract_json(text):
    return json.loads(text)


def validate(data, schema):
    return data


def ask_json(client, prompt, schema, attempts=3):
    messages = [{"role": "user", "content": prompt}]
    response = client.create(model="demo-model", max_tokens=500, messages=messages)
    return extract_json(response["content"][0]["text"])
