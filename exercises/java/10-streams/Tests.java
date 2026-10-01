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
        check("longNames filters, upper-cases and sorts", () -> {
            eq(List.of("GRACE", "LINUS"), Stats.longNames(List.of("ada", "linus", "grace", "bob"), 5));
            eq(List.of("ADA", "BOB"), Stats.longNames(List.of("bob", "ada"), 3));
            eq(List.of(), Stats.longNames(List.of("a", "bb"), 3));
        });
        check("sumOfEvenSquares", () -> {
            eq(20, Stats.sumOfEvenSquares(List.of(1, 2, 3, 4)));
            eq(0, Stats.sumOfEvenSquares(List.of(1, 3, 5)));
            eq(0, Stats.sumOfEvenSquares(List.of()));
            eq(40, Stats.sumOfEvenSquares(List.of(-2, -6)));
        });
        check("countByFirstLetter", () -> {
            Map<Character, Long> got = Stats.countByFirstLetter(List.of("apple", "Avocado", "banana", "", "blueberry", "cherry"));
            eq(Map.of('a', 2L, 'b', 2L, 'c', 1L), got);
            eq(Map.of(), Stats.countByFirstLetter(List.of()));
        });
        check("longest returns the longest word", () -> {
            eq(Optional.of("ccc"), Stats.longest(List.of("a", "ccc", "bb")));
            eq(Optional.of("solo"), Stats.longest(List.of("solo")));
        });
        check("longest returns the first on a tie, and empty for an empty list", () -> {
            eq(Optional.of("one"), Stats.longest(List.of("one", "two", "six")));
            eq(Optional.empty(), Stats.longest(List.of()));
        });
        check("countNonBlankLines", () -> {
            java.nio.file.Path file = java.nio.file.Files.createTempFile("z2d", ".txt");
            try {
                java.nio.file.Files.writeString(file, "one\n\n   \ntwo\n\tthree\n");
                eq(3L, Stats.countNonBlankLines(file));
                java.nio.file.Files.writeString(file, "");
                eq(0L, Stats.countNonBlankLines(file));
            } finally {
                java.nio.file.Files.delete(file);
            }
        });
        System.exit(failed == 0 ? 0 : 1);
    }
}
