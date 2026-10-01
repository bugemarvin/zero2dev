---
title: Images and containers
summary: Run any program in an isolated box that carries everything it needs, and throw the box away afterwards.
---

## The problem Docker solves

"It works on my machine" is the oldest complaint in software. A program depends on a particular language version, libraries, system packages and settings. Reproducing all of that on another computer is slow and error-prone.

A **container** packages a program together with everything it needs to run, down to the system libraries. The same container runs the same way on your laptop, on a colleague's, and on a server.

This guide uses Docker itself in that way: when a language is not installed on your machine, the app runs your exercises in a container that has it.

## Two words to keep apart

| Word | Meaning | Comparison |
| --- | --- | --- |
| **image** | a read-only package: files plus the command to start | a class, or a recipe |
| **container** | a running instance of an image | an object, or the meal |

You can start many containers from one image. Each has its own files and processes, and none can see the others.

A container is not a virtual machine. It shares the kernel of the host and is just an ordinary process with a restricted view of the system, which is why it starts in a fraction of a second.

## Checking the installation

```console
$ docker --version
$ docker run --rm hello-world
```

If the second command prints a greeting, Docker works. On Linux, `./setup/install.sh --stack docker` installs it. On Windows and macOS, install Docker Desktop.

## Running a container

```console
$ docker run --rm alpine:3 echo "hello from a container"
hello from a container
```

Piece by piece:

- `docker run` creates a container from an image and starts it.
- `--rm` deletes the container when it exits. Without it, stopped containers pile up.
- `alpine:3` is the image: a tiny Linux system. The part after the colon is the **tag**, usually a version.
- `echo "hello from a container"` is the command to run inside.

The first time, Docker **pulls** the image from Docker Hub, the public registry. After that it is stored on your machine.

The container has its own file system. This shows the operating system **inside** the container, not yours:

```console
$ docker run --rm alpine:3 cat /etc/os-release
NAME="Alpine Linux"
```

A shell needs `sh -c` when the command uses shell features:

```console
$ docker run --rm alpine:3 sh -c 'echo $((6 * 7))'
42
```

## An interactive shell

```console
$ docker run --rm -it alpine:3 sh
/ # ls
/ # exit
```

`-it` connects your terminal to the container. Anything you change inside is gone when you exit, because the container is removed. That makes containers a safe place to experiment.

## Long-running containers

A server keeps running, so start it in the background:

```console
$ docker run -d --name web -p 8080:80 nginx:alpine
$ docker ps
$ docker logs web
$ docker stop web
$ docker rm web
```

| Option | Meaning |
| --- | --- |
| `-d` | detached: run in the background |
| `--name web` | a name to refer to it by |
| `-p 8080:80` | port 8080 on your machine reaches port 80 in the container |

## The commands you need

| Command | Does |
| --- | --- |
| `docker ps` | list running containers (`-a` includes stopped ones) |
| `docker logs NAME` | show a container's output (`-f` follows it) |
| `docker exec -it NAME sh` | open a shell in a running container |
| `docker stop NAME` | stop it |
| `docker rm NAME` | delete it |
| `docker images` | list the images on this machine |
| `docker pull IMAGE` | download an image |
| `docker rmi IMAGE` | delete an image |
| `docker system df` | show how much disk space Docker uses |

## Choosing images

- Prefer **official images** such as `python`, `node`, `postgres`.
- Give a **version tag**: `python:3.12`, not `python`. With no tag you get `latest`, which changes over time.
- Variants ending in `-slim` or `-alpine` are much smaller.

## Common mistakes

- **Forgetting `--rm`**, and collecting hundreds of stopped containers. `docker container prune` removes them.
- **Expecting files to survive.** A container's own file system is thrown away with the container. Lesson 3 shows how to keep data.
- **`permission denied` on the Docker socket** on Linux. Add your user to the `docker` group, then log out and in.
- **Confusing image and container.** You build and pull images. You run, stop and remove containers.
