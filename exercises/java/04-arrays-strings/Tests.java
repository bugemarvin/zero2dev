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
        check("isPalindrome on simple words", () -> {
            eq(true, TextUtil.isPalindrome("level"));
            eq(false, TextUtil.isPalindrome("lever"));
            eq(true, TextUtil.isPalindrome(""));
            eq(true, TextUtil.isPalindrome("x"));
        });
        check("isPalindrome ignores case and punctuation", () -> {
            eq(true, TextUtil.isPalindrome("A man, a plan, a canal: Panama"));
            eq(true, TextUtil.isPalindrome("No 'x' in Nixon"));
            eq(false, TextUtil.isPalindrome("Not a palindrome!"));
            eq(true, TextUtil.isPalindrome("12 3 21"));
        });
        check("countVowels", () -> {
            eq(2, TextUtil.countVowels("hello"));
            eq(5, TextUtil.countVowels("AEIOU"));
            eq(0, TextUtil.countVowels("rhythm"));
            eq(0, TextUtil.countVowels(""));
        });
        check("capitalize", () -> {
            eq("Hello Big World", TextUtil.capitalize("hello big world"));
            eq("Java", TextUtil.capitalize("java"));
            eq("Already Done", TextUtil.capitalize("Already Done"));
            eq("A B C", TextUtil.capitalize("a b c"));
            eq("", TextUtil.capitalize(""));
        });
        check("rotate moves elements to the right", () -> {
            eq("[4, 5, 1, 2, 3]", Arrays.toString(TextUtil.rotate(new int[] {1, 2, 3, 4, 5}, 2)));
            eq("[1, 2, 3]", Arrays.toString(TextUtil.rotate(new int[] {1, 2, 3}, 0)));
            eq("[7]", Arrays.toString(TextUtil.rotate(new int[] {7}, 5)));
        });
        check("rotate works when k is larger than the length", () -> {
            eq("[3, 1, 2]", Arrays.toString(TextUtil.rotate(new int[] {1, 2, 3}, 4)));
            eq("[1, 2, 3]", Arrays.toString(TextUtil.rotate(new int[] {1, 2, 3}, 3)));
        });
        check("rotate returns a new array and leaves the original alone", () -> {
            int[] original = {1, 2, 3, 4};
            int[] rotated = TextUtil.rotate(original, 1);
            yes(rotated != original, "rotate returned the same array object");
            eq("[1, 2, 3, 4]", Arrays.toString(original));
        });
        System.exit(failed == 0 ? 0 : 1);
    }
}
