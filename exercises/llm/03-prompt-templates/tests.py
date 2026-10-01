from solution import few_shot, render, wrap


def raises(error, run):
    try:
        run()
    except error as exc:
        return exc
    except Exception as exc:
        raise AssertionError(f"expected {error.__name__}, got {type(exc).__name__}: {exc}")
    raise AssertionError(f"expected {error.__name__}, and nothing was raised")


def test_render_fills():
    """render fills the holes"""
    assert render("Hello {name}, you are {age}.", name="Sam", age=30) == "Hello Sam, you are 30."
    assert render("No holes here.") == "No holes here."
    assert render("{x} and {x}", x="twice") == "twice and twice"


def test_render_missing():
    """a hole with no value raises KeyError naming the variable"""
    exc = raises(KeyError, lambda: render("Summarise {email} for {reader}.", email="..."))
    assert exc.args[0] == "reader", f"the error names {exc.args[0]!r}"


def test_render_unused():
    """a value the template does not use raises ValueError"""
    raises(ValueError, lambda: render("Hello {name}.", name="Sam", emial="typo"))


def test_render_literal_braces():
    """doubled braces are literal"""
    assert render('Reply as JSON: {{"answer": "{answer}"}}', answer="yes") == 'Reply as JSON: {"answer": "yes"}'


def test_wrap():
    """wrap puts stripped text between tags on their own lines"""
    assert wrap("email", "  Hello there\n\n") == "<email>\nHello there\n</email>"
    assert wrap("doc", "line 1\nline 2") == "<doc>\nline 1\nline 2\n</doc>"


def test_few_shot_one_example():
    """few_shot with one example matches the layout exactly"""
    want = ("Classify the sentiment.\n\n<example>\nInput: Great bike\nOutput: positive\n</example>\n\n"
            "Input: Too heavy\nOutput:")
    got = few_shot("Classify the sentiment.", [("Great bike", "positive")], "Too heavy")
    assert got == want, f"got:\n{got!r}"


def test_few_shot_several():
    """several examples appear in order, separated by an empty line"""
    got = few_shot("Label it.", [("a", "1"), ("b", "2"), ("c", "3")], "d")
    want = ("Label it.\n\n<example>\nInput: a\nOutput: 1\n</example>\n\n<example>\nInput: b\nOutput: 2\n</example>\n\n"
            "<example>\nInput: c\nOutput: 3\n</example>\n\nInput: d\nOutput:")
    assert got == want, f"got:\n{got!r}"


def test_few_shot_none():
    """with no examples the query follows the instruction"""
    assert few_shot("Label it.", [], "d") == "Label it.\n\nInput: d\nOutput:"
