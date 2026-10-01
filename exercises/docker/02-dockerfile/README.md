# Build an image

Your working folder contains `greet.sh`, a small script that prints `Hello, NAME!` for the name it is given.

Write a `Dockerfile` next to it, so that:

- the image is based on `alpine:3`;
- its working directory is `/app`, and `greet.sh` is copied there;
- `docker run --rm IMAGE` prints `Hello, world!`;
- `docker run --rm IMAGE Sam` prints `Hello, Sam!`.

So the script is the fixed part of the command, and the name is an argument with the default `world`.

Try it yourself:

```console
$ docker build -t greeter .
$ docker run --rm greeter
$ docker run --rm greeter Sam
```
