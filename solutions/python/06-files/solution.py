def count_lines(path):
    with open(path, encoding="utf-8") as f:
        return sum(1 for _ in f)


def read_scores(path):
    scores = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            name, score = line.split(",")
            scores[name.strip()] = int(score)
    return scores


def save_report(path, scores):
    ordered = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    with open(path, "w", encoding="utf-8") as f:
        for name, score in ordered:
            f.write(f"{name}: {score}\n")
