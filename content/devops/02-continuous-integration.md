---
title: Continuous integration
summary: Every change is built and tested automatically, before it reaches the main branch.
---

## The problem

Three developers work for two weeks on separate branches. On the last day they merge. Nothing fits, the tests that still exist fail, and nobody knows which change broke what.

**Continuous integration (CI)** is the cure: everyone merges small changes into the main branch **often**, at least daily, and **a machine checks every change** before it is merged.

## What a pipeline does

A **pipeline** is a script that runs on a clean machine for every push and every pull request:

```text
checkout  ->  install dependencies  ->  lint  ->  test  ->  build
```

| Step | Catches |
| --- | --- |
| **lint** and format check | syntax errors, style, obvious bugs. Fast, so it runs first. |
| **test** | behaviour that broke |
| **build** | code that does not compile or package |
| **security scan** | vulnerable dependencies, leaked secrets |

If any step fails, the pipeline is **red** and the change cannot be merged. The rule that makes CI work: **a red main branch is the team's first priority.** Nobody builds on top of a broken base.

## Fail fast

Order the steps from quick to slow. A typo found in ten seconds costs nothing. The same typo found after a twenty-minute test run costs a coffee and your concentration.

A script that stops at the first failure:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "== lint"
python3 -m py_compile *.py

echo "== test"
python3 -m unittest -q

echo "== all checks passed"
```

`set -e` makes the script exit as soon as a command fails, with that command's exit code. The **exit code** is the whole interface between your checks and the CI system: 0 is green, anything else is red.

Keep the checks in a script like this, in the repository. Then everyone can run exactly what CI runs, **before** pushing: `./ci.sh`.

## GitHub Actions

GitHub runs pipelines described in YAML files under `.github/workflows/`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Run the checks
        run: ./ci.sh
```

| Key | Meaning |
| --- | --- |
| `on` | the events that start the workflow |
| `jobs` | independent units of work. Jobs run in parallel unless one `needs` another. |
| `runs-on` | the kind of machine: a fresh virtual machine every time |
| `steps` | run in order. A failing step stops the job. |
| `uses` | a ready-made action from the marketplace |
| `run` | a shell command |

The machine starts **empty** every time. Nothing is left from the previous run. That is the point: if it passes there, it does not depend on something lying around on your laptop.

GitLab CI, Jenkins, CircleCI and others have the same ideas with different spelling.

## Useful features

**A matrix** runs the same job in several configurations:

```yaml
    strategy:
      matrix:
        python-version: ["3.10", "3.12"]
```

**Caching** keeps downloaded dependencies between runs, which often halves the time:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
```

**Secrets** are stored in the repository settings and reach a step as environment variables. They are hidden in the logs:

```yaml
      - run: ./deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

## Protecting the main branch

CI helps only if it cannot be skipped. In the repository settings, a **branch protection rule** for `main` requires:

- changes arrive through a pull request;
- the CI checks have passed;
- someone has reviewed the change.

From then on, `main` always works. That is what makes it safe to deploy from.

## Good pipelines

- **Fast.** Under ten minutes. People stop waiting for slow pipelines and merge blind.
- **Reliable.** A test that fails at random teaches everyone to ignore red. Fix or remove flaky tests at once.
- **The same as local.** One script, used by people and by CI.
- **Quiet when green, clear when red.** The failure message should say what to fix.

## Common mistakes

- **Checks that exist only in the CI configuration**, so nobody can run them locally.
- **Ignoring a red pipeline** "because it is probably flaky".
- **Slow steps first.**
- **Secrets printed to the log** by a debugging `echo`.
- **Merging without CI** "just this once".
