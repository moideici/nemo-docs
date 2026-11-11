/* Contenu de la documentation Nemo : tout ce qui est affiché par les diagrammes et simulateurs.
   Sources : README et ARCHITECTURE.md de nemo-docs / nemo-https / nemo-pc / nemo-app. */
window.NEMO = window.NEMO || {};

/* ---------- briques ---------- */
NEMO.bricks = [
  { color: "var(--blue)", name: "nemo-https", role: "Serveur + site", where: "Cloudflare Worker · nemo.moideici.tech",
    pts: ["Planning, cours, exercices, résultats", "Serveur MCP pour les assistants IA", "Stockage : R2 + Durable Objects (SQLite)", "Pages d'exercice jouables hors ligne"],
    tags: ["Node 22", "Workers", "R2", "MCP"], repo: "moidefr/nemo-https" },
  { color: "var(--coral)", name: "nemo-pc", role: "App Windows", where: "%LOCALAPPDATA%\\Programs\\NemoPc",
    pts: ["Verrou plein écran sur tous les écrans", "Construit la session avec l'assistant choisi", "Phiby : l'assistant intégré", "Démarre avec Windows"],
    tags: ["C#", ".NET 9", "WPF", "WebView2"], repo: "moidefr/nemo-pc" },
  { color: "var(--green)", name: "nemo-app", role: "App Android", where: "Téléphone de l'élève · Android 9+",
    pts: ["Accueil, planning, « Ma session »", "Blocage du téléphone pendant les sessions", "Lecteur d'exercices via App Links", "Widget « Nemo aujourd'hui »"],
    tags: ["Kotlin", "minSdk 28", "App Links"], repo: "moidefr/nemo-app" },
  { color: "var(--yellow)", name: "nemo-docs", role: "Charte + architecture", where: "GitHub · et ce site",
    pts: ["Charte graphique V1 (PDF, PNG, résumé)", "ARCHITECTURE.md : vue d'ensemble", "Liste des branches supprimées", "Aucun code applicatif"],
    tags: ["Markdown", "HTML"], repo: "moidefr/nemo-docs" }
];

/* ---------- schéma d'architecture ---------- */
NEMO.layers = [
  { id: "all", label: "Tout" },
  { id: "data", label: "Données" },
  { id: "session", label: "Sessions" },
  { id: "ship", label: "Livraison (CI)" }
];

NEMO.nodes = [
  { id: "ed",   x: 30,  y: 60,  w: 170, h: 70, fill: "var(--sky)",    t: "EcoleDirecte", s: "emploi du temps · notes",
    title: "EcoleDirecte", text: "Source de l'emploi du temps, des notes, des devoirs et du cahier de texte. Une session est ouverte une fois côté serveur ; la question de sécurité n'est redemandée que si on repart de zéro.",
    meta: ["externe", "lecture seule"] },
  { id: "cours", x: 30, y: 200, w: 170, h: 70, fill: "var(--sky)",    t: "Cours", s: "OneDrive · page /admin",
    title: "Cours de l'élève", text: "Notes PDF, Word, PowerPoint, Markdown. Le texte est extrait localement (formules Word converties en LaTeX), puis envoyé dans R2 avec le fichier d'origine. Deux buckets séparés : notes perso et cours de la classe.",
    meta: ["npm run sync:courses", "plafond 3 Go"] },
  { id: "srv",  x: 330, y: 40,  w: 300, h: 240, fill: "var(--yellow)", t: "nemo-https", s: "Cloudflare Worker", big: true,
    title: "nemo-https : la source de vérité", text: "Planning, cours, exercices, résultats et état des créneaux partagés. Il expose les pages du site, une API pour les apps (jeton du profil) et le serveur MCP (/mcp) pour les assistants. Il se déploie tout seul à chaque fusion sur master.",
    meta: ["Worker", "R2 : nemo-courses · nemo-class-courses", "Durable Objects : NEMO_MCP · NEMO_STORE"] },
  { id: "ai",   x: 760, y: 60,  w: 170, h: 80, fill: "var(--coral)",  t: "Assistant IA", s: "Claude · ChatGPT · Gemini",
    title: "L'assistant IA", text: "Il construit la session avec les outils MCP : un brief en un appel (cours, devoirs, notes, erreurs, contrôles), puis publish_session. Dans les apps, c'est le site de l'assistant dans une fenêtre intégrée, ou un fournisseur natif configuré ; le site reste le repli.",
    meta: ["MCP", "5 outils d'écriture à autoriser une fois"] },
  { id: "eleve", x: 760, y: 210, w: 170, h: 70, fill: "var(--pink)",  t: "L'élève", s: "navigateur · site",
    title: "L'élève sur le site", text: "Tableau de bord, planning, contrôles, bilan, listes algorithmiques publiques, Phiby et page d'administration. Sans compte, un visiteur reçoit un identifiant anonyme pour sa propre progression.",
    meta: ["/planning", "/bilan", "/algos", "/phiby"] },
  { id: "pc",   x: 130, y: 400, w: 220, h: 80, fill: "var(--green)",  t: "nemo-pc", s: "verrou · Phiby · sessions",
    title: "nemo-pc (Windows)", text: "Lit /api/plan, prévient 5 min avant, verrouille tous les écrans, réclame le créneau, fait construire la session et bascule sur la page de l'exercice. Le cœur natif (planificateur, verrou, démarrage auto) est en C#.",
    meta: ["C# / .NET 9", "WPF", "WebView2", "version 0.1.<n° de build>"] },
  { id: "ci",   x: 390, y: 410, w: 180, h: 60, fill: "var(--card)",   t: "GitHub Actions", s: "tests · builds · déploiement",
    title: "GitHub Actions", text: "Seul constructeur autorisé : tests puis déploiement du serveur à chaque fusion, build Windows et APK signé avec la clé unique du secret de dépôt. Aucun build local.",
    meta: ["secret NEMO_DEBUG_KEYSTORE_B64", "CLOUDFLARE_API_TOKEN"] },
  { id: "app",  x: 610, y: 400, w: 220, h: 80, fill: "var(--green)",  t: "nemo-app", s: "blocage · notifs · widget",
    title: "nemo-app (Android)", text: "Accueil, planning, « Ma session », blocage du téléphone et lecteur d'exercices. Les liens nemo.moideici.tech/exercise/… s'ouvrent dans l'app grâce aux App Links vérifiés (assetlinks.json servi par le serveur).",
    meta: ["Kotlin", "Android 9+", "version 0.17.<n° de build>"] }
];

NEMO.edges = [
  { id: "e1", from: "ed",   to: "srv", d: "M200,95 L330,95",   layer: "data",    label: "sync",
    title: "EcoleDirecte → serveur", text: "Le serveur lit l'emploi du temps, les notes et les devoirs avec la session EcoleDirecte stockée dans son Durable Object.", meta: ["emploi du temps", "devoirs", "notes"] },
  { id: "e2", from: "cours", to: "srv", d: "M200,235 L330,235", layer: "data",    label: "cours → R2",
    title: "Cours → R2", text: "scripts/sync-courses.js (ou la page /admin) envoie le fichier et son texte extrait. Un garde-fou refuse tout upload qui dépasserait le plafond de 3 Go.", meta: ["texte extrait + original", "manuels/"] },
  { id: "e3", from: "srv",  to: "ai",  d: "M630,100 L760,100", layer: "session", both: true, label: "MCP",
    title: "Serveur ⇄ assistant (MCP)", text: "Streamable HTTP sur /mcp?key=<jeton> ou en-tête Authorization. L'assistant lit briefs et cours, puis publie le parcours : UN appel, UN lien.", meta: ["/mcp", "publish_session"] },
  { id: "e4", from: "eleve", to: "srv", d: "M760,245 L630,245", layer: "data",   both: true, label: "site",
    title: "Élève ⇄ site", text: "Pages web du serveur : planning, contrôles, bilan, listes. Le mode confort et les heures calmes se règlent ici une fois, et valent partout.", meta: ["GET /api/me/prefs"] },
  { id: "e5", from: "pc",   to: "srv", d: "M240,400 L400,280", layer: "session", both: true, label: "API",
    title: "PC ⇄ serveur", text: "GET /api/plan, POST /api/slot/claim, GET /api/slot, GET /api/version, puis POST /api/exercise/:id/result en fin de session. Authentifié par le jeton du profil.", meta: ["/api/plan", "/api/slot/claim", "/api/exercise/:id/result"] },
  { id: "e6", from: "app",  to: "srv", d: "M720,400 L560,280", layer: "session", both: true, label: "API",
    title: "Téléphone ⇄ serveur", text: "Mêmes API que le PC. Un créneau partagé : un appareil génère, les autres attendent son lien. Hors connexion, l'accueil montre le dernier planning connu.", meta: ["/api/slot/*", "/api/sessions"] },
  { id: "e7", from: "ci",   to: "srv", d: "M480,410 L480,280", layer: "ship",    label: "deploy",
    title: "CI → serveur", text: "À chaque fusion sur master : npm ci, tests (Node 22), puis npm run deploy si tout est vert. Déploiement sauté avec un avertissement sans le secret CLOUDFLARE_API_TOKEN.", meta: ["wrangler deploy"] },
  { id: "e8", from: "ci",   to: "pc",  d: "M390,440 L350,440", layer: "ship",    label: "",
    title: "CI → nemo-pc", text: "Workflow « Nemo PC » : build 0.1.<n° de run>. scripts/install.ps1 télécharge le dernier build réussi, à la demande de l'élève.", meta: ["install.ps1"] },
  { id: "e9", from: "ci",   to: "app", d: "M570,440 L610,440", layer: "ship",    label: "",
    title: "CI → nemo-app", text: "Workflow « Android APK » : build 0.17.<n° de run>, signé avec la clé unique. scripts/update-app.ps1 fait un adb install -r du dernier build réussi.", meta: ["update-app.ps1", "adb install -r"] }
];

/* ---------- séquence d'une session ---------- */
NEMO.actors = [
  { id: "tel", t: "Téléphone", s: "nemo-app", fill: "var(--green)" },
  { id: "pc",  t: "PC",        s: "nemo-pc",  fill: "var(--green)" },
  { id: "srv", t: "Serveur",   s: "nemo-https", fill: "var(--yellow)" },
  { id: "ai",  t: "Assistant", s: "Claude / ChatGPT", fill: "var(--coral)" },
  { id: "page", t: "Exercice", s: "page web", fill: "var(--sky)" }
];
NEMO.steps = [
  { from: "pc", to: "srv", label: "GET /api/plan", title: "1. Lire le planning", text: "Le PC demande le planning : emploi du temps EcoleDirecte moins les plages indisponibles. Il le garde en cache disque (fiable 24 h par défaut) pour fonctionner même sans réseau." },
  { from: "pc", to: "pc", label: "préavis 5 min", title: "2. Préavis", text: "5 minutes avant le créneau (réglable), notification dans la barre des tâches. La pré-construction de la session démarre au même moment. Le téléphone dédoublonne le préavis : le premier appareil qui réclame annonce." },
  { from: "pc", to: "srv", label: "POST /api/slot/claim", title: "3. Réclamer le créneau", text: "Un seul appareil prépare la session d'un créneau. Le PC réclame le créneau et le serveur le lui attribue." },
  { from: "tel", to: "srv", label: "slot/claim → déjà pris", title: "4. Le téléphone attend", text: "Le téléphone voit que le créneau est pris : il n'en génère pas un autre, il attend le lien. Bloqué, il revérifie toutes les 30 s ; après 6 min d'attente, il repasse en génération locale." },
  { from: "pc", to: "ai", label: "demande de session", title: "5. Demander la session", text: "Le PC ouvre l'assistant choisi (site Claude/ChatGPT dans WebView2, ou fournisseur natif) avec une commande comme /session-complete. Le texte « ce qu'on a vu aujourd'hui », pré-rempli depuis le cahier de texte, part avec." },
  { from: "ai", to: "srv", label: "MCP · publish_session", title: "6. Construire", text: "L'assistant appelle d'abord prepare_full_session (un seul appel), complète avec les cours, puis publie le parcours entier avec publish_session : UN lien, n étapes de formats variés." },
  { from: "srv", to: "pc", label: "lien /exercise/<id>", title: "7. Le lien arrive au PC", text: "Le PC, qui surveillait /api/slot et la liste des exercices récents, reçoit le lien du parcours publié." },
  { from: "srv", to: "tel", label: "lien repris", title: "8. Le téléphone reprend le lien", text: "Le téléphone n'a rien généré : il reprend le lien du créneau. Un créneau fait ailleurs ne doit plus générer ni bloquer ici." },
  { from: "pc", to: "page", label: "bascule (verrou gardé)", title: "9. Jouer", text: "L'app bascule automatiquement sur la page de l'exercice, toujours verrouillée. La page est pré-chargée en entier : une coupure ne fait perdre aucune réponse." },
  { from: "page", to: "srv", label: "POST /api/exercise/:id/result", title: "10. Envoyer le résultat", text: "Chaque étape écrit d'abord son résultat en local, puis l'envoie (idempotent par étape). L'XP est calculée côté serveur, jamais lue dans le résultat." },
  { from: "srv", to: "pc", label: "session faite → libère", title: "11. Déverrouillage", text: "La session menée au bout libère le PC (et le téléphone). Le bilan reste affiché, et « Retour à Claude » ouvre la conversation pour le débrief." }
];

/* ---------- machine à états du verrou ---------- */
NEMO.lock = [
  { id: "free", t: "Libre", fill: "var(--green)", title: "Libre",
    text: "Aucun créneau en cours. Rien n'est bloqué. Nemo surveille le planning depuis la zone de notification.",
    exits: "Verrouillage désactivé ou suspendu : seule une proposition de reprendre s'affiche, sans verrou." },
  { id: "warn", t: "Préavis", fill: "var(--sky)", title: "Préavis (5 min)",
    text: "Notification avant le créneau. La session commence à se construire en arrière-plan, sur le PC ou sur un autre appareil.",
    exits: "Heures calmes : aucune annonce, aucun préavis. Le préavis est dédoublonné avec le téléphone." },
  { id: "lock", t: "Verrouillé", fill: "var(--coral)", title: "Verrou · construction",
    text: "Verrou plein écran sur tous les écrans. L'assistant construit la session ; l'écran d'attente montre le texte en direct et propose deux jeux (Bulles, Paires).",
    exits: "Le créneau se termine : le verrou tombe. Une pause a toujours une fin. « Réviser maintenant » existe sans verrou." },
  { id: "play", t: "Session", fill: "var(--yellow)", title: "Session en cours",
    text: "La page de l'exercice est affichée, toujours verrouillée. Interrompu en route, le PC reprend verrouillé sur le même exercice si le créneau est d'actualité, sinon il propose de reprendre ou de repartir.",
    exits: "« Terminer maintenant » ne déverrouille pas tant que la session n'est pas allée à son terme une première fois." },
  { id: "done", t: "Bilan", fill: "var(--pink)", title: "Bilan affiché",
    text: "PC libéré (écrans secondaires rendus, fenêtre ordinaire) mais la page de résultats reste à l'écran. « Retour à Claude » bascule sur la conversation qui a construit la session.",
    exits: "Un nouveau créneau actif abandonne l'ancien sans rien demander. « Nouvelle série » relance une construction." }
];

/* ---------- formats d'exercice ---------- */
NEMO.fcats = ["Tous", "Choix", "Rappel actif", "Ordre & association", "Visuel", "Réflexion"];
NEMO.formats = [
  { id: "qcm", n: "QCM", c: "Choix", e: "🔘", d: "Question à choix multiples, correction immédiate (vert/rose + explication). Mode chrono optionnel, jamais par défaut." },
  { id: "blind-qcm", n: "QCM aveugle", c: "Choix", e: "🂠", demo: true, d: "Les choix sont cachés derrière une carte à retourner : il faut chercher la réponse avant de découvrir les options." },
  { id: "true-false", n: "Vrai / Faux", c: "Choix", e: "⚖️", demo: true, d: "Correction immédiate avec une justification affichée après coup (jamais un texte que l'élève écrit)." },
  { id: "odd-one-out", n: "Intrus", c: "Choix", e: "🕵️", d: "Plusieurs manches, un élément qui ne va pas avec les autres à repérer dans chacune." },
  { id: "flashcard", n: "Flashcard", c: "Rappel actif", e: "🃏", d: "Recto/verso, « Je savais » ou « À revoir ». Les cartes ratées reviennent plus souvent." },
  { id: "cloze", n: "Texte à trous", c: "Rappel actif", e: "✍️", demo: true, d: "Les trous sont dans le texte. Mode « type » (on écrit) ou « bank » (banque de mots avec intrus). Indifférent à la casse, aux accents et à œ/æ." },
  { id: "numeric", n: "Calcul éclair", c: "Rappel actif", e: "🔢", d: "Taper un nombre, avec tolérance absolue ou relative." },
  { id: "mystery", n: "Mot mystère", c: "Rappel actif", e: "🔤", d: "Des indices qui se dévoilent un par un." },
  { id: "open-question", n: "Question ouverte", c: "Rappel actif", e: "💬", d: "Réponse écrite, corrigée par l'IA en arrière-plan : on passe à la suite, le verdict arrive en notification." },
  { id: "matching", n: "Association", c: "Ordre & association", e: "🔗", d: "Terme/définition, formule/nom, pays/capitale… paires génériques." },
  { id: "sorting", n: "Tri", c: "Ordre & association", e: "🗂️", d: "Trier une liste dans 2 à 4 catégories." },
  { id: "timeline", n: "Frise", c: "Ordre & association", e: "📏", d: "Remettre des événements dans l'ordre relatif." },
  { id: "date-timeline", n: "Frise datée", c: "Ordre & association", e: "📅", d: "De vraies dates affichées comme ancrage : on dit quel événement va avec laquelle." },
  { id: "word-order", n: "Phrase à remettre", c: "Ordre & association", e: "🧩", demo: true, d: "Reconstruire une phrase à partir de mots mélangés, intrus possibles. Utile en langues." },
  { id: "memory", n: "Memory", c: "Ordre & association", e: "🎴", d: "Paires à retrouver, toutes visibles (la phase face cachée est obsolète depuis le 18/10/2026)." },
  { id: "labeled-diagram", n: "Schéma légendé", c: "Visuel", e: "🧬", d: "Placer les bons libellés sur un schéma via des menus déroulants." },
  { id: "hotspot", n: "Point sur l'image", c: "Visuel", e: "📍", d: "Clic direct sur un endroit d'une image ou carte ; Nemo montre le bon endroit et la distance." },
  { id: "step-by-step", n: "Pas-à-pas", c: "Réflexion", e: "🪜", d: "Résolution guidée étape par étape, auto-évaluée (rappel actif : +2)." },
  { id: "find-error", n: "Chasse à l'erreur", c: "Réflexion", e: "🔎", d: "Trouver la ligne fausse d'une résolution, puis la bonne correction." },
  { id: "estimate", n: "Estimation", c: "Réflexion", e: "🎚️", demo: true, d: "Un curseur, échelle logarithmique possible : travailler les ordres de grandeur." },
  { id: "lesson", n: "Leçon", c: "Réflexion", e: "📖", d: "Un court rappel de cours. Ne rapporte rien mais compte pour la série de jours." },
  { id: "hybrid-session", n: "Session adaptative", c: "Réflexion", e: "🧠", d: "Façon Quizlet : chaque notion passe par des paliers (QCM, texte à trous, réponse écrite) jusqu'à être maîtrisée." }
];

/* ---------- outils MCP ---------- */
NEMO.toolCats = ["Tous", "Briefs", "Contrôles", "Suivi", "EcoleDirecte", "Cours", "Manuels", "Générer", "Publier", "Résultats"];
NEMO.tools = [
  ["prepare_full_session", "Briefs", "Session complète en un appel : parties, budget de questions, sources déjà lues."],
  ["prepare_review_today", "Briefs", "Revoir ce qui a été vu aujourd'hui."],
  ["prepare_deep_dive", "Briefs", "Approfondir un sujet."],
  ["prepare_restart", "Briefs", "Repartir après un exercice : mode easier (arrêté) ou deeper (terminé)."],
  ["suggest_focus", "Briefs", "Notes faibles, devoirs proches et dernières erreurs réunis (signaux bruts)."],
  ["suggest_daily_review", "Briefs", "Propose la révision du jour."],
  ["suggest_variation", "Briefs", "Suggère une variation de format."],
  ["prepare_exam_scan", "Contrôles", "Lit les énoncés des devoirs à venir pour y détecter des contrôles."],
  ["declare_exam", "Contrôles", "Déclare un contrôle à date sûre sur la page Contrôles.", true],
  ["finish_exam_scan", "Contrôles", "Termine la détection des contrôles.", true],
  ["get_profile", "Suivi", "Prénom de l'élève et consignes laissées par l'administrateur."],
  ["get_stats", "Suivi", "Progression par matière dans le temps (comme le tableau de bord web)."],
  ["get_progression", "Suivi", "État de la révision espacée par notion."],
  ["update_progression", "Suivi", "Enregistre le résultat d'une notion (boîte Leitner).", true],
  ["get_agenda", "EcoleDirecte", "Agenda et emploi du temps."],
  ["get_grades", "EcoleDirecte", "Notes."],
  ["list_homework", "EcoleDirecte", "Devoirs à faire."],
  ["get_homework_detail", "EcoleDirecte", "Détail et énoncé d'un devoir."],
  ["list_courses", "Cours", "Cours personnels de l'élève (réservé à l'admin ou aux profils autorisés)."],
  ["read_course", "Cours", "Lit un cours : outline, sections ou fichier d'origine (lien signé 60 min)."],
  ["list_class_courses", "Cours", "Cours de la classe, ouverts à tout profil."],
  ["read_class_course", "Cours", "Lit un cours de la classe."],
  ["list_recent_course_changes", "Cours", "Cours modifiés récemment."],
  ["list_mindmaps", "Cours", "Cartes mentales disponibles."],
  ["read_mindmap", "Cours", "Lit une carte mentale."],
  ["list_manuals", "Manuels", "Manuels scolaires officiels et nombre de pages."],
  ["search_manual", "Manuels", "« exercice 12 » → les pages concernées."],
  ["read_manual", "Manuels", "Lecture page par page, jamais le livre d'un coup."],
  ["generate_lesson", "Générer", "Prépare une leçon."],
  ["generate_qcm", "Générer", "Prépare un QCM."],
  ["generate_flashcards", "Générer", "Prépare des flashcards."],
  ["generate_mixed_session", "Générer", "Prépare une session mixte."],
  ["generate_variant", "Générer", "Prépare une variante d'un exercice."],
  ["generate_correction", "Générer", "Prépare une correction."],
  ["prepare_fiche", "Générer", "Prépare une fiche de révision."],
  ["publish_session", "Publier", "Parcours enchaîné : n étapes de formats variés, UN appel, UN lien.", true],
  ["publish_exercise", "Publier", "Publie un exercice seul et renvoie son URL.", true],
  ["create_session", "Publier", "Prépare un parcours sans l'écrire."],
  ["validate_session", "Publier", "Valide un parcours avant publication."],
  ["create_followup_exercise", "Publier", "Rattrapage à partir des questions ratées d'un exercice."],
  ["share_exercise", "Publier", "Partage un exercice."],
  ["wait_for_result", "Résultats", "Attend la fin du parcours ; un résultat par étape (stages[])."],
  ["get_exercise_status", "Résultats", "État d'un exercice, avec wrongItems si erreurs."],
  ["list_recent_exercises", "Résultats", "Historique léger des derniers exercices publiés."],
  ["list_sessions", "Résultats", "Sessions pending, in-progress, partial, completed + toResume."],
  ["list_class_exercises", "Résultats", "Exercices de la classe."],
  ["list_shared_exercises", "Résultats", "Exercices partagés."]
];

/* ---------- installation ---------- */
NEMO.install = [
  { id: "srv", t: "Serveur", flow: ["Branche feature/…", "Pull request", "Fusion sur master", "Tests Node 22", "Déploiement auto"],
    body: [
      "<ol class='steps'><li><div><b>Ne rien déployer à la main.</b> La CI le fait à chaque fusion sur <code>master</code>, tests verts.</div></li><li><div>Vérifier que le serveur répond : 200 avec la page publique sans jeton.</div></li><li><div>Secrets du Worker (une seule fois) : <code>NEMO_TOKEN</code>, <code>ED_IDENTIFIANT</code>, <code>ED_MOTDEPASSE</code>, optionnel <code>GEMINI_API_KEY</code>.</div></li></ol>",
      ["curl -i https://nemo.moideici.tech/", "npm ci && npm test", "# déploiement manuel : possible, plus le chemin normal", "npm run deploy"]
    ] },
  { id: "pc", t: "PC Windows", flow: ["Fusion sur main", "CI « Nemo PC »", "Build 0.1.n", "install.ps1"],
    body: [
      "<ol class='steps'><li><div>Dans le dépôt <code>nemo-pc</code>, lancer le script d'installation : il télécharge le dernier build réussi.</div></li><li><div>La version installée se lit dans <code>%LOCALAPPDATA%\\Programs\\NemoPc\\version.txt</code>.</div></li><li><div>Relier à ton profil avec le <b>code de liaison</b> du site (Paramètres) : pas de jeton à copier.</div></li></ol><div class='note warn'>Réinstaller arrête l'app de blocage (elle tourne en administrateur) : à lancer par l'élève ou avec son accord explicite.</div>",
      ["powershell -File scripts/install.ps1"]
    ] },
  { id: "app", t: "Android", flow: ["Fusion sur main", "CI « Android APK »", "APK 0.17.n signé", "update-app.ps1"],
    body: [
      "<ol class='steps'><li><div>Prérequis : Android 9+, <code>gh</code> connecté avec accès au dépôt, <code>adb</code> et un appareil visible comme <code>device</code>.</div></li><li><div>Le script installe l'APK de la CI par-dessus la version existante (<code>adb install -r</code>) : jeton et réglages conservés.</div></li><li><div>À la première ouverture : QR ou code de liaison du site ; « Avec un jeton » reste disponible.</div></li></ol>",
      ["powershell -File scripts/update-app.ps1", "adb devices"]
    ] },
  { id: "docs", t: "Ce site", flow: ["Éditer site/", "Commit [skip ci]", "Push", "Cloudflare publie"],
    body: [
      "<ol class='steps'><li><div>Site statique : HTML, CSS et JS, sans étape de build. Le dossier <code>site/</code> de <code>nemo-docs</code> est publié tel quel.</div></li><li><div>Aperçu local : n'importe quel serveur statique. Les liens sont relatifs, le site fonctionne à la racine d'un domaine comme dans un sous-dossier.</div></li><li><div>Publication : Cloudflare (Workers avec assets statiques). Voir <code>site/README.md</code> pour le choix du domaine.</div></li></ol>",
      ["cd site", "npx wrangler dev", "# publication (après choix du domaine)", "npx wrangler deploy"]
    ] }
];
