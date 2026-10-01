import copy

from solution import run_agent


def text(value):
    return {"content": [{"type": "text", "text": value}], "stop_reason": "end_turn"}


def use(*calls, say=None):
    blocks = [{"type": "text", "text": say}] if say else []
    blocks += [{"type": "tool_use", "id": call_id, "name": name, "input": args} for call_id, name, args in calls]
    return {"content": blocks, "stop_reason": "tool_use"}


class FakeClient:
    def __init__(self, *script):
        self.script = list(script)
        self.calls = []

    def create(self, **arguments):
        self.calls.append(copy.deepcopy(arguments))
        return self.script.pop(0) if len(self.script) > 1 else self.script[0]


def add(a, b):
    return a + b


def get_order(order_id):
    if order_id != "A-1":
        raise KeyError(f"no order {order_id}")
    return {"status": "shipped"}


TOOLS = {"add": add, "get_order": get_order}


def test_no_tools():
    """a plain answer is returned after one call"""
    client = FakeClient(text("Hello!"))
    assert run_agent(client, TOOLS, "Hi") == "Hello!"
    assert client.calls == [{"model": "demo-model", "max_tokens": 500,
                             "messages": [{"role": "user", "content": "Hi"}]}], client.calls


def test_one_tool():
    """the tool is called, its result is sent back, and the final text is returned"""
    client = FakeClient(use(("t1", "add", {"a": 2, "b": 3})), text("2 + 3 is 5."))
    assert run_agent(client, TOOLS, "What is 2 + 3?") == "2 + 3 is 5."
    assert len(client.calls) == 2
    assert client.calls[1]["messages"] == [
        {"role": "user", "content": "What is 2 + 3?"},
        {"role": "assistant", "content": [{"type": "tool_use", "id": "t1", "name": "add", "input": {"a": 2, "b": 3}}]},
        {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "t1", "content": "5"}]},
    ], client.calls[1]["messages"]


def test_several_tools_in_one_turn():
    """every tool request of a turn is answered, in order, in one message"""
    client = FakeClient(use(("t1", "add", {"a": 1, "b": 1}), ("t2", "get_order", {"order_id": "A-1"}), say="Let me check."),
                        text("Done."))
    assert run_agent(client, TOOLS, "Go") == "Done."
    results = client.calls[1]["messages"][2]
    assert results == {"role": "user", "content": [
        {"type": "tool_result", "tool_use_id": "t1", "content": "2"},
        {"type": "tool_result", "tool_use_id": "t2", "content": "{'status': 'shipped'}"},
    ]}, results


def test_several_steps():
    """the loop continues over several turns"""
    client = FakeClient(use(("t1", "add", {"a": 1, "b": 2})), use(("t2", "add", {"a": 3, "b": 4})), text("3 and 7."))
    assert run_agent(client, TOOLS, "Add twice") == "3 and 7."
    assert len(client.calls) == 3
    assert len(client.calls[2]["messages"]) == 5


def test_tool_error():
    """a tool that raises produces an error result, and the loop goes on"""
    client = FakeClient(use(("t1", "get_order", {"order_id": "Z-9"})), text("I could not find that order."))
    assert run_agent(client, TOOLS, "Where is Z-9?") == "I could not find that order."
    result = client.calls[1]["messages"][2]["content"][0]
    assert result == {"type": "tool_result", "tool_use_id": "t1", "content": "error: 'no order Z-9'", "is_error": True}, result


def test_unknown_tool():
    """a tool that does not exist produces an error result"""
    client = FakeClient(use(("t1", "delete_everything", {})), text("I cannot do that."))
    assert run_agent(client, TOOLS, "Clean up") == "I cannot do that."
    result = client.calls[1]["messages"][2]["content"][0]
    assert result == {"type": "tool_result", "tool_use_id": "t1", "content": "error: unknown tool delete_everything",
                      "is_error": True}, result


def test_step_limit():
    """a model that never stops asking for tools is cut off"""
    client = FakeClient(use(("t1", "add", {"a": 1, "b": 1})))
    try:
        run_agent(client, TOOLS, "Loop", max_steps=3)
    except RuntimeError as exc:
        assert str(exc) == "too many steps", str(exc)
    else:
        raise AssertionError("expected RuntimeError('too many steps')")
    assert len(client.calls) == 3, f"{len(client.calls)} calls to the model, expected 3"
