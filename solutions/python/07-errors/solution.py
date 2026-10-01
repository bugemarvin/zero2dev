def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None


def parse_age(text):
    age = int(text)
    if age < 0 or age > 150:
        raise ValueError("age out of range")
    return age


def first_valid(items):
    for item in items:
        try:
            return int(item)
        except ValueError:
            continue
    return None
