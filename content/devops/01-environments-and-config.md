---
title: Environments and configuration
summary: What DevOps means, the road from a laptop to production, and configuration done right.
---

This track builds on [the terminal](start/03-terminal), [Git](git/01-first-commit), [Bash](bash/01-variables-and-quoting) and [Docker](docker/01-images-and-containers).

## What DevOps is

For a long time, developers wrote software and a separate operations team ran it. Developers wanted to change things, operations wanted things stable, and software was released a few times a year, with dread.

**DevOps** is the practice of treating building and running as **one job**, done by the same team, with automation in place of hand-work. Its ideas:

- **Small, frequent changes.** A release of ten lines is easy to understand and easy to undo. A release of ten thousand is neither.
- **Automate everything that is repeated.** Tests, builds, deployments, server set-up. A script does the same thing every time. A tired person at midnight does not.
- **Everything in version control.** Code, configuration, infrastructure. If it is not in Git, it does not exist.
- **You build it, you run it.** The people who write the code see how it behaves in production, and are woken when it breaks. That improves the code remarkably fast.
- **Measure.** You cannot improve what you cannot see.

## Environments

The same application runs in several places:

| Environment | Purpose |
| --- | --- |
| **development** | your machine. Break things freely. |
| **test / CI** | a clean machine that runs the automated checks on every change |
| **staging** | a copy of production, for a last look with realistic data |
| **production** | the real thing, with real users |

The single most valuable rule: **the same build runs everywhere.** You build the application once, as one artifact such as a Docker image, and that exact artifact moves from test to staging to production. What changes between environments is only the **configuration**.

"It works on my machine" is the sentence this rule exists to end.

## Configuration

Configuration is everything that differs between environments: database addresses, API keys, feature switches, log levels.

**Configuration does not belong in the code.**

```python
DATABASE = "postgres://admin:hunter2@10.0.3.7/prod"     # wrong, in three ways
```

It is wrong because the code now works in one environment only, because changing it needs a new release, and because a password is in Git for ever.

Read it from **environment variables**:

```python
import os

DATABASE_URL = os.environ["DATABASE_URL"]            # required: fails at once if missing
LOG_LEVEL = os.environ.get("LOG_LEVEL", "info")      # optional, with a default
```

Every language, every container platform and every CI system supports environment variables. This is one of the **twelve-factor app** principles, a short list of habits for services that are easy to deploy. Others you have already met: one codebase in version control, dependencies declared explicitly, logs written to standard output, processes that hold no state of their own.

## Fail at start-up

Check the configuration **once, when the program starts**, and stop with a clear message if something is missing:

```text
error: missing configuration: DATABASE_URL, STRIPE_KEY
```

A service that refuses to start is noticed in seconds, by the deployment. A service that starts and crashes on the first payment at 3 a.m. is noticed by a customer.

## .env files

During development, variables are kept in a file named `.env`:

```text
# local settings
DATABASE_URL=postgres://localhost/shop_dev
LOG_LEVEL=debug
```

- **`.env` goes in `.gitignore`.** It holds secrets and is different for every developer.
- A file `.env.example` with the names and harmless values **is** committed. It documents what the application needs.

## Secrets

A **secret** is configuration that gives access: passwords, API keys, tokens, private keys.

- Never in Git. Not in a private repository, not "just for now". Git remembers everything, and removing a secret from history is painful and unreliable.
- Never in a Docker image, a log line or an error message.
- Stored in the secret store of your platform (GitHub Actions secrets, a cloud secret manager, Vault), and handed to the program as environment variables or files at run time.
- Each environment has its own. A leaked staging key must not open production.
- If a secret leaks, **rotate it**: create a new one and disable the old. Deleting the commit is not enough.

## Infrastructure as code

Servers, networks and databases set up by clicking in a web console cannot be reviewed, repeated or rolled back. **Infrastructure as code** describes them in files:

```yaml
# docker-compose.yml: a small example of the idea
services:
  web:
    image: shop:1.4.2
    environment:
      DATABASE_URL: ${DATABASE_URL}
    ports:
      - "8080:8080"
```

Tools such as Terraform, Pulumi and Kubernetes manifests do this for whole cloud environments. The files live in Git, changes are reviewed like code, and a destroyed environment can be rebuilt with one command.

## Common mistakes

- **Secrets in the repository.**
- **A different build for each environment.**
- **Configuration read in many places**, with different defaults.
- **A default for something that must be set**, such as `SECRET_KEY = os.environ.get("SECRET_KEY", "dev")`. Production then runs happily with "dev".
- **Changes made by hand on a server**, which nobody can reproduce.
