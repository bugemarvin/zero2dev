import math

from solution import build_prompt, chunk, cosine, recall_at_k, top_k

DOCS = [
    {"id": "returns", "text": "Bikes can be returned within 30 days.", "vector": [0.9, 0.1, 0.0]},
    {"id": "shipping", "text": "Shipping takes 3 to 5 days.", "vector": [0.1, 0.9, 0.1]},
    {"id": "hours", "text": "The shop is open 9 to 6.", "vector": [0.0, 0.1, 0.9]},
    {"id": "refunds", "text": "Refunds are paid within a week.", "vector": [0.8, 0.3, 0.0]},
]


def close(a, b):
    return math.isclose(a, b, abs_tol=1e-9)


def test_cosine_basics():
    """cosine of identical, perpendicular and opposite vectors"""
    assert close(cosine([1, 2, 3], [1, 2, 3]), 1.0)
    assert close(cosine([1, 0], [0, 1]), 0.0)
    assert close(cosine([1, 1], [-1, -1]), -1.0)


def test_cosine_ignores_length():
    """only the direction counts, not the length"""
    assert close(cosine([1, 2], [10, 20]), 1.0)
    assert close(cosine([3, 4], [4, 3]), 24 / 25)


def test_cosine_zero_vector():
    """a zero vector gives 0.0, not a division by zero"""
    assert cosine([0, 0], [1, 2]) == 0.0
    assert cosine([1, 2], [0, 0]) == 0.0


def test_chunk_with_overlap():
    """chunks overlap by the given number of words"""
    words = "a b c d e f g".split()
    assert chunk(words, 3, 1) == [["a", "b", "c"], ["c", "d", "e"], ["e", "f", "g"]]
    assert chunk("a b c d e".split(), 3, 1) == [["a", "b", "c"], ["c", "d", "e"]]


def test_chunk_last_is_shorter():
    """the last chunk may be shorter, and no chunk is a pure repeat"""
    assert chunk("a b c d e f g".split(), 3, 0) == [["a", "b", "c"], ["d", "e", "f"], ["g"]]
    assert chunk("a b c d".split(), 3, 2) == [["a", "b", "c"], ["b", "c", "d"]]


def test_chunk_small_inputs():
    """short and empty inputs"""
    assert chunk(["a", "b"], 5, 2) == [["a", "b"]]
    assert chunk([], 5, 2) == []


def test_top_k():
    """top_k returns the most similar documents, best first"""
    got = [doc["id"] for doc in top_k([1.0, 0.0, 0.0], DOCS, 2)]
    assert got == ["returns", "refunds"], f"got {got}"
    got = [doc["id"] for doc in top_k([0.0, 0.0, 1.0], DOCS, 1)]
    assert got == ["hours"], f"got {got}"


def test_top_k_edges():
    """k larger than the list, k of 0, and ties keep their order"""
    assert len(top_k([1.0, 0.0, 0.0], DOCS, 10)) == 4
    assert top_k([1.0, 0.0, 0.0], DOCS, 0) == []
    twins = [{"id": "x", "text": "", "vector": [1, 0]}, {"id": "y", "text": "", "vector": [2, 0]}]
    assert [doc["id"] for doc in top_k([1, 0], twins, 2)] == ["x", "y"]


def test_build_prompt():
    """build_prompt matches the layout exactly"""
    want = ('Answer using only the passages below. Cite passage ids like [id]. If the answer is not in them, say you do not know.\n\n'
            '<passage id="returns">\nBikes can be returned within 30 days.\n</passage>\n\n'
            '<passage id="refunds">\nRefunds are paid within a week.\n</passage>\n\n'
            'Question: Can I return a bike?')
    got = build_prompt("Can I return a bike?", [DOCS[0], DOCS[3]])
    assert got == want, f"got:\n{got!r}"


def test_recall():
    """recall_at_k is the share of relevant ids found in the first k"""
    assert recall_at_k(["a", "b", "c", "d"], ["a", "d"], 2) == 0.5
    assert recall_at_k(["a", "b", "c", "d"], ["a", "d"], 4) == 1.0
    assert recall_at_k(["x", "y"], ["a"], 2) == 0.0
    assert recall_at_k(["x"], [], 1) == 1.0
