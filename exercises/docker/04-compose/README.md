# A web server with Compose

The folder `site/` contains two HTML pages. Write `compose.yaml` so that `docker compose up -d` serves them.

One service, named `web`:

- image `busybox:1`, which contains a tiny web server;
- command `httpd -f -p 80 -h /www` (foreground, port 80, serving the folder `/www`);
- the folder `./site` mounted at `/www`, read-only;
- port 80 of the container published on `127.0.0.1`, on the host port given by the variable `PORT`.

The checker sets `PORT`, runs `docker compose up -d`, requests the pages, and runs `docker compose down`.

To try it yourself: `PORT=8080 docker compose up -d`, open http://127.0.0.1:8080/, then `PORT=8080 docker compose down`.
