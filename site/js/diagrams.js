/* Schémas SVG interactifs : architecture, séquence d'une session, machine à états du verrou. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function text(parent, x, y, str, cls, size, anchor) {
    var t = el("text", { x: x, y: y, class: cls, "font-size": size, "text-anchor": anchor || "start" }, parent);
    t.textContent = str;
    return t;
  }
  // « var(--sky) » → « var(--d-sky) » : la teinte franche du point de couleur
  function dotColor(fill) { return /--card/.test(fill) ? "var(--edge)" : fill.replace("(--", "(--d-"); }
  function marker(defs, id) {
    var m = el("marker", { id: id, viewBox: "0 0 10 10", refX: 8.5, refY: 5, markerWidth: 6.5, markerHeight: 6.5, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M1,1 L9,5 L1,9", fill: "none", stroke: "context-stroke", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, m);
  }
  function showInfo(box, d) {
    box.innerHTML = "";
    var h = document.createElement("h3"); h.textContent = d.title; box.appendChild(h);
    var p = document.createElement("p"); p.textContent = d.text; p.style.margin = "0"; box.appendChild(p);
    if (d.meta && d.meta.length) {
      var m = document.createElement("div"); m.className = "meta";
      d.meta.forEach(function (x) { var s = document.createElement("span"); s.className = "pill"; s.textContent = x; m.appendChild(s); });
      box.appendChild(m);
    }
    if (d.exits) { var e = document.createElement("p"); e.style.margin = "10px 0 0"; e.innerHTML = "<b>Sortie :</b> "; e.appendChild(document.createTextNode(d.exits)); box.appendChild(e); }
  }
  function keyActivate(g, fn) { g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fn(); } }); }

  /* ================= ARCHITECTURE ================= */
  function initArch() {
    var svg = document.getElementById("arch"); if (!svg) return;
    var info = document.getElementById("archInfo");
    marker(el("defs", {}, svg), "ah");
    var gPk = el("g", { "pointer-events": "none" }, svg), gEdges = el("g", {}, svg), gNodes = el("g", {}, svg);
    var edgeEls = {}, nodeEls = {}, selected = null;

    NEMO.edges.forEach(function (e) {
      var g = el("g", { class: "edge-g", "data-layer": e.layer, tabindex: 0, role: "button", "aria-label": e.title }, gEdges);
      var p = el("path", { id: "p-" + e.id, d: e.d, class: "edge" + (e.layer === "ship" ? " dash" : ""), "marker-end": "url(#ah)" }, g);
      if (e.both) p.setAttribute("marker-start", "url(#ah)");
      el("path", { d: e.d, class: "edge-hit" }, g);
      if (e.label) {
        var nums = e.d.match(/-?\d+(\.\d+)?/g).map(Number);
        var mx = (nums[0] + nums[nums.length - 2]) / 2, my = (nums[1] + nums[nums.length - 1]) / 2;
        var w = e.label.length * 6.4 + 16;
        el("rect", { x: mx - w / 2, y: my - 10, width: w, height: 20, rx: 10, class: "tagbg" }, g);
        text(g, mx, my + 3.5, e.label, "svg-m", 10.5, "middle");
      }
      function pick() { select(e, g); }
      g.addEventListener("click", pick); keyActivate(g, pick);
      edgeEls[e.id] = g;
      if (!reduce) {
        [0, 1].forEach(function (k) {
          if (k && !e.both) return;
          var c = el("circle", { r: 3.5, class: "pkt", "data-layer": e.layer }, gPk);
          if (k) c.setAttribute("opacity", ".55");
          var am = el("animateMotion", { dur: (2.8 + (e.id.charCodeAt(1) % 3) * .5) + "s", repeatCount: "indefinite", begin: (k * 1.4) + "s" }, c);
          if (k) { am.setAttribute("keyPoints", "1;0"); am.setAttribute("keyTimes", "0;1"); am.setAttribute("calcMode", "linear"); }
          var mp = el("mpath", {}, am); mp.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#p-" + e.id); mp.setAttribute("href", "#p-" + e.id);
        });
      }
    });

    NEMO.nodes.forEach(function (n) {
      var g = el("g", { class: "node", tabindex: 0, role: "button", "aria-label": n.title }, gNodes);
      var f = el("g", { class: "face" }, g);
      el("rect", { class: "box" + (n.big ? " hl" : ""), x: n.x, y: n.y, width: n.w, height: n.h, rx: n.big ? 14 : 10 }, f);
      if (n.big) {
        el("circle", { cx: n.x + 24, cy: n.y + 32, r: 5, fill: "var(--accent)" }, f);
        text(f, n.x + 38, n.y + 38, n.t, "svg-h", 19);
        text(f, n.x + 24, n.y + 62, n.s, "svg-t", 12.5).setAttribute("fill", "var(--mute)");
        var chips = ["Planning", "Cours (R2)", "Exercices", "Résultats", "MCP /mcp", "Phiby (IA)", "Créneaux", "Jeu (XP)"], cx = n.x + 24, cy = n.y + 86;
        chips.forEach(function (c) {
          var w = c.length * 6.8 + 20;
          if (cx + w > n.x + n.w - 18) { cx = n.x + 24; cy += 34; }
          el("rect", { x: cx, y: cy, width: w, height: 25, rx: 8, class: "chip-s" }, f);
          text(f, cx + w / 2, cy + 16.5, c, "svg-t", 12, "middle");
          cx += w + 8;
        });
      } else {
        el("circle", { cx: n.x + 20, cy: n.y + 25, r: 4.5, fill: dotColor(n.fill) }, f);
        text(f, n.x + 33, n.y + 30, n.t, "svg-h", 15);
        text(f, n.x + 20, n.y + n.h - 17, n.s, "svg-t", 12).setAttribute("fill", "var(--mute)");
      }
      function pick() { select(n, g); }
      g.addEventListener("click", pick); keyActivate(g, pick);
      nodeEls[n.id] = g;
    });

    function select(d, g) {
      if (selected) selected.classList.remove("sel");
      selected = g; g.classList.add("sel");
      showInfo(info, d);
    }
    function setLayer(id) {
      NEMO.edges.forEach(function (e) { edgeEls[e.id].classList.toggle("off", !(id === "all" || e.layer === id)); });
      svg.querySelectorAll(".pkt").forEach(function (c) { c.style.display = (id === "all" || c.getAttribute("data-layer") === id) ? "" : "none"; });
      NEMO.nodes.forEach(function (n) {
        var touched = id === "all" || NEMO.edges.some(function (e) { return e.layer === id && (e.from === n.id || e.to === n.id); });
        nodeEls[n.id].classList.toggle("off", !touched);
      });
    }
    var bar = document.getElementById("layers");
    NEMO.layers.forEach(function (l) {
      var b = document.createElement("button"); b.className = "chip"; b.textContent = l.label; b.setAttribute("aria-pressed", l.id === "all");
      b.addEventListener("click", function () {
        bar.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true"); setLayer(l.id);
      });
      bar.appendChild(b);
    });
    showInfo(info, { title: "Sélectionnez un bloc ou un lien", text: "Chaque élément du schéma est décrit ici. Les points qui circulent indiquent le sens des échanges ; les traits en pointillés sont les livraisons par la CI." });
  }

  /* ================= SÉQUENCE ================= */
  function initSeq() {
    var svg = document.getElementById("seq"); if (!svg) return;
    var info = document.getElementById("seqInfo"), count = document.getElementById("seqCount");
    marker(el("defs", {}, svg), "sah");
    var X0 = 100, DX = 190, TOP = 100, DY = 40, xs = {};
    NEMO.actors.forEach(function (a, i) {
      var x = X0 + i * DX; xs[a.id] = x;
      var g = el("g", { class: "actor" }, svg);
      el("line", { class: "life", x1: x, y1: 70, x2: x, y2: 548 }, g);
      el("rect", { x: x - 70, y: 14, width: 140, height: 52, rx: 10, class: "head" }, g);
      el("circle", { cx: x - 54, cy: 31, r: 4, fill: dotColor(a.fill) }, g);
      text(g, x - 44, 35, a.t, "svg-h", 14);
      text(g, x - 54, 55, a.s, "svg-m", 10.5);
    });
    var arrows = NEMO.steps.map(function (s, i) {
      var y = TOP + i * DY + 14, g = el("g", { class: "arrow" }, svg), x1 = xs[s.from], x2 = xs[s.to], lx;
      if (s.from === s.to) {
        el("path", { d: "M" + x1 + "," + (y - 12) + " h46 v24 h-44", "marker-end": "url(#sah)" }, g);
        lx = x1 + 90; var w0 = s.label.length * 6.2 + 18;
        el("rect", { x: lx - 8, y: y - 11, width: w0, height: 22, rx: 11, class: "tagbg" }, g);
        text(g, lx, y + 4, s.label, "svg-t", 12);
      } else {
        el("line", { x1: x1, y1: y, x2: x2, y2: y, "marker-end": "url(#sah)" }, g);
        lx = (x1 + x2) / 2; var w = s.label.length * 6.4 + 20;
        el("rect", { x: lx - w / 2, y: y - 28, width: w, height: 22, rx: 11, class: "tagbg" }, g);
        text(g, lx, y - 13, s.label, "svg-t", 12, "middle");
        g._dot = el("circle", { r: 4.5, cx: x1, cy: y, fill: "var(--accent)", opacity: 0 }, g); g._x = [x1, x2];
      }
      el("circle", { cx: 26, cy: y - 5, r: 11, class: "nbub" }, g);
      text(g, 26, y - 1.5, i + 1, "svg-m nnum", 10.5, "middle");
      return g;
    });
    var cur = -1, timer = null;
    function render() {
      arrows.forEach(function (g, i) {
        g.classList.toggle("shown", i <= cur); g.classList.toggle("now", i === cur);
        if (g._dot) {
          g._dot.setAttribute("opacity", i === cur ? 1 : 0);
          if (i === cur && !reduce) {
            var t0 = performance.now(), dur = 700, a = g._x[0], b = g._x[1];
            (function step(t) {
              var k = Math.min(1, (t - t0) / dur); g._dot.setAttribute("cx", a + (b - a) * k);
              if (k < 1 && cur === i) requestAnimationFrame(step);
            })(t0);
          }
        }
      });
      count.textContent = cur < 0 ? "Prêt · " + NEMO.steps.length + " étapes" : "Étape " + (cur + 1) + " / " + NEMO.steps.length;
      if (cur < 0) showInfo(info, { title: "Appuyez sur Suivant", text: "Le PC lit le planning, réclame le créneau, fait construire la session, puis se libère à la fin. Le téléphone suit sans rien générer." });
      else showInfo(info, NEMO.steps[cur]);
      document.getElementById("seqPrev").disabled = cur < 0;
      document.getElementById("seqNext").disabled = cur >= NEMO.steps.length - 1;
    }
    function go(d) { cur = Math.max(-1, Math.min(NEMO.steps.length - 1, cur + d)); render(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; document.getElementById("seqPlay").textContent = "▶ Lecture"; } }
    document.getElementById("seqNext").addEventListener("click", function () { stop(); go(1); });
    document.getElementById("seqPrev").addEventListener("click", function () { stop(); go(-1); });
    document.getElementById("seqReset").addEventListener("click", function () { stop(); cur = -1; render(); });
    document.getElementById("seqPlay").addEventListener("click", function () {
      if (timer) { stop(); return; }
      if (cur >= NEMO.steps.length - 1) cur = -1;
      document.getElementById("seqPlay").textContent = "❚❚ Pause";
      go(1);
      timer = setInterval(function () { if (cur >= NEMO.steps.length - 1) stop(); else go(1); }, 2600);
    });
    document.addEventListener("keydown", function (e) {
      if (e.target.matches && e.target.matches("input, textarea")) return;
      var r = svg.getBoundingClientRect();
      if (r.top < innerHeight * .8 && r.bottom > innerHeight * .2) {
        if (e.key === "ArrowRight") { stop(); go(1); } else if (e.key === "ArrowLeft") { stop(); go(-1); }
      }
    });
    render();
  }

  /* ================= VERROU ================= */
  function initLock() {
    var svg = document.getElementById("lock"); if (!svg) return;
    var info = document.getElementById("lockInfo");
    marker(el("defs", {}, svg), "lah");
    var W = 150, H = 76, GAP = 40, X0 = 24, Y = 66, sel = null;
    text(svg, 24, 36, "ÉTATS DU PC · SÉLECTIONNEZ-EN UN", "svg-m", 11).setAttribute("letter-spacing", "1.2");
    NEMO.lock.forEach(function (s, i) {
      var x = X0 + i * (W + GAP);
      if (i < NEMO.lock.length - 1) el("path", { d: "M" + (x + W + 2) + "," + (Y + H / 2) + " h" + (GAP - 4), class: "edge dash", "marker-end": "url(#lah)" }, svg);
      var g = el("g", { class: "node", tabindex: 0, role: "button", "aria-label": s.title }, svg);
      var f = el("g", { class: "face" }, g);
      el("rect", { class: "box", x: x, y: Y, width: W, height: H, rx: 10 }, f);
      el("circle", { cx: x + 20, cy: Y + 26, r: 4.5, fill: dotColor(s.fill) }, f);
      text(f, x + 33, Y + 31, s.t, "svg-h", 15);
      text(f, x + 20, Y + H - 16, "état " + (i + 1), "svg-m", 10.5);
      function pick() { if (sel) sel.classList.remove("sel"); sel = g; g.classList.add("sel"); showInfo(info, s); }
      g.addEventListener("click", pick); keyActivate(g, pick);
    });
    var last = X0 + 4 * (W + GAP) + W / 2, first = X0 + W / 2;
    el("path", { d: "M" + last + "," + (Y + H + 2) + " v34 H" + first + " v-32", class: "edge dash", fill: "none", "marker-end": "url(#lah)" }, svg);
    var lw = 190, mid = (first + last) / 2;
    el("rect", { x: mid - lw / 2, y: Y + H + 24, width: lw, height: 24, rx: 12, class: "tagbg" }, svg);
    text(svg, mid, Y + H + 40, "créneau fini · bilan lu", "svg-t", 12, "middle");
    el("rect", { x: 24, y: 220, width: 912, height: 48, rx: 12, fill: "var(--bg2)", stroke: "var(--line)", "stroke-width": 1 }, svg);
    text(svg, 480, 249, "Sorties à tout moment : fin du créneau · pause (elle a une fin) · verrouillage désactivé ou suspendu · réviser sans verrou", "svg-t", 13, "middle").setAttribute("fill", "var(--mute)");
    showInfo(info, { title: "Les 5 états du PC", text: "De « Libre » à « Bilan », puis retour à « Libre ». Sélectionnez un état pour voir ce que fait Nemo et comment le verrou peut tomber." });
  }

  NEMO.initDiagrams = function () { initArch(); initSeq(); initLock(); };
})();
