cat > ci.sh <<'SCRIPT'
#!/usr/bin/env bash
set -euo pipefail

echo "== lint"
python3 -m py_compile *.py

echo "== test"
python3 -m unittest -q

echo "== all checks passed"
SCRIPT
chmod +x ci.sh

mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<'WORKFLOW'
name: CI

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run the checks
        run: ./ci.sh
WORKFLOW

printf '__pycache__/\n' > .gitignore
git add -A
git commit -q -m "Add CI"
