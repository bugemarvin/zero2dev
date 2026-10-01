import json


def extract_json(text):
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < start:
        raise ValueError("no JSON object found")
    try:
        data = json.loads(text[start:end + 1])
    except json.JSONDecodeError as error:
        raise ValueError(f"invalid JSON: {error.msg}")
    if not isinstance(data, dict):
        raise ValueError("no JSON object found")
    return data


def validate(data, schema):
    for name, expected in schema.items():
        if name not in data:
            raise ValueError(f"missing field: {name}")
        types = expected if isinstance(expected, tuple) else (expected,)
        if float in types:
            types = types + (int,)
        value = data[name]
        if isinstance(value, bool) and bool not in types:
            raise ValueError(f"wrong type for {name}")
        if not isinstance(value, types):
            raise ValueError(f"wrong type for {name}")
    for name in sorted(data):
        if name not in schema:
            raise ValueError(f"unexpected field: {name}")
    return data


def ask_json(client, prompt, schema, attempts=3):
    messages = [{"role": "user", "content": prompt}]
    for _ in range(attempts):
        response = client.create(model="demo-model", max_tokens=500, messages=messages)
        text = response["content"][0]["text"]
        try:
            return validate(extract_json(text), schema)
        except ValueError as error:
            messages = messages + [
                {"role": "assistant", "content": text},
                {"role": "user", "content": f"That was not valid: {error}. Reply with corrected JSON only."},
            ]
    raise ValueError(f"no valid answer after {attempts} attempts")
