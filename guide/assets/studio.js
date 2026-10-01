/* zero2dev studio: the interactive layer. It needs the app on the learner's own computer.
   - Served by `python3 app.py`: everything is on.
   - Served from a public address (the guide hosted online): an Install button explains how to
     get the app, and a site the learner has approved may use the app from here.
   - Opened as files: reading only.
   No dependencies. All text from the server is inserted with textContent, never as HTML. */
(function () {
  "use strict";

  var root = document.body.dataset.root || "";
  var onThisComputer = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  var isWeb = location.protocol === "http:" || location.protocol === "https:";
  var LOCAL_APP = "http://127.0.0.1:4750/";
  var apiBase = root;             // where the API is: this server, or the app on this computer
  var hosted = false;             // true when this page comes from somewhere other than the app
  var token = null;

  // ---------------------------------------------------------------- helpers
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else if (key === "class") node.className = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  function button(label, cls, onClick) {
    var b = el("button", { type: "button", class: "st-btn " + (cls || ""), text: label });
    b.addEventListener("click", onClick);
    return b;
  }

  function api(method, name, data) {
    var options = { method: method, headers: { "X-Z2D-Token": token } };
    var url = apiBase + "api/" + name;
    if (method === "GET" && data) {
      url += "?" + Object.keys(data).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
      }).join("&");
    } else if (data) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(data);
    }
    return fetch(url, options).then(function (response) {
      return response.json().then(function (body) {
        if (!response.ok) throw new Error(body.error || ("request failed: " + response.status));
        return body;
      });
    });
  }

  function setProgress(progress) {
    if (!progress) return;
    window.Z2D_PROGRESS = progress;
    if (window.Z2D && window.Z2D.render) window.Z2D.render();
  }

  // Follow a background job (download, install) until it ends.
  function watchJob(job, logNode, done) {
    function show(j) {
      logNode.hidden = false;
      logNode.textContent = j.title + " ...\n" + j.log;
      logNode.scrollTop = logNode.scrollHeight;
    }
    show(job);
    var timer = setInterval(function () {
      api("GET", "job", { id: job.id }).then(function (j) {
        show(j);
        if (j.state !== "running") {
          clearInterval(timer);
          logNode.textContent = j.title + ": " + (j.state === "done" ? "finished" : "FAILED") + "\n" + j.log;
          done(j.state === "done");
        }
      }).catch(function (error) {
        clearInterval(timer);
        logNode.textContent = String(error.message);
        done(false);
      });
    }, 1500);
  }

  // ---------------------------------------------------------------- editor
  var EXTENSIONS = {
    c: "c", h: "c", cpp: "cpp", cc: "cpp", hpp: "cpp", py: "python", java: "java", ex: "elixir", exs: "elixir",
    sql: "sql", sh: "bash", js: "javascript", mjs: "javascript", jsx: "javascript", ts: "javascript", tsx: "javascript",
    go: "go", rs: "rust", rb: "ruby", yaml: "yaml", yml: "yaml", php: "php", html: "html", htm: "html",
    css: "css", json: "javascript"
  };

  // Unsaved edits survive a reload or a closed tab: they are kept in the browser until they are saved.
  function draftKey(id, name) { return "z2d-draft:" + id + ":" + name; }
  function draftGet(id, name) { try { return localStorage.getItem(draftKey(id, name)); } catch (e) { return null; } }
  function draftSet(id, name, value) {
    try {
      if (value === null) localStorage.removeItem(draftKey(id, name));
      else localStorage.setItem(draftKey(id, name), value);
    } catch (e) { /* storage full or blocked: drafts are a convenience */ }
  }

  function languageOf(name) {
    var base = name.split("/").pop();
    if (/^Dockerfile/.test(base)) return "dockerfile";
    if (base === "Makefile") return "bash";
    return EXTENSIONS[base.split(".").pop()] || "text";
  }

  function Editor(file, onRun) {
    var self = this;
    this.file = file;
    this.area = el("textarea", {
      class: "st-area", spellcheck: "false", autocapitalize: "off", autocomplete: "off",
      wrap: "off", "aria-label": "Code editor for " + file.name
    });
    this.area.value = file.content;
    this.gutter = el("div", { class: "st-gutter", "aria-hidden": "true" });
    // Syntax colouring: the textarea's own text is transparent, and an identically laid out
    // <pre> behind it shows the same text in colour. The caret and the selection stay native.
    this.lang = languageOf(file.name);
    this.code = el("code", {});
    this.backdrop = el("pre", { class: "st-highlight", "aria-hidden": "true" }, [this.code]);
    this.node = el("div", { class: "st-editor" }, [
      this.gutter, el("div", { class: "st-code" }, [this.backdrop, this.area])
    ]);
    this.saved = file.content;
    var indent = /(^|\/)(Makefile|.*\.go)$/.test(file.name) ? "\t" : "    ";

    function paint() {
      // the extra line keeps the backdrop at least as tall as the textarea's scroll area
      self.code.textContent = self.area.value + "\n ";
      if (window.Z2D && window.Z2D.colour) window.Z2D.colour(self.code, self.lang);
      self.backdrop.scrollTop = self.area.scrollTop;
      self.backdrop.scrollLeft = self.area.scrollLeft;
    }
    function refresh() {
      var lines = self.area.value.split("\n").length;
      var text = "";
      for (var i = 1; i <= lines; i++) text += i + "\n";
      self.gutter.textContent = text;
      var height = Math.min(Math.max(lines, 8), 30) * 21 + 24;
      self.area.style.height = height + "px";
      self.gutter.style.height = height + "px";
      paint();
    }
    function insert(text) {
      var start = self.area.selectionStart, end = self.area.selectionEnd;
      self.area.setRangeText(text, start, end, "end");
      refresh();
    }
    this.area.addEventListener("input", refresh);
    this.area.addEventListener("input", function () { if (self.onEdit) self.onEdit(); });
    this.area.addEventListener("scroll", function () {
      self.gutter.scrollTop = self.area.scrollTop;
      self.backdrop.scrollTop = self.area.scrollTop;
      self.backdrop.scrollLeft = self.area.scrollLeft;
    });
    this.area.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        onRun();
      } else if (event.key === "Tab" && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        insert(indent);
      } else if (event.key === "Enter" && !event.shiftKey) {
        // keep the indentation of the current line; go one level deeper after an opening bracket or colon
        var before = self.area.value.slice(0, self.area.selectionStart);
        var line = before.slice(before.lastIndexOf("\n") + 1);
        var lead = (line.match(/^[ \t]*/) || [""])[0];
        if (/[{(\[:]\s*$/.test(line) || /\b(do|then)\s*$/.test(line)) lead += indent;
        event.preventDefault();
        insert("\n" + lead);
      } else if (event.key === "Escape") {
        self.area.blur();       // lets keyboard users leave the editor, since Tab is taken
      }
    });
    refresh();
    this.refresh = refresh;
  }
  Editor.prototype.value = function () { return this.area.value; };
  Editor.prototype.dirty = function () { return this.area.value !== this.saved; };
  Editor.prototype.set = function (content) { this.area.value = content; this.saved = content; this.refresh(); };

  // ---------------------------------------------------------------- one exercise
  function Studio(box, mount) {
    this.box = box;                 // the exercise's task box in the lesson
    this.id = box.dataset.ex;
    this.editors = {};
    this.info = null;
    this.lang = null;
    this.hintsShown = 0;
    this.busy = false;
    this.node = el("div", { class: "studio" });
    mount.appendChild(this.node);   // the editor, terminal and results live in the side panel
    this.load();
  }

  Studio.prototype.load = function (lang) {
    var self = this;
    var query = { id: this.id };
    if (lang) query.lang = lang;
    return api("GET", "exercise", query).then(function (info) { self.render(info); })
      .catch(function (error) { self.node.textContent = "Could not load this exercise: " + error.message; });
  };

  Studio.prototype.files = function () {
    var out = {};
    Object.keys(this.editors).forEach(function (name) { out[name] = this.editors[name].value(); }, this);
    return out;
  };

  Studio.prototype.render = function (info) {
    var self = this;
    this.info = info;
    this.lang = info.lang;
    this.editors = {};
    this.node.textContent = "";

    this.status = el("span", { class: "st-status", role: "status" });
    this.results = el("div", { class: "st-results", "aria-live": "polite" });
    this.jobLog = el("pre", { class: "st-log" });
    this.jobLog.hidden = true;
    this.hintBox = el("div", { class: "st-hints" });

    if (info.kind === "sandbox") this.renderTerminal(info);
    else this.renderEditors(info);

    var runLabel = info.kind === "sandbox" ? "Check my work" : "Run tests";
    this.runBtn = button(runLabel, "st-primary", function () { self.run(); });
    var bar = el("div", { class: "st-bar" }, [this.runBtn]);
    if (info.can_show) {
      bar.appendChild(button(info.kind === "redis" ? "Run commands" : "Show result", "", function () { self.show(); }));
    }
    if (info.can_start_app) {
      this.appWords = info.kind === "web" ? ["Open preview", "Stop preview"] : ["Start app", "Stop app"];
      this.appBtn = button(this.appWords[info.app ? 1 : 0], "", function () { self.toggleApp(); });
      bar.appendChild(this.appBtn);
    }
    if (info.hints.length) {
      this.hintBtn = button("Hint", "", function () { self.revealHint(); });
      bar.appendChild(this.hintBtn);
    }
    if (info.kind === "sandbox") {
      bar.appendChild(button("Start over", "st-quiet", function () {
        if (!window.confirm("Delete this exercise's working folder and create it again?")) return;
        api("POST", "sandbox", { id: self.id, action: "reset" }).then(function (fresh) { self.render(fresh); });
      }));
    } else {
      bar.appendChild(button("Reset", "st-quiet", function () {
        if (!window.confirm("Replace your code with the starter?")) return;
        Object.keys(self.editors).forEach(function (name) { draftSet(self.id, name, null); });
        api("POST", "reset", { id: self.id, lang: self.lang }).then(function (fresh) { self.render(fresh); });
      }));
    }
    bar.appendChild(button("Open in VS Code", "st-quiet", function () {
      api("POST", "open", { id: self.id }).then(function (r) {
        self.status.textContent = r.opened ? "Opened " + r.path : r.error;
      });
    }));
    bar.appendChild(button("Open folder", "st-quiet", function () {
      api("POST", "open", { id: self.id, "with": "files" }).then(function (r) {
        self.status.textContent = r.opened ? "Opened " + r.path : r.error;
      });
    }));
    bar.appendChild(this.status);
    this.node.appendChild(bar);

    this.appLink = el("p", { class: "st-app" });
    this.node.appendChild(this.appLink);
    this.showApp(info.app);

    var note = this.toolNote(info);
    if (note) this.node.appendChild(note);
    this.node.appendChild(this.jobLog);
    this.node.appendChild(this.results);
    this.node.appendChild(this.hintBox);
    if (info.passed) this.status.textContent = "Passed earlier. Run again any time.";
    if (this.restored) { this.status.textContent = "Your unsaved changes were restored."; this.restored = false; }
  };

  Studio.prototype.toolNote = function (info) {
    var item = info.toolchain || info.service;
    if (!item) return null;
    var cls = { native: "st-ok", running: "st-ok", docker: "st-ok" }[item.state] || "st-warn";
    var text = item.name + ": " + item.detail;
    var node = el("p", { class: "st-tool " + cls, text: text });
    if (cls === "st-warn") node.appendChild(el("a", { href: root + "setup.html", text: " Open Setup" }));
    return node;
  };

  Studio.prototype.renderEditors = function (info) {
    var self = this;
    var tabs = el("div", { class: "st-tabs", role: "tablist" });
    var panes = el("div", { class: "st-panes" });
    var first = true;
    info.files.forEach(function (file) {
      var pane;
      if (file.editable) {
        var editor = new Editor(file, function () { self.run(); });
        self.editors[file.name] = editor;
        var draft = draftGet(self.id, file.name);
        if (draft !== null && draft !== file.content) {
          editor.area.value = draft;          // not saved to disk yet: `saved` still holds the file's content
          editor.refresh();
          self.restored = true;
        }
        editor.onEdit = function () {
          draftSet(self.id, file.name, editor.dirty() ? editor.value() : null);
        };
        pane = editor.node;
      } else {
        var shown = languageOf(file.name);
        var code = el("code", { class: "lang-" + shown, text: file.content });
        if (window.Z2D && window.Z2D.colour) window.Z2D.colour(code, shown);
        pane = el("pre", { class: "st-readonly" }, [code]);
      }
      var tab = el("button", {
        type: "button", class: "st-tab" + (file.editable ? "" : " st-tab-ro"), role: "tab",
        text: file.name + (file.editable ? "" : " (read-only)")
      });
      tab.addEventListener("click", function () {
        Array.prototype.forEach.call(tabs.children, function (t) { t.setAttribute("aria-selected", "false"); });
        Array.prototype.forEach.call(panes.children, function (p) { p.hidden = true; });
        tab.setAttribute("aria-selected", "true");
        pane.hidden = false;
        if (self.editors[file.name]) self.editors[file.name].refresh();
      });
      tab.setAttribute("aria-selected", first ? "true" : "false");
      pane.hidden = !first;
      first = false;
      tabs.appendChild(tab);
      panes.appendChild(pane);
    });

    if (info.any_lang) {
      var select = el("select", { class: "st-lang", "aria-label": "Language" });
      info.langs.forEach(function (lang) {
        var option = el("option", { value: lang.id, text: lang.name });
        if (lang.id === info.lang) option.selected = true;
        select.appendChild(option);
      });
      select.addEventListener("change", function () {
        var save = Object.keys(self.editors).length
          ? api("POST", "save", { id: self.id, lang: self.lang, files: self.files() }) : Promise.resolve();
        save.then(function () { return api("POST", "lang", { id: self.id, lang: select.value }); })
          .then(function (fresh) { self.render(fresh); });
      });
      tabs.appendChild(el("label", { class: "st-lang-label" }, [el("span", { text: "Language " }), select]));
    }
    this.node.appendChild(tabs);
    this.node.appendChild(panes);
    this.node.appendChild(el("p", {
      class: "st-keys",
      text: "Ctrl+Enter runs the tests. Tab indents; press Esc first to move on with Tab. Your code is saved to exercises/" + info.id + "/ when you run it; until then the browser keeps it as a draft."
    }));
  };

  Studio.prototype.renderTerminal = function (info) {
    var self = this;
    var log = el("pre", { class: "st-term-log", tabindex: "0", "aria-label": "Command output" });
    log.textContent = "Working folder: " + info.sandbox.path + "\nType a command below and press Enter. " +
      "Programs that open an editor or ask questions need a real terminal.\n";
    var prompt = el("span", { class: "st-prompt", text: "$" });
    var input = el("input", {
      class: "st-term-input", type: "text", spellcheck: "false", autocapitalize: "off", autocomplete: "off",
      "aria-label": "Command", placeholder: "git status"
    });
    var history = [], position = 0;
    function append(text, cls) {
      log.appendChild(el("span", { class: cls || "", text: text }));
      log.scrollTop = log.scrollHeight;
    }
    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowUp" && position > 0) { position--; input.value = history[position]; event.preventDefault(); }
      if (event.key === "ArrowDown") {
        position = Math.min(position + 1, history.length);
        input.value = history[position] || "";
        event.preventDefault();
      }
      if (event.key !== "Enter") return;
      var command = input.value.trim();
      if (!command || input.disabled) return;
      history.push(command);
      position = history.length;
      input.value = "";
      input.disabled = true;
      append("\n" + prompt.textContent + " " + command + "\n", "st-term-cmd");
      api("POST", "shell", { id: self.id, command: command }).then(function (r) {
        if (r.stdout) append(r.stdout + "\n");
        if (r.stderr) append(r.stderr + "\n", "st-term-err");
        if (r.timed_out) append("(stopped after 60 seconds)\n", "st-term-err");
        else if (r.code !== 0) append("(exit code " + r.code + ")\n", "st-term-err");
        prompt.textContent = (r.cwd === "." ? "" : r.cwd + " ") + "$";
      }).catch(function (error) { append(error.message + "\n", "st-term-err"); })
        .then(function () { input.disabled = false; input.focus(); });
    });
    this.node.appendChild(el("div", { class: "st-term" }, [log, el("label", { class: "st-term-line" }, [prompt, input])]));
  };

  Studio.prototype.setBusy = function (busy, text) {
    this.busy = busy;
    this.runBtn.disabled = busy;
    if (text !== undefined) this.status.textContent = text;
  };

  Studio.prototype.run = function () {
    var self = this;
    if (this.busy) return;
    this.setBusy(true, "Running ...");
    this.results.textContent = "";
    api("POST", "run", { id: this.id, lang: this.lang, files: this.files() }).then(function (r) {
      Object.keys(self.editors).forEach(function (name) {
        self.editors[name].saved = self.editors[name].value();
        draftSet(self.id, name, null);
      });
      self.showRun(r);
    }).catch(function (error) {
      self.results.appendChild(el("p", { class: "st-fail", text: error.message }));
    }).then(function () { self.setBusy(false); });
  };

  Studio.prototype.showRun = function (r) {
    var self = this;
    this.results.textContent = "";
    if (r.status === "skipped") {
      this.status.textContent = "Not run";
      this.results.appendChild(el("p", { class: "st-skip", text: r.skip }));
      if (r.download) this.offerDownload(r.download, function () { self.run(); });
      return;
    }
    var good = r.results.filter(function (x) { return x.ok; }).length;
    var passed = r.status === "passed";
    this.status.textContent = "";
    this.results.appendChild(el("p", {
      class: passed ? "st-summary st-pass" : "st-summary st-fail",
      text: passed ? "Passed: all " + r.results.length + " tests" : "Failed: " + good + " of " + r.results.length + " tests pass"
    }));
    var list = el("ul", { class: "st-list" });
    r.results.forEach(function (item) {
      var row = el("li", { class: item.ok ? "st-row-ok" : "st-row-bad" }, [
        el("span", { class: "st-mark", text: item.ok ? "✓" : "✗" }),
        el("span", { class: "st-name", text: item.name })
      ]);
      if (!item.ok && item.detail) row.appendChild(el("pre", { class: "st-detail", text: item.detail }));
      list.appendChild(row);
    });
    this.results.appendChild(list);
    if (r.hint) this.addHint(r.hint);
    setProgress(r.progress);
    this.box.classList.toggle("passed", passed || this.info.passed);
  };

  Studio.prototype.offerDownload = function (download, then) {
    var self = this;
    var label = download.kind === "image" ? "Download " + download.name : "Download the packages";
    var btn = button(label, "st-primary", function () {
      btn.disabled = true;
      api("POST", "job", download).then(function (job) {
        watchJob(job, self.jobLog, function (ok) { btn.disabled = false; if (ok) { btn.remove(); then(); } });
      }).catch(function (error) { self.jobLog.hidden = false; self.jobLog.textContent = error.message; btn.disabled = false; });
    });
    this.results.appendChild(btn);
  };

  Studio.prototype.addHint = function (text) {
    var shown = Array.prototype.map.call(this.hintBox.children, function (n) { return n.dataset.hint; });
    if (shown.indexOf(text) >= 0) return;
    var node = el("p", { class: "st-hint", text: "Hint: " + text });
    node.dataset.hint = text;
    this.hintBox.appendChild(node);
    this.hintsShown = Math.max(this.hintsShown, this.info.hints.indexOf(text) + 1);
    if (this.hintBtn && this.hintsShown >= this.info.hints.length) this.hintBtn.disabled = true;
  };

  Studio.prototype.revealHint = function () {
    if (this.hintsShown < this.info.hints.length) this.addHint(this.info.hints[this.hintsShown]);
  };

  Studio.prototype.show = function () {
    var self = this;
    this.setBusy(true, "Running ...");
    this.results.textContent = "";
    api("POST", "show", { id: this.id, files: this.files() }).then(function (r) {
      self.status.textContent = "";
      if (r.error) {
        self.results.appendChild(el("p", { class: "st-fail", text: r.error }));
        if (r.download) self.offerDownload(r.download, function () { self.show(); });
        return;
      }
      if (r.text !== undefined) {
        self.results.appendChild(el("pre", { class: "st-detail st-output", text: r.text }));
        return;
      }
      var head = el("tr", {}, r.columns.map(function (c) { return el("th", { text: c }); }));
      var body = r.rows.map(function (row) {
        return el("tr", {}, row.map(function (cell) { return el("td", { text: cell }); }));
      });
      self.results.appendChild(el("div", { class: "table-wrap" }, [
        el("table", { class: "st-table" }, [el("thead", {}, [head]), el("tbody", {}, body)])
      ]));
      self.results.appendChild(el("p", {
        class: "st-count",
        text: r.total + (r.total === 1 ? " row" : " rows") + (r.total > r.rows.length ? " (first " + r.rows.length + " shown)" : "")
      }));
    }).catch(function (error) {
      self.results.appendChild(el("p", { class: "st-fail", text: error.message }));
    }).then(function () { self.setBusy(false); });
  };

  Studio.prototype.showApp = function (app) {
    this.appLink.textContent = "";
    if (this.appBtn) this.appBtn.textContent = this.appWords[app ? 1 : 0];
    if (!app) return;
    this.appLink.appendChild(document.createTextNode("Your app is running at "));
    this.appLink.appendChild(el("a", { href: app.url, target: "_blank", rel: "noopener", text: app.url }));
  };

  Studio.prototype.toggleApp = function () {
    var self = this;
    var running = this.appBtn.textContent === this.appWords[1];
    this.appBtn.disabled = true;
    this.status.textContent = running ? "Stopping ..." : "Starting your app ...";
    api("POST", "app", { id: this.id, action: running ? "stop" : "start", files: this.files() }).then(function (r) {
      self.status.textContent = "";
      self.showApp(r.app);
      if (r.app && !running && self.info.kind === "web") window.open(r.app.url, "_blank", "noopener");
      if (r.error) {
        self.results.textContent = "";
        self.results.appendChild(el("pre", { class: "st-detail", text: r.error }));
        if (r.download) self.offerDownload(r.download, function () { self.toggleApp(); });
      }
    }).catch(function (error) { self.status.textContent = error.message; })
      .then(function () { self.appBtn.disabled = false; });
  };

  // Pick up edits made in another editor, unless there are unsaved changes here.
  Studio.prototype.syncFromDisk = function () {
    var self = this;
    if (this.busy || !this.info || this.info.kind === "sandbox") return;
    api("GET", "exercise", { id: this.id, lang: this.lang }).then(function (info) {
      info.files.forEach(function (file) {
        var editor = self.editors[file.name];
        if (editor && !editor.dirty() && editor.value() !== file.content) editor.set(file.content);
      });
    }).catch(function () { /* the app may have been stopped */ });
  };

  // ---------------------------------------------------------------- the side panel
  // The lesson stays on the left. Editor, terminal, Run and results sit in a panel on the right
  // that can be resized, widened to the full page, or closed, and remembers how it was left.
  function storeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function storeSet(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }

  function Workspace(boxes) {
    var self = this;
    this.studios = [];
    this.tabs = [];
    this.panes = [];
    this.current = 0;

    this.tabBar = el("div", { class: "ws-tabs", role: "tablist", "aria-label": "Exercises of this lesson" });
    this.fullBtn = el("button", { type: "button", class: "ws-icon", "aria-label": "Use the full width", title: "Full width" , text: "⤢" });
    var closeBtn = el("button", { type: "button", class: "ws-icon", "aria-label": "Close the workspace", title: "Close", text: "✕" });
    var grip = el("div", { class: "ws-grip", role: "separator", "aria-orientation": "vertical", "aria-label": "Resize the workspace", tabindex: "0" });
    this.body = el("div", { class: "ws-body" });
    this.panel = el("aside", { class: "ws", id: "workspace", "aria-label": "Workspace" }, [
      grip,
      el("div", { class: "ws-head" }, [this.tabBar, this.fullBtn, closeBtn]),
      this.body
    ]);
    this.opener = el("button", { type: "button", class: "ws-opener", text: "Workspace" });
    document.body.appendChild(this.panel);
    document.body.appendChild(this.opener);

    boxes.forEach(function (box, index) {
      var heading = box.querySelector("h3");
      var title = heading && heading.firstChild ? heading.firstChild.textContent.trim() : box.dataset.ex;

      // the task, repeated in the panel so it stays in view while the lesson is scrolled elsewhere
      var task = el("details", { class: "ws-task" }, [el("summary", { text: "Task" })]);
      var command = box.querySelector(":scope > pre:last-of-type");
      Array.prototype.forEach.call(box.children, function (child) {
        if (child.tagName === "H3" || child === command || child.classList.contains("ex-files")) return;
        var copy = child.cloneNode(true);
        Array.prototype.forEach.call(copy.querySelectorAll(".copy-btn"), function (b) { b.remove(); });
        task.appendChild(copy);
      });
      task.open = storeGet("z2d-ws-task") !== "closed";
      task.addEventListener("toggle", function () { storeSet("z2d-ws-task", task.open ? "open" : "closed"); });

      var pane = el("div", { class: "ws-pane", role: "tabpanel" }, [
        el("h2", { class: "ws-title" }, [document.createTextNode(title + " "), el("span", { class: "ex-id", text: box.dataset.ex })]),
        task
      ]);
      pane.hidden = index !== 0;
      self.body.appendChild(pane);
      self.panes.push(pane);
      self.studios.push(new Studio(box, pane));

      var tab = el("button", { type: "button", class: "ws-tab", role: "tab", text: title });
      tab.addEventListener("click", function () { self.show(index); });
      self.tabBar.appendChild(tab);
      self.tabs.push(tab);

      var open = button("Open in workspace", "st-primary", function () { self.show(index); self.open(); });
      box.appendChild(el("p", { class: "ws-launch" }, [open]));
    });
    var lessonKey = "z2d-ws-tab:" + (document.body.dataset.lesson || "");
    this.tabKey = lessonKey;
    this.show(Math.min(Number(storeGet(lessonKey)) || 0, boxes.length - 1));

    closeBtn.addEventListener("click", function () { self.close(); });
    this.opener.addEventListener("click", function () { self.open(); });
    this.fullBtn.addEventListener("click", function () {
      var full = document.body.classList.toggle("ws-full");
      self.fullBtn.setAttribute("aria-pressed", full ? "true" : "false");
      self.fullBtn.textContent = full ? "⤡" : "⤢";
      self.refresh();
    });

    // width: drag the left edge, or use the arrow keys on it
    function setWidth(px) {
      var clamped = Math.round(Math.max(360, Math.min(px, window.innerWidth - 320)));
      document.documentElement.style.setProperty("--ws-width", clamped + "px");
      storeSet("z2d-ws-width", String(clamped));
    }
    var stored = Number(storeGet("z2d-ws-width"));
    if (stored) setWidth(stored);
    grip.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      grip.setPointerCapture(event.pointerId);
      document.body.classList.add("ws-resizing");
      function move(e) { setWidth(window.innerWidth - e.clientX); }
      function stop() {
        grip.removeEventListener("pointermove", move);
        grip.removeEventListener("pointerup", stop);
        grip.removeEventListener("pointercancel", stop);
        document.body.classList.remove("ws-resizing");
        self.refresh();
      }
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", stop);
      grip.addEventListener("pointercancel", stop);
    });
    grip.addEventListener("keydown", function (event) {
      var width = self.panel.getBoundingClientRect().width;
      if (event.key === "ArrowLeft") { setWidth(width + 40); event.preventDefault(); }
      if (event.key === "ArrowRight") { setWidth(width - 40); event.preventDefault(); }
    });

    // open by default where there is room; afterwards, however it was left
    var remembered = storeGet("z2d-ws-open");
    if (remembered === "1" || (remembered === null && window.innerWidth >= 1100)) this.open(true);
  }

  Workspace.prototype.show = function (index) {
    this.current = index;
    this.panes.forEach(function (pane, i) { pane.hidden = i !== index; });
    this.tabs.forEach(function (tab, i) { tab.setAttribute("aria-selected", i === index ? "true" : "false"); });
    this.tabBar.hidden = this.tabs.length < 2;
    if (this.tabKey) storeSet(this.tabKey, String(index));
    this.refresh();
  };

  Workspace.prototype.refresh = function () {
    var studio = this.studios[this.current];
    if (studio) Object.keys(studio.editors).forEach(function (name) { studio.editors[name].refresh(); });
  };

  Workspace.prototype.open = function (quiet) {
    document.body.classList.add("ws-open");
    if (!quiet) storeSet("z2d-ws-open", "1");
    this.refresh();
  };

  Workspace.prototype.close = function () {
    document.body.classList.remove("ws-open", "ws-full");
    storeSet("z2d-ws-open", "0");
  };

  // ---------------------------------------------------------------- setup page
  var BADGE = {
    native: ["Installed", "st-ok"], running: ["Running", "st-ok"], docker: ["Via Docker", "st-ok"],
    "docker-download": ["Needs download", "st-warn"], "workspace-download": ["Needs download", "st-warn"],
    stopped: ["Stopped", "st-warn"], absent: ["Not started", "st-warn"],
    missing: ["Not installed", "st-bad"], unavailable: ["Unavailable", "st-bad"]
  };
  var USER_STACKS = ["node", "java", "go", "rust", "elixir"];
  var FALLBACK_STACKS = ["node", "java", "go", "rust", "elixir"];

  // One line of the Setup page or of a lesson's install box: a badge, what was found, and what can be done about it.
  function needRow(item, kind, canSudo, log, reload) {
    var badge = BADGE[item.state] || [item.state, "st-warn"];
    var actions = el("div", { class: "st-actions" });
    function start(payload, b) {
      b.disabled = true;
      api("POST", "job", payload).then(function (j) {
        watchJob(j, log, function (ok) {
          if (ok || payload.kind !== "install") { reload(); return; }
          b.disabled = false;
          failed(payload);            // keep the log on screen and say what can be done now
        });
      }).catch(function (error) { log.hidden = false; log.textContent = error.message; b.disabled = false; });
    }
    function job(payload, label) {
      var b = button(label, "", function () { start(payload, b); });
      actions.appendChild(b);
    }
    function failed(payload) {
      var old = log.parentNode.querySelector(".st-failed");
      if (old) old.remove();
      var box = el("div", { class: "st-failed" }, [
        el("p", { text: item.name + " was not installed. The lines above say why. What you can do now:" })
      ]);
      var again = button("Try again", "", function () { box.remove(); start({ kind: "install", name: payload.name }, again); });
      box.appendChild(again);
      if (!payload.fallback && canSudo && FALLBACK_STACKS.indexOf(payload.name) >= 0) {
        var other = button("Install it another way (system packages)", "", function () {
          box.remove();
          start({ kind: "install", name: payload.name, fallback: true }, other);
        });
        box.appendChild(other);
      }
      box.appendChild(button("Check again", "", reload));
      box.appendChild(el("p", {
        class: "st-count",
        text: (item.image ? "Or install nothing: with Docker running, the app runs " + item.name + " in a container. " : "") +
          "In a terminal: ./setup/install.sh --stack " + payload.name + (FALLBACK_STACKS.indexOf(payload.name) >= 0 ? "   (add --fallback for the system packages)" : "")
      }));
      log.parentNode.insertBefore(box, log.nextSibling);
    }
    function service(action, label, purge) {
      var b = button(label, "", function () {
        b.disabled = true;
        api("POST", "service", { name: item.id, action: action, purge: !!purge }).then(function (r) {
          if (r.download) {
            api("POST", "job", r.download).then(function (j) {
              watchJob(j, log, function (ok) { if (ok) api("POST", "service", { name: item.id, action: "up" }).then(reload); else reload(); });
            });
          } else {
            if (r.error) { log.hidden = false; log.textContent = r.error; }
            reload();
          }
        }).catch(function (error) { log.hidden = false; log.textContent = error.message; b.disabled = false; });
      });
      actions.appendChild(b);
    }
    if (kind === "service") {
      if (item.state === "running") service("down", "Stop");
      else if (item.state === "stopped" || item.state === "absent") service("up", "Start");
    } else if (item.state === "docker-download") {
      job({ kind: "image", name: item.image }, "Download");
    } else if (item.state === "workspace-download") {
      job({ kind: "workspace", name: item.id }, "Download packages");
    } else if (item.state === "missing" && item.stack &&
               (USER_STACKS.indexOf(item.stack) >= 0 || canSudo) && item.id !== "docker") {
      job({ kind: "install", name: item.stack }, "Install");
    }
    return el("li", { class: "st-item" }, [
      el("span", { class: "st-badge " + badge[1], text: badge[0] }),
      el("div", { class: "st-item-main" }, [el("strong", { text: item.name }), el("span", { text: " " + item.detail })]),
      actions
    ]);
  }

  // The "what this track needs" box of a track's first lesson, with what this machine really has.
  function renderInstallBox(box) {
    var live = el("div", { class: "install-live" });
    var log = el("pre", { class: "st-log" });
    log.hidden = true;
    box.insertBefore(live, box.querySelector("summary").nextSibling);
    function load() {
      live.textContent = "Checking this machine ...";
      api("GET", "track", { id: box.dataset.track }).then(function (track) {
        live.textContent = "";
        live.appendChild(el("p", {
          class: track.ready ? "st-tool st-ok" : "st-tool st-warn",
          text: track.ready ? "This machine is ready for this track." : "Something is missing for this track. See below."
        }));
        live.appendChild(el("ul", { class: "st-items" }, track.needs.map(function (item) {
          return needRow(item, item.kind, track.can_sudo, log, load);
        })));
        live.appendChild(log);
        if (!track.ready) box.open = true;
      }).catch(function (error) { live.textContent = "Could not check this machine: " + error.message; });
    }
    load();
  }

  function renderSetup(mount) {
    mount.textContent = "Checking this machine ...";
    api("GET", "doctor", { fresh: "1" }).then(function (report) {
      mount.textContent = "";
      var log = el("pre", { class: "st-log" });
      log.hidden = true;
      function reload() { renderSetup(mount); }

      function row(item, kind) {
        return needRow(item, kind, report.can_sudo, log, reload);
      }

      function section(title, intro, items, kind) {
        var list = el("ul", { class: "st-items" }, items.map(function (item) { return row(item, kind); }));
        return el("section", {}, [el("h2", { text: title }), intro ? el("p", { text: intro }) : null, list]);
      }

      // tracks
      var chosen = (report.profile.tracks || []).slice();
      var saving = Promise.resolve();      // one save at a time, so quick clicks cannot overtake each other
      var trackList = el("ul", { class: "st-items" });
      report.tracks.forEach(function (track) {
        var box = el("input", { type: "checkbox" });
        box.checked = chosen.indexOf(track.id) >= 0;
        box.addEventListener("change", function () {
          var index = chosen.indexOf(track.id);
          if (box.checked && index < 0) chosen.push(track.id);
          if (!box.checked && index >= 0) chosen.splice(index, 1);
          var snapshot = chosen.slice();
          saving = saving.then(function () { return api("POST", "profile", { tracks: snapshot }); })
            .catch(function () { /* the next save carries the full list again */ });
        });
        var needs = track.needs.map(function (n) { return n.name + ": " + (BADGE[n.state] || [n.state])[0].toLowerCase(); }).join(" · ");
        trackList.appendChild(el("li", { class: "st-item" }, [
          el("span", { class: "st-badge " + (track.ready ? "st-ok" : "st-warn"), text: track.ready ? "Ready" : "Needs setup" }),
          el("label", { class: "st-item-main st-check" }, [box, el("strong", { text: " " + track.title }), el("span", { text: " " + needs })])
        ]));
      });
      mount.appendChild(el("section", {}, [
        el("h2", { text: "What do you want to learn?" }),
        el("p", { text: "Tick the tracks you want. They move to the top of the home page. Nothing is installed by ticking." }),
        trackList
      ]));

      mount.appendChild(log);
      mount.appendChild(section("Languages",
        "Tools already on this machine are used as they are. A language that is missing can run in Docker instead, so you do not have to install it.",
        report.toolchains, "toolchain"));
      mount.appendChild(section("Tools", "", report.tools.concat([report.docker]), "tool"));
      mount.appendChild(section("Databases and services",
        "A server already running on this machine is used. Otherwise the app starts one in Docker, reachable only from this computer.",
        report.services, "service"));
      if (report.workspaces.length) {
        mount.appendChild(section("Package sets",
          "Frameworks such as React need packages from the internet once. After that they work offline.",
          report.workspaces, "workspace"));
      }
      mount.appendChild(el("p", { class: "st-count", text: "Working folders and downloads live in " + report.work_root }));
      if (report.platform) {
        mount.insertBefore(el("p", {
          class: "st-tool " + (report.platform.installer ? "st-ok" : "st-warn"),
          text: "This is " + report.platform.name + ". " + (report.platform.os === "wsl"
            ? "You work in Ubuntu, and this page is shown by your Windows browser. Install buttons act inside Ubuntu."
            : report.platform.installer ? "Install buttons use the install script of this project."
            : "The install script covers Ubuntu and Debian. Here, install missing tools with your own package manager, or let Docker run them.")
        }), mount.firstChild);
        if (window.Z2D && window.Z2D.applyOs) window.Z2D.applyOs(report.platform);
      }
      // websites that may use this app
      var sites = el("section", {}, [
        el("h2", { text: "Websites that may use this app" }),
        el("p", { text: "The guide can also be read on a public website. A site listed here may run exercises with this app from its own address. Such a site can run code on this computer, so the list is empty until you approve one." })
      ]);
      var siteList = el("ul", { class: "st-items" });
      function showSites(reply) {
        siteList.textContent = "";
        if (!reply.origins.length) siteList.appendChild(el("li", { class: "st-item" }, [el("span", { class: "st-item-main", text: "None." })]));
        reply.origins.forEach(function (origin) {
          var remove = button("Remove", "", function () {
            remove.disabled = true;
            api("POST", "unpair", { origin: origin }).then(showSites);
          });
          siteList.appendChild(el("li", { class: "st-item" }, [
            el("span", { class: "st-badge st-warn", text: "Allowed" }),
            el("div", { class: "st-item-main" }, [el("strong", { text: origin })]),
            el("div", { class: "st-actions" }, [remove])
          ]));
        });
      }
      api("GET", "origins").then(showSites).catch(function () { /* an approved site may not read this list */ });
      sites.appendChild(siteList);
      if (!hosted) mount.appendChild(sites);

      // keep the app running
      var keep = el("section", {}, [
        el("h2", { text: "Keep the app running" }),
        el("p", { text: "The app starts by itself when you log in, always at the same address, so this page is one bookmark away. It switched this on the first time it was started. It listens on this computer only, and you can switch it off here." })
      ]);
      var keepLine = el("p", { class: "st-tool", text: "Checking ..." });
      var keepBtn = button("", "", function () {
        keepBtn.disabled = true;
        api("POST", "autostart", { enable: !keepBtn.dataset.on }).then(showKeep)
          .catch(function (error) { keepLine.textContent = error.message; keepBtn.disabled = false; });
      });
      keepBtn.hidden = true;
      function showKeep(info) {
        keepBtn.disabled = false;
        keepBtn.hidden = !info.supported;
        if (info.enabled) keepBtn.dataset.on = "1"; else delete keepBtn.dataset.on;
        keepBtn.textContent = info.enabled ? "Stop starting at login" : "Start at login";
        keepLine.className = "st-tool " + (info.enabled ? "st-ok" : "");
        keepLine.textContent = (info.message ? info.message + " " : "") + (info.supported
          ? (info.enabled ? "On: " : "Off. It would use ") + info.description + "."
          : "Starting at login is not available on this system.");
      }
      api("GET", "autostart").then(showKeep).catch(function (error) { keepLine.textContent = error.message; });
      keep.appendChild(keepLine);
      keep.appendChild(keepBtn);
      keep.appendChild(el("p", { class: "st-count", text: "In a terminal: python3 app.py start (run in the background), stop, status, autostart on, autostart off." }));
      mount.appendChild(keep);

      mount.appendChild(button("Check again", "", reload));
      if (!report.can_sudo) {
        mount.appendChild(el("p", {
          class: "st-count",
          text: "System packages need your password, which a web page must never ask for. For those, the row shows the command to run in a terminal."
        }));
      }
    }).catch(function (error) { mount.textContent = "Could not read the environment: " + error.message; });
  }

  // ---------------------------------------------------------------- the guide hosted online
  var REPO_RAW = "https://raw.githubusercontent.com/bugemarvin/zero2dev/main/setup/";
  var INSTALL = {
    windows: {
      label: "Windows",
      steps: [
        "Open the Start menu, type PowerShell, right-click it and choose \"Run as administrator\".",
        "Paste this line and press Enter:",
        "The first time, Windows installs Ubuntu (a real Linux inside Windows) and asks you to restart. After the restart, open \"Ubuntu\" from the Start menu once, choose a user name and password, then paste the same line into PowerShell again.",
        "The app opens in your browser. From now on it works without the internet and starts when you log in."
      ],
      command: "irm " + REPO_RAW + "get.ps1 | iex"
    },
    linux: {
      label: "Ubuntu / Linux",
      steps: [
        "Open a terminal: press Ctrl+Alt+T, or look for \"Terminal\" in your applications.",
        "Paste this line and press Enter:",
        "If git or Python is missing, it asks for your password to install them. Nothing shows while you type a password: that is normal.",
        "The app opens in your browser. From now on it works without the internet and starts when you log in."
      ],
      command: "curl -fsSL " + REPO_RAW + "get.sh | bash"
    },
    macos: {
      label: "macOS",
      steps: [
        "Open Terminal: press Cmd+Space, type Terminal, press Enter.",
        "Paste this line and press Enter:",
        "If macOS offers to install the \"command line developer tools\", accept, wait for it to finish, and paste the line again.",
        "The app opens in your browser. From now on it works without the internet and starts when you log in."
      ],
      command: "curl -fsSL " + REPO_RAW + "get.sh | bash"
    }
  };

  function hello() {
    return fetch(LOCAL_APP + "api/hello", { cache: "no-store" }).then(function (r) { return r.json(); });
  }

  // The pop-up behind every Install button: the steps for this system, then a check that it worked.
  function installDialog() {
    var old = document.querySelector("dialog.in");
    if (old) old.remove();
    var dialog = el("dialog", { class: "in", "aria-label": "Install zero2dev" });
    var close = el("button", { type: "button", class: "qz-close", "aria-label": "Close", text: "✕" });
    close.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("close", function () { dialog.remove(); });
    dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });

    var guess = (document.body.dataset.os || "linux");
    var current = INSTALL[guess] ? guess : (guess === "wsl" ? "windows" : "linux");
    var tabs = el("div", { class: "in-tabs", role: "tablist", "aria-label": "Your system" });
    var body = el("div", { class: "in-body" });
    var status = el("p", { class: "in-status", role: "status" });

    function show(name) {
      current = name;
      Array.prototype.forEach.call(tabs.children, function (tab) {
        tab.setAttribute("aria-selected", tab.dataset.os === name ? "true" : "false");
      });
      var info = INSTALL[name];
      body.textContent = "";
      var list = el("ol", { class: "in-steps" });
      info.steps.forEach(function (text, i) {
        var item = el("li", { text: text });
        if (i === 1) {
          var code = el("code", { text: info.command });
          var copy = el("button", { type: "button", class: "st-btn", text: "Copy" });
          copy.addEventListener("click", function () {
            var done = function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy"; }, 1500); };
            if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(info.command).then(done, function () {});
            else {
              var range = document.createRange();
              range.selectNodeContents(code);
              var selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
              try { if (document.execCommand("copy")) done(); } catch (e) { /* select it by hand */ }
            }
          });
          item.appendChild(el("div", { class: "in-command" }, [code, copy]));
        }
        list.appendChild(item);
      });
      body.appendChild(list);
    }

    Object.keys(INSTALL).forEach(function (name) {
      var tab = el("button", { type: "button", class: "in-tab", role: "tab", text: INSTALL[name].label });
      tab.dataset.os = name;
      tab.addEventListener("click", function () { show(name); });
      tabs.appendChild(tab);
    });

    var check = button("I ran it: check", "st-primary", function () {
      status.className = "in-status";
      status.textContent = "Looking for the app on this computer ...";
      hello().then(function (info) {
        try { localStorage.setItem("z2d-app-seen", "1"); } catch (e) { /* ignore */ }
        status.className = "in-status st-ok";
        status.textContent = "Found it. zero2dev is running on this computer. ";
        status.appendChild(el("a", { class: "st-btn st-primary", href: LOCAL_APP, text: "Open my app" }));
        if (!info.paired) status.appendChild(connectButton(info));
        else status.appendChild(button("Use it on this page", "", function () { location.reload(); }));
      }).catch(function () {
        status.className = "in-status st-warn";
        status.textContent = "Not found yet. Finish the steps above, wait until the terminal says it is running, and check again. " +
          "If your browser asks whether this site may reach apps on your device, allow it.";
      });
    });

    dialog.appendChild(close);
    dialog.appendChild(el("div", { class: "in-head" }, [
      el("h2", { text: "Install zero2dev on this computer" }),
      el("p", { text: "One command, about a minute. The app then runs on your own machine: no account, no internet needed, and your code never leaves it." })
    ]));
    dialog.appendChild(tabs);
    dialog.appendChild(body);
    dialog.appendChild(el("div", { class: "in-foot" }, [
      check, status,
      el("p", { class: "st-count", text: "Prefer to do it by hand? git clone https://github.com/bugemarvin/zero2dev.git, then: cd zero2dev && python3 app.py" })
    ]));
    document.body.appendChild(dialog);
    show(current);
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
  }

  // Ask the app, on a page of its own, whether this website may use it.
  function connectButton(info) {
    return button("Use it on this page", "", function () {
      window.open(info.connect + "?origin=" + encodeURIComponent(location.origin), "_blank", "noopener");
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        hello().then(function (now) {
          if (now.paired) { clearInterval(timer); location.reload(); }
        }).catch(function () { /* keep waiting */ });
        if (tries > 90) clearInterval(timer);
      }, 2000);
    });
  }

  // A hosted page with no app yet: explain, and offer the Install button everywhere it is needed.
  function hostedMode(found) {
    document.body.classList.add("z2d-hosted");
    function installButton(label, cls) { return button(label, "st-primary " + (cls || ""), installDialog); }

    document.querySelectorAll(".exercise[data-ex]").forEach(function (box) {
      var note = el("div", { class: "st-static in-note" }, [
        el("p", { text: found
          ? "zero2dev is running on this computer. Open it there to write and run this exercise, or allow this site to use it."
          : "Exercises run on your own computer, with the free zero2dev app. It takes one command to install, and then works offline." })
      ]);
      if (found) {
        note.appendChild(el("a", { class: "st-btn st-primary", href: LOCAL_APP + "lessons/" + (document.body.dataset.lesson || "") + ".html#practice", text: "Open this lesson in my app" }));
        note.appendChild(connectButton(found));
      } else {
        note.appendChild(installButton("Install on this computer"));
      }
      box.appendChild(note);
    });

    var actions = document.querySelector(".hero .actions");
    if (actions && document.getElementById("tracks")) {
      var main = found
        ? el("a", { class: "btn", href: LOCAL_APP, text: "Open my app" })
        : el("button", { type: "button", class: "btn in-main", text: "Install on this computer" });
      if (!found) main.addEventListener("click", installDialog);
      actions.insertBefore(main, actions.firstChild);
      var first = document.getElementById("continue");
      if (first) first.className = "btn-ghost";
      actions.parentNode.appendChild(el("p", { class: "in-pitch", text: found
        ? "The app is installed on this computer. This site is the same guide, online: fine for reading and quizzes."
        : "You can read every lesson and take the quizzes right here. To write and run code, install the app: it runs on your own machine, offline, with the tools you have." }));
    }

    var mount = document.getElementById("setup");
    if (mount) {
      mount.textContent = "";
      mount.appendChild(el("p", { text: found
        ? "Setup looks at the computer the app runs on. Open it in your app:"
        : "Setup looks at your own computer, so it needs the app installed there." }));
      mount.appendChild(found ? el("a", { class: "st-btn st-primary", href: LOCAL_APP + "setup.html", text: "Open Setup in my app" })
        : installButton("Install on this computer"));
    }
  }

  // ---------------------------------------------------------------- start
  function staticMode() {
    document.querySelectorAll(".exercise[data-ex]").forEach(function (box) {
      box.appendChild(el("p", {
        class: "st-static",
        text: "To write and run this exercise here in the browser, start the local app: python3 app.py"
      }));
    });
    var mount = document.getElementById("setup");
    if (mount) {
      mount.textContent = "This page needs the local app. In the zero2dev folder run: python3 app.py";
    }
  }

  function interactive(session) {
    token = session.token;
    document.body.classList.add("z2d-local");
    var studios = [];
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".exercise[data-ex]"));
    if (boxes.length) studios = new Workspace(boxes).studios;
    Array.prototype.forEach.call(document.querySelectorAll("details.install[data-track]"), renderInstallBox);
    if (window.Z2D) window.Z2D.api = api;
    document.dispatchEvent(new CustomEvent("z2d:local"));
    var mount = document.getElementById("setup");
    if (mount) renderSetup(mount);
    api("GET", "state").then(function (state) {
      window.Z2D_PROFILE = state.profile;
      if (state.platform && window.Z2D && window.Z2D.applyOs) window.Z2D.applyOs(state.platform);
      setProgress(state.progress);
    });
    window.addEventListener("focus", function () { studios.forEach(function (s) { s.syncFromDisk(); }); });
  }

  // A page that is not served by the app: is the app on this computer, and may this site use it?
  function startHosted() {
    hosted = true;
    var seen = false;
    try { seen = localStorage.getItem("z2d-app-seen") === "1"; } catch (e) { seen = false; }
    // Reaching into the visitor's computer makes some browsers ask for permission, so it is only
    // tried for someone who has already found the app from this site once.
    if (!seen) { hostedMode(null); return; }
    hello().then(function (info) {
      if (!info.paired) { hostedMode(info); return; }
      apiBase = LOCAL_APP;
      return fetch(LOCAL_APP + "api/session").then(function (r) { return r.json(); }).then(interactive);
    }).catch(function () { hostedMode(null); });
  }

  if (!isWeb) { staticMode(); return; }
  if (!onThisComputer) { startHosted(); return; }
  fetch(root + "api/session").then(function (r) {
    if (!r.ok) throw new Error("not the app");
    return r.json();
  }).then(interactive, startHosted);
})();
