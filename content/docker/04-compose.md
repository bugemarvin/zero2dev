---
title: Docker Compose
summary: Describe every container of a project in one file, and start them all with one command.
---

## The problem

A real project is rarely one container. It is an app, a database, perhaps a cache. Starting each by hand, with the right options and in the right order, means long commands that nobody remembers.

**Docker Compose** reads a file that describes all of them and manages them together.

## compose.yaml

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "127.0.0.1:8080:80"
    volumes:
      - ./site:/usr/share/nginx/html:ro
```

```console
$ docker compose up -d
$ docker compose ps
$ docker compose logs -f
$ docker compose down
```

Everything you would pass to `docker run` has a key:

| `docker run` | In `compose.yaml` |
| --- | --- |
| the image name | `image: nginx:alpine` |
| `-p 8080:80` | `ports: ["8080:80"]` |
| `-v ./site:/www:ro` | `volumes: ["./site:/www:ro"]` |
| `-e NAME=value` | `environment: {NAME: value}` |
| the command after the image | `command: ["httpd", "-f"]` |
| `--user 1000:1000` | `user: "1000:1000"` |

The file is **YAML**. Indentation carries the structure, and it must be spaces, not tabs. Relative paths are relative to the compose file, so `./site` works without `$PWD`.

## The commands

| Command | Does |
| --- | --- |
| `docker compose up -d` | create and start everything, in the background |
| `docker compose up -d --build` | rebuild images first |
| `docker compose ps` | show the containers of this project |
| `docker compose logs -f web` | follow the output of one service |
| `docker compose exec web sh` | open a shell in a running service |
| `docker compose stop` | stop, keeping the containers |
| `docker compose down` | stop and remove the containers and the network |
| `docker compose down -v` | also remove the named volumes: **the data is deleted** |

`up` is safe to repeat. It changes only what differs from the file.

## Building your own image

A service can be built from a Dockerfile in place of pulling an image:

```yaml
services:
  app:
    build: ./app
    ports:
      - "127.0.0.1:8000:8000"
```

`build: ./app` means: build the Dockerfile in the `app` folder.

## Variables

Compose replaces `${NAME}` with the value from your shell's environment, or from a file named `.env` next to the compose file:

```yaml
    ports:
      - "127.0.0.1:${PORT}:80"
```

`${PORT:-8080}` supplies a default when the variable is not set.

This keeps things that differ per machine, such as ports and passwords, out of the file that is committed to Git.

## Networks

Compose creates a private network for the project and gives every service a **host name equal to its service name**. A service called `db` is reachable from the other services at the address `db`.

```yaml
services:
  app:
    build: ./app
    environment:
      DATABASE_HOST: db          # the service name is the host name
  db:
    image: postgres:16
```

Inside that network, containers talk to each other on the container's own port. `ports:` is only needed for what **you**, on the host, want to reach. A database that only the app uses needs no published port, and is safer without one.

## Project names

Compose groups containers into a **project**, named after the folder by default. `-p` sets another name, which lets the same file run several times side by side:

```console
$ docker compose -p demo up -d
$ docker compose -p demo down
```

## A static site in six lines

```yaml
services:
  web:
    image: busybox:1
    command: ["httpd", "-f", "-p", "80", "-h", "/www"]
    volumes:
      - ./site:/www:ro
    ports:
      - "127.0.0.1:${PORT:-8080}:80"
```

`busybox` contains a tiny web server. `-f` keeps it in the foreground, which a container needs: when the main process ends, the container stops.

## Common mistakes

- **Tabs in YAML**, or inconsistent indentation.
- **`down -v`** by reflex, deleting the database.
- **Publishing every port.** Publish only what the host needs.
- **`localhost` between services.** Inside a container, `localhost` is that container. Use the service name.
- **A main process that exits or goes to the background**, so the container stops at once.
