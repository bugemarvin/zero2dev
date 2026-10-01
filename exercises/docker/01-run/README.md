# Run commands in containers

In your working folder, create three files. Each must hold the output of a command that ran **inside a container** of the image `alpine:3`.

1. `os.txt`: the contents of the container's `/etc/os-release` file.
2. `hello.txt`: the output of `echo hello from a container`.
3. `answer.txt`: the result of the shell arithmetic `$((6 * 7))`, computed by the shell inside the container.

Use `--rm`, so that no stopped containers are left behind.

The first run downloads the small `alpine:3` image.
