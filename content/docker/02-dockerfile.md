---
title: Writing a Dockerfile
summary: Describe how to build an image of your own program, one instruction per line.
---

## A Dockerfile

A `Dockerfile` is a text file of instructions. `docker build` follows them from top to bottom and produces an image.

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

```console
$ docker build -t myapp .
$ docker run --rm myapp
```

`-t myapp` names the image. The dot is the **build context**: the folder whose files can be copied into the image.

## The instructions

| Instruction | Does |
| --- | --- |
| `FROM image` | the image to start from. Always first. |
| `WORKDIR /app` | set, and create, the directory that later instructions run in |
| `COPY src dest` | copy files from the build context into the image |
| `RUN command` | run a command **while building**, and keep the result |
| `ENV NAME=value` | set an environment variable |
| `EXPOSE 8000` | document which port the program listens on |
| `CMD [...]` | the default command when a container **starts** |
| `ENTRYPOINT [...]` | the fixed part of that command |

`RUN` happens once, at build time: installing packages, compiling. `CMD` happens every time a container starts.

## CMD and ENTRYPOINT

With only `CMD`, anything written after the image name **replaces** the command:

```dockerfile
CMD ["python", "app.py"]
```

```console
$ docker run --rm myapp              # runs: python app.py
$ docker run --rm myapp ls           # runs: ls
```

With `ENTRYPOINT`, what you write is **added** as arguments, and `CMD` supplies the default arguments:

```dockerfile
ENTRYPOINT ["sh", "greet.sh"]
CMD ["world"]
```

```console
$ docker run --rm greeter            # runs: sh greet.sh world
$ docker run --rm greeter Sam        # runs: sh greet.sh Sam
```

Use that combination when the image **is** a command-line tool.

Write both in the bracket form shown here. The other form, `CMD python app.py`, wraps the command in a shell, and your program then does not receive the signal that tells it to stop.

## Layers and the build cache

Each instruction creates a **layer**. Docker caches layers, and reuses one if neither the instruction nor the files it copies have changed. When one layer changes, every layer after it is rebuilt.

That is why the example copies `requirements.txt` and installs **before** copying the rest:

```dockerfile
COPY requirements.txt .
RUN pip install -r requirements.txt      # reused as long as requirements.txt is unchanged
COPY . .                                 # changes with every edit
```

With `COPY . .` first, every code change would reinstall all the dependencies. Order instructions from what changes least to what changes most.

## .dockerignore

Files you do not want in the image, or in the build context at all, go in `.dockerignore`:

```text
.git
node_modules
__pycache__
.env
```

It keeps builds fast and keeps secrets out of images.

## A Node example

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
```

## Looking inside

```console
$ docker image inspect myapp
$ docker history myapp
$ docker run --rm -it myapp sh
```

The last one opens a shell in a container of your image, which is the quickest way to check that the files are where you expect.

## Common mistakes

- **`COPY . .` before installing dependencies.**
- **No version tag** on the base image.
- **Secrets in the image**, through `COPY` or `ENV`. Anyone with the image can read them.
- **Expecting `RUN` to start the program.** It runs at build time.
- **Building in the wrong folder**, so `COPY` cannot find the files.
