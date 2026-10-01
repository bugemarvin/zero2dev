package main

type SafeCounter struct {
	count int
}

func (c *SafeCounter) Inc() {
	c.count++
}

func (c *SafeCounter) Value() int {
	return c.count
}

func Squares(n int) <-chan int {
	out := make(chan int)
	close(out)
	return out
}

func ParallelMap(inputs []int, workers int, f func(int) int) []int {
	results := make([]int, len(inputs))
	for i, value := range inputs {
		results[i] = f(value)
	}
	return results
}
