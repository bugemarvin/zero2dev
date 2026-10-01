import solution


def good(price, percent):
    if price < 0:
        raise ValueError("price cannot be negative")
    if percent < 0 or percent > 100:
        raise ValueError("percent must be between 0 and 100")
    return round(price * (100 - percent) / 100, 2)


def bug_no_rounding(price, percent):
    if price < 0:
        raise ValueError("price cannot be negative")
    if percent < 0 or percent > 100:
        raise ValueError("percent must be between 0 and 100")
    return price * (100 - percent) / 100


def bug_rejects_100(price, percent):
    if price < 0:
        raise ValueError("price cannot be negative")
    if percent < 0 or percent >= 100:
        raise ValueError("percent must be between 0 and 100")
    return round(price * (100 - percent) / 100, 2)


def bug_allows_over_100(price, percent):
    if price < 0:
        raise ValueError("price cannot be negative")
    if percent < 0:
        raise ValueError("percent must be between 0 and 100")
    return round(price * (100 - percent) / 100, 2)


def bug_allows_negative_price(price, percent):
    if percent < 0 or percent > 100:
        raise ValueError("percent must be between 0 and 100")
    return round(price * (100 - percent) / 100, 2)


def bug_allows_negative_percent(price, percent):
    if price < 0:
        raise ValueError("price cannot be negative")
    if percent > 100:
        raise ValueError("percent must be between 0 and 100")
    return round(price * (100 - percent) / 100, 2)


BROKEN = [
    ("the result is not rounded to 2 decimals", bug_no_rounding),
    ("100 percent is wrongly rejected", bug_rejects_100),
    ("a percentage above 100 is accepted", bug_allows_over_100),
    ("a negative price is accepted", bug_allows_negative_price),
    ("a negative percentage is accepted", bug_allows_negative_percent),
]


def learner_tests():
    return [(name, f) for name, f in vars(solution).items()
            if name.startswith("test_") and callable(f)]


def failing(impl):
    """Names of the learner's tests that fail (or crash) when run against impl."""
    failed = []
    for name, test in learner_tests():
        try:
            test(impl)
        except Exception:
            failed.append(name)
    return failed


def test_has_tests():
    """solution.py contains at least 4 test functions"""
    count = len(learner_tests())
    assert count >= 4, f"found {count} test function(s); write at least 4"


def test_pass_on_correct():
    """all your tests pass on the correct discount function"""
    failed = failing(good)
    assert not failed, "these tests fail on a correct implementation, so the tests themselves are wrong: " + ", ".join(failed)


def make_bug_test(description, impl):
    def check():
        assert failing(impl), "none of your tests noticed this bug"
    check.__doc__ = f"your tests catch the bug: {description}"
    return check


for _i, (_description, _impl) in enumerate(BROKEN):
    globals()[f"test_bug_{_i}"] = make_bug_test(_description, _impl)
