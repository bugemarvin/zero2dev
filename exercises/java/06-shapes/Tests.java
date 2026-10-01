/* Test driver. Do not edit. */
import java.util.*;

public class Tests {
    private static int failed = 0;

    interface Body {
        void run() throws Exception;
    }

    private static void check(String name, Body body) {
        try {
            body.run();
            System.out.println("ok - " + name);
        } catch (AssertionError e) {
            failed++;
            System.out.println("not ok - " + name + ": " + e.getMessage());
        } catch (Throwable e) {
            failed++;
            System.out.println("not ok - " + name + ": threw " + e);
        }
    }

    private static void eq(Object expected, Object actual) {
        if (!Objects.equals(expected, actual)) {
            throw new AssertionError("expected " + expected + " but got " + actual);
        }
    }

    private static void near(double expected, double actual) {
        if (Math.abs(expected - actual) > 1e-6) {
            throw new AssertionError("expected " + expected + " but got " + actual);
        }
    }

    private static void yes(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }

    private static void throwsType(Class<? extends Throwable> type, Body body) {
        try {
            body.run();
        } catch (Throwable e) {
            if (type.isInstance(e)) {
                return;
            }
            throw new AssertionError("expected " + type.getSimpleName() + " but got " + e);
        }
        throw new AssertionError("expected " + type.getSimpleName() + " but nothing was thrown");
    }

    public static void main(String[] args) {
        check("Circle area and perimeter", () -> {
            Shape c = new Circle(2);
            near(Math.PI * 4, c.area());
            near(Math.PI * 4, c.perimeter());
            eq("circle", c.name());
        });
        check("Rectangle area and perimeter", () -> {
            Shape r = new Rectangle(3, 4);
            near(12, r.area());
            near(14, r.perimeter());
            eq("rectangle", r.name());
        });
        check("Square area, perimeter and name", () -> {
            Shape s = new Square(5);
            near(25, s.area());
            near(20, s.perimeter());
            eq("square", s.name());
        });
        check("Square extends Rectangle", () -> {
            Object s = new Square(1);
            yes(s instanceof Rectangle, "Square must extend Rectangle");
        });
        check("Square inherits area and perimeter without redefining them", () -> {
            for (java.lang.reflect.Method m : Square.class.getDeclaredMethods()) {
                yes(!m.getName().equals("area") && !m.getName().equals("perimeter"),
                    "Square defines " + m.getName() + "() itself; inherit it from Rectangle");
            }
        });
        check("totalArea adds up different shapes", () -> {
            List<Shape> shapes = List.of(new Rectangle(2, 3), new Square(2), new Circle(1));
            near(6 + 4 + Math.PI, Shapes.totalArea(shapes));
            near(0, Shapes.totalArea(List.of()));
        });
        check("largest returns the shape with the biggest area", () -> {
            Shape big = new Rectangle(10, 10);
            List<Shape> shapes = List.of(new Circle(1), big, new Square(3));
            yes(Shapes.largest(shapes) == big, "expected the 10 by 10 rectangle");
        });
        check("largest returns the first on a tie, and null for an empty list", () -> {
            Shape first = new Square(2);
            Shape second = new Rectangle(1, 4);
            yes(Shapes.largest(List.of(first, second)) == first, "on a tie the first shape wins");
            yes(Shapes.largest(List.of()) == null, "expected null for an empty list");
        });
        System.exit(failed == 0 ? 0 : 1);
    }
}
