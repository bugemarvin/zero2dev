---
title: Releases and versions
summary: Numbers that mean something, artifacts built once, and a history people can read.
---

## Why versions

"The latest one" is not something you can deploy, roll back to, or name in a bug report. A **version** is a name for one exact state of the software.

## Semantic versioning

The most common scheme has three numbers: **MAJOR.MINOR.PATCH**, for example `2.4.1`.

| Part | Increase it when | Effect on users |
| --- | --- | --- |
| **MAJOR** | you make a change that is **not backwards compatible** | they may need to change their code |
| **MINOR** | you add something, in a compatible way | safe to upgrade |
| **PATCH** | you fix a bug, in a compatible way | safe to upgrade |

When a part increases, the parts to its right go back to zero:

```text
2.4.1  --patch-->  2.4.2
2.4.1  --minor-->  2.5.0
2.4.1  --major-->  3.0.0
```

The numbers are compared **as numbers**, part by part: `1.10.0` is newer than `1.9.0`. Sorting versions as text gets that wrong, and it is a classic bug.

A version below `1.0.0` means "anything may still change".

## Tags

In Git, a release is a **tag**: a permanent name for a commit.

```console
$ git tag -a v2.5.0 -m "Release 2.5.0"
$ git push origin v2.5.0
$ git describe --tags          # the nearest tag, plus how far you are past it
v2.5.0-3-g1a2b3c4
```

A tag never moves. `v2.5.0` means the same commit today and in five years.

## Commit messages that drive releases

The **Conventional Commits** format puts the kind of change at the start of the message:

```text
fix: handle an empty cart
feat: add gift cards
feat!: remove the v1 checkout API
docs: explain the refund flow
```

| Prefix | Meaning | Version bump |
| --- | --- | --- |
| `fix:` | a bug fix | patch |
| `feat:` | a new feature | minor |
| `feat!:` or `fix!:`, or `BREAKING CHANGE` in the message | not backwards compatible | major |
| `docs:`, `test:`, `chore:`, `refactor:` | nothing a user notices | none |

With this convention, a tool can read the commits since the last release, work out the next version, and write the changelog. The largest bump wins: one breaking change among twenty fixes makes it a major release.

## The changelog

A changelog tells users what changed, in their terms:

```text
## 2.5.0

### Added
- Gift cards can be bought and redeemed.

### Fixed
- An empty cart no longer shows an error.
```

Write it for the reader who must decide whether to upgrade.

## Artifacts: build once

A release produces an **artifact**: the thing that is actually deployed. A Docker image, a compiled binary, a package.

```console
$ docker build -t registry.example.com/shop:2.5.0 .
$ docker push registry.example.com/shop:2.5.0
```

The rules:

- **Build once.** The image tested in CI is the image that runs in production. Rebuilding "the same code" for production can pull a newer dependency and produce something nobody tested.
- **Tags are never reused.** `shop:2.5.0` is one image for ever. Do not deploy `latest`: nobody can say what it is, or what it was yesterday.
- **Keep old artifacts.** Rolling back means deploying the previous one, and it must still exist.

## Pin your dependencies

A **lock file** (`package-lock.json`, `go.sum`, `Cargo.lock`, `poetry.lock`) records the exact version of every dependency. Commit it. Without it, the same commit builds differently on different days.

Dependencies also need **updates**, for security fixes. Tools such as Dependabot and Renovate open pull requests for them, and your CI tells you whether the update is safe.

## Releasing is not deploying

- A **release** is a version that exists and could be used.
- A **deployment** puts a version on servers.
- **Feature flags** separate deploying code from turning a feature on. The code is in production, switched off, and is switched on for 1% of users, then 10%, then everyone, with no new deployment. If it misbehaves, switch it off.

## Common mistakes

- **Comparing versions as text.**
- **Moving or reusing a tag.**
- **Deploying `latest`.**
- **Rebuilding for each environment.**
- **A breaking change in a minor release**, which breaks everyone who trusted the numbers.
- **No lock file.**
