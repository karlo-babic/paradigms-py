---
layout: default
title: "2. Declarative Programming"
nav_order: 4
---

# 2. Declarative Programming Techniques

>"The nice thing about declarative programming is that you can write a specification and run it as a program. The nasty thing about declarative programming is that some clear specifications make incredibly bad programs. The hope of declarative programming is that you can move from a specification to a reasonable program without leaving the language."  
>\- The Craft of Prolog, Richard O’Keefe

In the last chapter, we surveyed the landscape of programming paradigms. Our deep dive begins here, with the **declarative model** - the simplest and most predictable of them all.

An operation is **declarative** if it always returns the same result for the same arguments, regardless of when or how many times it is called. Think of it like a mathematical function: `sin(π/2)` is always `1`. Declarative operations are:
-   **Independent:** They don't affect anything outside of themselves (no side effects).
-   **Stateless:** They have no memory of past calls.
-   **Deterministic:** Their output is completely determined by their input.

### Why Start Here?
Declarative programming is the bedrock of many advanced concepts. It is the foundation of functional programming and forms a crucial, manageable subset of almost every other paradigm. Mastering it provides two key advantages:

1.  **Compositionality:** Declarative components are like LEGO bricks. Because they are independent and predictable, you can build them, test them in isolation, and snap them together with confidence, knowing they won't have unexpected side effects on each other.
2.  **Simple Reasoning:** You can reason about declarative programs with simple logic, much like solving an algebraic equation. You can replace a function call with its result without changing the program's meaning, a property called **referential transparency**.

Of course, not all problems are a natural fit for a purely declarative solution. But by making as many components of our programs as possible declarative, we isolate complexity and make our systems easier to build, test, and maintain.

In this chapter, we will explore the core techniques for writing practical declarative programs in Python. We will start with recursion as our fundamental tool for control flow, learn to work with immutable data structures, abstract our patterns with higher-order functions and comprehensions, and finally, package our logic into formal Abstract Data Types.

## Table of contents
- **Topic 1: Recursion**
  - [1. Thinking Recursively](#thinking-recursively)
  - [2. The Accumulator Pattern](#the-accumulator-pattern)
  - [3. Abstracting Control Flow](#abstracting-control-flow)
- **Topic 2: Immutable Data**
  - [4. The Principle of Immutability](#the-principle-of-immutability)
  - [5. Processing Immutable Data](#processing-immutable-data)
- **Topic 3: Higher-Order Abstractions**
  - [6. Functions as Arguments](#functions-as-arguments)
  - [7. Comprehensions and Generators](#comprehensions-and-generators)
  - [8. Building Lazy Pipelines](#building-lazy-pipelines)
- **Topic 4: Encapsulated Components**
  - [9. Declarative Abstract Data Types](#declarative-abstract-data-types)

---

**Topic 1: Recursion**

## 1. Thinking Recursively

In the imperative programming you may be used to, repetition is handled by `for` and `while` loops. These constructs explicitly describe the step-by-step mechanics of an action: initialize a counter, check a condition, increment the counter, and repeat.

In the declarative world, we strive to avoid describing step-by-step mechanics. Our primary tool for repetition is **recursion**: the process of a function calling itself to solve a problem. A recursive function breaks a problem down into a smaller, simpler version of itself, until it reaches a point where the answer is so simple it can be stated directly.

Every recursive function is built from two essential parts:

1.  **The Base Case:** This is the simplest possible version of the problem, where the answer is known without further calculation. The base case acts as the "emergency brake" that stops the recursion.
2.  **The Recursive Step:** This is where the function calls itself, but with a modified input that brings it one step closer to the base case. It defines the solution to a problem in terms of the solution to a smaller version of the same problem.

### A First Example: Factorial

The factorial function is a classic example. Its mathematical definition is naturally recursive:
-   **Base Case:** `0! = 1`
-   **Recursive Step:** `n! = n * (n - 1)!` for `n > 0`

We can translate this directly into a Python function:

```python
def factorial(n: int) -> int:
    """Calculates the factorial of a non-negative integer using recursion."""
    # Base Case: The simplest problem we can solve directly.
    if n == 0:
        return 1
    # Recursive Step: Solve a bigger problem using the solution to a smaller one.
    else:
        return n * factorial(n - 1)

print(factorial(5)) # Output: 120
```

> **Tool Tip: Enabling Type Checking in VS Code**
>
> You can get your editor to check these types for you and highlight potential errors before you even run your code! This is one of the biggest benefits of using type hints.
>
> To enable basic type checking in Visual Studio Code:
>
> 1.  Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
> 2.  Search for and select **"Preferences: Open User Settings (JSON)"**.
> 3.  Add the following line to your `settings.json` file:
>
>     ```json
>     "python.analysis.typeCheckingMode": "basic"
>     ```
>
> Now, VS Code will underline code where the types don't match, such as if you tried to call `factorial("hello")`. This immediate feedback is a powerful tool for writing correct code.

### Recursion on Data Structures

Recursion is even more powerful when applied to data structures like sequences. Let's write a function to sum all the numbers in a tuple. We can define the problem recursively:

-   **Base Case:** The sum of an empty tuple is `0`.
-   **Recursive Step:** The sum of a non-empty tuple is its first element (the "head") plus the sum of the rest of the elements (the "tail").

#### Declarative Deconstruction with `match`

To implement this, we need a way to deconstruct a tuple into its head and tail. While we could use manual slicing (`head = t[0]`, `tail = t[1:]`), Python's `match` statement (from Chapter 1) provides a much more declarative way to do this. It lets us describe the *structure* of the data we're interested in.

```python
from typing import Tuple

def sum_tuple(numbers: Tuple[int, ...]) -> int:
    """Calculates the sum of numbers in a tuple using recursion and pattern matching."""
    match numbers:
        # Base Case: Matches an empty tuple.
        case ():
            return 0
        # Recursive Step: Matches a tuple with a head and a tail.
        # The `*tail` syntax captures all remaining elements into a list.
        case (head, *tail):
            # We call the function again on the smaller tail part.
            # `tail` is a list, so we convert it back to a tuple.
            return head + sum_tuple(tuple(tail))

my_numbers = (1, 2, 3, 4, 5)
print(sum_tuple(my_numbers)) # Output: 15
print(sum_tuple(()))         # Output: 0
```
This pattern - a base case for an empty structure and a recursive step that processes the head and recurses on the tail - is the fundamental building block for nearly all declarative data processing.

> **Understanding the Type Hint: `Tuple[int, ...]`**
>
> -   **`Tuple`**: This tells the type checker that we are expecting a Python `tuple`. We import it from the `typing` module.
> -   **`[...]`**: The square brackets are used to specify what's *inside* the tuple.
> -   **`int`**: This indicates that the elements inside the tuple should be integers.
> -   **`,`**: The comma separates the types of the elements.
> -   **`...`**: This is a special symbol called an **ellipsis**. In this context, it means "and then any number of more elements of the same type."
>
> So, `Tuple[int, ...]` reads as: **"a tuple containing an indeterminate number of integers."**
>
> This is different from a hint like `Tuple[int, str, bool]`, which means "a tuple containing *exactly three* elements: an integer, then a string, and finally a boolean." For functions that process sequences of any length, the ellipsis is the tool we need.

#### Exercise: Product of a Tuple
- Write a recursive function `product_tuple(numbers: Tuple[int, ...]) -> int` that calculates the product of all numbers in a tuple.
- Use a `match` statement.
- Think carefully: what should the base case be for multiplication?

---

## 2. The Accumulator Pattern

Our first recursive functions, like `factorial`, work by building up a chain of operations that are only resolved at the very end. When you call `factorial(5)`, the calculation looks like this:

```
factorial(5)
 -> 5 * factorial(4)
 -> 5 * (4 * factorial(3))
 -> 5 * (4 * (3 * factorial(2)))
 -> 5 * (4 * (3 * (2 * factorial(1))))
 -> 5 * (4 * (3 * (2 * (1 * factorial(0)))))
 -> 5 * (4 * (3 * (2 * (1 * 1))))
 -> ... (and now the multiplications can finally happen)
```
Notice how the multiplication (`*`) happens *after* the recursive call returns. This means the computer has to keep track of all those pending operations, which can use up a lot of memory on the "call stack." For very deep recursion (e.g., `factorial(3000)`), this can cause a "stack overflow" error.

The **accumulator pattern** is a technique for rewriting recursion to avoid this problem. The core idea is to pass an extra argument to the function - the **accumulator** - which holds the intermediate result of the computation at each step.

### Rewriting Factorial with an Accumulator

Instead of calculating `5 * 4 * 3 * 2 * 1`, we'll calculate `((((1 * 5) * 4) * 3) * 2) * 1`. The result is the same, but we can compute it step-by-step without building up pending operations.

```python
def factorial_acc(n: int, accumulator: int = 1) -> int:
    """
    Calculates factorial using the accumulator pattern.
    The accumulator holds the product calculated so far.
    """
    # Base Case: When n is 0, the calculation is done.
    # The final answer is the value in the accumulator.
    if n == 0:
        return accumulator
    # Recursive Step: Call the function with the smaller problem (n-1),
    # but update the accumulator with the result of this step's work.
    else:
        return factorial_acc(n - 1, accumulator * n)

print(factorial_acc(5)) # Output: 120
```

Let's trace `factorial_acc(3, 1)` to see how it works:
1.  `factorial_acc(3, 1)` -> calls `factorial_acc(2, 1 * 3)`
2.  `factorial_acc(2, 3)` -> calls `factorial_acc(1, 3 * 2)`
3.  `factorial_acc(1, 6)` -> calls `factorial_acc(0, 6 * 1)`
4.  `factorial_acc(0, 6)` -> `n` is 0, so it hits the base case and returns the final accumulator value: `6`.

The work is done on the way "down" into the recursion, not on the way "back up." This form of recursion is often called **tail recursion** because the recursive call is the very last thing the function does.

### The Connection to Iteration

The accumulator pattern might look familiar. Let's compare the state of the variables (`n` and `accumulator`) in our recursive function to the state of variables in a standard `for` loop.

| Recursive Call             | Iterative Loop (`for n in range(5, 0, -1)`) |
| -------------------------- | ------------------------------------------- |
| `factorial_acc(5, 1)`      | `n=5`, `acc=1`                              |
| `factorial_acc(4, 5)`      | `n=4`, `acc=5`                              |
| `factorial_acc(3, 20)`     | `n=3`, `acc=20`                             |
| `factorial_acc(2, 60)`     | `n=2`, `acc=60`                             |
| `factorial_acc(1, 120)`    | `n=1`, `acc=120`                            |
| `factorial_acc(0, 120)` -> returns `120` | Loop finishes, returns `120`              |

They are conceptually identical. The accumulator pattern is the declarative way to think about the state that is managed by an imperative loop.

> **A Note on Python's Implementation**
>
> While the accumulator pattern is a crucial concept, it's important to know that Python does **not** optimize for tail recursion. This means that even a tail-recursive function like `factorial_acc` will still consume stack space and can cause a stack overflow for very large `n`.
>
> So why learn it? Because it's a fundamental pattern in declarative and functional programming. It teaches you to think about state in a disciplined, stateless way. In practical Python, if you see a problem that fits the accumulator pattern, the most direct and efficient implementation is usually a simple `for` or `while` loop.

#### Exercise: Reversing a Tuple
- Write a recursive function `reverse_tuple(a_tuple: Tuple, acc: Tuple = ()) -> Tuple` that reverses a tuple.
- Use the accumulator pattern. The accumulator should build up the reversed tuple.
- Use the `match` statement to deconstruct `a_tuple`.
- For example, `reverse_tuple((1, 2, 3))` should return `(3, 2, 1)`.

<details>
<summary>Hint</summary>
In each recursive step, you will take the `head` of the input tuple and prepend it to the `acc` tuple. The new accumulator will be `(head,) + acc`.
</details>

---

## To be continued...