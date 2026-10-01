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
        check("a new stack is empty", () -> {
            ArrayStack<String> s = new ArrayStack<>();
            eq(true, s.isEmpty());
            eq(0, s.size());
        });
        check("pop returns items in reverse order", () -> {
            ArrayStack<String> s = new ArrayStack<>();
            s.push("a");
            s.push("b");
            s.push("c");
            eq(3, s.size());
            eq("c", s.pop());
            eq("b", s.pop());
            eq("a", s.pop());
            eq(true, s.isEmpty());
        });
        check("peek does not remove", () -> {
            ArrayStack<Integer> s = new ArrayStack<>();
            s.push(1);
            s.push(2);
            eq(2, s.peek());
            eq(2, s.peek());
            eq(2, s.size());
        });
        check("pop and peek on an empty stack throw NoSuchElementException", () -> {
            ArrayStack<Integer> s = new ArrayStack<>();
            throwsType(NoSuchElementException.class, () -> s.pop());
            throwsType(NoSuchElementException.class, () -> s.peek());
            s.push(1);
            s.pop();
            throwsType(NoSuchElementException.class, () -> s.pop());
        });
        check("two stacks do not share their items", () -> {
            ArrayStack<Integer> a = new ArrayStack<>();
            ArrayStack<Integer> b = new ArrayStack<>();
            a.push(1);
            eq(true, b.isEmpty());
        });
        check("the stack works with many items", () -> {
            ArrayStack<Integer> s = new ArrayStack<>();
            for (int i = 0; i < 1000; i++) {
                s.push(i);
            }
            eq(1000, s.size());
            eq(999, s.pop());
        });
        check("Util.max of integers", () -> {
            eq(9, Util.max(List.of(3, 9, 4)));
            eq(-1, Util.max(List.of(-5, -1, -3)));
            eq(7, Util.max(List.of(7)));
        });
        check("Util.max of strings and doubles", () -> {
            eq("pear", Util.max(List.of("pear", "apple", "fig")));
            eq(2.5, Util.max(List.of(1.5, 2.5, 0.5)));
        });
        check("Util.max of an empty list throws IllegalArgumentException", () ->
            throwsType(IllegalArgumentException.class, () -> Util.max(new ArrayList<Integer>())));
        System.exit(failed == 0 ? 0 : 1);
    }
}
