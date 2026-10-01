# Environment, a volume and the right owner

Your working folder contains a `Dockerfile` and the script it runs, `report.sh`. Read both. The script writes a line to `/data/report.txt` inside the container, using the environment variable `OWNER`, and then prints `written`.

Write a script `run.sh` that:

1. builds the image with the tag `z2d-ex-report`;
2. runs a container from it so that
    - `OWNER` is `sam`,
    - the folder `out` of your working folder is mounted at `/data`,
    - the file it writes belongs to **you**, not to root,
    - the container is removed when it finishes.

Afterwards `out/report.txt` must contain `Report for sam`.
