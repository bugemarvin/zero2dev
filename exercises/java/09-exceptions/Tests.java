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
        check("InvalidAgeException is a checked exception", () -> {
            yes(Exception.class.isAssignableFrom(InvalidAgeException.class), "it must extend Exception");
            yes(!RuntimeException.class.isAssignableFrom(InvalidAgeException.class),
                "it extends RuntimeException, which makes it unchecked");
        });
        check("parseAge returns valid ages", () -> {
            eq(42, Parser.parseAge("42"));
            eq(7, Parser.parseAge(" 7 "));
            eq(0, Parser.parseAge("0"));
            eq(150, Parser.parseAge("150"));
        });
        check("parseAge rejects text that is not a number", () -> {
            throwsType(InvalidAgeException.class, () -> Parser.parseAge("abc"));
            throwsType(InvalidAgeException.class, () -> Parser.parseAge(""));
            throwsType(InvalidAgeException.class, () -> Parser.parseAge("4.5"));
        });
        check("the message for bad text contains 'not a number'", () -> {
            try {
                Parser.parseAge("abc");
            } catch (Exception e) {
                yes(e instanceof InvalidAgeException, "expected InvalidAgeException but got " + e);
                yes(e.getMessage() != null && e.getMessage().contains("not a number"), "the message was " + e.getMessage());
                return;
            }
            throw new AssertionError("nothing was thrown");
        });
        check("parseAge rejects ages outside 0 to 150", () -> {
            throwsType(InvalidAgeException.class, () -> Parser.parseAge("-1"));
            throwsType(InvalidAgeException.class, () -> Parser.parseAge("151"));
        });
        check("the message for a bad range contains 'out of range'", () -> {
            try {
                Parser.parseAge("200");
            } catch (Exception e) {
                yes(e instanceof InvalidAgeException, "expected InvalidAgeException but got " + e);
                yes(e.getMessage() != null && e.getMessage().contains("out of range"), "the message was " + e.getMessage());
                return;
            }
            throw new AssertionError("nothing was thrown");
        });
        check("sumValid adds the numbers and skips the rest", () -> {
            eq(4, Parser.sumValid(List.of("1", "x", " 3 ", "")));
            eq(0, Parser.sumValid(List.of("a", "b")));
            eq(0, Parser.sumValid(List.of()));
            eq(-5, Parser.sumValid(List.of("-10", "5", "five")));
        });
        System.exit(failed == 0 ? 0 : 1);
    }
}
