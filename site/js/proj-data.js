/* Données des pages de projets (hors Nemo) : une entrée par projet, rendue par js/proj.js.
   Sources : README, plans et documents de chaque dépôt, bilan des projets du 01/11/2026, `git log` (11/11/2026).
   Pour ajouter un projet : compléter PROJ.list (puis créer <id>/index.html sur le modèle des autres), rien d'autre.
   Règle : ce fichier décrit ce que les dépôts disent d'eux-mêmes ; un chiffre ou un statut est à vérifier dans le dépôt avant de s'y fier. */
window.PROJ = window.PROJ || {};
PROJ.updated = "11/11/2026";
PROJ.gh = "https://github.com/moideici/";
PROJ.statuses = {
  actif: { t: "Actif", cls: "g" },
  veille: { t: "En pause", cls: "y" },
  plan: { t: "Phase de plan", cls: "s" },
  outil: { t: "Outil", cls: "b" }
};

PROJ.list = [
/* ======================================================================== agent-hub */
{
  id: "agent-hub", n: "agent-hub", title: "agent-hub (ah)", status: "actif",
  role: "Claude Code délègue des tâches de code à Codex et à des modèles locaux",
  lead: "Outil en ligne de commande qui permet à <b>Claude Code</b> de confier une tâche bien délimitée à <b>Codex (GPT, connexion OAuth ChatGPT)</b> ou à un modèle local Ollama, dans une copie isolée du dépôt, puis de faire relire le résultat par un second modèle. Aucune installation dans les projets concernés.",
  repo: { name: "agent-hub", branch: "main", priv: true }, tech: ["Node ≥ 20", "zéro dépendance", "git worktree", "Codex CLI"], last: "11/11/2026",
  facts: [
    { v: "2", k: "parties : délégation et coordination" }, { v: "80", k: "tests (README du 04/11)" },
    { v: "a · b", k: "comptes ChatGPT OAuth, un dossier CODEX_HOME chacun" }, { v: "127.0.0.1:4317", k: "dashboard local, jeton obligatoire" }
  ],
  arch: {
    intro: "Le chef de chantier (Claude Code) écrit un brief ; <code>ah</code> crée un worktree <code>agent/&lt;id&gt;</code>, lance l'exécutant, relance lui-même les tests, puis rend la main pour la relecture. Le dépôt principal n'est modifié que par <code>ah merge</code>.",
    layers: [
      { name: "Chef de chantier", items: [{ n: "Claude Code", d: "Spécifie la tâche, relit le diff, fusionne. La skill <b>delegate</b> (junction vers ~/.claude/skills) décrit la procédure." }] },
      { link: "ah run brief.md" },
      { name: "agent-hub", items: [
        { n: "CLI ah", d: "run, review, merge, clean, status, show, accounts, doctor. Détecte seul la commande de tests (npm, pytest, cargo, go, gradle, dotnet, make)." },
        { n: "Worktree isolé", d: "<b>~/.agent-hub/worktrees/&lt;dépôt&gt;/&lt;id&gt;</b> sur une branche agent/&lt;id&gt; issue de HEAD ; node_modules relié par une junction." },
        { n: "Tests du hub", d: "Relancés par le hub lui-même, jamais crus sur parole. En cas d'échec, une correction automatique (<code>--fix N</code>) avec le journal d'échec." }
      ] },
      { link: "codex exec / ollama" },
      { name: "Exécutants", items: [
        { n: "Codex · compte a", d: "~/.codex, la connexion habituelle de l'app Codex." },
        { n: "Codex · compte b", d: "~/.codex-accounts/b, connecté avec <code>codex login --device-auth</code>." },
        { n: "Modèles locaux", d: "<code>--acct 9b|27b|local</code> : Ollama, un seul à la fois. <code>ah gpu</code>, <code>ah ollama</code> et <code>ah bench</code> suivent mémoire, état et qualité." }
      ] },
      { link: "diff + tests + rapport" },
      { name: "Coordination", items: [
        { n: "Dashboard", d: "<code>ah serve</code> : « que dois-je faire maintenant ? » — décisions en attente, travaux en direct, tâches par projet puis par état." },
        { n: "Tâches", d: "<code>ah task add/claim/dispatch/queue/answer</code> : dépendances, file d'attente (3 en parallèle), questions de l'exécutant, audits en lecture seule." },
        { n: "Messages", d: "<code>ah msg</code>, <code>ah say</code>, <code>ah watch</code> : les sessions Claude se parlent ; un message de l'utilisateur est une consigne, celui d'un agent une information." }
      ] }
    ]
  },
  commands: [
    { t: "Installer et vérifier", code: "npm i -g @openai/codex\ncd C:\\Users\\gabor\\code\\agent-hub\nnpm link          # expose la commande ah\nah doctor         # node, git, codex, comptes, tests détectés" },
    { t: "Déléguer, relire, fusionner", code: "ah run brief.md --acct b --effort high --json\nah status\nah show <id> --patch      # TOUJOURS relire le diff\nah merge <id> --squash    # ou : ah clean <id>" },
    { t: "Relecture croisée par Codex", code: "ah review                       # modifications non commitées\nah review --base main --focus \"concurrence\" --json" },
    { t: "Plusieurs tâches d'un coup", code: "ah task add \"titre\" --brief fichier.md --project . --dep T-001\nah task queue T-001 T-002   # partent seules, 3 en parallèle\nah wait T-001 T-002         # attend la fin (en arrière-plan)\nah task answer T-001 \"réponse\"   # si Codex pose une QUESTION:" }
  ],
  sections: [
    { cap: "Principes", title: "Ce que l'outil garantit", cards: [
      { t: "OAuth uniquement", p: "Les variables OPENAI_API_KEY et CODEX_API_KEY sont retirées de l'environnement de Codex : seuls les abonnements ChatGPT sont consommés, jamais l'API facturée." },
      { t: "Le dépôt principal reste intact", p: "Tout se passe dans un worktree jetable. Seul <code>ah merge</code> touche le dépôt ; le hub ne fait jamais de <code>git push</code>." },
      { t: "Sandbox restreint", p: "Codex tourne en workspace-write (écriture limitée au worktree), sandbox Windows <code>unelevated</code> pour éviter les fenêtres UAC. Jamais de mode « bypass »." },
      { t: "Quota respecté", p: "Fenêtre de 5 h et plafond hebdomadaire par compte. Un quota atteint donne le code 2 et l'heure de reprise ; la bascule automatique (<code>autoRotate</code>) est désactivée par défaut." },
      { t: "Détection des doublons de compte", p: "Deux dossiers contenant le même compte ChatGPT partagent un quota : le hub le signale, l'ignore et refuse <code>--acct</code> sur le doublon." },
      { t: "Codes de sortie lisibles", p: "0 ok · 1 échec · 2 quota · 3 délai dépassé · 4 question posée · 10 terminé mais tests en échec." }
    ] },
    { cap: "Coordination", title: "Dashboard, tâches et messages", intro: "Le dashboard n'écoute que sur 127.0.0.1, exige un jeton (cookie HttpOnly, SameSite strict), vérifie l'hôte et l'origine des écritures et n'écrit dans le DOM que par textContent.", cards: [
      { t: "Accueil par décisions", p: "Une question de ChatGPT, un travail à valider, un échec, des messages : ce qui attend l'utilisateur avant le reste." },
      { t: "Sessions Claude", p: "Les conversations sont lues dans les fichiers de l'app desktop ; chaque session se reconnaît via CLAUDE_CODE_SESSION_ID (<code>ah whoami</code>)." },
      { t: "Messages et hooks", p: "Les sessions reçoivent leurs messages par le hook <code>ah inbox --hook</code> ou en lançant <code>ah watch</code> ; une session inactive ne peut pas être réveillée." },
      { t: "Verrous consultatifs", p: "<code>ah lock</code> signale « je travaille sur ce projet » ; <code>ah brief</code> résume ce qui attend la session." }
    ] }
  ],
  state: {
    done: ["Délégation, relecture croisée et fusion sur n'importe quel dépôt git", "Deux comptes ChatGPT et détection des quotas", "Coordination : dashboard, tâches, file d'attente, messages", "Audits en lecture seule sans branche laissée", "Modèles locaux Ollama (9b, 27b) et banc de mesure"],
    wip: ["Les hooks SessionStart (<code>ah brief --hook</code>) ne sont pas posés : à ajouter à la main dans ~/.claude/settings.json", "Bascule automatique entre comptes : désactivée tant que les conditions d'utilisation d'OpenAI n'ont pas été relues"],
    risks: ["Incident du 27/10/2026 : <code>ah merge</code> avait vidé le vrai node_modules de nemo-https en supprimant le worktree à travers une junction ; corrigé, test de non-régression en place. Après un nettoyage, vérifier node_modules sur les projets qui en ont un", "Un hub de démonstration avec des tâches en file lance de VRAIS runs sur de vrais dépôts sauf si sa config ne déclare qu'un faux compte déconnecté"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Installation, comptes, utilisation, détection des tests, sécurité." },
    { t: "Coordination et dashboard", f: "docs/COORDINATION.md", d: "API, sécurité et fonctionnement du dashboard." },
    { t: "Fonctions avancées", f: "docs/FONCTIONS-AVANCEES.md", d: "File d'attente, correction automatique, questions, résultats, audits, verrous, archivage." },
    { t: "Skill delegate", f: "skills/delegate/", d: "La procédure suivie par Claude Code pour déléguer." }
  ]
},

/* ======================================================================== Prisme */
{
  id: "prisme", n: "Prisme", title: "Prisme", status: "actif",
  role: "Éditeur d'images bitmap et vectorielles pour Windows",
  lead: "Éditeur d'images pour Windows qui combine <b>retouche bitmap</b> (calques, sélections, filtres, GIF animé) et <b>dessin vectoriel</b> (plume, nœuds, SVG, PDF), avec un agencement inspiré de PhotoFiltre. Écrit en Rust et React avec Tauri 2, licence MIT, interface en français. Ne pas confondre avec la « collection Prisme » de WikiCards.",
  repo: { name: "photo-editor", branch: "main", priv: true }, tech: ["Rust", "Tauri 2", "React 19 + TypeScript", "Vite 6", "Rhai"], last: "11/11/2026",
  facts: [
    { v: "v17", k: "format de projet .prisme (lecture des versions 1 à 17)" }, { v: "1.4", k: "dernier jalon livré en installateurs ; package.json annonce 1.5.0" },
    { v: "4 / 14", k: "lots d'expérience : 10 grands lots restent ouverts (bilan du 27/10)" }, { v: "3", k: "familles de plugins : Prisme/Rhai, 8BF, PFL" }
  ],
  arch: {
    intro: "Une interface React tourne dans la WebView de Tauri ; le moteur d'image, les formats et l'isolation des plugins sont en Rust. Les plugins externes tournent dans des processus enfants séparés.",
    layers: [
      { name: "Interface", items: [{ n: "src/ (React + TypeScript)", d: "Atelier : barres d'outils, calques à gauche, couleurs, outils et options à droite, onglets, recherche Ctrl K, aperçus de réglages." }] },
      { link: "IPC Tauri" },
      { name: "Moteur (src-tauri, Rust)", items: [
        { n: "Bitmap", d: "Calques, sélections progressives, retouche (clonage, correcteur, doigt…), courbes et niveaux, effets de calque non destructifs, palette indexée, GIF animé." },
        { n: "Vectoriel", d: "Plume Bézier, nœuds, opérations booléennes, groupes imbriqués, dégradés, motifs, masques, filtres SVG, texte sur tracé, vectorisation d'un bitmap." },
        { n: "Fichiers", d: "Projets .prisme v17, PSD RVB 8 bits avec calques, AVIF, HEIC (si codec Windows), aperçu RAW, EXIF ; exports SVG optimisé et PDF vectoriel." }
      ] },
      { link: "processus enfant isolé" },
      { name: "Plugins", items: [
        { n: "Prisme / Rhai", d: "Scripts du langage Rhai ; SDK dans plugin-sdk/." },
        { n: "Filtres Photoshop 8BF", d: "Catalogue, dialogue, préréglages ; sélection et alpha respectés ; contrat x64." },
        { n: "PhotoFiltre PFL", d: "Plugins Unicode x64, expérimental : bitmaps BGR24, sélection, alpha, annulation, dialogues Win32 modaux." }
      ] }
    ]
  },
  commands: [
    { t: "Développement", code: "npm install\nnpm run tauri dev      # application en développement\nnpm run tauri build    # paquets Windows (NSIS, MSI)" }
  ],
  sections: [
    { cap: "Fonctionnalités", title: "Ce que l'éditeur sait faire", cards: [
      { t: "Sélections et retouche", p: "Lasso, polygone, baguette, sélection par couleur, combinaisons, contour, sélections mémorisées ; clonage aligné, correcteur, aérographe, tubes." },
      { t: "Réglages", p: "Courbes interactives PCHIP et histogramme, niveaux, remplacement et mélangeur de couleurs, désaturation sélective." },
      { t: "Vectoriel avancé", p: "Groupes éditables, 17 modes de fusion, dégradés, motifs, masques, dix-sept familles d'effets SVG en chaînes, polices variables, styles de texte." },
      { t: "Actions et lots", p: "Commandes enregistrées rejouables, lots sans remplacement de fichiers, poursuite après erreur, annulation entre étapes." },
      { t: "Confort", p: "Vraies miniatures de calques, calques multiples et verrous, onglets indépendants, récupération automatique après interruption (60 s)." },
      { t: "Interopérabilité", p: "Import PFV de PhotoFiltre (dix fichiers de référence comparés à un lecteur SVG indépendant), plugins 8BF et PFL." }
    ] }
  ],
  state: {
    done: ["Éditeur bitmap et vectoriel complet du jalon 1.4", "Projet v17 avec migration vérifiée depuis v16", "Quatre lots d'expérience (III.1 à III.4) et import PFV", "Preuves 1.4 : 214 contrôles sur le portable et sur les payloads NSIS/MSI"],
    wip: ["Dix grands lots ouverts sur les quatorze du nouveau plan", "Agencement proche de PhotoFiltre 11 : relevé détaillé des commandes à compléter", "Phase 4 plugins : comparaison PFL dans PhotoFiltre et essai d'un plugin PFL tiers x64 ouverts", "Pack original d'extensions PFL prévu"],
    risks: ["L'installation et la mise à niveau complètes des installateurs ne sont pas prouvées", "Pas de calques de réglage ni de masques bitmap rééditables, pas de GPU ni d'ICC, pas de compatibilité universelle des plugins", "PSD ne signifie pas un aller-retour Photoshop : textes et objets dynamiques sont des caches bitmap ; RAW = aperçu JPEG, pas de développement du capteur"]
  },
  docs: [
    { t: "README", f: "README.md", d: "État du chantier, formats, plugins, limites." },
    { t: "BILAN_ACTUEL", f: "BILAN_ACTUEL.md", d: "Ce qui est livré, développé et restant (27/10/2026)." },
    { t: "PLAN", f: "PLAN.md", d: "Les 14 lots du plan courant, dans l'ordre." },
    { t: "EXECUTION et IMPLEMENTATION", f: "EXECUTION.md", d: "Suivi d'exécution courant et jalons historiques." },
    { t: "INTEROP", f: "INTEROP.md", d: "Références PhotoFiltre." },
    { t: "Plugins : 8BF, PFL, PFL_ABI", f: "8BF.md", d: "Contrats, limites et preuves de chaque famille." },
    { t: "Vectoriel : GROUPES, PEINTURES, MOTIFS, SVG_*", f: "GROUPES.md", d: "Groupes, dégradés, motifs, masques, filtres, feImage." },
    { t: "VECTORISATION et TEXTE_SUR_TRACE", f: "VECTORISATION.md", d: "Bitmap vers tracés, texte sur tracé." }
  ]
},

/* ======================================================================== multi */
{
  id: "multi", n: "multi", title: "multi", status: "actif",
  role: "Mini-jeux multijoueurs en français, pour téléphone",
  lead: "Collection de <b>33 mini-jeux</b> multijoueurs (2 à 20 joueurs, 1 à 15 minutes) pensés pour le téléphone et les transports en commun : salles par code ou QR, reconnexion, bots, sans compte et sans traqueur. En ligne sur un Worker Cloudflare, avec un miroir sans serveur pour les parties locales.",
  repo: { name: "multi", branch: "main", priv: true }, tech: ["TypeScript strict", "Preact + Vite", "Cloudflare Workers", "Durable Objects", "vitest"], last: "31/10/2026",
  facts: [
    { v: "33", k: "jeux jouables" }, { v: "70", k: "commits" }, { v: "103", k: "fichiers de tests (bilan du 01/11)" }, { v: "1 ligne", k: "SQLite par salle, aucun journal" }
  ],
  arch: {
    intro: "Le même cœur de salle pur (<code>RoomCore</code>) tourne dans le navigateur (parties locales) et dans un Durable Object (parties en ligne). Le serveur est l'arbitre : le client envoie une intention, la salle valide et renvoie à chacun sa propre vue ; l'état complet n'est jamais envoyé.",
    layers: [
      { name: "Client (web/)", items: [
        { n: "Vite + Preact", d: "Routage par hash (<code>#/salle/ABCD</code>), un chunk par jeu, PWA ; un seul build pour la racine et pour /multi/." },
        { n: "Transports", d: "<b>LoopbackTransport</b> (navigateur, miroir sans serveur) ou <b>WebSocketTransport</b> (wss) vers le Worker." }
      ] },
      { link: "intentions · vues filtrées par siège" },
      { name: "Salle (packages/room)", items: [
        { n: "RoomCore", d: "Machine à états pure sur un état JSON : joueurs, hôte, bots, spectateurs, options, mode soirée, minuteurs, reconnexion, limitation de débit. Horloge et aléatoire injectés." },
        { n: "Protocole", d: "Messages C2S/S2C ; <code>handle</code>, <code>closed</code>, <code>alarm</code> renvoient un pas (état, sorties, prochaine alarme)." }
      ] },
      { link: "GameDefinition" },
      { name: "Moteurs (packages/engines)", items: [
        { n: "Un dossier par jeu", d: "Moteur pur et déterministe : aucun DOM, aucune horloge, aucune E/S, RNG à graine. Partagé client et serveur." },
        { n: "Bots", d: "<code>bot.act(state, seat, rng)</code> synchrone et léger ; à défaut, la salle joue un coup légal au hasard. Garry doit fournir les bots de jeux de plateau (voir la page Garry)." }
      ] },
      { link: "wss /ws/<CODE>" },
      { name: "Serveur (server/)", items: [
        { n: "Worker Cloudflare", d: "<code>/ws/&lt;CODE&gt;</code> et <code>/api/health</code> ; le site statique ne passe pas par le code du Worker (<code>run_worker_first</code> limité à /ws et /api)." },
        { n: "Durable Object Room", d: "WebSocket Hibernation, une ligne SQLite par salle, ménage par alarme (salles vides ou inactives supprimées)." }
      ] }
    ]
  },
  commands: [
    { t: "Développer", code: "npm install\nnpm run dev          # http://localhost:5173\nnpm test             # registre des jeux puis vitest\nnpm run typecheck\nnpm run build        # web/dist" },
    { t: "Serveur local et contrôles", code: "npm run server:dev   # wrangler dev, http://127.0.0.1:8787 (après build)\nnode scripts/smoke-online.mjs --url ws://127.0.0.1:8787\nnode scripts/verify-deploy.mjs https://multi.moideici.tech web/dist" }
  ],
  sections: [
    { cap: "Catalogue", title: "Les 33 jeux", intro: "Plateau, cartes, dés, quiz, réflexes et jeux sociaux, tous avec leur moteur pur.", cards: [
      { t: "Plateau", p: "Morpion, morpion ultime, puissance 4, dames, échecs, Othello, awalé, jeu du moulin, allumettes, bataille navale, dominos." },
      { t: "Parcours et dés", p: "Jeu de l'oie, serpents et échelles, petits chevaux, Yams, Cochon, dés du menteur, coffres et pièges." },
      { t: "Cartes", p: "Bataille, huit américain, président, Memory." },
      { t: "Mots, quiz, réflexes", p: "Mastermind, pendu, petit bac, quiz éclair, calcul flash, réflexes, course de frappe." },
      { t: "Jeux sociaux", p: "L'intrus, mission secrète, dessin à deviner, Loup-Garou." }
    ] },
    { cap: "Règles du projet", title: "Qualité et sobriété", cards: [
      { t: "Un jeu n'est déployé que s'il passe", p: "Tests du moteur (parties aléatoires, fuites d'information, déterminisme), rendu de la vue pour chaque siège et le spectateur, build, contrôle après déploiement, essai de bout en bout salle + bots." },
      { t: "Budget Cloudflare", p: "Plan gratuit partagé : 100 000 requêtes Durable Objects par jour pour tout le compte. Hibernation, aucun polling, messages groupés, une seule ligne SQLite par salle." },
      { t: "Règles pour les agents", p: "Aucun emoji (un test échoue sinon), toute ressource externe créditée dans <code>web/src/credits.ts</code>, moteurs purs, pas de fichier central par jeu (AGENTS.md)." },
      { t: "Déploiement manuel", p: "Le workflow <code>deploy-worker.yml</code> ne se lance qu'à la demande." }
    ] }
  ],
  state: {
    done: ["33 jeux jouables, en ligne et en local", "Salles par code et QR, reconnexion, bots, mode soirée", "Derniers ajouts : Loup-Garou, Dessin à deviner, Petit bac, L'intrus, jeux de bluff et de cartes"],
    wip: ["Solveur exact de puissance 4 (solver.ts, livre d'ouverture, test) : travail non commité au 01/11, à valider (exactitude, coût CPU Cloudflare, poids du livre ≈ 200 Ko)", "Intégration des bots de Garry : contrat asynchrone et poids hors du chemin critique à concevoir (docs/BOTS.md)"],
    risks: ["L'origine du livre d'ouverture doit être créditée dans credits.ts", "web/README.md décrit encore le mode en ligne comme futur", "Le plan gratuit Cloudflare est partagé avec un autre projet qui peut consommer jusqu'à 68 000 requêtes certains jours", "L'adresse du miroir GitHub Pages est à revérifier après le changement de nom d'utilisateur GitHub"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Démarrer, organisation, qualité avant déploiement, règles." },
    { t: "Architecture", f: "docs/ARCHITECTURE.md", d: "Vue d'ensemble, RoomCore, protocole, transports." },
    { t: "Ajouter un jeu", f: "docs/GAMES.md", d: "Le contrat GameDefinition et la marche à suivre." },
    { t: "Budget Cloudflare", f: "docs/BUDGET.md", d: "Limites du plan gratuit et principes d'économie." },
    { t: "Bots", f: "docs/BOTS.md", d: "Contrat actuel et intégration prévue de Garry." },
    { t: "AGENTS.md", f: "AGENTS.md", d: "Règles pour les agents de code." }
  ]
},

/* ======================================================================== Garry / Logic Lab */
{
  id: "garry", n: "Garry · Logic Lab", title: "Garry et Logic Lab", status: "actif",
  role: "Laboratoire d'IA : un seul modèle pour quatorze jeux logiques, et un modèle de dialogue en français",
  lead: "<b>Logic Lab</b> regroupe deux projets aux mesures séparées : <b>Garry</b>, un réseau unique qui joue à quatorze jeux (dont le Go en 9, 13 et 19), et <b>Input</b>, une adaptation de Qwen3-0.6B pour comprendre le français et répondre en JSON. S'y ajoutent des recherches (HRM, TRM) tenues à l'écart des modèles actifs.",
  repo: { name: "logic-lab", branch: "master", priv: true }, tech: ["Python", "PyTorch / CUDA", "JavaScript", "C++", "LoRA"], last: "31/10/2026",
  facts: [
    { v: "0.6.0", k: "version de Garry (en développement)" }, { v: "444 979", k: "paramètres : 4 872 → 48 → 48 → 4 259" },
    { v: "14", k: "jeux, niveaux d'IA 0 à 10" }, { v: "≈ 21 Go", k: "de données hors dépôt (bilan du 01/11)" }
  ],
  arch: {
    intro: "Deux serveurs Python locaux, un par projet, sans partage de poids ni de mémoire : les liens entre les interfaces sont des liens de navigation. Chacun garde son dépôt Git, ses données et ses mesures.",
    layers: [
      { name: "Dossier de travail", items: [
        { n: "projets/garry", d: "Serveur sur le port 8765 : jeux, arène, entraînement continu, harnais de sites réels." },
        { n: "projets/input", d: "Serveur sur le port 8766 : conversation et bilan d'apprentissage." },
        { n: "recherche/hrm · trm", d: "Prototype symbolique de sudoku et canal continu expérimental ; TRM comme référence, pas un modèle activé." },
        { n: "outputs · work", d: "Rapports et preuves ; environnement Python local." }
      ] },
      { link: "décision" },
      { name: "Garry : qui décide un coup", items: [
        { n: "Réseau neuronal", d: "Un seul modèle, zones d'entrée et de sortie propres à chaque jeu et module central commun." },
        { n: "Recherche et solveurs", d: "Recherche bornée distinguant issues prouvées et estimations ; solveurs exacts pour certains jeux." },
        { n: "Professeur borné", d: "Source d'exemples d'entraînement. « Accord avec le professeur » n'est pas un taux de victoire." }
      ] },
      { link: "candidat → validation → promotion" },
      { name: "Entraînement", items: [
        { n: "Sessions locales bornées", d: "Exemples séparés par familles entre apprentissage, validation et test ; un candidat doit préserver la validation fixe avant installation." },
        { n: "Jeux réels", d: "Harnais Playwright : joue sur 2048 original et COSUMI avec les contrôles normaux, chaque transition est vérifiée et rejouée." }
      ] },
      { link: "Input : chaîne de réponse" },
      { name: "Input 0.2.0", items: [
        { n: "Contexte borné", d: "Jusqu'à 21 messages récents et 2 400 tokens de prompt." },
        { n: "Qwen3-0.6B + LoRA", d: "Adaptation active focus-20261017-210925/checkpoint-1000 ; ce n'est pas un modèle de conversation entraîné de zéro." },
        { n: "Décodage contraint", d: "JSON <code>texte</code> + <code>valeurs</code>, validé et sérialisé avant affichage." }
      ] }
    ]
  },
  commands: [
    { t: "Lancer Garry", code: "cd projets/garry\npython -m logic_arena serve --port 8765   # http://127.0.0.1:8765" },
    { t: "Harnais de jeux réels", code: "npm ci --prefix tools/real-games\nnpx --prefix tools/real-games playwright install chromium" }
  ],
  sections: [
    { cap: "Garry 0.6.0", title: "Quatorze jeux, un modèle", cards: [
      { t: "Les jeux", p: "Morpion, Puissance 4, 2048, sudoku, démineur, taquin, Reversi 6×6, Nim, Lights Out, dames internationales, Percée, Hex 7×7, Gomoku 15×15 Swap2 et Go 9/13/19." },
      { t: "Modes et niveaux", p: "Niveaux 0 à 10, niveaux indépendants en duel, transitions visibles dans le navigateur, modes humains, difficultés et tailles de puzzles ; sudoku à trois vies pour l'IA." },
      { t: "Dernière session", p: "30 minutes le 17/10/2026 : 102 762 coups, 540 cycles, dix promotions ; les onze autres jeux sont préservés quand Go, Hex et Gomoku s'entraînent." },
      { t: "Résultats prudents", p: "Accord avec le professeur borné : Go 15,41 → 17,29 %, Hex 40,83 → 42,92 %, Gomoku 17,40 → 22,06 %. Ce ne sont pas des taux de victoire." },
      { t: "Vérifications archivées", p: "114 tests Python et 65 JavaScript. Elles ne remplacent pas une nouvelle recette complète du site." }
    ] },
    { cap: "Input 0.2.0 et recherche", title: "Dialogue en français et raisonnement", cards: [
      { t: "Objectif", p: "Comprendre une demande, distinguer objectif, faits, préférences, contraintes et inconnues, décider et justifier ; trois usages : problèmes à contraintes, plans réalisables, comparaison de scénarios." },
      { t: "Mesures", p: "Validation : 7/28 → 25/28 ensembles de valeurs exacts après adaptation. Tests réservés : 36/36 JSON complets, 29/36 valeurs exactes ; calculs 5/12." },
      { t: "HRM et TRM", p: "HRM symbolique avec poids officiels de sudoku ; entrée continue préparée. Un des deux contrôles publics de sudoku réussit, l'autre échoue." }
    ] }
  ],
  state: {
    done: ["Garry 0.6.0 : quatorze jeux jouables, entraînement continu et harnais de jeux réels", "Puissance 4 : solveur exact et livre d'ouverture (porté vers multi) ; nim et morpion parfaits ; dames par distillation", "Input : interface prête, banc de régression gelé, contrat JSON v2 prêt mais non activé"],
    wip: ["Chantier actif : famille Garry et Lab — Core entraînable, Graine (croissance et élagage), Loop (cœur récurrent), Lab en direct", "Input en veille : il reste le lot 4 (données ciblées)", "Intégration des bots dans multi (voir la page multi)", "Rendre la reprise reproductible et geler un banc de maths neuf ; aligner README, guide et plan, en partie contradictoires"],
    risks: ["Les dossiers projets/ et recherche/ (poids et sources actives, plusieurs dizaines de Go) sont exclus du dépôt : aucune sauvegarde externe confirmée", "Niveau Go faible, tactiques inégales, recherches bornées ; l'invincibilité n'est pas démontrée", "Input hallucine encore, répond de façon générique ou tronquée ; calculs fragiles ; débit de l'ordre de 6 à 16 tokens/s", "Le navigateur peut garder des poids personnels plus anciens : l'identité des poids utilisés doit être rendue explicite"]
  },
  docs: [
    { t: "README du dossier", f: "README.md", d: "Ordre de lecture et points d'entrée." },
    { t: "PLAN-GLOBAL", f: "PLAN-GLOBAL.md", d: "Bilan, périmètre actif et objectifs ; fait autorité sur les anciens rapports." },
    { t: "Guide", f: "docs/GUIDE.md", d: "Arborescence, lancement, vérifications, sauvegardes, reprise." },
    { t: "Architecture", f: "docs/ARCHITECTURE.md", d: "Composants et circulation des informations." },
    { t: "Décisions", f: "docs/DECISIONS.md", d: "Décisions, raisons et sujets ouverts." },
    { t: "Garry", f: "projets/garry/README.md", d: "Les quatorze jeux, l'entraînement et l'historique des versions." }
  ]
},

/* ======================================================================== WikiCards */
{
  id: "wikicards", n: "WikiCards", title: "WikiCards", status: "veille",
  role: "Cartes à collectionner tirées de Wikipédia",
  lead: "Jeu de <b>cartes à collectionner</b> dont chaque carte est un article de Wikipédia : des boosters à mériter (booster du jour, quiz, lectures, objectifs), une rareté fondée sur les vues de l'article sur 12 mois, des animations de révélation en WebGL. Projet de fan, privé, pour quelques amis.",
  repo: { name: "wikicards", branch: "main", priv: true }, tech: ["JavaScript natif", "IndexedDB", "WebGL2", "Kotlin (WebView)", "Supabase"], last: "15/10/2026",
  facts: [
    { v: "15 235", k: "articles : 6 798 FR, 6 678 EN, 1 759 hors classement" }, { v: "8", k: "paliers de rareté, de Commun à Transcendant" },
    { v: "56", k: "Légendes : 50 numérotées et 6 secrètes" }, { v: "25", k: "commits, arbre propre au 01/11" }
  ],
  arch: {
    intro: "Un seul rendu web, embarqué tel quel dans une coquille Android et publié sur GitHub Pages. Le tirage et la collection sont locaux, puis synchronisés avec Supabase.",
    layers: [
      { name: "Données", items: [
        { n: "pipeline/", d: "Collecteur (API Wikimedia, Wikidata), assemblage et validation du catalogue ; seuils de rareté dans <code>tiers.json</code>." },
        { n: "data/catalog.json", d: "Catalogue produit, avec état de reprise et rapport." }
      ] },
      { link: "build-catalog" },
      { name: "Application", items: [
        { n: "web/", d: "Modules JS (tirage, économie, boosters, quiz, objectifs, synchronisation), styles, rendu de carte partagé, tests. Animations : Canvas et WebGL2." },
        { n: "android/", d: "Coquille Kotlin (WebView) qui embarque web/ et le catalogue ; <code>tools/build-android.py</code> prépare le contenu." }
      ] },
      { link: "sync (compte facultatif)" },
      { name: "Serveur", items: [
        { n: "Supabase", d: "Schéma SQL, droits d'accès et tests sur PostgreSQL en mémoire ; comptes créés par le créateur, sans e-mail à envoyer. Schéma prêt, à appliquer sur le projet." }
      ] }
    ]
  },
  commands: [
    { t: "Aperçu et tests", code: "python tools/serve.py --port 8766        # http://127.0.0.1:8766/web/\nnode --test pipeline/*.test.mjs web/tests/*.test.mjs\ncd supabase && npm install && npm test\npython pipeline/validate-catalog.py" },
    { t: "Construire l'APK", code: "python tools/build-android.py            # --embed-images : +30 Mo d'images\ncd android\n.\\gradlew.bat assembleDebug" }
  ],
  sections: [
    { cap: "Règles du jeu", title: "Les choix validés", intro: "docs/DECISIONS.md fait foi quand un autre document dit autre chose.", cards: [
      { t: "Boosters à mériter", p: "Boosters de 5 cartes, ouverture par 1, 10 ou 100 ; à partir de 10, seules les plus belles cartes (Épique et au-delà, Légendes) sont révélées une à une. Se gagnent : booster du jour, quiz, lectures, recyclage de doublons, objectifs, défi de la semaine." },
      { t: "Rareté", p: "Huit paliers de Commun à Transcendant ; seuils de vues sur 12 mois (50 k à 800 k), taux de tirage de 52 % à 0,1 %. Source unique : <code>pipeline/tiers.json</code>." },
      { t: "Trois collections", p: "Français (mesuré), anglais (seuils plus élevés, calculés par quantiles) et « Hors classement » pour les articles sans mesure." },
      { t: "Édition Légende", p: "56 personnes choisies à la main, 15 % de chance pour un article éligible. Six Légendes secrètes numérotées 0 à −5 (Léonard de Vinci, Albert Einstein, Michael Jackson, Mozart…)." },
      { t: "Collection Prisme", p: "Proposition de 56 cartes validée, chacune choisie pour ce qu'elle donne à l'écran, avec sa propre animation (docs/PRISME.md). Sans rapport avec l'éditeur d'images Prisme." },
      { t: "Licences", p: "Textes : Wikipédia, CC BY-SA 4.0. Les photos gardent leur licence individuelle, indiquée dans la fiche de chaque carte." }
    ] }
  ],
  state: {
    done: ["Catalogue complet, collecte terminée", "Boosters à mériter, quiz, objectifs et défi de la semaine", "Collection locale, compte facultatif pour la sauvegarder et la montrer aux amis", "Laboratoire d'animations (web/lab.html)"],
    wip: ["Supabase : schéma et synchronisation prêts, à appliquer sur le projet réel", "Finir la collection Prisme", "Tests sur téléphone et APK signé"],
    risks: ["Les récompenses sont calculées côté client : triche possible", "La synchronisation entre deux appareils n'est pas validée sur un Supabase réellement déployé", "Projet en pause depuis le 15/10/2026"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Carte du dossier, lancement, état." },
    { t: "Décisions validées", f: "docs/DECISIONS.md", d: "Règles du jeu, rareté, technique." },
    { t: "Concept des boosters", f: "docs/CONCEPT-BOOSTERS.md", d: "Boosters à mériter, objectifs, défi de la semaine." },
    { t: "Supabase", f: "docs/SUPABASE.md", d: "Mise en place du serveur." },
    { t: "Plan et roadmap", f: "docs/PLAN.md", d: "Plan de remise à niveau." },
    { t: "Animations", f: "docs/ANIMATIONS.md", d: "Principe et réglages des animations." }
  ]
},

/* ======================================================================== py2x */
{
  id: "py2x", n: "py2x (ia)", title: "py2x : Python typé vers C++ et Kotlin", status: "veille",
  role: "Convertisseur source-à-source, socle C++ et applications de démonstration",
  lead: "Le dossier <code>ia</code> contient <b>py2x</b>, un convertisseur de Python typé vers C++20 et Kotlin, un socle C++ de gestion mémoire et des applications de démonstration générées (TaskDesk, MindMap). Le principe : le même programme, converti puis exécuté, doit produire une sortie identique à celle de Python.",
  repo: { name: "ia (dossier local, sans dépôt GitHub)", branch: "master", priv: true, nourl: true }, tech: ["Python 3", "C++20", "Kotlin/JVM", "CMake"], last: "04/10/2026",
  facts: [
    { v: "≈ 60", k: "programmes de corpus, sortie identique octet pour octet" }, { v: "8", k: "fuzzers différentiels contre Python" },
    { v: "58", k: "méthodes de test du transpileur" }, { v: "1", k: "commit au total (04/10/2026)" }
  ],
  arch: {
    intro: "Le frontend lit l'<code>ast</code> Python et le transforme en une représentation intermédiaire typée et neutre ; chaque langage cible a son propre émetteur. Ajouter un langage revient à écrire un émetteur.",
    layers: [
      { name: "Frontend", items: [{ n: "ast Python → IR typée", d: "Types : int, float, bool, str, list, dict, tuple, set, deque, Optional, Callable, classes, dataclasses, Enum. Le non supporté lève une erreur explicite avec le numéro de ligne (code 2)." }] },
      { link: "IR neutre" },
      { name: "Émetteurs", items: [
        { n: "emit_cpp.py", d: "C++20 ; s'appuie sur le socle cpp_base." },
        { n: "emit_kotlin.py", d: "Kotlin/JVM." }
      ] },
      { link: "--verify" },
      { name: "Vérification", items: [
        { n: "Corpus", d: "Chaque programme de examples/, corpus/, corpus2/ et corpus3/ est converti, compilé, exécuté et comparé à Python, en C++ comme en Kotlin." },
        { n: "Fuzzers différentiels", d: "Des milliers de programmes aléatoires (expressions, formats, tris, alias, classes, Optional, collections) comparés ligne à ligne." }
      ] },
      { name: "Autour", items: [
        { n: "cpp_base", d: "Socle C++20 : Arena (reset en O(1)), Pool, SmallVector, suivi des allocations. Mesure sur 1 M d'objets : new/delete ≈ 45 ms, pool ≈ 8,5 ms, arène ≈ 0,5 ms." },
        { n: "android/ · projects/", d: "Générateurs d'applications Android et applications de démonstration (TaskDesk, mindmap_portable)." }
      ] }
    ]
  },
  commands: [
    { t: "Convertir et vérifier", code: "python -m py2x programme.py --to cpp                 # C++ sur stdout\npython -m py2x programme.py --to kotlin -o Prog.kt\npython -m py2x programme.py --verify                 # convertit, compile, exécute, compare avec Python\npython -m py2x programme.py --to cpp --strict        # refuse un int utilisé là où un float est annoté" },
    { t: "Socle C++", code: "cmake -S cpp_base -B build -G \"MinGW Makefiles\"\ncmake --build build\nctest --test-dir build" }
  ],
  sections: [
    { cap: "Sémantique reproduite", title: "Ce que le convertisseur garantit", cards: [
      { t: "Arithmétique et formats", p: "Division et modulo arrondis vers le bas, indices négatifs, repr exact des flottants, mini-langage de format (<code>{x:>8.3f}</code>, <code>{n:,}</code>, <code>%d</code>)." },
      { t: "Collections", p: "Tri stable avec key, ordre d'insertion des dict, ordre d'itération des sets d'entiers de CPython (table de hachage émulée), alias de listes et dicts." },
      { t: "Exceptions", p: "Hiérarchie complète (ZeroDivisionError, IndexError, KeyError…) avec les mêmes messages que Python ; try/except/else/finally." },
      { t: "Aléatoire", p: "Mersenne Twister de CPython : <code>random.seed(42)</code> donne les mêmes tirages ; heapq avec les mêmes algorithmes." },
      { t: "Classes", p: "Héritage simple, super(), méthodes virtuelles, classes abstraites, dataclasses (frozen, order, __post_init__), NamedTuple." }
    ] }
  ],
  state: {
    done: ["Transpileur Python → C++ et Kotlin avec garantie par corpus et fuzzers", "Socle mémoire C++ avec bancs et tests", "Applications de démonstration (TaskDesk, MindMap)"],
    wip: ["Ajouter un README à la racine du dossier (il n'y en a pas)", "Décider du sort des fichiers non suivis : nemo-review/ et projects/mindmap_portable/ (dont MindMap.exe)"],
    risks: ["Un seul commit pour tout ce travail : fragile, aucun dépôt distant", "La référence à bench/bench.cpp est cassée (fichier absent)", "Le chiffre « environ 88 fichiers de test » annoncé ailleurs n'est pas confirmé : 58 méthodes dans transpiler/tests/test_py2x.py"]
  },
  docs: [
    { t: "README du transpileur", f: "transpiler/README.md", d: "Principe, garantie, sous-ensemble supporté." },
    { t: "README du socle C++", f: "cpp_base/README.md", d: "Arena, Pool, SmallVector, suivi, mesures." },
    { t: "Tests", f: "transpiler/tests/", d: "Tests unitaires et fuzzers différentiels." }
  ]
},

/* ======================================================================== cppt (C-suit) */
{
  id: "cppt", n: "cppt (C-suit)", title: "cppt : rendu fidèle de PowerPoint", status: "actif",
  role: "Rendu de fichiers .pptx le plus fidèle possible, animations et transitions comprises",
  lead: "Le dépôt <b>C-suit</b> (branche <code>cppt</code>) rend des présentations PowerPoint en images avec une fidélité maximale, avec deux moteurs : un moteur <b>autonome</b> (Skia, sans Office) et un moteur <b>natif</b> qui passe par l'export de PowerPoint. L'objectif actif — 100 % exact en autonome sur une présentation entière, animations et transitions comprises — n'est pas atteint.",
  repo: { name: "C-suit", branch: "cppt", priv: true }, tech: ["Node.js", "Skia", "PowerShell + COM", "Tauri"], last: "15/10/2026",
  facts: [
    { v: "193 / 193", k: "diapositives 100 % exactes en mode natif (16 présentations)" }, { v: "82,82 %", k: "pixels identiques en mode autonome, sur le même corpus" },
    { v: "99,50 %", k: "score tolérant du moteur autonome" }, { v: "0", k: "image exacte pendant une morphose (lecture temporelle expérimentale)" }
  ],
  arch: {
    intro: "Un module de rendu statique choisit son moteur ; un banc de fidélité compare chaque rendu à une référence exportée par PowerPoint, avec deux métriques séparées : exacte (tous les canaux RGBA) et tolérante (pixelmatch).",
    layers: [
      { name: "Entrée", items: [{ n: "Fichier .pptx", d: "Ouvert en lecture seule ; SHA-256 conservé et vérifié pendant le rapport." }] },
      { link: "renderPresentation" },
      { name: "Moteurs (src/backends.mjs)", items: [
        { n: "skia (défaut)", d: "Autonome : lecture OPC/XML, thèmes, héritage master/layout, formes DrawingML, texte, tableaux, graphiques en colonnes groupées. Ne nécessite pas Office." },
        { n: "native", d: "Windows + PowerShell + PowerPoint : export PNG par PowerPoint. Macros désactivées, document en lecture seule, session préexistante conservée." },
        { n: "auto", d: "Essaie native, puis skia avec un avertissement explicite." }
      ] },
      { link: "PNG + render.json" },
      { name: "Banc de fidélité", items: [
        { n: "tools/fidelity.mjs", d: "Rapport report.json et report.html (références, candidats, différences) ; <code>--require-exact</code> échoue à la moindre différence." },
        { n: "tools/corpus.mjs", d: "Validation d'un dossier de présentations." }
      ] },
      { name: "Mouvement (expérimental)", items: [
        { n: "motion-inspect · morph-frames", d: "Arbres temporels, transitions modernes dont Morphose, lecteur de positions, tailles, rotations, fondus et balayages." },
        { n: "app/ (Tauri)", d: "Atelier de transitions : studio d'images clés, morphose, mode présentateur ; édition PowerPoint + effets Cppt écrits dans une partie XML du PPTX." }
      ] }
    ]
  },
  commands: [
    { t: "Rendre une présentation", code: "npm ci\nnode tools/render.mjs \"presentation.pptx\" --backend skia --out out/skia\nnode tools/render.mjs \"presentation.pptx\" --backend native --out out/native\nnode tools/render.mjs \"presentation.pptx\" --backend auto --slides 1,3 --width 1920" },
    { t: "Mesurer la fidélité", code: "node tools/fidelity.mjs \"presentation.pptx\" --backend native --require-exact\nnode tools/corpus.mjs \"dossier\" --backend native --out out/validation --require-exact\nnpm test" },
    { t: "Lecture temporelle expérimentale", code: "node tools/motion-inspect.mjs presentation.pptx out/motion/model.json\nnode tools/morph-frames.mjs presentation.pptx --from 1 --to 2 --out out/morph" }
  ],
  sections: [
    { cap: "Fidélité", title: "Deux métriques, jamais confondues", cards: [
      { t: "Exacte", p: "Tous les canaux RGBA de chaque pixel identiques ; verdict sur les entiers, jamais sur un pourcentage arrondi. Une référence manquante ou une taille différente rend la couverture incomplète." },
      { t: "Tolérante", p: "pixelmatch, seuil 0,1, anticrénelage exclu. Un score proche de 100 % ne prouve pas une correspondance stricte." },
      { t: "Provenance des références", p: "Par défaut, exportées à neuf par PowerPoint ; avec <code>--ref-dir</code>, leur provenance n'est pas vérifiée et le rapport le signale." }
    ] },
    { cap: "Corrections du 18/10/2026", title: "Ce qui a progressé", cards: [
      { t: "Graphiques", p: "Colonnes groupées : données, séries, couleurs, axes, échelle, grille, titre. Les autres familles restent signalées non prises en charge." },
      { t: "Couleurs et tableaux", p: "Teintes et ombrages tint/shade calculés en scRGB linéaire ; hauteurs de lignes suivant le texte ; bordures implicites." },
      { t: "Texte", p: "Coupure des mots trop longs aux limites de graphèmes ; <code>buNone</code> annule une puce héritée ; images de remplissage des formes." }
    ] }
  ],
  state: {
    done: ["Moteur natif à 100 % exact sur 193/193 diapositives (PowerPoint 16.0, build 20430)", "Moteur autonome : 82,37 → 82,82 % de pixels identiques, aucune régression du score tolérant", "Banc de fidélité, corpus et rapports HTML"],
    wip: ["Animations et transitions : Morphose appariée par noms forcés « !! », identité puis affectation globale ; seul byObject est esquissé, byWord et byChar échouent explicitement", "Trier les 1 617 fichiers non suivis (application, archives, captures) avant toute publication", "Fixer la version de référence en comparant avec docs/historique/copie-travail-cppt/"],
    risks: ["Captures et présentations privées signalées dans PROVENANCE.md : risque de confidentialité avant publication", "Le MP4 de PowerPoint est compressé : il sert à étudier le mouvement, pas d'oracle pixel", "Une validation sur un corpus donné ne garantit pas le même résultat sur toutes les versions d'Office", "npm test n'a pas pu être exécuté dans le bac à sable de l'audit (spawn EPERM) : aucun verdict sur les tests"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Moteurs, utilisation, résultats du 18/10/2026." },
    { t: "PROVENANCE", f: "PROVENANCE.md", d: "Origine des captures et présentations." },
    { t: "Application : TRANSITIONS, CLI, FIDELITY", f: "app/TRANSITIONS.md", d: "Atelier de transitions, recettes CLI, export PNG." },
    { t: "POWERPOINT-CUSTOM", f: "app/POWERPOINT-CUSTOM.md", d: "Effets cinématiques enregistrés dans une partie XML du PPTX." },
    { t: "MORPH-RESEARCH", f: "app/MORPH-RESEARCH.md", d: "Recherche sur la morphose." }
  ]
},

/* ======================================================================== petits outils */
{
  id: "outils", n: "Petits outils", title: "Petits outils", status: "outil",
  role: "MindMap portable, agent-ia et ecole2recte",
  lead: "Trois projets plus petits ou plus récents : une carte mentale portable pour Windows, le plan d'un agent IA personnel mobile et un client Android non officiel pour ÉcoleDirecte.",
  repo: null, tech: ["Win32/GDI+", "Cloudflare", "Kotlin"], last: "11/11/2026",
  facts: [{ v: "3", k: "projets" }, { v: "1 fichier", k: "MindMap.exe, sans installation" }, { v: "phase 0", k: "agent-ia : plan complet, aucun code produit" }],
  sections: [
    { cap: "mindmap-portable", title: "Carte mentale pour réviser", repoLink: { name: "mindmap-portable", branch: "main" }, intro: "Un seul fichier <code>MindMap.exe</code> pour Windows (Win32/GDI+), sans installation, sans compte, sans Internet ; le dossier se copie sur une clé USB.", cards: [
      { t: "Version 3 des sources", p: "Accueil avec cartes récentes, brouillons et modèles ; images PNG/JPEG/BMP intégrées au fichier ; dix versions de secours par carte ; import FreeMind, XMind, Markdown et texte ; export PDF, PNG, SVG, Markdown." },
      { t: "Pour réviser", p: "Mode révision : idées masquées puis découvertes une à une, auto-évaluation acquis / à revoir, second passage sur les seules idées à revoir ; repères ★ ✓ ? ! ⚑." },
      { t: "Édition", p: "Disposition équilibrée, radiale ou vers la droite ; liens transversaux libellés ; plans texte (Ctrl+Maj+V) ; navigation clavier ; mini-carte ; thème sombre." },
      { t: "À vérifier", p: "L'accueil et les nouveaux panneaux de la version 3 restent à vérifier visuellement sous Windows." }
    ] },
    { cap: "agent-ia", title: "Agent IA personnel, mobile d'abord", repoLink: { name: "agent-ia", branch: "main" }, intro: "Un assistant joignable depuis le téléphone, qui connaît le quotidien (mails, agenda, tâches, fichiers OneDrive, école) et <b>agit après validation</b>. Un PC dédié et isolé sert de bac à sable distant. Le modèle tourne sur l'abonnement ChatGPT (OAuth), avec un plan B par clé API.", cards: [
      { t: "Architecture", p: "Téléphone Kotlin ⇄ relais Cloudflare (Worker + Durable Object = boucle d'agent) ⇄ fournisseurs IA, services (Google, OneDrive, GitHub) et PC bac à sable en connexion sortante." },
      { t: "Neuf phases", p: "Cadrage et spikes, relais et cerveau, appli Android MVP, classiques, communication, OneDrive, PC bac à sable, développement, avancé. Chemin critique : 0 → 1 → 2 → 3 ; puis 4 et 6 en parallèle." },
      { t: "État", p: "Phase 0 (cadrage et spikes) : aucun code produit, le plan est complet. Garde anti-secrets (gitleaks ou analyse intégrée), décisions dans docs/adr/." }
    ] },
    { cap: "ecole2recte", title: "Client Android non officiel pour ÉcoleDirecte", repoLink: { name: "ecole2rect", branch: "main" }, intro: "Application lisible, personnalisable et utilisable hors ligne pour l'emploi du temps, les devoirs, les notes et les messages. Non officielle et non affiliée : elle utilise l'interface privée du service, qui peut changer sans préavis.", cards: [
      { t: "Fonctions", p: "Accueil, agenda jour et semaine, exports PDF et ICS, notes avec moyennes officielles ou calculées, messages, recherche locale, comptes famille, six widgets, notifications désactivées par défaut." },
      { t: "Données", p: "Identifiants chiffrés sur le téléphone (Keystore), aucun serveur intermédiaire, aucune télémétrie, cache chiffré ; le diagnostic décrit la forme des réponses, jamais une valeur." },
      { t: "Apparence", p: "Clair, sombre ou noir OLED, cinq thèmes, taille du texte, verrouillage biométrique, mode « montrer à quelqu'un » qui masque les notes." }
    ] }
  ],
  state: {
    done: ["mindmap-portable : version 3 des sources avec accueil, modèles, images, versions de secours et imports", "ecole2recte : application complète, documentée (exports, moyennes)"],
    wip: ["agent-ia : sortir de la phase 0 (spikes OAuth, Google, OneDrive, PC)", "mindmap-portable : contrôle visuel de la version 3 sous Windows"],
    risks: ["ecole2recte dépend d'une interface non documentée d'ÉcoleDirecte", "Le dépôt ecole2recte existe aussi sous une branche de refactorisation : vérifier laquelle fait foi"]
  },
  docs: []
}
];
