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
        check("a new account has the owner and a balance of 0", () -> {
            BankAccount a = new BankAccount("Sam");
            eq("Sam", a.getOwner());
            eq(0L, a.getBalance());
        });
        check("deposit and withdraw change the balance", () -> {
            BankAccount a = new BankAccount("Sam");
            a.deposit(100);
            a.withdraw(30);
            eq(70L, a.getBalance());
        });
        check("the whole balance can be withdrawn", () -> {
            BankAccount a = new BankAccount("Sam");
            a.deposit(50);
            a.withdraw(50);
            eq(0L, a.getBalance());
        });
        check("deposit rejects zero and negative amounts", () -> {
            BankAccount a = new BankAccount("Sam");
            throwsType(IllegalArgumentException.class, () -> a.deposit(0));
            throwsType(IllegalArgumentException.class, () -> a.deposit(-5));
            eq(0L, a.getBalance());
        });
        check("withdraw rejects zero and negative amounts", () -> {
            BankAccount a = new BankAccount("Sam");
            a.deposit(10);
            throwsType(IllegalArgumentException.class, () -> a.withdraw(0));
            throwsType(IllegalArgumentException.class, () -> a.withdraw(-1));
            eq(10L, a.getBalance());
        });
        check("withdrawing more than the balance throws IllegalStateException", () -> {
            BankAccount a = new BankAccount("Sam");
            a.deposit(50);
            throwsType(IllegalStateException.class, () -> a.withdraw(51));
            eq(50L, a.getBalance());
        });
        check("two accounts are independent", () -> {
            BankAccount a = new BankAccount("A");
            BankAccount b = new BankAccount("B");
            a.deposit(5);
            eq(0L, b.getBalance());
        });
        check("toString has the form BankAccount(Sam, 70)", () -> {
            BankAccount a = new BankAccount("Sam");
            a.deposit(70);
            eq("BankAccount(Sam, 70)", a.toString());
        });
        check("all fields are private", () -> {
            for (java.lang.reflect.Field f : BankAccount.class.getDeclaredFields()) {
                yes(java.lang.reflect.Modifier.isPrivate(f.getModifiers()), "field " + f.getName() + " is not private");
            }
            yes(BankAccount.class.getDeclaredFields().length >= 2, "expected fields for the owner and the balance");
        });
        System.exit(failed == 0 ? 0 : 1);
    }
}
