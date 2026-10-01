import copy

from solution import ask_json, extract_json, validate

FENCE = "`" * 3
SCHEMA = {"vendor": str, "amount": float, "due": (str, type(None))}


def raises(run):
    try:
        run()
    except ValueError as exc:
        return str(exc)
    except Exception as exc:
        raise AssertionError(f"expected ValueError, got {type(exc).__name__}: {exc}")
    raise AssertionError("expected ValueError, and nothing was raised")


class FakeClient:
    def __init__(self, *answers):
        self.answers = list(answers)
        self.calls = []

    def create(self, **arguments):
        self.calls.append(copy.deepcopy(arguments))
        text = self.answers.pop(0)
        return {"content": [{"type": "text", "text": text}], "stop_reason": "end_turn", "usage": {}}


def test_plain_json():
    """extract_json reads plain JSON"""
    assert extract_json('{"a": 1, "b": [1, 2]}') == {"a": 1, "b": [1, 2]}


def test_fenced_json():
    """extract_json reads JSON inside a code fence, with or without the word json"""
    assert extract_json(f'{FENCE}json\n{{"a": 1}}\n{FENCE}') == {"a": 1}
    assert extract_json(f'{FENCE}\n{{"a": 2}}\n{FENCE}') == {"a": 2}


def test_json_in_prose():
    """extract_json ignores sentences around the object, and handles nested braces"""
    text = 'Here is the result:\n\n{"vendor": "Acme", "meta": {"pages": 2}}\n\nLet me know if you need more!'
    assert extract_json(text) == {"vendor": "Acme", "meta": {"pages": 2}}


def test_no_json():
    """extract_json raises ValueError when there is no object or it is broken"""
    raises(lambda: extract_json("I could not find an invoice."))
    raises(lambda: extract_json('{"vendor": "Acme", "amount": }'))
    raises(lambda: extract_json('{"cut": "off'))


def test_validate_ok():
    """validate returns the data when it fits the schema"""
    data = {"vendor": "Acme", "amount": 420.5, "due": None}
    assert validate(data, SCHEMA) is data
    assert validate({"vendor": "Acme", "amount": 420, "due": "2025-03-03"}, SCHEMA)["amount"] == 420, "an int is fine for float"


def test_validate_missing():
    """a missing field is reported by name"""
    assert raises(lambda: validate({"vendor": "Acme", "due": None}, SCHEMA)) == "missing field: amount"


def test_validate_types():
    """wrong types are reported, and a bool is not a number"""
    assert raises(lambda: validate({"vendor": "Acme", "amount": "420", "due": None}, SCHEMA)) == "wrong type for amount"
    assert raises(lambda: validate({"vendor": "Acme", "amount": True, "due": None}, SCHEMA)) == "wrong type for amount"
    assert raises(lambda: validate({"vendor": 7, "amount": 1.0, "due": None}, SCHEMA)) == "wrong type for vendor"
    assert raises(lambda: validate({"vendor": "A", "amount": 1.0, "due": 20250303}, SCHEMA)) == "wrong type for due"
    assert validate({"ok": True}, {"ok": bool}) == {"ok": True}, "a bool is fine where the schema says bool"


def test_validate_unexpected():
    """a field that is not in the schema is reported"""
    data = {"vendor": "Acme", "amount": 1.0, "due": None, "zeta": 1, "extra": 2}
    assert raises(lambda: validate(data, SCHEMA)) == "unexpected field: extra"


def test_ask_json_first_try():
    """ask_json returns valid data from the first answer"""
    client = FakeClient('{"vendor": "Acme", "amount": 420.0, "due": null}')
    assert ask_json(client, "Extract it.", SCHEMA) == {"vendor": "Acme", "amount": 420.0, "due": None}
    assert client.calls == [{"model": "demo-model", "max_tokens": 500,
                             "messages": [{"role": "user", "content": "Extract it."}]}], client.calls


def test_ask_json_retries_with_the_error():
    """a bad answer is sent back with the reason, and the corrected one is returned"""
    bad = '{"vendor": "Acme", "amount": "420 euros", "due": null}'
    good = f'Sorry! {FENCE}json\n{{"vendor": "Acme", "amount": 420, "due": null}}\n{FENCE}'
    client = FakeClient(bad, good)
    assert ask_json(client, "Extract it.", SCHEMA) == {"vendor": "Acme", "amount": 420, "due": None}
    assert len(client.calls) == 2
    assert client.calls[1]["messages"] == [
        {"role": "user", "content": "Extract it."},
        {"role": "assistant", "content": bad},
        {"role": "user", "content": "That was not valid: wrong type for amount. Reply with corrected JSON only."},
    ], client.calls[1]["messages"]


def test_ask_json_gives_up():
    """after the given number of attempts it raises ValueError"""
    client = FakeClient("no", "still no", "nope", '{"vendor": "late", "amount": 1, "due": null}')
    assert raises(lambda: ask_json(client, "Extract it.", SCHEMA, attempts=3)) == "no valid answer after 3 attempts"
    assert len(client.calls) == 3, f"{len(client.calls)} calls were made, expected 3"
    assert len(client.calls[2]["messages"]) == 5
