---
title: Goroutines and channels
summary: Do many things at once, safely: the feature Go is known for.
---

## Goroutines

A **goroutine** is a function running at the same time as the rest of the program. Starting one takes the word `go`:

```go
go download(url)
```

Goroutines are cheap. A program can run hundreds of thousands of them, where operating-system threads would run out of memory. The Go runtime spreads them over the processor cores.

There is a catch. When `main` returns, the program ends, and goroutines still running are simply cut off:

```go
func main() {
	go fmt.Println("hello")
}                               // usually prints nothing
```

So you must **wait** for them.

## WaitGroup

```go
var wg sync.WaitGroup
for _, url := range urls {
	wg.Add(1)
	go func() {
		defer wg.Done()
		download(url)
	}()
}
wg.Wait()                       // blocks until every Done has been called
```

## Shared data needs protection

Two goroutines changing the same variable at the same time is a **data race**. The result is wrong in ways that appear and disappear from run to run:

```go
count := 0
for i := 0; i < 1000; i++ {
	go func() { count++ }()     // a race: count++ is read, add, write
}
```

A **mutex** lets one goroutine in at a time:

```go
var mu sync.Mutex
mu.Lock()
count++
mu.Unlock()
```

Go has a race detector. Use it in tests:

```console
$ go run -race main.go
$ go test -race ./...
```

## Channels

A **channel** carries values from one goroutine to another. It is both the pipe and the synchronisation:

```go
results := make(chan int)

go func() {
	results <- 42               // send
}()

value := <-results              // receive: waits until a value arrives
```

A send on an unbuffered channel waits until someone receives, and a receive waits until someone sends. That waiting is what coordinates the goroutines.

The Go proverb: *do not communicate by sharing memory; share memory by communicating.* Hand the data over through a channel, and only one goroutine touches it at a time.

## Closing and ranging

The sender closes a channel to say "no more values". A `range` loop over a channel ends when it is closed:

```go
func generate(n int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for i := 1; i <= n; i++ {
			out <- i
		}
	}()
	return out
}

for value := range generate(5) {
	fmt.Println(value)
}
```

`<-chan int` is a channel you may only receive from, and `chan<- int` one you may only send to. The compiler enforces it.

## A worker pool

A fixed number of goroutines take jobs from one channel and put results on another:

```go
jobs := make(chan int)
results := make(chan int)

var wg sync.WaitGroup
for w := 0; w < 4; w++ {
	wg.Add(1)
	go func() {
		defer wg.Done()
		for job := range jobs {
			results <- job * job
		}
	}()
}

go func() {
	for i := 1; i <= 10; i++ {
		jobs <- i
	}
	close(jobs)             // the workers' range loops end
}()

go func() {
	wg.Wait()
	close(results)          // nothing more will be sent
}()

for r := range results {
	fmt.Println(r)
}
```

The results arrive in whatever order the workers finish.

## select and timeouts

`select` waits on several channels and takes whichever is ready first:

```go
select {
case result := <-results:
	fmt.Println(result)
case <-time.After(2 * time.Second):
	fmt.Println("timed out")
}
```

## Deadlock

If every goroutine is waiting and none can continue, Go stops the program:

```text
fatal error: all goroutines are asleep - deadlock!
```

The usual causes: sending on a channel nobody receives from, or ranging over a channel nobody closes.

## Common mistakes

- **Not waiting** for goroutines before `main` returns.
- **Sharing a variable between goroutines** with no mutex and no channel.
- **Forgetting to close a channel** that someone ranges over.
- **Closing a channel from the receiving side**, or twice. Both panic. The sender closes.
- **Starting a goroutine that can never finish**: a leak that grows until the program runs out of memory.
