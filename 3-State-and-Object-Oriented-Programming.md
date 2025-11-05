---
layout: default
title: "3. State and Object Oriented Programming"
nav_order: 5
---

# 3. State and Object Oriented Programming

>"If declarative programming is like a crystal, immutable and practically eternal, then stateful programming is organic: it grows and evolves as we watch."
>\- Inspired by *On Growth and Form*, D'Arcy Wentworth Thompson

In the last chapter, we explored the declarative programming paradigm, where components behave like mathematical functions: the same inputs always produce the same outputs. This makes declarative programs highly predictable and easy to reason about, but it limits their ability to model systems that change over time. A bank account, a user session, or a game character cannot be represented by a pure function alone.

To build these dynamic systems, we must extend our programming model with **explicit state**—a form of memory that persists between operations. State gives a component a history, allowing its results to depend not only on its current inputs but also on all past interactions. This transforms a component from a simple calculator into a simulation.

However, this new capability introduces significant complexity. When state is not managed in a disciplined way, it can make programs unpredictable and difficult to debug. **Object-Oriented Programming (OOP)** is a paradigm designed specifically to manage this complexity. Its core principle is **encapsulation**: the bundling of state (data) and the behavior (methods) that operates on that state into a single, coherent unit called an **object**.

In this chapter, we will make a deliberate transition from the stateless to the stateful model.
*   We will first examine the problems caused by unmanaged state.
*   We will then explore techniques for encapsulation, starting with a functional approach using closures and leading to Python's idiomatic `class` syntax.
*   Finally, we will cover the deeper concepts and design principles, such as object identity and composition, that are essential for building robust, stateful systems.

### Table of contents
- [1. The Need for State](#the-need-for-state)
- [2. The Problems of Unmanaged State](#the-problems-of-unmanaged-state)
- [3. A Functional Approach to Encapsulation: Closures](#a-functional-approach-to-encapsulation-closures)
- [4. The Object-Oriented Approach](#the-object-oriented-approach)
- [5. Declarative vs. Stateful ADTs](#declarative-vs-stateful-adts)
- [6. Object Identity vs. Value Equality](#object-identity-vs-value-equality)
- [7. Structuring Stateful Systems: Composition and Inheritance](#structuring-stateful-systems-composition-and-inheritance)
- [8. Case Study: Stateful and Declarative Random Number Generators]()
- [9. Concurrency with State: The Race Condition Problem]()

---

## 1. The Need for State

All the functions we have written so far in the declarative style share a common, powerful property: if you call them with the same inputs, they will *always* produce the same output. A function like `sum_tuple((1, 2, 3))` will always return `6`, regardless of how many times it is called or what other computations have occurred. This property, known as **referential transparency**, makes programs predictable and easy to reason about.

However, this timeless predictability also represents a fundamental limitation. Many real-world problems involve systems that need to change over time.

Consider a simple bank account. We might start with a balance of 100. If we call a function `withdraw(account, 20)`, we expect the new balance to be 80. If we then call the exact same function with the exact same arguments - `withdraw(account, 20)` - we expect the new balance to be 60. The *same call* must produce a *different result* based on what has happened before. This violates the core principle of the declarative model.

To solve this, we must introduce a new concept: **explicit state**. State is a component's memory. It is the information that a component retains from past events, allowing its behavior to evolve. With state, we shift from writing pure *calculations* to creating *simulations*. A calculation is timeless; a simulation unfolds over time.

### Conceptual Model: The Memory Cell (Oz)

To support explicit state, the declarative model must be extended with a new primitive concept: a container for a value that can be changed. In the Oz language, this is called a **cell**.

A cell is a simple container with three basic operations:
1.  `{NewCell 0}`: Create a new cell with an initial value of `0`.
2.  `@C`: Read the current value of cell `C`.
3.  `C := ...`: Assign a new value to cell `C`.

Using a cell, we can create a function that "remembers" how many times it has been called, a behavior impossible in the pure declarative model.

- An Oz function with memory:
    ```erlang
    declare
    C = {NewCell 0}
    fun {Add A B}
       C := @C + 1
       A + B
    end
    ```
- **Info:**
    - The cell `C` is created once, outside the function. It acts as a long-term memory.
    - Each time `Add` is called, it reads the value from `C`, increments it, and writes the new value back into the cell. The cell's state persists between calls.

In Python, the idea of state is built directly into the language, though not with a special "cell" type. Any mutable object can hold state. The challenge, as we will now see, is not in *creating* state, but in *managing* the complexity it introduces.

---

## 2. The Problems of Unmanaged State

The most direct way to create state in Python is by using a global variable. A global variable's value persists across function calls, providing the memory we need. Let's try to build a simple counter component using this approach.

```python
# A global variable holds the state.
call_count = 0

def increment():
    """Increments the global counter."""
    global call_count
    call_count = call_count + 1
    return call_count

def read():
    """Reads the global counter."""
    return call_count

# Let's use our component
print(f"Initial count: {read()}")
increment()
increment()
print(f"Count after two increments: {read()}")
```
**Output:**
```
Initial count: 0
Count after two increments: 2
```
This seems to work correctly. The `call_count` variable successfully remembers its value between the two calls to `increment()`. However, this approach introduces severe problems that make it unsuitable for building robust software.

### Problem 1: Lack of Protection
The `call_count` variable is completely exposed. Any part of the program, at any time, can directly change its value, bypassing the intended `increment()` function.

```python
# ... (previous code)

print(f"Count is currently: {read()}")

# Another part of the program accidentally modifies the state
print("...some other code runs...")
call_count = 999 # Direct modification, breaking the logic

print(f"Count is now: {read()}")
increment()
print(f"Count after one more increment: {read()}")
```
**Output:**
```
Count is currently: 2
...some other code runs...
Count is now: 999
Count after one more increment: 1000
```
The state of our counter was corrupted by an external piece of code. In a large program, this kind of bug can be incredibly difficult to track down, as the source of the incorrect state change could be anywhere.

### Problem 2: Lack of Multiplicity
What if we need more than one counter? For example, one counter to track API calls and another to track user logins. With the global variable approach, we have only one shared state. We cannot create a second, independent counter.

The only workaround is to create more global variables and more functions, leading to repetitive and unmanageable code:
```python
api_call_count = 0
login_count = 0

def increment_api_calls():
    global api_call_count
    api_call_count += 1

def increment_logins():
    global login_count
    login_count += 1

# ... and so on
```
This approach does not scale and leads to a namespace polluted with global state variables and highly specific functions.

### The Core Issue: No Encapsulation
Both of these problems stem from a single, fundamental flaw: a lack of **encapsulation**. The state (the variable `call_count`) is completely separate from the behavior (the functions `increment` and `read`) that is supposed to manage it.

A robust system needs to bundle state and behavior together into a single unit, protecting the state from unintended outside interference. In the next section, we will explore a disciplined, functional pattern to achieve this.

---

## 3. A Functional Approach to Encapsulation: Closures

To solve the problems of unmanaged global state, we need a way to bundle a piece of state with the functions that operate on it. We can achieve this using a powerful technique from functional programming: a **closure**. The idea is to create a "factory" function that, when called, produces a new, self-contained component with its own private state.

Let's rebuild our counter component using this pattern.

```python
def make_counter():
    """A factory for creating counter components."""
    # 1. The state is a local variable, not a global one.
    count = 0

    # 2. The behaviors are defined as inner functions.
    def increment():
        # The 'nonlocal' keyword tells Python to modify the 'count'
        # variable from the enclosing scope, not create a new local one.
        nonlocal count
        count = count + 1
        return count

    def read():
        return count

    # 3. Return a dictionary containing the functions.
    #    This is the public interface to our component.
    return {"increment": increment, "read": read}
```
This `make_counter` function doesn't return a value; it returns a *component* - a dictionary of functions that are now bound together.

### How It Works: The Closure
When `make_counter()` is called, it creates the local `count` variable. It then creates the `increment` and `read` functions. Because `make_counter` returns the inner functions, and those functions refer to `count`, Python keeps the `count` variable alive, even after `make_counter` has finished executing.

This combination of the inner functions and the environment they were created in (which includes `count`) is called a **closure**. The `count` variable has been "closed over" by the functions.

### Verifying the Solution
This pattern successfully solves the problems of global state:
*   **Multiplicity:** Each call to `make_counter()` creates a new, independent `count` variable and a new set of functions, allowing for multiple instances.
*   **Protection:** The `count` variable is local to the `make_counter` scope and cannot be accessed directly from the outside, achieving encapsulation.

We have essentially created a handmade object. While this is a valid technique, Python provides a more direct and conventional syntax for this exact purpose: the `class`.

#### Exercise: A Stateful Light Switch
- Write a factory function `make_light_switch()` that models a simple on/off switch.
- The internal state should be a boolean variable, e.g., `is_on`.
- The factory should return a dictionary of three functions:
    1.  `turn_on()`: Sets the state to `True`.
    2.  `turn_off()`: Sets the state to `False`.
    3.  `read()`: Returns the current boolean state.
- Create two separate light switches from your factory and verify that their states are independent.

<details>
<summary>Hint</summary>

You will need to use the `nonlocal` keyword in both `turn_on()` and `turn_off()` to modify the `is_on` variable from the outer scope.

</details>

---

## 4. The Object-Oriented Approach

The closure pattern from the previous section is a powerful way to achieve encapsulation using only functions. However, this pattern is so fundamental to programming that Python, like many other languages, provides a dedicated, more readable, and more powerful syntax for it: the **`class`**.

A `class` is a formal blueprint for creating objects. It bundles state (data) and behavior (methods) into a single, well-defined unit. Let's refactor our counter component from a function factory into a class.

```python
class Counter:
    """A blueprint for creating counter objects."""

    # The __init__ method is the constructor.
    # It runs automatically when a new object is created (e.g., Counter()).
    def __init__(self):
        # The state is stored as an attribute on the instance ('self').
        # The underscore prefix `_count` is a common convention
        # to indicate this attribute is for internal use.
        self._count = 0

    # A method to change the state. 'self' is always the first argument.
    def increment(self):
        self._count += 1
        return self._count

    # A method to read the state.
    def read(self):
        return self._count
```

### From Closure to Class
This class-based approach is a direct, formal mapping of the closure pattern:
-   The factory function (`make_counter`) becomes the **constructor method** (`__init__`).
-   The local state variable (`count`) becomes an **instance attribute** (`self._count`).
-   The inner functions (`increment`, `read`) become **methods**.

The key new element is the `self` parameter. When you call a method like `my_counter.increment()`, Python automatically passes the instance itself (`my_counter`) as the first argument, `self`. This is how the method knows which specific object's `_count` attribute to modify.

### Using the Class
Creating and using objects from a class is more straightforward and readable than using a function factory.

```python
# Instantiation: Calling the class creates an object instance.
ctr1 = Counter()
ctr2 = Counter()

# We call the methods using standard dot notation.
ctr1.increment()
ctr1.increment()
print(f"Counter 1 value: {ctr1.read()}")

# The state of ctr2 remains independent.
print(f"Counter 2 value: {ctr2.read()}")
```
**Output:**
```
Counter 1 value: 2
Counter 2 value: 0
```
The `class` syntax provides the same benefits of multiplicity and protection that we achieved with closures, but in a standard, explicit, and more extensible way. This is the idiomatic foundation for object-oriented programming in Python.

#### Exercise: Refactoring the Light Switch
- Refactor the `make_light_switch()` factory you wrote in the previous exercise into a `LightSwitch` class.
- The `__init__` method should initialize the internal state (e.g., `self._is_on`) to `False`.
- The class should have the following methods:
    - `turn_on()`
    - `turn_off()`
    - `read()`
- Create two `LightSwitch` objects and verify that their states are independent.

<details>
<summary>Hint</summary>

Remember that every method you define in a class must have `self` as its first parameter. For example: `def turn_on(self):`.

</details>

---

## 5. Declarative vs. Stateful ADTs

We now have two distinct paradigms for building components: the declarative model from Chapter 2 and the stateful model we are exploring now. The differences between them become very clear when we implement the same Abstract Data Type (ADT) in both styles. Let's compare a declarative stack with a stateful one.

### The Declarative Stack (Recap from Chapter 2)
A declarative ADT is one whose operations are pure functions. Operations that "change" the data structure do not modify the original instance; instead, they return a *new instance* that represents the result of the operation. We implemented this using a `frozen` dataclass with an immutable `tuple` to hold its data.

```python
from dataclasses import dataclass
from typing import Tuple, Any

@dataclass(frozen=True)
class DeclarativeStack:
    """A purely declarative, immutable Stack ADT."""
    # The internal state is an immutable tuple.
    _items: Tuple[Any, ...] = ()

    def push(self, item: Any) -> 'DeclarativeStack':
        """Returns a new stack with the item added."""
        # This does not modify `self`. It creates a new instance.
        return DeclarativeStack(self._items + (item,))

    def pop(self) -> Tuple[Any, 'DeclarativeStack']:
        """Returns the top item and a new stack without that item."""
        if self.is_empty():
            raise IndexError("pop from empty stack")
        
        top_item = self._items[-1]
        remaining_items = self._items[:-1]
        # Return the value and the new, smaller stack instance.
        return (top_item, DeclarativeStack(remaining_items))

    def is_empty(self) -> bool:
        """Checks if the stack is empty."""
        return not self._items
```
Usage requires capturing the new instance returned by each operation: `s1 = s0.push("a")`.

### The Stateful Stack
A stateful ADT encapsulates a mutable internal state. Its methods modify this state directly, causing side effects. This aligns with the standard object-oriented approach. We implement this using a regular `class` with a mutable `list` to hold its data.

```python
from typing import List, Any

class StatefulStack:
    """A stateful, mutable Stack ADT."""

    def __init__(self):
        """Initializes a new, empty stack."""
        # The internal state is a mutable list.
        self._items: List[Any] = []

    def push(self, item: Any) -> None:
        """
        Adds an item to the top of the stack.
        This method modifies the stack in-place (a side effect) and returns None.
        """
        self._items.append(item)

    def pop(self) -> Any:
        """
        Removes and returns the top item from the stack.
        This method also modifies the stack in-place.
        Pythonic way: return self._items.pop()
        """
        if self.is_empty():
            raise IndexError("pop from empty stack")

        top_item = self._items[-1]
        self._items = self._items[:-1]
        return top_item

    def is_empty(self) -> bool:
        """Checks if the stack is empty."""
        return not self._items
```
Usage involves creating one object and calling methods that evolve its internal state: `s.push("a")`.

### Side-by-Side Comparison

The two styles represent a fundamental trade-off in software design.

| Feature            | Declarative Stack (`frozen` dataclass)                        | Stateful Stack (`class`)                                  |
| ------------------ | ------------------------------------------------------------- | --------------------------------------------------------- |
| **Core Idea**      | A "value" that represents a stack.                            | An "object" that exists in time.                          |
| **Internal Data**  | Immutable (`tuple`)                                           | Mutable (`list`)                                          |
| **`push` Operation** | `new_stack = stack.push(item)` <br> (Returns a new instance)      | `stack.push(item)` <br> (Returns `None`, modifies `self`)         |
| **Nature of Ops**  | Pure functions (no side effects)                              | Methods with side effects                                 |
| **History**        | Preserves history. The original instance is never changed.      | Destructive. The previous state is lost after a change.   |
| **Use Case**       | Predictable, easy to test, and safe for concurrent programs.  | Intuitive and memory-efficient for a single, evolving entity. |

Neither approach is universally "better." The stateful, object-oriented approach is often more intuitive and efficient for modeling a single entity that changes over its lifetime. The declarative approach provides strong guarantees of predictability and safety, which are invaluable in complex or concurrent systems. Understanding both paradigms allows you to choose the right tool for the problem at hand.

---

## 6. Object Identity vs. Value Equality

In the declarative world, we primarily work with *values*. A tuple `(1, 2)` is defined by its contents. If we have two tuples, `t1 = (1, 2)` and `t2 = (1, 2)`, we consider them equal and interchangeable. Their primary characteristic is their value.

When we introduce state, we create objects that have a persistent **identity**. An object is a specific entity that exists in memory and evolves over time. Its state (the values of its attributes) may change, but its identity does not. This distinction between an object's identity and its current state is a fundamental concept in object-oriented programming.

Python gives us two different operators to explore this:
-   `is`: Checks for **identity**. `a is b` is `True` only if `a` and `b` are the exact same object in memory.
-   `==`: Checks for **equality**. `a == b` is `True` if the objects have the same value. The definition of "value" can be customized.

### Demonstration with a Stateful Object
Let's create a simple class and see how these operators behave.

```python
class Account:
    def __init__(self, initial_balance=0):
        self._balance = initial_balance

# Create two distinct Account objects that happen to have the same state.
a1 = Account(100)
a2 = Account(100)

# Create a third variable that refers to the first object.
a3 = a1

# Check for identity
print(f"a1 is a2: {a1 is a2}") # False: They are different objects in memory.
print(f"a1 is a3: {a1 is a3}") # True: They are the same object.

# Check for equality
# By default, for custom classes, '==' behaves like 'is'.
print(f"a1 == a2: {a1 == a2}") # False: They are not the same object.
print(f"a1 == a3: {a1 == a3}") # True: They are the same object.
```
`a1` and `a2` are two separate "things" in our simulation. They have their own distinct identities and histories. `a1` and `a3`, on the other hand, are just two different names for the exact same thing.

### Customizing Equality
The default behavior of `==` is often not what we want. We might decide that two `Account` objects should be considered "equal" if they have the same balance. We can define this custom logic by implementing the special `__eq__` method.

```python
class AccountWithEq:
    def __init__(self, initial_balance=0):
        self._balance = initial_balance

    def __eq__(self, other):
        # First, ensure we're comparing with another object of the same type.
        if not isinstance(other, AccountWithEq):
            return NotImplemented
        # Define our equality rule: balances must match.
        return self._balance == other._balance

# Create two distinct objects again
a1 = AccountWithEq(100)
a2 = AccountWithEq(100)

# Check for identity (unchanged)
print(f"a1 is a2: {a1 is a2}") # False: Still different objects.

# Check for our custom equality
print(f"a1 == a2: {a1 == a2}") # True: Their balances are equal.
```

By implementing `__eq__`, we have defined what "value equality" means for our `Account` objects, but this does not change the fact that they are separate, distinct entities in memory. This separation of identity and state is a core feature of the stateful paradigm. In contrast, for declarative values like tuples, we are almost always concerned only with value equality.

---

## 7. Structuring Stateful Systems: Composition and Inheritance

Now that we can build individual stateful objects using classes, the next logical question is how to combine them to create larger, more complex systems. Object-oriented programming provides two primary mechanisms for expressing the relationships between classes: **composition** and **inheritance**. Understanding when to use each is a critical design skill.

### Composition: The "has-a" Relationship
Composition is the most common and flexible way to structure a system. It's the principle of building complex objects by assembling them from other, simpler objects. This models a **"has-a"** relationship. For example, a `Customer` *has an* `Account`. A `Car` *has an* `Engine`.

We implement composition by simply including an instance of one class as an attribute of another.

```python
class Account:
    # ... (implementation from before)

class Customer:
    def __init__(self, name):
        self.name = name
        # This customer "has-a" an Account object.
        self.account = Account(0)

# --- Usage ---
c = Customer("Alice")
c.account.deposit(100)
```
In this model, the `Customer` and `Account` are two separate, independent objects. The `Customer` class uses the `Account` class as a component to fulfill its role.

This approach is the foundation of a powerful design paradigm known as **Component-Based Programming**. In this style, an object like `Account` is treated as a self-contained **component** - a reusable, independent unit with a well-defined public interface (its methods). The `Customer` class acts as a **consumer**, using the `Account` component to fulfill its role. Composition is the mechanism that allows us to build systems by "plugging" these components together. This promotes a modular design, as the `Customer` class only needs to know *what* the `Account` component does, not *how* it does it.

### Inheritance: The "is-a" Relationship
Inheritance is used to create a new class that is a more specialized version of an existing class. It models an **"is-a"** relationship. For example, a `SavingsAccount` *is an* `Account`, but with some specialized rules or added features.

The new class (the child or subclass) automatically gains all the attributes and methods of the existing class (the parent or superclass). It can then **override** existing behavior or **extend** it with new behavior.

```python
class SavingsAccount(Account): # Inherits from Account
    def __init__(self, initial_balance=0, interest_rate=0.01):
        # Use super() to call the parent class's __init__ method
        super().__init__(initial_balance)
        self.interest_rate = interest_rate

    def add_interest(self):
        """A new method specific to SavingsAccount."""
        interest = self._balance * self.interest_rate
        self.deposit(interest) # Reuses the deposit method from the parent
```
Here, `SavingsAccount` is a specialized type of `Account`. It reuses the core logic of its parent and adds its own unique features.

### Design Principle: Favor Composition Over Inheritance
While both are powerful tools, a widely accepted principle in modern object-oriented design is to **favor composition over inheritance**.

-   **Inheritance creates tight coupling.** A child class is intimately tied to the implementation details of its parent. A change in the parent class can unexpectedly break the child class.
-   **Composition is more flexible.** A class that contains another object only cares about that object's public interface. You can easily swap out the contained object for a different one that has the same interface. This promotes loose coupling and modular design.

A good rule of thumb is to use inheritance only when the relationship is a true specialization (a clear "is-a" relationship) and to use composition for all other relationships where one object needs the services of another.

#### Exercise: Modeling a Car
Your task is to model a system for cars and engines by implementing three classes: `Engine`, `ElectricEngine`, and `Car`.

**Requirements:**

1.  **`Engine` Class:**
    *   An engine should track whether it is running. It should be off when created.
    *   It needs a `start()` method that marks it as running and prints "Vroom! Engine started."
    *   It needs a `stop()` method that marks it as not running and prints "Engine stopped."

2.  **`ElectricEngine` Class:**
    *   An electric engine also tracks its running state and can be stopped, just like a standard engine.
    *   However, its `start()` method should print "Electric engine started silently." instead of the standard message.

3.  **`Car` Class:**
    *   A car is a component that requires an engine to function.
    *   It should have a `drive()` method that first starts its engine and then prints "Driving..."
    *   It should also have a `park()` method that stops the car's engine.

Based on these requirements, decide on the appropriate relationship (composition or inheritance) between:
-   `Car` and `Engine`.
-   `ElectricEngine` and `Engine`.

Implement the three classes to satisfy all requirements.

<details>
<summary>Hint</summary>

- Is a `Car` a type of `Engine`, or does a `Car` *have an* `Engine`?
- How is an `ElectricEngine` related to an `Engine`? Is one a specialized version of the other?

For the "has-a" relationship, the `Car`'s `__init__` method will likely need to accept an engine object as an argument: `def __init__(self, engine_object):`.

</details>

---

### To be continued...