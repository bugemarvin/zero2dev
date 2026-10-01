from solution import bump, newest, next_version, parse


def raises(run):
    try:
        run()
    except ValueError:
        return True
    except Exception as exc:
        raise AssertionError(f"expected ValueError, got {type(exc).__name__}: {exc}")
    return False


def test_parse():
    """parse returns three numbers, with or without a leading v"""
    assert parse("2.4.1") == (2, 4, 1)
    assert parse("v10.0.3") == (10, 0, 3)
    assert parse("0.0.0") == (0, 0, 0)


def test_parse_rejects():
    """parse refuses anything that is not three whole numbers"""
    for bad in ["1.2", "1.2.3.4", "a.b.c", "1.2.x", "", "1..3", "1.-2.3", "version 1.2.3"]:
        assert raises(lambda: parse(bad)), f"parse({bad!r}) should raise ValueError"


def test_bump():
    """bump increases one part and resets those to its right"""
    assert bump("2.4.1", "patch") == "2.4.2"
    assert bump("2.4.1", "minor") == "2.5.0"
    assert bump("2.4.1", "major") == "3.0.0"
    assert bump("v0.9.9", "minor") == "0.10.0"


def test_bump_rejects():
    """bump refuses an unknown part"""
    assert raises(lambda: bump("1.0.0", "huge"))


def test_next_patch_and_minor():
    """fixes give a patch release, a feature a minor one"""
    assert next_version("1.2.3", ["fix: empty cart"]) == "1.2.4"
    assert next_version("1.2.3", ["fix: empty cart", "feat: gift cards", "fix: typo"]) == "1.3.0"
    assert next_version("1.2.3", ["feat(cart): save for later"]) == "1.3.0"


def test_next_major():
    """a breaking change gives a major release, whatever else there is"""
    assert next_version("1.2.3", ["fix: a", "feat!: remove the v1 API", "feat: b"]) == "2.0.0"
    assert next_version("1.2.3", ["fix(api)!: change the date format"]) == "2.0.0"
    assert next_version("1.2.3", ["feat: new login\n\nBREAKING CHANGE: sessions are reset"]) == "2.0.0"


def test_next_nothing_to_release():
    """commits that users do not notice leave the version alone"""
    assert next_version("1.2.3", ["docs: readme", "chore: update the linter", "test: more cases"]) == "1.2.3"
    assert next_version("1.2.3", []) == "1.2.3"


def test_next_reads_the_first_line_only():
    """the type comes from the first line, not from words in the body"""
    assert next_version("1.2.3", ["docs: explain\n\nfeat: this line is part of the description"]) == "1.2.3"
    assert next_version("1.2.3", ["chore: tidy up the feature flags and fix: prefixes"]) == "1.2.3"


def test_newest():
    """newest compares numbers, not text"""
    assert newest(["1.9.0", "1.10.0", "1.2.0"]) == "1.10.0"
    assert newest(["v2.0.0", "v10.0.0", "v9.9.9"]) == "v10.0.0"
    assert newest(["0.0.1"]) == "0.0.1"
    assert raises(lambda: newest([]))
