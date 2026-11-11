/* Données des pages de projets (hors Nemo) : une entrée par projet, rendue par js/proj.js.
   Sources : README, plans et documents de chaque dépôt, bilan des projets du 01/11/2026, `git log` (11/11/2026).
   Pour ajouter un projet : compléter PROJ.list (puis créer <id>/index.html sur le modèle des autres), rien d'autre.
   Style : phrases courtes (accroche ≤ 30 mots, carte ≤ 25 mots, puce d'état ≤ 15 mots). Un chiffre ou un statut est à vérifier dans le dépôt. */
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
  role: "Claude Code délègue du code à Codex et à des modèles locaux",
  lead: "Outil en ligne de commande : <b>Claude Code</b> confie une tâche à <b>Codex</b> (compte ChatGPT) ou à un modèle Ollama, dans une copie isolée du dépôt, puis relit le résultat.",
  repo: { name: "agent-hub", branch: "main", priv: true }, tech: ["Node ≥ 20", "zéro dépendance", "git worktree", "Codex CLI"], last: "11/11/2026",
  facts: [
    { v: "2", k: "parties : délégation et coordination" }, { v: "80", k: "tests (README du 04/11)" },
    { v: "a · b", k: "comptes ChatGPT (OAuth)" }, { v: "127.0.0.1:4317", k: "dashboard local, avec jeton" }
  ],
  arch: {
    intro: "Le dépôt principal n'est modifié que par <code>ah merge</code>.",
    layers: [
      { name: "Chef de chantier", items: [{ n: "Claude Code", d: "Écrit le brief, relit le diff, fusionne (skill <b>delegate</b>)." }] },
      { link: "ah run brief.md" },
      { name: "agent-hub", items: [
        { n: "CLI ah", d: "run, review, merge, clean, status. Détecte seul la commande de tests." },
        { n: "Worktree isolé", d: "Branche <code>agent/&lt;id&gt;</code> hors du dépôt ; node_modules relié." },
        { n: "Tests du hub", d: "Relancés par le hub, pas crus sur parole ; correction automatique si échec." }
      ] },
      { link: "codex exec / ollama" },
      { name: "Exécutants", items: [
        { n: "Codex · compte a", d: "~/.codex, la connexion habituelle." },
        { n: "Codex · compte b", d: "~/.codex-accounts/b, via <code>codex login --device-auth</code>." },
        { n: "Modèles locaux", d: "<code>--acct 9b|27b|local</code> : Ollama, un seul à la fois." }
      ] },
      { link: "diff + tests" },
      { name: "Coordination", items: [
        { n: "Dashboard", d: "<code>ah serve</code> : ce qui attend une décision, les travaux en direct." },
        { n: "Tâches", d: "Dépendances, file d'attente (3 en parallèle), questions, audits en lecture seule." },
        { n: "Messages", d: "Les sessions Claude se parlent ; un message d'agent est une information, pas un ordre." }
      ] }
    ]
  },
  commands: [
    { t: "Installer et vérifier", code: "npm i -g @openai/codex\ncd C:\\Users\\gabor\\code\\agent-hub\nnpm link          # expose la commande ah\nah doctor" },
    { t: "Déléguer, relire, fusionner", code: "ah run brief.md --acct b --effort high --json\nah show <id> --patch      # toujours relire le diff\nah merge <id> --squash    # ou : ah clean <id>" },
    { t: "Relecture croisée", code: "ah review --base main --focus \"concurrence\" --json" },
    { t: "Plusieurs tâches", code: "ah task add \"titre\" --brief fichier.md --project . --dep T-001\nah task queue T-001 T-002\nah wait T-001 T-002" }
  ],
  sections: [
    { cap: "Principes", title: "Garanties", cards: [
      { t: "OAuth uniquement", p: "Les clés d'API sont retirées de l'environnement : seuls les abonnements ChatGPT sont utilisés." },
      { t: "Dépôt intact", p: "Tout se passe dans un worktree jetable. Jamais de <code>git push</code>." },
      { t: "Sandbox restreint", p: "Écriture limitée au worktree, jamais de mode « bypass »." },
      { t: "Quota respecté", p: "Quota atteint : code 2 et heure de reprise. Bascule automatique désactivée par défaut." },
      { t: "Doublons de compte", p: "Deux dossiers pour le même compte ChatGPT partagent un quota : le hub le signale." },
      { t: "Codes de sortie", p: "0 ok · 1 échec · 2 quota · 3 délai · 4 question · 10 tests en échec." }
    ] },
    { cap: "Coordination", title: "Dashboard et sécurité", cards: [
      { t: "Accueil par décisions", p: "Une question, un travail à valider, un échec, des messages." },
      { t: "Sessions Claude", p: "Lues dans les fichiers de l'app desktop ; chaque session se reconnaît via <code>ah whoami</code>." },
      { t: "Local seulement", p: "127.0.0.1, jeton, vérification de l'hôte et de l'origine." }
    ] }
  ],
  state: {
    done: ["Délégation, relecture et fusion sur tout dépôt git", "Deux comptes ChatGPT, quotas détectés", "Dashboard, tâches, file d'attente, messages", "Audits en lecture seule", "Modèles locaux Ollama et banc de mesure"],
    wip: ["Hook SessionStart non posé : à ajouter à la main", "Bascule automatique entre comptes : désactivée, conditions OpenAI à relire"],
    risks: ["Incident du 27/10 : <code>ah merge</code> avait vidé node_modules de nemo-https (junction). Corrigé, test en place ; vérifier après un nettoyage", "Un hub de démo avec tâches en file lance de vrais runs, sauf faux compte déclaré"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Installation, comptes, utilisation, sécurité." },
    { t: "Coordination", f: "docs/COORDINATION.md", d: "API et dashboard." },
    { t: "Fonctions avancées", f: "docs/FONCTIONS-AVANCEES.md", d: "File d'attente, audits, verrous." },
    { t: "Skill delegate", f: "skills/delegate/", d: "Procédure suivie par Claude Code." }
  ]
},

/* ======================================================================== Prisme */
{
  id: "prisme", n: "Prisme", title: "Prisme", status: "actif",
  role: "Éditeur d'images bitmap et vectorielles pour Windows",
  lead: "Retouche <b>bitmap</b> et dessin <b>vectoriel</b> dans un seul éditeur, inspiré de PhotoFiltre. Rust, React et Tauri 2, licence MIT. Sans rapport avec la « collection Prisme » de WikiCards.",
  repo: { name: "photo-editor", branch: "main", priv: true }, tech: ["Rust", "Tauri 2", "React 19 + TypeScript", "Vite 6", "Rhai"], last: "11/11/2026",
  facts: [
    { v: "v17", k: "format de projet .prisme" }, { v: "1.4", k: "dernier jalon livré (package.json : 1.5.0)" },
    { v: "10 / 14", k: "grands lots encore ouverts (27/10)" }, { v: "3", k: "familles de plugins" }
  ],
  arch: {
    intro: "Interface React dans Tauri, moteur en Rust, plugins dans des processus séparés.",
    layers: [
      { name: "Interface", items: [{ n: "src/ (React + TypeScript)", d: "Calques, outils, options, onglets, recherche Ctrl K." }] },
      { link: "IPC Tauri" },
      { name: "Moteur (src-tauri, Rust)", items: [
        { n: "Bitmap", d: "Calques, sélections, retouche, courbes, effets, palette indexée, GIF animé." },
        { n: "Vectoriel", d: "Plume, nœuds, booléens, groupes, dégradés, masques, filtres SVG, texte sur tracé." },
        { n: "Fichiers", d: "Projets v17, PSD, AVIF, HEIC, aperçu RAW ; export SVG et PDF." }
      ] },
      { link: "processus enfant" },
      { name: "Plugins", items: [
        { n: "Prisme / Rhai", d: "Scripts Rhai ; SDK dans plugin-sdk/." },
        { n: "Filtres 8BF", d: "Filtres Photoshop x64, sélection et alpha respectés." },
        { n: "PFL", d: "Plugins PhotoFiltre Unicode x64, expérimental." }
      ] }
    ]
  },
  commands: [
    { t: "Développement", code: "npm install\nnpm run tauri dev      # application en développement\nnpm run tauri build    # paquets Windows" }
  ],
  sections: [
    { cap: "Fonctionnalités", title: "Ce que l'éditeur fait", cards: [
      { t: "Sélections et retouche", p: "Lasso, baguette, couleur, sélections mémorisées ; clonage, correcteur, aérographe." },
      { t: "Réglages", p: "Courbes, niveaux, mélangeur de couleurs, désaturation sélective." },
      { t: "Vectoriel", p: "Groupes, 17 modes de fusion, dégradés, motifs, masques, polices variables." },
      { t: "Actions et lots", p: "Commandes enregistrées rejouables, lots avec annulation entre étapes." },
      { t: "Confort", p: "Miniatures de calques, onglets, récupération automatique après interruption." },
      { t: "Interopérabilité", p: "Import PFV de PhotoFiltre, plugins 8BF et PFL." }
    ] }
  ],
  state: {
    done: ["Éditeur bitmap et vectoriel du jalon 1.4", "Projet v17, migration depuis v16 vérifiée", "Lots d'expérience III.1 à III.4, import PFV", "214 contrôles sur le portable et les payloads NSIS/MSI"],
    wip: ["10 grands lots ouverts sur 14", "Agencement PhotoFiltre 11 : relevé des commandes à compléter", "Plugins : comparaison PFL et plugin tiers x64 à essayer"],
    risks: ["Installation et mise à niveau non prouvées", "Pas de calques de réglage, de GPU ni d'ICC", "PSD sans aller-retour Photoshop ; RAW = simple aperçu"]
  },
  docs: [
    { t: "README", f: "README.md", d: "État, formats, plugins, limites." },
    { t: "BILAN_ACTUEL", f: "BILAN_ACTUEL.md", d: "Livré, développé, restant (27/10)." },
    { t: "PLAN", f: "PLAN.md", d: "Les 14 lots." },
    { t: "EXECUTION", f: "EXECUTION.md", d: "Suivi d'exécution courant." },
    { t: "Plugins : 8BF, PFL", f: "8BF.md", d: "Contrats et limites." },
    { t: "Vectoriel : GROUPES, SVG_*", f: "GROUPES.md", d: "Groupes, peintures, masques, filtres." }
  ]
},

/* ======================================================================== multi */
{
  id: "multi", n: "multi", title: "multi", status: "actif",
  role: "Mini-jeux multijoueurs en français, pour téléphone",
  lead: "<b>33 mini-jeux</b> pour 2 à 20 joueurs, sans compte : salles par code ou QR, reconnexion, bots. En ligne sur Cloudflare, avec un miroir local sans serveur.",
  repo: { name: "multi", branch: "main", priv: true }, tech: ["TypeScript strict", "Preact + Vite", "Cloudflare Workers", "Durable Objects", "vitest"], last: "31/10/2026",
  facts: [
    { v: "33", k: "jeux" }, { v: "70", k: "commits" }, { v: "103", k: "fichiers de tests" }, { v: "1 ligne", k: "SQLite par salle" }
  ],
  arch: {
    intro: "Le même cœur de salle tourne dans le navigateur et dans un Durable Object. Le serveur est l'arbitre : chacun ne reçoit que sa vue.",
    layers: [
      { name: "Client (web/)", items: [
        { n: "Vite + Preact", d: "Routage par hash, un chunk par jeu, PWA." },
        { n: "Transports", d: "Loopback (local) ou WebSocket (en ligne)." }
      ] },
      { link: "intentions · vues par siège" },
      { name: "Salle (packages/room)", items: [
        { n: "RoomCore", d: "Machine à états pure : joueurs, bots, spectateurs, minuteurs, reconnexion." },
        { n: "Protocole", d: "<code>handle</code>, <code>closed</code>, <code>alarm</code> renvoient un pas." }
      ] },
      { link: "GameDefinition" },
      { name: "Moteurs (packages/engines)", items: [
        { n: "Un dossier par jeu", d: "Pur et déterministe : ni DOM, ni horloge, RNG à graine." },
        { n: "Bots", d: "<code>bot.act</code> synchrone et léger ; sinon coup légal au hasard." }
      ] },
      { link: "wss /ws/<CODE>" },
      { name: "Serveur (server/)", items: [
        { n: "Worker Cloudflare", d: "<code>/ws/&lt;CODE&gt;</code> et <code>/api/health</code> ; site statique servi sans code." },
        { n: "Durable Object Room", d: "WebSocket Hibernation, une ligne SQLite par salle, ménage par alarme." }
      ] }
    ]
  },
  commands: [
    { t: "Développer", code: "npm install\nnpm run dev          # http://localhost:5173\nnpm test\nnpm run build" },
    { t: "Serveur local et contrôles", code: "npm run server:dev   # http://127.0.0.1:8787 (après build)\nnode scripts/smoke-online.mjs --url ws://127.0.0.1:8787\nnode scripts/verify-deploy.mjs https://multi.moideici.tech web/dist" }
  ],
  sections: [
    { cap: "Catalogue", title: "Les 33 jeux", cards: [
      { t: "Plateau", p: "Morpion, morpion ultime, puissance 4, dames, échecs, Othello, awalé, moulin, allumettes, bataille navale, dominos." },
      { t: "Parcours et dés", p: "Oie, serpents et échelles, petits chevaux, Yams, Cochon, dés du menteur, coffres et pièges." },
      { t: "Cartes", p: "Bataille, huit américain, président, Memory." },
      { t: "Mots, quiz, réflexes", p: "Mastermind, pendu, petit bac, quiz éclair, calcul flash, réflexes, course de frappe." },
      { t: "Jeux sociaux", p: "L'intrus, mission secrète, dessin à deviner, Loup-Garou." }
    ] },
    { cap: "Règles", title: "Qualité et sobriété", cards: [
      { t: "Un jeu passe ou n'est pas déployé", p: "Tests du moteur, rendu de chaque siège, build, contrôle après déploiement." },
      { t: "Budget Cloudflare", p: "Plan gratuit partagé : 100 000 requêtes par jour. Hibernation, pas de polling." },
      { t: "Règles des agents", p: "Aucun emoji (un test échoue), ressources créditées dans <code>credits.ts</code>." },
      { t: "Déploiement manuel", p: "Le workflow <code>deploy-worker.yml</code> ne part qu'à la demande." }
    ] }
  ],
  state: {
    done: ["33 jeux jouables, en ligne et en local", "Salles, QR, reconnexion, bots, mode soirée", "Derniers ajouts : Loup-Garou, Dessin à deviner, Petit bac, L'intrus"],
    wip: ["Solveur de puissance 4 (non commité au 01/11) : valider exactitude, CPU et poids (≈ 200 Ko)", "Bots de Garry : contrat asynchrone et poids hors du chemin critique"],
    risks: ["Créditer l'origine du livre d'ouverture", "web/README.md décrit encore le mode en ligne comme futur", "Plan gratuit partagé avec un autre projet", "Adresse du miroir GitHub Pages à revérifier"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Démarrer, organisation, règles." },
    { t: "Architecture", f: "docs/ARCHITECTURE.md", d: "RoomCore, protocole, transports." },
    { t: "Ajouter un jeu", f: "docs/GAMES.md", d: "Contrat GameDefinition." },
    { t: "Budget Cloudflare", f: "docs/BUDGET.md", d: "Limites du plan gratuit." },
    { t: "Bots", f: "docs/BOTS.md", d: "Contrat actuel et intégration de Garry." }
  ]
},

/* ======================================================================== Garry / Logic Lab */
{
  id: "garry", n: "Garry · Logic Lab", title: "Garry et Logic Lab", status: "actif",
  role: "Un seul modèle pour quatorze jeux, et un modèle de dialogue en français",
  lead: "<b>Garry</b> : un réseau unique qui joue à quatorze jeux, Go compris. <b>Input</b> : Qwen3-0.6B adapté pour comprendre le français et répondre en JSON. Deux projets, des mesures séparées.",
  repo: { name: "logic-lab", branch: "master", priv: true }, tech: ["Python", "PyTorch / CUDA", "JavaScript", "C++", "LoRA"], last: "31/10/2026",
  facts: [
    { v: "0.6.0", k: "version de Garry" }, { v: "444 979", k: "paramètres (4 872 → 48 → 48 → 4 259)" },
    { v: "14", k: "jeux, niveaux 0 à 10" }, { v: "≈ 21 Go", k: "de données hors dépôt" }
  ],
  arch: {
    intro: "Deux serveurs Python locaux, sans partage de poids ni de mémoire.",
    layers: [
      { name: "Dossier de travail", items: [
        { n: "projets/garry", d: "Port 8765 : jeux, arène, entraînement, harnais de sites réels." },
        { n: "projets/input", d: "Port 8766 : conversation et bilan d'apprentissage." },
        { n: "recherche/hrm · trm", d: "Essais de raisonnement, hors modèles actifs." }
      ] },
      { link: "décision" },
      { name: "Garry : qui joue le coup", items: [
        { n: "Réseau neuronal", d: "Un modèle, zones propres à chaque jeu, module central commun." },
        { n: "Recherche et solveurs", d: "Issues prouvées distinguées des estimations." },
        { n: "Professeur borné", d: "Source d'exemples ; son accord n'est pas un taux de victoire." }
      ] },
      { link: "candidat → validation → promotion" },
      { name: "Entraînement", items: [
        { n: "Sessions locales", d: "Données séparées en apprentissage, validation et test." },
        { n: "Jeux réels", d: "Playwright joue sur 2048 et COSUMI ; chaque transition est vérifiée." }
      ] },
      { link: "Input" },
      { name: "Input 0.2.0", items: [
        { n: "Contexte borné", d: "21 messages récents, 2 400 tokens." },
        { n: "Qwen3-0.6B + LoRA", d: "Adaptation d'un modèle existant, pas un modèle entraîné de zéro." },
        { n: "Décodage contraint", d: "JSON <code>texte</code> + <code>valeurs</code>, validé avant affichage." }
      ] }
    ]
  },
  commands: [
    { t: "Lancer Garry", code: "cd projets/garry\npython -m logic_arena serve --port 8765   # http://127.0.0.1:8765" },
    { t: "Harnais de jeux réels", code: "npm ci --prefix tools/real-games\nnpx --prefix tools/real-games playwright install chromium" }
  ],
  sections: [
    { cap: "Garry 0.6.0", title: "Quatorze jeux, un modèle", cards: [
      { t: "Les jeux", p: "Morpion, Puissance 4, 2048, sudoku, démineur, taquin, Reversi, Nim, Lights Out, dames, Percée, Hex, Gomoku, Go 9/13/19." },
      { t: "Modes", p: "Niveaux 0 à 10, duels IA contre IA, transitions visibles, sudoku à trois vies." },
      { t: "Dernière session", p: "17/10 : 102 762 coups, 540 cycles, dix promotions, autres jeux préservés." },
      { t: "Résultats prudents", p: "Accord avec le professeur : Go 15 → 17 %, Hex 41 → 43 %, Gomoku 17 → 22 %. Pas des taux de victoire." },
      { t: "Vérifications", p: "114 tests Python et 65 JavaScript archivés, sans nouvelle recette complète." }
    ] },
    { cap: "Input 0.2.0 et recherche", title: "Dialogue et raisonnement", cards: [
      { t: "Objectif", p: "Comprendre une demande, décider, justifier : contraintes, plans, comparaison de scénarios." },
      { t: "Mesures", p: "Valeurs exactes 7/28 → 25/28 après adaptation ; 36/36 JSON complets ; calculs 5/12." },
      { t: "HRM et TRM", p: "HRM : poids officiels de sudoku, un des deux contrôles publics réussit." }
    ] }
  ],
  state: {
    done: ["Garry 0.6.0 : 14 jeux, entraînement continu, jeux réels", "Puissance 4 exact, nim et morpion parfaits, dames par distillation", "Input : interface prête, banc gelé, contrat v2 prêt non activé"],
    wip: ["Actif : Core entraînable, Graine, Loop, Lab en direct", "Input en veille : reste le lot 4 (données ciblées)", "Bots pour multi", "Reprise reproductible, banc de maths neuf, documents à aligner"],
    risks: ["projets/ et recherche/ (dizaines de Go) hors dépôt, sans sauvegarde confirmée", "Go faible, invincibilité non démontrée", "Input hallucine, calculs fragiles, 6 à 16 tokens/s", "Poids du navigateur parfois anciens : identité à rendre explicite"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Ordre de lecture." },
    { t: "PLAN-GLOBAL", f: "PLAN-GLOBAL.md", d: "Bilan et périmètre actif ; fait autorité." },
    { t: "Guide", f: "docs/GUIDE.md", d: "Lancement, sauvegardes, reprise." },
    { t: "Architecture", f: "docs/ARCHITECTURE.md", d: "Composants et flux." },
    { t: "Décisions", f: "docs/DECISIONS.md", d: "Décisions et sujets ouverts." },
    { t: "Garry", f: "projets/garry/README.md", d: "Jeux, entraînement, versions." }
  ]
},

/* ======================================================================== WikiCards */
{
  id: "wikicards", n: "WikiCards", title: "WikiCards", status: "veille",
  role: "Cartes à collectionner tirées de Wikipédia",
  lead: "Chaque carte est un article de Wikipédia : boosters à mériter, rareté fondée sur les vues sur 12 mois, révélations animées en WebGL. Projet de fan, privé, pour quelques amis.",
  repo: { name: "wikicards", branch: "main", priv: true }, tech: ["JavaScript natif", "IndexedDB", "WebGL2", "Kotlin (WebView)", "Supabase"], last: "15/10/2026",
  facts: [
    { v: "15 235", k: "articles (FR, EN, hors classement)" }, { v: "8", k: "paliers de rareté" },
    { v: "56", k: "Légendes : 50 numérotées, 6 secrètes" }, { v: "25", k: "commits" }
  ],
  arch: {
    intro: "Un seul rendu web, embarqué dans Android et publié sur GitHub Pages. Collection locale, synchronisée avec Supabase.",
    layers: [
      { name: "Données", items: [
        { n: "pipeline/", d: "Collecteur Wikimedia et Wikidata ; seuils dans <code>tiers.json</code>." },
        { n: "data/catalog.json", d: "Catalogue produit, avec état de reprise." }
      ] },
      { link: "build-catalog" },
      { name: "Application", items: [
        { n: "web/", d: "Tirage, économie, boosters, quiz, objectifs, sync ; Canvas et WebGL2." },
        { n: "android/", d: "Coquille Kotlin (WebView) qui embarque web/." }
      ] },
      { link: "sync (compte facultatif)" },
      { name: "Serveur", items: [
        { n: "Supabase", d: "Schéma SQL et tests ; comptes créés par le créateur. Prêt, à appliquer." }
      ] }
    ]
  },
  commands: [
    { t: "Aperçu et tests", code: "python tools/serve.py --port 8766        # http://127.0.0.1:8766/web/\nnode --test pipeline/*.test.mjs web/tests/*.test.mjs\ncd supabase && npm install && npm test" },
    { t: "Construire l'APK", code: "python tools/build-android.py\ncd android\n.\\gradlew.bat assembleDebug" }
  ],
  sections: [
    { cap: "Règles du jeu", title: "Choix validés", cards: [
      { t: "Boosters à mériter", p: "5 cartes, ouverture par 1, 10 ou 100. Se gagnent : booster du jour, quiz, lectures, objectifs, défi de la semaine." },
      { t: "Rareté", p: "Huit paliers, de Commun à Transcendant ; seuils de vues de 50 k à 800 k (<code>tiers.json</code>)." },
      { t: "Trois collections", p: "Français, anglais, « Hors classement »." },
      { t: "Édition Légende", p: "56 personnes choisies à la main, dont six secrètes numérotées 0 à −5." },
      { t: "Collection Prisme", p: "56 cartes validées, chacune avec sa propre animation. Sans lien avec l'éditeur Prisme." },
      { t: "Licences", p: "Textes Wikipédia CC BY-SA 4.0 ; photos sous leur licence propre." }
    ] }
  ],
  state: {
    done: ["Catalogue complet", "Boosters, quiz, objectifs, défi de la semaine", "Collection locale, compte facultatif", "Laboratoire d'animations"],
    wip: ["Appliquer le schéma Supabase au projet réel", "Finir la collection Prisme", "Tests sur téléphone, APK signé"],
    risks: ["Récompenses calculées côté client : triche possible", "Synchronisation entre deux appareils non validée", "En pause depuis le 15/10"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Carte du dossier, lancement." },
    { t: "Décisions", f: "docs/DECISIONS.md", d: "Règles du jeu et technique." },
    { t: "Boosters", f: "docs/CONCEPT-BOOSTERS.md", d: "Boosters à mériter." },
    { t: "Supabase", f: "docs/SUPABASE.md", d: "Mise en place du serveur." },
    { t: "Plan et roadmap", f: "docs/PLAN.md", d: "Remise à niveau." }
  ]
},

/* ======================================================================== py2x */
{
  id: "py2x", n: "py2x (ia)", title: "py2x : Python typé vers C++ et Kotlin", status: "veille",
  role: "Convertisseur source-à-source, socle C++ et applications de démonstration",
  lead: "Le dossier <code>ia</code> contient <b>py2x</b> : un programme Python converti en C++ ou Kotlin doit produire exactement la même sortie. S'y ajoutent un socle C++ de gestion mémoire et des démonstrations.",
  repo: { name: "ia (dossier local, sans dépôt GitHub)", branch: "master", priv: true, nourl: true }, tech: ["Python 3", "C++20", "Kotlin/JVM", "CMake"], last: "04/10/2026",
  facts: [
    { v: "≈ 60", k: "programmes de corpus, sortie identique" }, { v: "8", k: "fuzzers différentiels" },
    { v: "58", k: "méthodes de test" }, { v: "1", k: "commit au total" }
  ],
  arch: {
    intro: "Un frontend commun produit une représentation typée ; chaque langage cible a son émetteur.",
    layers: [
      { name: "Frontend", items: [{ n: "ast Python → IR typée", d: "Ce qui n'est pas supporté lève une erreur avec le numéro de ligne." }] },
      { link: "IR neutre" },
      { name: "Émetteurs", items: [
        { n: "emit_cpp.py", d: "C++20, appuyé sur cpp_base." },
        { n: "emit_kotlin.py", d: "Kotlin/JVM." }
      ] },
      { link: "--verify" },
      { name: "Vérification", items: [
        { n: "Corpus", d: "Chaque programme est converti, compilé, exécuté et comparé à Python." },
        { n: "Fuzzers", d: "Des milliers de programmes aléatoires comparés ligne à ligne." }
      ] },
      { name: "Autour", items: [
        { n: "cpp_base", d: "Arena, Pool, SmallVector. 1 M d'objets : new/delete ≈ 45 ms, arène ≈ 0,5 ms." },
        { n: "android/ · projects/", d: "Générateurs d'applications et démos (TaskDesk, mindmap_portable)." }
      ] }
    ]
  },
  commands: [
    { t: "Convertir et vérifier", code: "python -m py2x programme.py --to cpp\npython -m py2x programme.py --to kotlin -o Prog.kt\npython -m py2x programme.py --verify    # compile, exécute, compare avec Python" },
    { t: "Socle C++", code: "cmake -S cpp_base -B build -G \"MinGW Makefiles\"\ncmake --build build\nctest --test-dir build" }
  ],
  sections: [
    { cap: "Sémantique", title: "Ce qui est reproduit", cards: [
      { t: "Calcul et formats", p: "Division, modulo, indices négatifs, repr des flottants, mini-langage de format." },
      { t: "Collections", p: "Tri stable, ordre des dict, ordre d'itération des sets de CPython." },
      { t: "Exceptions", p: "Mêmes types et mêmes messages que Python." },
      { t: "Aléatoire", p: "Mersenne Twister de CPython : <code>random.seed(42)</code> donne les mêmes tirages." },
      { t: "Classes", p: "Héritage simple, dataclasses, classes abstraites, NamedTuple." }
    ] }
  ],
  state: {
    done: ["Transpileur C++ et Kotlin, garanti par corpus et fuzzers", "Socle mémoire C++ avec bancs", "Démonstrations TaskDesk et MindMap"],
    wip: ["Ajouter un README à la racine", "Trier les fichiers non suivis (nemo-review/, MindMap.exe)"],
    risks: ["Un seul commit, aucun dépôt distant", "Référence cassée à bench/bench.cpp", "« 88 fichiers de test » non confirmé : 58 méthodes"]
  },
  docs: [
    { t: "README du transpileur", f: "transpiler/README.md", d: "Principe, garantie, sous-ensemble." },
    { t: "README du socle C++", f: "cpp_base/README.md", d: "Briques et mesures." },
    { t: "Tests", f: "transpiler/tests/", d: "Tests et fuzzers." }
  ]
},

/* ======================================================================== cppt (C-suit) */
{
  id: "cppt", n: "cppt (C-suit)", title: "cppt : rendu fidèle de PowerPoint", status: "actif",
  role: "Rendu de fichiers .pptx au plus près de PowerPoint",
  lead: "Dépôt <b>C-suit</b>, branche <code>cppt</code> : rend des présentations en images avec un moteur autonome (Skia) ou celui de PowerPoint. Objectif non atteint : 100 % exact en autonome, animations comprises.",
  repo: { name: "C-suit", branch: "cppt", priv: true }, tech: ["Node.js", "Skia", "PowerShell + COM", "Tauri"], last: "15/10/2026",
  facts: [
    { v: "193 / 193", k: "diapositives exactes en mode natif" }, { v: "82,82 %", k: "pixels identiques en autonome" },
    { v: "99,50 %", k: "score tolérant en autonome" }, { v: "0", k: "image exacte pendant une morphose" }
  ],
  arch: {
    intro: "Un banc compare chaque rendu à une référence exportée par PowerPoint, avec deux métriques séparées.",
    layers: [
      { name: "Entrée", items: [{ n: "Fichier .pptx", d: "Ouvert en lecture seule ; SHA-256 vérifié." }] },
      { link: "renderPresentation" },
      { name: "Moteurs", items: [
        { n: "skia (défaut)", d: "Autonome, sans Office : thèmes, formes, texte, tableaux, graphiques en colonnes." },
        { n: "native", d: "Export PNG par PowerPoint (Windows + PowerShell)." },
        { n: "auto", d: "native puis skia, avec avertissement." }
      ] },
      { link: "PNG + render.json" },
      { name: "Banc de fidélité", items: [
        { n: "fidelity.mjs", d: "Rapport HTML et JSON ; <code>--require-exact</code> échoue à la moindre différence." },
        { n: "corpus.mjs", d: "Validation d'un dossier de présentations." }
      ] },
      { name: "Mouvement (expérimental)", items: [
        { n: "motion-inspect · morph-frames", d: "Arbres temporels, Morphose, positions, fondus, balayages." },
        { n: "app/ (Tauri)", d: "Atelier de transitions et effets enregistrés dans le PPTX." }
      ] }
    ]
  },
  commands: [
    { t: "Rendre une présentation", code: "npm ci\nnode tools/render.mjs \"presentation.pptx\" --backend skia --out out/skia\nnode tools/render.mjs \"presentation.pptx\" --backend native --out out/native" },
    { t: "Mesurer la fidélité", code: "node tools/fidelity.mjs \"presentation.pptx\" --backend native --require-exact\nnode tools/corpus.mjs \"dossier\" --backend native --require-exact\nnpm test" },
    { t: "Mouvement (expérimental)", code: "node tools/motion-inspect.mjs presentation.pptx out/motion/model.json\nnode tools/morph-frames.mjs presentation.pptx --from 1 --to 2 --out out/morph" }
  ],
  sections: [
    { cap: "Fidélité", title: "Deux métriques", cards: [
      { t: "Exacte", p: "Tous les canaux RGBA identiques. Une référence manquante rend la couverture incomplète." },
      { t: "Tolérante", p: "pixelmatch, seuil 0,1. Près de 100 % ne prouve pas l'égalité stricte." },
      { t: "Références", p: "Exportées à neuf par PowerPoint ; avec <code>--ref-dir</code>, leur provenance n'est pas vérifiée." }
    ] },
    { cap: "18/10/2026", title: "Progrès récents", cards: [
      { t: "Graphiques", p: "Colonnes groupées : séries, axes, grille, titre. Autres familles non prises en charge." },
      { t: "Couleurs et tableaux", p: "Teintes calculées en scRGB linéaire ; hauteurs de lignes suivant le texte." },
      { t: "Texte", p: "Coupure des mots longs, puces héritées, images de remplissage." }
    ] }
  ],
  state: {
    done: ["Natif à 100 % exact sur 193/193 diapositives", "Autonome : 82,37 → 82,82 % de pixels identiques", "Banc de fidélité, corpus, rapports HTML"],
    wip: ["Morphose : seul byObject est esquissé ; byWord et byChar échouent", "Trier 1 617 fichiers non suivis avant publication", "Fixer la version de référence"],
    risks: ["Captures privées (PROVENANCE.md) : risque de confidentialité", "Le MP4 de PowerPoint est compressé : pas d'oracle pixel", "Résultat propre à un corpus et à une version d'Office", "npm test non exécuté dans l'audit (spawn EPERM)"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Moteurs, utilisation, résultats." },
    { t: "PROVENANCE", f: "PROVENANCE.md", d: "Origine des captures." },
    { t: "TRANSITIONS, CLI, FIDELITY", f: "app/TRANSITIONS.md", d: "Atelier et recettes CLI." },
    { t: "POWERPOINT-CUSTOM", f: "app/POWERPOINT-CUSTOM.md", d: "Effets dans le PPTX." },
    { t: "MORPH-RESEARCH", f: "app/MORPH-RESEARCH.md", d: "Recherche sur la morphose." }
  ]
},

/* ======================================================================== petits outils */
{
  id: "outils", n: "Petits outils", title: "Petits outils", status: "outil",
  role: "MindMap portable, agent-ia et ecole2recte",
  lead: "Une carte mentale portable, le plan d'un agent IA mobile et un client Android pour ÉcoleDirecte.",
  repo: null, tech: ["Win32/GDI+", "Cloudflare", "Kotlin"], last: "11/11/2026",
  facts: [{ v: "3", k: "projets" }, { v: "1 fichier", k: "MindMap.exe, sans installation" }, { v: "phase 0", k: "agent-ia : plan complet, pas de code" }],
  sections: [
    { cap: "mindmap-portable", title: "Carte mentale pour réviser", repoLink: { name: "mindmap-portable", branch: "main" }, intro: "Un seul <code>MindMap.exe</code> pour Windows, sans installation, sans compte, sans Internet.", cards: [
      { t: "Version 3", p: "Accueil, modèles, images intégrées, dix versions de secours, imports FreeMind/XMind/Markdown, exports PDF/PNG/SVG." },
      { t: "Réviser", p: "Mode révision : idées masquées puis révélées, acquis ou à revoir, second passage." },
      { t: "Édition", p: "Disposition équilibrée ou radiale, liens libellés, plans texte, mini-carte, thème sombre." }
    ] },
    { cap: "agent-ia", title: "Agent IA personnel, mobile d'abord", repoLink: { name: "agent-ia", branch: "main" }, intro: "Un assistant qui connaît le quotidien (mails, agenda, OneDrive, école) et <b>agit après validation</b>.", cards: [
      { t: "Architecture", p: "Téléphone Kotlin ⇄ relais Cloudflare (boucle d'agent) ⇄ fournisseurs IA, services et PC bac à sable." },
      { t: "Neuf phases", p: "Chemin critique : cadrage, relais, appli Android, classiques. Puis communication et PC en parallèle." },
      { t: "État", p: "Phase 0 : plan complet, aucun code produit." }
    ] },
    { cap: "ecole2recte", title: "Client Android pour ÉcoleDirecte", repoLink: { name: "ecole2rect", branch: "main" }, intro: "Non officiel : il utilise une interface privée qui peut changer sans préavis.", cards: [
      { t: "Fonctions", p: "Agenda, devoirs, notes avec moyennes, messages, exports PDF et ICS, six widgets, hors ligne." },
      { t: "Données", p: "Identifiants chiffrés sur le téléphone, aucun serveur intermédiaire, aucune télémétrie." },
      { t: "Confort", p: "Thème clair, sombre ou OLED, verrouillage biométrique, mode « montrer à quelqu'un »." }
    ] }
  ],
  state: {
    done: ["mindmap-portable : version 3 des sources", "ecole2recte : application complète et documentée"],
    wip: ["agent-ia : sortir de la phase 0", "mindmap-portable : contrôle visuel de la v3 sous Windows"],
    risks: ["ecole2recte dépend d'une interface non documentée", "Deux dépôts ecole2recte : vérifier lequel fait foi"]
  },
  docs: []
}
];
