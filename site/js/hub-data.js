/* Données de la racine de la documentation (docs.moideici.tech) : projets, dépôts et documents.
   Source : les index `docs/README.md` de nemo-https et nemo-app (27/10/2026), le README de chaque dépôt, nemo-docs.
   Pour ajouter un document ou un projet : compléter ces tableaux, rien d'autre. */
window.HUB = window.HUB || {};

HUB.updated = "27/10/2026";   // date des index de dépôts dont viennent les statuts
HUB.siteUpdated = "11/11/2026";

/* statuts : définition donnée par les index des dépôts */
HUB.statuses = [
  { id: "Réalisé", cls: "g", d: "Le périmètre principal décrit par le document est livré dans le dépôt." },
  { id: "En cours", cls: "y", d: "Partiellement réalisé, avec un reste identifié ; ne garantit pas qu'un développement soit actif." },
  { id: "Obsolète", cls: "p", d: "Ne doit plus servir de feuille de route actuelle ; conservé pour l'historique." },
  { id: "Idée", cls: "s", d: "Proposition sans mise en œuvre vérifiable." },
  { id: "Référence", cls: "b", d: "Document d'usage ou de cadrage (README, architecture, charte), sans statut d'avancement." }
];

HUB.repos = [
  { id: "nemo-https", n: "nemo-https", role: "Serveur + site (Cloudflare)", branch: "master", url: "https://github.com/moideici/nemo-https", tech: "Node 22 · Workers · R2" },
  { id: "nemo-pc", n: "nemo-pc", role: "App Windows : verrou, sessions, Phiby", branch: "main", url: "https://github.com/moideici/nemo-pc", tech: "C# · .NET 9 · WPF" },
  { id: "nemo-app", n: "nemo-app", role: "App Android : blocage, lecteur, Ma session", branch: "main", url: "https://github.com/moideici/nemo-app", tech: "Kotlin · Android 9+" },
  { id: "nemo-docs", n: "nemo-docs", role: "Charte, architecture et ce site", branch: "main", url: "https://github.com/moideici/nemo-docs", tech: "Markdown · HTML/CSS/JS" }
];

/* documents : [repo, titre, résumé, statut, fichier (relatif au dépôt), code concerné, lien interne éventuel] */
HUB.docs = [
  /* ---- nemo-docs ---- */
  { r: "nemo-docs", t: "Site de documentation interactive de Nemo", s: "Référence", sum: "Architecture, cycle d'une session, planificateur, 22 formats d'exercice, révision espacée, jeu, outils MCP, verrou et installation, en 8 pages avec schémas et démos.", f: "site/", code: "site/nemo/, site/js/", local: "nemo/" },
  { r: "nemo-docs", t: "README", s: "Référence", sum: "Point d'entrée de Nemo : les briques, leurs dépôts, comment chacune se met à jour.", f: "README.md", code: "tout le dépôt" },
  { r: "nemo-docs", t: "Architecture de Nemo", s: "Référence", sum: "Vue d'ensemble, qui construit et qui installe, branches par dépôt, règles de documentation, outils de travail (agent-hub).", f: "ARCHITECTURE.md", code: "nemo-https, nemo-pc, nemo-app" },
  { r: "nemo-docs", t: "Charte graphique V1 (résumé)", s: "Référence", sum: "Principes (encre d'abord, un fluo un sens, rond et franc), couleurs clair/sombre, typographie, logo et composants.", f: "charte-nemo.md", code: "src/templates/charte.js (nemo-https)" },
  { r: "nemo-docs", t: "Branches supprimées le 27/10/2026", s: "Référence", sum: "Liste des branches fusionnées puis supprimées, avec leur dernier commit pour les restaurer.", f: "docs/branches-supprimees-2026-10-27.md", code: "les 3 dépôts d'app et de serveur" },
  /* ---- nemo-https ---- */
  { r: "nemo-https", t: "README du serveur", s: "Référence", sum: "Installer, créer les buckets R2 et les secrets, déployer, synchroniser les cours, brancher Claude ou ChatGPT, fonctionnalités propres à l'hébergement.", f: "README.md", code: "src/, scripts/, wrangler.jsonc" },
  { r: "nemo-https", t: "Index de la documentation", s: "Réalisé", sum: "Oriente dans les documents du dépôt et explique leur état par rapport au code.", f: "docs/README.md", code: "README du dépôt" },
  { r: "nemo-https", t: "Audit : génération, cache et multi-appareil", s: "En cours", sum: "Conserve l'audit du 1er octobre et les correctifs de génération, de cache et de concurrence.", f: "docs/audit-generation-cache-multiappareil.md", code: "src/index.js, src/store-do.js, public/static/sw.js" },
  { r: "nemo-https", t: "Charte : animations", s: "Réalisé", sum: "Décrit les animations portées sur le site et leurs garde-fous.", f: "docs/charte-animations.md", code: "src/templates/motion.js, public/static/fx.js" },
  { r: "nemo-https", t: "Pertinence des sessions", s: "En cours", sum: "Explique les causes du hors sujet (cours en monolithes) et les améliorations des briefs : sections, contenu de séance, « vu aujourd'hui ».", f: "docs/pertinence-sessions.md", code: "src/courseSections.js, src/briefing.js" },
  { r: "nemo-https", t: "Plan : Google Classroom", s: "En cours", sum: "Matières suivies et liaison individuelle à Google Classroom ; les devoirs Classroom ne sont pas lus.", f: "docs/plan-classroom.md", code: "src/followedSubjects.js, src/classroom/" },
  { r: "nemo-https", t: "Plan : fiches de révision", s: "Réalisé", sum: "Les fiches, leur impression (A4/A5, noir et blanc) et les révisions associées.", f: "docs/plan-fiches-revision.md", code: "src/fiche.js, src/templates/fiche.js" },
  { r: "nemo-https", t: "Plan : gamification des exercices", s: "Réalisé", sum: "Conception et bilan du retour visuel : points, série, niveaux, trois intensités.", f: "docs/plan-gamification-exercices.md", code: "public/static/game/, src/gameService.js" },
  { r: "nemo-https", t: "Plan : refonte du planning", s: "Réalisé", sum: "Conception et décisions de la refonte du planning (créneaux, vacances, plan d'étude).", f: "docs/plan-refonte-planning.md", code: "src/planService.js, src/studyPlan.js" },
  { r: "nemo-https", t: "Plan : révision espacée multi-appareils", s: "En cours", sum: "Sépare les fonctions livrées de la cible de synchronisation par événements (review_events, POST /api/sync, non livrés).", f: "docs/plan-revision-espacee-multi-appareils.md", code: "src/spacedRepetition.js, src/devices.js" },
  { r: "nemo-https", t: "Propositions du 14 octobre", s: "Obsolète", sum: "Archive des propositions du 14/10 ; une grande partie a été livrée, la liste « À faire » est historique.", f: "docs/propositions-2026-10-14.md", code: "src/templates/home.js, src/overview.js" },
  { r: "nemo-https", t: "Tutoriel : liaison Classroom", s: "Réalisé", sum: "Guide l'activation de la liaison Classroom et le premier essai réel (l'essai avec le vrai Google reste à vérifier).", f: "docs/tuto-classroom.md", code: "src/classroom/google.js" },
  /* ---- nemo-pc ---- */
  { r: "nemo-pc", t: "README de l'app Windows", s: "Référence", sum: "Fonctionnement du verrou, construction de la session avec l'assistant, Phiby, garde-fous, concentration, installation et mise à jour.", f: "README.md", code: "src/NemoPc/, src/NemoPc.Core/" },
  /* ---- nemo-app ---- */
  { r: "nemo-app", t: "README de l'app Android", s: "Référence", sum: "Prérequis, fonctionnement, Ma session, sessions et appareils, version 0.17, build et CI, App Links.", f: "README.md", code: "app/src/main/" },
  { r: "nemo-app", t: "Index de la documentation", s: "Réalisé", sum: "Oriente vers les plans et précise leur état par rapport au code Android.", f: "docs/README.md", code: "README principal" },
  { r: "nemo-app", t: "Plan : Ma session", s: "Réalisé", sum: "Arrivée de « Ma session », des deux assistants et de l'attente animée (quatre jeux).", f: "docs/plan-ma-session.md", code: "ui/SessionScreen.kt, core/Prompts.kt" },
  { r: "nemo-app", t: "Plan : refonte de l'app téléphone", s: "Obsolète", sum: "Plan initial du socle, des notifications, de l'algo et du blocage ; remplacé depuis la version 0.17.", f: "docs/plan-refonte-app-tel.md", code: "HostActivity.kt, ui/AppShell.kt" },
  { r: "nemo-app", t: "Correctifs et refonte du blocage", s: "Réalisé", sum: "Correctifs de reprise, refonte du lecteur et du blocage (une seule chose à faire à la fois).", f: "docs/plan-correctifs-et-refonte-blocage.md", code: "lock/LockActivity.kt, core/SessionBuild.kt" },
  { r: "nemo-app", t: "Multi-appareils et améliorations", s: "En cours", sum: "Diagnostique les générations multiples et suit la coordination des appareils (créneau partagé).", f: "docs/multi-appareils-et-ameliorations.md", code: "core/Slots.kt, lock/Lock.kt" }
];

/* synthèse en bref : constats tirés des index (27/10/2026) et des README */
HUB.brief = [
  { k: "Le projet", t: "Nemo, révision espacée pour un élève", p: "Planning, sessions construites par une IA, blocage du PC et du téléphone pendant les créneaux. Un serveur au centre, deux apps clientes, une charte graphique commune." },
  { k: "Les briques", t: "Quatre dépôts, une CI", p: "nemo-https se déploie à chaque fusion ; les builds Windows et Android viennent uniquement de la CI, avec une clé de signature unique ; nemo-docs réunit charte et architecture." },
  { k: "L'avancement", t: "{done} réalisés, {wip} en cours", p: "Sur les documents suivis par un statut, {done} sont réalisés, {wip} en cours et {old} obsolètes. Les statuts viennent du code présent et de git, pas des cases cochées." },
  { k: "À trancher", t: "Points ouverts connus", p: "Branches d'app non fusionnées, essai réel de la liaison Classroom, protocole de synchronisation par événements non livré. À vérifier dans les dépôts avant de s'y fier." }
];

/* parcours de lecture */
HUB.paths = [
  { t: "Découvrir Nemo", s: "En 15 minutes, comprendre ce que fait chaque brique.", steps: [["Architecture", "nemo/architecture.html"], ["Une session pas à pas", "nemo/session.html"], ["Les formats d'exercice", "nemo/exercices.html"]] },
  { t: "Installer et exploiter", s: "Mettre en route et garder à jour.", steps: [["Installer et mettre à jour", "nemo/installer.html"], ["Le serveur MCP", "nemo/mcp.html"], ["Le verrou et ses garde-fous", "nemo/verrou.html"]] },
  { t: "Comprendre les choix", s: "Pourquoi les choses sont comme elles sont.", steps: [["Progression : Leitner et jeu", "nemo/progression.html"], ["Architecture (ARCHITECTURE.md)", "https://github.com/moideici/nemo-docs/blob/main/ARCHITECTURE.md"], ["Plans par dépôt", "#documents"]] }
];
