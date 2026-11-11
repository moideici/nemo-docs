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
  function text(parent, x, y, str, cls, size, anchor, weight) {
    var t = el("text", { x: x, y: y, class: cls, "font-size": size, "text-anchor": anchor || "start" }, parent);
    if (weight) t.setAttribute("font-weight", weight);
    t.textContent = str;
    return t;
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

  /* ================= ARCHITECTURE ================= */
  function initArch() {
    var svg = document.getElementById("arch"); if (!svg) return;
    var info = document.getElementById("archInfo");
    var defs = el("defs", {}, svg);
    var mk = el("marker", { id: "ah", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--ink)" }, mk);

    var byId = {}; NEMO.nodes.forEach(function (n) { byId[n.id] = n; });
    var gEdges = el("g", {}, svg), gNodes = el("g", {}, svg), gPk = el("g", { "pointer-events": "none" }, svg);
    var edgeEls = {}, nodeEls = {}, selected = null;

    NEMO.edges.forEach(function (e) {
      var g = el("g", { class: "edge-g", "data-layer": e.layer, tabindex: 0, role: "button", "aria-label": e.title }, gEdges);
      var p = el("path", { id: "p-" + e.id, d: e.d, class: "edge" + (e.layer === "ship" ? " dash" : ""), "marker-end": "url(#ah)" }, g);
      if (e.both) p.setAttribute("marker-start", "url(#ah)");
      el("path", { d: e.d, class: "edge-hit" }, g);
      if (e.label) {
        var nums = e.d.match(/-?\d+(\.\d+)?/g).map(Number);
        var mx = (nums[0] + nums[nums.length - 2]) / 2, my = (nums[1] + nums[nums.length - 1]) / 2;
        var w = e.label.length * 6.6 + 14;
        el("rect", { x: mx - w / 2, y: my - 11, width: w, height: 20, rx: 10, class: "tagbg" }, g);
        text(g, mx, my + 4, e.label, "svg-m", 11, "middle");
      }
      function pick() { select("e", e, g); }
      g.addEventListener("click", pick);
      g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(); } });
      edgeEls[e.id] = g;
      if (!reduce) {
        [0, 1].forEach(function (k) {
          if (k && !e.both) return;
          var c = el("circle", { r: 5, fill: k ? "var(--blue)" : "var(--coral)", class: "pkt", "data-layer": e.layer, "data-edge": e.id }, gPk);
          var am = el("animateMotion", { dur: (2.6 + (e.id.charCodeAt(1) % 3) * .5) + "s", repeatCount: "indefinite", begin: (k * 1.3) + "s" }, c);
          if (k) { am.setAttribute("keyPoints", "1;0"); am.setAttribute("keyTimes", "0;1"); am.setAttribute("calcMode", "linear"); }
          var mp = el("mpath", {}, am); mp.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#p-" + e.id); mp.setAttribute("href", "#p-" + e.id);
        });
      }
    });

    NEMO.nodes.forEach(function (n) {
      var g = el("g", { class: "node", tabindex: 0, role: "button", "aria-label": n.title }, gNodes);
      el("rect", { class: "shadow", x: n.x + 4, y: n.y + 4, width: n.w, height: n.h, rx: 14 }, g);
      var f = el("g", { class: "face" }, g);
      el("rect", { class: "box", x: n.x, y: n.y, width: n.w, height: n.h, rx: 14, fill: n.fill }, f);
      if (n.big) {
        text(f, n.x + n.w / 2, n.y + 38, n.t, "svg-h", 26, "middle");
        text(f, n.x + n.w / 2, n.y + 60, n.s, "svg-t", 14, "middle").setAttribute("fill", "var(--fluo-ink)");
        var chips = ["API", "MCP", "Site", "R2", "Durable Obj.", "Cron/Planning"], cx = n.x + 16, cy = n.y + 84, row = 0;
        chips = ["Planning", "Cours (R2)", "Exercices", "Résultats", "MCP /mcp", "Phiby (IA)", "Créneaux", "Jeu (XP)"];
        chips.forEach(function (c) {
          var w = c.length * 7 + 18;
          if (cx + w > n.x + n.w - 12) { cx = n.x + 16; cy += 34; }
          el("rect", { x: cx, y: cy, width: w, height: 26, rx: 13, fill: "var(--card)", stroke: "var(--ink)", "stroke-width": 1.8 }, f);
          text(f, cx + w / 2, cy + 17.5, c, "svg-t", 12.5, "middle").setAttribute("fill", "var(--ink)");
          cx += w + 8;
        });
        cy += 44;
        text(f, n.x + n.w / 2, cy + 8, "source de vérité", "svg-m", 12, "middle").setAttribute("fill", "var(--fluo-ink)");
      } else {
        text(f, n.x + n.w / 2, n.y + n.h / 2 - 2, n.t, "svg-h", 20, "middle");
        text(f, n.x + n.w / 2, n.y + n.h / 2 + 20, n.s, "svg-t", 12.5, "middle").setAttribute("fill", "var(--fluo-ink)");
      }
      function pick() { select("n", n, g); }
      g.addEventListener("click", pick);
      g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(); } });
      nodeEls[n.id] = g;
    });

    function select(kind, d, g) {
      if (selected) selected.classList.remove("sel");
      selected = g; g.classList.add("sel");
      showInfo(info, d);
    }

    function setLayer(id) {
      NEMO.edges.forEach(function (e) {
        var on = id === "all" || e.layer === id;
        edgeEls[e.id].classList.toggle("off", !on);
      });
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
    showInfo(info, { title: "Clique un bloc ou un lien", text: "Chaque élément du schéma explique son rôle ici. Les points qui circulent montrent le sens des échanges ; les traits en pointillés sont les livraisons par la CI." });
  }

  /* ================= SÉQUENCE ================= */
  function initSeq() {
    var svg = document.getElementById("seq"); if (!svg) return;
    var info = document.getElementById("seqInfo"), count = document.getElementById("seqCount");
    var defs = el("defs", {}, svg);
    var mk = el("marker", { id: "sah", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: "auto" }, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--ink)" }, mk);
    var X0 = 100, DX = 190, TOP = 100, DY = 40;
    var xs = {};
    NEMO.actors.forEach(function (a, i) {
      var x = X0 + i * DX; xs[a.id] = x;
      var g = el("g", { class: "actor" }, svg);
      el("line", { class: "life", x1: x, y1: 74, x2: x, y2: 548 }, g);
      el("rect", { x: x + 3, y: 14 + 3, width: 140, height: 56, rx: 12, fill: "var(--ink)" }, g).setAttribute("transform", "translate(-70,0)");
      var r = el("rect", { x: x, y: 14, width: 140, height: 56, rx: 12, class: "head" }, g); r.setAttribute("transform", "translate(-70,0)"); r.setAttribute("fill", a.fill);
      text(g, x, 38, a.t, "svg-h", 18, "middle");
      text(g, x, 58, a.s, "svg-t", 11.5, "middle").setAttribute("fill", "var(--fluo-ink)");
    });
    var arrows = NEMO.steps.map(function (s, i) {
      var y = TOP + i * DY + 14, g = el("g", { class: "arrow" }, svg), x1 = xs[s.from], x2 = xs[s.to], lx;
      if (s.from === s.to) {
        el("path", { d: "M" + x1 + "," + (y - 12) + " h46 v24 h-44", "marker-end": "url(#sah)" }, g);
        lx = x1 + 90; var w0 = s.label.length * 6.4 + 16;
        el("rect", { x: lx - 8, y: y - 11, width: w0, height: 22, rx: 11, class: "tagbg" }, g);
        text(g, lx, y + 4, s.label, "svg-t", 12.5);
      } else {
        el("line", { x1: x1, y1: y, x2: x2, y2: y, "marker-end": "url(#sah)" }, g);
        lx = (x1 + x2) / 2; var w = s.label.length * 6.6 + 18;
        el("rect", { x: lx - w / 2, y: y - 28, width: w, height: 22, rx: 11, class: "tagbg" }, g);
        text(g, lx, y - 13, s.label, "svg-t", 12.5, "middle");
        var dot = el("circle", { r: 6, cx: x1, cy: y, fill: "var(--coral)", stroke: "var(--ink)", "stroke-width": 2, class: "dot", opacity: 0 }, g);
        g._dot = dot; g._x = [x1, x2];
      }
      var n = el("circle", { cx: 26, cy: y - 5, r: 12, fill: "var(--yellow)", stroke: "var(--ink)", "stroke-width": 2 }, g);
      text(g, 26, y - 0.5, i + 1, "svg-h", 12, "middle");
      return g;
    });
    var cur = -1, timer = null;
    function render() {
      arrows.forEach(function (g, i) {
        g.classList.toggle("shown", i <= cur); g.classList.toggle("now", i === cur);
        if (g._dot) {
          g._dot.setAttribute("opacity", i === cur ? 1 : 0);
          if (i === cur && !reduce) {
            g._dot.setAttribute("cx", g._x[0]);
            var t0 = performance.now(), dur = 700, a = g._x[0], b = g._x[1];
            (function step(t) {
              var k = Math.min(1, (t - t0) / dur); g._dot.setAttribute("cx", a + (b - a) * k);
              if (k < 1 && cur === i) requestAnimationFrame(step);
            })(t0);
          }
        }
      });
      count.textContent = cur < 0 ? "Prêt · " + NEMO.steps.length + " étapes" : "Étape " + (cur + 1) + " / " + NEMO.steps.length;
      if (cur < 0) showInfo(info, { title: "Appuie sur Suivant", text: "Le PC va lire le planning, réclamer le créneau, faire construire la session, puis se libérer à la fin. Le téléphone suit sans rien générer." });
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
      var r = svg.getBoundingClientRect();
      if (e.target.matches && e.target.matches("input, textarea")) return;
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
    var defs = el("defs", {}, svg);
    var mk = el("marker", { id: "lah", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: "auto" }, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--ink)" }, mk);
    var W = 150, H = 80, GAP = 40, X0 = 24, Y = 70, sel = null, els = [];
    NEMO.lock.forEach(function (s, i) {
      var x = X0 + i * (W + GAP);
      if (i < NEMO.lock.length - 1) {
        var a = el("path", { d: "M" + (x + W) + "," + (Y + H / 2) + " h" + GAP, class: "edge dash", "marker-end": "url(#lah)" }, svg);
        a.setAttribute("stroke-dasharray", "6 5");
      }
      var g = el("g", { class: "node", tabindex: 0, role: "button", "aria-label": s.title }, svg);
      el("rect", { class: "shadow", x: x + 4, y: Y + 4, width: W, height: H, rx: 14 }, g);
      var f = el("g", { class: "face" }, g);
      el("rect", { class: "box", x: x, y: Y, width: W, height: H, rx: 14, fill: s.fill }, f);
      text(f, x + W / 2, Y + 36, s.t, "svg-h", 20, "middle");
      text(f, x + W / 2, Y + 58, "état " + (i + 1), "svg-m", 11.5, "middle").setAttribute("fill", "var(--fluo-ink)");
      function pick() { if (sel) sel.classList.remove("sel"); sel = g; g.classList.add("sel"); showInfo(info, s); }
      g.addEventListener("click", pick);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      els.push(g);
    });
    // retour à « Libre »
    var last = X0 + 4 * (W + GAP) + W / 2, first = X0 + W / 2;
    el("path", { d: "M" + last + "," + (Y + H) + " v38 H" + first + " v-38", class: "edge dash", "marker-end": "url(#lah)", fill: "none" }, svg);
    var lw = 200;
    el("rect", { x: (first + last) / 2 - lw / 2, y: Y + H + 25, width: lw, height: 24, rx: 12, class: "tagbg" }, svg);
    text(svg, (first + last) / 2, Y + H + 42, "créneau fini · bilan lu", "svg-t", 13, "middle");
    // sorties
    var ex = el("g", {}, svg);
    el("rect", { x: 24, y: 232, width: 912, height: 44, rx: 12, fill: "none", stroke: "var(--ink)", "stroke-width": 2, "stroke-dasharray": "6 5" }, ex);
    text(ex, 480, 260, "Sorties à tout moment : fin du créneau · pause (elle a une fin) · verrouillage désactivé ou suspendu · réviser sans verrou", "svg-t", 14, "middle");
    var t = text(svg, 24, 40, "CLIQUE UN ÉTAT", "svg-m", 12); t.setAttribute("letter-spacing", "1.5");
    showInfo(info, { title: "Les 5 états du PC", text: "De « Libre » à « Bilan », puis retour à « Libre ». Clique pour lire ce que fait Nemo à chaque étape, et comment le verrou peut tomber." });
  }

  NEMO.initDiagrams = function () { initArch(); initSeq(); initLock(); };
})();
