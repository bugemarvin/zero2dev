/* zero2dev game layer: quizzes, experience points, levels, badges, streaks, career paths,
   the guided tour, jokes, and "resume where you left off".
   No dependencies. Works from file:// with the browser's storage; when the local app is
   running, the same data is also kept on disk, so it survives a change of browser. */
(function () {
  "use strict";

  var root = document.body.dataset.root || "";
  var currentId = document.body.dataset.lesson || "";
  var curriculum = window.Z2D_CURRICULUM || { tracks: [], paths: [] };
  var quizzes = window.Z2D_QUIZZES || {};
  var Z = window.Z2D = window.Z2D || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  function storeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function storeSet(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
  function lessonHref(id) { return root + "lessons/" + id + ".html"; }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function dayBefore(text) {
    var p = text.split("-").map(Number);
    var d = new Date(p[0], p[1] - 1, p[2] - 1);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  // Text with `code` in backticks, as safe nodes.
  function rich(text, tag) {
    var node = el(tag || "span", {});
    String(text).split("`").forEach(function (part, i) {
      if (part === "") return;
      node.appendChild(i % 2 ? el("code", { text: part }) : document.createTextNode(part));
    });
    return node;
  }
  function button(label, cls, onClick) {
    var b = el("button", { type: "button", class: "gm-btn " + (cls || ""), text: label });
    b.addEventListener("click", onClick);
    return b;
  }
  function allLessons() {
    var list = [];
    curriculum.tracks.forEach(function (t) { t.lessons.forEach(function (l) { list.push({ lesson: l, track: t }); }); });
    return list;
  }
  function findLesson(id) {
    return allLessons().filter(function (x) { return x.lesson.id === id; })[0] || null;
  }
  function trackById(id) {
    return curriculum.tracks.filter(function (t) { return t.id === id; })[0] || null;
  }

  // ---------------------------------------------------------------- state
  var KEY = "z2d-game";
  var state = { quiz: {}, days: [], badges: {}, last: null, path: null, electives: [], tour: {}, daily: {}, dailyPoints: 0 };

  function merge(into, other) {
    if (!other || typeof other !== "object") return into;
    Object.keys(other.quiz || {}).forEach(function (id) {
      var mine = into.quiz[id], theirs = other.quiz[id];
      if (!mine || (theirs && theirs.best > mine.best)) into.quiz[id] = theirs;
    });
    (other.days || []).forEach(function (day) { if (into.days.indexOf(day) < 0) into.days.push(day); });
    into.days.sort();
    Object.keys(other.badges || {}).forEach(function (id) { if (!into.badges[id]) into.badges[id] = other.badges[id]; });
    Object.keys(other.tour || {}).forEach(function (id) { into.tour[id] = into.tour[id] || other.tour[id]; });
    if (other.last && (!into.last || (other.last.at || 0) > (into.last.at || 0))) into.last = other.last;
    if (!into.path && other.path) { into.path = other.path; into.electives = other.electives || []; }
    if (other.daily && other.daily.date && (!into.daily.date || other.daily.date > into.daily.date)) into.daily = other.daily;
    into.dailyPoints = Math.max(into.dailyPoints || 0, other.dailyPoints || 0);
    return into;
  }
  function load() {
    try { merge(state, JSON.parse(storeGet(KEY) || "{}")); } catch (e) { /* start fresh */ }
  }
  var pushTimer = null;
  function save() {
    storeSet(KEY, JSON.stringify(state));
    if (!Z.api) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { Z.api("POST", "game", { game: state }).catch(function () { /* the app may be stopped */ }); }, 700);
  }
  function markActive() {
    var day = today();
    if (state.days.indexOf(day) < 0) { state.days.push(day); state.days.sort(); }
  }

  // ---------------------------------------------------------------- experience, levels, badges
  var TITLES = ["Curious Newcomer", "Hello Worlder", "Bug Spotter", "Loop Tamer", "Function Smith", "Data Wrangler",
    "Stack Climber", "Recursion Survivor", "Algorithm Apprentice", "Code Crafter", "API Whisperer", "Query Master",
    "Container Captain", "System Builder", "Refactoring Ninja", "Senior Tinkerer", "Architect",
    "Principal Problem Solver", "Code Wizard", "Legend of the Terminal"];
  function threshold(level) { return 50 * level * (level - 1); }      // experience needed to reach a level

  function passedMap() { return (window.Z2D_PROGRESS && window.Z2D_PROGRESS.passed) || {}; }
  function readMap() { try { return JSON.parse(storeGet("z2d-read") || "{}") || {}; } catch (e) { return {}; } }

  function trackProgress(track) {
    var passed = passedMap(), total = 0, done = 0;
    track.lessons.forEach(function (l) {
      l.exercises.forEach(function (e) { total++; if (passed[e.id]) done++; });
    });
    return { total: total, done: done, percent: total ? Math.round(100 * done / total) : 0 };
  }

  function stats() {
    var passed = passedMap(), read = readMap();
    var exercises = 0, tracksTouched = 0, tracksDone = 0, readCount = 0;
    curriculum.tracks.forEach(function (track) {
      var p = trackProgress(track);
      exercises += p.done;
      if (p.done > 0) tracksTouched++;
      if (p.total > 0 && p.done === p.total) tracksDone++;
      track.lessons.forEach(function (l) { if (read[l.id]) readCount++; });
    });
    var quizPoints = 0, quizzesDone = 0, perfect = 0;
    Object.keys(state.quiz).forEach(function (id) {
      var q = state.quiz[id];
      quizPoints += q.best;
      quizzesDone++;
      if (q.best === q.total) perfect++;
    });
    var xp = exercises * 50 + quizPoints * 10 + readCount * 5 + (state.dailyPoints || 0) * 5;
    var level = 1;
    while (level < TITLES.length && xp >= threshold(level + 1)) level++;
    var streak = 0, day = today();
    if (state.days.indexOf(day) < 0) day = dayBefore(day);       // a streak survives until the end of the next day
    while (state.days.indexOf(day) >= 0) { streak++; day = dayBefore(day); }
    void passed;
    return {
      exercises: exercises, quizPoints: quizPoints, quizzesDone: quizzesDone, perfect: perfect, read: readCount,
      tracksTouched: tracksTouched, tracksDone: tracksDone, xp: xp, level: level, title: TITLES[level - 1],
      floor: threshold(level), next: level < TITLES.length ? threshold(level + 1) : null, streak: streak
    };
  }

  var BADGES = [
    { id: "first", icon: "🌱", name: "First steps", how: "Pass your first exercise", test: function (s) { return s.exercises >= 1; } },
    { id: "quiz", icon: "🎯", name: "Quiz whiz", how: "Get every question of a quiz right", test: function (s) { return s.perfect >= 1; } },
    { id: "ten", icon: "🔟", name: "Ten down", how: "Pass 10 exercises", test: function (s) { return s.exercises >= 10; } },
    { id: "fifty", icon: "🏅", name: "Half a hundred", how: "Pass 50 exercises", test: function (s) { return s.exercises >= 50; } },
    { id: "hundred", icon: "🏆", name: "Centurion", how: "Pass 100 exercises", test: function (s) { return s.exercises >= 100; } },
    { id: "polyglot", icon: "🗺️", name: "Polyglot", how: "Pass exercises in 3 different tracks", test: function (s) { return s.tracksTouched >= 3; } },
    { id: "track", icon: "🎓", name: "Track master", how: "Pass every exercise of one track", test: function (s) { return s.tracksDone >= 1; } },
    { id: "streak3", icon: "🔥", name: "On a roll", how: "Learn 3 days in a row", test: function (s) { return s.streak >= 3; } },
    { id: "streak7", icon: "⚡", name: "Unstoppable", how: "Learn 7 days in a row", test: function (s) { return s.streak >= 7; } },
    { id: "quizzes", icon: "🧠", name: "Sharp mind", how: "Finish 25 quizzes", test: function (s) { return s.quizzesDone >= 25; } },
    { id: "reader", icon: "📚", name: "Bookworm", how: "Read 10 lessons", test: function (s) { return s.read >= 10; } },
    { id: "path", icon: "🧭", name: "Navigator", how: "Choose a career path", test: function () { return !!state.path; } }
  ];

  var JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "There are 10 kinds of people: those who understand binary, and those who do not.",
    "A SQL query walks into a bar, goes up to two tables and asks: \"May I join you?\"",
    "How many programmers does it take to change a light bulb? None. That is a hardware problem.",
    "\"Buy a loaf of bread. If they have eggs, buy a dozen.\" The programmer came home with twelve loaves.",
    "Why did the developer go broke? They used up all their cache.",
    "Debugging: being the detective in a crime story where you are also the culprit.",
    "\"It works on my machine.\" \"Then we will ship your machine.\" And that is how Docker was born.",
    "There are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors.",
    "Why was the JavaScript developer sad? They did not Node how to Express themselves.",
    "To understand recursion, you must first understand recursion.",
    "The best thing about a Boolean: even if you are wrong, you are only off by a bit.",
    "A programmer's favourite place to meet friends: the Foo Bar.",
    "An optimist says the glass is half full. A pessimist says it is half empty. A programmer says it is twice as large as it needs to be.",
    "Commit messages at 2 a.m.: \"fix\". \"fix again\". \"really fix\". \"please work\".",
    "I would tell you a UDP joke, but you might not get it.",
    "Why do programmers mix up Halloween and Christmas? Because Oct 31 equals Dec 25.",
    "99 little bugs in the code, 99 little bugs. Take one down, patch it around: 127 little bugs in the code.",
    "Programming is 10% writing code and 90% working out why it does not do what you wrote.",
    "The code you wrote six months ago was written by a stranger who did not like you.",
    "A user interface is like a joke: if you have to explain it, it is not that good.",
    "!false. It is funny because it is true.",
    "What do you call eight hobbits? A hobbyte.",
    "Explain your code to a rubber duck. The duck never judges. The duck has seen worse.",
    "\"It is not a bug. It is an undocumented feature.\"",
    "Weeks of coding can save you hours of planning.",
    "How do you comfort a JavaScript bug? You console it.",
    "Two bytes meet. The first asks: \"Are you ill?\" The second replies: \"No, just feeling a bit off.\"",
    "Software and cathedrals are much the same: first we build them, then we pray.",
    "Real programmers count from 0.",
    "A good programmer looks both ways before crossing a one-way street.",
    "Why did the function stop calling? It had too many arguments.",
    "The Rust compiler is a strict librarian: it will not lend the same book to two writers.",
    "Why did the developer leave the restaurant? The table had no primary key.",
    "My code never has bugs. It just develops random features.",
    "The first 90% of the code takes 90% of the time. The remaining 10% takes the other 90%.",
    "A QA engineer walks into a bar. Orders 1 drink. Orders 0 drinks. Orders 99999 drinks. Orders -1 drinks. Orders a lizard.",
    "Why do Go developers stay calm? They always defer their problems.",
    "What is the object-oriented way to become wealthy? Inheritance.",
    "I changed my password to \"incorrect\". Now when I forget it, the computer tells me: your password is incorrect."
  ];
  function joke(index) {
    return JOKES[((index % JOKES.length) + JOKES.length) % JOKES.length];
  }
  function randomJoke() { return joke(Math.floor(Math.random() * JOKES.length)); }

  // ---------------------------------------------------------------- toasts and confetti
  var toastBox = null;
  function toast(title, text, kind) {
    if (!toastBox) {
      toastBox = el("div", { class: "gm-toasts", "aria-live": "polite" });
      document.body.appendChild(toastBox);
    }
    var node = el("div", { class: "gm-toast " + (kind || "") }, [
      el("strong", { text: title }), text ? el("span", { text: text }) : null
    ]);
    toastBox.appendChild(node);
    setTimeout(function () { node.classList.add("gm-out"); }, 5200);
    setTimeout(function () { node.remove(); }, 5800);
  }

  function confetti() {
    if (reduceMotion) return;
    var canvas = el("canvas", { class: "gm-confetti", "aria-hidden": "true" });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var colours = ["#4fd1c5", "#f6ad55", "#f38ba8", "#8ab4f8", "#a6da95", "#c4a7f5"];
    var bits = [];
    for (var i = 0; i < 90; i++) {
      bits.push({
        x: canvas.width / 2, y: canvas.height / 3, vx: (Math.random() - 0.5) * 900, vy: -Math.random() * 700 - 100,
        size: 5 + Math.random() * 6, colour: colours[i % colours.length], spin: Math.random() * 6
      });
    }
    var start = performance.now(), last = start;
    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bits.forEach(function (b) {
        b.vy += 1500 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.spin += 8 * dt;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.spin);
        ctx.fillStyle = b.colour;
        ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size * 0.6);
        ctx.restore();
      });
      if (now - start < 1800) requestAnimationFrame(frame); else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- the bar at the top
  function renderHud(s) {
    var hud = document.getElementById("hud");
    if (!hud) return;
    hud.textContent = "";
    var span = s.next ? s.next - s.floor : 1;
    var fill = el("i", {});
    fill.style.width = (s.next ? Math.max(4, Math.round(100 * (s.xp - s.floor) / span)) : 100) + "%";
    var link = el("a", {
      class: "hud-chip", href: root + "index.html#achievements",
      title: s.title + ": " + s.xp + " XP" + (s.next ? ", " + (s.next - s.xp) + " to the next level" : "")
    }, [
      el("span", { class: "hud-level", text: "Lv " + s.level }),
      el("span", { class: "hud-bar", "aria-hidden": "true" }, [fill]),
      el("span", { class: "hud-xp", text: s.xp + " XP" })
    ]);
    link.setAttribute("aria-label", "Level " + s.level + ", " + s.title + ", " + s.xp + " experience points");
    hud.appendChild(link);
    if (s.streak > 0) {
      hud.appendChild(el("span", { class: "hud-streak", title: s.streak + " day" + (s.streak === 1 ? "" : "s") + " in a row", text: "🔥 " + s.streak }));
    }
  }

  // What the learner has already been congratulated for, so a reload does not repeat it.
  var SEEN = "z2d-game-seen";
  var firstRefresh = true;
  function refresh() {
    var s = stats();
    renderHud(s);
    var seen = null;
    try { seen = JSON.parse(storeGet(SEEN) || "null"); } catch (e) { seen = null; }
    var earned = [];
    BADGES.forEach(function (badge) {
      if (!state.badges[badge.id] && badge.test(s)) { state.badges[badge.id] = today(); earned.push(badge); }
    });
    if (seen) {
      var gained = s.xp - seen.xp;
      if (gained > 0) toast("+" + gained + " XP", s.next ? (s.next - s.xp) + " XP to level " + (s.level + 1) : "You reached the top level");
      if (s.level > seen.level) {
        toast("Level " + s.level + ": " + s.title, "You levelled up. " + randomJoke(), "gm-level");
        confetti();
      }
      earned.forEach(function (badge) { toast(badge.icon + " Badge: " + badge.name, badge.how, "gm-badge"); });
      if (gained >= 50 && s.level === seen.level && !firstRefresh) confetti();
    }
    if (earned.length) save();
    storeSet(SEEN, JSON.stringify({ xp: s.xp, level: s.level }));
    firstRefresh = false;
    renderHome(s);
    renderPathsPage();
    renderQuizCard();
  }

  // ---------------------------------------------------------------- quiz
  var CODE_LANG = { python: "python", llm: "python", js: "javascript", node: "javascript", react: "javascript", next: "javascript",
    gamedev: "javascript", mongodb: "javascript", c: "c", go: "go", rust: "rust", java: "java", php: "php",
    elixir: "elixir", sql: "sql", bash: "bash", start: "bash", git: "bash", docker: "bash", devops: "bash",
    css: "css", html: "html", dsa: "python", redis: "text", microservices: "javascript" };

  function shuffled(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
  }
  function plain(text) {
    return String(text).trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!]$/, "");
  }

  // Run a quiz in a pop-up. `done(correct, total)` is called when the last question is answered.
  function openQuiz(title, questions, lang, done) {
    var dialog = el("dialog", { class: "qz", "aria-label": title });
    var index = 0, correct = 0, answered = false;
    var head = el("div", { class: "qz-head" });
    var body = el("div", { class: "qz-body" });
    var foot = el("div", { class: "qz-foot" });
    var close = el("button", { type: "button", class: "qz-close", "aria-label": "Close the quiz", text: "✕" });
    close.addEventListener("click", function () { dialog.close(); });
    dialog.appendChild(close);
    dialog.appendChild(head);
    dialog.appendChild(body);
    dialog.appendChild(foot);
    dialog.addEventListener("close", function () { dialog.remove(); });
    dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
    document.body.appendChild(dialog);

    function header() {
      head.textContent = "";
      head.appendChild(el("p", { class: "qz-title", text: title }));
      var dots = el("div", { class: "qz-dots", "aria-hidden": "true" });
      questions.forEach(function (q, i) {
        dots.appendChild(el("i", { class: q._ok !== undefined ? (q._ok ? "ok" : "bad") : (i === index ? "now" : "") }));
      });
      head.appendChild(dots);
    }

    function feedback(ok, question, rightText) {
      answered = true;
      question._ok = ok;
      if (ok) correct++;
      header();
      var box = el("div", { class: "qz-feedback " + (ok ? "ok" : "bad"), role: "status" }, [
        el("strong", { text: ok ? "Correct." : "Not quite." })
      ]);
      if (!ok && rightText) box.appendChild(rich(" The answer: " + rightText));
      if (question.why) box.appendChild(rich(" " + question.why, "p"));
      body.appendChild(box);
      foot.textContent = "";
      var last = index === questions.length - 1;
      var next = button(last ? "See the result" : "Next question", "gm-primary", function () {
        index++;
        if (last) finish(); else show();
      });
      foot.appendChild(next);
      next.focus();
    }

    function show() {
      var question = questions[index];
      answered = false;
      header();
      body.textContent = "";
      foot.textContent = "";
      body.appendChild(el("p", { class: "qz-count", text: "Question " + (index + 1) + " of " + questions.length }));
      body.appendChild(rich(question.q, "h2"));
      if (question.code) {
        var code = el("code", { text: question.code });
        if (Z.colour) Z.colour(code, question.lang || lang || "text");
        body.appendChild(el("pre", { class: "qz-code" }, [code]));
      }
      if (question.options) {
        var answers = Array.isArray(question.answer) ? question.answer : [question.answer];
        var order = shuffled(question.options.map(function (text, i) { return { text: text, right: answers.indexOf(i) >= 0 }; }));
        var list = el("div", { class: "qz-options", role: "group", "aria-label": "Answers" });
        order.forEach(function (option, i) {
          var b = el("button", { type: "button", class: "qz-option" }, [
            el("span", { class: "qz-key", text: String(i + 1) }), rich(option.text)
          ]);
          b.addEventListener("click", function () {
            if (answered) return;
            Array.prototype.forEach.call(list.children, function (other, j) {
              other.disabled = true;
              if (order[j].right) other.classList.add("right");
            });
            if (!option.right) b.classList.add("wrong");
            feedback(option.right, question, order.filter(function (o) { return o.right; })[0].text);
          });
          list.appendChild(b);
        });
        body.appendChild(list);
        list.firstChild.focus();
      } else {
        var input = el("input", { class: "qz-input", type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Your answer" });
        var check = button("Check", "gm-primary", function () {
          if (answered || input.value.trim() === "") return;
          input.disabled = true;
          check.remove();
          var ok = question.accept.some(function (a) { return plain(a) === plain(input.value); });
          input.classList.add(ok ? "right" : "wrong");
          feedback(ok, question, question.accept[0]);
        });
        input.addEventListener("keydown", function (event) { if (event.key === "Enter") check.click(); });
        body.appendChild(el("div", { class: "qz-answer" }, [input, check]));
        input.focus();
      }
    }

    function finish() {
      header();
      body.textContent = "";
      foot.textContent = "";
      var total = questions.length;
      var words = correct === total ? "Perfect!" : correct >= total * 0.7 ? "Well done." : correct >= total / 2 ? "Getting there." : "Worth another look at the lesson.";
      body.appendChild(el("p", { class: "qz-score", text: correct + " / " + total }));
      body.appendChild(el("h2", { text: words }));
      var note = el("p", { class: "qz-note" });
      body.appendChild(note);
      body.appendChild(el("p", { class: "qz-joke", text: randomJoke() }));
      foot.appendChild(button("Try again", "", function () {
        questions.forEach(function (q) { delete q._ok; });
        index = 0; correct = 0;
        show();
      }));
      foot.appendChild(button("Close", "gm-primary", function () { dialog.close(); }));
      note.textContent = done(correct, total) || "";
      if (correct === total) confetti();
    }

    dialog.addEventListener("keydown", function (event) {
      if (answered || !/^[1-9]$/.test(event.key) || event.target.tagName === "INPUT") return;
      var options = body.querySelectorAll(".qz-option");
      if (options[Number(event.key) - 1]) options[Number(event.key) - 1].click();
    });
    show();
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
  }

  function startLessonQuiz(lessonId) {
    var found = findLesson(lessonId);
    var questions = (quizzes[lessonId] || []).map(function (q) { return Object.assign({}, q); });
    if (!found || !questions.length) return;
    openQuiz("Quiz: " + found.lesson.title, questions, CODE_LANG[found.track.id], function (correct, total) {
      var before = state.quiz[lessonId] ? state.quiz[lessonId].best : 0;
      if (!state.quiz[lessonId] || correct > before) state.quiz[lessonId] = { best: correct, total: total, at: today() };
      state.quiz[lessonId].total = total;
      markActive();
      save();
      refresh();
      var gained = Math.max(correct - before, 0) * 10;
      return gained ? "+" + gained + " XP" : (before >= correct ? "Your best stays at " + before + " of " + total + "." : "");
    });
  }

  function renderQuizCard() {
    var box = document.getElementById("quiz");
    var questions = quizzes[currentId];
    if (!box || !questions || !questions.length) return;
    box.hidden = false;
    box.textContent = "";
    var result = state.quiz[currentId];
    box.appendChild(el("h2", { id: "quick-quiz", text: "Quick quiz" }));
    box.appendChild(el("p", {
      text: result
        ? "Your best: " + result.best + " of " + questions.length + ". " + (result.best === questions.length ? "A perfect score." : "Try again to beat it.")
        : questions.length + " questions on this lesson. Each right answer is worth 10 XP. It opens in a pop-up, and you see the explanation after each answer."
    }));
    box.appendChild(button(result ? "Take the quiz again" : "Start the quiz", "gm-primary", function () { startLessonQuiz(currentId); }));
  }

  function dailyChallenge() {
    var chosen = (window.Z2D_PROFILE && window.Z2D_PROFILE.tracks) || [];
    var passed = passedMap();
    var pool = [];
    allLessons().forEach(function (x) {
      var known = state.quiz[x.lesson.id] || x.lesson.exercises.some(function (e) { return passed[e.id]; });
      var wanted = chosen.length ? chosen.indexOf(x.track.id) >= 0 : true;
      (quizzes[x.lesson.id] || []).forEach(function (q) {
        pool.push({ q: Object.assign({ lang: CODE_LANG[x.track.id] }, q), weight: (known ? 3 : 0) + (wanted ? 1 : 0) });
      });
    });
    if (!pool.length) return;
    var best = pool.filter(function (p) { return p.weight >= 3; });
    if (best.length < 5) best = pool.filter(function (p) { return p.weight >= 1; });
    if (best.length < 5) best = pool;
    var questions = shuffled(best).slice(0, 5).map(function (p) { return p.q; });
    openQuiz("Daily challenge", questions, null, function (correct) {
      var day = today();
      var before = state.daily.date === day ? state.daily.score : 0;
      var gained = Math.max(correct - before, 0);
      state.daily = { date: day, score: Math.max(correct, before) };
      state.dailyPoints = (state.dailyPoints || 0) + gained;
      markActive();
      save();
      refresh();
      return gained ? "+" + (gained * 5) + " XP. Come back tomorrow for five new questions." : "Today's best stays at " + before + " of 5.";
    });
  }

  // ---------------------------------------------------------------- paths
  function pathById(id) {
    return (curriculum.paths || []).filter(function (p) { return p.id === id; })[0] || null;
  }
  function pathTracks(path) {
    var ids = [];
    path.stages.forEach(function (stage) { stage.tracks.forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); }); });
    (state.electives || []).forEach(function (id) { if (ids.indexOf(id) < 0 && (path.electives || []).indexOf(id) >= 0) ids.push(id); });
    return ids;
  }
  function applyPath() {
    var path = pathById(state.path);
    var tracks = path ? pathTracks(path) : [];
    window.Z2D_PROFILE = Object.assign({}, window.Z2D_PROFILE || {}, { tracks: tracks });
    if (Z.api) Z.api("POST", "profile", { tracks: tracks }).catch(function () { /* ignore */ });
    save();
    if (Z.render) Z.render(); else refresh();
  }
  function nextLessonOf(track) {
    var passed = passedMap(), read = readMap();
    return track.lessons.filter(function (l) {
      return l.exercises.length ? !l.exercises.every(function (e) { return passed[e.id]; }) : !read[l.id];
    })[0] || null;
  }
  function trackRow(id) {
    var track = trackById(id);
    if (!track) return null;
    var p = trackProgress(track);
    var next = nextLessonOf(track);
    var fill = el("i", {});
    fill.style.width = p.percent + "%";
    return el("a", { class: "pt-track" + (p.total && p.done === p.total ? " done" : ""), href: lessonHref((next || track.lessons[0]).id) }, [
      el("strong", { text: track.title }),
      el("span", { class: "pt-count", text: p.done + "/" + p.total }),
      el("span", { class: "bar", "aria-hidden": "true" }, [fill])
    ]);
  }
  function roadmap(path, compact) {
    var list = el("ol", { class: "pt-stages" + (compact ? " compact" : "") });
    path.stages.forEach(function (stage, i) {
      var item = el("li", { class: "pt-stage" }, [
        el("h4", {}, [el("span", { class: "pt-step", text: String(i + 1) }), document.createTextNode(stage.title)])
      ]);
      if (!compact) item.appendChild(el("p", { class: "pt-why", text: stage.why }));
      item.appendChild(el("div", { class: "pt-tracks" }, stage.tracks.map(trackRow)));
      list.appendChild(item);
    });
    return list;
  }

  function renderPathsPage() {
    var mount = document.getElementById("paths-page");
    if (!mount) return;
    mount.textContent = "";
    var chosen = pathById(state.path);
    if (chosen) {
      var section = el("section", { class: "pt-mine" }, [
        el("h2", { text: "Your path: " + chosen.title }),
        el("p", { text: chosen.outcome }),
        roadmap(chosen, false)
      ]);
      if ((chosen.electives || []).length) {
        section.appendChild(el("h3", { text: "Go further: pick what interests you" }));
        section.appendChild(el("p", { class: "pt-why", text: "Optional tracks that fit this path. Ticked ones join your plan and move to the top of the home page." }));
        var electives = el("div", { class: "pt-electives" });
        chosen.electives.forEach(function (id) {
          var track = trackById(id);
          if (!track) return;
          var box = el("input", { type: "checkbox" });
          box.checked = (state.electives || []).indexOf(id) >= 0;
          box.addEventListener("change", function () {
            state.electives = (state.electives || []).filter(function (x) { return x !== id; });
            if (box.checked) state.electives.push(id);
            applyPath();
          });
          electives.appendChild(el("label", { class: "pt-elective" }, [box, el("strong", { text: " " + track.title }), el("span", { text: " " + track.blurb })]));
        });
        section.appendChild(electives);
      }
      section.appendChild(button("Choose a different path", "", function () {
        state.path = null;
        state.electives = [];
        applyPath();
      }));
      mount.appendChild(section);
      mount.appendChild(el("h2", { text: "All paths" }));
    }
    var grid = el("div", { class: "pt-grid" });
    (curriculum.paths || []).forEach(function (path) {
      var card = el("article", { class: "pt-card" + (state.path === path.id ? " chosen" : "") }, [
        el("h3", { text: path.title }),
        el("p", { text: path.blurb }),
        el("ol", { class: "pt-mini" }, path.stages.map(function (stage) {
          var names = stage.tracks.map(function (id) { var t = trackById(id); return t ? t.title : id; }).join(", ");
          return el("li", {}, [el("strong", { text: stage.title + ": " }), document.createTextNode(names)]);
        })),
        el("p", { class: "pt-outcome", text: "At the end: " + path.outcome })
      ]);
      card.appendChild(button(state.path === path.id ? "This is your path" : "Choose this path", "gm-primary", function () {
        state.path = path.id;
        state.electives = [];
        applyPath();
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }));
      grid.appendChild(card);
    });
    mount.appendChild(grid);
  }

  // ---------------------------------------------------------------- home page
  function renderHome(s) {
    var pathBox = document.getElementById("path-home");
    if (pathBox) {
      pathBox.textContent = "";
      var path = pathById(state.path);
      if (path) {
        pathBox.appendChild(el("h2", { text: "Your path: " + path.title }));
        pathBox.appendChild(roadmap(path, true));
        pathBox.appendChild(el("p", {}, [el("a", { href: root + "paths.html", text: "See the whole path, add optional tracks, or change it" })]));
      } else {
        pathBox.appendChild(el("h2", { text: "Where do you want to go?" }));
        pathBox.appendChild(el("p", { text: "Pick a path and the guide lays out the tracks in order: from the first terminal command to the job you are aiming for. You can change it at any time." }));
        var row = el("div", { class: "pt-quick" });
        (curriculum.paths || []).forEach(function (p) {
          row.appendChild(button(p.title, p.id === "zero" ? "gm-primary" : "", function () {
            state.path = p.id;
            state.electives = [];
            applyPath();
          }));
        });
        pathBox.appendChild(row);
        pathBox.appendChild(el("p", {}, [el("a", { href: root + "paths.html", text: "Compare the paths" })]));
      }
    }

    var resume = document.getElementById("resume");
    if (resume) {
      var last = state.last && findLesson(state.last.id);
      resume.hidden = !last;
      if (last) {
        resume.href = lessonHref(state.last.id) + "#resume";
        resume.textContent = "Resume where you left off: " + last.lesson.title;
      }
    }

    var play = document.getElementById("play");
    if (play) {
      play.textContent = "";
      var done = state.daily.date === today();
      var challenge = el("article", { class: "gm-card" }, [
        el("h3", { text: "Daily challenge" }),
        el("p", { text: done ? "Done for today: " + state.daily.score + " of 5. You can still play again for practice." : "Five quick questions, mostly from lessons you have done. Worth up to 25 XP, once a day." })
      ]);
      challenge.appendChild(button(done ? "Play again" : "Start the challenge", "gm-primary", dailyChallenge));
      var index = Math.floor(Date.now() / 86400000);
      var text = el("p", { class: "gm-joke", text: joke(index) });
      var laugh = el("article", { class: "gm-card" }, [el("h3", { text: "Joke of the day" }), text]);
      laugh.appendChild(button("Another one", "", function () { index++; text.textContent = joke(index); }));
      play.appendChild(challenge);
      play.appendChild(laugh);
    }

    var board = document.getElementById("achievements-body");
    if (board) {
      board.textContent = "";
      var span = s.next ? s.next - s.floor : 1;
      var fill = el("i", {});
      fill.style.width = (s.next ? Math.round(100 * (s.xp - s.floor) / span) : 100) + "%";
      board.appendChild(el("div", { class: "gm-level" }, [
        el("p", { class: "gm-level-name" }, [el("strong", { text: "Level " + s.level }), document.createTextNode(" · " + s.title)]),
        el("div", { class: "bar gm-xpbar", "aria-hidden": "true" }, [fill]),
        el("p", { class: "gm-level-note", text: s.xp + " XP" + (s.next ? " · " + (s.next - s.xp) + " XP to level " + (s.level + 1) + " (" + TITLES[s.level] + ")" : " · the top level") })
      ]));
      board.appendChild(el("ul", { class: "gm-numbers" }, [
        ["Exercises passed", s.exercises], ["Quiz answers right", s.quizPoints], ["Lessons read", s.read],
        ["Day streak", s.streak], ["Tracks finished", s.tracksDone]
      ].map(function (pair) {
        return el("li", {}, [el("strong", { text: String(pair[1]) }), el("span", { text: pair[0] })]);
      })));
      board.appendChild(el("ul", { class: "gm-badges" }, BADGES.map(function (badge) {
        var have = !!state.badges[badge.id];
        return el("li", { class: have ? "have" : "", title: badge.how }, [
          el("span", { class: "gm-badge-icon", "aria-hidden": "true", text: badge.icon }),
          el("strong", { text: badge.name }),
          el("span", { text: have ? "Earned" : badge.how })
        ]);
      })));
      board.appendChild(el("p", { class: "gm-how", text: "An exercise is worth 50 XP, a right quiz answer 10, a lesson marked as read 5." }));
    }
  }

  // ---------------------------------------------------------------- resume where you left off
  function trackPosition() {
    var found = findLesson(currentId);
    if (!found) return;
    var timer = null;
    function remember() {
      state.last = { id: currentId, y: Math.round(window.scrollY), at: Date.now() };
      save();
    }
    if (location.hash === "#resume" && state.last && state.last.id === currentId) {
      var y = state.last.y;
      setTimeout(function () { window.scrollTo(0, y); }, 60);
      history.replaceState(null, "", location.pathname + location.search);
    }
    remember();
    window.addEventListener("scroll", function () {
      clearTimeout(timer);
      timer = setTimeout(remember, 600);
    }, { passive: true });
    window.addEventListener("pagehide", function () { storeSet(KEY, JSON.stringify(Object.assign(state, { last: { id: currentId, y: Math.round(window.scrollY), at: Date.now() } }))); });
  }

  // ---------------------------------------------------------------- the guided tour
  var TOURS = {
    home: [
      { at: ".hero", title: "Welcome to zero2dev", text: "You learn by doing: read a short lesson, write code, and tests tell you at once whether it works. This tour takes one minute." },
      { at: "#path-home", title: "Pick a path", text: "New to all of this? Choose \"Start from zero\". Know where you are heading? Pick frontend, backend, DevOps, games, and so on. The path puts the tracks in order for you." },
      { at: "#continue", title: "One button to carry on", text: "This always opens the next thing to do. You never have to remember where you were." },
      { at: "#play", title: "A little fun every day", text: "Five quick questions a day keep what you learned fresh. And yes, there are jokes." },
      { at: "#hud", title: "Experience and levels", text: "Exercises, quizzes and reading earn XP. Learn on several days in a row and a streak starts counting." },
      { at: "#tracks", title: "Every track", text: "All tracks are open from the start. Nothing is locked: follow your path, or wander." },
      { at: "a[href$='setup.html']", title: "Setup", text: "Shows what your computer already has and installs or downloads what is missing. Tools you do not have can run in Docker." }
    ],
    lesson: [
      { at: "main.lesson h1", title: "A lesson", text: "Read it top to bottom. Code examples have a Copy button. Type them out anyway: it is how the patterns stick." },
      { at: "#sidebar", title: "The other lessons", text: "A tick appears when a lesson is done. Tracks open and close." },
      { at: "details.install", title: "Tools for this track", text: "The first lesson of each track shows how to install what it needs, for your system, with the quick way first." },
      { at: "#quiz", title: "Quick quiz", text: "A few questions in a pop-up, with an explanation after each answer. Good for checking that the lesson landed." },
      { at: "#practice", title: "Test yourself", text: "The real practice. With the app running you write the code right here and press Run tests." },
      { at: "#workspace", title: "The workspace", text: "Editor, command line, Run tests and the results. Drag its left edge to resize, or make it full width." },
      { at: "#tour-btn", title: "That is all", text: "Press ? at any time to see this again. Now go and break something. That is how you learn." }
    ]
  };

  function runTour(name, force) {
    var steps = (TOURS[name] || []).filter(function (step) {
      var node = document.querySelector(step.at);
      return node && node.getClientRects().length > 0;
    });
    if (!steps.length || (!force && state.tour[name])) return;
    if (document.querySelector(".tour-card")) return;         // a tour is already showing
    var index = 0;
    var shade = el("div", { class: "tour-shade" });
    var spot = el("div", { class: "tour-spot" });
    var card = el("div", { class: "tour-card", role: "dialog", "aria-modal": "true", "aria-label": "Guided tour" });
    document.body.appendChild(shade);
    document.body.appendChild(spot);
    document.body.appendChild(card);

    function end() {
      shade.remove(); spot.remove(); card.remove();
      window.removeEventListener("resize", place);
      document.removeEventListener("keydown", keys);
      state.tour[name] = true;
      save();
    }
    function place() {
      var target = document.querySelector(steps[index].at);
      if (!target) return;
      target.scrollIntoView({ block: "center", behavior: "auto" });
      var r = target.getBoundingClientRect();
      var pad = 6;
      spot.style.top = Math.max(r.top - pad, 4) + "px";
      spot.style.left = Math.max(r.left - pad, 4) + "px";
      spot.style.width = Math.min(r.width + pad * 2, window.innerWidth - 8) + "px";
      spot.style.height = Math.min(r.height + pad * 2, window.innerHeight - 8) + "px";
      var below = r.bottom + 14 + card.offsetHeight < window.innerHeight;
      var top = below ? r.bottom + 14 : Math.max(r.top - card.offsetHeight - 14, 10);
      if (r.height > window.innerHeight * 0.6) top = window.innerHeight - card.offsetHeight - 16;
      card.style.top = Math.max(top, 10) + "px";
      card.style.left = Math.min(Math.max(r.left, 10), window.innerWidth - card.offsetWidth - 10) + "px";
    }
    function show() {
      var step = steps[index];
      card.textContent = "";
      card.appendChild(el("p", { class: "tour-count", text: (index + 1) + " of " + steps.length }));
      card.appendChild(el("h3", { text: step.title }));
      card.appendChild(el("p", { text: step.text }));
      var bar = el("div", { class: "tour-bar" });
      bar.appendChild(button("Skip", "", end));
      if (index > 0) bar.appendChild(button("Back", "", function () { index--; show(); }));
      var next = button(index === steps.length - 1 ? "Start learning" : "Next", "gm-primary", function () {
        if (index === steps.length - 1) end(); else { index++; show(); }
      });
      bar.appendChild(next);
      card.appendChild(bar);
      place();
      next.focus();
    }
    function keys(event) {
      if (event.key === "Escape") end();
      if (event.key === "ArrowRight" && index < steps.length - 1) { index++; show(); }
      if (event.key === "ArrowLeft" && index > 0) { index--; show(); }
    }
    window.addEventListener("resize", place);
    document.addEventListener("keydown", keys);
    shade.addEventListener("click", end);
    show();
  }

  function initTour() {
    var name = currentId ? "lesson" : (document.getElementById("tracks") ? "home" : null);
    var btn = document.getElementById("tour-btn");
    if (btn) {
      btn.hidden = !name;
      btn.addEventListener("click", function () { if (name) runTour(name, true); });
    }
    if (name) setTimeout(function () { runTour(name, false); }, 700);
  }

  // ---------------------------------------------------------------- start
  load();
  if (state.path && !(window.Z2D_PROFILE && window.Z2D_PROFILE.tracks && window.Z2D_PROFILE.tracks.length)) {
    var mine = pathById(state.path);
    if (mine) window.Z2D_PROFILE = { tracks: pathTracks(mine) };
  }
  Z.onProgress = refresh;
  Z.quiz = startLessonQuiz;
  Z.pathTracks = function () {
    var path = pathById(state.path);
    return path ? pathTracks(path) : [];
  };
  refresh();
  if (Z.render && state.path) Z.render();
  trackPosition();
  initTour();

  // The local app is running: merge what it has on disk, and keep it up to date from now on.
  document.addEventListener("z2d:local", function () {
    Z.api("GET", "game").then(function (reply) {
      merge(state, reply.game);
      save();
      if (state.path) {
        var path = pathById(state.path);
        if (path) window.Z2D_PROFILE = Object.assign({}, window.Z2D_PROFILE || {}, { tracks: pathTracks(path) });
      }
      if (Z.render) Z.render(); else refresh();
    }).catch(function () { /* the app may be stopped */ });
  });
})();
