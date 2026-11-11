/* Racine de la documentation : nouveautés « tous les projets » (js/proj-data.js).
   - mot qui tourne dans l'en-tête, carte orbitale des projets (survol = description, trait = lien réel entre deux projets),
   - grille des projets : filtre par état, recherche, halo qui suit la souris, légère inclinaison,
   - activité récente : barres qui se remplissent à l'apparition,
   - transition « partagée » du titre d'une tuile vers le titre de la page (navigateurs qui la gèrent).
   Tout respecte prefers-reduced-motion : rien ne bouge, tout reste lisible. */
(function () {
  var P = window.PROJ, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function plain(s) { var d = document.createElement("div"); d.innerHTML = s; return d.textContent; }
  var COL = { g: "var(--d-green)", y: "var(--d-yellow)", p: "var(--d-pink)", s: "var(--d-sky)", b: "var(--accent)" };

  /* Nemo est un projet comme les autres sur la racine : sa page est /nemo/, ses 4 dépôts sont détaillés plus bas. */
  var ALL = [{ id: "nemo", n: "Nemo", href: "nemo/", status: "actif", role: "Révision espacée pour un élève : serveur, apps Windows et Android, sessions construites par une IA",
    repoName: "nemo-https + 3", tech: ["Cloudflare Workers", "C# · .NET 9", "Kotlin", "Node 22"], last: "11/11/2026" }]
    .concat(P.list.map(function (q) { return { id: q.id, n: q.n, href: q.id + "/", status: q.status, role: q.role, repoName: q.repo ? q.repo.name : "plusieurs dépôts", tech: q.tech, last: q.last }; }));
  var DATE = function (s) { var m = /(\d+)\/(\d+)\/(\d+)/.exec(s); return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : 0; };
  var NOW = Math.max.apply(null, ALL.map(function (a) { return DATE(a.last); }));

  /* ----- mot qui tourne ----- */
  var rotor = $("rotor");
  if (rotor && !reduce) {
    var names = ALL.map(function (a) { return a.n; }), i = 0;
    setInterval(function () {
      rotor.classList.add("out");
      setTimeout(function () { i = (i + 1) % names.length; rotor.textContent = names[i]; rotor.classList.remove("out"); }, 280);
    }, 2200);
  }

  /* ----- carte orbitale ----- */
  var orbit = $("orbit");
  if (orbit) {
    var ORDER = ["nemo", "agent-hub", "prisme", "cppt", "wikicards", "py2x", "outils", "multi", "garry"];
    var LINKS = [["nemo", "agent-hub", "agent-hub délègue à Codex le code de Nemo et des autres projets"], ["garry", "multi", "Garry doit fournir les bots de jeux de plateau à multi"], ["py2x", "outils", "py2x contient la démonstration mindmap_portable"]];
    var byId = {}; ALL.forEach(function (a) { byId[a.id] = a; });
    var N = ORDER.length, R = 168, C = 230, pos = {};
    ORDER.forEach(function (id, k) { var ang = -Math.PI / 2 + k * 2 * Math.PI / N; pos[id] = { x: C + R * Math.cos(ang), y: C + R * Math.sin(ang) }; });
    var svg = '<svg viewBox="0 0 460 460" aria-hidden="false"><circle class="o-ring" cx="230" cy="230" r="' + R + '"></circle>';
    ORDER.forEach(function (id) { svg += '<line class="o-spoke" x1="230" y1="230" x2="' + pos[id].x.toFixed(1) + '" y2="' + pos[id].y.toFixed(1) + '"></line>'; });
    LINKS.forEach(function (l, k) { svg += '<line class="o-link" data-a="' + l[0] + '" data-b="' + l[1] + '" x1="' + pos[l[0]].x.toFixed(1) + '" y1="' + pos[l[0]].y.toFixed(1) + '" x2="' + pos[l[1]].x.toFixed(1) + '" y2="' + pos[l[1]].y.toFixed(1) + '" style="--d:' + (k * .6) + 's"></line>'; });
    svg += '<g class="o-core"><circle cx="230" cy="230" r="44"></circle><text x="230" y="236" text-anchor="middle">Docs</text></g>';
    ORDER.forEach(function (id, k) {
      var a = byId[id], st = P.statuses[a.status];
      svg += '<a class="o-node" href="' + a.href + '" data-id="' + id + '" tabindex="0" aria-label="' + esc(a.n + " : " + a.role) + '" style="--d:' + (k * .35) + 's"><g transform="translate(' + pos[id].x.toFixed(1) + " " + pos[id].y.toFixed(1) + ')">' +
        '<g class="o-float"><circle class="o-dot" r="27" style="stroke:' + COL[st.cls] + '"></circle><text class="o-ini" text-anchor="middle" dy="6">' + esc(a.n.charAt(0).toUpperCase()) + '</text><text class="o-lab" text-anchor="middle" y="46">' + esc(a.n.replace(/ \(.*/, "")) + "</text></g></g></a>";
    });
    orbit.innerHTML = svg + "</svg>";
    var cap = $("orbitCap"), defCap = cap.textContent, nodes = [].slice.call(orbit.querySelectorAll(".o-node")), links = [].slice.call(orbit.querySelectorAll(".o-link"));
    function focus(id) {
      orbit.classList.toggle("hov", !!id);
      nodes.forEach(function (n) { n.classList.toggle("on", n.getAttribute("data-id") === id); });
      var related = {};
      links.forEach(function (l) { var on = id && (l.getAttribute("data-a") === id || l.getAttribute("data-b") === id); l.classList.toggle("on", !!on); if (on) { related[l.getAttribute("data-a")] = related[l.getAttribute("data-b")] = 1; } });
      nodes.forEach(function (n) { if (related[n.getAttribute("data-id")]) n.classList.add("rel"); else n.classList.remove("rel"); });
      if (!id) { cap.textContent = defCap; return; }
      var a = byId[id], extra = LINKS.filter(function (l) { return l[0] === id || l[1] === id; }).map(function (l) { return l[2]; })[0];
      cap.innerHTML = "<b>" + esc(a.n) + "</b> — " + esc(a.role) + (extra ? ". <em>" + esc(extra) + ".</em>" : "");
    }
    nodes.forEach(function (n) {
      var id = n.getAttribute("data-id");
      n.addEventListener("mouseenter", function () { focus(id); }); n.addEventListener("mouseleave", function () { focus(null); });
      n.addEventListener("focus", function () { focus(id); }); n.addEventListener("blur", function () { focus(null); });
    });
  }

  /* ----- grille des projets ----- */
  var grid = $("pjgrid"), q = "", stF = "Tous";
  var chipBox = $("pstat"), inp = $("pq");
  var counts = {}; ALL.forEach(function (a) { counts[a.status] = (counts[a.status] || 0) + 1; });
  var states = ["Tous"].concat(Object.keys(P.statuses).filter(function (k) { return counts[k]; }));
  states.forEach(function (k, ix) {
    var label = k === "Tous" ? "Tous (" + ALL.length + ")" : P.statuses[k].t + " (" + counts[k] + ")";
    var b = h("button", "chip", esc(label)); b.type = "button"; b.setAttribute("aria-pressed", ix === 0);
    b.addEventListener("click", function () { [].forEach.call(chipBox.children, function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); stF = k; draw(true); });
    chipBox.appendChild(b);
  });
  inp.addEventListener("input", function () { q = norm(inp.value); draw(true); });
  function draw(anim) {
    grid.innerHTML = ""; var n = 0;
    ALL.forEach(function (a) {
      if (stF !== "Tous" && a.status !== stF) return;
      if (q && norm(a.n + " " + a.role + " " + a.tech.join(" ") + " " + a.repoName + " " + a.status).indexOf(q) < 0) return;
      var st = P.statuses[a.status];
      var t = h("a", "pj-tile spot" + (anim && !reduce ? " pre" : ""), '<span class="glow" aria-hidden="true"></span><div class="top"><span class="pill ' + st.cls + '">' + st.t + '</span><span class="cap" style="margin:0">' + esc(a.repoName) + "</span></div><h3>" + esc(a.n) + "</h3><p>" + esc(a.role) + "</p><small>" + esc(a.tech.slice(0, 3).join(" · ")) + " · " + esc(a.last) + "</small>");
      t.href = a.href; t.style.setProperty("--dl", Math.min(n, 10) * 50 + "ms");
      t.addEventListener("click", function () { var h3 = t.querySelector("h3"); h3.style.viewTransitionName = "pj-title"; });
      grid.appendChild(t); n++;
    });
    if (!n) grid.appendChild(h("div", "noresult", "Aucun projet ne correspond."));
    $("pcount").textContent = n + " projet" + (n > 1 ? "s" : "") + " sur " + ALL.length;
    if (anim && !reduce) requestAnimationFrame(function () { requestAnimationFrame(function () { grid.querySelectorAll(".pj-tile.pre").forEach(function (e) { e.classList.remove("pre"); }); }); });
    else grid.querySelectorAll(".pj-tile").forEach(function (e) { e.classList.add("in"); });
  }
  draw(false);
  /* halo + inclinaison */
  grid.addEventListener("pointermove", function (e) {
    var t = e.target.closest && e.target.closest(".pj-tile"); if (!t || reduce || e.pointerType === "touch") return;
    var r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    t.style.setProperty("--mx", x + "px"); t.style.setProperty("--my", y + "px");
    t.style.setProperty("--rx", ((y / r.height - .5) * -5).toFixed(2) + "deg"); t.style.setProperty("--ry", ((x / r.width - .5) * 6).toFixed(2) + "deg");
  });
  grid.addEventListener("pointerout", function (e) { var t = e.target.closest && e.target.closest(".pj-tile"); if (t) { t.style.setProperty("--rx", "0deg"); t.style.setProperty("--ry", "0deg"); } });

  /* ----- activité récente ----- */
  var act = $("act");
  var sorted = ALL.slice().sort(function (a, b) { return DATE(b.last) - DATE(a.last); });
  var span = Math.max(1, NOW - Math.min.apply(null, ALL.map(function (a) { return DATE(a.last); })));
  act.innerHTML = sorted.map(function (a) {
    var d = DATE(a.last), days = Math.round((NOW - d) / 864e5), w = 14 + 86 * (1 - (NOW - d) / span), st = P.statuses[a.status];
    return '<a class="act-row" href="' + a.href + '"><b>' + esc(a.n) + '</b><span class="act-bar"><i style="--w:' + w.toFixed(1) + "%;background:" + COL[st.cls] + '"></i></span><em>' + esc(a.last) + (days ? " · il y a " + days + " j" : " · aujourd'hui") + "</em></a>";
  }).join("");
  function fill() { act.classList.add("go"); }
  if ("IntersectionObserver" in window && !reduce) { var io0 = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { fill(); io0.disconnect(); } }, { threshold: .25 }); io0.observe(act); } else fill();

  /* ----- apparitions (tuiles et lignes créées ici) ----- */
  var late = [].slice.call(document.querySelectorAll("#pjgrid .pj-tile"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .1, rootMargin: "0px 0px -30px 0px" });
    late.forEach(function (n) { io.observe(n); });
    new MutationObserver(function () { [].forEach.call(grid.querySelectorAll(".pj-tile:not(.in)"), function (n) { io.observe(n); }); }).observe(grid, { childList: true });
  } else late.forEach(function (n) { n.classList.add("in"); });
})();
