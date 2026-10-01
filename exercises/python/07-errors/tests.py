from solution import parse_age


def test_range_message():
    """parse_age says 'age out of range' for 200"""
    try:
        parse_age("200")
    except ValueError as exc:
        assert "age out of range" in str(exc), f"the message was {str(exc)!r}"
        return
    assert False, "parse_age('200') should raise ValueError"
