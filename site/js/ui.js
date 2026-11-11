/* Interface commune à toutes les pages : navigation, pied de page, pager, thème, progression,
   apparitions au scroll (avec cascade), compteurs, palette de recherche (Ctrl K ou /). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var reduce = NEMO.reduce;
  var page = document.body.getAttribute("data-page") || "index";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ----- navigation, pied de page, pager (construits ici : une seule source pour toutes les pages) ----- */
  $("nav").innerHTML = '<div class="wrap"><a class="logo" href="index.html" aria-label="Nemo, accueil"><i></i>Nemo</a>' +
    '<nav class="links" aria-label="Pages">' + NEMO.pages.filter(function (p) { return p.nav; }).map(function (p) {
      return '<a href="' + p.href + '"' + (p.id === page ? ' aria-current="page"' : "") + ">" + esc(p.t) + "</a>";
    }).join("") + '</nav><div class="tools"><button class="ico search" id="open-pal" aria-label="Rechercher (Ctrl+K)">⌕ <span>Rechercher</span> <kbd>Ctrl K</kbd></button><button class="ico" id="theme" aria-label="Changer de thème">◐</button></div></div>';
  $("footer").innerHTML = '<div class="wrap"><div><a class="logo" href="index.html"><i></i>Nemo</a><p class="cap" style="margin:10px 0 0">Documentation · mise à jour le 11/11/2026</p></div>' +
    '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:14px">' + NEMO.pages.filter(function (p) { return p.nav; }).map(function (p) { return '<a href="' + p.href + '">' + esc(p.t) + "</a>"; }).join("") + "</div>" +
    '<a class="btn small" href="https://github.com/moidefr/nemo-docs">GitHub · nemo-docs</a></div>';
  var pager = $("pager");
  if (pager) {
    var ix = NEMO.pages.map(function (p) { return p.id; }).indexOf(page), pv = NEMO.pages[ix - 1], nx = NEMO.pages[ix + 1];
    pager.innerHTML = (pv ? '<a class="prev" href="' + pv.href + '"><small>Page précédente</small><b>' + esc(pv.t) + "</b></a>" : "") + (nx ? '<a class="next" href="' + nx.href + '"><small>Page suivante</small><b>' + esc(nx.t) + "</b></a>" : "");
  }

  NEMO.initDiagrams();
  NEMO.initSims();

  /* ----- thème ----- */
  function systemDark() { return matchMedia("(prefers-color-scheme: dark)").matches; }
  function isDark() { var t = document.documentElement.dataset.theme; return t ? t === "dark" : systemDark(); }
  function paintMeta() { var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = isDark() ? "#0A0C10" : "#FFFFFF"; }
  $("theme").addEventListener("click", function () {
    var t = isDark() ? "light" : "dark"; document.documentElement.dataset.theme = t;
    try { localStorage.setItem("nemo-theme", t); } catch (e) {}
    paintMeta();
  });
  paintMeta();

  /* ----- progression de lecture + bouton haut ----- */
  var bar = $("progress"), top = $("toTop");
  function onScroll() {
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.width = (p * 100) + "%"; top.classList.toggle("on", h.scrollTop > 900);
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  top.addEventListener("click", function () { scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ----- apparitions : .reveal (individuelles), [data-stagger] (en cascade), alternance gauche/droite ----- */
  document.querySelectorAll(".sim, .grid.g2").forEach(function (g) {
    [].forEach.call(g.children, function (c, k) { if (c.classList.contains("reveal")) c.classList.add(k % 2 ? "from-right" : "from-left"); });
  });
  document.querySelectorAll("[data-stagger]").forEach(function (g) { [].forEach.call(g.children, function (c, k) { c.style.setProperty("--i", k); }); });
  var targets = [].slice.call(document.querySelectorAll(".reveal, [data-stagger]"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .08, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (n) { io.observe(n); });
  } else targets.forEach(function (n) { n.classList.add("in"); });

  /* ----- compteurs (au moment où ils apparaissent) ----- */
  document.querySelectorAll("[data-count]").forEach(function (n) {
    var to = +n.getAttribute("data-count");
    if (reduce) { n.textContent = to; return; }
    NEMO.onVisible(n, function () {
      var t0 = performance.now();
      (function f(t) { var k = Math.min(1, (t - t0) / 1200); n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
    }, .5);
  });

  /* ----- copier (blocs statiques) ----- */
  document.querySelectorAll("#mcp pre .copy").forEach(function (cp) {
    cp.addEventListener("click", function () {
      var txt = cp.parentNode.textContent.replace(cp.textContent, "").trim();
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { cp.textContent = "Copié"; }, function () { cp.textContent = "Ctrl+C"; });
      setTimeout(function () { cp.textContent = "Copier"; }, 1600);
    });
  });

  /* ----- palette de recherche (pages, sections, outils, formats) ----- */
  var pal = $("pal"), inp = $("palIn"), list = $("palList"), items = [], shown = [], sel = 0;
  NEMO.pages.forEach(function (p) { items.push({ t: p.t, k: "Page", extra: p.d, href: p.href }); });
  [["Architecture : serveur, apps, assistant", "architecture.html", "schéma briques cloudflare ci"], ["Cycle d'une session (diagramme de séquence)", "session.html#cycle", "créneau claim lien résultat"],
   ["Planificateur : créneaux de révision", "session.html#planning", "emploi du temps indisponible préavis"], ["Formats d'exercice", "exercices.html", "qcm cloze flashcard"],
   ["Révision espacée : boîtes de Leitner", "progression.html#memoire", "leitner intervalles boîtes répétition"], ["Gamification : XP, série, niveaux", "progression.html#jeu", "combo bouclier coffre points"],
   ["Brancher Claude Code ou ChatGPT", "mcp.html", "assistant jeton connecteur"], ["États du verrou et garde-fous", "verrou.html", "blocage pause hors ligne"],
   ["Installer et mettre à jour", "installer.html#install", "install.ps1 update-app apk ci"], ["Règles de travail et dépôts", "installer.html#regles", "skip ci branches pousser"]].forEach(function (s) {
    items.push({ t: s[0], k: "Section", extra: s[2], href: s[1] });
  });
  NEMO.tools.forEach(function (t) { items.push({ t: t[0], k: "Outil MCP", extra: t[2], href: "mcp.html?q=" + encodeURIComponent(t[0]) }); });
  NEMO.formats.forEach(function (f) { items.push({ t: f.n + " (" + f.id + ")", k: "Format", extra: f.d, href: "exercices.html?f=" + f.id }); });
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function render() {
    var q = norm(inp.value.trim()); list.innerHTML = "";
    shown = items.filter(function (i) { return !q || norm(i.t + " " + (i.extra || "")).indexOf(q) > -1; }).slice(0, 40);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    if (!shown.length) { list.innerHTML = '<div class="none">Rien trouvé.</div>'; return; }
    shown.forEach(function (it, i) {
      var li = document.createElement("li"); li.className = i === sel ? "sel" : ""; li.innerHTML = "<span></span><small></small>";
      li.firstChild.textContent = it.t; li.lastChild.textContent = it.k;
      li.addEventListener("click", function () { choose(i); }); li.addEventListener("mousemove", function () { sel = i; mark(); });
      list.appendChild(li);
    });
  }
  function mark() { [].forEach.call(list.children, function (li, i) { li.classList.toggle("sel", i === sel); }); }
  function choose(i) { var it = shown[i]; if (!it) return; close(); location.href = it.href; }
  function open() { pal.classList.add("open"); inp.value = ""; sel = 0; render(); inp.focus(); }
  function close() { pal.classList.remove("open"); }
  $("open-pal").addEventListener("click", open);
  pal.addEventListener("click", function (e) { if (e.target === pal) close(); });
  inp.addEventListener("input", function () { sel = 0; render(); });
  inp.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
    else if (e.key === "Enter") { e.preventDefault(); choose(sel); }
  });
  addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.classList.contains("open") ? close() : open(); }
    else if (e.key === "Escape") close();
    else if (e.key === "/" && !(e.target.matches && e.target.matches("input, textarea"))) { e.preventDefault(); open(); }
  });
})();
