# Points and students

The types `Point` and `Student` are defined in `shapes.h`. Implement the functions in `shapes.c`.

- `double distance(Point a, Point b)`: the straight-line distance between two points.
- `void translate(Point *p, double dx, double dy)`: move the point by `dx` and `dy`, changing the caller's struct.
- `Point midpoint(Point a, Point b)`: the point halfway between the two.
- `const Student *best_student(const Student *s, int n)`: a pointer to the student with the highest score. If several share the highest score, the first of them. `NULL` when `n` is 0.
