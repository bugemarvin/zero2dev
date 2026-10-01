package main

import "fmt"

func main() {
	var width, height int
	fmt.Scan(&width, &height)
	fmt.Printf("area: %d\n", width*height)
	fmt.Printf("perimeter: %d\n", 2*(width+height))
	fmt.Printf("ratio: %.2f\n", float64(width)/float64(height))
}
