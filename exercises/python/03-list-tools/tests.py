from solution import evens, running_total, unique


def test_input_is_not_changed():
    """the functions do not change the list they are given"""
    data = [3, 1, 3, 2, 4]
    evens(data)
    running_total(data)
    unique(data)
    assert data == [3, 1, 3, 2, 4], f"the input list was changed to {data}"
