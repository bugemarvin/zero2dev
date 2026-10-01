# Shapes and a parser with errors

Write the following in `solution.go`.

## Shapes

- An interface `Shape` with two methods: `Area() float64` and `Name() string`.
- `Rect` with the fields `W` and `H` (both `float64`). Its name is `rect`.
- `Circle` with the field `R`. Its name is `circle`. Use `math.Pi`.
- `Largest(shapes []Shape) (Shape, error)` returns the shape with the biggest area. For an empty slice it returns `nil` and the error `ErrNoShapes`.
- `ErrNoShapes` is a package-level variable: `errors.New("no shapes")`.

## Parser

`ParseShape(text string) (Shape, error)` turns text into a shape:

- `"rect 2 3"` gives `Rect{W: 2, H: 3}`
- `"circle 1.5"` gives `Circle{R: 1.5}`

Anything else returns `nil` and an error that **wraps** `ErrBadShape` (declare it as `errors.New("bad shape")`) and includes the text, for example `fmt.Errorf("%w: %q", ErrBadShape, text)`. That covers an unknown name, the wrong number of values and a value that is not a number.
