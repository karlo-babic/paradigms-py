---
layout: default
title: Software Setup
nav_order: 2
---

# Software

This page guides you through setting up the necessary software for the course. The primary requirement is a working Python environment. The installation of the Mozart/Oz system is optional.

## Python 3.10+ (Required)

Python is the primary language we will use for all examples, assignments, and projects. It is essential that you have a modern version installed.

- **Version Requirement:** We require **Python 3.10 or newer**. This version introduced the powerful `match ... case` structural pattern matching feature, which is an excellent modern equivalent to a concept we will explore from other languages.
- **Check your version:** Open a terminal or command prompt and run:
    ```sh
    python3 --version
    # or on some systems, python --version
    ```
- **Installation:** If you don't have the correct version, you can download it from the [official website](https://www.python.org/downloads/).

### Code Editor: Visual Studio Code

While you can use any editor you like, we highly recommend using [Visual Studio Code](https://code.visualstudio.com/). It is a free, powerful, and highly extensible editor that works well for Python development.

To get the best experience, you should install the official [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) from Microsoft, which provides syntax highlighting, code completion (IntelliSense), debugging, and more.

## Mozart Programming System (Optional)

As mentioned in the course introduction, we will occasionally show small code snippets in the **Oz** programming language to illustrate concepts in their purest form. You are **not required** to install Oz or run these examples yourself, as all necessary code will be displayed in the course materials.

However, if you are curious and wish to experiment with the Oz examples directly, you can install the Mozart Programming System.

- If on Linux:
    - [Download](https://github.com/mozart/mozart2/releases/) "mozart2-2.0.1-x86_64-linux.deb"
- If on Windows:
    - [Download](https://sourceforge.net/projects/mozart-oz/files/v2.0.1/) windows installation (exe)
- After installing, you can run the "Mozart Programming System," which starts an environment for Oz development.
