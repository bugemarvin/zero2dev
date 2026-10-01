---
title: Structs, methods and pointers
summary: Your own types, behaviour attached to them, and when a function may change its argument.
---

## Structs

A **struct** groups related values into one type:

```go
type Point struct {
	X int
	Y int
}

p := Point{X: 3, Y: 4}
fmt.Println(p.X)
p.Y = 10

var origin Point            // every field has its zero value: {0 0}
```

Always write the field names when creating a struct. `Point{3, 4}` works, and breaks when someone adds a field.

Structs nest:

```go
type Line struct {
	Start Point
	End   Point
}
```

## Methods

A method is a function with a **receiver**: the value it belongs to.

```go
func (p Point) DistanceFromOrigin() float64 {
	return math.Sqrt(float64(p.X*p.X + p.Y*p.Y))
}

p := Point{X: 3, Y: 4}
fmt.Println(p.DistanceFromOrigin())     // 5
```

Go has no classes. A type plus its methods does the same job.

## Pointers

Go passes **copies**. A function that receives a struct gets its own copy, and changes to it are lost:

```go
func moveWrong(p Point) {
	p.X += 1            // changes the copy only
}
```

A **pointer** holds the address of a value. Through it, a function changes the original:

```go
func move(p *Point) {
	p.X += 1            // Go follows the pointer for you
}

p := Point{X: 1, Y: 1}
move(&p)                // &p is the address of p
fmt.Println(p.X)        // 2
```

| Syntax | Meaning |
| --- | --- |
| `*Point` | the type "pointer to a Point" |
| `&p` | the address of `p` |
| `*ptr` | the value the pointer points at |
| `nil` | a pointer that points at nothing |

Go has pointers and no pointer arithmetic, and memory is freed for you by the garbage collector. There is no `free`.

## Pointer receivers

A method that changes its receiver must take a pointer:

```go
type Counter struct {
	count int
}

func (c *Counter) Increment() {
	c.count++
}

func (c Counter) Value() int {      // reads only: a value receiver is enough
	return c.count
}
```

The rule most Go code follows: if **any** method needs a pointer receiver, give **all** methods of that type a pointer receiver.

## Constructors

Go has no constructors. By convention, a function named `New...` creates and returns a ready-to-use value:

```go
func NewCounter(start int) *Counter {
	return &Counter{count: start}
}
```

Returning the address of a local value is safe in Go. The value lives as long as something points at it.

Lower-case fields such as `count` are private to the package. Other packages must go through the methods.

## Embedding

Go has no inheritance. A struct can **embed** another and gets its fields and methods:

```go
type Animal struct {
	Name string
}

func (a Animal) Describe() string { return "I am " + a.Name }

type Dog struct {
	Animal              // embedded: no field name
	Breed string
}

d := Dog{Animal: Animal{Name: "Rex"}, Breed: "collie"}
fmt.Println(d.Name, d.Describe())
```

## Common mistakes

- **A value receiver on a method that should change the struct.** The change is made to a copy and disappears.
- **Calling a method on a nil pointer** and reading a field: a panic.
- **Comparing with `==` structs that contain slices or maps.** It does not compile. Compare the fields.
- **Creating structs without field names.**
