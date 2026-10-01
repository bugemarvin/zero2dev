# A CI script and a workflow

Your working folder is a Git repository with a small Python project: `calc.py` and `test_calc.py`. Add continuous integration to it.

## 1. `ci.sh`

A script that runs the checks and stops at the first failure.

- It prints the line `== lint`, then checks every Python file for syntax errors: `python3 -m py_compile *.py`
- It prints `== test`, then runs the tests: `python3 -m unittest -q`
- If both succeed it prints `== all checks passed` and exits with code 0.
- If a step fails, the script stops there with a code other than 0.
- It is executable: `chmod +x ci.sh`.

Try it: `./ci.sh`. Then break `calc.py` on purpose, run it again, and repair the file.

## 2. `.github/workflows/ci.yml`

A GitHub Actions workflow that:

- runs on every `push` and every `pull_request`;
- has one job that `runs-on: ubuntu-latest`;
- checks out the code with `actions/checkout@v4`;
- runs `./ci.sh`.

## 3. Commit

Commit both files. `git status` must report a clean working tree.
