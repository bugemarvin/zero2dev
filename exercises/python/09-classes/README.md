# A bank account and a vector

Write two classes in `solution.py`.

## BankAccount

```python
account = BankAccount("Sam")
account.deposit(100)
account.withdraw(30)
account.balance        # 70
account.owner          # 'Sam'
account.history        # [('deposit', 100), ('withdraw', 30)]
```

- A new account has a balance of 0 and an empty history.
- `deposit(amount)` and `withdraw(amount)` raise `ValueError` if the amount is zero or negative.
- `withdraw(amount)` raises `ValueError` if the amount is more than the balance.
- A failed operation changes nothing.
- `balance` is read-only: `account.balance = 5` must raise `AttributeError`.
- `history` is a list of `(kind, amount)` tuples in the order they happened.

## Vector

```python
v = Vector(1, 2) + Vector(3, 4)
v                          # Vector(4, 6)
v == Vector(4, 6)          # True
v.length()                 # 7.211...
```

- `Vector(x, y)` stores `x` and `y`.
- `+` returns a new `Vector` and leaves both originals unchanged.
- `==` compares the coordinates.
- `repr` gives text of the form `Vector(4, 6)`.
- `length()` returns the distance from the origin.
