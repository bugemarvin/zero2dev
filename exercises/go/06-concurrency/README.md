# Parallel work with goroutines

Write three things in `solution.go`.

## `SafeCounter`

A type that many goroutines can use at once.

- `Inc()` adds 1.
- `Value() int` returns the count.

Protect the count with a `sync.Mutex`. The tests call `Inc` from 100 goroutines, 100 times each, and expect exactly 10000.

## `Squares(n int) <-chan int`

Returns a channel that delivers 1, 4, 9, ... up to n squared, in order, and is then **closed**. The values are produced by a goroutine.

## `ParallelMap(inputs []int, workers int, f func(int) int) []int`

Applies `f` to every input using `workers` goroutines, and returns the results **in the same order as the inputs**. The tests check that several calls of `f` really run at the same time.

A simple way to keep the order: give each job its index, and have the worker write `results[index]`.
