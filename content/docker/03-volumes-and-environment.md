---
title: Data, configuration and ports
summary: Keep data after a container is gone, configure a container from outside, and reach it over the network.
---

## Containers forget

Everything a container writes to its own file system disappears when the container is removed. That is a feature: every start is clean. But a database has to keep its data, and you want the file your program produced.

Docker has two ways to give a container storage that outlives it.

## Bind mounts

A **bind mount** makes a folder of your machine appear inside the container:

```console
$ mkdir -p out
$ docker run --rm -v "$PWD/out":/data alpine:3 sh -c 'echo hello > /data/hello.txt'
$ cat out/hello.txt
hello
```

`-v HOST_PATH:CONTAINER_PATH`. The host path must be absolute, hence `$PWD`.

Bind mounts are for development and for getting files in and out: source code, configuration, results.

Add `:ro` to make it read-only inside the container: `-v "$PWD/site":/www:ro`.

## Who owns the files

Inside most containers the program runs as **root**. A file it writes through a bind mount is then owned by root on your machine, and you cannot edit or delete it without `sudo`.

Run the container as yourself:

```console
$ docker run --rm --user "$(id -u):$(id -g)" -v "$PWD/out":/data alpine:3 sh -c 'echo hi > /data/hi.txt'
```

Create the host folder first, too. If it does not exist, Docker creates it, owned by root.

## Named volumes

A **named volume** is storage that Docker manages. It is the right choice for data that only containers need to see, such as a database's files.

```console
$ docker volume create pgdata
$ docker run -d --name db -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres:16
```

Remove the container, start a new one with the same volume, and the data is still there.

```console
$ docker volume ls
$ docker volume rm pgdata
```

| | Bind mount | Named volume |
| --- | --- | --- |
| Written as | `-v /path/on/host:/path` | `-v name:/path` |
| Lives | where you say | inside Docker's storage |
| Use for | code, config, files you want to see | databases, caches |

## Environment variables

The standard way to configure a container from outside is the environment:

```console
$ docker run --rm -e NAME=Sam -e GREETING=Hi alpine:3 sh -c 'echo "$GREETING, $NAME"'
Hi, Sam
```

A Dockerfile can set a default with `ENV`, which `-e` overrides.

For several variables, use a file with one `NAME=value` per line:

```console
$ docker run --rm --env-file .env myapp
```

Passwords and keys are given this way, when the container starts. They must not be written into the image.

## Ports

A container has its own network. A server listening on port 8000 **inside** is unreachable from outside until you publish the port:

```console
$ docker run -d -p 8080:8000 myapp
```

`-p HOST:CONTAINER`. Port 8080 on your machine now leads to port 8000 in the container.

By default a published port is open to the whole network your machine is on. To accept connections from your own machine only:

```console
$ docker run -d -p 127.0.0.1:8080:8000 myapp
```

The server inside must listen on `0.0.0.0`, all interfaces. If it listens on `127.0.0.1` inside the container, only the container itself can reach it, and the published port leads nowhere.

## Putting it together

```console
$ mkdir -p out
$ docker run --rm \
    --user "$(id -u):$(id -g)" \
    -e OWNER=sam \
    -v "$PWD/out":/data \
    report-image
```

A backslash at the end of a line continues the command on the next one.

## Common mistakes

- **Data stored only inside a container**, and lost with it.
- **A relative host path** in `-v`. Use `"$PWD/..."`.
- **Root-owned files** in your project folder. Use `--user`.
- **A server bound to `127.0.0.1` inside the container.**
- **Publishing a database port to the whole network** with a weak password.
