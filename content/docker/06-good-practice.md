---
title: Good practice
summary: Smaller, safer, faster images, and how to keep Docker from filling your disk.
---

## Small images

A smaller image downloads faster, starts faster and contains less that can be attacked.

**Start from a small base.**

| Base | Rough size |
| --- | --- |
| `python:3.12` | 1 GB |
| `python:3.12-slim` | 130 MB |
| `python:3.12-alpine` | 50 MB |

`-slim` is the safe default. `-alpine` is smaller still, and uses a different C library, which occasionally causes trouble with packages that include compiled code.

**Leave out what the program does not need**, with `.dockerignore`.

**Clean up in the same instruction.** Each `RUN` is a layer, and a file deleted in a later layer still takes space in the earlier one:

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

## Multi-stage builds

Building often needs tools that running does not: compilers, development packages. A **multi-stage build** uses one image to build and copies only the result into a clean one.

```dockerfile
FROM golang:1.23 AS build
WORKDIR /src
COPY . .
RUN go build -o /app/server .

FROM alpine:3
COPY --from=build /app/server /usr/local/bin/server
CMD ["server"]
```

The first stage is close to a gigabyte. The final image is a few megabytes: a small base and one file.

The same approach works for a Node front end: build with Node, then serve the generated files from a small web server image.

## Do not run as root

By default the process in a container is root. If an attacker gets control of it, they are root inside the container, which makes escaping easier. Create a user and switch to it:

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY --chown=node:node . .
USER node
CMD ["node", "server.js"]
```

The official Node image ships with a user called `node`. Other images need `RUN adduser ...` first.

## Secrets

Never put a secret in an image: not with `COPY`, not with `ENV`, not with `ARG`. Every layer can be inspected by anyone who has the image.

- Pass secrets when the container **starts**: `-e`, `--env-file`, or the secret mechanism of your platform.
- Keep `.env` in both `.gitignore` and `.dockerignore`.

## Reproducible builds

- **Pin versions.** `FROM node:22.11-slim`, not `node:latest`.
- **Install from a lock file**: `npm ci`, `pip install -r requirements.txt` with exact versions.
- The same Dockerfile should produce the same image next month.

## Health checks

Tell Docker how to see whether the program inside is really working, not merely running:

```dockerfile
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://localhost:8000/health || exit 1
```

`docker ps` then shows `healthy` or `unhealthy`, and Compose can wait for it.

## One process per container

A container runs one main process: the web server, or the database, or the worker. Not all three. Separate containers can be restarted, scaled and updated on their own, and Compose makes running several of them easy.

## Logs go to standard output

A program in a container should print its logs, not write them to files inside the container. Docker collects standard output, `docker logs` shows it, and hosting platforms forward it to wherever logs are kept.

## Keeping your disk

Images, stopped containers and volumes add up to many gigabytes over time.

```console
$ docker system df                 # what is using space
$ docker container prune           # remove stopped containers
$ docker image prune               # remove images that nothing uses
$ docker volume prune              # remove unused volumes: check first, this deletes data
$ docker system prune              # the first two, plus unused networks
```

This guide's own containers are all named `z2d-` followed by something. `python3 check.py services down --purge` removes the service containers and their data. The images stay until you remove them with `docker rmi`.

## A checklist

- a small, pinned base image
- `.dockerignore` present
- dependencies installed before the code is copied
- a multi-stage build when there is a build step
- runs as a user other than root
- no secrets in the image
- configuration through environment variables
- logs on standard output
- a health check

## Where to go next

You can now package any program and run it next to its database. The [Microservices](microservices/01-what-and-why) track uses exactly these skills to run several services that work together.

## Common mistakes

- **`latest` as the tag**, in `FROM` or for your own images.
- **A secret passed as a build argument.**
- **Several programs crammed into one container.**
- **`docker system prune -a --volumes`** typed without reading what it will delete.
- **Never pruning**, until the disk is full.
