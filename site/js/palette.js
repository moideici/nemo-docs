/* Recherche globale (Ctrl K, ou « / » hors d'un champ) : projets, pages de Nemo, cartes et commandes de chaque projet, documents.
   Construite à partir de PROJ (js/proj-data.js) et, si elle est chargée, de HUB (js/hub-data.js). Réutilise les styles #pal de style.css.
   Clavier : ↑ ↓ pour choisir, Entrée pour ouvrir, Échap pour fermer ; tout élément portant l'attribut data-pal ouvre la palette. */
(function () {
  if (!window.PROJ) return;
  var P = window.PROJ, base = document.body.getAttribute("data-project") ? "../" : "";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function plain(s) { var d = document.createElement("div"); d.innerHTML = s; return d.textContent; }
  var items = [];
  function add(kind, title, sub, href, kw, ext) { items.push({ kind: kind, title: title, sub: sub, href: href, ext: !!ext, key: norm(title + " " + sub + " " + kw), tkey: norm(title) }); }

  add("Projet", "Nemo", "Révision espacée : serveur, apps Windows et Android", base + "nemo/", "nemo moidefr eleve revision");
  [["architecture", "Architecture de Nemo"], ["session", "Session et planning"], ["exercices", "Exercices (22 formats)"], ["progression", "Progression : Leitner et jeu"], ["mcp", "Serveur MCP"], ["verrou", "Verrou et garde-fous"], ["installer", "Installer et mettre à jour"]]
    .forEach(function (p) { add("Nemo", p[1], "Page de la documentation interactive de Nemo", base + "nemo/" + p[0] + ".html", "nemo"); });
  P.list.forEach(function (q) {
    add("Projet", q.n, q.role, base + q.id + "/", q.tech.join(" ") + " " + (q.repo ? q.repo.name : ""));
    (q.sections || []).forEach(function (s) { (s.cards || []).forEach(function (c) { add("Contenu", c.t, q.n + " · " + s.title, base + q.id + "/", plain(c.p)); }); });
    (q.commands || []).forEach(function (c) { add("Commande", c.t, q.n + " · " + c.code.split("\n")[0].slice(0, 60), base + q.id + "/#commandes", c.code); });
    ["done", "wip", "risks"].forEach(function (k) { ((q.state || {})[k] || []).forEach(function (t) { add(k === "risks" ? "Risque" : k === "wip" ? "À faire" : "Réalisé", plain(t).slice(0, 90), q.n, base + q.id + "/#etat", plain(t)); }); });
    (q.docs || []).forEach(function (d) { if (q.repo && !q.repo.nourl) add("Document", d.t, q.n + " · " + d.f, P.gh + q.repo.name + "/blob/" + q.repo.branch + "/" + d.f, d.d, true); });
  });
  if (window.HUB) HUB.docs.forEach(function (d) {
    var r = HUB.repos.filter(function (x) { return x.id === d.r; })[0];
    add("Document", d.t, "Nemo · " + d.r + " · " + d.s, d.local ? base + d.local : r.url + "/blob/" + r.branch + "/" + d.f, d.sum + " " + d.code, !d.local);
  });

  var pal = document.createElement("div"); pal.id = "pal"; pal.setAttribute("role", "dialog"); pal.setAttribute("aria-modal", "true"); pal.setAttribute("aria-label", "Recherche");
  pal.innerHTML = '<div class="box"><input id="palIn" type="text" placeholder="Rechercher un projet, une commande, un document…" autocomplete="off" aria-label="Rechercher"><ul id="palList" role="listbox"></ul><p class="pal-foot"><kbd>↑</kbd> <kbd>↓</kbd> choisir · <kbd>Entrée</kbd> ouvrir · <kbd>Échap</kbd> fermer</p></div>';
  document.body.appendChild(pal);
  var inp = pal.querySelector("input"), list = pal.querySelector("ul"), shown = [], sel = 0, last = null;
  var ORDER = { Projet: 0, Nemo: 1, Commande: 2, Contenu: 3, "Réalisé": 4, "À faire": 4, Risque: 4, Document: 5 };

  function render() {
    var q = norm(inp.value).trim(), toks = q.split(/\s+/).filter(Boolean);
    var res = items.map(function (it) {
      if (!toks.length) return it.kind === "Projet" ? { it: it, s: 0 } : null;
      var s = 0;
      for (var k = 0; k < toks.length; k++) {
        var t = toks[k], at = it.tkey.indexOf(t);
        if (at === 0) s += 6; else if (at > 0) s += 4; else if (it.key.indexOf(t) >= 0) s += 1; else return null;
      }
      return { it: it, s: s - (ORDER[it.kind] || 0) * .1 };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 30);
    shown = res.map(function (r) { return r.it; }); sel = 0;
    list.innerHTML = shown.length ? shown.map(function (it, k) {
      return '<li role="option" data-k="' + k + '"' + (k === 0 ? ' class="sel" aria-selected="true"' : "") + "><span class=\"pal-t\">" + esc(it.title) + '<em>' + esc(it.sub) + "</em></span><small>" + it.kind + (it.ext ? " ↗" : "") + "</small></li>";
    }).join("") : '<li class="none">Aucun résultat.</li>';
  }
  function mark() { [].forEach.call(list.children, function (li, k) { li.classList.toggle("sel", k === sel); li.setAttribute("aria-selected", k === sel); if (k === sel) li.scrollIntoView({ block: "nearest" }); }); }
  function go(it) { if (!it) return; if (it.ext) window.open(it.href, "_blank", "noopener"); else location.href = it.href; close(); }
  function open() { last = document.activeElement; pal.classList.add("open"); inp.value = ""; render(); inp.focus(); }
  function close() { pal.classList.remove("open"); if (last && last.focus) last.focus(); }
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-pal]"); if (b) { e.preventDefault(); open(); } });
  pal.addEventListener("click", function (e) { if (e.target === pal) close(); var li = e.target.closest && e.target.closest("li[data-k]"); if (li) go(shown[+li.getAttribute("data-k")]); });
  inp.addEventListener("input", render);
  document.addEventListener("keydown", function (e) {
    var openNow = pal.classList.contains("open"), tag = (document.activeElement && document.activeElement.tagName) || "";
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openNow ? close() : open(); return; }
    if (!openNow) { if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag)) { e.preventDefault(); open(); } return; }
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
    else if (e.key === "Enter") { e.preventDefault(); go(shown[sel]); }
  });
})();
