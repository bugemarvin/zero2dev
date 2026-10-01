---
title: Control flow and functions
summary: if, for, switch, and functions that return more than one value.
---

## if

```go
if age >= 18 {
	fmt.Println("adult")
} else if age >= 13 {
	fmt.Println("teenager")
} else {
	fmt.Println("child")
}
```

No brackets around the condition, and the braces are always required. The condition must be a `bool`: a number is not accepted as true or false.

An `if` can start with a short statement. Its variable exists only inside the `if`:

```go
if n := len(name); n > 20 {
	fmt.Println("too long by", n-20)
}
```

## for: the only loop

```go
for i := 0; i < 5; i++ {       // the classic form
	fmt.Println(i)
}

for count < 10 {               // like "while" in other languages
	count *= 2
}

for {                          // forever, until break or return
	break
}
```

`range` walks over a collection:

```go
for index, value := range []string{"a", "b", "c"} {
	fmt.Println(index, value)
}
for i := range 3 {             // 0, 1, 2 (Go 1.22 and later)
	fmt.Println(i)
}
```

Use `_` for a part you do not need: `for _, value := range items`.

## switch

```go
switch day {
case "sat", "sun":
	fmt.Println("weekend")
case "fri":
	fmt.Println("almost")
default:
	fmt.Println("weekday")
}
```

Only the matching case runs: there is no fall-through and no `break` to forget. A `switch` with no value is a tidy chain of conditions:

```go
switch {
case score >= 90:
	grade = "A"
case score >= 80:
	grade = "B"
default:
	grade = "C"
}
```

## Functions

```go
func add(a int, b int) int {
	return a + b
}

func greet(name string) {      // returns nothing
	fmt.Println("Hello,", name)
}
```

The type comes **after** the name. Parameters of the same type can share it: `func add(a, b int) int`.

## Several return values

A function can return more than one value. This is how Go reports errors:

```go
func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}

result, err := divide(10, 2)
if err != nil {
	fmt.Println("error:", err)
	return
}
fmt.Println(result)
```

`nil` means "no error". You will write `if err != nil` many times a day in Go. It is the language's deliberate choice: errors are ordinary values, handled where they happen.

## Functions are values

```go
double := func(n int) int { return n * 2 }
fmt.Println(double(21))

func apply(numbers []int, f func(int) int) []int {
	result := []int{}
	for _, n := range numbers {
		result = append(result, f(n))
	}
	return result
}
```

## defer

`defer` runs a call when the surrounding function returns, whatever path it takes:

```go
file, err := os.Open("data.txt")
if err != nil {
	return err
}
defer file.Close()       // runs when this function ends
```

Put the clean-up right next to the thing it cleans up, and it cannot be forgotten.

## Common mistakes

- **Ignoring an error**: `result, _ := divide(a, b)`. The `_` hides a failure you will debug later.
- **Brackets around conditions**, a habit from other languages. `gofmt` removes them.
- **Expecting `switch` to fall through** to the next case.
- **Declaring `err` again with `:=`** in an inner block, which hides the outer one.
