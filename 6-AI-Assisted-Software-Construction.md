---
layout: default
title: "6. AI-Assisted Software Construction"
nav_order: 8
---

# 6. AI-Assisted Software Construction

Computer science is the art of building layers of abstraction. We moved from toggling switches to Assembly, from Assembly to C, and from C to Python. Large Language Models (LLMs) represent the next layer: translating Natural Language intent into Formal Logic.

Throughout this course, you have learned to think in specific **paradigms** (Imperative, Functional, Object-Oriented) and **styles** (Pipeline, Things, Bulletin Board). You might wonder: *Why memorize these patterns if AI tools like ChatGPT or Copilot can just write the code for me?*

The answer is that AI tools are not magic code generators; they are **Paradigm Translators**. They map a vague specification (your prompt) to a concrete implementation. However, unlike a compiler, this translation is **probabilistic**. It can generate code that looks correct but fails subtly - introducing race conditions, shared state leaks, or unmaintainable "spaghetti" logic.

To use AI effectively, you must transition from being a "Code Writer" to a **Software Architect**. Your role shifts from typing syntax to:
1.  **Specification:** Defining the constraints and interface (The Prompt).
2.  **?? Architecture:** Decomposing complex problems into manageable, well-structured components (The System).
3.  **?? Verification:** Critically auditing the generated code for subtle flaws and paradigm violations (The Review).

## Table of contents
- [1. AI as a Paradigm Translator](#1-ai-as-a-paradigm-translator)
- [2. ?? Architecting Systems](#2-architecting-systems)
- [3. ?? The Paradigm Audit](#3-the-paradigm-audit)

---

## 1. AI as a Paradigm Translator

The most powerful way to use a Large Language Model (LLM) is to treat it as a "transpiler" - a tool that translates intent from one language or style into another. Because you now possess the vocabulary of programming paradigms (e.g., "Monadic," "Continuation-Passing," "Event-Driven"), you can force the AI to write high-quality, architectural code rather than generic scripts.

However, LLMs are probabilistic. If you ask for a "Game of Life implementation," you might get a script full of global variables one time and a class-based solution the next. To act as a **Software Architect**, you must provide the blueprint.

### The Workflow: Specification-First Generation

In traditional programming, you often write the implementation first and the tests second. In AI-assisted software construction, we invert this process. Because the AI generates the implementation, the human must define the **Truth** - the interface and the constraints - before generation begins.

1.  **Define the Interface:** Decide on function signatures and data structures.
2.  **Write the Test:** Write a unit test that enforces this interface and the desired logic.
3.  **Prompt with the Test:** Feed the test to the AI as a hard constraint.
4.  **Verify:** Check not just that the code runs (Behavioral Verification), but that it adheres to the requested paradigm (Stylistic Verification).

### Case Study: Conway's Game of Life

Let's demonstrate this by refactoring a legacy implementation of Conway's Game of Life.

#### Phase 1: The "Bad" Imperative Input
Imagine you inherited this monolithic, imperative script. It uses a fixed grid, nested loops, modifies state in place, and mixes logic with printing. It is hard to test and cannot handle an infinite board.

```python
# legacy_game.py
import time
import os

def run_game(generations):
    # Fixed 10x10 grid
    grid = [[0 for _ in range(10)] for _ in range(10)]
    
    # Initialize a "Glider" pattern
    grid[1][2] = 1
    grid[2][3] = 1
    grid[3][1] = 1
    grid[3][2] = 1
    grid[3][3] = 1

    for gen in range(generations):
        # Clear screen (works on Unix/Windows)
        os.system('cls' if os.name == 'nt' else 'clear')
        
        # Print current state
        print(f"Generation {gen}")
        for row in grid:
            print(" ".join(["#" if x else "." for x in row]))
        
        # Calculate next generation using nested loops and mutable state
        new_grid = [[0 for _ in range(10)] for _ in range(10)]
        for r in range(10):
            for c in range(10):
                neighbors = 0
                for i in range(-1, 2):
                    for j in range(-1, 2):
                        if i == 0 and j == 0: continue
                        nr, nc = r + i, c + j
                        if 0 <= nr < 10 and 0 <= nc < 10:
                             neighbors += grid[nr][nc]
                
                if grid[r][c] == 1 and (neighbors < 2 or neighbors > 3):
                    new_grid[r][c] = 0
                elif grid[r][c] == 0 and neighbors == 3:
                    new_grid[r][c] = 1
                else:
                    new_grid[r][c] = grid[r][c]
        
        grid = new_grid
        time.sleep(0.2)

if __name__ == "__main__":
    run_game(50)
```

#### Phase 2: The Specification (The Prompt)
We want to refactor this into a **Functional Style** using a **Sparse Data Structure** (a Set of coordinates).

Instead of hoping the AI guesses our function names, we write the test *first*. This test defines the "Truth": the function shall be named `next_gen`, it shall accept a set, and it shall return a set.

**The Prompt:**
```text
Refactor the Game of Life logic into a **Functional Style**.

Constraints:
1. Data Structure: Use a Python `set` of tuples `(x, y)` to represent live cells.
2. Paradigm: Use **pure functions** only. No side effects inside the logic.
3. Contract: The generated code MUST pass the following unit test without modification:

def test_blinker_logic():
    # Initial state: vertical line of 3
    initial_state = {(1, 0), (1, 1), (1, 2)}
    # Expected next state: horizontal line of 3
    expected_state = {(0, 1), (1, 1), (2, 1)}

    result = next_gen(initial_state)
    assert result == expected_state, f"Expected {expected_state}, got {result}"

# Also include a function `render(live_cells)` that returns a string,
# and a function `run_simulation` that handles the printing loop.
```

#### Phase 3: The AI Output
Because we provided the test as a constraint, the AI creates a solution that fits our interface exactly. It creates a pure function using `collections.Counter` to calculate neighbors, avoiding mutable state entirely.

```python
import time
import os
from collections import Counter

def next_gen(live_cells):
    """Calculates the next generation (Pure Logic)."""
    neighbor_counts = Counter()
    for x, y in live_cells:
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0: continue
                neighbor_counts[(x + dx, y + dy)] += 1

    return {
        (x, y) for (x, y), count in neighbor_counts.items()
        if count == 3 or (count == 2 and (x, y) in live_cells)
    }

def render(live_cells, rows=10, cols=10):
    """Renders the grid as a string (Pure View)."""
    output = []
    for r in range(rows):
        row_str = ""
        for c in range(cols):
            # Check if the coordinate exists in the set
            char = "#" if (r, c) in live_cells else "."
            row_str += f" {char}"
        output.append(row_str)
    return "\n".join(output)

def run_simulation(initial_state, generations=50):
    """Orchestrates the simulation (Side Effects)."""
    state = initial_state
    for i in range(generations):
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"Generation {i}")
        print(render(state))
        
        # State update happens here, explicitly
        state = next_gen(state)
        time.sleep(0.2)
```

#### Phase 4: Verification
As the Architect, your job is now twofold:

1.  **Behavioral Verification:** Run the test you wrote.
    ```python
    # Append this to the script to verify logic
    def test_blinker_logic():
        initial_state = {(1, 0), (1, 1), (1, 2)}
        expected_state = {(0, 1), (1, 1), (2, 1)}
        result = next_gen(initial_state)
        assert result == expected_state, f"Expected {expected_state}, got {result}"
        print("Logic Test Passed.")

    if __name__ == "__main__":
        test_blinker_logic() 
        # If passed, run the visual simulation
        glider = {(1, 0), (2, 1), (0, 2), (1, 2), (2, 2)}
        run_simulation(glider)
    ```

2.  **Style Verification:** Read the code. Did the AI actually follow the **Functional Paradigm**?
    *   *Check:* Are there global variables? (No).
    *   *Check:* Does `next_gen` modify the input set in place? (No, it returns a new set).
    *   *Check:* Is the data structure correct? (Yes, it uses Sets, not Lists).

If the AI passed the test but used a global variable, the behavioral verification would pass, but the architectural verification would fail. You would then need to refine the prompt.

### Exercise: The OOP Refactor
Your task is to use an AI assistant to translate the Game of Life logic from the **Functional** style to the **Object-Oriented** style.

**Instructions:**
1.  **Write the Test First:** Write a test function that defines the **Interface** for your new class:
    *   Define a "Blinker" pattern (three cells in a row).
    *   Instantiate a `Board` class with this pattern.
    *   Call `board.tick()`.
    *   Assert that the board's state has rotated 90 degrees (vertical becomes horizontal).
2.  **Construct the Prompt:** It is now your job to guide the AI. Construct a prompt that includes the context (the previous code) and explicitly enforces the following architectural decisions:
    *   **The Paradigm:** The solution must be Object-Oriented.
    *   **Encapsulation:** The state must be stored inside the `Board` instance.
    *   **The Contract:** The code *must* pass the test you wrote in Step 1.
3.  **Verify & Run:**
    *   **Logic Check:** Run the generated code. Does your test pass?
    *   **Paradigm Check:** Read the code. Did the AI actually create a stateful object, or did it just wrap a functional style in a class?
    *   **Visual Check:** Ask the AI to generate a script that runs a "Glider" simulation loop to visually prove the class works.

<details>
<summary>Hint: The Blinker Coordinates</summary>

*   *Vertical (Initial):* `{(1, 0), (1, 1), (1, 2)}`
*   *Horizontal (Expected after 1 tick):* `{(0, 1), (1, 1), (2, 1)}`

</details>

<details>
<summary>Hint: The Glider Pattern</summary>

A Glider is useful for visual testing because it moves across the board:
`{(1, 0), (2, 1), (0, 2), (1, 2), (2, 2)}`

</details>