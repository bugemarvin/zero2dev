---
title: Go basics
summary: Programs, variables, types and printing, and how Go is built and run.
---

## Why Go

Go is a compiled language from Google, designed for servers, command-line tools and cloud software. Docker and Kubernetes are written in it. It is deliberately small: you can learn the whole language in days, and code written by different people looks the same.

## The first program

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, Go")
}
```

- Every file starts with its **package**. The package `main` with a function `main` is a program you can run.
- `import "fmt"` brings in the formatting package of the standard library.
- A name that starts with a **capital letter**, such as `Println`, is visible from other packages. Lower-case names are private to their package. There are no `public` or `private` keywords.

```console
$ go run main.go          # compile and run in one step
Hello, Go
$ go build -o hello main.go
$ ./hello
```

`go build` produces one executable file with no dependencies. Copy it to another machine with the same system and it runs.

## Variables

```go
var age int = 30
var name = "Sam"        // the type is worked out: string
count := 0              // short form, inside functions only

const pi = 3.14159
```

`:=` declares **and** assigns. `=` assigns to a variable that already exists.

Go is strict in two ways that surprise newcomers:

- An **unused variable** or an **unused import** is a compile error.
- A variable declared without a value gets its **zero value**: `0`, `""`, `false`, or `nil`. There is no "uninitialised" memory.

## Types

| Type | Holds | Zero value |
| --- | --- | --- |
| `int` | a whole number (64 bits on today's machines) | `0` |
| `float64` | a number with a fraction | `0` |
| `string` | text, in UTF-8 | `""` |
| `bool` | `true` or `false` | `false` |
| `byte` | one byte, the same as `uint8` | `0` |
| `rune` | one Unicode character | `0` |

Go never converts between types by itself:

```go
var n int = 7
var half float64 = float64(n) / 2     // 3.5
whole := n / 2                        // 3: integer division
```

## Printing

```go
fmt.Println("total:", 12, true)              // values separated by spaces, then a newline
fmt.Printf("%s is %d years old\n", name, age)
fmt.Printf("%.2f\n", 3.14159)                // 3.14
text := fmt.Sprintf("%05d", 42)              // returns the string "00042"
```

| Verb | Shows |
| --- | --- |
| `%d` | an integer |
| `%f`, `%.2f` | a float, with two decimals |
| `%s` | a string |
| `%v` | any value in its default form |
| `%q` | a string in quotes |
| `%T` | the type of the value |

## Reading input

```go
var a, b int
fmt.Scan(&a, &b)        // reads two numbers separated by spaces or newlines
```

`&a` is the address of `a`: `Scan` needs to know where to put the value.

## gofmt

Go has one official code style, and a tool that applies it:

```console
$ gofmt -w main.go
```

It uses tabs for indentation. Nobody argues about formatting in Go, because the tool decides. Editors run it on every save.

## Common mistakes

- **Declaring a variable and not using it.** Remove it, or use `_` to discard a value on purpose.
- **`:=` outside a function.** At package level use `var`.
- **`:=` when you meant `=`**, which creates a new variable in an inner block and leaves the outer one unchanged.
- **Mixing `int` and `float64`** without a conversion.
- **The opening brace on its own line.** Go requires it at the end of the line.
