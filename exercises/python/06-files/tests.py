import os
import tempfile

from solution import count_lines, read_scores, save_report


def write_temp(text):
    handle, path = tempfile.mkstemp(suffix=".txt")
    with os.fdopen(handle, "w", encoding="utf-8") as f:
        f.write(text)
    return path


def test_count_lines():
    """count_lines counts the lines of a file"""
    path = write_temp("one\ntwo\nthree\n")
    try:
        assert count_lines(path) == 3, f"expected 3, got {count_lines(path)!r}"
    finally:
        os.remove(path)


def test_count_lines_empty():
    """count_lines of an empty file is 0"""
    path = write_temp("")
    try:
        assert count_lines(path) == 0, f"expected 0, got {count_lines(path)!r}"
    finally:
        os.remove(path)


def test_read_scores():
    """read_scores returns a dictionary of name to integer score"""
    path = write_temp("ada,91\nlinus,78\ngrace,95\n")
    try:
        got = read_scores(path)
        assert got == {"ada": 91, "linus": 78, "grace": 95}, f"got {got!r}"
    finally:
        os.remove(path)


def test_read_scores_messy():
    """read_scores skips blank lines and strips spaces"""
    path = write_temp("ada,91\n\nlinus, 78\n  grace ,95  \n\n")
    try:
        got = read_scores(path)
        assert got == {"ada": 91, "linus": 78, "grace": 95}, f"got {got!r}"
    finally:
        os.remove(path)


def test_save_report():
    """save_report writes name: score lines, highest score first"""
    path = write_temp("old contents that must be replaced\n")
    try:
        save_report(path, {"ada": 91, "linus": 78, "grace": 95})
        with open(path, encoding="utf-8") as f:
            got = f.read()
        assert got == "grace: 95\nada: 91\nlinus: 78\n", f"the file contains {got!r}"
    finally:
        os.remove(path)


def test_save_report_ties():
    """save_report orders equal scores by name"""
    path = write_temp("")
    try:
        save_report(path, {"zoe": 80, "bob": 80, "al": 90})
        with open(path, encoding="utf-8") as f:
            got = f.read()
        assert got == "al: 90\nbob: 80\nzoe: 80\n", f"the file contains {got!r}"
    finally:
        os.remove(path)


def test_round_trip():
    """a report can be produced from scores that were read from a file"""
    source = write_temp("a,1\nb,3\nc,2\n")
    target = write_temp("")
    try:
        save_report(target, read_scores(source))
        with open(target, encoding="utf-8") as f:
            assert f.read() == "b: 3\nc: 2\na: 1\n"
    finally:
        os.remove(source)
        os.remove(target)
