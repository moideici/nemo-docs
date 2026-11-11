/* Interface générale : thème, progression, révélations, compteurs, curseur-bulle, palette de recherche, easter egg. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  NEMO.initDiagrams();
  NEMO.initSims();

  /* thème */
  function systemDark() { return matchMedia("(prefers-color-scheme: dark)").matches; }
  function isDark() { var t = document.documentElement.dataset.theme; return t ? t === "dark" : systemDark(); }
  function paintMeta() { var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = isDark() ? "#0E141F" : "#FCFAF4"; }
  $("theme").addEventListener("click", function () {
    var t = isDark() ? "light" : "dark"; document.documentElement.dataset.theme = t;
    try { localStorage.setItem("nemo-theme", t); } catch (e) {}
    paintMeta();
  });
  paintMeta();

  /* progression + bouton haut + section active */
  var bar = $("progress"), top = $("toTop"), links = [].slice.call(document.querySelectorAll(".links a"));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function onScroll() {
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.width = (p * 100) + "%"; top.classList.toggle("on", h.scrollTop > 900);
    var cur = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * .35) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle("on", i === cur); });
    if (cur >= 0 && links[cur] && links[cur].scrollIntoView && innerWidth < 900) { var l = links[cur].parentNode; l.scrollLeft = links[cur].offsetLeft - 60; }
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  top.addEventListener("click", function () { scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* révélation au scroll */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .08, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
  } else document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("in"); });

  /* compteurs */
  document.querySelectorAll("[data-count]").forEach(function (n) {
    var to = +n.getAttribute("data-count"), t0 = performance.now();
    if (reduce) { n.textContent = to; return; }
    (function f(t) { var k = Math.min(1, (t - t0) / 1100); n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  });

  /* curseur-bulle */
  var bub = $("bubble"), bx = -100, by = -100, tx = -100, ty = -100;
  if (bub && matchMedia("(hover: hover)").matches && !reduce) {
    addEventListener("mousemove", function (e) { tx = e.clientX - 11; ty = e.clientY - 11; });
    (function loop() { bx += (tx - bx) * .18; by += (ty - by) * .18; bub.style.transform = "translate(" + bx + "px," + by + "px)"; requestAnimationFrame(loop); })();
    document.addEventListener("mouseover", function (e) { bub.classList.toggle("big", !!e.target.closest("button, a, .node, .edge-g, summary, input")); });
  }

  /* copier (blocs statiques) */
  document.querySelectorAll("#mcp pre .copy").forEach(function (cp) {
    cp.addEventListener("click", function () {
      var txt = cp.parentNode.textContent.replace(cp.textContent, "").trim();
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { cp.textContent = "Copié ✓"; }, function () { cp.textContent = "Ctrl+C"; });
      setTimeout(function () { cp.textContent = "Copier"; }, 1600);
    });
  });

  /* palette de recherche (Ctrl+K ou /) */
  var pal = $("pal"), inp = $("palIn"), list = $("palList"), items = [], shown = [], sel = 0;
  links.forEach(function (a) { items.push({ t: a.textContent, k: "Section", go: function () { location.hash = a.getAttribute("href"); } }); });
  [["Architecture : serveur, apps, assistant", "#vue", "schéma briques cloudflare"], ["Cycle d'une session (diagramme de séquence)", "#cycle", "créneau claim lien résultat"],
   ["Planificateur : créneaux de révision", "#planning", "emploi du temps indisponible préavis"], ["Formats d'exercice", "#exercices", "qcm cloze flashcard"],
   ["Révision espacée : boîtes de Leitner", "#memoire", "leitner intervalles boîtes répétition"], ["Gamification : XP, série, niveaux", "#jeu", "combo bouclier coffre points"],
   ["Serveur MCP et outils", "#mcp", "assistant claude chatgpt jeton"], ["Verrou, états et garde-fous", "#garde-fous", "blocage pause hors ligne"],
   ["Installer et mettre à jour", "#install", "install.ps1 update-app apk ci"], ["Règles de travail et dépôts", "#regles", "skip ci branches pousser"]].forEach(function (s) {
    items.push({ t: s[0], k: "Section", extra: s[2], go: function () { location.hash = s[1]; } });
  });
  items.push({ t: "Brancher Claude Code", k: "Section", go: function () { location.hash = "#mcp"; } });
  items.push({ t: "Machine à états du verrou", k: "Section", go: function () { location.hash = "#garde-fous"; } });
  NEMO.tools.forEach(function (t) { items.push({ t: t[0], k: "Outil MCP", extra: t[2], go: function () { var q = $("toolQ"); q.value = t[0]; q.dispatchEvent(new Event("input")); location.hash = "#mcp"; } }); });
  NEMO.formats.forEach(function (f, i) { items.push({ t: f.n + " (" + f.id + ")", k: "Format", extra: f.d, go: function () { location.hash = "#exercices"; document.querySelectorAll(".fcard")[i].click(); } }); });
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
  function choose(i) { var it = shown[i]; if (!it) return; close(); setTimeout(it.go, 30); }
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

  /* easter egg : confettis-bulles (↑↑↓↓←→←→ B A) */
  var seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"], pos = 0;
  function party() {
    if (reduce) return;
    var cols = ["var(--yellow)", "var(--coral)", "var(--green)", "var(--pink)", "var(--sky)"];
    for (var i = 0; i < 60; i++) (function () {
      var d = document.createElement("i"), s = 12 + Math.random() * 22;
      d.style.cssText = "position:fixed;z-index:300;pointer-events:none;border-radius:50%;border:2px solid var(--ink);width:" + s + "px;height:" + s + "px;background:" + cols[i % 5] + ";left:" + Math.random() * 100 + "vw;top:-40px";
      document.body.appendChild(d);
      var dur = 1800 + Math.random() * 1800, x = (Math.random() - .5) * 200;
      d.animate([{ transform: "translate(0,0)" }, { transform: "translate(" + x + "px," + (innerHeight + 80) + "px)" }], { duration: dur, easing: "cubic-bezier(.3,.1,.6,1)" }).onfinish = function () { d.remove(); };
    })();
  }
  addEventListener("keydown", function (e) { if (e.target.matches && e.target.matches("input, textarea")) return; var k = e.key.length === 1 ? e.key.toLowerCase() : e.key; pos = k === seq[pos] ? pos + 1 : (k === seq[0] ? 1 : 0); if (pos === seq.length) { pos = 0; party(); } });
  $("konami").addEventListener("click", party);
})();
