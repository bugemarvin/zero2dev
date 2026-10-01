package main

import (
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
)

var ErrNoShapes = errors.New("no shapes")
var ErrBadShape = errors.New("bad shape")

type Shape interface {
	Area() float64
	Name() string
}

type Rect struct {
	W, H float64
}

type Circle struct {
	R float64
}

func (r Rect) Area() float64   { return r.W * r.H }
func (r Rect) Name() string    { return "rect" }
func (c Circle) Area() float64 { return math.Pi * c.R * c.R }
func (c Circle) Name() string  { return "circle" }

func Largest(shapes []Shape) (Shape, error) {
	if len(shapes) == 0 {
		return nil, ErrNoShapes
	}
	best := shapes[0]
	for _, s := range shapes[1:] {
		if s.Area() > best.Area() {
			best = s
		}
	}
	return best, nil
}

func ParseShape(text string) (Shape, error) {
	bad := fmt.Errorf("%w: %q", ErrBadShape, text)
	parts := strings.Fields(text)
	if len(parts) == 0 {
		return nil, bad
	}
	values := []float64{}
	for _, part := range parts[1:] {
		v, err := strconv.ParseFloat(part, 64)
		if err != nil {
			return nil, bad
		}
		values = append(values, v)
	}
	switch {
	case parts[0] == "rect" && len(values) == 2:
		return Rect{W: values[0], H: values[1]}, nil
	case parts[0] == "circle" && len(values) == 1:
		return Circle{R: values[0]}, nil
	}
	return nil, bad
}
