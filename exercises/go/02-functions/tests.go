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

func main() {
	grades := map[int]string{95: "A", 90: "A", 89: "B", 80: "B", 79: "C", 70: "C", 69: "F", 0: "F"}
	for score, want := range grades {
		got := Grade(score)
		check(fmt.Sprintf("Grade(%d) is %s", score, want), got == want, fmt.Sprintf("got %q", got))
	}
	check("SumTo(10) is 55", SumTo(10) == 55, fmt.Sprintf("got %d", SumTo(10)))
	check("SumTo(1) is 1", SumTo(1) == 1, fmt.Sprintf("got %d", SumTo(1)))
	check("SumTo(0) is 0", SumTo(0) == 0, fmt.Sprintf("got %d", SumTo(0)))
	check("SumTo(-5) is 0", SumTo(-5) == 0, fmt.Sprintf("got %d", SumTo(-5)))
	primes := map[int]bool{-3: false, 0: false, 1: false, 2: true, 3: true, 4: false, 17: true, 25: false, 97: true, 100: false}
	for n, want := range primes {
		check(fmt.Sprintf("IsPrime(%d) is %v", n, want), IsPrime(n) == want, fmt.Sprintf("got %v", IsPrime(n)))
	}
	q, err := Divide(17, 5)
	check("Divide(17, 5) is 3 with no error", q == 3 && err == nil, fmt.Sprintf("got %d, %v", q, err))
	q, err = Divide(1, 0)
	check("Divide(1, 0) returns an error", err != nil && q == 0, fmt.Sprintf("got %d, %v", q, err))
	check("the error says division by zero", err != nil && err.Error() == "division by zero", fmt.Sprintf("got %v", err))
	finish()
}
