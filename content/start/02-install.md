---
title: Install your tools
summary: Get a Linux terminal, a compiler, Git and Python, with one script.
---

## What you need

- A **terminal** running Linux (or macOS).
- A **C compiler** (`gcc`), **Python 3** and **Git**.
- A **code editor**. This guide uses VS Code.

The `setup` folder of this project installs all of it for you.

## Windows

Windows runs Linux through **WSL** (Windows Subsystem for Linux). It is a real Ubuntu system living next to Windows, and it is what you will work in.

1. Open the Start menu, type `PowerShell`, right-click it and choose **Run as administrator**.
2. Go to the folder where you put this project and run the installer:

```console
$ cd zero2dev\setup
$ powershell -ExecutionPolicy Bypass -File .\install.ps1
```

3. The first run installs WSL and Ubuntu, then asks you to **restart**.
4. After the restart, open **Ubuntu** from the Start menu. It asks you to choose a Linux user name and password. The password stays invisible while you type. That is normal.
5. Run the same `install.ps1` command again. This time it installs the tools inside Ubuntu.

From now on, do everything in the **Ubuntu** terminal, not in PowerShell.

> Keep your code inside the Linux home folder (`~`), not under `/mnt/c`. Files there are much faster, and tools behave correctly.

## Ubuntu or Debian Linux

```console
$ cd zero2dev/setup
$ ./install.sh
```

It shows a menu of **stacks**. Press Enter to take the default (C tools, Python, Node.js), or name the ones you want:

```console
$ ./install.sh --list
$ ./install.sh --stack java,elixir,postgres
```

You can run the script again at any time. It skips what is already installed.

## macOS

The script does not cover macOS. Install the Xcode command line tools, which include `gcc`, `make` and `git`, then Python from python.org or Homebrew:

```console
$ xcode-select --install
```

## Check that it worked

From the `zero2dev` folder:

```console
$ python3 check.py doctor
Toolchains
  ✓ C           gcc (Ubuntu 13.2.0) 13.2.0
  ✓ git         git version 2.43.0
  ✓ Python      Python 3.12.3
  – Java        not installed   (setup/install.sh --stack java)
```

You need the first three lines to show a tick to begin. The others can wait until you reach their track.

## If something fails

- **`command not found`**: the tool is not installed, or the terminal was opened before the install. Close the terminal and open a new one.
- **`Permission denied` when running a script**: run it as `bash install.sh`.
- **`sudo` asks for a password**: it is the Linux password you chose, not your Windows one.

Next: [the terminal](start/03-terminal).
