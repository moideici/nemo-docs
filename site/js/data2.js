/* Données complémentaires : liste des pages, journée type du planificateur, questions des aperçus. */
window.NEMO = window.NEMO || {};

NEMO.pages = [
  { id: "index", href: "index.html", t: "Accueil", nav: false, d: "Présentation de Nemo et plan de la documentation", v: "v-ins" },
  { id: "architecture", href: "architecture.html", t: "Architecture", nav: true, d: "Le serveur, les apps PC et Android, l'assistant IA et la CI, en un schéma interactif.", v: "v-arch", n: 4 },
  { id: "session", href: "session.html", t: "Session et planning", nav: true, d: "Du planning au déverrouillage : le cycle complet d'une session, et le planificateur de créneaux.", v: "v-seq" },
  { id: "exercices", href: "exercices.html", t: "Exercices", nav: true, d: "22 formats d'exercice, avec des aperçus jouables fidèles à la vraie page.", v: "v-fmt" },
  { id: "progression", href: "progression.html", t: "Progression", nav: true, d: "Révision espacée (Leitner) et gamification : séries, XP, niveaux.", v: "v-prog" },
  { id: "mcp", href: "mcp.html", t: "Serveur MCP", nav: true, d: "Les outils que Claude ou ChatGPT appellent pour construire une session.", v: "v-mcp" },
  { id: "verrou", href: "verrou.html", t: "Verrou", nav: true, d: "Les états du blocage et les garde-fous pour ne jamais enfermer l'élève.", v: "v-lock" },
  { id: "installer", href: "installer.html", t: "Installer", nav: true, d: "Installer et mettre à jour chaque brique, règles de travail et dépôts.", v: "v-ins" }
];

/* journée type (mercredi) : cours imposés par EcoleDirecte, plages déclarées indisponibles */
NEMO.day = {
  start: 8, end: 22,
  classes: [
    { from: 8, to: 10, t: "Mathématiques", note: "Chapitre en cours : second degré." },
    { from: 10, to: 12, t: "Français", note: "Séquence : le roman du XIXe siècle." },
    { from: 13, to: 15, t: "SVT", note: "Thème : la cellule et l'énergie." }
  ],
  busy: { 12: "Déjeuner", 19: "Dîner" }
};

/* questions de l'aperçu d'en-tête (page d'accueil) */
NEMO.quiz = [
  { cls: "svt", subject: "SVT", q: "Quel organite produit l'énergie de la cellule ?", c: ["Le noyau", "La mitochondrie", "Le ribosome"], a: 1,
    ex: "La mitochondrie produit l'ATP, l'énergie de la cellule. Cette notion reviendra dans 2 jours." },
  { cls: "maths", subject: "Maths", q: "Quelle est la valeur du discriminant de x² − 5x + 6 ?", c: ["−1", "1", "25"], a: 1,
    ex: "Δ = b² − 4ac = 25 − 24 = 1. Deux racines réelles : 2 et 3." },
  { cls: "hg", subject: "Histoire", q: "Quel événement marque le début de la Révolution française, en 1789 ?", c: ["La fuite à Varennes", "La prise de la Bastille", "Le sacre de Napoléon"], a: 1,
    ex: "La prise de la Bastille, le 14 juillet 1789." }
];

/* pipeline de l'accueil */
NEMO.pipe = [
  { t: "Planning", s: "emploi du temps moins indisponibilités" },
  { t: "Préavis", s: "notification 5 min avant" },
  { t: "Verrou", s: "PC et téléphone, le temps de la session" },
  { t: "Session", s: "construite par une IA, jouée dans l'app" },
  { t: "Libération", s: "bilan, XP et prochaines révisions" }
];

/* utilitaires d'animation partagés */
NEMO.reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
NEMO.onVisible = function (el, cb, threshold) {
  if (!el) return;
  if (!("IntersectionObserver" in window)) { cb(); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); cb(); } }); }, { threshold: threshold || .3 });
  io.observe(el);
};
/* appelle show() quand l'élément est visible, hide() quand il sort de l'écran (pour les démos en boucle) */
NEMO.whileVisible = function (el, show, hide, threshold) {
  if (!el) return;
  if (!("IntersectionObserver" in window)) { show(); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? show() : hide(); }); }, { threshold: threshold || .3 });
  io.observe(el);
};

/* info-bulle flottante au survol (souris) : NEMO.tip.show(données, événement) / hide() */
NEMO.tip = (function () {
  var box = null;
  function ensure() {
    if (box) return box;
    box = document.createElement("div"); box.className = "tip"; box.setAttribute("role", "tooltip");
    document.body.appendChild(box); return box;
  }
  function place(e) {
    var b = ensure(), w = b.offsetWidth, h = b.offsetHeight, x = e.clientX + 16, y = e.clientY + 18;
    if (x + w > innerWidth - 10) x = e.clientX - w - 16;
    if (y + h > innerHeight - 10) y = e.clientY - h - 16;
    b.style.left = Math.max(8, x) + "px"; b.style.top = Math.max(8, y) + "px";
  }
  return {
    show: function (d, e) {
      if (!window.matchMedia || !matchMedia("(hover: hover)").matches) return;
      var b = ensure(); b.innerHTML = "";
      var h = document.createElement("h4"); h.textContent = d.title; b.appendChild(h);
      var p = document.createElement("p"); p.textContent = d.text; b.appendChild(p);
      if (d.meta && d.meta.length) { var m = document.createElement("div"); m.className = "meta"; d.meta.forEach(function (x) { var s = document.createElement("span"); s.className = "pill"; s.textContent = x; m.appendChild(s); }); b.appendChild(m); }
      place(e); b.classList.add("on");
    },
    move: function (e) { if (box && box.classList.contains("on")) place(e); },
    hide: function () { if (box) box.classList.remove("on"); }
  };
})();
