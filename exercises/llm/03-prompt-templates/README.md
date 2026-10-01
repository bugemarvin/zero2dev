# Prompt templates

Write three functions in `solution.py` that build prompts. No model is involved: this is plain text handling, and that is the point. A prompt is data your program assembles.

## `render(template, **values)`

Fills the holes of a template. A hole is a name in braces, such as `{email}`.

- Each hole is replaced by the value given for that name, converted with `str`.
- A hole with no value raises `KeyError`. The name of the missing variable is the error's argument.
- A value that the template does not use raises `ValueError`.
- Braces that are doubled are literal: `{{` becomes `{`.

`str.format` does most of this. The check for unused values is yours.

## `wrap(tag, text)`

Returns the text inside a pair of tags, each on its own line:

```text
<email>
Hello there
</email>
```

The text is stripped of leading and trailing whitespace first.

## `few_shot(instruction, examples, query)`

Builds a classification prompt. `examples` is a list of `(input, output)` pairs. For the instruction `Classify the sentiment.`, one example `("Great bike", "positive")` and the query `Too heavy`, the result is exactly:

```text
Classify the sentiment.

<example>
Input: Great bike
Output: positive
</example>

Input: Too heavy
Output:
```

There is one `<example>` block per example, in order, with an empty line between blocks. With no examples, the instruction is followed directly by an empty line and the query. The prompt ends with `Output:` and no newline after it.
