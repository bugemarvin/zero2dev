# Shapes behind an interface

`Shape.java` defines an interface with three methods: `area()`, `perimeter()` and `name()`. Do not edit it.

Complete the four classes.

- **`Circle`** implements `Shape`. Its constructor takes the radius. `name()` returns `"circle"`. Use `Math.PI`.
- **`Rectangle`** implements `Shape`. Its constructor takes the width and the height. `name()` returns `"rectangle"`.
- **`Square`** **extends `Rectangle`**. Its constructor takes one side. `name()` returns `"square"`. It must not repeat the area and perimeter code: it inherits them.
- **`Shapes`** has two static methods, described below.

`double totalArea(List<Shape> shapes)` returns the sum of all areas, and 0 for an empty list.

`Shape largest(List<Shape> shapes)` returns the shape with the largest area, or `null` for an empty list. If several are equally large, it returns the first of them.
