def expect_value_error(discount, price, percent):
    try:
        discount(price, percent)
    except ValueError:
        return
    assert False, f"discount({price}, {percent}) should raise ValueError"


def test_quarter_off(discount):
    assert discount(200, 25) == 150.0


def test_zero_percent_changes_nothing(discount):
    assert discount(80, 0) == 80


def test_hundred_percent_is_free(discount):
    assert discount(80, 100) == 0


def test_rounds_to_two_decimals(discount):
    assert discount(9.99, 15) == 8.49


def test_rejects_negative_price(discount):
    expect_value_error(discount, -1, 10)


def test_rejects_negative_percent(discount):
    expect_value_error(discount, 50, -1)


def test_rejects_percent_over_100(discount):
    expect_value_error(discount, 50, 101)
