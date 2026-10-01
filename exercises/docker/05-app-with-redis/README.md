# An app and its data store

`app/server.py` is a small web server, given to you. Read it. It listens on port 8000, counts page hits in **Redis**, and takes the address of Redis from the environment variable `REDIS_HOST`.

Write the two files that make it run.

## `app/Dockerfile`

An image based on `python:3-alpine` that copies `server.py` and starts it with `python server.py`.

## `compose.yaml`

Two services:

- `app`, built from the `app` folder, with `REDIS_HOST` set so that it finds the other service, and its port 8000 published on `127.0.0.1` at the host port `${PORT}`;
- `redis`, from the image `redis:7-alpine`. It needs no published port.

The checker runs `docker compose up -d --build`, calls `/health` and then `/hits` three times, and runs `docker compose down`.
