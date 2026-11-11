/* Rendu d'une page de projet à partir de PROJ (js/proj-data.js). La page ne contient qu'un squelette :
   <body data-project="agent-hub"><header id="nav"></header><main id="app"></main><footer id="footer"></footer>
   Navigation, thème, schéma d'architecture cliquable, copie des commandes, apparitions au défilement. */
(function () {
  var P = window.PROJ, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var id = document.body.getAttribute("data-project");
  var list = P.list, ix = list.map(function (p) { return p.id; }).indexOf(id), p = list[ix];
  var $ = function (i) { return document.getElementById(i); };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function plain(s) { var d = document.createElement("div"); d.innerHTML = s; return d.textContent; }
  function repoUrl(r) { return P.gh + r.name; }
  function fileUrl(f) { return repoUrl(p.repo) + "/blob/" + p.repo.branch + "/" + f; }
  function pill(st) { var s = P.statuses[st]; return '<span class="pill ' + s.cls + '">' + s.t + "</span>"; }

  /* ----- navigation, pied de page, thème ----- */
  $("nav").innerHTML = '<div class="wrap"><a class="logo" href="../" aria-label="Documentation, accueil"><i></i>Docs</a>' +
    '<nav class="links" aria-label="Projets"><a href="../nemo/">Nemo</a>' + list.map(function (q) {
      return '<a href="../' + q.id + '/"' + (q.id === id ? ' aria-current="page"' : "") + ">" + esc(q.n) + "</a>";
    }).join("") + '</nav><div class="tools"><button class="ico" id="theme" aria-label="Changer de thème">◐</button></div></div>';
  $("footer").innerHTML = '<div class="wrap"><div><a class="logo" href="../"><i></i>Docs</a><p class="cap" style="margin:10px 0 0">Documentation des projets · mise à jour le ' + P.updated + '</p></div>' +
    '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:14px"><a href="../">Racine</a><a href="../nemo/">Nemo</a><a href="https://github.com/moideici/nemo-docs">GitHub · nemo-docs</a></div></div>';
  function isDark() { var t = document.documentElement.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
  function paintMeta() { var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = isDark() ? "#0A0C10" : "#FFFFFF"; }
  $("theme").addEventListener("click", function () { var t = isDark() ? "light" : "dark"; document.documentElement.dataset.theme = t; try { localStorage.setItem("nemo-theme", t); } catch (e) {} paintMeta(); });
  paintMeta();
  document.title = p.title + " — Documentation";
  var md = document.querySelector('meta[name="description"]'); if (md) md.content = p.role + ".";

  var app = $("app"), html = [];

  /* ----- en-tête ----- */
  var cta = "";
  if (p.repo && !p.repo.nourl) cta += '<a class="btn primary" href="' + repoUrl(p.repo) + '" target="_blank" rel="noopener">Dépôt GitHub · ' + esc(p.repo.name) + "</a>";
  cta += '<a class="btn" href="#etat">État et limites</a>';
  html.push('<div class="page-hero"><div class="wrap"><div class="crumbs"><a href="../">Documentation</a> / ' + esc(p.n) + "</div>" +
    '<div class="pj-pills">' + pill(p.status) + (p.repo ? '<span class="pj-chip">' + esc(p.repo.name) + " · " + esc(p.repo.branch) + (p.repo.priv ? " · privé" : "") + "</span>" : "") +
    '<span class="pj-chip">activité : ' + esc(p.last) + "</span>" + p.tech.map(function (t) { return '<span class="pj-chip">' + esc(t) + "</span>"; }).join("") + "</div>" +
    "<h1>" + esc(p.title) + '</h1><p class="lead">' + p.lead + '</p><div class="pj-cta">' + cta + "</div></div></div>");

  html.push('<div class="wrap">');
  /* ----- chiffres clés ----- */
  html.push('<section class="page-sec"><div class="pj-facts" data-stagger>' + p.facts.map(function (f) {
    return '<div class="pj-fact reveal"><b>' + esc(f.v) + "</b><span>" + esc(f.k) + "</span></div>";
  }).join("") + "</div></section>");

  /* ----- architecture ----- */
  if (p.arch) {
    var a = p.arch, n = 0, layers = a.layers.map(function (l) {
      if (l.link) return '<div class="pj-link" aria-hidden="true"><span>' + esc(l.link) + "</span></div>";
      return '<div class="pj-layer"><div class="cap">' + esc(l.name) + '</div><div class="pj-row">' + l.items.map(function (it) {
        return '<button type="button" class="pj-box" data-i="' + (n++) + '">' + esc(it.n) + "<small>" + esc(plain(it.d).slice(0, 70)) + (plain(it.d).length > 70 ? "…" : "") + "</small></button>";
      }).join("") + "</div></div>";
    }).join("");
    html.push('<section id="architecture" class="page-sec"><div class="sec-head reveal"><div class="cap">Architecture</div><h2>Comment c\'est <mark>construit</mark>.</h2><p>' + a.intro + "</p></div>" +
      '<div class="pj-arch reveal">' + layers + '</div><div class="pj-info" id="pjInfo" aria-live="polite">Cliquer sur un bloc pour afficher son détail.</div></section>');
  }

  /* ----- commandes ----- */
  if (p.commands && p.commands.length) {
    html.push('<section id="commandes" class="page-sec"><div class="sec-head reveal"><div class="cap">Utilisation</div><h2>Les commandes <mark>utiles</mark>.</h2></div><div class="pj-cmds">' + p.commands.map(function (c, k) {
      return '<div class="pj-cmd reveal"><header><span>' + esc(c.t) + '</span><button type="button" data-copy="' + k + '">Copier</button></header><pre>' + esc(c.code) + "</pre></div>";
    }).join("") + "</div></section>");
  }

  /* ----- sections de contenu ----- */
  p.sections.forEach(function (s, k) {
    var link = s.repoLink ? ' <a class="btn small" style="margin-left:10px;vertical-align:middle" href="' + P.gh + s.repoLink.name + '" target="_blank" rel="noopener">Dépôt · ' + esc(s.repoLink.name) + "</a>" : "";
    html.push('<section class="page-sec"><div class="sec-head reveal"><div class="cap">' + esc(s.cap) + "</div><h2>" + esc(s.title) + link + "</h2>" + (s.intro ? "<p>" + s.intro + "</p>" : "") + '</div><div class="pj-cards" data-stagger>' +
      s.cards.map(function (c) { return '<div class="pj-card reveal"><h3>' + esc(c.t) + "</h3><p>" + c.p + "</p></div>"; }).join("") + "</div></section>");
  });

  /* ----- état ----- */
  var st = p.state;
  function col(cls, title, items) { return items && items.length ? '<div class="pj-col ' + cls + ' reveal"><h3><i></i>' + title + "</h3><ul>" + items.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul></div>" : ""; }
  html.push('<section id="etat" class="page-sec"><div class="sec-head reveal"><div class="cap">État</div><h2>Où en est <mark>le projet</mark>.</h2><p>Constats tirés des README, des plans et du bilan des projets du 01/11/2026 ; à vérifier dans le dépôt avant de s\'y fier.</p></div><div class="pj-state">' +
    col("g", "Réalisé", st.done) + col("y", "En cours ou à faire", st.wip) + col("p", "Limites et risques", st.risks) + "</div></section>");

  /* ----- documents ----- */
  if (p.docs && p.docs.length) {
    html.push('<section id="docs" class="page-sec"><div class="sec-head reveal"><div class="cap">Documents</div><h2>Pour aller <mark>plus loin</mark>.</h2><p>Chaque lien ouvre le fichier sur GitHub (dépôt privé : connexion requise).</p></div><div class="pj-docs" data-stagger>' +
      p.docs.map(function (d) {
        var u = p.repo && !p.repo.nourl ? fileUrl(d.f) : null;
        return (u ? '<a class="pj-doc reveal" href="' + u + '" target="_blank" rel="noopener">' : '<div class="pj-doc reveal">') + "<b>" + esc(d.t) + "</b><span>" + esc(d.d) + "</span><span><code>" + esc(d.f) + "</code></span>" + (u ? "</a>" : "</div>");
      }).join("") + "</div></section>");
  }

  /* ----- pager ----- */
  var pv = list[ix - 1], nx = list[ix + 1];
  html.push('<nav class="pager">' + (pv ? '<a class="prev" href="../' + pv.id + '/"><small>Projet précédent</small><b>' + esc(pv.n) + "</b></a>" : '<a class="prev" href="../"><small>Retour</small><b>Racine de la documentation</b></a>') +
    (nx ? '<a class="next" href="../' + nx.id + '/"><small>Projet suivant</small><b>' + esc(nx.n) + "</b></a>" : "") + "</nav></div>");
  app.innerHTML = html.join("");

  /* ----- schéma cliquable ----- */
  if (p.arch) {
    var items = []; p.arch.layers.forEach(function (l) { if (l.items) items = items.concat(l.items); });
    var info = $("pjInfo"), boxes = [].slice.call(app.querySelectorAll(".pj-box"));
    function show(b) { boxes.forEach(function (x) { x.classList.toggle("on", x === b); }); var it = items[+b.getAttribute("data-i")]; info.innerHTML = "<b>" + esc(it.n) + "</b> — " + it.d; }
    boxes.forEach(function (b) { b.addEventListener("click", function () { show(b); }); b.addEventListener("mouseenter", function () { show(b); }); });
  }
  /* ----- copie des commandes ----- */
  [].forEach.call(app.querySelectorAll("[data-copy]"), function (b) {
    b.addEventListener("click", function () {
      var txt = p.commands[+b.getAttribute("data-copy")].code;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { b.textContent = "Copié"; }, function () { b.textContent = "Sélectionner le texte"; });
      setTimeout(function () { b.textContent = "Copier"; }, 1600);
    });
  });
  /* ----- apparitions ----- */
  [].forEach.call(app.querySelectorAll("[data-stagger]"), function (g) { [].forEach.call(g.children, function (c, k) { c.style.setProperty("--i", k); c.style.transitionDelay = Math.min(k, 8) * 45 + "ms"; }); });
  var targets = [].slice.call(app.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .06, rootMargin: "0px 0px -30px 0px" });
    targets.forEach(function (t) { io.observe(t); });
  } else targets.forEach(function (t) { t.classList.add("in"); });
})();
