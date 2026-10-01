// Tests. Do not edit.
package main

import (
	"fmt"
	"os"
)

var failed = false

func check(name string, ok bool, detail string) {
	if ok {
		fmt.Printf("ok - %s\n", name)
		return
	}
	failed = true
	fmt.Printf("not ok - %s: %s\n", name, detail)
}

func finish() {
	if failed {
		os.Exit(1)
	}
}

func message(err error) string {
	if err == nil {
		return "no error"
	}
	return err.Error()
}

func main() {
	a := NewAccount("Sam")
	check("a new account belongs to its owner", a != nil && a.Owner() == "Sam", "Owner() is wrong")
	check("a new account has a balance of 0", a.Balance() == 0, fmt.Sprintf("got %d", a.Balance()))
	err := a.Deposit(100)
	check("Deposit(100) works", err == nil && a.Balance() == 100, fmt.Sprintf("balance %d, %s", a.Balance(), message(err)))
	err = a.Deposit(0)
	check("Deposit(0) is refused", message(err) == "amount must be positive" && a.Balance() == 100,
		fmt.Sprintf("balance %d, %s", a.Balance(), message(err)))
	err = a.Deposit(-5)
	check("Deposit(-5) is refused", message(err) == "amount must be positive" && a.Balance() == 100,
		fmt.Sprintf("balance %d, %s", a.Balance(), message(err)))
	err = a.Withdraw(30)
	check("Withdraw(30) leaves 70", err == nil && a.Balance() == 70, fmt.Sprintf("balance %d, %s", a.Balance(), message(err)))
	err = a.Withdraw(500)
	check("Withdraw(500) fails with insufficient funds", message(err) == "insufficient funds" && a.Balance() == 70,
		fmt.Sprintf("balance %d, %s", a.Balance(), message(err)))
	err = a.Withdraw(-1)
	check("Withdraw(-1) is refused", message(err) == "amount must be positive" && a.Balance() == 70,
		fmt.Sprintf("balance %d, %s", a.Balance(), message(err)))
	b := NewAccount("Ada")
	err = a.Transfer(b, 50)
	check("Transfer(b, 50) moves the money", err == nil && a.Balance() == 20 && b.Balance() == 50,
		fmt.Sprintf("a %d, b %d, %s", a.Balance(), b.Balance(), message(err)))
	err = a.Transfer(b, 999)
	check("a transfer that is too large changes nothing", message(err) == "insufficient funds" && a.Balance() == 20 && b.Balance() == 50,
		fmt.Sprintf("a %d, b %d, %s", a.Balance(), b.Balance(), message(err)))
	finish()
}
