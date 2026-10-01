---
title: Interfaces and errors
summary: Write code against behaviour, and handle failure as an ordinary value.
---

## Interfaces

An **interface** is a list of methods. Any type that has those methods satisfies it, **without saying so**:

```go
type Shape interface {
	Area() float64
}

type Rect struct{ W, H float64 }
type Circle struct{ R float64 }

func (r Rect) Area() float64   { return r.W * r.H }
func (c Circle) Area() float64 { return math.Pi * c.R * c.R }

func TotalArea(shapes []Shape) float64 {
	total := 0.0
	for _, s := range shapes {
		total += s.Area()
	}
	return total
}

TotalArea([]Shape{Rect{2, 3}, Circle{1}})
```

`Rect` never mentions `Shape`. It has an `Area() float64` method, so it is a `Shape`. This lets you write an interface for a type that someone else wrote.

Keep interfaces small. The most useful ones in the standard library have one method:

```go
type Writer interface {
	Write(p []byte) (n int, err error)
}

type Stringer interface {      // fmt uses this to print your type
	String() string
}
```

A file, a network connection, a buffer in memory and a compressed stream are all `io.Writer`. A function that takes an `io.Writer` works with every one of them, and with a fake one in a test.

## Finding out what is inside

```go
if c, ok := shape.(Circle); ok {       // type assertion
	fmt.Println("radius", c.R)
}

switch s := shape.(type) {             // type switch
case Rect:
	fmt.Println("rect", s.W, s.H)
case Circle:
	fmt.Println("circle", s.R)
}
```

`any` is the empty interface: every type satisfies it. Use it rarely. It throws away the checks the compiler does for you.

## Errors are values

`error` is an interface with one method:

```go
type error interface {
	Error() string
}
```

Creating errors:

```go
errors.New("file is empty")
fmt.Errorf("line %d: unexpected %q", line, token)
```

## Wrapping: add context on the way up

A bare "file not found" does not say which file or why you wanted it. Wrap the error with `%w` as it travels up:

```go
func loadConfig(path string) (Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return Config{}, fmt.Errorf("load config %s: %w", path, err)
	}
	// ...
}
```

The final message reads like a trail: `start server: load config app.json: open app.json: no such file or directory`.

## Checking which error it is

Declare errors that callers may want to recognise as package-level variables, named `Err...`:

```go
var ErrNotFound = errors.New("not found")

func find(id int) (User, error) {
	// ...
	return User{}, ErrNotFound
}

user, err := find(7)
if errors.Is(err, ErrNotFound) {       // works through any number of wraps
	// answer 404
}
```

For an error type that carries data, use `errors.As`:

```go
type ValidationError struct {
	Field string
}

func (e *ValidationError) Error() string { return e.Field + " is invalid" }

var ve *ValidationError
if errors.As(err, &ve) {
	fmt.Println("bad field:", ve.Field)
}
```

Never compare error **messages**. Messages change. Compare with `errors.Is` and `errors.As`.

## panic

`panic` stops the program with a stack trace. It is for bugs: an impossible state, an index out of range. It is not for things that can go wrong normally, such as a missing file or bad input. Those are errors.

## Common mistakes

- **A giant interface** with ten methods that only one type implements.
- **Returning `err.Error()` strings** up the stack in place of wrapping with `%w`.
- **Comparing `err == ErrNotFound`** on a wrapped error. Use `errors.Is`.
- **`panic` for ordinary failures.**
- **Declaring the interface next to the implementation.** In Go, the code that *uses* a behaviour declares the interface.
