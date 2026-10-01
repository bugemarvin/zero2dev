from solution import BadRequest, RateLimited, ask, ask_with_retry


def reply(text, stop="end_turn"):
    return {"content": [{"type": "text", "text": text}], "stop_reason": stop,
            "usage": {"input_tokens": 10, "output_tokens": 5}}


class FakeClient:
    """Returns the scripted items in order. An exception in the script is raised."""

    def __init__(self, *script):
        self.script = list(script)
        self.calls = []

    def create(self, **arguments):
        self.calls.append(arguments)
        item = self.script.pop(0)
        if isinstance(item, Exception):
            raise item
        return item


def raises(error, run):
    try:
        run()
    except error as exc:
        return exc
    except Exception as exc:
        raise AssertionError(f"expected {error.__name__}, got {type(exc).__name__}: {exc}")
    raise AssertionError(f"expected {error.__name__}, and nothing was raised")


def test_basic_request():
    """ask sends the model, the limit and one user message, and returns the text"""
    client = FakeClient(reply("About 6 bar."))
    assert ask(client, "Which tyre pressure?") == "About 6 bar."
    assert client.calls == [{"model": "demo-model", "max_tokens": 500,
                             "messages": [{"role": "user", "content": "Which tyre pressure?"}]}], client.calls


def test_system_and_limit():
    """a system prompt and max_tokens are passed on"""
    client = FakeClient(reply("ok"))
    ask(client, "Hi", system="Be brief.", max_tokens=50)
    assert client.calls[0].get("system") == "Be brief."
    assert client.calls[0]["max_tokens"] == 50


def test_no_system_key_without_system():
    """without a system prompt, no system argument is sent at all"""
    client = FakeClient(reply("ok"))
    ask(client, "Hi")
    assert "system" not in client.calls[0], "system=None must not be sent"


def test_history():
    """earlier messages come first, and the history list is not changed"""
    history = [{"role": "user", "content": "My name is Sam."}, {"role": "assistant", "content": "Hello Sam."}]
    client = FakeClient(reply("Sam."))
    ask(client, "What is my name?", history=history)
    assert client.calls[0]["messages"] == history + [{"role": "user", "content": "What is my name?"}]
    assert len(history) == 2, "ask must not add to the history list it was given"


def test_joins_text_blocks():
    """the text of several blocks is joined, and other block types are ignored"""
    response = {"content": [{"type": "text", "text": "Hello, "}, {"type": "tool_use", "name": "x"},
                            {"type": "text", "text": "world"}], "stop_reason": "end_turn", "usage": {}}
    assert ask(FakeClient(response), "Hi") == "Hello, world"


def test_cut_off():
    """a cut-off answer raises ValueError"""
    exc = raises(ValueError, lambda: ask(FakeClient(reply("Half an ans", stop="max_tokens")), "Hi"))
    assert str(exc) == "the answer was cut off", str(exc)


def test_retry_succeeds():
    """rate limits are retried with waits of 1 and 2 seconds"""
    client = FakeClient(RateLimited(), RateLimited(), reply("finally"))
    waits = []
    assert ask_with_retry(client, "Hi", sleep=waits.append) == "finally"
    assert waits == [1, 2], f"waits: {waits}"
    assert len(client.calls) == 3


def test_no_wait_when_fine():
    """no waiting when the first call works"""
    waits = []
    assert ask_with_retry(FakeClient(reply("hi")), "Hi", sleep=waits.append) == "hi"
    assert waits == []


def test_retry_gives_up():
    """after `attempts` tries the error goes out, with no sleep after the last one"""
    client = FakeClient(RateLimited(), RateLimited(), RateLimited(), RateLimited(), reply("too late"))
    waits = []
    raises(RateLimited, lambda: ask_with_retry(client, "Hi", attempts=4, sleep=waits.append))
    assert waits == [1, 2, 4], f"waits: {waits}"
    assert len(client.calls) == 4, f"{len(client.calls)} calls were made, expected 4"


def test_bad_request_not_retried():
    """a bad request is not retried"""
    client = FakeClient(BadRequest("too many tokens"), reply("never"))
    waits = []
    raises(BadRequest, lambda: ask_with_retry(client, "Hi", sleep=waits.append))
    assert waits == [] and len(client.calls) == 1
