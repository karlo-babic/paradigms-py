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
2.  **Architecture:** Decomposing complex problems into manageable, well-structured components (The System).
3.  **?? Verification:** Critically auditing the generated code for subtle flaws and paradigm violations (The Review).

## Table of contents
- [1. AI as a Paradigm Translator](#ai-as-a-paradigm-translator)
- [2. Modular Architecture & Decomposition](#modular-architecture-amp-decomposition)
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

---

## 2. Modular Architecture & Decomposition

The most common failure mode when using LLMs for software construction is **Context Pollution**. Large Language Models operate on probability, not understanding. As your codebase grows within a single chat session, the "noise" increases.

To build complex software with AI, you must transition from a "Code Writer" to a **System Decomposition Architect**. You must break the system into isolated "Black Boxes" where the AI only sees the specific context it needs to work on.

### The Blueprint: A Top-Down RPG

We will build a text-based exploration game. To ensure the AI generates robust code, we define strict **Boundaries** before generation begins:

1.  **`Player`:** Pure State (Coordinates). It has *no idea* the map exists.
2.  **`WorldMap`:** Pure Data & Topology. It has *no idea* the player exists.
3.  **`GameLoop` (Controller):** The Logic Glue. It listens to inputs and orchestrates the interaction between Player and Map.

### Phase 1: The Base Implementation (Empty World)

Our first iteration is a simple walking simulator. We want a world where the player wraps around the edges (Toroidal topology).

While you *could* simply ask the AI to "write a game" and then ask it to refactor the code into classes (the **Translator** workflow from Section 1), defining the architecture *before* generation gives us significantly better control. It prevents the AI from generating bad that we have to untangle later.

**The Prompt:**
> "Create a simple top-down ASCII RPG in Python using an **Object-Oriented** approach.
> The code must contain four distinct components:
> 1. A `WorldMap` class that handles the grid dimensions and logic for **coordinate wrapping** (Toroidal topology).
> 2. A `Player` class that simply holds coordinates.
> 3. A `render` function that takes the player and map and returns the grid string.
> 4. A `run_game` function containing the main loop and WASD input handling.

This results in a clean separation of concerns:

```python
import os

class Player:
    """Model: Pure State (Coordinates only)"""
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.symbol = "@"

    def move_to(self, x, y):
        self.x = x
        self.y = y

class WorldMap:
    """Model: Data & Topology"""
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def get_wrapped_coords(self, x, y):
        """Handles the 'Infinite World' logic via modulo arithmetic."""
        return x % self.width, y % self.height

def render(player, world):
    """View: Pure Transformation (State -> String)"""
    output = []
    output.append("+" + "-" * (world.width * 2 + 1) + "+")
    
    for y in range(world.height):
        row = "| "
        for x in range(world.width):
            if player.x == x and player.y == y:
                row += f"{player.symbol} "
            else:
                row += "  "
        row += "|"
        output.append(row)
    
    output.append("+" + "-" * (world.width * 2 + 1) + "+")
    return "\n".join(output)

def run_game():
    """Controller: Input & Orchestration"""
    world = WorldMap(20, 20)
    player = Player(10, 10)

    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print(render(player, world))
        print("WASD to move, Q to quit.")

        key = input(">> ").lower().strip()
        if key == 'q': break

        # 1. Calculate Intent
        dx, dy = 0, 0
        if key == 'w': dy = -1
        if key == 's': dy = 1
        if key == 'a': dx = -1
        if key == 'd': dx = 1

        # 2. Apply World Topology (Wrapping)
        # Note: We wrap *before* setting the player position
        target_x, target_y = world.get_wrapped_coords(player.x + dx, player.y + dy)
        
        # 3. Update State (No collision check needed yet)
        player.move_to(target_x, target_y)

if __name__ == "__main__":
    run_game()
```

### Phase 2: Managing Complexity (Adding Mountains)

Now we must add obstacles. A beginner might paste the entire code into an LLM and ask: *"Add mountains that block the player."* While this approach often works for small scripts like this one, it struggles significantly with larger codebases.

This often leads to bad code. The AI might write collision logic inside the `Player` class (Tight Coupling) or break the wrapping logic.

**The Architect's Approach:**
We define the feature requirements based on our architecture and ask the AI to output the necessary updates.

**The Prompt:**
*Update the RPG to support Mountains.
`WorldMap`: Generate random obstacles (#) and add an `is_blocked(x,y)` method.
`render`: Draw mountains as '#'.
`run_game`: Prevent the player from moving into mountains.*

Notice in the code below that the `Player` class remains untouched. This is the definition of good architecture: changing the world rules did not require changing the player object.

```python
import os
import random

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.symbol = "@"

    def move_to(self, x, y):
        self.x = x
        self.y = y

class WorldMap:
    def __init__(self, width, height, mountain_density=0.15):
        self.width = width
        self.height = height
        self.mountains = set()
        self._generate_terrain(mountain_density)

    def _generate_terrain(self, density):
        """Generates random obstacles."""
        count = int(self.width * self.height * density)
        while len(self.mountains) < count:
            rx = random.randint(0, self.width - 1)
            ry = random.randint(0, self.height - 1)
            self.mountains.add((rx, ry))

    def get_wrapped_coords(self, x, y):
        return x % self.width, y % self.height

    def is_blocked(self, x, y):
        """New Interface Method: Checks for obstacles."""
        return (x, y) in self.mountains

def render(player, world):
    output = []
    output.append("+" + "-" * (world.width * 2 + 1) + "+")
    
    for y in range(world.height):
        row = "| "
        for x in range(world.width):
            if player.x == x and player.y == y:
                row += f"{player.symbol} "
            elif (x, y) in world.mountains:
                row += "# " # New Render Logic
            else:
                row += "  "
        row += "|"
        output.append(row)
    
    output.append("+" + "-" * (world.width * 2 + 1) + "+")
    return "\n".join(output)

def run_game():
    world = WorldMap(20, 20)
    # Ensure player doesn't spawn in a mountain
    start_x, start_y = 10, 10
    while world.is_blocked(start_x, start_y):
        world = WorldMap(20, 20) # Simple retry logic for init
        
    player = Player(start_x, start_y)

    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print(render(player, world))
        print(f"Pos: {player.x},{player.y}. WASD to move, Q to quit.")

        key = input(">> ").lower().strip()
        if key == 'q': break

        dx, dy = 0, 0
        if key == 'w': dy = -1
        if key == 's': dy = 1
        if key == 'a': dx = -1
        if key == 'd': dx = 1

        # 1. Calculate Wraparound Coordinates
        dest_x, dest_y = world.get_wrapped_coords(player.x + dx, player.y + dy)

        # 2. Collision Check
        # We check the *destination* coordinate
        if not world.is_blocked(dest_x, dest_y):
            player.move_to(dest_x, dest_y)
        else:
            # Blocked! Do nothing (or print "Bonk!")
            pass

if __name__ == "__main__":
    run_game()
```

### Phase 3: The "Black Box" Refactor (Algorithm Injection)

The current map generation uses random noise (TV static), which looks unnatural. We want cave-like structures.

This highlights the power of the **Black Box** approach. We can instruct the AI to completely rewrite the *internals* of the `WorldMap` generation using a complex algorithm (Cellular Automata), while enforcing that the *public interface* remains identical.

Because the Interface Contract is preserved, we don't even need to verify the `GameLoop` code. We know it will still work.

**The Prompt:** *Refactor the `_generate_terrain` method. Instead of random scatter, implement Cellular Automata smoothing. Initialize the grid with noise, then run 2 iterations of smoothing where a cell becomes a wall if it has > 4 neighbors.*

```python
import os
import random

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.symbol = "@"

    def move_to(self, x, y):
        self.x = x
        self.y = y

class WorldMap:
    def __init__(self, width: int, height: int, mountain_density: float = 0.5):
        self.width = width
        self.height = height
        self.mountains = set()
        
        # We changed the initialization logic, but kept the constructor signature compatible
        self._generate_cellular_automata(mountain_density)

    def _generate_cellular_automata(self, density: float):
        """
        REFACTOR: Uses Cellular Automata to create organic caves.
        Algorithm:
        1. Fill map with random noise.
        2. Smooth the noise: A cell becomes a wall if it has > 4 wall neighbors.
        """
        # 1. Initialization: Random Noise
        for y in range(self.height):
            for x in range(self.width):
                if random.random() < density:
                    self.mountains.add((x, y))

        # 2. Smoothing Iterations (Simulation)
        iterations = 2
        for _ in range(iterations):
            new_mountains = set()
            for y in range(self.height):
                for x in range(self.width):
                    neighbors = self._count_wall_neighbors(x, y)
                    # The "4-5 Rule": If more than 4 neighbors are walls, this becomes a wall.
                    # This smooths out the noise into clumps.
                    if neighbors > 4:
                        new_mountains.add((x, y))
            self.mountains = new_mountains

    def _count_wall_neighbors(self, x, y):
        count = 0
        for dy in [-1, 0, 1]:
            for dx in [-1, 0, 1]:
                if dx == 0 and dy == 0: continue
                
                # Wrap neighbor coordinates around the edges
                nx = (x + dx) % self.width
                ny = (y + dy) % self.height
                
                if (nx, ny) in self.mountains:
                    count += 1
        return count

    def get_wrapped_coords(self, x, y):
        return x % self.width, y % self.height

    def is_blocked(self, x, y):
        # The Contract remains strictly preserved
        return (x, y) in self.mountains

def render(player, world):
    output = []
    output.append("+" + "-" * (world.width * 2 + 1) + "+")
    
    for y in range(world.height):
        row = "| "
        for x in range(world.width):
            if player.x == x and player.y == y:
                row += f"{player.symbol} "
            elif (x, y) in world.mountains:
                row += "# " # New Render Logic
            else:
                row += "  "
        row += "|"
        output.append(row)
    
    output.append("+" + "-" * (world.width * 2 + 1) + "+")
    return "\n".join(output)

def run_game():
    world = WorldMap(20, 20)
    # Ensure player doesn't spawn in a mountain
    start_x, start_y = 10, 10
    while world.is_blocked(start_x, start_y):
        world = WorldMap(20, 20) # Simple retry logic for init
        
    player = Player(start_x, start_y)

    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print(render(player, world))
        print(f"Pos: {player.x},{player.y}. WASD to move, Q to quit.")

        key = input(">> ").lower().strip()
        if key == 'q': break

        dx, dy = 0, 0
        if key == 'w': dy = -1
        if key == 's': dy = 1
        if key == 'a': dx = -1
        if key == 'd': dx = 1

        # 1. Calculate Wraparound Coordinates
        dest_x, dest_y = world.get_wrapped_coords(player.x + dx, player.y + dy)

        # 2. Collision Check (The Student's main logic task)
        # We check the *destination* coordinate
        if not world.is_blocked(dest_x, dest_y):
            player.move_to(dest_x, dest_y)
        else:
            # Blocked! Do nothing (or print "Bonk!")
            pass

if __name__ == "__main__":
    run_game()
```

### Exercise: Extending the System

You have seen how to modify the map (Data) and the controller (Logic). Your final task is to add a completely new system to the game.

Below are some ideas. Your challenge is not just to generate the code, but to **Design the Interface** before you begin. You must decide where the state lives and how it interacts with the existing loop.

1.  **Mining (Destructive Environment):**
    *   *Feature:* Input `dd` allows the player to remove a mountain at the coordinate right from the player (`ss` would mine below the player, `aa` left, `ww` up).
    *   *Architectural Challenge:* The map is currently immutable after generation. How do you safely expose a `remove_obstacle` method? How does the controller parse a two-character command?

2.  **Gold & Score (Data Overlay):**
    *   *Feature:* "Coins" (`*`) spawn on empty tiles. Walking over them collects them.
    *   *Architectural Challenge:* Do coins belong in the `WorldMap`? Or should you create a new `ItemManager` class? (Hint: Separate terrain from loot).

3.  **Enemies (Dynamic Entities):**
    *   *Feature:* Enemies (`X`) spawn on the map. Every time the player moves, the enemies move one step randomly.
    *   *Architectural Challenge:* You need an entity list manager. The enemies also need to check for collisions - how do you pass the `WorldMap` to the `EnemyManager`?

4.  **Pushable Stones (Sokoban Physics):**
    *   *Feature:* Stones (`O`) block movement, but if the space behind the stone is empty, the player pushes the stone.
    *   *Architectural Challenge:* Recursive logic. The controller must check: `Input -> Stone (Exists?) -> Behind Stone (Empty?)`.

**Workflow:**
1.  **Draft:** Write the class signature or function definition first.
2.  **Generate:** Ask the AI to implement that specific component.
3.  **Integrate:** Manually wire it into `run_game()`, or use AI.