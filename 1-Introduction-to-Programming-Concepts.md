---
layout: default
title: 1. Intro to Programming Concepts
nav_order: 3
---

# 1. Introduction to Programming Concepts

>"In reality, programming languages are how programmers express and communicate ideas — and the audience for those ideas is other programmers, not computers. The reason: the computer can take care of itself, but programmers are always working with other programmers, and poorly communicated ideas can cause expensive flops."  
>\- Guido van Rossum, creator of Python

- In this chapter, you will get introduced to the most important concepts in programming.
    - Later chapters will give a deeper understanding of these concepts (and add other concepts).

## 1. Calculator
One of the simplest and most immediate things a programming environment can do is perform calculations. This is a great way to verify your setup and get a feel for the language's syntax.

- In Python, the interactive interpreter (also called a REPL: Read-Eval-Print Loop) is the perfect tool for this. Start it by typing `python3` or `python` in your terminal. You'll see a `>>>` prompt.
- At the prompt, type:
    ```python
    >>> 9999 * 9999
    ```
- Result:
    ```
    99980001
    ```
- Info:
    - The Python interpreter reads your line of code, evaluates the expression, and prints the result.
    - This immediate feedback loop is a powerful tool for learning and experimenting.
    - In a script file (e.g., `myscript.py`), you would use the `print()` function to display output: `print(9999 * 9999)`.

## 2. Variables
Variables are names used to store and refer to values. Using variables allows us to break down complex calculations into simpler steps and reuse results.

### Conceptual Model: Single-Assignment Variables (Oz)

In some programming models, a variable is like a mathematical constant: once you give it a value, it never changes. This is known as **single assignment** or immutable binding.

- The Oz language enforces this. The `declare` statement creates a new variable and binds it to a value.
    ```oz
    declare
    V = 9999 * 9999
    {Browse V*V}
    ```
- **Info:**
    - In this model, variables are short-cuts for values, they cannot be assigned more than once. This can prevent certain types of bugs where a variable is changed unexpectedly.

### Python Implementation: Mutable Variables

In Python (and most mainstream languages), variables are **mutable**. A variable name is a label that points to a value, and you can move that label to point to a different value at any time.

- Declare and use a variable in Python:
    ```python
    v = 9999 * 9999
    print(v * v)
    ```
- Result: `9996000599960001`
- **Info:**
    - Python variables are created with a simple assignment (`=`).
    - Unlike the Oz model, you can re-assign a Python variable to a new value:
        ```python
        v = 100  # v now points to 100
        v = "hello" # It can even point to a different type
        ```
    - By convention, programmers use `UPPERCASE_SNAKE_CASE` for variables they intend to be constants, even though the language doesn't enforce it: `MY_CONSTANT = 9999`.

### Thought Experiment: The Limits of Variables

Now, consider the problem of calculating 100 factorial (written as 100!), which is the product of all positive integers up to 100 (`1 * 2 * 3 * ... * 100`).

With only the concepts we've introduced so far (calculation and variables), could you write a program for this without manually typing out all 100 numbers? This need for repetition and abstraction leads us directly to our next, and most powerful, concept: **functions**.

## 3. Functions

Functions are the primary tool for creating abstractions in programming. They allow us to package a computation, give it a name, and reuse it with different inputs (arguments). This solves the problem of repetition we identified in the previous section.

### Factorial

The factorial of a non-negative integer `n`, denoted `n!`, is the product of all positive integers less than or equal to `n`. Its formal definition is recursive:

<p align="center"><img src="https://raw.githubusercontent.com/karlo-babic/paradigms/main/img/formulas/factorial_recursive.png"></p>

- Factorial of 10: `1*2*3*4*5*6*7*8*9*10` results in `3628800`.
- We can implement this definition directly using a function that calls itself. This is called **recursion**.

#### Conceptual Model: Recursive Definition (Oz)

- The Oz implementation mirrors the mathematical definition closely using an `if/else` expression.

    ```oz
    declare
    fun {Fact N}
        if N==0 then
            1
        else
            N*{Fact N-1}
        end
    end
    ```

#### Python Implementation

- Python's syntax is very similar. We use the `def` keyword to define a function and `return` to specify its output.

    ```python
    def fact(n):
        if n == 0:
            return 1
        else:
            return n * fact(n - 1)
    ```
- Calling the function:
    ```python
    print(fact(10))
    ```
- Result: `3628800`

- Python has built-in support for arbitrarily large integers, so we can easily compute `fact(100)`:
    ```python
    print(fact(100))
    ```
- Result: `933262154439441526816992388562667004907159682643816214685929638952175999932299156089414639761565182862536979208272237582511852109168640000000000000000000000000`

#### Checkpoint
<details>
<summary>In the recursive `fact(n)` function, what is the base case and what is the recursive step?</summary>

- **Base Case:** `if n == 0: return 1`. This is the condition that stops the recursion.
- **Recursive Step:** `return n * fact(n - 1)`. This is where the function calls itself with a smaller version of the problem.

</details>

#### Exercise: The Fibonacci Sequence
The Fibonacci sequence is another famous mathematical sequence defined recursively: `F(n) = F(n-1) + F(n-2)`, with the base cases `F(0) = 0` and `F(1) = 1`.

- Write a Python function `fib(n)` that calculates the nth Fibonacci number.
<details>
<summary>Hint</summary>

You will need two base cases in your `if/elif/else` structure.

</details>

### Combinations

We can build more complex functions by composing simpler ones. This is known as **functional abstraction**. For example, the "combination" formula, which calculates how many ways you can choose `r` items from a set of `n` items, is defined using factorials:

<p align="center"><img src="https://raw.githubusercontent.com/karlo-babic/paradigms/main/img/formulas/combination.png"></p>

#### Oz Definition

```oz
declare
fun {Comb N R}
    {Fact N} div ({Fact R}*{Fact N-R})
end
```

#### Python Implementation

- We can define a `comb` function that calls our existing `fact` function.
- Note: The result of a combination is always an integer, so we use integer division (`//` in Python) instead of floating-point division (`/`).

    ```python
    def comb(n, r):
        return fact(n) // (fact(r) * fact(n - r))
    ```
- Calling the function:
    ```python
    print(comb(10, 3))
    ```
- Result: `120`

#### Exercise: Permutations
The formula for permutations, which calculates the number of ways to order `r` items from a set of `n`, is `P(n, r) = n! / (n-r)!`.

- Using **functional abstraction**, write a Python function `perm(n, r)` that uses your existing `fact` function to calculate permutations.

## 4. Lists

A list is an ordered sequence of elements. In Python, lists are a versatile, built-in data type that can hold elements of any type.

- A list literal is created with square brackets:
    ```python
    my_list = [5, 6, 7, 8]
    print(my_list)
    ```

### The Head and Tail Model

While Python's lists are technically implemented as dynamic arrays, it is extremely useful for many algorithms to think of them recursively, as a pair of two things:
- **Head:** The first element of the list.
- **Tail:** A list containing all the *other* elements.

This "Head/Tail" structure is the fundamental building block of lists in many functional programming languages.

#### Conceptual Model: The "Cons" Cell (Oz)
- In Oz (and languages like Lisp), a list is explicitly a chain of links. Each link, often called a [cons cell](https://en.wikipedia.org/wiki/Cons), contains two things: a value (the head) and a reference to the rest of the chain (the tail). The chain ends with a special `nil` value.
- `[6 7]` is represented as `6 -> 7 -> nil`.
- The `H|T` syntax (pronounced "H-bar-T") is used to construct a list from a head `H` and a tail `T`.
    ```oz
    declare
    H = 5
    T = [6 7 8]
    {Browse H|T}
    ```
- Result: `[5 6 7 8]`

### Deconstructing and Reconstructing Lists in Python

To work with lists recursively, we need ways to get their constituent parts (like the head and tail) and put them back together.

#### Using Indexing and Slicing
- The most common way to deconstruct a list is to use indexing for single elements and slicing for sub-lists.
    ```python
    L = [5, 6, 7, 8]
    head = L[0]
    tail = L[1:] # A slice from index 1 to the end

    print(f"Head: {head}")
    print(f"Tail: {tail}")
    ```
- The simplest way to reconstruct a list is with list concatenation (`+`):
    ```python
    new_list = [head] + tail
    print(new_list) # Output: [5, 6, 7, 8]
    ```

### Pattern Matching

Manually checking list length and slicing can be clumsy. A more elegant and powerful technique is **pattern matching**, which lets us declaratively deconstruct a data structure.

#### Conceptual Model: `case` in Oz
- Oz uses the `case` statement to match a list against the `H|T` pattern, automatically binding the head to `H` and the tail to `T`.
    ```oz
    declare
    L = [5 6 7 8]
    case L of H|T then
        {Browse H} {Browse T}
    end
    ```
- Result: `5` and `[6 7 8]`

#### Python Implementation: `match` statement
- As of Python 3.10, Python has a powerful `match` statement that brings this declarative style directly into the language.
- We can match a list against various patterns. The `*` syntax is used to capture multiple items into a new list.

    ```python
    L = [5, 6, 7, 8]
    match L:
        case []: # Matches an empty list
            print("The list is empty.")
        case [element]: # Matches a list with exactly one element
            print(f"The list has one element: {element}")
        case [head, *tail]: # Matches a list with at least one element
            print(f"Head: {head}")
            print(f"Tail: {tail}")
    ```
- **Info:**
    - The `match` statement is the recommended way to deconstruct data structures in modern Python. It is less error-prone and more readable than manual indexing and slicing.
    - Before Python 3.10, a similar effect could be achieved with "extended unpacking": `head, *tail = L`, but this required a separate check for the empty list case.

#### Exercise: Swap First and Last
- Write a Python function `swap_first_last(a_list)` that takes a list and returns a new list where the first and last elements have been swapped.
- Handle the edge cases: what should happen if the list is empty or has only one element? (It should return the list unchanged).
<details>
<summary>Hint</summary>

For a list with two or more elements, you can deconstruct it into three parts: the first element, the middle elements, and the last element. Then, reconstruct it in a new order. The `match [first, *middle, last]:` pattern is perfect for this.

</details>

## 5. Functions over Lists

Now that we have functions and a way to think about lists recursively (as a head and a tail), we can write functions that process lists. The structure of these functions will often mirror the recursive structure of the list itself.

A typical recursive function over a list has two main parts:
1.  **Base Case:** What to do when the list is empty (or has some other simple form). This stops the recursion.
2.  **Recursive Step:** How to process the head of the list, and then call the function again on the tail of the list.

### Example: Pascal's Triangle

Pascal's triangle is a famous number pattern where each number is the sum of the two numbers directly above it.

```
      1
     1 1
    1 2 1
   1 3 3 1
  1 4 6 4 1
```

We can define a function, `pascal(n)`, which calculates the *n*th row of the triangle. The key insight is that we can calculate any row from the row above it. For example, to get the fifth row (`[1 4 6 4 1]`) from the fourth (`[1 3 3 1]`):

1.  Pad the fourth row with a zero on the left and right.
    - `[1 3 3 1 0]` (Shifted left)
    - `[0 1 3 3 1]` (Shifted right)
2.  Sum the two padded lists element by element.
    - `[1+0, 3+1, 3+3, 1+3, 0+1] = [1 4 6 4 1]`

This gives us a clear algorithm that we can implement with several helper functions.

#### Python Implementation

This problem is a great example of **top-down design**: we'll write the main `pascal` function first, assuming our helper functions exist, and then we'll implement the helpers.

```python
def pascal(n):
    """Calculates the nth row of Pascal's triangle (1-indexed)."""
    # Base Case
    if n == 1:
        return [1]
    # Recursive Step
    else:
        previous_row = pascal(n - 1)
        # Assumes helper functions exist
        shifted_left = shift_left(previous_row)
        shifted_right = shift_right(previous_row)
        return add_lists(shifted_left, shifted_right)

def shift_left(a_list):
    """Pads a list with a 0 on the right."""
    return a_list + [0]

def shift_right(a_list):
    """Pads a list with a 0 on the left."""
    return [0] + a_list

def add_lists(list1, list2):
    """Adds two lists element-wise."""
    # We can use a list comprehension with zip to do this concisely
    return [x + y for x, y in zip(list1, list2)]

# Execute and see the result
print(pascal(5))
# Result: [1, 4, 6, 4, 1]

print(pascal(20))
# Result: [1, 19, 171, 969, 3876, 11628, 27132, 50388, 75582, 92378, 92378, 75582, 50388, 27132, 11628, 3876, 969, 171, 19, 1]
```

- **Info:**
    - The `pascal` function's structure is purely recursive. It defines the solution for `n` in terms of the solution for `n-1`.
    - The `zip` function is a powerful Python tool that pairs up elements from multiple iterables. It stops when the shortest iterable is exhausted.

#### Exercise: Recursive List Sum
- Write a recursive function `sum_list(numbers)` that takes a list of numbers and returns their sum.
- Follow the recursive pattern:
    - **Base Case:** The sum of an empty list is 0.
    - **Recursive Step:** The sum of a non-empty list is its `head` plus the sum of its `tail`.
- Use a `match` statement (or slicing) to deconstruct the list.

<details>
<summary>Solution Outline</summary>

```python
def sum_list(numbers):
    match numbers:
        case []:
            return 0
        case [head, *tail]:
            return head + sum_list(tail)
```

</details>

## 6. Complexity

If you try running `pascal(30)`, you might notice it takes a surprisingly long time to complete. This reveals a serious performance issue with our current recursive implementation. The field of computer science that studies the performance of algorithms is called **complexity analysis**.

### The Problem: Redundant Computations

Let's look at a slightly rewritten, but functionally identical, version of our `pascal` function to make the problem obvious.

```python
# A deliberately inefficient version to demonstrate the complexity issue
def slow_pascal(n):
    if n == 1:
        return [1]
    else:
        # We call slow_pascal(n-1) TWICE, once for each helper.
        return add_lists(
            shift_left(slow_pascal(n - 1)),
            shift_right(slow_pascal(n - 1))
        )
```

- **Why is this slow?**
    <details>
    <summary>Answer</summary>
    
    Calling `slow_pascal(n)` results in **two** separate calls to `slow_pascal(n-1)`. Each of those calls results in two calls to `slow_pascal(n-2)`, and so on. The number of calls grows exponentially.

    A single call to `slow_pascal(30)` will end up calling `slow_pascal(1)` over 500 million times (2<sup>29</sup> times, to be exact).
        
    </details>

### The Solution: Store and Reuse

The solution is simple: we must avoid re-computing `slow_pascal(n-1)`. We can do this by calling it just once, storing its result in a local variable, and then reusing that variable.

This is, in fact, the version we wrote in the previous section. Let's rename it to `fast_pascal` for clarity.

```python
def fast_pascal(n):
    if n == 1:
        return [1]
    else:
        # Call the function just ONCE and store the result.
        previous_row = fast_pascal(n - 1)
        return add_lists(
            shift_left(previous_row),
            shift_right(previous_row)
        )
```

- **Info:**
    - By introducing the `previous_row` variable, we ensure the recursive call for each `n` happens only once.
    - This small change has a massive impact on performance.

### Time Complexity

**Time complexity** is a way to describe how the runtime of an algorithm grows as the size of the input grows.

- What is the time complexity of `slow_pascal(n)` and `fast_pascal(n)`?
    <details>
    <summary>Answer</summary>
    
    - `slow_pascal(n)`: The number of calls roughly doubles for each increment of `n`. This is **exponential time**, often written as O(2<sup>n</sup>).
    - `fast_pascal(n)`: The function is called `n` times. In each call, we do work proportional to the length of the row, which is also `n`. This is **polynomial time**, roughly O(n<sup>2</sup>).

    </details>

Exponential time algorithms are generally considered impractical for anything but small inputs.

#### Exercise 1: See the Difference
- Use Python's built-in `time` module to measure and compare the execution time of `slow_pascal(n)` and `fast_pascal(n)` for `n=20`. Then try `n=30`. What do you observe?

```python
import time

# Example usage of the time module
start_time = time.time()
result = fast_pascal(30) # or slow_pascal(30)
end_time = time.time()

print(f"Calculation took {end_time - start_time:.4f} seconds.")
```

#### Exercise 2: Memoizing Fibonacci
- The recursive `fib(n)` function you wrote in the previous section also suffers from exponential time complexity.
- Create a more efficient version called `fast_fib(n)`.
- A common technique for this is **memoization**: using a dictionary (or "cache") to store results that have already been computed.

<details>
<summary>Hint</summary>

Create a dictionary `memo = {}` outside the function. Inside the function, before you compute `fib(n)`, check if `n` is already a key in `memo`. If it is, return the stored value immediately. If not, compute the result, store it in `memo`, and then return it.

</details>

## 7. Lazy Evaluation

Up until now, every function call we've made has been executed immediately. When we call `fast_pascal(30)`, the entire computation for all 30 rows happens before the result is returned. This is known as **eager evaluation**.

An alternative strategy is **lazy evaluation**: a calculation is deferred and only performed when its result is actually needed. This allows us to work with concepts like potentially infinite data structures without running out of memory or getting stuck in an infinite loop.

In Python, the primary tool for lazy evaluation is the **generator**.

### Generators and the `yield` Keyword

A generator is a special kind of function that, instead of `return`ing a single value, can `yield` a sequence of values one at a time. When a generator function is called, it doesn't run. It returns a *generator object*, which is an iterator that knows how to produce the values on demand.

- An example generator that can produce a list of integers from `N` to infinity:
    ```python
    def lazy_ints_from(n):
        """A generator that yields integers starting from n, forever."""
        current = n
        while True:
            yield current
            current += 1
    ```
- **Info:**
    - The `yield` statement pauses the function's execution and sends a value back to the caller. When the caller asks for the next value, the function resumes right where it left off.
    - If we call `lazy_ints_from(0)`, it immediately returns a generator object. No code inside the `while` loop runs yet.
        ```python
        >>> numbers = lazy_ints_from(0)
        >>> print(numbers)
        <generator object lazy_ints_from at 0x...>
        ```
    - The computation only happens when we ask for a value using the built-in `next()` function.
        ```python
        >>> next(numbers)
        0
        >>> next(numbers)
        1
        >>> next(numbers)
        2
        ```
    - Because the values are generated on demand, we can represent an infinite sequence without running out of memory.

#### Checkpoint
- In the `lazy_ints_from` generator, what would happen if you replaced `yield current` with `return current`?
    <details>
    <summary>Answer</summary>
    
    The function would no longer be a generator. It would execute the loop once, `return` the initial value of `current` (`n`), and then terminate completely. It could not produce a sequence of values.
        
    </details>

#### Exercise 1
- Let's revisit the `sum_list` function from a previous exercise.
    ```python
    def sum_list(numbers):
        # ... (your recursive implementation)
    ```
- What happens if you try to call `sum_list(lazy_ints_from(0))`? Is this a good idea? Why or why not?
    <details>
    <summary>Hint</summary>
    
    The recursive `sum_list` needs to reach the end of the list to find its base case. Does an infinite list have an end?
        
    </details>

### Lazy Calculation of Pascal's Triangle

We can use a generator to produce the rows of Pascal's triangle one by one, infinitely. This is a very powerful pattern: the producer (`pascal_rows_generator`) only calculates the next row when the consumer asks for it.

```python
def pascal_rows_generator():
    """A generator that yields the rows of Pascal's triangle, forever."""
    current_row = [1]
    while True:
        yield current_row
        # Calculate the next row based on the current one
        current_row = add_lists(
            shift_left(current_row),
            shift_right(current_row)
        )

# Example Usage
pascal_gen = pascal_rows_generator()

# We can pull as many rows as we need
print(next(pascal_gen))  # Output: [1]
print(next(pascal_gen))  # Output: [1, 1]
print(next(pascal_gen))  # Output: [1, 2, 1]

# We can also use it in a for loop with a condition to stop
print("The first 10 rows:")
ten_rows = []
for i, row in enumerate(pascal_gen):
    ten_rows.append(row)
    if i == 9: # We need to stop it manually
        break
print(ten_rows)
```

#### Exercise 2
- The lazy version is often more efficient than an eager version that calculates N rows at once.
- Imagine you have a function `get_n_pascal_rows(n)` that eagerly calculates and returns a list of the first `n` rows.
- Think of a scenario where you first need 10 rows, and then later you need the 11th row. Why is the generator version (`pascal_rows_generator`) more optimal in this situation?
    <details>
    <summary>Hint</summary>
    
    When you call `get_n_pascal_rows(10)` and then `get_n_pascal_rows(11)`, how many rows are being recalculated? What about the generator version?
    
    <details>
    <summary>Answer</summary>
    
    The eager function `get_n_pascal_rows(11)` would have to recalculate the first 10 rows from scratch. The generator, however, maintains its state. It already has the 10th row computed and can generate the 11th row in a single, efficient step.
        
    </details>
    </details>

## To be continued...
