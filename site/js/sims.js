/* Composants interactifs : aperçu d'exercice fidèle, planificateur, formats, Leitner, jeu, outils MCP, installation.
   Les démos (aperçu d'en-tête, Leitner, jeu, pipeline) se jouent seules quand elles sont visibles,
   et s'arrêtent dès que le visiteur interagit. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var reduce = NEMO.reduce;
  function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/\s+/g, " ").trim(); }
  function log(box, html, cls) { var d = h("div", cls, html); box.appendChild(d); box.scrollTop = box.scrollHeight; }
  function param(k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function pop(root, txt, x, y) { var p = h("span", "nm-pop", txt); p.style.left = (x || 60) + "%"; p.style.top = (y || 30) + "%"; root.appendChild(p); setTimeout(function () { p.remove(); }, 1100); }

  /* ====== aperçu fidèle d'une page d'exercice (QCM) : barre de parcours, pastille lettre, juste/faux, explication ====== */
  function nmQuiz(root, qs, opts) {
    opts = opts || {};
    var box = h("div", "qz"); root.appendChild(box);
    var i = 0, notions = 0, combo = 0, score = 0, secs = 0, locked = false, stopped = false, running = false, timers = [], clock = null;
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function draw() {
      var q = qs[i];
      box.innerHTML =
        '<div class="nm-bar"><div class="row"><span class="nm-badge ' + q.cls + '">' + q.subject + '</span><span class="nm-cap"><span class="cnt">' + pad(i + 1) + "/" + pad(qs.length) + '</span> · <span class="clk">' + clockText() + '</span></span></div><div class="nm-prog"><i style="width:' + Math.round(i / qs.length * 100) + '%"></i></div></div>' +
        '<div class="nm-game"><span class="goal"><span class="ring" style="--p:' + Math.min(100, notions / 8 * 100) + '%"></span><span class="gtxt">' + notions + " / 8 notions</span></span>" + (combo ? '<span class="combo">Série ×' + combo + "</span>" : "") + "</div>" +
        '<h4 class="nm-q"></h4><div class="nm-choices"></div><div class="nm-ex" hidden></div>' +
        '<div class="nm-actions"><button class="nm-btn nxt" disabled>' + (i === qs.length - 1 ? "Voir le bilan" : "Question suivante") + '</button><button class="nm-link stp">Arrêter ici</button></div>';
      box.querySelector(".nm-q").textContent = q.q;
      var cs = box.querySelector(".nm-choices"); locked = false;
      q.c.forEach(function (t, k) {
        var b = h("button", "nm-ch"); b.innerHTML = '<span class="ind"></span><span></span>'; b.lastChild.textContent = t;
        b.addEventListener("click", function () { if (!opts.auto || true) userStop(); pick(k, false); });
        cs.appendChild(b);
      });
      box.querySelector(".nxt").addEventListener("click", function () { userStop(); next(); });
      box.querySelector(".stp").addEventListener("click", function () { userStop(); i = 0; notions = 0; combo = 0; score = 0; secs = 0; draw(); });
    }
    function clockText() { return pad(Math.floor(secs / 60)) + ":" + pad(secs % 60); }
    function pick(k, auto) {
      if (locked) return; locked = true;
      var q = qs[i], bs = box.querySelectorAll(".nm-ch"), ok = k === q.a;
      bs.forEach(function (b) { b.disabled = true; });
      bs[q.a].classList.add("ok"); if (!ok) bs[k].classList.add("ko");
      if (ok) { score++; notions++; combo++; pop(root, "+" + (combo >= 3 ? combo >= 6 ? 3 : 2 : 1), 62, 28); } else combo = 0;
      var ex = box.querySelector(".nm-ex"); ex.hidden = false;
      ex.textContent = (ok ? "" : "Cette notion revient demain. ") + q.ex;
      box.querySelector(".nxt").disabled = false;
      var g = box.querySelector(".nm-game"); g.querySelector(".ring").style.setProperty("--p", Math.min(100, notions / 8 * 100) + "%"); g.querySelector(".gtxt").textContent = notions + " / 8 notions";
      var cb = g.querySelector(".combo"); if (combo) { if (!cb) { cb = h("span", "combo"); g.appendChild(cb); } cb.textContent = "Série ×" + combo; cb.classList.add("bump"); setTimeout(function () { cb.classList.remove("bump"); }, 250); } else if (cb) cb.remove();
      box.querySelector(".nm-prog > i").style.width = Math.round((i + 1) / qs.length * 100) + "%";
    }
    function next() {
      if (i < qs.length - 1) { i++; draw(); return; }
      box.innerHTML = '<div class="nm-bar"><div class="row"><span class="nm-badge">Bilan</span><span class="nm-cap">' + clockText() + '</span></div><div class="nm-prog"><i style="width:100%"></i></div></div>' +
        '<div class="nm-end"><span class="sc">' + score + "/" + qs.length + '</span><span class="xp">+' + (score * 10) + ' XP</span><span>Les erreurs reviennent demain, les réussites plus tard.</span></div>' +
        '<div class="nm-actions" style="margin-top:14px"><button class="nm-btn rew again">Refaire</button></div>';
      box.querySelector(".again").addEventListener("click", function () { userStop(); i = 0; notions = 0; combo = 0; score = 0; secs = 0; draw(); });
      locked = true;
    }
    function userStop() { stopped = true; clear(); }
    // lecture automatique
    function step() {
      if (stopped || !running) return;
      var q = qs[i], wrong = (i === 1 && qs.length > 1);
      var bs = box.querySelectorAll(".nm-ch");
      if (!bs.length) { later(step, 1500); return; }
      var k = wrong ? (q.a + 1) % q.c.length : q.a;
      bs[k].classList.add("hint");
      later(function () { if (stopped) return; bs[k].classList.remove("hint"); pick(k, true); later(function () { if (stopped) return; if (i === qs.length - 1) { next(); later(function () { i = 0; notions = 0; combo = 0; score = 0; secs = 0; draw(); later(step, 1800); }, 3600); } else { next(); later(step, 1700); } }, 2600); }, 1400);
    }
    if (!clock) clock = setInterval(function () { if (!document.hidden && box.querySelector(".clk")) { secs++; box.querySelector(".clk").textContent = clockText(); } }, 1000);
    draw();
    if (opts.auto && !reduce) NEMO.whileVisible(root, function () { if (stopped || running) return; running = true; later(step, 1400); }, function () { running = false; clear(); }, .35);
    return { stop: userStop };
  }
  NEMO.nmQuiz = nmQuiz;

  /* ---------- briques ---------- */
  function bricks() {
    var root = $("bricks"); if (!root) return;
    root.setAttribute("data-stagger", "");
    NEMO.bricks.forEach(function (b) {
      var c = h("div", "card brick");
      c.innerHTML = '<div class="bar" style="background:' + b.color + '"></div><h3>' + b.name + '</h3><div class="cap">' + b.role + '</div>' +
        '<p class="mono" style="margin:0;font-size:12px;color:var(--mute);font-family:var(--f-mono)">' + b.where + '</p><ul>' + b.pts.map(function (p) { return "<li>" + p + "</li>"; }).join("") + '</ul>' +
        '<div class="foot">' + b.tags.map(function (t) { return '<span class="pill">' + t + "</span>"; }).join("") + '</div>' +
        '<a href="https://github.com/' + b.repo + '">github.com/' + b.repo + '</a>';
      root.appendChild(c);
    });
  }

  /* ---------- accueil : aperçu d'en-tête, pipeline, tuiles ---------- */
  function home() {
    var words = ["les maths", "la SVT", "l'histoire", "l'anglais", "la physique", "le français"], i = 0, sw = $("swap");
    if (sw && !reduce) {
      setInterval(function () {
        sw.style.transition = "opacity .25s, transform .25s"; sw.style.opacity = 0; sw.style.transform = "translateY(10px)";
        setTimeout(function () { i = (i + 1) % words.length; sw.textContent = words[i]; sw.style.opacity = 1; sw.style.transform = "none"; }, 260);
      }, 2400);
    }
    var card = $("heroCard");
    if (card) {
      nmQuiz(card, NEMO.quiz, { auto: true });
      if (matchMedia("(hover: hover)").matches && !reduce) {
        card.parentNode.addEventListener("mousemove", function (e) {
          var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          card.style.setProperty("--ry", (x * 6) + "deg"); card.style.setProperty("--rx", (-y * 6) + "deg");
        });
        card.parentNode.addEventListener("mouseleave", function () { card.style.setProperty("--ry", "0deg"); card.style.setProperty("--rx", "0deg"); });
      }
    }
    var pipe = $("pipe");
    if (pipe) {
      var els = NEMO.pipe.map(function (s, k) {
        var d = h("div", "st", '<div class="dot">' + (k + 1) + "</div><div><b>" + s.t + "</b><small>" + s.s + "</small></div>");
        pipe.appendChild(d); return d;
      });
      var cur = -1, t = null;
      function paint() { els.forEach(function (e, k) { e.classList.toggle("done", k <= cur); e.classList.toggle("now", k === cur); }); }
      if (reduce) { cur = els.length - 1; paint(); }
      else NEMO.whileVisible(pipe, function () {
        if (t) return; cur = -1;
        t = setInterval(function () { cur++; if (cur > els.length + 1) cur = -1; paint(); }, 1300);
      }, function () { clearInterval(t); t = null; }, .4);
    }
    var tiles = $("tiles");
    if (tiles) NEMO.pages.forEach(function (p) {
      if (p.id === "index") return;
      var viz = { "v-arch": "<i></i><i></i><i></i><i></i>", "v-seq": "<i></i><i></i><i></i><i></i>", "v-fmt": "<i></i><i></i><i></i><i></i>", "v-prog": "<i></i><i></i><i></i><i></i><i></i><i></i>", "v-mcp": "<span>$ prepare_full_session</span><span>ok · brief prêt</span>", "v-lock": "<i></i>", "v-ins": "<span>$ install.ps1 <b>▌</b></span>" }[p.v];
      tiles.appendChild(h("a", "tile", '<div class="viz ' + p.v + '">' + viz + "</div><h3>" + p.t + "</h3><p>" + p.d + "</p>")).href = p.href;
    });
  }

  /* ---------- planificateur : chaque bloc est cliquable et détaillé ---------- */
  function planning() {
    var tl = $("tl"); if (!tl) return;
    var D = NEMO.day, busy = {}, selKey = null, info = $("dayInfo");
    for (var k in D.busy) busy[k] = D.busy[k];
    function classAt(hr) { for (var i = 0; i < D.classes.length; i++) if (hr >= D.classes[i].from && hr < D.classes[i].to) return i; return -1; }
    function blocks() {
      var out = [], cur = null;
      for (var hr = D.start; hr < D.end; hr++) {
        var ci = classAt(hr), type = ci > -1 ? "class" : busy[hr] ? "busy" : "slot";
        var key = type === "class" ? "c" + ci : type === "busy" ? "b" + busy[hr] : "s";
        if (cur && cur.key === key && cur.to === hr) cur.to = hr + 1;
        else { cur = { type: type, key: key, from: hr, to: hr + 1, ci: ci, name: busy[hr] }; out.push(cur); }
      }
      return out;
    }
    function dur(b) { return (b.to - b.from) + " h"; }
    function render(animate) {
      var bl = blocks(); tl.innerHTML = ""; var slots = 0, hrs = 0;
      bl.forEach(function (b, i) {
        var title = b.type === "class" ? D.classes[b.ci].t : b.type === "busy" ? b.name : "Créneau de révision";
        var c = h("button", "blk " + b.type + (selKey === b.key + b.from ? " sel" : ""), '<span class="h">' + b.from + "h–" + b.to + "h</span><b></b>");
        c.querySelector("b").textContent = title;
        c.style.setProperty("--w", b.to - b.from); c.style.setProperty("--k", i);
        c.setAttribute("aria-label", title + ", " + b.from + "h à " + b.to + "h");
        c.addEventListener("click", function () { selKey = b.key + b.from; render(false); detail(b); });
        if (!animate) { c.style.animation = "none"; c.style.opacity = 1; c.style.transform = "none"; }
        tl.appendChild(c);
        if (b.type === "slot") { slots++; hrs += b.to - b.from; }
      });
      $("daySum").textContent = slots + " créneau" + (slots > 1 ? "x" : "") + " · " + hrs + " h de révision";
      return bl;
    }
    function ticks() { var t = $("ticks"); for (var hr = D.start; hr < D.end; hr++) t.appendChild(h("span", "", hr + "h")); }
    function detail(b) {
      info.innerHTML = "";
      var t = h("h3"), p = h("p"), meta = h("div", "meta");
      p.style.margin = "0";
      if (b.type === "class") {
        var c = D.classes[b.ci];
        t.textContent = "Cours · " + c.t + " (" + b.from + "h–" + b.to + "h)";
        p.textContent = c.note + " Ce bloc vient de l'emploi du temps EcoleDirecte. Nemo ne le modifie pas : aucun créneau de révision n'y est placé et le verrou ne se déclenche jamais pendant un cours.";
        ["source : EcoleDirecte", dur(b), "lecture seule"].forEach(function (x) { meta.appendChild(h("span", "pill", x)); });
      } else if (b.type === "busy") {
        t.textContent = "Indisponible · " + b.name + " (" + b.from + "h–" + b.to + "h)";
        p.textContent = "Plage déclarée indisponible par l'élève sur la page Planning du site. Elle est retirée du planning : aucun créneau, aucun verrou, aucune notification pendant ce bloc.";
        ["déclarée par l'élève", dur(b)].forEach(function (x) { meta.appendChild(h("span", "pill", x)); });
      } else {
        t.textContent = "Créneau de révision · " + b.from + "h–" + b.to + "h (" + dur(b) + ")";
        p.textContent = "Plage libre : Nemo la propose comme créneau. À " + b.from + "h00 le PC et le téléphone se verrouillent ; une fois la session menée au bout, ils sont libérés sans attendre la fin du créneau.";
        ["calculé par le serveur", dur(b), "GET /api/plan"].forEach(function (x) { meta.appendChild(h("span", "pill", x)); });
      }
      info.appendChild(t); info.appendChild(p);
      if (b.type === "slot") {
        var ph = h("div", "phases"); info.appendChild(ph);
        [["Préavis", (b.from - 1) + "h55"], ["Verrou", b.from + "h00"], ["Construction", "assistant IA"], ["Session", "jouée dans l'app"], ["Libération", "bilan à l'écran"]].forEach(function (x, i) {
          var d = h("div", "", "<b>" + x[0] + "</b>" + x[1]); d.style.setProperty("--k", i); ph.appendChild(d);
        });
      }
      info.appendChild(meta);
      if (b.type !== "class") {
        var row = h("div", "hrs"), lbl = h("span", "cap", b.type === "slot" ? "Déclarer indisponible :" : "Rendre disponible :"); lbl.style.alignSelf = "center"; row.appendChild(lbl);
        for (var hr = b.from; hr < b.to; hr++) (function (hr) {
          var btn = h("button", "btn small", hr + "h");
          btn.addEventListener("click", function () {
            if (busy[hr]) delete busy[hr]; else busy[hr] = "Indisponible";
            var bl = render(false), nb = null;
            bl.forEach(function (x) { if (hr >= x.from && hr < x.to) nb = x; });
            if (nb) { selKey = nb.key + nb.from; render(false); detail(nb); }
          });
          row.appendChild(btn);
        })(hr);
        info.appendChild(row);
      }
    }
    ticks();
    var bl = render(true);
    var first = bl.filter(function (b) { return b.type === "slot"; })[0] || bl[0];
    selKey = first.key + first.from; render(false); detail(first);
    tl.classList.add("go");
    // la cascade des blocs se joue quand la carte devient visible
    if (!reduce) { tl.classList.remove("go"); NEMO.onVisible(tl, function () { render(true); tl.classList.add("go"); var b2 = blocks().filter(function (b) { return b.key + b.from === selKey; })[0]; }, .4); }
    // règles (cartes cliquables)
    var T = {
      warn: { title: "Préavis (5 min par défaut)", text: "5 minutes avant le créneau : notification dans la barre des tâches, et la pré-construction de la session démarre au même moment. Le préavis est dédoublonné avec le téléphone : le premier appareil qui réclame annonce.", meta: ["settings.warnLeadMinutes", "GET /api/plan/config"] },
      late: { title: "PC allumé en retard", text: "Allumé ou réveillé pendant un créneau, le PC se verrouille aussitôt (depuis le 12/10/2026). Un créneau à moins de 5 minutes de sa fin n'est pas rattrapé par défaut.", meta: ["settings.minRemainingToStartMinutes"] },
      quiet: { title: "Heures calmes", text: "Pas d'annonce de révision ni de préavis. Elles se règlent une seule fois sur le site (Réglages et outils) et valent pour le site, le téléphone et le PC.", meta: ["GET /api/me/prefs"] }
    };
    document.querySelectorAll(".rule").forEach(function (c) {
      c.addEventListener("click", function () {
        var d = T[c.getAttribute("data-k")]; info.innerHTML = "";
        info.appendChild(h("h3", "", d.title)); var p = h("p", "", d.text); p.style.margin = "0"; info.appendChild(p);
        var m = h("div", "meta"); d.meta.forEach(function (x) { m.appendChild(h("span", "pill", x)); }); info.appendChild(m);
        selKey = null; render(false);
      });
    });
  }

  /* ---------- formats : cartes + démos fidèles ---------- */
  function formats() {
    var fb = $("ffilters"), grid = $("fgrid"), demo = $("fdemo"); if (!fb) return;
    var cur = "Tous";
    NEMO.fcats.forEach(function (c) {
      var b = h("button", "chip", c); b.setAttribute("aria-pressed", c === "Tous");
      b.addEventListener("click", function () { cur = c; fb.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); apply(); });
      fb.appendChild(b);
    });
    var cards = NEMO.formats.map(function (f) {
      var c = h("button", "fcard", '<b><span class="dot"></span>' + f.n + (f.demo ? '<span class="play">démo</span>' : "") + "</b><small>" + f.c + "</small>");
      c.setAttribute("data-c", f.c);
      c.addEventListener("click", function () { choose(f.id); });
      grid.appendChild(c); return c;
    });
    function apply() { NEMO.formats.forEach(function (f, i) { cards[i].classList.toggle("hide", cur !== "Tous" && f.c !== cur); }); }
    var quizTimer = null;
    function bar(badge, bcls, cap, pct) {
      return '<div class="nm-bar"><div class="row"><span class="nm-badge ' + bcls + '">' + badge + '</span><span class="nm-cap">' + cap + '</span></div><div class="nm-prog"><i style="width:' + pct + '%"></i></div></div>';
    }
    function choose(id) {
      NEMO.formats.forEach(function (f, i) { cards[i].classList.toggle("sel", f.id === id); });
      var f = NEMO.formats.filter(function (x) { return x.id === id; })[0];
      demo.innerHTML = '<div class="nm-cap" style="margin-bottom:6px">' + f.c + ' · ' + f.id + '</div><h4 class="nm-q" style="margin-bottom:6px">' + f.n + '</h4><p style="color:var(--text2);margin:0 0 16px"></p><div class="stage"></div>';
      demo.querySelector("p").textContent = f.d;
      var stage = demo.querySelector(".stage");
      if (demos[id]) { demo.appendChild(h("span", "demo-tag", "démo jouable")); demos[id](stage); }
      else stage.appendChild(h("div", "nm-ex", "Pas d'aperçu jouable pour ce format ; les formats marqués « démo » le sont."));
      history.replaceState && history.replaceState(null, "", "?f=" + id);
    }
    var demos = {
      "qcm": function (s) { nmQuiz(s, [
        { cls: "eng", subject: "Anglais", q: "Which sentence is correct?", c: ["She have two brothers.", "She has two brothers.", "She haves two brothers."], a: 1, ex: "Avec « she », le verbe « to have » devient « has »." },
        { cls: "maths", subject: "Maths", q: "Combien vaut 3² + 4² ?", c: ["14", "25", "49"], a: 1, ex: "9 + 16 = 25 : le carré de 5, le triplet 3-4-5." }], {}); },
      "blind-qcm": function (s) {
        s.innerHTML = bar("Géo", "hg", "QCM aveugle · 01/03", 0) + '<div class="flipc" tabindex="0"><div class="inn"><div class="fc">Quelle est la capitale de l\'Australie ?</div><div class="fc bk">Cherchez d\'abord la réponse…</div></div></div><p class="nm-cap" style="margin:-6px 0 14px">Touchez la carte pour découvrir les choix</p><div class="nm-choices" hidden></div><div class="nm-ex" hidden></div>';
        var fl = s.querySelector(".flipc"), opts = s.querySelector(".nm-choices"), done = false;
        function flip() {
          if (done) return; done = true; fl.classList.add("f");
          setTimeout(function () {
            opts.hidden = false;
            [["Sydney", 0], ["Canberra", 1], ["Melbourne", 0]].forEach(function (o, k) {
              var b = h("button", "nm-ch"); b.innerHTML = '<span class="ind"></span><span>' + o[0] + "</span>";
              b.addEventListener("click", function () { opts.querySelectorAll(".nm-ch").forEach(function (x) { x.disabled = true; }); b.classList.add(o[1] ? "ok" : "ko"); if (!o[1]) opts.children[1].classList.add("ok"); var ex = s.querySelector(".nm-ex"); ex.hidden = false; ex.textContent = "Canberra est la capitale ; Sydney est seulement la plus grande ville."; });
              opts.appendChild(b);
            });
          }, 450);
        }
        fl.addEventListener("click", flip); fl.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
      },
      "true-false": function (s) {
        s.innerHTML = bar("Physique", "maths", "Vrai / Faux · 01/01", 0) + '<h4 class="nm-q">Les électrons ont une charge électrique positive.</h4><div class="nm-choices"><button class="nm-ch" data-v="1"><span class="ind"></span><span>Vrai</span></button><button class="nm-ch" data-v="0"><span class="ind"></span><span>Faux</span></button></div><div class="nm-ex" hidden></div><div class="nm-actions"><button class="nm-btn" disabled>Valider</button></div>';
        var cs = s.querySelectorAll(".nm-ch"), val = s.querySelector(".nm-btn"), chosen = null;
        cs.forEach(function (b) { b.addEventListener("click", function () { if (val.getAttribute("data-done")) return; cs.forEach(function (x) { x.classList.remove("sel"); }); b.classList.add("sel"); chosen = b; val.disabled = false; }); });
        val.addEventListener("click", function () {
          val.setAttribute("data-done", 1); val.disabled = true; cs.forEach(function (x) { x.disabled = true; x.classList.remove("sel"); });
          var good = s.querySelector('[data-v="0"]'); good.classList.add("ok"); if (chosen !== good) chosen.classList.add("ko");
          var ex = s.querySelector(".nm-ex"); ex.hidden = false; ex.textContent = "L'électron porte une charge négative ; c'est le proton qui est positif. La justification s'affiche après la réponse, l'élève n'a rien à écrire.";
          s.querySelector(".nm-prog > i").style.width = "100%";
        });
      },
      "cloze": function (s) {
        s.innerHTML = bar("SVT", "svt", "Texte à trous · 01/01", 0) + '<p class="nm-text">Le <input class="nm-gap" data-a="cœur|coeur"> pompe le <input class="nm-gap" data-a="sang"> dans tout le corps par les <input class="nm-gap" data-a="artères|arteres"> .</p><div class="nm-ex" hidden></div><div class="nm-actions"><button class="nm-btn">Vérifier</button></div>';
        s.querySelector(".nm-btn").addEventListener("click", function () {
          var good = 0, ins = s.querySelectorAll("input");
          ins.forEach(function (i) { var ok = i.getAttribute("data-a").split("|").some(function (a) { return norm(a) === norm(i.value); }); i.classList.remove("ok", "ko"); i.classList.add(ok ? "ok" : "ko"); if (ok) good++; });
          var ex = s.querySelector(".nm-ex"); ex.hidden = false; ex.textContent = good + " / " + ins.length + " · la correction ignore la casse, les accents et œ/æ. Chaque trou compte comme du rappel actif (+2 par texte entièrement juste).";
          s.querySelector(".nm-prog > i").style.width = Math.round(good / ins.length * 100) + "%";
        });
      },
      "flashcard": function (s) {
        s.innerHTML = bar("Histoire", "hg", "Flashcard · 01/03", 0) + '<div class="nm-flash" tabindex="0"><span class="nm-cap">Flashcard · recto</span><span class="t">En quelle année la Bastille est-elle prise ?</span><span class="nm-cap">touchez pour retourner</span></div><div class="nm-actions" hidden><button class="nm-btn">Je savais</button><button class="nm-btn sec">À revoir</button></div>';
        var fc = s.querySelector(".nm-flash"), act = s.querySelector(".nm-actions"), flipped = false;
        function flip() { if (flipped) return; flipped = true; fc.innerHTML = '<span class="nm-cap">Flashcard · verso</span><span class="t">1789</span><span class="nm-cap">le 14 juillet</span>'; fc.style.boxShadow = "6px 6px 0 var(--ns)"; act.hidden = false; }
        fc.addEventListener("click", flip); fc.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
        act.querySelectorAll(".nm-btn").forEach(function (b, k) { b.addEventListener("click", function () { act.hidden = true; if (k === 0) pop(s.parentNode, "+1", 70, 25); var ex = h("div", "nm-ex", k === 0 ? "Bien. Cette carte reviendra plus tard." : "Cette carte revient demain."); s.appendChild(ex); }); });
      },
      "numeric": function (s) {
        s.innerHTML = bar("Maths", "maths", "Calcul éclair · 01/01", 0) + '<h4 class="nm-q">Combien font 15 % de 240 ?</h4><input class="nm-input" inputmode="decimal" placeholder="Votre réponse" aria-label="Réponse"><div class="nm-ex" hidden></div><div class="nm-actions"><button class="nm-btn">Valider</button></div>';
        s.querySelector(".nm-btn").addEventListener("click", function () {
          var v = parseFloat(String(s.querySelector("input").value).replace(",", ".")), ok = Math.abs(v - 36) < 0.001, ex = s.querySelector(".nm-ex"); ex.hidden = false;
          ex.textContent = isNaN(v) ? "Saisissez un nombre." : ok ? "Juste : 240 × 0,15 = 36. La virgule décimale est acceptée, avec une tolérance réglable." : "Pas tout à fait : 240 × 0,15 = 36.";
          s.querySelector(".nm-prog > i").style.width = ok ? "100%" : "0%";
        });
      },
      "estimate": function (s) {
        s.innerHTML = bar("Géo", "hg", "Estimation · 01/01", 0) + '<h4 class="nm-q">Combien d\'habitants en France, en millions ?</h4><input type="range" class="nm-range" min="0" max="100" value="30" aria-label="Estimation"><div style="display:flex;justify-content:space-between" class="nm-cap"><span>1</span><span>10</span><span>100</span><span>1000</span></div><div class="nm-big" id="estV"></div><div class="nm-ex" hidden></div><div class="nm-actions"><button class="nm-btn">Valider</button></div>';
        var r = s.querySelector("input"), v = s.querySelector("#estV");
        function val() { return Math.pow(10, r.value * 3 / 100); }
        function show() { var x = val(); v.textContent = (x < 10 ? x.toFixed(1) : Math.round(x)) + " M"; } r.addEventListener("input", show); show();
        s.querySelector(".nm-btn").addEventListener("click", function () {
          var x = val(), ratio = Math.max(x / 68, 68 / x), good = ratio < 1.25, ex = s.querySelector(".nm-ex"); ex.hidden = false;
          ex.textContent = (good ? "Dans le mille. " : ratio < 3 ? "Pas loin. " : "Loin de l'ordre de grandeur. ") + "Réponse : environ 68 millions (écart ×" + ratio.toFixed(1) + ").";
        });
      },
      "word-order": function (s) {
        var target = "She has lived in Paris for two years".split(" "), pool = target.concat(["since"]).sort(function () { return Math.random() - .5; });
        s.innerHTML = bar("Anglais", "eng", "Phrase à remettre · 01/01", 0) + '<h4 class="nm-q">« Elle habite à Paris depuis deux ans. »</h4><p class="nm-cap" style="margin:0 0 8px">Un mot est en trop</p><div class="nm-words target"></div><div class="nm-words pool"></div><div class="nm-ex" hidden></div><div class="nm-actions"><button class="nm-btn">Vérifier</button><button class="nm-link">Recommencer</button></div>';
        var tgt = s.querySelector(".target"), pl = s.querySelector(".pool"), got = [];
        function draw() {
          tgt.innerHTML = ""; pl.innerHTML = "";
          got.forEach(function (w, i) { var b = h("button", "nm-word", w); b.addEventListener("click", function () { got.splice(i, 1); draw(); }); tgt.appendChild(b); });
          pool.forEach(function (w) { var used = got.indexOf(w) > -1; var b = h("button", "nm-word" + (used ? " used" : ""), w); b.addEventListener("click", function () { got.push(w); draw(); }); pl.appendChild(b); });
        }
        draw();
        s.querySelector(".nm-btn").addEventListener("click", function () { var ok = got.join(" ") === target.join(" "), ex = s.querySelector(".nm-ex"); ex.hidden = false; ex.textContent = ok ? "Parfait." : "Pas encore : « since » est l'intrus, on dit « for two years »."; tgt.style.background = ok ? "var(--ng)" : "var(--np)"; });
        s.querySelector(".nm-link").addEventListener("click", function () { got = []; s.querySelector(".nm-ex").hidden = true; tgt.style.background = ""; draw(); });
      }
    };
    var want = param("f"), ok = NEMO.formats.some(function (f) { return f.id === want; });
    choose(ok ? want : "qcm");
  }

  /* ---------- Leitner (démo automatique) ---------- */
  function leitner() {
    var boxes = $("boxes"); if (!boxes) return;
    var INT = [1, 2, 4, 7, 14, 30], box = 0, elapsed = 0, lg = $("lLog"), live = $("lLive"), timer = null, manual = false, seq = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1], si = 0;
    function draw() {
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
    function reset() { box = 0; elapsed = 0; lg.innerHTML = ""; draw(); log(lg, "nouvelle notion · boîte 0"); }
    function setLive() { if (!live) return; live.textContent = timer ? "démo automatique" : manual ? "mode manuel" : "en pause"; live.classList.toggle("off", !timer); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setLive(); }
    function user(fn) { return function () { if (!manual) { manual = true; stop(); reset(); } fn(); }; }
    $("lRight").addEventListener("click", user(function () { answer(true); }));
    $("lWrong").addEventListener("click", user(function () { answer(false); }));
    $("lReset").addEventListener("click", function () { manual = true; stop(); reset(); });
    draw(); log(lg, "nouvelle notion · boîte 0");
    if (!reduce) NEMO.whileVisible(boxes, function () { if (manual || timer) return; timer = setInterval(function () { answer(seq[si++ % seq.length] === 1); if (si % seq.length === 0) reset(); }, 1500); setLive(); }, stop, .4);
    else setLive();
  }

  /* ---------- gamification (démo automatique) ---------- */
  function game() {
    if (!$("gLevel")) return;
    var T = [0, 30, 80, 150, 250, 400, 600, 850, 1150, 1500];
    function floorOf(l) { return l <= T.length ? T[l - 1] : T[T.length - 1] + (l - T.length) * 400; }
    function levelFor(xp) { var l = 1; while (xp >= floorOf(l + 1)) l++; return { l: l, a: floorOf(l), b: floorOf(l + 1) }; }
    function mult(n) { return n >= 25 ? 5 : n >= 10 ? 4 : n >= 6 ? 3 : n >= 3 ? 2 : 1; }
    var S, prizeCycle = ["shield", "boost", "color"], lg = $("gLog"), live = $("gLive"), timer = null, manual = false, si = 0;
    var script = [1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0];
    function reset() { S = { xp: 0, n: 0, best: 0, shields: 0, boost: 0, q: 0 }; lg.innerHTML = ""; draw(); log(lg, "Prêt. Chaque réponse = une nouvelle notion."); }
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
    function setLive() { if (!live) return; live.textContent = timer ? "démo automatique" : manual ? "mode manuel" : "en pause"; live.classList.toggle("off", !timer); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setLive(); }
    function user(fn) { return function () { if (!manual) { manual = true; stop(); reset(); } fn(); }; }
    $("gRight").addEventListener("click", user(function () { right(1); }));
    $("gRecall").addEventListener("click", user(function () { right(2); }));
    $("gWrong").addEventListener("click", user(wrong));
    $("gReset").addEventListener("click", function () { manual = true; stop(); reset(); });
    reset();
    if (!reduce) NEMO.whileVisible($("gLevel"), function () { if (manual || timer) return; timer = setInterval(function () { var a = script[si++ % script.length]; if (a === 0) wrong(); else right(a); if (si % script.length === 0) reset(); }, 1000); setLive(); }, stop, .4);
    else setLive();
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
        n++; rows.appendChild(h("tr", "", "<td><code>" + t[0] + "</code>" + (t[3] ? ' <span class="pill y" title="À autoriser une fois (Toujours autoriser)">écrit</span>' : "") + "</td><td>" + t[1] + "</td><td>" + t[2] + "</td>"));
      });
      if (!n) rows.appendChild(h("tr", "", '<td colspan="3">Aucun outil ne correspond.</td>'));
      $("toolCount").textContent = n + " outil" + (n > 1 ? "s" : "") + " affiché" + (n > 1 ? "s" : "") + " sur " + NEMO.tools.length + " · « écrit » = outil qui écrit : à autoriser UNE fois (« Toujours autoriser »).";
    }
    var want = param("q"); if (want) { $("toolQ").value = want; q = norm(want); }
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
          (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { cp.textContent = "Copié"; }, function () { cp.textContent = "Sélectionnez puis Ctrl+C"; });
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

  NEMO.initSims = function () { bricks(); home(); planning(); formats(); leitner(); game(); tools(); install(); };
})();
