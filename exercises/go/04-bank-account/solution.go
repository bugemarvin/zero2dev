package main

type Account struct {
	owner   string
	balance int
}

func NewAccount(owner string) *Account {
	return &Account{}
}

func (a *Account) Owner() string {
	return ""
}

func (a *Account) Balance() int {
	return 0
}

func (a *Account) Deposit(amount int) error {
	return nil
}

func (a *Account) Withdraw(amount int) error {
	return nil
}

func (a *Account) Transfer(to *Account, amount int) error {
	return nil
}
