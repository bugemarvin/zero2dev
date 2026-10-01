# A bank account type

In `solution.go`, write a type `Account` and its functions.

- `NewAccount(owner string) *Account` returns an account with a balance of 0.
- `Owner() string` and `Balance() int` return the owner and the balance. The fields themselves are private (lower case).
- `Deposit(amount int) error` adds to the balance. An amount of 0 or less is refused with the error `amount must be positive`, and the balance does not change.
- `Withdraw(amount int) error` subtracts from the balance. An amount of 0 or less is refused the same way. An amount larger than the balance is refused with the error `insufficient funds`.
- `Transfer(to *Account, amount int) error` withdraws from this account and deposits into `to`. If the withdrawal fails, nothing changes and its error is returned.

A method that changes the balance needs a pointer receiver.
