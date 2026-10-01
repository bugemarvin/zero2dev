---
title: An app with a data store
summary: Build your own image, run it next to a database, and make the two find each other.
---

## The shape of a real project

```text
project/
    compose.yaml
    app/
        Dockerfile
        server.py
```

```yaml
services:
  app:
    build: ./app
    environment:
      REDIS_HOST: redis
    ports:
      - "127.0.0.1:${PORT:-8000}:8000"
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
```

Two services. `app` is built from your Dockerfile. `redis` is pulled ready-made. Only `app` publishes a port, because only it needs to be reached from outside.

## Finding each other

The app must not have the address of the data store written into its code. It reads it from the environment:

```python
import os

REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
```

In Compose the value is the **service name**, `redis`. On your own machine, with no containers, the default `localhost` applies. The same code runs in both places.

This is the general rule for containers: everything that differs between environments, addresses, ports, passwords, comes in through environment variables.

## The Dockerfile

```dockerfile
FROM python:3.12-alpine
WORKDIR /app
COPY server.py .
EXPOSE 8000
CMD ["python", "server.py"]
```

The server inside must listen on `0.0.0.0`, or the published port cannot reach it.

## Start order

`depends_on` makes Compose start `redis` before `app`. It does **not** wait until Redis is ready to accept connections. A database can need several seconds to initialise.

Two ways to deal with that, best used together:

**The app retries.** A program that talks to the network must cope with the other side being unavailable for a moment, at start-up and later. Connect when a request needs it, and try again on failure.

**A health check.** Describe how to tell that the service is ready, and wait for it:

```yaml
services:
  app:
    build: ./app
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: example
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 2s
      timeout: 2s
      retries: 15
```

## Keeping the data

Without a volume, the database starts empty every time its container is recreated:

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

`docker compose down` keeps the volume. `docker compose down -v` deletes it.

## Working on the code

During development you do not want to rebuild for every edit. Mount the source over what the image contains:

```yaml
  app:
    build: ./app
    volumes:
      - ./app:/app
```

The container then sees your edits at once. For production, leave the mount out and use the code baked into the image.

## Seeing what is going on

```console
$ docker compose up -d --build
$ docker compose ps
$ docker compose logs -f app
$ docker compose exec redis redis-cli ping
PONG
$ docker compose exec app sh
```

When something does not work, the logs of the service are the first place to look. `exec` lets you test from inside the network, for example whether `app` can resolve the name `redis`.

## Postgres with the app of this guide

The same pattern serves the [SQL track](sql/01-select). When an exercise needs PostgreSQL and your machine has none, the app starts a container named `z2d-postgres` with a named volume, reachable only from your computer. `python3 check.py services` shows it, and `services down --purge` removes it with its data.

## Common mistakes

- **`localhost` as the database address** inside a container.
- **Relying on `depends_on` alone** for readiness.
- **No volume for the database.**
- **Publishing the database's port** when only the app needs it.
- **Forgetting `--build`** after changing the Dockerfile or the code it copies.
