package main

import "errors"

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

// Give Rect and Circle the two methods of Shape.

func Largest(shapes []Shape) (Shape, error) {
	return nil, nil
}

func ParseShape(text string) (Shape, error) {
	return nil, nil
}
