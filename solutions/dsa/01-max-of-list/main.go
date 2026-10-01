package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	in := bufio.NewReader(os.Stdin)
	var n int
	fmt.Fscan(in, &n)
	var best int64
	for i := 0; i < n; i++ {
		var x int64
		fmt.Fscan(in, &x)
		if i == 0 || x > best {
			best = x
		}
	}
	fmt.Println(best)
}
