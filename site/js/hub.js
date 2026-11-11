/* Racine de la documentation : synthèse de tous les documents (statuts, projets, filtres, parcours). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var reduce = NEMO.reduce, H = HUB;
  function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var SC = {}; H.statuses.forEach(function (s) { SC[s.id] = s; });
  var COL = { g: "var(--d-green)", y: "var(--d-yellow)", p: "var(--d-pink)", s: "var(--d-sky)", b: "var(--accent)" };
  function count(filter) { return H.docs.filter(filter).length; }
  var byStatus = {}; H.statuses.forEach(function (s) { byStatus[s.id] = count(function (d) { return d.s === s.id; }); });
  var total = H.docs.length;

  /* ----- navigation / pied de page / thème ----- */
  $("nav").innerHTML = '<div class="wrap"><a class="logo" href="./" aria-label="Documentation, accueil"><i></i>Docs</a>' +
    '<nav class="links" aria-label="Sections"><a href="#projets">Projets</a><a href="#activite">Activité</a><a href="#nemo">Nemo</a><a href="#parcours">Parcours</a></nav>' +
    '<div class="tools"><button class="ico search" data-pal type="button" aria-label="Rechercher (Ctrl+K)">⌕ <span>Rechercher</span> <kbd>Ctrl K</kbd></button><a class="btn small" href="nemo/">Documentation Nemo</a><button class="ico" id="theme" aria-label="Changer de thème">◐</button></div></div>';
  $("footer").innerHTML = '<div class="wrap"><div><a class="logo" href="./"><i></i>Docs</a><p class="cap" style="margin:10px 0 0">Racine de la documentation · site mis à jour le ' + H.siteUpdated + ' · statuts de Nemo des index du ' + H.updated + '</p></div>' +
    '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:14px"><a href="nemo/">Nemo</a>' + PROJ.list.map(function (q) { return '<a href="' + q.id + '/">' + q.n + "</a>"; }).join("") + "</div></div>";
  function isDark() { var t = document.documentElement.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
  function paintMeta() { var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = isDark() ? "#0A0C10" : "#FFFFFF"; }
  $("theme").addEventListener("click", function () { var t = isDark() ? "light" : "dark"; document.documentElement.dataset.theme = t; try { localStorage.setItem("nemo-theme", t); } catch (e) {} paintMeta(); });
  paintMeta();

  /* ----- progression + section active ----- */
  var bar = $("progress"), top = $("toTop"), links = [].slice.call(document.querySelectorAll(".links a"));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function onScroll() {
    var d = document.documentElement, p = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight);
    bar.style.width = (p * 100) + "%"; top.classList.toggle("on", d.scrollTop > 900);
    var cur = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle("on", i === cur); a.style.background = i === cur ? "var(--bg2)" : ""; a.style.color = i === cur ? "var(--ink)" : ""; });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  top.addEventListener("click", function () { scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ----- anneau des statuts ----- */
  var donut = $("donut"), C = 2 * Math.PI * 76;
  (function () {
    var svg = '<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="track" cx="100" cy="100" r="76"></circle>', off = 0, segs = [];
    H.statuses.forEach(function (s) {
      var n = byStatus[s.id]; if (!n) return;
      var len = n / total * C; segs.push({ id: s.id, len: len, off: off });
      svg += '<circle class="seg" data-s="' + s.id + '" cx="100" cy="100" r="76" stroke="' + COL[s.cls] + '" stroke-dasharray="0 ' + C + '" stroke-dashoffset="' + (-off) + '"></circle>';
      off += len;
    });
    donut.innerHTML = svg + '</svg><div class="mid"><b id="dn">0</b><span id="dl">documents</span></div>';
    var els = donut.querySelectorAll(".seg"), lg = $("slegend");
    function focus(id) {
      donut.classList.toggle("hov", !!id);
      els.forEach(function (e) { e.classList.toggle("on", e.getAttribute("data-s") === id); });
      lg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-s") === id); });
      $("dn").textContent = id ? byStatus[id] : total; $("dl").textContent = id ? id : "documents";
    }
    H.statuses.forEach(function (s) {
      if (!byStatus[s.id]) return;
      var b = h("button", "", '<i style="background:' + COL[s.cls] + '"></i>' + s.id + "<em>" + byStatus[s.id] + "</em>"); b.setAttribute("data-s", s.id);
      b.addEventListener("mouseenter", function () { focus(s.id); }); b.addEventListener("mouseleave", function () { focus(null); });
      b.addEventListener("focus", function () { focus(s.id); }); b.addEventListener("blur", function () { focus(null); });
      b.addEventListener("click", function () { setStatus(s.id); document.getElementById("documents").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); });
      lg.appendChild(b);
    });
    els.forEach(function (e) { e.addEventListener("mouseenter", function () { focus(e.getAttribute("data-s")); }); e.addEventListener("mouseleave", function () { focus(null); }); });
    function run() {
      segs.forEach(function (sg, i) { var e = els[i]; setTimeout(function () { e.setAttribute("stroke-dasharray", Math.max(0, sg.len - 3) + " " + C); }, reduce ? 0 : 150 + i * 160); });
      var t0 = performance.now();
      if (reduce) { $("dn").textContent = total; return; }
      (function f(t) { var k = Math.min(1, (t - t0) / 1300); if (!donut.classList.contains("hov")) $("dn").textContent = Math.round(total * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
    }
    NEMO.onVisible(donut, run, .4);
  })();

  /* ----- synthèse en bref ----- */
  var brief = $("brief");
  H.brief.forEach(function (b) {
    var t = b.t.replace("{done}", byStatus["Réalisé"]).replace("{wip}", byStatus["En cours"]), p = b.p.replace("{done}", byStatus["Réalisé"]).replace("{wip}", byStatus["En cours"]).replace("{old}", byStatus["Obsolète"]);
    brief.appendChild(h("div", "bcard", '<div class="cap">' + b.k + "</div><h3>" + esc(t) + "</h3><p>" + esc(p) + "</p>"));
  });

  /* ----- projet Nemo + dépôts ----- */
  var plinks = $("plinks");
  NEMO.pages.filter(function (p) { return p.nav; }).forEach(function (p) { plinks.appendChild(h("a", "", esc(p.t) + "<small>nemo/" + p.href.replace(".html", "") + "</small>")).href = "nemo/" + p.href; });

  var repos = $("repos");
  H.repos.forEach(function (r) {
    var mine = H.docs.filter(function (d) { return d.r === r.id; }), bars = "";
    H.statuses.forEach(function (s) { var n = mine.filter(function (d) { return d.s === s.id; }).length; if (n) bars += '<i style="--w:' + (n / mine.length * 100) + "%;background:" + COL[s.cls] + '" title="' + s.id + " : " + n + '"></i>'; });
    var a = h("a", "repo", "<b>" + r.n + "</b><span>" + esc(r.role) + '</span><div class="bars">' + bars + "</div><small>" + mine.length + " document" + (mine.length > 1 ? "s" : "") + " · " + r.tech + "</small>"); a.href = r.url;
    repos.appendChild(a);
  });

  /* ----- documents : recherche + filtres ----- */
  var grid = $("dgrid"), q = "", repoF = "Tous", statF = "Tous", inp = $("dq");
  var rb = $("repoF"), sb = $("statF");
  function chips(box, vals, cb) {
    vals.forEach(function (v, i) {
      var b = h("button", "chip", v); b.setAttribute("aria-pressed", i === 0);
      b.addEventListener("click", function () { box.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); cb(v); draw(true); });
      box.appendChild(b);
    });
  }
  chips(rb, ["Tous"].concat(H.repos.map(function (r) { return r.id; })), function (v) { repoF = v; });
  chips(sb, ["Tous"].concat(H.statuses.filter(function (s) { return byStatus[s.id]; }).map(function (s) { return s.id; })), function (v) { statF = v; });
  function setStatus(id) { statF = id; sb.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x.textContent === id); }); draw(true); }
  inp.addEventListener("input", function () { q = norm(inp.value); draw(true); });
  function url(d) { if (d.local) return d.local; var r = H.repos.filter(function (x) { return x.id === d.r; })[0]; return r.url + "/blob/" + r.branch + "/" + d.f; }
  function draw(anim) {
    grid.innerHTML = ""; var n = 0;
    H.docs.forEach(function (d) {
      if (repoF !== "Tous" && d.r !== repoF) return;
      if (statF !== "Tous" && d.s !== statF) return;
      if (q && norm(d.t + " " + d.sum + " " + d.f + " " + d.code + " " + d.r + " " + d.s).indexOf(q) < 0) return;
      var s = SC[d.s], a = h("a", "doc" + (anim && !reduce ? " pre" : ""), '<div class="top"><span class="pill ' + s.cls + '">' + d.s + '</span><span class="rp">' + d.r + "</span></div><h3>" + esc(d.t) + "</h3><p>" + esc(d.sum) + '</p><div class="code">' + esc(d.f) + " · " + esc(d.code) + '</div><span class="go">' + (d.local ? "Ouvrir la documentation →" : "Lire sur GitHub →") + "</span>");
      a.href = url(d); if (!d.local) { a.target = "_blank"; a.rel = "noopener"; }
      a.style.transitionDelay = Math.min(n, 14) * 45 + "ms";
      grid.appendChild(a); n++;
    });
    if (!n) grid.appendChild(h("div", "noresult", "Aucun document ne correspond à ces filtres."));
    $("dcount").textContent = n + " document" + (n > 1 ? "s" : "") + " sur " + total;
    if (anim && !reduce) requestAnimationFrame(function () { requestAnimationFrame(function () { grid.querySelectorAll(".doc.pre").forEach(function (e) { e.classList.remove("pre"); }); }); });
  }
  draw(false);

  /* ----- légende des statuts + parcours ----- */
  var sl = $("slegendbig");
  H.statuses.forEach(function (s) { sl.appendChild(h("div", "", '<span class="pill ' + s.cls + '">' + s.id + "</span><p>" + esc(s.d) + "</p>")); });
  var paths = $("paths");
  H.paths.forEach(function (p) {
    var el = h("div", "path", "<h3>" + esc(p.t) + "</h3><p>" + esc(p.s) + "</p><ol>" + p.steps.map(function (s) { return '<li><a href="' + s[1] + '"' + (/^https/.test(s[1]) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(s[0]) + "</a></li>"; }).join("") + "</ol>");
    paths.appendChild(el);
  });

  /* ----- apparitions + compteurs ----- */
  document.querySelectorAll("[data-stagger]").forEach(function (g) { [].forEach.call(g.children, function (c, k) { c.style.setProperty("--i", k); }); });
  var targets = [].slice.call(document.querySelectorAll(".reveal, [data-stagger], .repo"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .1, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (n) { io.observe(n); });
  } else targets.forEach(function (n) { n.classList.add("in"); });
  var pjDocs = PROJ.list.reduce(function (n, q) { return n + (q.docs ? q.docs.length : 0); }, 0), pjRepos = {};
  PROJ.list.forEach(function (q) { (q.repo && !q.repo.nourl ? [q.repo.name] : []).concat((q.sections || []).filter(function (x) { return x.repoLink; }).map(function (x) { return x.repoLink.name; })).forEach(function (n) { pjRepos[n] = 1; }); });
  var COUNTS = { projects: PROJ.list.length + 1, pages: NEMO.pages.length + PROJ.list.length, repos: H.repos.length + Object.keys(pjRepos).length, docs: total + pjDocs, wip: byStatus["En cours"], done: byStatus["Réalisé"] };
  window.HOME_COUNTS = COUNTS;
  document.querySelectorAll("[data-count]").forEach(function (n) {
    var to = COUNTS[n.getAttribute("data-count")] || 0;
    if (reduce) { n.textContent = to; return; }
    NEMO.onVisible(n, function () { var t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 1200); n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0); }, .5);
  });
})();
