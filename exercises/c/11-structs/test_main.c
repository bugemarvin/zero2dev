/* Test driver. Do not edit. */
#include <stdio.h>
#include <string.h>
#include "shapes.h"

static void show_best(const Student *s, int n) {
    const Student *best = best_student(s, n);
    if (best == NULL) {
        printf("none\n");
    } else {
        printf("%s %d\n", best->name, best->score);
    }
}

int main(int argc, char *argv[]) {
    const char *test = argc > 1 ? argv[1] : "";
    Point origin = {0.0, 0.0};
    Point a = {3.0, 4.0};
    Point b = {1.0, 2.0};

    if (strcmp(test, "distance") == 0) {
        printf("%.2f\n", distance(origin, a));
        printf("%.2f\n", distance(a, a));
        printf("%.2f\n", distance(a, b));
    } else if (strcmp(test, "translate") == 0) {
        Point p = {1.0, 1.0};
        translate(&p, 2.0, -0.5);
        printf("(%.1f, %.1f)\n", p.x, p.y);
        translate(&p, -3.0, -0.5);
        printf("(%.1f, %.1f)\n", p.x, p.y);
    } else if (strcmp(test, "midpoint") == 0) {
        Point m = midpoint(a, b);
        printf("(%.1f, %.1f)\n", m.x, m.y);
        Point c = {-3.0, 2.0};
        Point d = {0.0, -2.0};
        m = midpoint(c, d);
        printf("(%.1f, %.1f)\n", m.x, m.y);
    } else if (strcmp(test, "best") == 0) {
        Student class[] = {{"Ada", 91}, {"Linus", 78}, {"Grace", 95}, {"Dennis", 95}};
        show_best(class, 4);
        show_best(class, 2);
        show_best(class, 0);
    }
    return 0;
}
