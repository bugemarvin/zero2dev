"""Checks for HTML and CSS exercises, with nothing but the standard library.

parse_html() builds a small element tree, select() finds elements with a CSS
selector, and computed() answers "which value does this element get for this
property?" by applying the cascade: specificity, source order, !important,
inheritance and custom properties. It is not a browser: it compares the values
as they are declared, after light normalisation, and it knows the box
shorthands (margin, padding) and nothing else about shorthand properties.
"""
import re
from html.parser import HTMLParser

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
# An open element of the key is closed without an end tag when one of the values starts.
AUTO_CLOSE = {
    "li": {"li"}, "dt": {"dt", "dd"}, "dd": {"dt", "dd"}, "tr": {"tr", "tbody", "tfoot"},
    "td": {"td", "th", "tr", "tbody", "tfoot"}, "th": {"td", "th", "tr", "tbody", "tfoot"},
    "option": {"option", "optgroup"}, "thead": {"tbody", "tfoot"}, "tbody": {"tbody", "tfoot"},
    "p": {"address", "article", "aside", "blockquote", "div", "dl", "fieldset", "figure", "footer", "form",
          "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "main", "nav", "ol", "p", "pre", "section",
          "table", "ul"},
}
OPTIONAL_END = set(AUTO_CLOSE) | {"html", "head", "body", "colgroup", "caption"}
INHERITED = {"color", "font", "font-family", "font-size", "font-style", "font-weight", "line-height",
             "letter-spacing", "text-align", "text-transform", "list-style", "list-style-type",
             "visibility", "cursor", "white-space", "word-spacing"}
STATES = {"hover", "focus", "active", "visited", "focus-visible", "focus-within", "checked", "disabled",
          "required", "invalid", "valid", "target", "link"}
COLOURS = {"white": "#ffffff", "black": "#000000", "red": "#ff0000", "green": "#008000", "blue": "#0000ff",
           "yellow": "#ffff00", "gray": "#808080", "grey": "#808080", "orange": "#ffa500", "purple": "#800080",
           "navy": "#000080", "teal": "#008080", "silver": "#c0c0c0", "maroon": "#800000"}


class Element:
    def __init__(self, tag, attrs, parent):
        self.tag = tag
        self.attrs = attrs
        self.parent = parent
        self.children = []          # elements and strings, in order

    def elements(self):
        return [c for c in self.children if isinstance(c, Element)]

    def walk(self):
        for child in self.elements():
            yield child
            yield from child.walk()

    def text(self):
        parts = []
        for child in self.children:
            if isinstance(child, str):
                parts.append(child)
            elif child.tag not in ("script", "style"):
                parts.append(child.text())
        return " ".join(" ".join(parts).split())

    def classes(self):
        return (self.attrs.get("class") or "").split()

    def describe(self):
        text = "<" + self.tag
        if self.attrs.get("id"):
            text += f' id="{self.attrs["id"]}"'
        if self.attrs.get("class"):
            text += f' class="{self.attrs["class"]}"'
        return text + ">"


class _Builder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("#document", {}, None)
        self.stack = [self.root]
        self.problems = []
        self.doctype = False

    def handle_decl(self, decl):
        if decl.lower().startswith("doctype html"):
            self.doctype = True

    def handle_starttag(self, tag, attrs):
        while self.stack[-1].tag in AUTO_CLOSE and tag in AUTO_CLOSE[self.stack[-1].tag]:
            self.stack.pop()
        node = Element(tag, {k: (v if v is not None else "") for k, v in attrs}, self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack[-1].tag == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        open_tags = [node.tag for node in self.stack]
        if tag not in open_tags:
            self.problems.append(f"line {self.getpos()[0]}: </{tag}> closes nothing: there is no open <{tag}>")
            return
        while self.stack[-1].tag != tag:
            left = self.stack.pop()
            if left.tag not in OPTIONAL_END:
                self.problems.append(f"line {self.getpos()[0]}: <{left.tag}> is still open when </{tag}> closes")
        self.stack.pop()

    def handle_data(self, data):
        self.stack[-1].children.append(data)

    def finish(self):
        self.close()
        for node in self.stack[1:]:
            if node.tag not in OPTIONAL_END:
                self.problems.append(f"<{node.tag}> is never closed")


class Page:
    def __init__(self, root, doctype, problems):
        self.root = root
        self.doctype = doctype
        self.problems = problems

    def all(self):
        return list(self.root.walk())


def parse_html(text):
    builder = _Builder()
    builder.feed(text)
    builder.finish()
    return Page(builder.root, builder.doctype, builder.problems)


# ---------------------------------------------------------------- selectors

_PART = re.compile(
    r"(?P<tag>\*|[A-Za-z][\w-]*)|#(?P<id>[\w-]+)|\.(?P<cls>[\w-]+)"
    r"|\[\s*(?P<attr>[\w-]+)\s*(?:(?P<op>[~^$*|]?=)\s*(?P<q>[\"']?)(?P<val>.*?)(?P=q)\s*)?\]"
    r"|::?(?P<pseudo>[\w-]+)(?:\((?P<arg>[^()]*(?:\([^()]*\))?[^()]*)\))?")


class SelectorError(ValueError):
    pass


def _compound(text):
    parts, pos = [], 0
    while pos < len(text):
        match = _PART.match(text, pos)
        if not match:
            raise SelectorError(f"cannot read the selector near: {text[pos:]}")
        parts.append(match.groupdict())
        pos = match.end()
    return parts


def parse_selector(text):
    """One selector (no commas) as a list of (combinator, compound), left to right."""
    text = re.sub(r"\s*([>+~])\s*", r" \1 ", text.strip())
    # spaces inside brackets belong to the part, not to a combinator
    tokens, depth, current = [], 0, ""
    for ch in text:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == " " and depth == 0:
            if current:
                tokens.append(current)
            current = ""
        else:
            current += ch
    if current:
        tokens.append(current)
    chain, combinator = [], " "
    for token in tokens:
        if token in (">", "+", "~"):
            combinator = token
        else:
            chain.append((combinator, _compound(token)))
            combinator = " "
    if not chain:
        raise SelectorError("empty selector")
    return chain


def split_commas(text):
    parts, depth, current = [], 0, ""
    for ch in text:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(current.strip())
            current = ""
        else:
            current += ch
    parts.append(current.strip())
    return [p for p in parts if p]


def _nth(expr, index):
    expr = expr.replace(" ", "").lower()
    if expr == "odd":
        a, b = 2, 1
    elif expr == "even":
        a, b = 2, 0
    else:
        match = re.fullmatch(r"([+-]?\d*)n([+-]\d+)?|([+-]?\d+)", expr)
        if not match:
            return False
        if match.group(3) is not None:
            return index == int(match.group(3))
        a = int(match.group(1) + "1") if match.group(1) in ("", "+", "-") else int(match.group(1))
        b = int(match.group(2) or 0)
    if a == 0:
        return index == b
    return (index - b) % a == 0 and (index - b) // a >= 0


def _matches_compound(el, parts, state, pseudo_element):
    wanted_pseudo = None
    for part in parts:
        if part["tag"]:
            if part["tag"] != "*" and part["tag"].lower() != el.tag:
                return False
        elif part["id"]:
            if el.attrs.get("id") != part["id"]:
                return False
        elif part["cls"]:
            if part["cls"] not in el.classes():
                return False
        elif part["attr"]:
            name = part["attr"].lower()
            if name not in el.attrs:
                return False
            got, want, op = el.attrs[name], part["val"], part["op"]
            if op == "=" and got != want:
                return False
            if op == "^=" and not got.startswith(want):
                return False
            if op == "$=" and not got.endswith(want):
                return False
            if op == "*=" and want not in got:
                return False
            if op == "~=" and want not in got.split():
                return False
            if op == "|=" and not (got == want or got.startswith(want + "-")):
                return False
        else:
            name, arg = part["pseudo"].lower(), part["arg"]
            siblings = el.parent.elements() if el.parent else [el]
            if name in ("before", "after", "placeholder", "first-line", "first-letter", "marker", "selection"):
                wanted_pseudo = name
            elif name in STATES:
                if name != state:
                    return False
            elif name == "root":
                if el.tag != "html":
                    return False
            elif name == "first-child":
                if siblings[0] is not el:
                    return False
            elif name == "last-child":
                if siblings[-1] is not el:
                    return False
            elif name == "only-child":
                if len(siblings) != 1:
                    return False
            elif name == "nth-child":
                if not _nth(arg or "", siblings.index(el) + 1):
                    return False
            elif name in ("first-of-type", "last-of-type", "nth-of-type"):
                same = [s for s in siblings if s.tag == el.tag]
                position = same.index(el) + 1
                if name == "first-of-type" and position != 1:
                    return False
                if name == "last-of-type" and position != len(same):
                    return False
                if name == "nth-of-type" and not _nth(arg or "", position):
                    return False
            elif name == "not":
                if any(_matches_compound(el, _compound(option), state, None) for option in split_commas(arg or "")):
                    return False
            elif name == "empty":
                if el.children:
                    return False
            else:
                return False            # a pseudo-class this checker does not know: do not guess
    return wanted_pseudo == pseudo_element


def _matches_chain(el, chain, state, pseudo_element):
    combinator, parts = chain[-1]
    if not _matches_compound(el, parts, state, pseudo_element):
        return False
    rest = chain[:-1]
    if not rest:
        return True
    # state and pseudo-element belong to the last compound (the subject) in every rule the lessons use
    if combinator == ">":
        return el.parent is not None and _matches_chain(el.parent, rest, None, None)
    if combinator == " ":
        node = el.parent
        while node is not None:
            if _matches_chain(node, rest, None, None):
                return True
            node = node.parent
        return False
    siblings = el.parent.elements() if el.parent else []
    index = siblings.index(el) if el in siblings else 0
    if combinator == "+":
        return index > 0 and _matches_chain(siblings[index - 1], rest, None, None)
    return any(_matches_chain(s, rest, None, None) for s in siblings[:index])


def matches(el, selector, state=None, pseudo_element=None):
    return any(_matches_chain(el, parse_selector(option), state, pseudo_element)
               for option in split_commas(selector))


def select(page, selector):
    return [el for el in page.all() if matches(el, selector)]


def specificity(chain):
    ids = classes = tags = 0
    for _, parts in chain:
        for part in parts:
            if part["id"]:
                ids += 1
            elif part["cls"] or part["attr"]:
                classes += 1
            elif part["tag"]:
                tags += part["tag"] != "*"
            elif part["pseudo"]:
                name = part["pseudo"].lower()
                if name in ("before", "after", "placeholder", "first-line", "first-letter", "marker", "selection"):
                    tags += 1
                elif name == "not":
                    inner = [specificity(parse_selector(o)) for o in split_commas(part["arg"] or "")]
                    best = max(inner, default=(0, 0, 0))
                    ids, classes, tags = ids + best[0], classes + best[1], tags + best[2]
                else:
                    classes += 1
    return (ids, classes, tags)


# ---------------------------------------------------------------- css

class Rule:
    def __init__(self, selector, declarations, media, order):
        self.selector = selector
        self.declarations = declarations      # list of (property, value, important)
        self.media = media                    # '' outside @media, otherwise the condition text
        self.order = order


def _split_top(text, sep):
    parts, depth, current, quote = [], 0, "", ""
    for ch in text:
        if quote:
            current += ch
            if ch == quote:
                quote = ""
            continue
        if ch in "\"'":
            quote = ch
        elif ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == sep and depth == 0:
            parts.append(current)
            current = ""
        else:
            current += ch
    parts.append(current)
    return parts


def parse_declarations(text):
    result = []
    for piece in _split_top(text, ";"):
        name, sep, value = piece.partition(":")
        name, value = name.strip(), value.strip()
        if not sep or not name or not value:
            continue
        important = value.lower().endswith("!important")
        if important:
            value = value[:-len("!important")].strip()
        if not name.startswith("--"):
            name = name.lower()
        for prop, val in expand_shorthand(name, value):
            result.append((prop, val, important))
    return result


def expand_shorthand(name, value):
    """margin and padding into their four sides; a one-colour background into background-color."""
    pairs = [(name, value)]
    if name in ("margin", "padding"):
        parts = value.split()
        if 1 <= len(parts) <= 4 and "(" not in value:
            top = parts[0]
            right = parts[1] if len(parts) > 1 else top
            bottom = parts[2] if len(parts) > 2 else top
            left = parts[3] if len(parts) > 3 else right
            pairs += [(f"{name}-top", top), (f"{name}-right", right), (f"{name}-bottom", bottom), (f"{name}-left", left)]
    elif name == "background" and len(value.split()) == 1 and "url(" not in value and "gradient" not in value:
        pairs.append(("background-color", value))
    return pairs


def parse_css(text, media="", rules=None):
    """Every style rule of a sheet, in order, including those inside @media blocks."""
    rules = [] if rules is None else rules
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    pos = 0
    while pos < len(text):
        brace = text.find("{", pos)
        if brace < 0:
            break
        semicolon = text.find(";", pos)
        if 0 <= semicolon < brace and text[pos:semicolon].strip().startswith("@"):
            pos = semicolon + 1                 # @import, @charset: one line, no block
            continue
        prelude = text[pos:brace].strip()
        depth, end = 1, brace + 1
        while end < len(text) and depth:
            depth += {"{": 1, "}": -1}.get(text[end], 0)
            end += 1
        body = text[brace + 1:end - 1]
        if prelude.startswith("@media"):
            condition = " ".join(prelude[len("@media"):].lower().split())
            parse_css(body, (media + " and " + condition) if media else condition, rules)
        elif prelude.startswith(("@supports", "@layer")):
            parse_css(body, media, rules)
        elif not prelude.startswith("@"):
            rules.append(Rule(" ".join(prelude.split()), parse_declarations(body), media, len(rules)))
        pos = end
    return rules


def _media_applies(rule_media, wanted):
    if not rule_media:
        return True
    if not wanted:
        return False
    squeeze = lambda s: re.sub(r"\s+", "", s.lower())
    return squeeze(wanted) in squeeze(rule_media)


def declared(el, rules, state=None, pseudo_element=None, media=None):
    """The winning declared value of every property set directly on this element."""
    candidates = {}
    for rule in rules:
        if not _media_applies(rule.media, media):
            continue
        best = None
        for option in split_commas(rule.selector):
            try:
                chain = parse_selector(option)
            except SelectorError:
                continue
            if _matches_chain(el, chain, state, pseudo_element):
                spec = specificity(chain)
                best = spec if best is None or spec > best else best
        if best is None:
            continue
        for prop, value, important in rule.declarations:
            key = (important, (0,) + best, rule.order)
            if prop not in candidates or key >= candidates[prop][0]:
                candidates[prop] = (key, value)
    if pseudo_element is None:
        for prop, value, important in parse_declarations(el.attrs.get("style", "")):
            key = (important, (1, 0, 0, 0), 10 ** 9)
            if prop not in candidates or key >= candidates[prop][0]:
                candidates[prop] = (key, value)
    return {prop: value for prop, (_, value) in candidates.items()}


def computed(el, prop, rules, state=None, pseudo_element=None, media=None):
    """The value an element ends up with: its own declaration, or an inherited one. None when unset."""
    own = declared(el, rules, state, pseudo_element, media)
    value = own.get(prop)
    if value is None and (prop in INHERITED or prop.startswith("--")):
        node = el if pseudo_element else el.parent
        while node is not None and node.tag != "#document" and value is None:
            value = declared(node, rules, None, None, media).get(prop)
            node = node.parent
    if value is None:
        return None

    def variable(match):
        found = computed(el, match.group(1), rules, state, None, media)
        if found is not None:
            return found
        return match.group(2).strip() if match.group(2) else match.group(0)

    for _ in range(5):                    # variables may refer to variables
        replaced = re.sub(r"var\(\s*(--[\w-]+)\s*(?:,([^()]*))?\)", variable, value)
        if replaced == value:
            break
        value = replaced
    return value


def normal(value):
    """Make two spellings of the same CSS value compare equal."""
    value = " ".join(str(value).strip().lower().split())
    value = re.sub(r"\s*,\s*", ",", value)
    value = re.sub(r"\s*/\s*", "/", value)
    value = re.sub(r"\(\s+", "(", value)
    value = re.sub(r"\s+\)", ")", value)
    value = value.replace('"', "'")
    value = re.sub(r"(?<![\w.])0(?:px|rem|em|%|pt)(?![\w.])", "0", value)
    value = re.sub(r"(?<![\w.])0+\.(\d)", r".\1", value)
    value = re.sub(r"#([0-9a-f])([0-9a-f])([0-9a-f])\b", r"#\1\1\2\2\3\3", value)
    return COLOURS.get(value, value)


def value_ok(got, want):
    """`want` is a value, a list of accepted values (None: not set), or "~text" for "contains text"."""
    options = want if isinstance(want, list) else [want]
    if got is None:
        return None in options          # None in the list means "not set at all" is accepted
    got = normal(got)
    for option in options:
        if option is None:
            continue
        option = str(option)
        if option.startswith("~"):
            if normal(option[1:]) in got:
                return True
        elif normal(option) == got:
            return True
    return False
