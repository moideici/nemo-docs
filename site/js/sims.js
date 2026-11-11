/* Simulateurs et composants interactifs : hero, planning, formats, Leitner, jeu, outils MCP, installation. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/\s+/g, " ").trim(); }
  function log(box, html, cls) { var d = h("div", cls, html); box.appendChild(d); box.scrollTop = box.scrollHeight; }

  /* ---------- briques ---------- */
  function bricks() {
    var root = $("bricks"); if (!root) return;
    NEMO.bricks.forEach(function (b) {
      var c = h("div", "card brick reveal");
      c.innerHTML = '<div class="bar" style="background:' + b.color + '"></div><h3>' + b.name + '</h3><div class="cap">' + b.role + '</div>' +
        '<p class="mono" style="margin:0;font-size:12px;color:var(--mute)">' + b.where + '</p><ul>' + b.pts.map(function (p) { return "<li>" + p + "</li>"; }).join("") + '</ul>' +
        '<div class="foot">' + b.tags.map(function (t) { return '<span class="pill">' + t + "</span>"; }).join("") + '</div>' +
        '<a href="https://github.com/' + b.repo + '">github.com/' + b.repo + '</a>';
      root.appendChild(c);
    });
  }

  /* ---------- hero ---------- */
  function hero() {
    var words = ["les maths", "la SVT", "l'histoire", "l'anglais", "la physique", "le français"], i = 0, sw = $("swap");
    if (sw && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(function () {
        sw.style.transition = "opacity .25s, transform .25s"; sw.style.opacity = 0; sw.style.transform = "translateY(10px)";
        setTimeout(function () { i = (i + 1) % words.length; sw.textContent = words[i]; sw.style.opacity = 1; sw.style.transform = "none"; }, 260);
      }, 2400);
    }
    var card = $("heroCard"), ansBox = $("heroAns"), exp = $("heroExp"), streak = $("heroStreak"), days = 0, answered = false;
    var opts = [["Le noyau", false], ["La mitochondrie", true], ["Le ribosome", false]];
    var btns = [];
    opts.forEach(function (o, k) {
      var b = h("button", "ans", '<span class="l">' + "ABC"[k] + "</span><span>" + o[0] + "</span>");
      b.addEventListener("click", function () {
        if (answered) return; answered = true;
        btns.forEach(function (x, j) { x.disabled = true; if (opts[j][1]) { x.classList.add("ok"); x.querySelector(".l").textContent = "✓"; } });
        if (!o[1]) { b.classList.add("ko"); b.querySelector(".l").textContent = "✕"; }
        exp.hidden = false;
        exp.innerHTML = o[1] ? "<b>Juste !</b> La mitochondrie produit l'ATP, l'énergie de la cellule. Cette notion reviendra dans 2 jours." : "<b>Pas tout à fait.</b> C'est la mitochondrie. Cette notion revient demain : l'erreur est mémorisée.";
        if (o[1]) {
          days++; streak.textContent = "SÉRIE " + days + " jour" + (days > 1 ? "s" : "");
          var p = h("span", "pop", "+10 XP"); p.style.left = "40%"; p.style.top = "40%"; card.appendChild(p); setTimeout(function () { p.remove(); }, 1000);
        }
        var again = h("button", "btn small", "↺ Rejouer"); again.style.marginTop = "10px";
        again.addEventListener("click", function () { answered = false; exp.hidden = true; btns.forEach(function (x, j) { x.disabled = false; x.className = "ans"; x.querySelector(".l").textContent = "ABC"[j]; }); again.remove(); });
        exp.appendChild(document.createElement("br")); exp.appendChild(again);
      });
      btns.push(b); ansBox.appendChild(b);
    });
    // inclinaison 3D
    if (card && matchMedia("(hover: hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.parentNode.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.setProperty("--ry", (x * 8) + "deg"); card.style.setProperty("--rx", (-y * 8) + "deg");
      });
      card.parentNode.addEventListener("mouseleave", function () { card.style.setProperty("--ry", "0deg"); card.style.setProperty("--rx", "0deg"); });
    }
  }

  /* ---------- planning ---------- */
  function planning() {
    var day = $("day"); if (!day) return;
    var START = 8, N = 14, cls = { 8: 1, 9: 1, 10: 1, 11: 1, 13: 1, 14: 1 }, busy = { 12: 1, 19: 1 };
    function draw() {
      day.innerHTML = ""; var slots = [], run = null;
      for (var k = 0; k < N; k++) {
        var hr = START + k, state = cls[hr] ? "class" : busy[hr] ? "busy" : "slot";
        if (state === "slot") { if (!run) { run = { from: hr, to: hr + 1 }; slots.push(run); } else run.to = hr + 1; } else run = null;
        (function (hr, state) {
          var c = h("button", "hour " + state, hr + "h");
          c.setAttribute("aria-label", hr + "h : " + (state === "class" ? "cours" : state === "busy" ? "indisponible" : "libre, créneau"));
          if (state !== "class") c.addEventListener("click", function () { if (busy[hr]) delete busy[hr]; else busy[hr] = 1; draw(); });
          else c.disabled = true;
          day.appendChild(c);
        })(hr, state);
      }
      var out = $("dayOut");
      out.innerHTML = slots.length ? "<b>" + slots.length + " créneau" + (slots.length > 1 ? "x" : "") + " de révision :</b> " + slots.map(function (s) { return s.from + "h–" + s.to + "h (" + (s.to - s.from) + " h)"; }).join(" · ") : "<b>Aucun créneau.</b> Tout est occupé : Nemo ne bloquera rien aujourd'hui.";
    }
    draw();
  }

  /* ---------- formats ---------- */
  function formats() {
    var fb = $("ffilters"), grid = $("fgrid"), demo = $("fdemo"); if (!fb) return;
    var cur = "Tous", selId = null;
    var st = $("stat-formats"); if (st) st.setAttribute("data-count", NEMO.formats.length);
    NEMO.fcats.forEach(function (c) {
      var b = h("button", "chip", c); b.setAttribute("aria-pressed", c === "Tous");
      b.addEventListener("click", function () { cur = c; fb.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); apply(); });
      fb.appendChild(b);
    });
    var cards = NEMO.formats.map(function (f) {
      var c = h("button", "fcard", '<b><span class="dot"></span>' + f.n + (f.demo ? '<span class="play">démo</span>' : "") + '</b><small>' + f.c + "</small>");
      c.setAttribute("data-c", f.c);
      c.addEventListener("click", function () { choose(f.id); });
      grid.appendChild(c); return c;
    });
    function apply() { NEMO.formats.forEach(function (f, i) { cards[i].classList.toggle("hide", cur !== "Tous" && f.c !== cur); }); }
    function choose(id) {
      selId = id; NEMO.formats.forEach(function (f, i) { cards[i].classList.toggle("sel", f.id === id); });
      var f = NEMO.formats.filter(function (x) { return x.id === id; })[0];
      demo.innerHTML = '<div class="cap">' + f.c + ' · <code>' + f.id + '</code></div><h3 style="margin:6px 0 8px">' + f.n + "</h3><p>" + f.d + '</p><div class="stage"></div>';
      var stage = demo.querySelector(".stage"); if (demos[id]) demos[id](stage);
      else stage.appendChild(h("p", "cap", "Pas de mini-démo pour ce format. Les formats marqués ▶ sont jouables ici."));
    }
    var demos = {
      "blind-qcm": function (s) {
        s.innerHTML = '<div class="flip" tabindex="0"><div class="in-card"><div class="face"><div><b>Quelle est la capitale de l\'Australie ?</b><br><span class="cap">touche pour retourner la carte</span></div></div><div class="face back"><b>Cherche d\'abord la réponse dans ta tête…</b></div></div></div><div class="opts" style="margin-top:14px" hidden></div>';
        var fl = s.querySelector(".flip"), opts = s.querySelector(".opts");
        function flip() {
          fl.classList.add("f");
          setTimeout(function () {
            opts.hidden = false; opts.innerHTML = "";
            [["Sydney", 0], ["Canberra", 1], ["Melbourne", 0]].forEach(function (o, k) {
              var b = h("button", "ans", '<span class="l">' + "ABC"[k] + "</span><span>" + o[0] + "</span>");
              b.addEventListener("click", function () { opts.querySelectorAll(".ans").forEach(function (x) { x.disabled = true; }); b.classList.add(o[1] ? "ok" : "ko"); if (!o[1]) opts.children[1].classList.add("ok"); opts.appendChild(h("div", "explain", "Canberra est la capitale ; Sydney est seulement la plus grande ville.")); });
              opts.appendChild(b);
            });
          }, 450);
        }
        fl.addEventListener("click", flip); fl.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
      },
      "true-false": function (s) {
        s.innerHTML = '<p><b>« Les électrons ont une charge électrique positive. »</b></p><div style="display:flex;gap:10px"><button class="btn" data-v="1">Vrai</button><button class="btn" data-v="0">Faux</button></div><div class="out" style="margin-top:12px"></div>';
        s.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () {
          var ok = b.getAttribute("data-v") === "0"; s.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
          b.classList.add(ok ? "reward" : ""); s.querySelector(".out").innerHTML = '<div class="explain"><b>' + (ok ? "Juste." : "Faux.") + "</b> L'électron porte une charge négative ; c'est le proton qui est positif. Justification affichée après coup, jamais saisie par l'élève.</div>";
        }); });
      },
      "cloze": function (s) {
        s.innerHTML = '<p style="font-size:19px;line-height:2.2">Le <input class="field" size="6" data-a="cœur|coeur"> pompe le <input class="field" size="6" data-a="sang"> dans tout le corps par les <input class="field" size="8" data-a="artères|arteres"> .</p><button class="btn small primary">Corriger</button> <span class="out"></span>';
        s.querySelector("button").addEventListener("click", function () {
          var good = 0, ins = s.querySelectorAll("input");
          ins.forEach(function (i) { var ok = i.getAttribute("data-a").split("|").some(function (a) { return norm(a) === norm(i.value); }); i.style.background = ok ? "var(--green)" : "var(--pink)"; i.style.color = "var(--fluo-ink)"; if (ok) good++; });
          s.querySelector(".out").textContent = good + " / " + ins.length + " · indifférent à la casse, aux accents et à œ/æ.";
        });
      },
      "estimate": function (s) {
        s.innerHTML = '<p><b>Combien d\'habitants en France ? (en millions)</b></p><input type="range" class="slider" min="0" max="100" value="30" aria-label="Estimation"><div style="display:flex;justify-content:space-between" class="cap"><span>1</span><span>10</span><span>100</span><span>1000</span></div><p class="big-num" style="font-size:44px;margin:8px 0" id="estV"></p><button class="btn small primary">Valider</button><div class="out" style="margin-top:12px"></div>';
        var r = s.querySelector("input"), v = s.querySelector("#estV");
        function val() { return Math.pow(10, r.value * 3 / 100); }
        function show() { var x = val(); v.textContent = (x < 10 ? x.toFixed(1) : Math.round(x)) + " M"; } r.addEventListener("input", show); show();
        s.querySelector("button").addEventListener("click", function () {
          var x = val(), ratio = Math.max(x / 68, 68 / x), good = ratio < 1.25;
          s.querySelector(".out").innerHTML = '<div class="explain"><b>' + (good ? "Dans le mille." : ratio < 3 ? "Pas loin." : "Loin de l'ordre de grandeur.") + "</b> Réponse : environ 68 millions. Tu étais à un facteur ×" + ratio.toFixed(1) + ".</div>";
        });
      },
      "word-order": function (s) {
        var target = "She has lived in Paris for two years".split(" "), pool = target.concat(["since"]).sort(function () { return Math.random() - .5; });
        s.innerHTML = '<p class="cap">Traduis : « Elle habite à Paris depuis deux ans. » (un mot est en trop)</p><div class="words target"></div><div class="words pool"></div><button class="btn small primary">Vérifier</button> <button class="btn small">↺</button> <span class="out"></span>';
        var tgt = s.querySelector(".target"), pl = s.querySelector(".pool"), got = [];
        function draw() {
          tgt.innerHTML = ""; pl.innerHTML = "";
          got.forEach(function (w, i) { var b = h("button", "word", w); b.addEventListener("click", function () { got.splice(i, 1); draw(); }); tgt.appendChild(b); });
          pool.forEach(function (w) { var used = got.indexOf(w) > -1; var b = h("button", "word" + (used ? " used" : ""), w); b.addEventListener("click", function () { got.push(w); draw(); }); pl.appendChild(b); });
        }
        draw();
        var bs = s.querySelectorAll(".btn");
        bs[0].addEventListener("click", function () { var ok = got.join(" ") === target.join(" "); s.querySelector(".out").innerHTML = ok ? "<b>✓ Parfait.</b>" : "<b>✕ Pas encore.</b> « since » est l'intrus : on dit « for two years »."; });
        bs[1].addEventListener("click", function () { got = []; s.querySelector(".out").textContent = ""; draw(); });
      }
    };
    choose("blind-qcm");
  }

  /* ---------- Leitner ---------- */
  function leitner() {
    var boxes = $("boxes"); if (!boxes) return;
    var INT = [1, 2, 4, 7, 14, 30], box = 0, elapsed = 0, lg = $("lLog");
    function draw(anim) {
      boxes.innerHTML = "";
      INT.forEach(function (d, i) {
        var b = h("div", "lbox" + (i === box ? " here" : ""), "<b>" + i + "</b><small>" + d + " j</small>");
        if (i === box) b.appendChild(h("span", "tok"));
        boxes.appendChild(b);
      });
      $("lOut").innerHTML = "Prochaine révision dans <b>" + INT[box] + " jour" + (INT[box] > 1 ? "s" : "") + "</b>. Temps écoulé : <b>" + elapsed + " jours</b>.";
    }
    function answer(ok) {
      var from = box; box = ok ? Math.min(5, box + 1) : 0; elapsed += INT[box];
      log(lg, (ok ? "juste" : "raté") + " · boîte " + from + " → " + box + " · revoir dans " + INT[box] + " j (jour " + elapsed + ")", ok ? "g" : "r");
      draw();
      if (box === 5 && ok) log(lg, "boîte 5 : la notion ne reviendra plus que tous les 30 jours.", "g");
    }
    $("lRight").addEventListener("click", function () { answer(true); });
    $("lWrong").addEventListener("click", function () { answer(false); });
    $("lReset").addEventListener("click", function () { box = 0; elapsed = 0; lg.innerHTML = ""; draw(); log(lg, "nouvelle notion · boîte 0"); });
    draw(); log(lg, "nouvelle notion · boîte 0");
  }

  /* ---------- gamification ---------- */
  function game() {
    if (!$("gLevel")) return;
    var T = [0, 30, 80, 150, 250, 400, 600, 850, 1150, 1500];
    function floorOf(l) { return l <= T.length ? T[l - 1] : T[T.length - 1] + (l - T.length) * 400; }
    function levelFor(xp) { var l = 1; while (xp >= floorOf(l + 1)) l++; return { l: l, a: floorOf(l), b: floorOf(l + 1) }; }
    function mult(n) { return n >= 25 ? 5 : n >= 10 ? 4 : n >= 6 ? 3 : n >= 3 ? 2 : 1; }
    var S, prizeCycle = ["shield", "boost", "color"], lg = $("gLog");
    function reset() { S = { xp: 0, n: 0, best: 0, shields: 0, boost: 0, q: 0 }; lg.innerHTML = ""; draw(); log(lg, "Prêt. Chaque clic = une nouvelle notion."); }
    function draw() {
      var L = levelFor(S.xp);
      $("gLevel").textContent = L.l; $("gCombo").textContent = S.n;
      $("gXp").textContent = S.xp + " XP · prochain niveau à " + L.b;
      $("gBar").style.width = Math.round((S.xp - L.a) / (L.b - L.a) * 100) + "%";
      $("gBoost").textContent = S.boost;
      var sh = ""; for (var i = 0; i < 3; i++) sh += '<span class="shield' + (i < S.shields ? "" : " empty") + '"></span>'; $("gShields").innerHTML = sh;
      var m = $("gMult"); m.innerHTML = "";
      [[3, "×2 dès 3"], [6, "×3 dès 6"], [10, "×4 dès 10"], [25, "×5 dès 25"]].forEach(function (x) { m.appendChild(h("span", "pill" + (S.n >= x[0] ? " on" : ""), x[1])); });
    }
    function right(base) {
      S.q++; S.n++; S.best = Math.max(S.best, S.n);
      var mu = mult(S.n), boosted = S.boost > 0; if (boosted) S.boost--;
      var factor = mu * (boosted ? 2 : 1), pts = base * factor; S.xp += pts;
      var msg = "notion " + S.q + " : +" + base + " × " + factor + (boosted ? " (boost)" : "") + " = <b>+" + pts + " XP</b> · série " + S.n;
      if (S.n % 10 === 0 && S.n < 100) {
        var pz = prizeCycle[(S.n / 10 - 1) % 3];
        if (pz === "shield") { S.shields = Math.min(3, S.shields + 1); msg += " · coffre : un bouclier"; }
        else if (pz === "boost") { S.boost = 3; msg += " · coffre : boost ×2 sur 3 réponses"; }
        else msg += " · coffre : une couleur de logo";
      }
      log(lg, msg, "g"); draw();
    }
    function wrong() {
      S.q++;
      if (S.shields > 0 && S.n > 0) { S.shields--; log(lg, "notion " + S.q + " : le bouclier absorbe l'erreur, la série tient (" + S.n + ")."); }
      else { var b = S.n; S.n = 0; S.boost = 0; log(lg, "notion " + S.q + " : 0 point, mémorisée pour demain." + (b ? " Série " + b + " interrompue (record : " + S.best + ")." : ""), "r"); }
      draw();
    }
    $("gRight").addEventListener("click", function () { right(1); });
    $("gRecall").addEventListener("click", function () { right(2); });
    $("gWrong").addEventListener("click", wrong);
    $("gReset").addEventListener("click", reset);
    reset();
  }

  /* ---------- outils MCP ---------- */
  function tools() {
    var rows = $("toolRows"); if (!rows) return;
    var cat = "Tous", q = "", cats = $("toolCats");
    NEMO.toolCats.forEach(function (c) {
      var b = h("button", "chip", c); b.setAttribute("aria-pressed", c === "Tous");
      b.addEventListener("click", function () { cat = c; cats.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); draw(); });
      cats.appendChild(b);
    });
    $("toolQ").addEventListener("input", function (e) { q = norm(e.target.value); draw(); });
    function draw() {
      rows.innerHTML = ""; var n = 0;
      NEMO.tools.forEach(function (t) {
        if (cat !== "Tous" && t[1] !== cat) return;
        if (q && norm(t[0] + " " + t[1] + " " + t[2]).indexOf(q) < 0) return;
        n++; var tr = h("tr", "", "<td><code>" + t[0] + "</code>" + (t[3] ? ' <span class="pill y" title="À autoriser une fois (Toujours autoriser)">✎ écrit</span>' : "") + "</td><td>" + t[1] + "</td><td>" + t[2] + "</td>");
        rows.appendChild(tr);
      });
      if (!n) rows.appendChild(h("tr", "", '<td colspan="3">Aucun outil ne correspond.</td>'));
      $("toolCount").textContent = n + " outil" + (n > 1 ? "s" : "") + " affiché" + (n > 1 ? "s" : "") + " sur " + NEMO.tools.length + " · ✎ = outil qui écrit : à autoriser UNE fois (« Toujours autoriser »).";
    }
    draw();
  }

  /* ---------- installation ---------- */
  function install() {
    var tabs = $("itabs"), panes = $("ipanes"); if (!tabs) return;
    NEMO.install.forEach(function (t, i) {
      var b = h("button", "chip", t.t); b.setAttribute("role", "tab"); b.setAttribute("aria-pressed", i === 0);
      var p = h("div", "tabpane" + (i === 0 ? " on" : ""));
      var flow = '<div class="flow">' + t.flow.map(function (s, k) { return (k ? '<span class="ar">→</span>' : "") + '<span class="st" style="--i:' + k + '">' + s + "</span>"; }).join("") + "</div>";
      p.innerHTML = flow + t.body[0];
      if (t.body[1]) {
        var pre = h("pre"); pre.style.marginTop = "16px";
        pre.appendChild(document.createTextNode(t.body[1].join("\n")));
        var cp = h("button", "copy", "Copier");
        cp.addEventListener("click", function () {
          var txt = t.body[1].filter(function (l) { return l[0] !== "#"; }).join("\n");
          (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { cp.textContent = "Copié ✓"; }, function () { cp.textContent = "Sélectionne puis Ctrl+C"; });
          setTimeout(function () { cp.textContent = "Copier"; }, 1600);
        });
        pre.appendChild(cp); p.appendChild(pre);
      }
      b.addEventListener("click", function () {
        tabs.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        panes.querySelectorAll(".tabpane").forEach(function (x) { x.classList.remove("on"); });
        b.setAttribute("aria-pressed", "true"); p.classList.add("on");
      });
      tabs.appendChild(b); panes.appendChild(p);
    });
  }

  NEMO.initSims = function () { bricks(); hero(); planning(); formats(); leitner(); game(); tools(); install(); };
})();
