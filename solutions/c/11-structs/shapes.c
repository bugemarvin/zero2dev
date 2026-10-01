#include <math.h>
#include <stddef.h>
#include "shapes.h"

double distance(Point a, Point b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return sqrt(dx * dx + dy * dy);
}

void translate(Point *p, double dx, double dy) {
    p->x += dx;
    p->y += dy;
}

Point midpoint(Point a, Point b) {
    Point m = {(a.x + b.x) / 2, (a.y + b.y) / 2};
    return m;
}

const Student *best_student(const Student *s, int n) {
    if (n == 0) {
        return NULL;
    }
    const Student *best = &s[0];
    for (int i = 1; i < n; i++) {
        if (s[i].score > best->score) {
            best = &s[i];
        }
    }
    return best;
}
