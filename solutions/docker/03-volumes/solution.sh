cat > run.sh <<'RUN'
#!/usr/bin/env bash
set -euo pipefail
docker build -q -t z2d-ex-report . > /dev/null
mkdir -p out
docker run --rm --user "$(id -u):$(id -g)" -e OWNER=sam -v "$PWD/out":/data z2d-ex-report
RUN
