#!/usr/bin/env python3
"""Repository self-test.

For every exercise: the starter must FAIL its tests and the reference
solution in solutions/ must PASS them. Also checks that each exercise points
at a real lesson and that the generated guide matches its Markdown sources.

    python3 tools/selftest.py              everything
    python3 tools/selftest.py c dsa        only these tracks
    python3 tools/selftest.py --strict     a skipped exercise (missing toolchain) is a failure
"""
import os
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import check  # noqa: E402

GIT_ENV = dict(os.environ,
               GIT_AUTHOR_NAME="learner", GIT_AUTHOR_EMAIL="learner@zero2dev.invalid",
               GIT_COMMITTER_NAME="learner", GIT_COMMITTER_EMAIL="learner@zero2dev.invalid")


def failures(results):
    return [f"{r.name}: {r.detail}" if r.detail else r.name for r in results if not r.ok]


def verify_solution(ex, sol, tmp, lang=None, files=None):
    """Copy the exercise, lay the solution over it, run. Returns list of problems."""
    exdir = Path(tempfile.mkdtemp(dir=tmp))
    shutil.rmtree(exdir)
    shutil.copytree(ex.dir, exdir)
    for f in files if files is not None else [p for p in sol.iterdir() if p.is_file()]:
        shutil.copy(f, exdir / f.name)
    results = check.run_checks(ex, exdir, lang=lang)
    if not results:
        return ["no tests ran"]
    label = f" [{lang}]" if lang else ""
    return [f"solution{label} fails: {f}" for f in failures(results)]


def verify(ex):
    """Returns (status, messages) where status is 'ok', 'fail' or 'skip'."""
    sol = ROOT / "solutions" / ex.id
    problems, skips = [], []
    if not (ex.dir / "README.md").exists():
        problems.append("missing README.md")
    if not ex.lesson or not (ROOT / "content" / (ex.lesson + ".md")).exists():
        problems.append(f"lesson not found: {ex.lesson!r}")
    if not sol.is_dir():
        return "fail", problems + ["no reference solution in solutions/"]

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        try:
            if ex.kind == "sandbox":
                sandbox = tmp / "sandbox"
                check.setup_sandbox(ex, sandbox)
                before = check.run_checks(ex, sandbox=sandbox)
                if all(r.ok for r in before):
                    problems.append("fresh sandbox already passes")
                code, out, err = check.run(["bash", str(sol / "solution.sh")], cwd=sandbox,
                                           timeout=60, env=GIT_ENV)
                if code != 0:
                    problems.append(f"solution.sh failed: {err or out}")
                problems += [f"solution fails: {f}" for f in failures(check.run_checks(ex, sandbox=sandbox))]
            elif ex.kind == "program" and ex.spec.get("lang", "any") == "any":
                # One reference solution per language; each is checked on its own.
                by_lang = {name: sol / info["file"] for name, info in check.LANGS.items()
                           if (sol / info["file"]).exists()}
                if "python" not in by_lang:
                    problems.append("language-agnostic exercise needs a Python reference solution")
                before = check.run_checks(ex, ex.dir, lang="python")
                if before and all(r.ok for r in before):
                    problems.append("starter already passes")
                for lang, path in by_lang.items():
                    try:
                        problems += verify_solution(ex, sol, tmp, lang=lang, files=[path])
                    except check.Skip as skip:
                        skips.append(f"{lang}: {skip}")
            else:
                before = check.run_checks(ex, ex.dir)
                if before and all(r.ok for r in before):
                    problems.append("starter already passes")
                problems += verify_solution(ex, sol, tmp)
        except check.Skip as skip:
            skips.append(str(skip))
        except Exception as exc:  # a broken exercise must not stop the whole run
            problems.append(f"{type(exc).__name__}: {exc}")

    if problems:
        return "fail", problems
    if skips:
        return "skip", skips
    return "ok", []


def main(argv):
    strict = "--strict" in argv
    tracks = [a for a in argv if not a.startswith("-")]
    exercises = [e for e in check.load_exercises() if not tracks or e.track in tracks]
    if not exercises:
        print("no exercises found")
        return 1

    bad = 0
    counts = {"ok": 0, "fail": 0, "skip": 0}
    with ThreadPoolExecutor(max_workers=min(8, (os.cpu_count() or 2))) as pool:
        for ex, (status, messages) in zip(exercises, pool.map(verify, exercises)):
            counts[status] += 1
            if status == "ok":
                continue
            print(f"{status.upper():4} {ex.id}")
            for m in messages:
                print("       " + m.replace("\n", "\n       "))
            if status == "fail" or strict:
                bad += 1

    build = subprocess.run([sys.executable, str(ROOT / "tools" / "build_guide.py"), "--check"],
                           capture_output=True, text=True)
    if build.returncode != 0:
        print("FAIL guide: " + (build.stdout + build.stderr).strip())
        bad += 1

    print(f"\n{len(exercises)} exercises: {counts['ok']} ok, {counts['fail']} failed, {counts['skip']} skipped"
          + ("; guide up to date" if build.returncode == 0 else ""))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
