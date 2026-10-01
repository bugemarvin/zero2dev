from solution import count_tokens, estimate_tokens, trim_history


def msg(role, content):
    return {"role": role, "content": content}


def test_estimate():
    """estimate_tokens is characters divided by 4, rounded up"""
    assert estimate_tokens("") == 0
    assert estimate_tokens("abcd") == 1
    assert estimate_tokens("abcde") == 2, f"5 characters should be 2 tokens, got {estimate_tokens('abcde')}"
    assert estimate_tokens("a" * 400) == 100


def test_count():
    """count_tokens adds 4 tokens of overhead per message"""
    assert count_tokens([]) == 0
    assert count_tokens([msg("user", "abcd")]) == 5
    assert count_tokens([msg("system", "a" * 40), msg("user", "a" * 8)]) == 10 + 4 + 2 + 4


def test_everything_fits():
    """a conversation that fits is returned unchanged"""
    chat = [msg("system", "Be brief."), msg("user", "Hi"), msg("assistant", "Hello")]
    assert trim_history(chat, 1000) == chat


def test_keeps_most_recent():
    """the oldest messages are dropped first, and the order is kept"""
    chat = [msg("system", "s" * 16)] + [msg("user" if i % 2 == 0 else "assistant", str(i) * 16) for i in range(6)]
    # system costs 8, every other message costs 8
    got = trim_history(chat, 8 + 3 * 8)
    assert got == [chat[0], chat[4], chat[5], chat[6]], f"got {[m['content'][:1] for m in got]}"


def test_stops_at_first_that_does_not_fit():
    """a big message blocks everything older than it"""
    chat = [msg("user", "old " * 2), msg("assistant", "x" * 400), msg("user", "new!")]
    got = trim_history(chat, 30)
    assert got == [chat[2]], f"got {[m['content'][:6] for m in got]}"


def test_system_always_kept():
    """system messages stay even when nothing else fits"""
    chat = [msg("system", "a" * 40), msg("user", "b" * 40), msg("system", "c" * 40)]
    assert trim_history(chat, 5) == [chat[0], chat[2]]
    assert trim_history(chat, 28) == [chat[0], chat[2]]
    assert trim_history(chat, 42) == chat


def test_input_unchanged():
    """the input list is not modified"""
    chat = [msg("user", "a" * 100), msg("user", "b" * 100)]
    copy = list(chat)
    trim_history(chat, 30)
    assert chat == copy
