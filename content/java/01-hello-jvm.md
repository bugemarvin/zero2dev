---
title: Hello, Java
summary: How Java code becomes a running program, and the shape every Java program has.
---

## Compile once, run anywhere

Java sits between C and Python. The compiler, `javac`, translates your source into **bytecode**: instructions for an imaginary machine. A program called the **Java Virtual Machine** (JVM) then runs that bytecode.

```text
Main.java  --javac-->  Main.class  --java-->  runs on the JVM
(source)               (bytecode)
```

The same `.class` file runs on Windows, Linux and macOS, because each has its own JVM. The compiler also checks types strictly, so many mistakes are caught before the program ever runs.

Install it with `./setup/install.sh --stack java`, and check:

```console
$ javac -version
javac 21.0.4
```

## The program

Create `Main.java`:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
```

Compile and run:

```console
$ javac Main.java
$ java Main
Hello, Java!
```

`javac` produces `Main.class`. `java Main` takes the **class name**, with no `.class` and no `.java`.

For a quick single-file program, `java Main.java` compiles and runs in one step.

## What each part means

- **`public class Main`**: all Java code lives inside a class. A public class must be in a file with the same name: `Main` in `Main.java`.
- **`public static void main(String[] args)`**: the method where the program starts. For now, type it as it is. `public` makes it visible from outside the class, `static` means it belongs to the class itself and can run before any object exists, `void` means it returns nothing, and `String[] args` holds the command-line arguments.
- **`System.out.println(...)`**: prints a line. `System.out.print(...)` prints with no newline at the end.
- Statements end with a **semicolon**, and blocks are wrapped in **braces**.

## Names and style

Java has firm conventions, and following them makes your code readable to every Java programmer.

| Thing | Style | Example |
| --- | --- | --- |
| class | capital first letter of each word | `BankAccount` |
| method, variable | lower-case first, then capitals | `getBalance`, `totalPrice` |
| constant | all capitals with underscores | `MAX_SIZE` |

Java is case-sensitive: `Main` and `main` are different names.

## Printing values

```java
int apples = 3;
System.out.println("I have " + apples + " apples");
System.out.printf("%d apples cost %.2f%n", apples, apples * 0.5);
```

`+` joins text and converts other values to text. `printf` formats like C's: `%d` for whole numbers, `%.2f` for two decimals, `%s` for text, and `%n` for a newline.

## Comments

```java
// to the end of the line

/* over
   several lines */
```

## Reading compiler errors

```text
Main.java:3: error: ';' expected
        System.out.println("Hello, Java!")
                                          ^
1 error
```

File, line number, the problem, and a caret under the place. Fix the first error and compile again.

## The exercises in this track

Some exercises are complete programs that read input and print output. Others ask you to write a class, and a test file in the exercise folder calls its methods. Either way:

```console
$ python3 check.py java/01-hello
```

## Common mistakes

- **File name and class name differ.** `public class Main` must be in `Main.java`.
- **Running `java Main.class`.** Give the class name only.
- **Forgetting to recompile** after an edit.
- **`string` with a small s.** The type is `String`.
