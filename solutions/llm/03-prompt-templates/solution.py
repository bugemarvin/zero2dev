import string


def render(template, **values):
    used = {name for _, name, _, _ in string.Formatter().parse(template) if name}
    unused = sorted(set(values) - used)
    if unused:
        raise ValueError(f"unused values: {', '.join(unused)}")
    return template.format(**values)


def wrap(tag, text):
    return f"<{tag}>\n{text.strip()}\n</{tag}>"


def few_shot(instruction, examples, query):
    parts = [instruction]
    for given, expected in examples:
        parts.append(wrap("example", f"Input: {given}\nOutput: {expected}"))
    parts.append(f"Input: {query}\nOutput:")
    return "\n\n".join(parts)
