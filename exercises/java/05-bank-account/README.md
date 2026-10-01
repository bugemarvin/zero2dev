# A bank account class

Write the class `BankAccount` in `BankAccount.java`.

```java
BankAccount account = new BankAccount("Sam");
account.deposit(100);
account.withdraw(30);
account.getBalance();     // 70
account.getOwner();       // "Sam"
account.toString();       // "BankAccount(Sam, 70)"
```

- The constructor takes the owner's name. A new account has a balance of 0.
- `void deposit(long amount)` and `void withdraw(long amount)` throw `IllegalArgumentException` when the amount is zero or negative.
- `withdraw` throws `IllegalStateException` when the amount is more than the balance.
- A failed call leaves the balance unchanged.
- `long getBalance()` and `String getOwner()` return the values.
- `toString()` returns text of the form `BankAccount(Sam, 70)`.
- The fields must be `private`. The balance can only change through `deposit` and `withdraw`.
