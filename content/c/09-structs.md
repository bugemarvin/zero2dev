---
title: Structs
summary: Group related values into one type of your own.
---

## Defining a struct

A `struct` bundles several named values, called **fields** or **members**, into one unit.

```c
struct Point {
    double x;
    double y;
};

struct Point p = {3.0, 4.0};
printf("%.1f %.1f\n", p.x, p.y);
p.x = 10.0;
```

The dot reaches a field.

## typedef

Writing `struct Point` everywhere is tiring. `typedef` gives a type a second, shorter name:

```c
typedef struct {
    double x;
    double y;
} Point;

Point p = {3.0, 4.0};
Point origin = {0};        // every field set to zero
```

You can also name the fields when creating one, which is clearer with many fields:

```c
Point q = {.x = 1.5, .y = 2.5};
```

## Structs and functions

A struct is passed **by value**, like an `int`: the function gets a copy.

```c
double distance(Point a, Point b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return sqrt(dx * dx + dy * dy);
}
```

`sqrt` comes from `<math.h>`. When compiling by hand, add `-lm` at the end of the command to link the maths library.

A function can also return a struct:

```c
Point midpoint(Point a, Point b) {
    Point m = {(a.x + b.x) / 2, (a.y + b.y) / 2};
    return m;
}
```

## Pointers to structs

To let a function **change** a struct, or to avoid copying a large one, pass a pointer. Reaching a field through a pointer uses the arrow `->`:

```c
void move(Point *p, double dx, double dy) {
    p->x += dx;
    p->y += dy;
}

Point p = {1.0, 1.0};
move(&p, 2.0, 0.0);        // p is now {3.0, 1.0}
```

`p->x` is shorthand for `(*p).x`.

| You have | Use | Example |
| --- | --- | --- |
| the struct itself | `.` | `point.x` |
| a pointer to it | `->` | `ptr->x` |

Use `const` when the function only reads: `double length(const Point *p)`.

## Arrays of structs

```c
typedef struct {
    char name[32];
    int score;
} Student;

Student class[] = {
    {"Ada", 91},
    {"Linus", 78},
    {"Grace", 95}
};

for (int i = 0; i < 3; i++) {
    printf("%s: %d\n", class[i].name, class[i].score);
}
```

## Structs inside structs

```c
typedef struct {
    Point top_left;
    Point bottom_right;
} Rect;

Rect r = {{0, 10}, {5, 0}};
double width = r.bottom_right.x - r.top_left.x;
```

## enum

An `enum` gives names to a set of whole-number constants. It makes code readable and works well with `switch`.

```c
typedef enum { RED, GREEN, BLUE } Color;

Color c = GREEN;
if (c == GREEN) {
    printf("go\n");
}
```

`RED` is 0, `GREEN` is 1, `BLUE` is 2.

## Structs on the heap

Structs and `malloc` together are the basis of every data structure you will build in the algorithms track:

```c
Point *p = malloc(sizeof(Point));
if (p != NULL) {
    p->x = 1.0;
    p->y = 2.0;
    free(p);
}
```

## Common mistakes

- **`.` on a pointer or `->` on a struct.** The compiler error names the right one.
- **Comparing structs with `==`.** It does not compile. Compare field by field.
- **Assigning a string into a `char` array field.** `s.name = "Ada"` is an error. Use `strcpy(s.name, "Ada")`, or set it when the struct is created.
- **Forgetting the semicolon** after the closing brace of the definition.
