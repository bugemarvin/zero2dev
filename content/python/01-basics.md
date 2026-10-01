---
title: Python basics
summary: Values, variables, text, decisions, and your first functions.
---

## Running Python

Python is interpreted: there is no compile step. Try things live in the interactive prompt:

```console
$ python3
>>> 2 + 3
5
>>> exit()
```

Or put code in a file and run it:

```console
$ python3 hello.py
```

## Variables and types

A variable is created by assigning to it. You do not declare its type. Python works it out from the value.

```python
age = 30              # int: whole number
price = 4.75          # float: number with a fraction
name = "Sam"          # str: text
is_member = True      # bool: True or False
nothing = None        # the "no value" value
```

`type(x)` tells you what a value is. Convert between types with `int("42")`, `float("3.5")` and `str(42)`.

## Numbers

```python
7 + 2     # 9
7 / 2     # 3.5   division always gives a float
7 // 2    # 3     whole-number division
7 % 2     # 1     remainder
2 ** 10   # 1024  power
```

Whole numbers in Python have no size limit. They grow as large as needed.

## Text

Strings use single or double quotes. An **f-string** places values inside text:

```python
name = "Sam"
age = 30
print(f"{name} is {age} years old")     # Sam is 30 years old
print(f"Total: {4.756:.2f}")            # Total: 4.76
```

Useful string tools:

```python
s = "Hello, World"
len(s)               # 12
s.lower()            # 'hello, world'
s.upper()            # 'HELLO, WORLD'
s.replace("l", "L")  # 'HeLLo, WorLd'
"World" in s         # True
s[0]                 # 'H'    first character
s[-1]                # 'd'    last character
"a,b,c".split(",")   # ['a', 'b', 'c']
"  hi  ".strip()     # 'hi'
```

Strings cannot be changed in place. Every method returns a **new** string.

## Decisions

Python uses **indentation** to mark blocks. There are no braces. The standard is four spaces, and the colon at the end of the line is required.

```python
if score >= 90:
    grade = "A"
elif score >= 50:
    grade = "pass"
else:
    grade = "fail"
```

| Operator | Meaning |
| --- | --- |
| `==` `!=` | equal, not equal |
| `<` `<=` `>` `>=` | comparisons |
| `and` `or` `not` | combine conditions |
| `in` | is this inside that? |

Comparisons can be chained: `0 <= x < 10`.

Empty things count as false: `0`, `""`, `[]`, `None`. Everything else counts as true. So `if name:` means "if the name is not empty".

## Functions

A function is a named block of code with inputs and a result:

```python
def area(width, height):
    return width * height

print(area(3, 4))    # 12
```

- `def` starts the definition.
- `width` and `height` are the **parameters**.
- `return` hands the result back to whoever called the function.

The exercises in this track ask you to write functions. The checker calls them with different arguments and compares what they **return** with the expected value.

> **Warning:** `print` shows a value on the screen. `return` gives a value back to the caller. A function that prints its answer and returns nothing hands back `None`, and the test fails.

## Input and output

```python
name = input("Your name: ")     # always gives a string
age = int(input("Your age: "))  # convert when you need a number
print("Hello,", name)
```

## Common mistakes

- **Mixed or wrong indentation.** `IndentationError` means the spaces at the start of a line do not line up.
- **Forgetting the colon** after `if`, `else`, `def`, `for`, `while`.
- **`=` and `==`.** One assigns, the other compares.
- **Adding text and numbers.** `"Age: " + 30` is an error. Use an f-string.
- **Printing when the task says return.**
