// Tests. Do not edit.
package main

import (
	"fmt"
	"os"
	"sync"
	"time"
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
	counter := &SafeCounter{}
	done := make(chan bool)
	for g := 0; g < 100; g++ {
		go func() {
			for i := 0; i < 100; i++ {
				counter.Inc()
			}
			done <- true
		}()
	}
	for g := 0; g < 100; g++ {
		<-done
	}
	check("SafeCounter counts 10000 increments from 100 goroutines", counter.Value() == 10000,
		fmt.Sprintf("got %d: increments were lost, so the count is not protected", counter.Value()))

	got := []int{}
	for v := range Squares(5) {
		got = append(got, v)
	}
	check("Squares(5) delivers 1 4 9 16 25 and closes", fmt.Sprint(got) == "[1 4 9 16 25]", fmt.Sprintf("got %v", got))
	got = []int{}
	for v := range Squares(0) {
		got = append(got, v)
	}
	check("Squares(0) delivers nothing and closes", len(got) == 0, fmt.Sprintf("got %v", got))

	inputs := []int{5, 3, 8, 1, 9, 2, 7, 4}
	out := ParallelMap(inputs, 4, func(n int) int { return n * 10 })
	check("ParallelMap keeps the order of the inputs", fmt.Sprint(out) == "[50 30 80 10 90 20 70 40]", fmt.Sprintf("got %v", out))
	out = ParallelMap([]int{}, 3, func(n int) int { return n })
	check("ParallelMap of nothing is empty", len(out) == 0, fmt.Sprintf("got %v", out))

	// f waits until 4 calls are running at the same moment. With sequential code that never happens.
	var mu sync.Mutex
	running, peak := 0, 0
	gate := make(chan bool)
	go func() {
		for {
			mu.Lock()
			ready := running >= 4
			mu.Unlock()
			if ready {
				close(gate)
				return
			}
			time.Sleep(time.Millisecond)
		}
	}()
	finished := make(chan []int)
	go func() {
		finished <- ParallelMap([]int{1, 2, 3, 4}, 4, func(n int) int {
			mu.Lock()
			running++
			if running > peak {
				peak = running
			}
			mu.Unlock()
			select {
			case <-gate:
			case <-time.After(2 * time.Second):
			}
			return n + 1
		})
	}()
	select {
	case out = <-finished:
		check("ParallelMap runs the calls at the same time", peak >= 4 && fmt.Sprint(out) == "[2 3 4 5]",
			fmt.Sprintf("at most %d calls ran together, result %v", peak, out))
	case <-time.After(15 * time.Second):
		check("ParallelMap runs the calls at the same time", false, "it did not finish")
	}
	finish()
}
