// Tests. Do not edit.
package main

import (
	"errors"
	"fmt"
	"os"
	"strings"
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

func near(a, b float64) bool {
	d := a - b
	return d < 1e-9 && d > -1e-9
}

func main() {
	var r Shape = Rect{W: 2, H: 3}
	var c Shape = Circle{R: 1}
	check("Rect{2, 3} has area 6", near(r.Area(), 6), fmt.Sprintf("got %v", r.Area()))
	check("a Rect is named rect", r.Name() == "rect", fmt.Sprintf("got %q", r.Name()))
	check("Circle{1} has area pi", near(c.Area(), 3.141592653589793), fmt.Sprintf("got %v", c.Area()))
	check("a Circle is named circle", c.Name() == "circle", fmt.Sprintf("got %q", c.Name()))

	best, err := Largest([]Shape{Rect{W: 1, H: 1}, Circle{R: 2}, Rect{W: 3, H: 3}})
	check("Largest picks the biggest area", err == nil && best == Shape(Circle{R: 2}), fmt.Sprintf("got %v, %v", best, err))
	best, err = Largest(nil)
	check("Largest of nothing returns ErrNoShapes", best == nil && err == ErrNoShapes, fmt.Sprintf("got %v, %v", best, err))

	s, err := ParseShape("rect 2 3")
	check("ParseShape(\"rect 2 3\")", err == nil && s == Shape(Rect{W: 2, H: 3}), fmt.Sprintf("got %v, %v", s, err))
	s, err = ParseShape("circle 1.5")
	check("ParseShape(\"circle 1.5\")", err == nil && s == Shape(Circle{R: 1.5}), fmt.Sprintf("got %v, %v", s, err))
	for _, text := range []string{"triangle 1 2", "rect 2", "circle", "rect a b", "", "circle 1 2"} {
		s, err = ParseShape(text)
		check(fmt.Sprintf("ParseShape(%q) wraps ErrBadShape", text), s == nil && errors.Is(err, ErrBadShape),
			fmt.Sprintf("got %v, %v", s, err))
	}
	_, err = ParseShape("triangle 1 2")
	check("the error message includes the text", err != nil && err != ErrBadShape && strings.Contains(err.Error(), "triangle 1 2"),
		fmt.Sprintf("got %v", err))
	finish()
}
