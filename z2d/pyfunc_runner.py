"""The script that runs inside a separate Python process to test a learner's functions."""

PYFUNC_RUNNER = r'''
import contextlib, importlib.util, io, json, math, sys, traceback

spec = json.load(sys.stdin)
real_stdout = sys.stdout
results = []

def finish():
    real_stdout.write("\n@@Z2D@@" + json.dumps(results) + "\n")
    real_stdout.flush()
    sys.exit(0)

def load(path, name):
    s = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(s)
    sys.modules[name] = module
    s.loader.exec_module(module)
    return module

def explain(exc):
    """Error type, message, and the line of the learner's file that raised it."""
    where = ""
    for frame in reversed(traceback.extract_tb(exc.__traceback__)):
        if frame.filename.endswith(spec["file"]):
            where = f" ({spec['file']} line {frame.lineno}: {frame.line})"
            break
    return f"{type(exc).__name__}: {exc}{where}"

def plain(v):
    if isinstance(v, (list, tuple)):
        return [plain(x) for x in v]
    if isinstance(v, (set, frozenset)):
        return sorted((plain(x) for x in v), key=repr)
    if isinstance(v, dict):
        return {str(k): plain(x) for k, x in v.items()}
    return v

def same(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-9)
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    return type(a) == type(b) and a == b

sys.path.insert(0, ".")
sink = io.StringIO()
with contextlib.redirect_stdout(sink):
    try:
        module = load(spec["file"], spec["file"].rsplit(".", 1)[0])
    except BaseException as exc:
        results.append([False, spec["file"] + " loads without errors", explain(exc)])
        finish()

    for case in spec.get("cases", []):
        fname = case.get("call", spec.get("function"))
        args = case.get("args", [])
        shown = ", ".join(repr(a) for a in args)
        if len(shown) > 70:
            shown = shown[:70] + "..."
        name = case.get("name", f"{fname}({shown})")
        fn = getattr(module, fname, None)
        if not callable(fn):
            results.append([False, name, f"{spec['file']} does not define a function named {fname}"])
            continue
        try:
            got = plain(fn(*args))
        except BaseException as exc:
            if case.get("raises") == type(exc).__name__:
                results.append([True, name, ""])
            else:
                results.append([False, name, "raised " + explain(exc)])
            continue
        if "raises" in case:
            results.append([False, name, f"expected it to raise {case['raises']}, but it returned {got!r}"])
            continue
        want = case["expect"]
        if case.get("unordered") and isinstance(got, list):
            ok = same(sorted(got, key=repr), sorted(want, key=repr))
        else:
            ok = same(got, want)
        results.append([ok, name, "" if ok else f"expected: {want!r}\ngot:      {got!r}"])

    if spec.get("tests"):
        try:
            tests = load(spec["tests"], "z2d_tests")
        except BaseException as exc:
            results.append([False, "test file loads", explain(exc)])
            finish()
        for attr, fn in list(vars(tests).items()):
            if not attr.startswith("test_") or not callable(fn):
                continue
            name = (fn.__doc__ or attr[5:].replace("_", " ")).strip().split("\n")[0]
            try:
                fn()
                results.append([True, name, ""])
            except AssertionError as exc:
                results.append([False, name, str(exc) or "an assertion failed"])
            except BaseException as exc:
                results.append([False, name, "raised " + explain(exc)])
finish()
'''
