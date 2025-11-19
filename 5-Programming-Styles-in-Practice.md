---
layout: default
title: "5. Programming Styles in Practice"
nav_order: 7
---

# 5. Programming Styles in Practice

In previous chapters, we explored high-level **paradigms** - fundamental ways of thinking about computation, such as the declarative and object-oriented models. Now, we will zoom in to examine **programming styles**. A style is a more concrete set of constraints and conventions for how to structure code *within* a paradigm. A paradigm is the philosophy; a style is the recipe.

To understand the impact of different styles, we will draw from the book "Exercises in Programming Style" by Cristina Videira Lopes. Its core idea is to solve one single problem in many different ways, with each implementation following a strict set of constraints. By comparing these solutions, we can see firsthand how a programmer's design choices affect the readability, testability, and maintainability of the code.

In this chapter, we will follow this approach. For each style, we will first present a complete example that solves the "Word Frequency" problem. Then, for the exercises, your task will be to refactor a "Character Count" script into that same style.

### Table of contents
- **Topic 1: Foundational Decomposition Styles**
  - [1. The Monolithic Style](#the-monolithic-style)
  - [2. The Cookbook Style](#the-cookbook-style)
  - [3. The Pipeline Style](#the-pipeline-style)
  - [4. The Things Style](#the-things-style)
- **Topic 2: Advanced Functional Styles**
  - [5. The Infinite Mirror Style (Recursion)](#the-infinite-mirror-style-recursion)
  - [6. The Kick Forward Style (Continuation-Passing)](#the-kick-forward-style-continuation-passing)
  - [7. The One Style (Monadic)](#the-one-style-monadic)
- **Topic 3: Variations in Object-Oriented Design**
  - [8. The Letterbox Style (Message Passing)](#the-letterbox-style-message-passing)
  - [9. The Closed Maps Style (Prototype-Based)](#the-closed-maps-style-prototype-based)
- [10. Chapter Summary](#chapter-summary)

---

**Topic 1: Foundational Decomposition Styles**

## 1. The Monolithic Style
The Monolithic style is the most direct approach to solving a problem. It can be thought of as the "no style" style, where the entire solution is implemented as a single, linear block of code that solves the problem in all its concrete detail.

**Constraints:**
1.  The solution is contained in one procedure or script.
2.  There is little to no decomposition into smaller functions.
3.  The use of external libraries is minimal.

This style is simple to write for very small problems, but it is difficult to maintain, debug, or extend. Because there are no abstractions, any change to the program's logic requires understanding the entire script. Its primary value is to serve as a **baseline** - a point of comparison that demonstrates the problems that all other styles are designed to solve.

### Example: Word Frequency
Here is the implementation of the term frequency problem in the Monolithic style. The code reads a file, processes characters one by one to find words, counts their frequencies, and keeps a sorted list of the results, all within a single, sequential flow.

```python
#!/usr/bin/env python
import sys, string

# The global list of [word, frequency] pairs
word_freqs = []

# The list of stop words, now embedded in the script
stop_words = [
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
    'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
    'were', 'will', 'with'
]
stop_words.extend(list(string.ascii_lowercase))

# Iterate through the file one line at a time 
for line in open(sys.argv[1]):
    start_char = None
    i = 0
    for c in line:
        if start_char is None:
            if c.isalnum():
                start_char = i # Found the start of a word
        elif not c.isalnum():
            # Found the end of a word. Process it.
            word = line[start_char:i].lower()
            if word not in stop_words:
                found = False
                pair_index = 0
                for pair in word_freqs:
                    if word == pair[0]:
                        pair[1] += 1
                        found = True
                        break
                    pair_index += 1
                if not found:
                    word_freqs.append([word, 1])
                elif len(word_freqs) > 1:
                    # Reorder the list by swapping the current element upwards
                    for n in reversed(range(pair_index)):
                        if word_freqs[pair_index][1] > word_freqs[n][1]:
                            word_freqs[n], word_freqs[pair_index] = word_freqs[pair_index], word_freqs[n]
                            pair_index = n
            start_char = None # Reset for next word
        i += 1

for tf in word_freqs[0:25]:
    print(tf[0], '-', tf[1])
```

### Our Standard Problem for Exercises: Character Count
For the exercises in this chapter, we will use a single, standard problem: counting the frequency of each character in a text file. The monolithic implementation below will serve as the starting point for all subsequent refactoring exercises.

**Requirements:**
*   The script must take an input file path as a command-line argument.
*   The counting must be case-insensitive.
*   Only alphabet characters should be counted.
*   The output must be the top 25 most frequent characters, sorted in descending order.

```python
#!/usr/bin/env python
import sys
import string

# Ensure a filename is provided
if len(sys.argv) != 2:
    print("Usage: python char_count_mono.py <input_file>")
    sys.exit(1)

# 1. Read the data and normalize it
try:
    with open(sys.argv[1]) as f:
        text = f.read().lower()
except IOError as e:
    print(f"Error reading file: {e}")
    sys.exit(1)
    
# 2. Count the frequencies of alphabet characters
counts = {}
for char in text:
    if char in string.ascii_lowercase:
        counts[char] = counts.get(char, 0) + 1

# 3. Sort the results
sorted_counts = sorted(counts.items(), key=lambda item: item[1], reverse=True)

# 4. Print the top 25
for char, count in sorted_counts[:25]:
    print(char, '-', count)
```

### Exercise: Analyze the Baseline Code
Your task for this section is to familiarize yourself with the monolithic **Character Count** script above. There is nothing to implement yet.

1.  Save the code as a Python file (e.g., `char_count_mono.py`).
2.  Find a sample text file to use as input.
3.  Run the script from your terminal and verify that it produces the expected output: `python char_count_mono.py path/to/your/file.txt`.
4.  Read through the code and identify the six distinct logical steps it performs. The comments in the script already hint at these, but trace the data flow from the raw file to the final printed output. The six steps are:
    1.  Read the raw text data from a file.
    2.  Normalize the text to lowercase.
    3.  Filter out non-alphabetic characters.
    4.  Count the frequency of each character.
    5.  Sort the frequencies in descending order.
    6.  Print the top 25 results.

Understanding this consistent decomposition is the key to all the following exercises.

---

## 2. The Cookbook Style
The Cookbook style is the first step away from monolithic code. It introduces **procedural abstraction**, where the larger problem is decomposed into a series of named steps or procedures, much like a recipe in a cookbook.

However, in this style, the procedures are not independent. They all operate on a shared pool of mutable data, typically stored in global variables. Functions in this style usually do not return values; instead, their purpose is to create **side effects** by modifying the shared data, preparing it for the next procedure in the sequence.

**Constraints:**
1.  The problem is decomposed into procedures (functions).
2.  These procedures share and modify a common, mutable state (e.g., global variables).
3.  The main flow of control is a simple sequence of calls to these procedures.

This style is a classic example of **imperative programming**. While it is better organized than a monolithic script, it still suffers from the problems of unmanaged state that we discussed in Chapter 3. Any function can modify the global state, which can make debugging difficult in large applications.

### Example: Word Frequency
In this implementation, the data (`data`, `words`, `word_freqs`) is stored globally. A series of functions is called in order, each one modifying this shared state until the final result is ready.

```python
#!/usr/bin/env python
import sys
import string

# The shared mutable data
data = []
words = []
word_freqs = []

#
# The procedures
#
def read_file(path_to_file):
    """
    Takes a path to a file and adds its contents
    to the global `data` list.
    """
    global data
    with open(path_to_file) as f:
        data.extend(list(f.read()))

def filter_chars_and_normalize():
    """
    Replaces all non-alphanumeric chars in `data` with white space
    and converts characters to lowercase.
    """
    global data
    for i in range(len(data)):
        if not data[i].isalnum():
            data[i] = ' '
        else:
            data[i] = data[i].lower()

def scan():
    """
    Scans `data` for words, filling the global `words` list.
    """
    global data, words
    data_str = ''.join(data)
    words.extend(data_str.split())

def remove_stop_words():
    """
    Removes stop words from the `words` list.
    """
    global words
    stop_words = [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
        'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
        'were', 'will', 'with'
    ]
    stop_words.extend(list(string.ascii_lowercase))
    
    # We must create a copy of the list to iterate over,
    # because we are modifying it in place.
    for w in list(words):
        if w in stop_words:
            words.remove(w)

def frequencies():
    """
    Creates a list of [word, frequency] pairs in `word_freqs`.
    """
    global words, word_freqs
    for w in words:
        found = False
        for pair in word_freqs:
            if w == pair[0]:
                pair[1] += 1
                found = True
                break
        if not found:
            word_freqs.append([w, 1])

def sort():
    """
    Sorts `word_freqs` by frequency in descending order.
    """
    global word_freqs
    word_freqs.sort(key=lambda x: x[1], reverse=True)

#
# The main function: a sequence of procedure calls
#
read_file(sys.argv[1])
filter_chars_and_normalize()
scan()
remove_stop_words()
frequencies()
sort()

for tf in word_freqs[0:25]:
    print(tf[0], '-', tf[1])
```

### Exercise: Refactor to the Cookbook Style
Your task is to refactor the monolithic **Character Count** script into the Cookbook style. Use the Word Frequency implementation above as a guide. The goal is to decompose the logic into separate procedures that all operate on shared, global data.

**Instructions:**
1.  Start a new Python file.
2.  At the top of the file, define global variables to hold the data at each stage of the process: `raw_text`, `normalized_text`, `filtered_text`, `char_counts`, and `sorted_data`.
3.  Decompose the logic from the monolithic script into six procedures, each performing one step of the problem:
    *   `read_file(path_to_file)`: Reads the file and stores its content in the `raw_text` global variable.
    *   `normalize()`: Reads from `raw_text` and stores the lowercase version in `normalized_text`.
    *   `filter_chars()`: Reads from `normalized_text` and stores only the alphabetic characters in `filtered_text`.
    *   `count_frequencies()`: Reads from `filtered_text` and populates the `char_counts` global dictionary.
    *   `sort()`: Reads from `char_counts` and stores the sorted list of pairs in `sorted_data`.
    *   `print_results()`: Reads from `sorted_data` and prints the top 25 results.
4.  The main part of your script should be a simple, sequential series of calls to these procedures.

<details>
<summary>Hint</summary>

Remember to use the `global` keyword inside each function that needs to *modify* a global variable. For example, `normalize()` will need `global raw_text, normalized_text` (or just `global normalized_text` if you only read from `raw_text`).

A common Pythonic way to implement `filter_chars(text)` is to use a list comprehension and the `str.join()` method: `return "".join([char for char in text if char.isalpha()])`. This is a concise and efficient way to build the new filtered string.

</details>

---

## 3. The Pipeline Style
The Pipeline style is a direct application of the **functional programming** paradigm. It decomposes a problem into a series of functions, each of which takes an input and produces an output. These functions are then chained or composed together, where the output of one function becomes the direct input for the next, similar to stations on an assembly line.

This style is a significant departure from the Cookbook style because it explicitly forbids shared, mutable state. All data flows through the functions as arguments and return values.

**Constraints:**
1.  The problem is decomposed into functions.
2.  Each function takes an input and produces an output.
3.  There is no shared, mutable state between functions. The data flow is explicit.

Because the functions in this style are often **pure functions** (their output depends only on their input, with no side effects), this approach leads to code that is highly predictable, testable, and easy to reason about. The main control flow is a clear, linear composition of functions.

### Example: Word Frequency
In this implementation, each step of the process is a self-contained function that returns a new value. The main function is a single, deeply nested expression that composes these functions to achieve the final result.

```python
#!/usr/bin/env python
import sys
import re
import operator
import string

#
# The functions
#
def read_file(path_to_file):
    """
    Takes a path to a file and returns the entire contents
    of the file as a string.
    """
    with open(path_to_file) as f:
        data = f.read()
    return data

def filter_chars_and_normalize(str_data):
    """
    Takes a string and returns a copy with all non-alphanumeric
    chars replaced by white space, and converted to lowercase.
    """
    pattern = re.compile('[\W_]+')
    return pattern.sub(' ', str_data).lower()

def scan(str_data):
    """
    Takes a string and returns a list of words.
    """
    return str_data.split()

def remove_stop_words(word_list):
    """
    Takes a list of words and returns a new list with stop words removed.
    """
    stop_words = [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
        'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
        'were', 'will', 'with'
    ]
    stop_words.extend(list(string.ascii_lowercase))
    return [w for w in word_list if w not in stop_words]

def frequencies(word_list):
    """
    Takes a list of words and returns a dictionary of word frequencies.
    """
    word_freqs = {}
    for w in word_list:
        word_freqs[w] = word_freqs.get(w, 0) + 1
    return word_freqs

def sort(word_freqs):
    """
    Takes a dictionary of frequencies and returns a list of (word, freq)
    pairs sorted by frequency in descending order.
    """
    return sorted(word_freqs.items(), key=operator.itemgetter(1), reverse=True)

#
# The main function
#
# A more readable, sequential version of the pipeline:
text = read_file(sys.argv[1])
normalized_text = filter_chars_and_normalize(text)
words = scan(normalized_text)
filtered_words = remove_stop_words(words)
word_freqs = frequencies(filtered_words)
sorted_freqs = sort(word_freqs)

for word, freq in sorted_freqs[:25]:
    print(word, '-', freq)

# The original, deeply nested version:
#
# from itertools import islice
# for word, freq in islice(sort(frequencies(remove_stop_words(scan(filter_chars_and_normalize(read_file(sys.argv[1])))))), 25):
#    print(word, '-', freq)
```

### Exercise: Refactor to the Pipeline Style
Your task is to refactor the **Character Count** script from the **Cookbook style** into the Pipeline style. The goal is to eliminate all global variables and side effects, creating a chain of pure functions.

**Instructions:**
1.  Start with your solution from the "Cookbook Style" exercise.
2.  Transform each of your procedures into a pure function that takes an input and returns an output.
3.  Your six functions should have the following signatures:
    *   `read_file(path_to_file) -> str`: Reads the file and returns its content.
    *   `normalize(text: str) -> str`: Takes a string and returns a new lowercase string.
    *   `filter_chars(text: str) -> str`: Takes a string and returns a new string containing only the alphabet characters.
    *   `count_frequencies(text: str) -> dict`: Takes the filtered text and returns a dictionary of character counts.
    *   `sort(counts: dict) -> list`: Takes the dictionary and returns a list of `(char, count)` pairs sorted by count.
    *   `print_results(sorted_data: list) -> None`: Takes the sorted list and prints the top 25 results. This is the only function that should have a side effect (printing).
4.  Rewrite the main part of your script to be a "pipeline" that calls these functions in sequence, passing the return value of one function as the argument to the next.

<details>
<summary>Hint</summary>

For example, your `count_frequencies` function in the Cookbook style probably looked like this:
```python
def count_frequencies():
    global filtered_text, char_counts
    for char in filtered_text:
        # logic to update global char_counts
```
In the Pipeline style, it must be transformed to this:
```python
def count_frequencies(input_text: str) -> dict:
    local_counts = {}
    for char in input_text:
        # logic to update local_counts
    return local_counts
```
Apply this transformation to all your functions.

</details>

---

## 4. The Things Style
The Things style, also known as standard **Object-Oriented Programming**, is a disciplined approach to managing state. Instead of decomposing a problem into procedures that modify global state (like the Cookbook style), we decompose it into a set of "things" or objects.

Each object is a self-contained capsule responsible for a specific part of the problem. It bundles its own internal state (data) with the procedures (methods) that are allowed to operate on that state. This is the principle of **encapsulation**. Data is never accessed directly from the outside; it is hidden, and interaction happens only through the object's public methods.

**Constraints:**
1.  The problem is decomposed into "things" (objects) that make sense for the problem domain.
2.  Each object encapsulates its own state.
3.  State is accessed and modified only through the object's public methods.

This style directly addresses the weaknesses of the Cookbook style. By encapsulating state, we prevent it from being accidentally modified by unrelated parts of the program, and we can easily create multiple instances of our objects. This is a practical application of the OOP and Component-Based Programming principles discussed in Chapter 3.

### Example: Word Frequency
In this implementation, the problem is broken down into four distinct objects (classes):
-   `DataStorageManager`: Responsible for reading and normalizing the text from the file.
-   `StopWordManager`: Responsible for managing the list of stop words.
-   `WordFrequencyManager`: Responsible for counting word frequencies.
-   `WordFrequencyController`: The main object that coordinates the other components to execute the program.

```python
#!/usr/bin/env python
import sys
import re
import operator
import string

#
# The classes (the "Things")
#
class DataStorageManager:
    """Models the contents of the file."""
    def __init__(self, path_to_file):
        with open(path_to_file) as f:
            text = f.read()
        pattern = re.compile('[\W_]+')
        self._data = pattern.sub(' ', text).lower()

    def words(self):
        """Returns the list of words in storage."""
        return self._data.split()

class StopWordManager:
    """Models the stop word filter."""
    def __init__(self):
        self._stop_words = [
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
            'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
            'were', 'will', 'with'
        ]
        self._stop_words.extend(list(string.ascii_lowercase))

    def is_stop_word(self, word):
        return word in self._stop_words

class WordFrequencyManager:
    """Keeps the word frequency data."""
    def __init__(self):
        self._word_freqs = {}

    def increment_count(self, word):
        self._word_freqs[word] = self._word_freqs.get(word, 0) + 1

    def sorted(self):
        return sorted(self._word_freqs.items(), key=operator.itemgetter(1), reverse=True)

class WordFrequencyController:
    """The main controller that coordinates the other objects."""
    def __init__(self, path_to_file):
        # This demonstrates composition: the controller "has" other objects.
        self._storage = DataStorageManager(path_to_file)
        self._stop_word_manager = StopWordManager()
        self._word_freq_manager = WordFrequencyManager()

    def run(self):
        for word in self._storage.words():
            if not self._stop_word_manager.is_stop_word(word):
                self._word_freq_manager.increment_count(word)

        word_freqs = self._word_freq_manager.sorted()
        for word, freq in word_freqs[0:25]:
            print(word, '-', freq)

#
# The main function
#
WordFrequencyController(sys.argv[1]).run()
```

### Exercise: Refactor to the Things Style
Your task is to refactor the **Character Count** problem into the Things style. You will encapsulate the logic into objects. According to the "Things" definition, these objects should be **capsules of data** that expose procedures to the rest of the world.

**Instructions:**
1.  Decompose the problem into classes.
    *   `TextSource`: Is responsible for **Step 1 (Read Data)**.
        *   Its `__init__` takes a file path, reads the file, and stores the raw text in `self._text`.
        *   It exposes a method `get_text()` to provide this data to others.
    *   `TextProcessor`: Is responsible for **Steps 2 & 3 (Normalize and Filter)**.
        *   It can be implemented as a stateless service or hold the text internally.
        *   It must provide methods to `normalize` and `filter` text.
    *   `FrequencyAnalyzer`: Is responsible for **Step 4 (Count)**.
        *   This object must encapsulate the state. It should initialize an empty dictionary `self._counts`.
        *   It should have a method `ingest(text)` (or similar) that takes text and updates the internal `self._counts` dictionary.
        *   It should *not* return the counts immediately. The data stays hidden inside.
    *   `ResultPresenter`: Is responsible for **Step 5 & 6 (Sort and Print)**.
        *   It should have a method that takes the `FrequencyAnalyzer` (or its data), sorts it, and prints the results.
    *   `CharacterCountController`: The main class.
        *   Its `run()` method coordinates the flow: getting text from Source, passing it through Processor, feeding it into Analyzer, and finally asking Presenter to show the results.

<details>
<summary>Hint</summary>

The `CharacterCountController` demonstrates the principle of **composition**. Its `__init__` method will look something like this:
```python
class CharacterCountController:
    def __init__(self, path_to_file):
        self._source = TextSource(path_to_file)
        self._processor = TextProcessor()
        self._analyzer = FrequencyAnalyzer()
        self._printer = ResultPrinter()
```
The `run` method will then use these components: `raw_text = self._source.get_text()`, and so on.

</details>

---

**Topic 2: Advanced Functional Styles**

In the previous topic, we established the "Pipeline" as our baseline functional style. It uses a composition of pure functions to transform data. Now, we will explore more advanced and powerful styles that build upon this functional foundation. We will begin by looking at **recursion**, which is the fundamental mechanism that underpins many declarative and functional algorithms.

## 5. The Infinite Mirror Style (Recursion)
The Infinite Mirror style formalizes the use of **recursion** as the primary control structure for solving a problem. This approach is rooted in the mathematical concept of induction. An inductive solution is achieved in two steps:
1.  **Base Case:** Solve the problem for the simplest possible input (e.g., an empty list).
2.  **Inductive/Recursive Step:** Define the solution for a given input in terms of the solution for a slightly smaller version of that input.

By repeatedly applying the recursive step, the problem is broken down into smaller and smaller pieces until the base case is reached, at which point the chain of solutions can be resolved. This is the core of "thinking recursively," a foundational skill from Chapter 2.

**Constraints:**
1.  The problem is modeled using induction.
2.  The implementation uses recursive functions.
3.  The base case and the recursive step must be clearly defined.

A major practical consideration with this style in Python is the **recursion depth limit**. Python's interpreter has a built-in limit (typically around 1000) on how many times a function can call itself to prevent a "stack overflow" error. For problems with very large inputs, a purely recursive solution may not be feasible without special handling.

### Example: Word Frequency
In this example, the `count` function processes a list of words recursively. It processes the head of the list (`word_list[0]`) and then calls itself on the tail (`word_list[1:]`). The base case is an empty list. Because a large text file can easily exceed the recursion limit, the main part of the script processes the words in chunks.

```python
#!/usr/bin/env python
import re
import sys
import operator

# Set a higher recursion limit for this style.
# This may be necessary for the recursive functions to handle larger inputs.
RECURSION_LIMIT = 2000
sys.setrecursionlimit(RECURSION_LIMIT + 10)

def count(word_list, stopwords, wordfreqs):
    """
    Recursively counts word frequencies.
    The wordfreqs dictionary is mutated by this function.
    """
    # Base case: an empty list.
    if not word_list:
        return
    
    # Recursive step:
    # 1. Process the head of the list.
    word = word_list[0]
    if word not in stopwords:
        wordfreqs[word] = wordfreqs.get(word, 0) + 1
    
    # 2. Call self on the tail of the list.
    count(word_list[1:], stopwords, wordfreqs)

def wf_print(word_freq_list):
    """
    Recursively prints the top 25 word frequencies.
    """
    if not word_freq_list:
        return
    
    word, freq = word_freq_list[0]
    print(word, '-', freq)
    wf_print(word_freq_list[1:])

# --- Main logic ---
stop_words = set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
    'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
    'were', 'will', 'with'
])

words = re.findall('[a-z]{2,}', open(sys.argv[1]).read().lower())
word_freqs = {}

# Due to Python's recursion limit, we process the list in chunks.
# A purely functional language might optimize this recursion automatically.
for i in range(0, len(words), RECURSION_LIMIT):
    count(words[i:i+RECURSION_LIMIT], stop_words, word_freqs)

# The printing can also be done recursively.
sorted_freqs = sorted(word_freqs.items(), key=operator.itemgetter(1), reverse=True)
wf_print(sorted_freqs[:25])
```

### Exercise: Refactor to the Infinite Mirror Style
Your task is to refactor the **Character Count** problem into the Infinite Mirror style. The core of this exercise is to replace any explicit `for` loops that iterate over a data sequence with recursive functions.

**Instructions:**
1.  Start with your **Pipeline style** solution, as its functional decomposition is a good starting point.
2.  Identify which of your functions use loops to process a sequence. These will be `filter_chars`, `count_frequencies`, and `print_results`.
3.  Rewrite these three specific functions to use recursion instead of loops:
    *   `filter_chars_recursive(text: str) -> str`:
        *   **Base case:** An empty input string returns an empty string.
        *   **Recursive step:** Process the `head` of the string. If it's a letter, prepend it to the result of recursing on the `tail`. Otherwise, just recurse on the `tail`.
    *   `count_frequencies_recursive(text: str, counts: dict) -> None`:
        *   This function will have a side effect on the `counts` dictionary.
        *   **Base case:** An empty input string does nothing.
        *   **Recursive step:** Update the `counts` for the `head` of the string, then recurse on the `tail`.
    *   `print_results_recursive(sorted_data: list, num: int) -> None`:
        *   **Base case:** An empty list or `num == 0`.
        *   **Recursive step:** Print the `head` of the list, then recurse on the `tail` with `num - 1`.
4.  The other functions (`read_file`, `normalize`, `sort`) do not involve sequence iteration in the same way and can remain non-recursive.
5.  Update your main script to call these new recursive functions.

<details>
<summary>Hint</summary>

For `filter_chars_recursive`, the structure will look something like this:
```python
def filter_chars_recursive(text):
    if not text:
        return ""
    head = text[0]
    tail = text[1:]
    if head.isalpha():
        return head + filter_chars_recursive(tail)
    else:
        return filter_chars_recursive(tail)
```
You will need to adapt this pattern for the other required functions.

</details>

---

## 6. The Kick Forward Style (Continuation-Passing)
The Kick Forward style, known formally as **Continuation-Passing Style (CPS)**, is a powerful functional pattern that makes the flow of control in a program completely explicit. It represents a fundamental shift away from the standard call/return mechanism.

In this style, functions **do not return values**. Instead, they take an extra argument: a **continuation**. A continuation is a function that represents "the rest of the computation." When a function finishes its work, it doesn't return its result to its caller; instead, it calls the continuation function, passing the result to it. The program's execution is a single, continuous chain of function calls, where each function "kicks" its result forward to the next one in the chain.

**Constraints:**
1.  Functions do not `return` values to their immediate caller.
2.  Each function takes an additional argument: a continuation function to be called with the result.
3.  The main program starts the chain by calling the first function and providing it with a continuation that will execute the next step.

This style might seem unusual, but it is a foundational concept in the design of compilers and programming languages. It is also the underlying mechanism for how asynchronous programming (like with callbacks in JavaScript or `async/await` in Python) is often implemented, as it provides a way to handle long-running operations without blocking the program.

### Example: Word Frequency
Each function takes its data and a continuation. The main function is a series of nested `lambda` functions that explicitly build the chain of continuations. The final continuation in the chain simply prints the results.

```python
#!/usr/bin/env python
import sys
import re
import operator
import string

#
# The functions in Continuation-Passing Style
#
def read_file(path_to_file, continuation):
    """Takes a path and a continuation. Calls the continuation with the file's contents."""
    with open(path_to_file) as f:
        data = f.read()
    continuation(data)

def filter_chars(str_data, continuation):
    """Takes a string and a continuation. Calls the continuation with a filtered version."""
    pattern = re.compile('[\W_]+')
    continuation(pattern.sub(' ', str_data))

def normalize(str_data, continuation):
    """Takes a string and a continuation. Calls the continuation with the lowercase version."""
    continuation(str_data.lower())

def scan(str_data, continuation):
    """Takes a string and a continuation. Calls the continuation with a list of words."""
    continuation(str_data.split())

def remove_stop_words(word_list, continuation):
    """Takes a word list and a continuation. Calls the continuation with stop words removed."""
    stop_words = [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
        'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
        'were', 'will', 'with'
    ]
    stop_words.extend(list(string.ascii_lowercase))
    continuation([w for w in word_list if w not in stop_words])

def frequencies(word_list, continuation):
    """Takes a word list and a continuation. Calls the continuation with a frequency dict."""
    word_freqs = {}
    for w in word_list:
        word_freqs[w] = word_freqs.get(w, 0) + 1
    continuation(word_freqs)

def sort(word_freqs, continuation):
    """Takes a frequency dict and a continuation. Calls the continuation with a sorted list."""
    continuation(sorted(word_freqs.items(), key=operator.itemgetter(1), reverse=True))

def print_results(sorted_data):
    """The final function in the chain. It has no continuation."""
    for word, freq in sorted_data[0:25]:
        print(word, '-', freq)

#
# The main function, which builds the chain of continuations
#
read_file(sys.argv[1], lambda text:
    filter_chars(text, lambda filtered_text:
    normalize(filtered_text, lambda normalized_text:
    scan(normalized_text, lambda words:
    remove_stop_words(words, lambda filtered_words:
    frequencies(filtered_words, lambda freqs:
    sort(freqs, lambda sorted_freqs:
    print_results(sorted_freqs)
)))))))
```

#### Exercise: Refactor to the Kick Forward Style
Your task is to refactor the **Character Count** script into the Kick Forward (Continuation-Passing) style. You will transform your pure functions from the Pipeline style into functions that use continuations.

**Instructions:**
1.  Start with your solution from the **Pipeline Style** exercise.
2.  Modify the signature of each of your first five functions (`read_file`, `normalize`, `filter_chars`, `count_frequencies`, `sort`). Each one should now take its normal input argument plus a final `continuation` function argument.
3.  Modify the body of each of these functions. Instead of `return result`, each function must now end by calling `continuation(result)`.
4.  Your `print_results` function will be the final step and does not need a continuation.
5.  Rewrite the main part of your script to be a series of nested `lambda` functions that explicitly define the "rest of the computation" at each step. This will start with the call to `read_file` and end with the call to `print_results`.

<details>
<summary>Hint</summary>

Here is a before-and-after example for the `normalize` function.

**Before (Pipeline Style):**
```python
def normalize(text: str) -> str:
    return text.lower()
```

**After (Kick Forward Style):**
```python
def normalize(text: str, continuation):
    result = text.lower()
    continuation(result) # Instead of returning, we call the continuation
```

Your main execution block will be a single, nested expression that wires these functions together. It will look like this:
```python
read_file(sys.argv[1], lambda raw_text:
    normalize(raw_text, lambda normalized_text:
        # ... continue the chain here ...
            sort(counts, lambda sorted_list:
                print_results(sorted_list)
            )
        # ...
    )
)
```

</details>

---

## 7. The One Style (Monadic)
The One style offers a highly structured and elegant way to sequence computations. It takes the pure functions from the Pipeline style and provides a new mechanism for composing them. The core idea is to create a "wrapper" or "container" object that holds a value as it moves through a processing pipeline.

This object, which we'll call "The One," has a central method, typically named `bind`. The `bind` method takes a function as an argument, applies that function to the value currently held inside the wrapper, updates the wrapper's internal value with the result, and - most importantly - returns the wrapper object itself. This ability to return `self` is what enables the creation of a clean, linear chain of method calls.

This pattern is a simplified implementation of a powerful concept from functional programming known as a **Monad**. It allows us to abstract away the mechanics of sequencing and focus entirely on the transformations themselves.

**Constraints:**
1.  A central "wrapper" class is defined to hold the data being processed.
2.  This class has a `bind` method that takes a function and applies it to the wrapped value.
3.  The `bind` method must return the wrapper instance (`self`) to enable method chaining.
4.  The main program logic is expressed as a single, continuous chain of `bind` calls.

### Example: Word Frequency
In this implementation, the `TFTheOne` class acts as the monadic wrapper. The main function creates an instance with the initial file path and then uses a chain of `.bind()` calls to apply each processing function in sequence. A final function, `top25_freqs`, is used to format the data into a string, which is then printed by a terminal method.

```python
#!/usr/bin/env python
import sys
import re
import operator
import string

#
# The "wrapper" class for this style
#
class TFTheOne:
    def __init__(self, v):
        """Initializes the wrapper with a starting value."""
        self._value = v

    def bind(self, func):
        """Applies a function to the internal value and returns self."""
        self._value = func(self._value)
        return self

    def printme(self):
        """A terminal action to print the final value."""
        print(self._value)

#
# The pure functions (same as the Pipeline style)
#
def read_file(path_to_file):
    with open(path_to_file) as f:
        return f.read()

def filter_chars(str_data):
    pattern = re.compile('[\W_]+')
    return pattern.sub(' ', str_data)

def normalize(str_data):
    return str_data.lower()

def scan(str_data):
    return str_data.split()

def remove_stop_words(word_list):
    stop_words = [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
        'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
        'were', 'will', 'with'
    ]
    stop_words.extend(list(string.ascii_lowercase))
    return [w for w in word_list if w not in stop_words]

def frequencies(word_list):
    word_freqs = {}
    for w in word_list:
        word_freqs[w] = word_freqs.get(w, 0) + 1
    return word_freqs

def sort(word_freqs):
    return sorted(word_freqs.items(), key=operator.itemgetter(1), reverse=True)

def top25_freqs(word_freqs):
    """Takes the sorted list and returns a single formatted string."""
    top25_lines = []
    for tf in word_freqs[0:25]:
        top25_lines.append(f"{tf[0]} - {tf[1]}")
    return "\n".join(top25_lines)

#
# The main function, expressed as a single chain
#
TFTheOne(sys.argv[1])\
    .bind(read_file)\
    .bind(filter_chars)\
    .bind(normalize)\
    .bind(scan)\
    .bind(remove_stop_words)\
    .bind(frequencies)\
    .bind(sort)\
    .bind(top25_freqs)\
    .printme()
```

#### Exercise: Refactor to The One Style
Your task is to refactor the **Character Count** script into The One (Monadic) style. You will create a wrapper class and use it to chain together the pure functions you developed for the Pipeline style.

**Instructions:**
1.  Start with your pure functions from the **Pipeline Style** exercise. You will use these as the operations in your chain.
2.  Create a new wrapper class, e.g., `CharCountMonad`.
3.  Implement the `__init__(self, value)` method to store the initial value.
4.  Implement the `bind(self, func)` method. It must apply `func` to `self._value`, update `self._value` with the result, and `return self`.
5.  Create one new function, `format_results(sorted_data)`, which takes your sorted list of `(char, count)` pairs and returns a single, multi-line string suitable for printing.
6.  Implement a final method in your `CharCountMonad` class, `print_value()`, that simply prints the `self._value`.
7.  Rewrite the main part of your script to be a single, chained expression that:
    *   Initializes your `CharCountMonad` with the file path.
    *   Calls `bind` for each of your processing functions (`read_file`, `normalize`, `filter_chars`, `count_frequencies`, `sort`, and `format_results`).
    *   Ends with a call to `print_value()`.

<details>
<summary>Hint</summary>

Your `bind` method is the core of this style. Its implementation is very direct:
```python
def bind(self, func):
    self._value = func(self._value)
    return self
```
The reason you need a new `format_results` function is to prepare the data for the simple `print_value()` method. Your `print_results` function from the Pipeline style performs a loop and prints multiple lines, which is a complex action. The monadic style works best when the functions bound are pure transformations, and the final action is as simple as possible.

Your final chain will look like this:
```python
CharCountMonad(sys.argv[1])\
    .bind(read_file)\
    .bind(normalize)\
    # ... other functions ...
    .bind(format_results)\
    .print_value()
```

</details>

---

**Topic 3: Variations in Object-Oriented Design**

## 8. The Letterbox Style (Message Passing)
... *(To be continued)* ...