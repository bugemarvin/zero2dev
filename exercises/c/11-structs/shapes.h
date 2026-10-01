#ifndef SHAPES_H
#define SHAPES_H

typedef struct {
    double x;
    double y;
} Point;

typedef struct {
    char name[32];
    int score;
} Student;

double distance(Point a, Point b);
void translate(Point *p, double dx, double dy);
Point midpoint(Point a, Point b);
const Student *best_student(const Student *s, int n);

#endif
