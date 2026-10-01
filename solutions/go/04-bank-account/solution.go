package main

import "errors"

type Account struct {
	owner   string
	balance int
}

func NewAccount(owner string) *Account {
	return &Account{owner: owner}
}

func (a *Account) Owner() string {
	return a.owner
}

func (a *Account) Balance() int {
	return a.balance
}

func (a *Account) Deposit(amount int) error {
	if amount <= 0 {
		return errors.New("amount must be positive")
	}
	a.balance += amount
	return nil
}

func (a *Account) Withdraw(amount int) error {
	if amount <= 0 {
		return errors.New("amount must be positive")
	}
	if amount > a.balance {
		return errors.New("insufficient funds")
	}
	a.balance -= amount
	return nil
}

func (a *Account) Transfer(to *Account, amount int) error {
	if err := a.Withdraw(amount); err != nil {
		return err
	}
	return to.Deposit(amount)
}
