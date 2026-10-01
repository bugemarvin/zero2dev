/* zero2dev guide: navigation, progress, code colouring. No dependencies, works from file:// */
(function () {
  "use strict";

  var root = document.body.dataset.root || "";
  var currentId = document.body.dataset.lesson || "";
  var curriculum = window.Z2D_CURRICULUM || { tracks: [] };

  // ---------- small helpers ----------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else if (key === "class") node.className = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { node.appendChild(child); });
    return node;
  }

  // localStorage can be unavailable (private mode, blocked site data): never let it break the page.
  function storeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function storeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function readSet() {
    try { return JSON.parse(storeGet("z2d-read") || "{}") || {}; } catch (e) { return {}; }
  }

  function lessonHref(id) { return root + "lessons/" + id + ".html"; }

  // ---------- progress ----------
  function exPassed(id) {
    var p = window.Z2D_PROGRESS;
    return !!(p && p.passed && p.passed[id]);
  }
  function lessonDone(lesson, read) {
    if (lesson.exercises.length) return lesson.exercises.every(function (e) { return exPassed(e.id); });
    return !!read[lesson.id];
  }
  function allLessons() {
    var list = [];
    curriculum.tracks.forEach(function (t) { t.lessons.forEach(function (l) { list.push(l); }); });
    return list;
  }

  // ---------- theme ----------
  function initTheme() {
    var btn = document.getElementById("theme-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var html = document.documentElement;
      var systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var now = html.dataset.theme || (systemDark ? "dark" : "light");
      var next = now === "dark" ? "light" : "dark";
      html.dataset.theme = next;
      storeSet("z2d-theme", next);
    });
  }

  // ---------- sidebar ----------
  function renderSidebar() {
    var nav = document.getElementById("sidebar");
    if (!nav) return;
    nav.textContent = "";
    var read = readSet();
    curriculum.tracks.forEach(function (track) {
      var done = track.lessons.filter(function (l) { return lessonDone(l, read); }).length;
      var isCurrent = track.lessons.some(function (l) { return l.id === currentId; });
      var items = track.lessons.map(function (lesson) {
        var link = el("a", { href: lessonHref(lesson.id) }, [
          el("span", { class: "tick", text: lessonDone(lesson, read) ? "✓" : "" }),
          el("span", { text: lesson.title })
        ]);
        if (lesson.id === currentId) {
          link.className = "current";
          link.setAttribute("aria-current", "page");
        }
        return el("li", {}, [link]);
      });
      var details = el("details", {}, [
        el("summary", {}, [
          el("span", { text: track.title }),
          el("span", { class: "count", text: done + "/" + track.lessons.length })
        ]),
        el("ol", {}, items)
      ]);
      if (isCurrent) details.open = true;
      nav.appendChild(details);
    });
    var current = nav.querySelector("a.current");
    if (current && current.scrollIntoView) current.scrollIntoView({ block: "center" });
  }

  function initMenu() {
    var btn = document.getElementById("menu-btn");
    if (!btn) return;
    btn.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    document.addEventListener("click", function (event) {
      if (!document.body.classList.contains("nav-open")) return;
      if (event.target.closest("#sidebar") || event.target.closest("#menu-btn")) return;
      document.body.classList.remove("nav-open");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") document.body.classList.remove("nav-open");
    });
  }

  // ---------- lesson page ----------
  function renderExerciseBadges() {
    document.querySelectorAll(".exercise[data-ex]").forEach(function (box) {
      var old = box.querySelector(".badge");
      if (old) old.remove();
      var ok = exPassed(box.dataset.ex);
      box.classList.toggle("passed", ok);
      if (ok) box.querySelector("h3").appendChild(el("span", { class: "badge", text: "✓ passed" }));
    });
  }

  function initReadToggle() {
    var pager = document.querySelector(".pager");
    if (!currentId || !pager) return;
    var box = el("input", { type: "checkbox" });
    box.checked = !!readSet()[currentId];
    box.addEventListener("change", function () {
      var read = readSet();
      if (box.checked) read[currentId] = 1; else delete read[currentId];
      storeSet("z2d-read", JSON.stringify(read));
      renderSidebar();
    });
    var label = el("label", { class: "read-toggle" }, [box, el("span", { text: "I have read this lesson" })]);
    pager.parentNode.insertBefore(label, pager);
  }

  // ---------- home page ----------
  function renderHome() {
    var grid = document.getElementById("tracks");
    if (!grid) return;
    grid.textContent = "";
    var read = readSet();
    var totalEx = 0, passedEx = 0;

    var chosen = (window.Z2D_PROFILE && window.Z2D_PROFILE.tracks) || [];
    if (!chosen.length && window.Z2D && window.Z2D.pathTracks) chosen = window.Z2D.pathTracks();
    var ordered = curriculum.tracks.filter(function (t) { return chosen.indexOf(t.id) >= 0; })
      .concat(curriculum.tracks.filter(function (t) { return chosen.indexOf(t.id) < 0; }));

    ordered.forEach(function (track) {
      var exercises = [];
      track.lessons.forEach(function (l) { exercises = exercises.concat(l.exercises); });
      var passed = exercises.filter(function (e) { return exPassed(e.id); }).length;
      totalEx += exercises.length;
      passedEx += passed;
      var target = track.lessons.filter(function (l) { return !lessonDone(l, read); })[0] || track.lessons[0];
      var fill = el("i", {});
      fill.style.width = (exercises.length ? Math.round(100 * passed / exercises.length) : 0) + "%";
      var cls = "track" + (chosen.length && chosen.indexOf(track.id) < 0 ? " track-other" : "");
      grid.appendChild(el("a", { class: cls, href: lessonHref(target.id) }, [
        el("h3", { text: track.title }),
        el("p", { text: track.blurb }),
        el("div", { class: "meta" }, [
          el("span", { text: track.lessons.length + " lessons" }),
          el("span", { text: passed + "/" + exercises.length + " exercises" })
        ]),
        el("div", { class: "bar" }, [fill])
      ]));
    });

    var overall = document.getElementById("overall");
    if (overall) {
      overall.textContent = window.Z2D_PROGRESS
        ? passedEx + " of " + totalEx + " exercises passed"
        : totalEx + " exercises. Progress shows here after your first check.py run.";
    }
    var next = document.getElementById("continue");
    if (next) {
      var started = passedEx > 0 || Object.keys(read).length > 0;
      // Once exercises are being passed, "continue" means the next unfinished exercise,
      // not an earlier reading-only lesson that was never ticked.
      var pool = allLessons();
      if (chosen.length) {
        var mine = [];
        ordered.forEach(function (t) { if (chosen.indexOf(t.id) >= 0) mine = mine.concat(t.lessons); });
        pool = mine;
      }
      var todo = pool.filter(function (l) {
        if (passedEx > 0) return l.exercises.length > 0 && !lessonDone(l, read);
        return !lessonDone(l, read);
      })[0];
      if (todo) {
        next.href = lessonHref(todo.id);
        next.textContent = (started ? "Continue: " : "Start: ") + todo.title;
      }
    }
  }

  // ---------- code colouring ----------
  var KEYWORDS = {
    c: "auto break case char const continue default do double else enum extern float for goto if inline int long register return short signed sizeof static struct switch typedef union unsigned void volatile while NULL size_t bool true false",
    python: "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield",
    bash: "if then else elif fi for while until do done case esac function in return exit local export",
    java: "abstract boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new null package private protected public record return short static super switch this throw throws try var void while true false",
    elixir: "def defp defmodule defstruct do end fn if else unless case cond with when for in and or not nil true false import alias require use receive after try rescue raise",
    javascript: "const let var function return if else for while do break continue switch case default class extends new this super import export from as async await try catch finally throw typeof instanceof in of null undefined true false void delete yield static get set interface type enum implements readonly public private",
    cpp: "alignas auto bool break case catch char class const constexpr continue default delete do double else enum explicit extern false float for friend if inline int long namespace new nullptr operator private protected public return short signed sizeof static struct switch template this throw true try typedef typename union unsigned using virtual void volatile while",
    go: "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false string int int64 float64 bool error",
    rust: "as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while",
    ruby: "alias and begin break case class def defined do else elsif end ensure false for if in module next nil not or redo rescue retry return self super then true undef unless until when while yield puts require",
    php: "abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enum extends final finally fn for foreach function global if implements include instanceof interface isset list match namespace new null or print private protected public readonly require require_once return static switch throw trait try unset use var while yield true false int float string bool void mixed self parent",
    dockerfile: "FROM RUN COPY ADD CMD ENTRYPOINT WORKDIR ENV EXPOSE ARG USER VOLUME HEALTHCHECK LABEL AS",
    yaml: "true false null",
    sql: "select from where and or not null is in like between order by group having limit offset join left right inner outer full cross on as insert into values update set delete create table primary key foreign references unique check default index drop alter add distinct union all case when then else end with over partition begin commit rollback explain analyze returning asc desc exists integer text real numeric boolean serial jsonb timestamp date using"
  };
  var COMMENTS = {
    c: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    java: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    python: "#[^\\n]*",
    elixir: "#[^\\n]*",
    bash: "(?:^|(?<=\\s))#[^\\n]*",
    javascript: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    cpp: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    go: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    rust: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    ruby: "#[^\\n]*",
    php: "\\/\\/[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    dockerfile: "(?:^|(?<=\\s))#[^\\n]*",
    yaml: "(?:^|(?<=\\s))#[^\\n]*",
    sql: "--[^\\n]*"
  };
  var STRING = "`(?:\\\\.|[^`\\\\])*`|\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''|\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'";

  function span(cls, text) { return el("span", { class: cls, text: text }); }

  function colourConsole(code, text) {
    text.split("\n").forEach(function (line, i, lines) {
      if (line.indexOf("$ ") === 0) {
        code.appendChild(span("tok-prompt", "$ "));
        code.appendChild(span("tok-cmd", line.slice(2)));
      } else {
        code.appendChild(span("tok-out", line));
      }
      if (i < lines.length - 1) code.appendChild(document.createTextNode("\n"));
    });
  }

  // HTML and CSS are not keyword languages: each has its own small set of patterns.
  var MARKUP = {
    html: ["(<!--[\\s\\S]*?-->)|(<\\/?[A-Za-z][\\w-]*|\\/?>)|(\"[^\"\\n]*\"|'[^'\\n]*')|([A-Za-z_:@][\\w:.-]*(?==))", "g",
           ["tok-c", "tok-k", "tok-s", "tok-p"]],
    css: ["(\\/\\*[\\s\\S]*?\\*\\/)|(@[\\w-]+|(?<=[{;]\\s*|^\\s+)[\\w-]+(?=\\s*:))|(\"[^\"\\n]*\"|'[^'\\n]*')|(#[0-9a-fA-F]{3,8}\\b|\\b\\d+(?:\\.\\d+)?(?:px|rem|em|vh|vw|fr|ms|s|deg|%)?)", "gm",
          ["tok-c", "tok-k", "tok-s", "tok-n"]],
    scss: ["(\\/\\*[\\s\\S]*?\\*\\/|(?<![:\\w])\\/\\/[^\\n]*)|(@[\\w-]+|(?<=[{;]\\s*|^\\s+)[\\w-]+(?=\\s*:))|(\"[^\"\\n]*\"|'[^'\\n]*')|(#[0-9a-fA-F]{3,8}\\b|\\b\\d+(?:\\.\\d+)?(?:px|rem|em|vh|vw|fr|ms|s|deg|%)?)|(\\$[\\w-]+)", "gm",
           ["tok-c", "tok-k", "tok-s", "tok-n", "tok-p"]]
  };
  MARKUP.vue = MARKUP.html;

  function colourMarkup(code, text, rule) {
    var re = new RegExp(rule[0], rule[1]), classes = rule[2], last = 0, m;   // throws on a very old browser
    code.textContent = "";
    while ((m = re.exec(text)) !== null) {
      if (m[0] === "") { re.lastIndex++; continue; }
      if (m.index > last) code.appendChild(document.createTextNode(text.slice(last, m.index)));
      var cls = null;
      for (var i = 0; i < classes.length; i++) if (m[i + 1] !== undefined) cls = classes[i];
      code.appendChild(span(cls, m[0]));
      last = m.index + m[0].length;
    }
    if (last < text.length) code.appendChild(document.createTextNode(text.slice(last)));
  }

  function colour(code, lang) {
    var text = code.textContent;
    if (lang === "console") { code.textContent = ""; colourConsole(code, text); return; }
    if (MARKUP[lang]) { try { colourMarkup(code, text, MARKUP[lang]); } catch (e) { code.textContent = text; } return; }
    lang = { js: "javascript", jsx: "javascript", ts: "javascript", tsx: "javascript", typescript: "javascript",
             mjs: "javascript", json: "javascript", sh: "bash", yml: "yaml" }[lang] || lang;
    if (!KEYWORDS[lang]) return;
    var words = {};
    KEYWORDS[lang].split(" ").forEach(function (w) { words[w] = true; });
    var pre = lang === "c" || lang === "cpp" ? "|(^[ \\t]*#[ \\t]*\\w+)" : "|($^)";
    var re;
    try {
      re = new RegExp("(" + STRING + ")|(" + COMMENTS[lang] + ")" + pre + "|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_]\\w*)", "gm");
    } catch (e) { return; } // very old browser without lookbehind: leave the code plain
    code.textContent = "";
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m[0] === "") { re.lastIndex++; continue; }
      if (m.index > last) code.appendChild(document.createTextNode(text.slice(last, m.index)));
      var cls = null;
      if (m[1]) cls = "tok-s";
      else if (m[2]) cls = "tok-c";
      else if (m[3]) cls = "tok-p";
      else if (m[4]) cls = "tok-n";
      else if (words[lang === "sql" ? m[5].toLowerCase() : m[5]]) cls = "tok-k";
      code.appendChild(cls ? span(cls, m[0]) : document.createTextNode(m[0]));
      last = m.index + m[0].length;
    }
    if (last < text.length) code.appendChild(document.createTextNode(text.slice(last)));
  }

  function copyText(text, done) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    var area = el("textarea", {});
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { if (document.execCommand("copy")) done(); } catch (e) { /* ignore */ }
    area.remove();
  }

  function initCode() {
    document.querySelectorAll("pre > code").forEach(function (code) {
      var lang = (code.className.match(/lang-(\w+)/) || [])[1] || "text";
      var raw = code.textContent;
      colour(code, lang);
      if (lang === "text") return; // diagrams and sample output: nothing worth copying
      var btn = el("button", { class: "copy-btn", type: "button", text: "Copy" });
      btn.addEventListener("click", function () {
        var text = raw;
        if (lang === "console") {
          // copy only the commands, without the prompt or the sample output
          var cmds = raw.split("\n").filter(function (l) { return l.indexOf("$ ") === 0; });
          if (cmds.length) text = cmds.map(function (l) { return l.slice(2); }).join("\n");
        }
        copyText(text, function () {
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = "Copy"; }, 1400);
        });
      });
      code.parentNode.appendChild(btn);
    });
  }

  // ---------- start ----------
  function renderProgress() {
    renderSidebar();
    renderExerciseBadges();
    renderHome();
    if (window.Z2D && window.Z2D.onProgress) window.Z2D.onProgress();     // game.js: experience, badges
  }

  // ---------- instructions for the system the learner is on ----------
  // Blocks marked data-os="linux wsl", "macos" or "windows" are shown when they match, and
  // tucked away behind one button when they do not.
  var OS_SHOWS = { wsl: ["wsl", "linux"], linux: ["linux"], macos: ["macos"], windows: ["windows", "wsl"] };

  function guessOs() {
    var agent = navigator.userAgent || "";
    if (/Windows/i.test(agent)) return { os: "windows", name: "Windows" };
    if (/Mac OS X|Macintosh/i.test(agent)) return { os: "macos", name: "macOS" };
    if (/Linux|X11/i.test(agent)) return { os: "linux", name: "Linux" };
    return { os: "other", name: "" };
  }

  function applyOs(info) {
    var shows = OS_SHOWS[info.os];
    document.body.dataset.os = info.os;
    var parents = [];
    document.querySelectorAll("[data-os]").forEach(function (block) {
      if (block === document.body) return;
      var wanted = block.dataset.os.split(" ");
      var match = !shows || wanted.some(function (w) { return shows.indexOf(w) >= 0; });
      block.classList.toggle("os-other", !match);
      if (parents.indexOf(block.parentNode) < 0) parents.push(block.parentNode);
    });
    parents.forEach(function (parent) {
      var old = parent.querySelector(":scope > .os-note");
      if (old) old.remove();
      var hidden = parent.querySelectorAll(":scope > .os-other").length;
      var first = parent.querySelector(":scope > [data-os]");
      if (!shows || !hidden || !first) return;
      var toggle = el("button", { type: "button", class: "os-toggle", text: "Show the steps for other systems" });
      toggle.addEventListener("click", function () {
        var all = parent.classList.toggle("os-show-all");
        toggle.textContent = all ? "Show only the steps for this system" : "Show the steps for other systems";
      });
      var words = info.os === "windows"
        ? "You are on Windows. The work happens in Ubuntu inside WSL, so the steps for both are shown. "
        : "Showing the steps for " + info.name + ". ";
      parent.insertBefore(el("p", { class: "os-note" }, [document.createTextNode(words), toggle]), first);
    });
  }

  // hooks for studio.js (the interactive layer of the local app)
  window.Z2D = { render: renderProgress, colour: colour, applyOs: applyOs };

  applyOs(guessOs());
  initTheme();
  initMenu();
  initCode();
  initReadToggle();
  renderProgress();

  // progress.js is written by check.py. It is absent until the first run, and that is fine.
  var script = document.createElement("script");
  script.src = root + "progress.js";
  script.onload = renderProgress;
  document.head.appendChild(script);
})();
