import time


class RateLimited(Exception):
    """The provider asked us to slow down. Trying again later can work."""


class BadRequest(Exception):
    """The request itself is wrong. Trying again cannot work."""


def ask(client, question, system=None, history=None, max_tokens=500):
    return ""


def ask_with_retry(client, question, attempts=3, sleep=time.sleep):
    return ask(client, question)
