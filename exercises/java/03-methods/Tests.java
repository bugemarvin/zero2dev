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
        check("gcd(12, 18) is 6", () -> eq(6, MathUtil.gcd(12, 18)));
        check("gcd(17, 5) is 1", () -> eq(1, MathUtil.gcd(17, 5)));
        check("gcd(7, 0) is 7", () -> eq(7, MathUtil.gcd(7, 0)));
        check("isPrime finds the primes up to 30", () -> {
            List<Integer> primes = new ArrayList<>();
            for (int i = -3; i <= 30; i++) {
                if (MathUtil.isPrime(i)) {
                    primes.add(i);
                }
            }
            eq(List.of(2, 3, 5, 7, 11, 13, 17, 19, 23, 29), primes);
        });
        check("isPrime handles a large prime and a large non-prime", () -> {
            eq(true, MathUtil.isPrime(2147483647));
            eq(false, MathUtil.isPrime(2147483645));
        });
        check("factorial of 0, 1 and 5", () -> {
            eq(1L, MathUtil.factorial(0));
            eq(1L, MathUtil.factorial(1));
            eq(120L, MathUtil.factorial(5));
        });
        check("factorial(20) needs a long", () -> eq(2432902008176640000L, MathUtil.factorial(20)));
        check("sumDigits", () -> {
            eq(6, MathUtil.sumDigits(123));
            eq(0, MathUtil.sumDigits(0));
            eq(9, MathUtil.sumDigits(-405));
            eq(90, MathUtil.sumDigits(9999999999L));
        });
        System.exit(failed == 0 ? 0 : 1);
    }
}
