import math

from solution import BankAccount, Vector


def raises(error, f, *args):
    try:
        f(*args)
    except error:
        return True
    except Exception:
        return False
    return False


def test_new_account():
    """a new account has balance 0, an owner and no history"""
    a = BankAccount("Sam")
    assert a.owner == "Sam"
    assert a.balance == 0, f"balance is {a.balance!r}"
    assert a.history == [], f"history is {a.history!r}"


def test_deposit_withdraw():
    """deposit and withdraw change the balance"""
    a = BankAccount("Sam")
    a.deposit(100)
    a.withdraw(30)
    assert a.balance == 70, f"balance is {a.balance!r}, expected 70"


def test_history():
    """history records each operation in order"""
    a = BankAccount("Sam")
    a.deposit(100)
    a.withdraw(30)
    a.deposit(5)
    assert [tuple(h) for h in a.history] == [("deposit", 100), ("withdraw", 30), ("deposit", 5)], f"history is {a.history!r}"


def test_bad_amounts():
    """zero and negative amounts raise ValueError"""
    a = BankAccount("Sam")
    assert raises(ValueError, a.deposit, 0), "deposit(0) should raise ValueError"
    assert raises(ValueError, a.deposit, -5), "deposit(-5) should raise ValueError"
    assert raises(ValueError, a.withdraw, -5), "withdraw(-5) should raise ValueError"


def test_overdraw():
    """withdrawing more than the balance raises ValueError and changes nothing"""
    a = BankAccount("Sam")
    a.deposit(50)
    assert raises(ValueError, a.withdraw, 51), "withdraw(51) with a balance of 50 should raise ValueError"
    assert a.balance == 50, f"balance changed to {a.balance!r} after a failed withdrawal"
    assert len(a.history) == 1, "a failed withdrawal must not be added to the history"
    a.withdraw(50)
    assert a.balance == 0, "withdrawing the whole balance is allowed"


def test_balance_read_only():
    """balance cannot be assigned from outside"""
    a = BankAccount("Sam")

    def assign():
        a.balance = 1000

    assert raises(AttributeError, assign), "account.balance = 1000 should raise AttributeError (use @property)"


def test_accounts_are_separate():
    """two accounts do not share a history"""
    a, b = BankAccount("A"), BankAccount("B")
    a.deposit(10)
    assert b.history == [], "a deposit to one account appeared in another account's history"


def test_vector_add():
    """vectors add, giving a new Vector"""
    a, b = Vector(1, 2), Vector(3, 4)
    c = a + b
    assert isinstance(c, Vector), "a + b should be a Vector"
    assert (c.x, c.y) == (4, 6), f"got ({c.x}, {c.y})"
    assert (a.x, a.y, b.x, b.y) == (1, 2, 3, 4), "adding must not change the original vectors"


def test_vector_eq():
    """vectors with equal coordinates are equal"""
    assert Vector(1, 2) == Vector(1, 2)
    assert Vector(1, 2) != Vector(2, 1)
    assert Vector(1, 2) != "Vector(1, 2)", "a Vector is not equal to a string"


def test_vector_repr():
    """repr looks like Vector(4, 6)"""
    assert repr(Vector(4, 6)) == "Vector(4, 6)", f"repr is {repr(Vector(4, 6))!r}"


def test_vector_length():
    """length is the distance from the origin"""
    assert math.isclose(Vector(3, 4).length(), 5.0), f"Vector(3, 4).length() is {Vector(3, 4).length()!r}"
    assert Vector(0, 0).length() == 0
