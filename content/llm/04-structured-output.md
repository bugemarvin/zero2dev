---
title: Structured output
summary: Get data your program can use, and never trust it before checking.
---

## Programs need data, not prose

A person can read "The invoice is from Acme, for 420 euros, due on the 3rd of March." A program needs:

```json
{"vendor": "Acme", "amount": 420.0, "currency": "EUR", "due": "2025-03-03"}
```

Turning messy text into clean data is one of the most valuable things LLMs do. It only works if the output is checked like any other untrusted input.

## Ask precisely

```text
Extract the invoice details from the text in <invoice> tags.

Reply with a single JSON object and nothing else, with exactly these fields:
- "vendor": string
- "amount": number, without a currency symbol
- "currency": a three-letter code such as "EUR"
- "due": the due date as YYYY-MM-DD, or null if none is given

<invoice>
...
</invoice>
```

Name every field, its type, its format and what to do when the value is missing. An example of the expected object helps further.

## The output is still text

Even with a good prompt, you will sometimes get:

```text
Here is the JSON you asked for:

    ```json
    {"vendor": "Acme", "amount": 420.0}
    ```

Let me know if you need anything else!
```

So the parsing code must be forgiving about the wrapping and strict about the content:

```python
import json
import re

def extract_json(text):
    fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if fenced:
        text = fenced.group(1)
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < start:
        raise ValueError("no JSON object found")
    return json.loads(text[start:end + 1])
```

## Validate everything

Valid JSON is not correct data. Check, with ordinary code:

- **presence**: are all required fields there?
- **types**: is `amount` a number, not the string `"420"`?
- **values**: is `currency` one of the codes you accept? Is the date a real date?
- **plausibility**: an invoice of 4 billion euros is probably a mistake.

In real projects a schema library does this. With Pydantic:

```python
from pydantic import BaseModel

class Invoice(BaseModel):
    vendor: str
    amount: float
    currency: str
    due: str | None

invoice = Invoice.model_validate(data)      # raises on anything wrong
```

## Retry with the error

When validation fails, send the problem back. Models are good at correcting a specific mistake:

```python
def ask_json(client, prompt, validate, attempts=3):
    messages = [{"role": "user", "content": prompt}]
    for _ in range(attempts):
        text = send(client, messages)
        try:
            data = extract_json(text)
            validate(data)
            return data
        except ValueError as error:
            messages.append({"role": "assistant", "content": text})
            messages.append({"role": "user", "content": f"That was not valid: {error}. Reply with corrected JSON only."})
    raise ValueError("no valid answer")
```

Limit the attempts. If three tries fail, the fourth will too, and something is wrong with the prompt or the input.

## Features that guarantee the shape

Providers offer ways to get JSON that always matches a schema: **structured outputs**, or defining a **tool** whose input schema is the shape you want ([next lesson](llm/05-tools-and-agents)). Use them when available. They guarantee the **shape**. They cannot guarantee that the **values** are true, so validation of content stays.

## Design the schema for the model

- Use clear field names: `due_date`, not `dd`.
- Prefer a fixed list of choices (`"status": "paid" | "open" | "overdue"`) to free text.
- Allow `null` for "not in the document". A model that must fill every field will invent values.
- For classification, ask for the **reason first** and the label after it, in separate fields. The label is then based on the reasoning.
- Keep it flat. Deeply nested structures cause more mistakes.

## Never execute model output

Output that becomes SQL, a shell command or code is a path for injection, exactly as with user input. Use parameters, allow-lists and review. "The model wrote it" is not a reason to trust it.

## Common mistakes

- **`json.loads(response)` with no handling** for wrapping text or a cut-off answer.
- **Trusting types**: `"42"` is not `42`.
- **Required fields with no way to say "unknown"**, which produces invented values.
- **Unlimited retries.**
- **Checking the shape and not the meaning.**
