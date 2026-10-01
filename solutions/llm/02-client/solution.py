import time


class RateLimited(Exception):
    """The provider asked us to slow down. Trying again later can work."""


class BadRequest(Exception):
    """The request itself is wrong. Trying again cannot work."""


def ask(client, question, system=None, history=None, max_tokens=500):
    messages = list(history or []) + [{"role": "user", "content": question}]
    arguments = {"model": "demo-model", "max_tokens": max_tokens, "messages": messages}
    if system is not None:
        arguments["system"] = system
    response = client.create(**arguments)
    if response["stop_reason"] == "max_tokens":
        raise ValueError("the answer was cut off")
    return "".join(block["text"] for block in response["content"] if block["type"] == "text")


def ask_with_retry(client, question, attempts=3, sleep=time.sleep):
    for attempt in range(attempts):
        try:
            return ask(client, question)
        except RateLimited:
            if attempt == attempts - 1:
                raise
            sleep(2 ** attempt)
