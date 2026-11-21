/* Données des pages de projets (hors Nemo) : une entrée par projet, rendue par js/proj.js.
   Sources : README, plans et documents de chaque dépôt, bilan des projets du 01/11/2026, `git log` (11/11/2026).
   Pour ajouter un projet : compléter PROJ.list (puis créer <id>/index.html sur le modèle des autres), rien d'autre.
   Style : phrases courtes (accroche ≤ 30 mots, carte ≤ 25 mots, puce d'état ≤ 15 mots). Un chiffre ou un statut est à vérifier dans le dépôt. */
window.PROJ = window.PROJ || {};
PROJ.updated = "19/11/2026";
PROJ.gh = "https://github.com/moideici/";
PROJ.statuses = {
  actif: { t: "Actif", cls: "g" },
  veille: { t: "En pause", cls: "y" },
  plan: { t: "Phase de plan", cls: "s" },
  recherche: { t: "Prototype de recherche", cls: "c" },
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
  role: "Un seul modèle pour tous les jeux, des maths pas à pas, un dialogue en français",
  lead: "<b>Garry</b> joue à quatorze jeux avec un seul réseau ; son successeur <b>Optimus 0.1</b> vise un modèle unique plus gros. À côté : un réseau qui calcule pas à pas, et <b>Input</b>, un modèle de dialogue en français.",
  repo: { name: "logic-lab", branch: "main", priv: true }, tech: ["Python", "PyTorch / CUDA", "JavaScript", "C++", "LoRA"], last: "11/11/2026",
  facts: [
    { v: "0.6.0", k: "Garry en service (444 979 paramètres)" }, { v: "P1", k: "pilote d'Optimus 0.1 terminé" },
    { v: "812 416", k: "paramètres du réseau de maths" }, { v: "≈ 21 Go", k: "de données hors dépôt" }
  ],
  arch: {
    intro: "Deux serveurs Python locaux, sans partage de poids. Le modèle unique Optimus s'appuie sur des professeurs et des juges indépendants.",
    layers: [
      { name: "Dossier de travail", items: [
        { n: "projets/garry", d: "Port 8765 : jeux, arène, entraînement, maths, harnais de sites réels." },
        { n: "projets/input", d: "Port 8766 : conversation et bilan d'apprentissage." },
        { n: "recherche/hrm · trm", d: "Essais de raisonnement, hors modèles actifs." },
        { n: "outputs/", d: "Rapports et preuves : un rapport par étape." }
      ] },
      { link: "décision" },
      { name: "Garry 0.6.0 : qui joue le coup", items: [
        { n: "Réseau neuronal", d: "Un modèle, zones propres à chaque jeu, module central commun." },
        { n: "Recherche et solveurs", d: "Issues prouvées distinguées des estimations." },
        { n: "Professeurs « à la main »", d: "Moteurs sans entraînement (Gomoku, Hex, Puissance 4 exact) : futurs professeurs d'Optimus." }
      ] },
      { link: "distillation" },
      { name: "Optimus 0.1 (modèle unique)", items: [
        { n: "Tronc partagé", d: "Convolutif résiduel (essai 6 × 64, cible 10 × 192 ≈ 7 M) sur plateau commun." },
        { n: "Bords par jeu", d: "Encodeur d'entrée et têtes de politique et de valeur propres à chaque jeu." },
        { n: "Juges indépendants", d: "Solveur exact, moteurs à la main, bot de multi : jamais le seul professeur." }
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
    { cap: "Modèle unique", title: "Garry Optimus 0.1", intro: "Hypothèse « multi-jeux donc meilleur » à prouver, pas un acquis. Matériel : RTX 4060 8 Go.", cards: [
      { t: "P0 (9/11)", p: "Encodage commun, professeurs, juges et mesures de référence figés pour cinq jeux. Aucun réseau entraîné." },
      { t: "P1 (9/11)", p: "Un réseau pour cinq jeux égale des réseaux séparés avec la moitié des paramètres (1,7 M contre 3,5 M). Aucun gain démontré." },
      { t: "Puissance 4", p: "Réseau seul : 1,5 à 2,3 % de coups fautifs, contre 2,4 % pour Garry 0.6.0." },
      { t: "Hex, Gomoku, dames", p: "Hex 0,58 à 0,70 contre le moteur ; Gomoku 0,10 à 0,17 ; dames 0,4 contre le bot normal." },
      { t: "Suite proposée", p: "Test de transfert, plus de données Hex et Gomoku, puis P2 (≈ 7 M) si un signal apparaît." }
    ] },
    { cap: "Jeu à la main", title: "Moteurs sans entraînement", cards: [
      { t: "Gomoku", p: "0,938 contre l'ancien planificateur, 0 défaite sur 96 parties." },
      { t: "Hex", p: "≈ 0,75 sur 384 parties. Moteurs intégrés au navigateur." },
      { t: "Reste à faire", p: "Port Python, Swap2, Go, dames et Reversi." }
    ] },
    { cap: "Maths", title: "Un réseau qui calcule pas à pas", cards: [
      { t: "Vague 1 atteinte", p: "Transformer de 812 416 paramètres, entraîné de zéro : six niveaux, un calcul à la fois, problème résolu à 1,000." },
      { t: "Limites", p: "Nombres à 4 chiffres : ~0 %. Tests N2 et N3 très petits ; banc neuf nécessaire." },
      { t: "Suite", p: "Vague 2 : exposants, fractions, racines. Puis extrapolation et carte « Maths en direct »." }
    ] },
    { cap: "Garry 0.6.0 et Input", title: "En service", cards: [
      { t: "Quatorze jeux", p: "Morpion, Puissance 4, 2048, sudoku, démineur, taquin, Reversi, Nim, Lights Out, dames, Percée, Hex, Gomoku, Go." },
      { t: "Résultats prudents", p: "Accord avec le professeur : Go 15 → 17 %, Hex 41 → 43 %, Gomoku 17 → 22 %. Pas des taux de victoire." },
      { t: "Input", p: "Valeurs exactes 7/28 → 25/28 après adaptation ; 36/36 JSON complets ; calculs 5/12. En veille." }
    ] }
  ],
  state: {
    done: ["Garry 0.6.0 : 14 jeux, entraînement continu, jeux réels", "Optimus 0.1 : P0 et P1 terminés", "Gomoku et Hex à la main intégrés au navigateur", "Maths : vague 1 atteinte sur six niveaux", "Puissance 4 exact, nim et morpion parfaits"],
    wip: ["Optimus : test de transfert, données Hex et Gomoku, P2", "Maths : vague 2, puis extrapolation", "Boucle Core, Graine, Loop, Lab en direct", "Bots pour multi", "Input en veille : reste le lot 4"],
    risks: ["projets/ et recherche/ (dizaines de Go) hors dépôt, sans sauvegarde confirmée", "P1 : aucun écart significatif, petits échantillons, une seule taille de réseau", "Maths : banc neuf nécessaire, hors distribution ~0 %", "Go faible ; Input hallucine, calculs fragiles"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Ordre de lecture." },
    { t: "PLAN-GLOBAL", f: "PLAN-GLOBAL.md", d: "Plan principal, mis à jour le 11/11 ; fait autorité." },
    { t: "Optimus : cadrage", f: "outputs/rapports/garry/GARRY-MODELE-UNIQUE-CADRAGE.md", d: "Architecture visée et protocole." },
    { t: "Optimus : P0 et P1", f: "outputs/rapports/garry/GARRY-MODELE-UNIQUE-P1.md", d: "Infrastructure, pilote et verdict." },
    { t: "Gomoku et Hex à la main", f: "outputs/rapports/garry/GARRY-A-LA-MAIN-GOMOKU-HEX.md", d: "Moteurs sans entraînement." },
    { t: "Maths", f: "outputs/verifications/maths-protocole.md", d: "Protocole et résultats des vagues 1 et 2." },
    { t: "Guide et architecture", f: "docs/GUIDE.md", d: "Lancement, sauvegardes, composants." }
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
  id: "py2x", n: "py2x", title: "py2x : Python typé vers C++ et Kotlin", status: "actif",
  role: "Convertisseur source-à-source, sortie identique à Python",
  lead: "Un programme Python typé est converti en <b>C++20</b> ou en <b>Kotlin</b> et produit exactement la même sortie que Python. Ce qui n'est pas supporté est refusé avec un numéro de ligne. Extrait le 11/11/2026 du dossier <code>ia</code>.",
  repo: { name: "py2x", branch: "main", priv: true }, tech: ["Python ≥ 3.11", "C++20", "Kotlin/JVM", "GitHub Actions"], last: "11/11/2026",
  facts: [
    { v: "≈ 60", k: "programmes de corpus, sortie identique" }, { v: "8", k: "fuzzers différentiels" },
    { v: "0", k: "dépendance (Python seul)" }, { v: "1", k: "workflow de tests (CI)" }
  ],
  arch: {
    intro: "Un frontend commun produit une représentation typée ; chaque langage cible a son émetteur.",
    layers: [
      { name: "Frontend", items: [{ n: "ast Python → IR typée", d: "Fonctions annotées obligatoires ; variables locales inférées." }] },
      { link: "IR neutre" },
      { name: "Émetteurs", items: [
        { n: "emit_cpp.py", d: "C++20." },
        { n: "emit_kotlin.py", d: "Kotlin/JVM, avec ou sans runtime." }
      ] },
      { link: "--verify" },
      { name: "Vérification", items: [
        { n: "Corpus", d: "Chaque programme est converti, compilé, exécuté et comparé à Python." },
        { n: "Fuzzers", d: "Des milliers de programmes aléatoires comparés ligne à ligne." },
        { n: "CI", d: "<code>tests.yml</code> exécute les tests à chaque poussée." }
      ] }
    ]
  },
  commands: [
    { t: "Démarrer", code: "git clone https://github.com/moideici/py2x.git\ncd py2x\npython -m py2x examples/fib.py --to cpp\npython -m py2x examples/fib.py --to kotlin -o Fib.kt" },
    { t: "Vérifier", code: "python -m py2x examples/fib.py --verify    # compile, exécute, compare avec Python\npython -m py2x examples/fib.py --to cpp --strict" }
  ],
  sections: [
    { cap: "Sémantique", title: "Ce qui est reproduit", cards: [
      { t: "Calcul et formats", p: "Division, modulo, indices négatifs, repr des flottants, mini-langage de format." },
      { t: "Collections", p: "Tri stable, ordre des dict, ordre d'itération des sets de CPython." },
      { t: "Exceptions", p: "Mêmes types et mêmes messages que Python." },
      { t: "Aléatoire", p: "Mersenne Twister de CPython : <code>random.seed(42)</code> donne les mêmes tirages." },
      { t: "Classes", p: "Héritage simple, dataclasses, classes abstraites, NamedTuple." }
    ] },
    { cap: "Limites volontaires", title: "Ce qui est refusé", cards: [
      { t: "Types", p: "<code>int</code> sur 64 bits (dépassement = <code>OverflowError</code>), <code>str</code> en ASCII, annotations obligatoires." },
      { t: "Langage", p: "Pas de <code>with</code>, <code>async</code>, décorateurs utilisateur ni héritage multiple." },
      { t: "Bibliothèque", p: "Pas de <code>re</code>, <code>json</code>, <code>datetime</code> ni de fichiers." }
    ] },
    { cap: "Resté dans ia", title: "Hors du dépôt", cards: [
      { t: "cpp_base", p: "Socle C++20 : Arena, Pool, SmallVector. 1 M d'objets : new/delete ≈ 45 ms, arène ≈ 0,5 ms." },
      { t: "Démonstrations", p: "TaskDesk et MindMap utilisent py2x ; elles restent dans le dossier local <code>ia</code>, sans dépôt." }
    ] }
  ],
  state: {
    done: ["Dépôt GitHub créé le 11/11/2026, extrait de ia/transpiler", "Corpus et huit fuzzers contre Python", "Documentation : usage, sous-ensemble, architecture, tests, contribution", "CI de tests"],
    wip: ["Dossier ia : README racine à ajouter, fichiers non suivis à trier (nemo-review/, MindMap.exe)", "cpp_base et les démos n'ont pas encore de dépôt"],
    risks: ["Annotations obligatoires et sous-ensemble limité", "Le dossier ia n'a qu'un commit et aucun dépôt distant"]
  },
  docs: [
    { t: "README", f: "README.md", d: "Principe, démarrage, garantie, limites." },
    { t: "Usage", f: "docs/USAGE.md", d: "Ligne de commande, API Python, Kotlin." },
    { t: "Sous-ensemble supporté", f: "docs/SUPPORTED.md", d: "Langage, bibliothèque, limites." },
    { t: "Architecture", f: "docs/ARCHITECTURE.md", d: "Frontend, IR, émetteurs, ajout d'un langage." },
    { t: "Tests", f: "docs/TESTING.md", d: "Unitaires, corpus, fuzzers, CI." },
    { t: "Contribuer", f: "docs/CONTRIBUTING.md", d: "Ajouter une fonction sans casser la garantie." }
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

/* ======================================================================== Janus */
{
  id: "janus", n: "Janus", title: "Janus", status: "recherche",
  role: "Chiffrement de fichiers post-quantique, indistinguable de l'aléa, à deux visages",
  lead: "Format de chiffrement de fichiers <b>post-quantique</b> (X-Wing : ML-KEM-768 + X25519) dont chaque octet est <b>indistinguable de l'aléa</b>, avec 16 emplacements de destinataires cachés et des <b>visages</b> multiples : un leurre et jusqu'à <b>3 secrets</b> dans le même fichier, pour un déni plausible.",
  warn: "<b>Prototype de recherche, non audité.</b> La pré-release <b>v0.2.0-alpha</b> (21 novembre 2026) est la version courante (<a href=\"https://github.com/moideci/janus/releases/tag/v0.2.0-alpha\" target=\"_blank\" rel=\"noopener\">archives Linux, Windows et macOS</a>), mais c'est un <b>aperçu</b> : le format v1 est <b>candidat au gel</b> (toutes les questions de format sont tranchées depuis le 19 novembre 2026 et plus aucun changement n'est prévu, sauf faille trouvée par une relecture ou un audit ; le gel ne sera <b>définitif qu'en v1.0</b>), le code n'a eu <b>aucun audit externe</b> et les preuves de sécurité n'ont été relues par personne. La v0.2.0-alpha est <b>incompatible avec la v0.1.0-alpha</b> pour les fichiers (les identités de l'aperçu restent lisibles) : voir le <a href=\"#release\">plan de release</a>. <b>À ne pas utiliser pour de vrais secrets</b> : c'est un prototype non audité, et, tant que la v1.0 n'est pas publiée, une faille trouvée par une relecture ou un audit pourrait encore rendre un fichier illisible.",
  toc: [["presentation", "Présentation"], ["visages", "Les deux visages"], ["format", "Le format"], ["specclients", "Spécification et clients"], ["crypto", "La cryptographie"], ["cli", "Ligne de commande"], ["inspect", "janus inspect"], ["preuves", "Preuves"], ["durcissement", "Durcissement"], ["verifie", "Vérifications"], ["perfs", "Performances"], ["limites", "Limites"], ["release", "Plan de release"], ["etat", "État"], ["docs", "Documents"]],
  repo: { name: "janus", branch: "main" }, tech: ["Rust", "ML-KEM-768 + X25519", "Kemeleon · Elligator 2", "ChaCha20-Poly1305", "Argon2id"], last: "21/11/2026",
  facts: [
    { v: "70", k: "tests Rust, fuzzing compris" }, { v: "75/75", k: "ouvertures croisées entre 5 implémentations" },
    { v: "16", k: "emplacements de destinataires, toujours présents" }, { v: "2", k: "chemins du KEM caché vérifiés par CryptoVerif" }, { v: "0", k: "audit externe ; pré-release alpha seulement" }
  ],
  arch: {
    intro: "Un fichier <code>.janus</code> n'a aucun champ en clair : une en-tête de taille fixe, puis un corps où vivent les visages. Le code Rust (<code>janus-rs/</code>) suit le même découpage.",
    layers: [
      { name: "En-tête : H = 26 272 octets", items: [
        { n: "T_0 à T_3", d: "Quatre étiquettes d'en-tête de 32 octets (HMAC-SHA-256). Une par visage (le leurre et jusqu'à 3 visages cachés) ; les étiquettes inutilisées sont de l'aléa, et leurs places sont une permutation aléatoire." },
        { n: "sel", d: "32 octets, commun à tous les visages : un seul calcul Argon2id ouvre n'importe lequel des 16 emplacements." },
        { n: "16 emplacements × 1632 octets", d: "Chacun porte r (32), κ (1536) et w (64). Les emplacements inutilisés sont de l'aléa : le nombre de destinataires ne se voit pas." }
      ] },
      { link: "w = K ‖ début ‖ longueur" },
      { name: "Corps : F − 26 272 octets", items: [
        { n: "Visage principal (le leurre)", d: "Commence au début du corps, comme l'unique visage d'un fichier ordinaire. Flux STREAM par blocs de 64 Kio." },
        { n: "Réserve", d: "max(64 Kio, L/16) octets garantis, remplis d'aléa ou des visages cachés, qui se la partagent. Sa taille ne dépend que du leurre." },
        { n: "Visages cachés (jusqu'à 3)", d: "Même forme qu'un visage ordinaire, à des positions tirées au hasard, dans un ordre aléatoire. Dans un fichier sans secret, cette zone est de l'aléa." },
        { n: "Aléa jusqu'à F", d: "F est tiré uniformément dans le « seau » PADMÉ de Ref : la taille ne révèle que ce que révèle PADMÉ." }
      ] },
      { link: "janus-rs/src" },
      { name: "Code Rust", items: [
        { n: "format.rs", d: "Format v1 : quatre étiquettes, sel commun, emplacements, réserve, un leurre et jusqu'à 3 visages cachés en STREAM par lots parallèles, ouverture en flux." },
        { n: "xwing.rs, kemeleon.rs, elligator.rs", d: "X-Wing draft-11 et encapsulation cachée : point sale uniforme, Elligator 2, Kemeleon en temps constant, masquage de κ." },
        { n: "inspect.rs", d: "Radiographie défensive d'un fichier sans clé : age, gpg, ZIP, 7-Zip, LUKS, KeePass, openssl, Janus." },
        { n: "alea.rs, cles.rs, vecteurs.rs", d: "Aléa du système uniquement, encodage texte des clés (Bech32m, figé), vecteurs de test." },
        { n: "memoire.rs", d: "Le seul module qui contient du code unsafe (une centaine de lignes d'appels système) : verrouillage des secrets en mémoire vive, pas de fichier core, lecture du tout sans copie oubliée. Voir « Durcissement »." }
      ] },
      { link: "spec/ et clients/" },
      { name: "Spécification et clients", items: [
        { n: "spec/janus-v1.md", d: "La spécification normative, en anglais, autonome : elle suffit pour écrire une autre implémentation. Jointe à chaque archive de release." },
        { n: "clients/python, typescript, csharp, java", d: "Quatre implémentations indépendantes, écrites à partir de la spécification seule, avec la même ligne de commande (keygen, pubkey, encrypt, decrypt)." },
        { n: "clients/interop.py", d: "Test croisé : chaque implémentation chiffre, chacune des cinq déchiffre (75 combinaisons sur 75)." },
        { n: "preuves/cryptoverif/", d: "Deux modèles CryptoVerif du KEM caché (chemin ML-KEM, chemin X25519)." }
      ] }
    ]
  },
  commands: [
    { t: "Compiler et tester (depuis janus-rs/)", code: "cargo build --release\ncargo test --release          # les 70 tests" },
    { t: "Créer une identité, chiffrer pour une clé publique, déchiffrer", code: "target/release/janus cles moi.cle > moi.pub\ntarget/release/janus chiffrer -R moi.pub photo.jpg photo.janus\ntarget/release/janus dechiffrer -i moi.cle photo.janus photo.jpg" },
    { t: "Chiffrer par mot de passe", code: "target/release/janus chiffrer -m notes.txt notes.janus\ntarget/release/janus dechiffrer -m notes.janus notes.txt" },
    { t: "Deux visages : un leurre et un secret", code: "target/release/janus chiffrer -m vacances.zip coffre.janus --cache -m journal.txt\ntarget/release/janus dechiffrer -m coffre.janus sortie    # ouvre le visage du mot de passe saisi" },
    { t: "Trois visages : un leurre et deux secrets", code: "target/release/janus chiffrer -m vacances.zip coffre.janus --cache -m journal.txt --cache -m dossier.tar\n# --cache se répète jusqu'à 3 fois : un leurre et jusqu'à 3 visages cachés" },
    { t: "Tube : entrée et sortie standard (-)", code: "target/release/janus dechiffrer -m coffre.janus - | less    # tout est vérifié en mémoire avant d'écrire : aucun clair sur le disque\ntarget/release/janus chiffrer -R moi.pub - photo.janus < photo.jpg" },
    { t: "Modifier un fichier à plusieurs visages", code: "target/release/janus modifier -m --leurre vacances2.zip coffre.janus coffre2.janus --cache -m\n# exige l'identifiant de chaque visage : un visage non donné est perdu dans le nouveau fichier" },
    { t: "Voir ce qu'un tiers apprend d'un fichier", code: "target/release/janus inspect photo.janus archive.zip lettre.gpg" },
    { t: "Vérifications et mesures", code: "cargo run --release --example banc      # banc d'essai\ncargo run --release --example dudect   # temps constant\ncargo run --release --example fuite_bourrage   # fuite exacte de la taille\nJANUS_FUZZ_ITER=100000 cargo test --release --test fuzz -- --nocapture\ncargo +nightly fuzz run -O muter -- -max_total_time=600   # fuzzing guidé par la couverture" },
    { t: "Vérifier une archive téléchargée", code: "gh attestation verify janus-v0.2.0-alpha-x86_64-unknown-linux-gnu.tar.gz --repo moideci/janus\nsha256sum -c SHA256SUMS.txt --ignore-missing" },
    { t: "Un client écrit à partir de la spécification (Python, par exemple)", code: "python clients/python/janus.py keygen moi.cle > moi.pub\npython clients/python/janus.py encrypt photo.janus photo.jpg --to-file moi.pub\npython clients/python/janus.py decrypt photo.janus photo.jpg --id moi.cle    # les cinq implémentations s'ouvrent mutuellement" }
  ],
  sections: [
    { id: "presentation", cap: "Présentation", title: "Ce que Janus fait autrement",
      intro: "Un seul fichier, aucun octet reconnaissable, un nombre de destinataires caché et des contenus cachés possibles. Comparaison avec gpg et age, d'après le README du dépôt (v0.2.0-alpha).",
      blocks: [
        { table: { head: ["Propriété", "gpg", "age", "Janus"], rows: [
          ["Post-quantique hybride (ML-KEM-768 + X25519)", "non (2.4)", "en option", "<b>oui, toujours</b>"],
          ["L'outil se reconnaît au premier octet", "oui", "oui", "<b>non : tout le fichier ressemble à de l'aléa</b>"],
          ["Le nombre de destinataires se voit", "oui, avec leurs identifiants", "oui", "<b>non</b> (16 emplacements toujours présents)"],
          ["La taille du clair se lit", "à quelques octets près", "exactement", "<b>à quelques pour cent près</b> (bourrage « seau » : la taille ne révèle que ce que révèle PADMÉ, et la réserve)"],
          ["Un même fichier s'ouvre sur plusieurs contenus", "non", "non", "<b>oui : un leurre et jusqu'à 3 secrets</b>"],
          ["Engagement de clé", "non", "oui", "<b>oui</b>"]
        ] } },
        { cards: [
          { t: "Post-quantique hybride", p: "X-Wing combine ML-KEM-768 et X25519 : le contenu reste secret tant que l'un des deux tient. Avec un mot de passe, tant qu'il n'est pas deviné." },
          { t: "Indistinguable de l'aléa", p: "Ni nombre magique, ni version, ni longueur, ni liste d'algorithmes. Pour qui n'a pas de clé, chaque octet ressemble à de l'aléa ; la taille ne révèle que ce que révèle PADMÉ." },
          { t: "Destinataires cachés", p: "16 emplacements toujours présents, qu'il y ait 1 ou 16 destinataires. Les emplacements inutilisés sont de l'aléa." },
          { t: "Deux visages, et plus", p: "Un leurre et jusqu'à 3 secrets dans le même fichier. Sous contrainte, donner le mot de passe du leurre ; l'existence d'un autre visage ne peut pas être prouvée." },
          { t: "Engagement et intégrité", p: "Un fichier s'ouvre sur au plus quatre clés, une par étiquette. Modifier, tronquer ou réordonner un octet du visage ouvert fait échouer l'ouverture." }
        ] },
        { h: "Ce que Janus ne garantit pas" },
        { ul: [
          "<b>L'authentification de l'expéditeur</b> : un destinataire peut fabriquer un autre fichier que les autres destinataires ouvriront (piste E de la conception).",
          "<b>La confidentialité persistante</b> : si une clé privée fuit, tous les fichiers qui lui étaient destinés sont lisibles.",
          "<b>La détection d'un retour en arrière complet</b> : le remplacement du fichier entier par une ancienne version valide.",
          "<b>Le masquage de la longueur approximative du contenu</b> : la taille révèle exactement ce que révèle PADMÉ, une plage (voir « Le format »).",
          "<b>L'IND-CCA au sens strict</b> : la garantie prouvée est IND-RCCA (voir « Preuves »)."
        ] }
      ] },

    { id: "visages", cap: "Déni plausible", title: "Les deux visages",
      intro: "Un fichier s'ouvre sur un <b>leurre</b> avec un premier mot de passe (ou une première clé), et sur le <b>vrai contenu</b> avec un second ; depuis QB-3, le fichier peut cacher <b>jusqu'à 3 visages</b>, chacun avec son identifiant. Celui qui ne connaît que le premier ne peut pas <b>prouver</b> qu'il existe un autre visage : tous les fichiers Janus ont la même forme, qu'ils en contiennent un ou non. Cela répond à la menace de la coercition (document 03).",
      blocks: [
        { cards: [
          { t: "Ce qui est promis", p: "Un adversaire qui possède le fichier, connaît la spécification et a obtenu l'identifiant du leurre ne distingue pas un fichier avec visage caché d'un fichier sans, mieux que par hasard." },
          { t: "Ce qui ne l'est pas", p: "Qu'il ne soupçonne rien : il sait que Janus permet un second visage. Le déni peut aussi aggraver une situation face à un adversaire jamais satisfait. Et Janus ne protège pas les traces laissées par le système (fichiers temporaires, documents récents, miniatures, fichier d'échange)." },
          { t: "Règle 1 : une seule structure", p: "Le second visage est <b>le</b> format, pas une option. Chaque fichier contient quatre étiquettes d'en-tête (un leurre, jusqu'à 3 visages cachés) et une réserve ; inutilisées, elles sont de l'aléa." },
          { t: "Règle 2 : chaque visage est complet", p: "Chaque visage a sa propre clé de fichier, sa propre étiquette et son propre flux STREAM. Ouvrir un visage n'apprend rien sur l'autre, et chacun reste engagé." },
          { t: "Règle 3 : la taille ne dépend que du leurre", p: "La réserve est une fonction fixe et publique de la longueur du leurre. Une réserve variable trahirait le secret : le prix du déni est une réserve sur tous les fichiers." }
        ] },
        { h: "La réserve : max(64 Kio, L/16)" },
        { code: "L₁       = longueur du leurre\nRéserve  = max(R_min, ⌈L₁ / ρ⌉) = max(65 536, ⌈L₁ / 16⌉)       fonction FIXE, publique\nRef      = H + c(L₁) + Réserve\nX        = PADMÉ(Ref)\nF        = entier uniforme dans le seau [X, X + masque(X)]      seul le chiffrement tire F\nc(L)     = L + 16 × max(1, ⌈L / TB⌉)                            taille chiffrée d'un visage\ncapacité : c(L₂) ≤ Réserve" },
        { p: "Le secret (ou, avec plusieurs visages cachés, tous les secrets ensemble) doit tenir dans la réserve : 1/16 de la taille du leurre, et au moins 64 Kio. Sinon Janus refuse et indique la capacité disponible. La réserve est <b>jamais</b> agrandie pour faire entrer un secret, car sa taille dépendrait alors du secret. La position du visage caché est tirée uniformément dans <code>[c(L₁), F − H − c(L₂)]</code>." },
        { table: { head: ["Leurre", "Réserve fixe 64 Kio", "max(64 Kio, L₁/16) (retenue)", "max(64 Kio, L₁/8)"], rows: [
          ["100 Ko", "secret ≤ 65 Ko, fichier +52 %", "idem", "idem"],
          ["1 Mo", "secret ≤ 65 Ko, +7 %", "secret ≤ 65 Ko, +7 %", "secret ≤ 125 Ko, +13 %"],
          ["10 Mo", "secret ≤ 65 Ko, +0,3 %", "secret ≤ 625 Ko, +6 %", "secret ≤ 1,25 Mo, +13 %"],
          ["1 Go", "secret ≤ 65 Ko, +0 %", "secret ≤ 62 Mo, +6,5 %", "secret ≤ 125 Mo, +13 %"]
        ] } },
        { note: "Les pourcentages comparent la taille moyenne d'un fichier v1 à celle d'un fichier v0 de même contenu (document 03, § 5), avec l'ancien tirage de la taille. Ce coût s'applique à <b>tous</b> les fichiers, même sans visage caché. Choix décidé le 18 novembre 2026 (QB-1) : environ 6 % de plus par fichier, de quoi cacher un document. Depuis le bourrage en seau (21 novembre 2026), le surcoût total d'un fichier, réserve comprise, passe d'environ 7 % à 8,5 % (document 09, § 1.3)." },
        { h: "Règles de remplissage R1 à R6" },
        { table: { head: ["Règle", "Énoncé"], rows: [
          ["<b>R1</b>", "Un visage protégé par mot de passe n'a <b>que</b> ce mot de passe : sinon, un destinataire à clé connaissant K pourrait recopier l'emplacement dans un faux fichier. Chaque visage peut avoir son propre mot de passe."],
          ["<b>R2</b>", "Les emplacements de tous les visages sont tirés au hasard parmi les 16, sans doublon. Les autres sont de l'aléa."],
          ["<b>R3</b>", "Pas plus de 16 destinataires <b>au total</b> pour tous les visages."],
          ["<b>R4</b>", "Les places des quatre étiquettes <code>T_0</code> à <code>T_3</code> sont une permutation aléatoire : le visage principal reçoit l'une, chaque visage caché une autre. Les étiquettes inutilisées sont <code>aléa(32)</code>."],
          ["<b>R5</b>", "Janus <b>refuse</b> : le même mot de passe pour deux visages, la même clé publique dans deux visages, des visages cachés dont la taille totale dépasse la réserve."],
          ["<b>R6</b>", "Le leurre est toujours le visage principal : il commence au début du corps, comme l'unique visage d'un fichier ordinaire. Un visage qui commence au milieu du corps n'existe que dans un fichier à visage caché : son identifiant ne doit <b>jamais</b> être donné sous la contrainte."]
        ] } },
        { h: "Pièges d'usage (10.1 à 10.10)" },
        { table: { head: ["N°", "Piège", "Conseil ou conséquence"], rows: [
          ["10.1", "<b>Plusieurs versions du même fichier.</b> Un adversaire qui voit deux versions dont le leurre n'a pas changé mais dont tous les octets ont changé peut se demander pourquoi. C'est le talon d'Achille connu des volumes cachés de VeraCrypt.", "Modifier le leurre chaque fois qu'on modifie le secret."],
          ["10.2", "<b>Pas de modification en place.</b> Rechiffrer le leurre avec le seul mot de passe du leurre produit un fichier sans visage caché : le secret disparaît, sans avertissement possible.", "Refabriquer le fichier avec tous les visages : <code>janus modifier</code> exige l'identifiant de chacun."],
          ["10.3", "<b>Le leurre doit être crédible.</b> La réserve est fixe : un leurre minuscule ne trahit rien par la taille, mais il est peu vraisemblable comme chose à chiffrer.", "La cryptographie ne remplace pas le bon sens."],
          ["10.4", "<b>Nombre de visages borné.</b> Réglé par QB-3 : avec 4 étiquettes, l'adversaire qui a obtenu deux identifiants ne peut pas savoir s'il en existe un troisième ou un quatrième. Le maximum reste un leurre et 3 visages cachés.", "Quatre étiquettes coûtent 64 octets par fichier."],
          ["10.5", "<b>Signature incompatible.</b> Un leurre signé reste possible, mais le secret ne doit pas être signé avec la même clé.", "Piste E, non réalisée."],
          ["10.6", "<b>Traces du système.</b> Ouvrir le secret écrit son clair sur le disque.", "L'ouvrir dans un dossier lui-même chiffré, ou en mémoire : <code>janus dechiffrer -m coffre.janus - | less</code> vérifie tout avant d'écrire et ne crée aucun fichier en clair."],
          ["10.7", "<b>La ligne de commande doit rester muette.</b> Aucune option, aucun message, aucun code de retour ne doit différer selon qu'il existe un visage caché.", "Respecté : une seule erreur, « impossible de déchiffrer »."],
          ["10.8", "<b>Un même fichier peut montrer des contenus différents à plusieurs destinataires.</b> Un auteur malveillant peut mettre Alice dans un visage et Bob dans un autre.", "Comparer l'empreinte du <b>clair</b>, pas celle du fichier chiffré. Borné à quatre contenus, un par étiquette."],
          ["10.9", "<b>Un tiers peut effacer le secret sans que le leurre s'en aperçoive</b>, en écrasant la réserve.", "Garder une copie, et vérifier de temps en temps que le secret s'ouvre avec le second identifiant."],
          ["10.10", "<b><code>janus modifier</code> ne conserve que les visages dont on donne l'identifiant.</b> Avec 4 étiquettes, Janus ne peut pas savoir combien de visages cachés existent (le savoir ferait tomber le déni). Un visage dont l'identifiant est oublié est perdu dans le nouveau fichier ; l'ancien reste intact.", "Donner <b>tous</b> les identifiants à <code>modifier</code>, et garder l'ancien fichier jusqu'à avoir vérifié le nouveau."]
        ] } },
        { h: "Pourquoi l'adversaire contraint ne voit rien" },
        { p: "Il possède le fichier et le leurre ouvert. Chaque élément du fichier, sans puis avec visage caché (document 03, § 9) :" },
        { table: { head: ["Élément", "Sans visage caché", "Avec visage caché", "Pourquoi il ne distingue pas"], rows: [
          ["Étiquettes inutilisées par le leurre", "<code>aléa(32)</code>", "HMAC sous la clé de chaque secret", "HMAC est une fonction pseudo-aléatoire ; la clé lui est inconnue"],
          ["Emplacements hors leurre", "<code>aléa(1632)</code>", "emplacements du secret", "Encapsulation X-Wing cachée et AEAD sous une clé inconnue"],
          ["<code>sel</code>", "aléa", "aléa, partagé", "identique"],
          ["Réserve et fin du corps", "aléa", "flux ChaCha20-Poly1305", "un chiffré ChaCha20-Poly1305 est indistinguable de l'aléa"],
          ["Taille <code>F</code>", "dépend de L₁ seul", "dépend de L₁ seul", "même loi de tirage"],
          ["Position du leurre", "début du corps", "début du corps", "règle R6"],
          ["Temps d'ouverture du leurre", "16 essais", "16 essais", "même travail, mesuré avec dudect"]
        ] } },
        { h: "Ce qui existe ailleurs" },
        { table: { head: ["Système", "Niveau", "Différence avec Janus"], rows: [
          ["VeraCrypt, volumes cachés", "volume disque", "mono-utilisateur, pas post-quantique, pas un fichier qu'on envoie"],
          ["Shufflecake (2023)", "volume disque Linux", "plusieurs niveaux cachés, mais pour des disques"],
          ["Rubberhose (1997)", "disque", "ancêtre du principe, abandonné"],
          ["Deniable encryption (Canetti, Dwork, Naor, Ostrovsky, 1997)", "théorie", "autre notion : l'expéditeur fabrique un faux aléa"],
          ["age, gpg", "fichier", "aucun déni ; leurs en-têtes affichent outil et destinataires"]
        ] } },
        { note: "À la connaissance des auteurs, aucun format de <b>fichier</b> ne combine déni à deux visages, chiffrement post-quantique hybride, plusieurs destinataires par visage et indistinguabilité totale pour les tiers.", cls: "ok" }
      ] },

    { id: "format", cap: "Spécification", title: "Le format",
      intro: "Format v1, tel que la v0.2.0-alpha l'implémente (documents 02 et 03, et la <a href=\"#specclients\">spécification en anglais</a>, <code>spec/janus-v1.md</code>) ; les fichiers de la v0.1.0-alpha, à deux étiquettes, ne s'ouvrent pas avec la v0.2.0-alpha. Aucun champ en clair : la version est dans les étiquettes de dérivation (<code>janus/v1/…</code>), un lecteur d'une autre version échoue comme pour un fichier qui ne lui est pas destiné. Ce format est <b>candidat au gel</b> depuis le 19 novembre 2026 (tableau des décisions dans le <a href=\"#release\">plan de release</a>) ; gel définitif en v1.0.",
      blocks: [
        { code: " décalage   taille           contenu\n ────────   ──────────────   ─────────────────────────────────────────────\n 0          32               T_0      étiquette d'en-tête n° 0\n 32         32               T_1      étiquette d'en-tête n° 1\n 64         32               T_2      étiquette d'en-tête n° 2\n 96         32               T_3      étiquette d'en-tête n° 3\n 128        32               sel      sel Argon2id, commun à tous les visages\n 160        16 × 1632        E_0 … E_15   emplacements de destinataire\n 26 272     F − 26 272       corps    visage principal, réserve, visages cachés" },
        { p: "<code>H</code> = 160 + 16 × 1632 = <b>26 272</b> octets (26 208 dans la v0.1.0-alpha, 25 888 pour le format v0). Constantes : 16 emplacements, blocs de clair <code>TB</code> = 65 536 octets, blocs chiffrés <code>TC</code> = 65 552 octets." },
        { h: "Un emplacement (1632 octets)" },
        { table: { head: ["Décalage", "Taille", "Champ", "Contenu"], rows: [
          ["0", "32", "<code>r</code>", "représentant Elligator 2 (aléa pour un mot de passe)"],
          ["32", "1536", "<code>κ</code>", "Kemeleon(ct_M), masqué (aléa pour un mot de passe)"],
          ["1568", "64", "<code>w</code>", "AEAD(clé_emb, 0¹², K ‖ BE64(début) ‖ BE64(longueur))"]
        ] } },
        { p: "<code>w</code> transporte aussi <b>où commence</b> le visage dans le corps et la <b>longueur exacte</b> de son clair : un visage ne s'arrête plus à la fin du fichier. L'emplacement d'un mot de passe est un emplacement quelconque ; un emplacement inutilisé est <code>aléa(1632)</code>." },
        { h: "Le corps" },
        { code: "corps = [ visage principal ][ réserve : aléa et jusqu'à 3 visages cachés, dans un ordre aléatoire ][ aléa ]\n         début = 0            Réserve(L₁) octets garantis                              tirage PADMÉ" },
        { p: "Chaque visage est un flux STREAM ordinaire qui commence à <code>début</code> et compte <code>n = max(1, ⌈longueur / TB⌉)</code> blocs, le dernier étant partiel et portant le drapeau « dernier ». Le bourrage chiffré de la v0 a disparu : la longueur est dans <code>w</code>, et tout ce qui n'appartient à aucun visage est de l'aléa. Le corps n'a plus besoin de finir sur une frontière de bloc : les 16 tailles sur 65 552 que la v0 ne produisait jamais deviennent possibles." },
        { h: "Dérivations" },
        { code: "K_entete      = HKDF(K, \"janus/v1/entete\")\nK_corps       = HKDF(K, \"janus/v1/corps\")\nclé_emb_i     = HKDF(ss_i, \"janus/v1/emballage/xwing\" ‖ octet(i))       clé publique\nA             = Argon2id(mdp, sel)                                       un seul calcul\nclé_emb_mdp_i = HKDF(A,    \"janus/v1/emballage/mdp\"   ‖ octet(i))        mot de passe\n\nT_visage = HMAC(K_entete, BE64(F) ‖ BE64(début) ‖ BE64(longueur) ‖ sel ‖ E_0 ‖ … ‖ E_15)" },
        { cards: [
          { t: "Un sel commun, à place fixe", p: "Un mot de passe ouvre n'importe lequel des 16 emplacements avec <b>un seul</b> Argon2id, suivi de 16 essais d'AEAD presque gratuits. Deux mots de passe différents partagent le sel sans inconvénient." },
          { t: "T couvre début et longueur", p: "Sans cela, un auteur malveillant pourrait donner à deux destinataires d'un même visage la même clé mais deux positions, donc deux contenus. Réussir l'ouverture fixe K, début et longueur." },
          { t: "T couvre F", p: "Ajouter ou retirer des octets à la fin du fichier fait échouer <b>tous</b> les visages : troncatures et ajouts restent détectés." },
          { t: "Une seule erreur", p: "Toute erreur produit le même message : « impossible de déchiffrer ». Jamais de message du type « ce fichier contient un autre visage »." }
        ] },
        { h: "Taille du fichier" },
        { p: "La taille <code>F</code> n'est pas <code>PADMÉ(Ref)</code> telle quelle : les tailles PADMÉ se terminent par beaucoup de bits à zéro, ce qui serait une signature. Janus tire <code>F</code> <b>uniformément dans le « seau » de <code>PADMÉ(Ref)</code></b> (spécification, § 6.2) :" },
        { code: "Ref      = H + c(L₁) + Réserve(L₁)\nX        = PADMÉ(Ref)\nF        = entier uniforme dans [X, X + masque(X)]     masque(X) = 2^(E−S) − 1, calculé sur X" },
        { p: "Les seaux <code>[X, X + masque(X)]</code> des valeurs <code>X</code> que PADMÉ produit <b>pavent les entiers</b> : <code>F</code> détermine son seau, donc <code>X</code>, et, sachant <code>X</code>, <code>F</code> est uniforme sur le seau, indépendamment de <code>L₁</code>. La taille <b>ne révèle donc exactement que ce que révèle PADMÉ</b> (document 09, § 1) ; ses bits de poids faible sont uniformes, sans motif de bits nuls. Les lecteurs ne vérifient pas cette règle (tout <code>F</code> qui laisse la place aux visages s'ouvre) : seul le chiffrement change." },
        { note: "<b>Pourquoi un seau ?</b> L'ancienne règle (<code>F</code> uniforme dans <code>[Ref, PADMÉ(Ref)]</code>) fuyait <b>0,8 bit de plus en moyenne</b>, et <b>3 à 4 bits de plus au pire</b> que PADMÉ, car <code>F ≥ Ref</code> borne <code>L₁</code> par le haut. Le calcul exact de la fuite (<code>examples/fuite_bourrage.rs</code>, information mutuelle et fuite maximale) a motivé le changement, décidé le 21 novembre 2026. Les fichiers déjà écrits restent lisibles.", cls: "ok" },
        { table: { head: ["Tirage de la taille", "Information mutuelle (L uniforme sur [0, 1 Gio))", "Fuite maximale", "Surcoût moyen (pire)"], rows: [
          ["Ancienne règle [Ref, PADMÉ(Ref)]", "7,80 bits", "12,45 bits", "0,56 % (3,12 %)"],
          ["PADMÉ seul (signature de bits nuls)", "6,97 bits", "8,78 bits", "sans objet"],
          ["<b>Seau (v0.2.0-alpha)</b>", "<b>6,97 bits</b>", "<b>8,78 bits</b>", "2,24 % (6,25 %)"]
        ] } },
        { ul: [
          "Surcoût du bourrage PADMÉ seul selon la spécification v0 : au plus environ 12 % pour les petits contenus, moins de 4 % au-delà de 4 Mio (mesuré sur 20 000 tailles).",
          "Tags : 16 octets par bloc de 64 Kio, soit 0,02 %.",
          "La v1 écrit environ 6 % d'octets en plus (la réserve), et environ 2,2 % de plus en moyenne avec le seau, soit environ 8,5 % au total (document 09, § 1.3)."
        ] },
        { h: "De la v0 à la v1" },
        { table: { head: ["Point", "v0", "v1 (un leurre, jusqu'à 3 visages cachés)"], rows: [
          ["En-tête", "<code>T</code>, 16 × 1616", "<code>T_0</code> à <code>T_3</code>, <code>sel</code>, 16 × 1632 (+384 octets)"],
          ["<code>w</code>", "<code>K</code>", "<code>K ‖ début ‖ longueur</code>"],
          ["Mot de passe", "seulement en <code>E_0</code>", "dans n'importe quel emplacement, avec un seul Argon2id"],
          ["Bourrage", "<code>0x80 ‖ 0x00*</code> chiffré", "aucun : la longueur est dans <code>w</code>, le reste est de l'aléa"],
          ["Tailles impossibles", "16 sur 65 552", "aucune"],
          ["P2 (intégrité)", "chaque octet du fichier", "chaque octet <b>du visage ouvert</b>, plus la taille totale <code>F</code>"],
          ["P3 (engagement)", "une seule clé par fichier", "<b>au plus quatre</b> clés, une par étiquette"],
          ["P4 (cohérence)", "tous les destinataires lisent la même chose", "tous les destinataires <b>d'un même visage</b> ; des visages différents peuvent montrer des contenus différents, quatre au plus (piège 10.8)"]
        ] } }
      ] },

    { id: "specclients", cap: "Cinq implémentations", title: "Spécification et clients",
      intro: "La v0.2.0-alpha décrit le format dans une <b>spécification normative en anglais</b>, et quatre autres implémentations l'ont suivie <b>sans lire le code Rust</b>. Leur but : prouver que la spécification est complète et sans ambiguïté.",
      blocks: [
        { cards: [
          { t: "La spécification", p: "<code>spec/janus-v1.md</code> décrit le format octet par octet, en anglais ; elle est <b>autonome</b> (elle suffit pour écrire une autre implémentation) et jointe à chaque archive de release. Le bourrage en seau est au § 6.2, les propriétés au § 9." },
          { t: "Quatre clients indépendants", p: "Python, TypeScript, C# et Java, dans <code>clients/</code>, écrits à partir de la spécification seule. Aucun ne télécharge quoi que ce soit, à la compilation ou à l'exécution ; seul le client Python demande un paquet tiers (<code>cryptography</code>)." },
          { t: "Interopérabilité 75/75", p: "Chaque implémentation chiffre, chacune des cinq déchiffre : 75 combinaisons sur 75, vérifiées par l'intégration continue (<code>clients/interop.py</code>). Tous ouvrent aussi les vecteurs de test de référence. Les retours des clients ont servi à préciser la spécification." }
        ] },
        { table: { head: ["Client", "Se lance avec", "Primitives de la plateforme", "Écrit pour l'occasion"], rows: [
          ["<b>Python</b> 3.11+", "<code>python</code> et le paquet <code>cryptography</code> (44 ou plus)", "ML-KEM-768, Argon2id, ChaCha20-Poly1305, HKDF, HMAC, SHA-2, SHA-3", "arithmétique de Curve25519, Elligator 2, Kemeleon, Bech32m, format"],
          ["<b>TypeScript</b>", "Node.js 26 (exécute les <code>.ts</code> directement)", "les mêmes, par <code>node:crypto</code>", "arithmétique de Curve25519, Elligator 2, Kemeleon, Bech32m, format"],
          ["<b>C#</b>", "SDK .NET 10", "SHA-256, HMAC, HKDF, aléa", "ML-KEM-768, Keccak, Argon2id (BLAKE2b), ChaCha20-Poly1305, Curve25519, Elligator 2, Kemeleon, Bech32m, format"],
          ["<b>Java</b>", "JDK 21 (<code>javac</code>, sans outil de construction)", "SHA-256, SHA3, HMAC, ChaCha20-Poly1305, aléa", "ML-KEM-768, SHAKE, Argon2id (BLAKE2b), HKDF, Curve25519, Elligator 2, Kemeleon, Bech32m, format"]
        ] } },
        { h: "Une ligne de commande commune" },
        { code: "<client> keygen FICHIER_IDENTITÉ        crée une identité ; écrit la clé publique (janus1…) sur la sortie standard\n<client> pubkey FICHIER_IDENTITÉ        affiche la clé publique d'une identité\n<client> encrypt SORTIE ENTRÉE DESTINATAIRES [--hidden ENTRÉE DESTINATAIRES]...\n<client> decrypt ENTRÉE SORTIE (--pass MOT_DE_PASSE | --id FICHIER_IDENTITÉ ...)\n\nDESTINATAIRES := --pass MOT_DE_PASSE                          un mot de passe, seul dans son visage\n               | (--to CLÉ_PUBLIQUE | --to-file FICHIER)+    de 1 à 16 clés publiques" },
        { ul: [
          "<code>encrypt</code> : la première entrée est le visage principal (le leurre) ; chaque <code>--hidden</code> ajoute un visage caché, 3 au plus. Le chiffreur applique les règles R1, R3 et R5.",
          "<code>decrypt</code> ouvre le visage que le secret ouvre, et rien d'autre. En cas d'échec, il n'écrit rien, affiche <code>cannot decrypt</code> et sort avec le code 1.",
          "<code>keygen</code>, <code>encrypt</code> et <code>decrypt</code> refusent d'écraser un fichier existant. Un mot de passe en argument est visible des autres utilisateurs de la machine : pour des fichiers de test seulement."
        ] },
        { h: "Ce que chaque script de test vérifie" },
        { ol: [
          "X-Wing contre le vecteur n° 1 du draft-11, et Bech32m contre les vecteurs de BIP 350 ;",
          "les clés des vecteurs (<code>vecteurs/cles.json</code>) reproduites exactement depuis les graines ;",
          "tous les fichiers de <code>vecteurs/</code> ouverts avec chaque secret du manifeste (et chaque visage caché), l'empreinte SHA-256 de chaque clair vérifiée, et un échec avec une identité étrangère ou un mauvais mot de passe ;",
          "des fichiers chiffrés par le client lui-même (mot de passe, clés, plusieurs visages cachés, clairs vides ou de plusieurs blocs), puis rouverts."
        ] },
        { note: "<b>Des clients d'interopérabilité, pas pour de vrais secrets.</b> Comme l'implémentation de référence, ils n'ont pas été audités ; contrairement à elle, ils ne garantissent <b>pas le temps constant</b> (les grands entiers de Python, JavaScript, Java et C# ne le sont pas, et certaines primitives sont écrites de zéro). Ils servent à lire et écrire des fichiers de test, et à vérifier la spécification.", cls: "warn" }
      ] },

    { id: "crypto", cap: "Primitives et assemblage", title: "La cryptographie",
      intro: "Aucune primitive n'est inventée : Janus invente une composition, un format et des propriétés. Les apports propres à Janus, donc les plus à risque, sont le <b>point sale combiné à X-Wing</b> (dont l'IND-CCA est désormais vérifié par CryptoVerif) et le <b>bourrage en seau</b>.",
      blocks: [
        { table: { head: ["Brique", "Référence ou paramètres", "Rôle dans Janus"], rows: [
          ["X-Wing", "<code>draft-connolly-cfrg-xwing-kem-11</code> ; ML-KEM-768 + X25519 ; clé publique de 1216 octets (1184 + 32), identité = graine de 32 octets", "KEM hybride des destinataires à clé publique ; le vecteur de test officiel n° 1 est reproduit"],
          ["Kemeleon", "<code>draft-irtf-cfrg-kemeleon-02</code>, variante sans échec, 1536 octets ; écrit sur place, en temps constant", "encode le chiffré ML-KEM pour qu'il ressemble à de l'aléa"],
          ["Elligator 2", "RFC 9380, § 6.7.1 ; inverse maison pour un point quelconque (<code>fiat-crypto</code>)", "représente le point de courbe X25519 comme 32 octets uniformes"],
          ["ChaCha20-Poly1305", "RFC 8439, sans données associées", "emballage <code>w</code> et blocs du corps"],
          ["HKDF-SHA-256, HMAC-SHA-256", "sel vide, sortie de 32 octets", "dérivation de sous-clés et étiquettes d'en-tête"],
          ["Argon2id", "version 0x13, 64 Mio, 3 passes, parallélisme 4, sortie de 32 octets (RFC 9106, seconde configuration recommandée)", "dérivation depuis un mot de passe ; paramètres fixes, absents du fichier"],
          ["STREAM", "blocs de 64 Kio, nonce = compteur sur 11 octets + drapeau « dernier »", "chiffrement du corps, parallélisable par lots"],
          ["PADMÉ, en seau", "taille tirée uniformément dans le seau de PADMÉ(Ref) (spécification, § 6.2)", "masque la longueur du clair ; la fuite est exactement celle de PADMÉ"]
        ] } },
        { h: "Encapsulation X-Wing rendue indistinguable" },
        { p: "X-Wing produit un chiffré <code>ct_M ‖ ct_X</code> dont aucune partie ne ressemble à de l'aléa. Janus les <b>encode</b> sans toucher à la cryptographie d'X-Wing. Côté chiffrement, pour un destinataire <code>pk = pk_M ‖ pk_X</code> :" },
        { ol: [
          "<b>ML-KEM.</b> <code>(ss_M, ct_M) = ML-KEM-768.Encaps(pk_M)</code>.",
          "<b>Éphémère X25519 « caché ».</b> Tirer le scalaire <code>e</code> <b>uniformément modulo ℓ</b> (64 octets d'aléa réduits), sans le clamper. Calculer <code>P = e·B + L</code>, où <code>L</code> est un point d'ordre faible tiré au hasard : le point « sale » est <b>uniforme sur toute la courbe</b>. Recommencer tant que <code>P</code> n'a pas de représentant Elligator 2 (environ une fois sur deux). <code>r</code> est un représentant aléatoire de <code>P</code> dont les 2 bits de poids fort sont aléatoires ; <code>ct_X</code> est la coordonnée u de <code>P</code> ; <code>ss_X = e·pk_X</code>.",
          "<b>Combineur X-Wing.</b> <code>ss = SHA3-256(ss_M ‖ ss_X ‖ ct_X ‖ pk_X ‖ XWingLabel)</code>, selon le draft-11.",
          "<b>Kemeleon.</b> <code>κ = Kemeleon.EncodeCtxt(ct_M)</code>, 1536 octets.",
          "<b>Masquage de κ.</b> <code>κ' = κ ⊕ SHAKE256(\"janus/v1/masque\" ‖ ss_X ‖ ct_X, 1536 octets)</code>.",
          "<b>Assemblage.</b> <code>E_i = r ‖ κ' ‖ AEAD(clé_emb_i, 0¹², …)</code>."
        ] },
        { p: "Côté déchiffrement : <code>ct_X</code> est retrouvé depuis <code>r</code> (2 bits de poids fort ignorés), <code>ss_X = X25519(sk_X, ct_X)</code>, <code>κ</code> est démasqué, <code>Kemeleon.DecodeCtxt</code> redonne <code>ct_M</code> (le décodage ne peut pas échouer), puis la décapsulation X-Wing standard conclut. La composante d'ordre faible <code>L</code> disparaît car le scalaire clampé du destinataire est multiple de 8." },
        { cards: [
          { t: "Elligator 2 et scalaire uniforme", p: "Le crate d'origine clampe le scalaire : le point ne couvre alors que la moitié du sous-groupe premier, ce qu'un ordinateur quantique sait tester. Janus tire <code>e</code> uniformément modulo ℓ et calcule lui-même l'inverse d'Elligator 2 (<code>src/elligator.rs</code>, en temps constant). Correctif issu de la preuve 04." },
          { t: "Masquage de κ", p: "<code>κ</code> est masqué par un flux dérivé de X25519. Un emplacement à clé ne devient reconnaissable que si MLWE <b>et</b> X25519 tombent tous les deux : la discrétion est hybride, comme la confidentialité. Le masque ne dépend que de <code>ss_X</code> et <code>ct_X</code>, ce qui est nécessaire à la preuve IND-RCCA." },
          { t: "Kemeleon en temps constant", p: "Implémentation propre à Janus (division par q sans l'instruction <code>div</code>), comparée à une implémentation de référence ; dudect ne détecte aucune fuite." },
          { t: "STREAM", p: "Nonce compteur, drapeau « dernier » sur le bloc final, blocs indépendants chiffrés et déchiffrés en parallèle. Sûr parce que la clé <code>K</code> est neuve pour chaque fichier." },
          { t: "PADMÉ en seau", p: "Taille tirée uniformément dans le seau de PADMÉ(Ref), indépendante du nombre de destinataires : la fuite égale celle de PADMÉ, sans sa signature de bits nuls. Les tailles de la v0 qui ne pouvaient jamais apparaître n'existent plus." },
          { t: "Argon2id, un seul calcul", p: "Le sel est commun : un mot de passe coûte un Argon2id puis 16 essais d'AEAD. Les 16 essais et les 16 étiquettes sont <b>toujours</b> calculés, pour un temps d'ouverture indépendant de l'emplacement trouvé." }
        ] },
        { h: "Propriétés visées" },
        { table: { head: ["Propriété", "Signification"], rows: [
          ["<b>P1</b> Confidentialité hybride", "Le contenu reste secret tant que X25519 <b>ou</b> ML-KEM-768 tient ; pour un mot de passe, tant qu'il n'est pas deviné."],
          ["<b>P2</b> Intégrité", "Modifier, ajouter, retirer, tronquer ou réordonner un octet du visage ouvert (ou la taille totale) fait échouer l'ouverture. Modifier la réserve ne gêne pas le leurre : c'est voulu."],
          ["<b>P3</b> Engagement de clé", "Un fichier ne s'ouvre que sur au plus quatre clés de fichier, une par étiquette."],
          ["<b>P4</b> Cohérence", "Tous les destinataires d'un même visage lisent la même chose."],
          ["<b>P5</b> Indistinguabilité", "Sans clé, chaque octet est indistinguable de l'aléa ; la taille ne dépend que de la longueur du leurre, et ne révèle que ce que révèle PADMÉ."],
          ["<b>P6</b> Destinataires cachés", "Ni le nombre ni l'identité des destinataires ne se voient, ni dans les octets, ni dans la taille."]
        ] } }
      ] },

    { id: "cli", cap: "Utilisation", title: "La ligne de commande",
      intro: "Le binaire <code>janus</code> se compile depuis <code>janus-rs/</code>. Les commandes sont : <code>cles</code>, <code>publique</code>, <code>chiffrer</code>, <code>dechiffrer</code>, <code>modifier</code> et <code>inspect</code> ; <code>janus --version</code> (<code>-V</code>) et <code>janus --help</code> (<code>-h</code>, <code>aide</code>) répondent aussi.",
      blocks: [
        { code: "# Une identité, puis un fichier pour une clé publique\njanus cles moi.cle > moi.pub\njanus chiffrer -R moi.pub photo.jpg photo.janus\njanus dechiffrer -i moi.cle photo.janus photo.jpg\njanus publique moi.cle                    # réaffiche la clé publique d'une identité\n\n# Par mot de passe\njanus chiffrer -m notes.txt notes.janus\n\n# Deux visages : tout ce qui suit --cache décrit le visage caché\njanus chiffrer -m vacances.zip coffre.janus --cache -m journal.txt\njanus chiffrer -R moi.pub rapport.pdf coffre.janus --cache -R moi-secret.pub notes.md\njanus dechiffrer -m coffre.janus sortie   # ouvre le visage du mot de passe saisi\n\n# Trois visages : --cache se répète jusqu'à 3 fois (un leurre et jusqu'à 3 visages cachés)\njanus chiffrer -m vacances.zip coffre.janus --cache -m journal.txt --cache -m dossier.tar\n\n# Entrée et sortie standard : - ; tout est vérifié en mémoire avant d'écrire\njanus dechiffrer -m coffre.janus - | less\njanus chiffrer -R moi.pub - photo.janus < photo.jpg\n\n# Rechiffrer en exigeant l'identifiant de chaque visage (voir le piège 10.10)\njanus modifier -m --leurre vacances2.zip coffre.janus coffre2.janus --cache -m\n\n# Ce qu'un tiers voit, sans clé\njanus inspect coffre.janus archive.zip lettre.gpg" },
        { table: { head: ["Option", "Rôle"], rows: [
          ["<code>-r &lt;clé&gt;</code>", "passe une clé publique en argument"],
          ["<code>-R &lt;fichier&gt;</code>", "lit une clé publique dans un fichier ; <code>-r</code> et <code>-R</code> se répètent, jusqu'à 16 destinataires au total pour les deux visages"],
          ["<code>-m</code>", "utilise un mot de passe"],
          ["<code>-i &lt;fichier&gt;</code>", "identité (clé privée) pour déchiffrer"],
          ["<code>--cache</code>", "tout ce qui suit décrit un visage caché : ses destinataires (<code>-r</code>, <code>-R</code> ou <code>-m</code>), puis son fichier ; se répète jusqu'à 3 fois"],
          ["<code>-</code>", "à la place d'une entrée ou d'une sortie : entrée standard ou sortie standard, pour <code>chiffrer</code> et <code>dechiffrer</code>"],
          ["<code>modifier</code>", "<code>janus modifier &lt;ouverture&gt; [--leurre &lt;fichier&gt;] &lt;ancien&gt; &lt;nouveau&gt; --cache &lt;ouverture&gt; [--secret &lt;fichier&gt;]</code> : rechiffre avec un aléa neuf en exigeant l'identifiant de <b>chaque</b> visage ; <code>--leurre</code> et <code>--secret</code> remplacent un contenu, sinon il est conservé. <code>&lt;ouverture&gt;</code> : <code>-m</code>, ou <code>-i &lt;identité&gt;</code> plus d'éventuelles clés <code>-r</code>/<code>-R</code>"],
          ["<code>JANUS_MDP</code>, <code>JANUS_MDP_CACHE</code>, <code>JANUS_MDP_CACHE2</code>, <code>JANUS_MDP_CACHE3</code>", "variables d'environnement qui fournissent les mots de passe du leurre et des trois visages cachés sans les demander ; réservées aux tests automatiques"]
        ] } },
        { cards: [
          { t: "Capacité des visages cachés", p: "Les secrets doivent tenir ensemble dans la réserve : 1/16 de la taille du leurre, et au moins 64 Kio. Sinon Janus refuse et indique la capacité disponible." },
          { t: "Silence sur l'autre visage", p: "<code>dechiffrer</code> ne signale <b>jamais</b> l'existence d'un autre visage. Un mauvais identifiant donne l'unique message « impossible de déchiffrer »." },
          { t: "Fichiers de clés", p: "UTF-8 ou UTF-16 : la redirection <code>&gt;</code> de PowerShell fonctionne directement. Les clés sont en <b>Bech32m</b> (BIP 350), comme age : une identité <code>JANUS-SECRET-KEY-1…</code> (76 caractères, majuscules ; la somme de contrôle garantit la détection de 4 fautes de frappe au plus) et une clé publique <code>janus1…</code> (minuscules, environ 1958 caractères). Les identités de l'aperçu (<code>JANUS-SECRET-V0-…</code>) restent lisibles jusqu'à la v1.0 ; les anciennes clés publiques <code>janus-pub-v0-…</code> ne sont plus acceptées : <code>janus publique moi.cle</code> donne la nouvelle. Vecteurs dans <code>janus-rs/vecteurs/cles.json</code>." },
          { t: "Version", p: "<code>janus --version</code> répond « format Janus v1, candidat au gel : il ne changerait plus que pour corriger une faille trouvée par une relecture ou un audit », suivi de l'avertissement « Prototype de recherche non audité : ne pas l'utiliser pour de vrais secrets »." },
          { t: "Traitement en flux", p: "Mémoire bornée quelle que soit la taille du fichier : environ 42 Mio, plus 64 Mio pour Argon2 avec un mot de passe." },
          { t: "Pas de trace en cas d'échec", p: "Le résultat est écrit dans un fichier temporaire, renommé seulement si tout est valide. Un fichier refusé ne laisse aucune trace." },
          { t: "Entrée et sortie standard", p: "<code>-</code> désigne l'entrée ou la sortie standard. <code>dechiffrer … -</code> déchiffre et vérifie tout <b>en mémoire</b> avant d'écrire quoi que ce soit : aucun clair n'est créé sur le disque. Pour <code>chiffrer</code>, l'entrée standard est lue en entier en mémoire, car Janus doit connaître sa longueur à l'avance." },
          { t: "<code>modifier</code> et le piège 10.10", p: "<code>modifier</code> vérifie que le premier identifiant ouvre le leurre et avertit si le leurre ne change pas. Il ne peut pas savoir combien de visages cachés existent : un visage dont on ne donne pas l'identifiant est perdu dans le nouveau fichier (l'ancien reste intact)." }
        ] }
      ] },

    { id: "inspect", cap: "Vu de l'extérieur", title: "janus inspect : ce qu'un tiers voit",
      intro: "<code>inspect</code> lit un fichier <b>sans clé</b>, sans rien déchiffrer ni écrire. Il dit ce que le fichier révèle : l'outil, les destinataires, les algorithmes, la taille du clair et la part d'aléa. Résultats sur les échantillons du dépôt (<code>tests/echantillons/</code>) :",
      blocks: [
        { table: { head: ["Fichier", "Outil", "Destinataires", "Algorithmes", "Taille du clair", "Noms de fichiers"], rows: [
          ["gpg, 2 clés", "visible", "<b>identifiants de clé</b> en clair", "visibles", "à quelques octets près", "non"],
          ["gpg, mot de passe", "visible", "1 mot de passe", "AES-256, SHA-512 sur 24 Mo", "à quelques octets près", "non"],
          ["age (construit à la main)", "visible", "nombre et type, étiquette des clés SSH", "visibles", "<b>exacte</b>", "non"],
          ["ZIP ZipCrypto", "visible", "sans objet", "ZipCrypto, <b>cassé</b>", "exacte, fichier par fichier, avec le CRC-32", "<b>en clair</b>"],
          ["ZIP AES-256", "visible", "sans objet", "visibles", "exacte, fichier par fichier", "<b>en clair</b>"],
          ["7-Zip sans <code>-mhe</code>", "visible", "sans objet", "non analysés", "non analysée", "lisibles par <code>7z l</code>"],
          ["<b>Janus</b>", "<b>rien</b>", "<b>rien</b>", "<b>rien</b>", "une plage (quelques pour cent, selon le seau PADMÉ)", "non"]
        ] } },
        { p: "Pour un fichier sans signature, <code>inspect</code> teste l'hypothèse « fichier Janus v1 » : la taille est-elle possible, et le contenu indiscernable de l'aléa (χ² global et χ² par bloc de 4 Kio) ? Si oui, il calcule la plage de taille du leurre (les longueurs dont le seau contient la taille observée) et la capacité d'un éventuel visage caché, dont il ne peut rien dire de plus. Il précise que cela <b>ne prouve pas</b> que le fichier vient de Janus." },
        { cards: [
          { t: "Aucun faux positif", p: "Sur 14 000 fichiers aléatoires, y compris en imposant chacun des 256 premiers octets possibles." },
          { t: "Aucune panique", p: "Sur des échantillons tronqués à chaque longueur et abîmés 3 000 fois chacun." },
          { t: "Rapide", p: "512 Mio analysés en 0,4 s." },
          { t: "Limites d'inspect", p: "Les formats sont reconnus par leur structure, sans décodage complet : pas de décompression de l'en-tête 7z, pas d'analyse du JSON de LUKS2 ni de l'en-tête KeePass. Pour age, les tests portent sur des fichiers construits à la main (age n'est pas installé)." }
        ] }
      ] },

    { id: "preuves", cap: "Sécurité prouvée, sur papier", title: "Les preuves de sécurité",
      intro: "Trois documents (04, 05, 06) prouvent les propriétés du format par réduction : si quelqu'un savait gagner le jeu, on saurait attaquer l'une des briques (X-Wing, ChaCha20, HMAC, MLWE ou la devinette du mot de passe). Le document 09 (21 novembre 2026) les renforce : fuite exacte de la taille, KEM caché vérifié par machine, preuves face à un ordinateur quantique. Elles ne disent rien si une brique tombe.",
      blocks: [
        { note: "<b>Limite essentielle :</b> les preuves 04 à 06 sont des preuves « papier ». Seul le <b>KEM caché</b> est <b>vérifié par machine</b> (CryptoVerif) ; le fichier entier ne l'est pas. <b>Aucune preuve n'a été relue par un cryptographe.</b>", cls: "warn" },
        { table: { head: ["Document", "Ce qui est prouvé", "Notion", "Hypothèses principales"], rows: [
          ["<a href=\"https://github.com/moideici/janus/blob/main/docs/04-preuve-deux-visages.md\" target=\"_blank\" rel=\"noopener\">04, déni</a>", "l'adversaire qui possède le fichier et tous les secrets du leurre ne devine pas s'il existe un ou plusieurs visages cachés (jusqu'à 3) ; corollaire : un tiers ne distingue pas un fichier Janus de l'aléa", "jeu DENI, indistinguabilité", "MLWE <b>ou</b> gap-DH ; HKDF, SHA3 et Argon2id en oracles aléatoires ; ChaCha20-Poly1305 IND$ ; HMAC PRF ; Elligator statistique ; entropie du mot de passe"],
          ["<a href=\"https://github.com/moideici/janus/blob/main/docs/05-preuve-integrite.md\" target=\"_blank\" rel=\"noopener\">05, intégrité</a>", "engagement (au plus 4 clés par fichier), cohérence par visage, intégrité par visage, pas d'oracle de partition (au plus 4 mots de passe testés par requête d'oracle de partition)", "collisions, INT-CTXT", "résistance aux collisions de SHA-256 ; HMAC ; ChaCha20-Poly1305 INT-CTXT ; rejet implicite de ML-KEM"],
          ["<a href=\"https://github.com/moideici/janus/blob/main/docs/06-preuve-confidentialite-active.md\" target=\"_blank\" rel=\"noopener\">06, confidentialité active</a>", "confidentialité face à un adversaire qui fait ouvrir des fichiers fabriqués ou modifiés", "<b>IND-RCCA</b>", "les précédentes, plus ML-KEM IND-CCA <b>ou</b> gap-DH"],
          ["<a href=\"https://github.com/moideci/janus/blob/main/docs/09-preuves-renforcees.md\" target=\"_blank\" rel=\"noopener\">09, preuves renforcées</a>", "fuite exacte de la taille ; IND-CCA du KEM caché, vérifié par CryptoVerif ; preuves sans oracle aléatoire face au quantique, pour les visages à clé", "IND-CCA (KEM), information mutuelle, QROM", "(IND-CCA d'ML-KEM + SHA3 PRF) <b>ou</b> (gap-DH + C2PRI) ; HMAC PRF duale"]
        ] } },
        { h: "04 : le déni" },
        { p: "Le théorème borne l'avantage de l'adversaire par une somme de termes négligeables : mot de passe secret, MLWE ou gap-DH (le plus faible des deux, par destinataire caché), Elligator (statistique), AEAD, HMAC et collisions d'oracle. La borne ne dépend <b>ni</b> du leurre, <b>ni</b> du secret, <b>ni</b> du nombre de destinataires du leurre." },
        { code: "Adv^DENI(𝒜) ≤ q_A / 2^h                                  (mot de passe secret, s'il y en a un)\n            + n₂ · ( min( Adv^MLWE + ε_K , Adv^gapDH ) + ε_E )\n            + n₂ · Adv^IND$_AEAD + Adv^PRF_HMAC + Adv^IND$_AEAD\n            + (n₂ + 2) · q_H / 2²⁵⁶" },
        { note: "Avec un secret protégé par des <b>clés</b>, tous les termes sont négligeables. Avec un <b>mot de passe</b> secret, le terme <code>q_A / 2^h</code> domine : le déni ne vaut que ce que vaut le mot de passe caché (60 bits d'entropie et 2³⁰ essais Argon2id laissent un avantage de 2⁻³⁰)." },
        { p: "Depuis QB-3 (4 étiquettes), la preuve 04 couvre jusqu'à <b>3 visages cachés</b> : les étapes G₁ à G₇ s'appliquent à chaque visage caché tour à tour, et la borne est multipliée par k ≤ 3. Les places des étiquettes sont une permutation aléatoire des 4 positions, et le placement des visages ne dépend que des longueurs des secrets, jamais de leur contenu." },
        { h: "Ce que les preuves ont révélé, et ce qui a été corrigé" },
        { cards: [
          { t: "04 : scalaire éphémère clampé", p: "Le code tirait l'éphémère X25519 clampé : le point ne couvrait que la moitié du sous-groupe premier. Un adversaire quantique pouvait le tester (avantage 0,105 par fichier pour un destinataire caché, environ 0,80 sur 100 fichiers) ; classiquement, environ 2¹²⁶ opérations. <b>Corrigé le 18 novembre 2026</b> : scalaire uniforme modulo ℓ et inverse d'Elligator 2 maison." },
          { t: "04 : déni reposant sur MLWE seul", p: "La confidentialité était hybride, mais la discrétion de κ reposait sur MLWE seul. <b>Corrigé</b> : κ est masqué par un flux dérivé de X25519, la discrétion et le déni tiennent si MLWE <b>ou</b> X25519 tient." },
          { t: "05 : la cohérence n'est plus globale", p: "Un auteur malveillant peut fabriquer un même fichier qu'Alice ouvre sur un contenu et Bob sur un autre (bornés à quatre, un par étiquette). Impossible à empêcher sans détruire le déni. <b>Documenté</b> (piège 10.8, P4 par visage)." },
          { t: "05 : effacement silencieux", p: "Un tiers peut effacer le visage caché en écrasant la réserve sans que le leurre s'en aperçoive. Inhérent au déni. <b>Documenté</b> (piège 10.9) : garder une copie." },
          { t: "05 : deux défauts d'implémentation", p: "Dédoublonnage sur K seul au lieu du triplet (K, début, longueur), et temps d'ouverture dépendant du nombre d'emplacements déballés (|t| = 2,85 avant correctif). <b>Corrigés le 18 novembre 2026</b> (|t| = 0,89 et 1,50 après)." },
          { t: "06 : IND-RCCA, pas IND-CCA", p: "Avec plusieurs visages, une copie modifiée hors du visage défi donne le même clair : IND-CCA strict est impossible, IND-RCCA est la bonne notion. Le masquage de κ est compatible avec la preuve parce que sa clé ne dépend que de <code>ct_X</code>." },
          { t: "06 : sortie en flux", p: "Condition d'usage : jeter toute la sortie d'une ouverture ratée. La ligne de commande et <code>dechiffrer</code> le font ; <code>dechiffrer_flux</code> exige que l'appelant le fasse." },
          { t: "06 : QI-1 tranché, pas d'étiquette sur tout le corps", p: "Faire couvrir tout le corps par chaque étiquette rendrait l'effacement visible, mais diviserait environ par deux le débit sur un cœur, empêcherait de chiffrer dans un tube sans tout garder en mémoire et changerait le format. Décision du gel (19 novembre 2026) : non, pas en v1. La confidentialité active reste IND-RCCA dans tous les cas, et la parade à l'effacement silencieux reste une copie de sauvegarde (piège 10.9)." }
        ] },
        { h: "Avantage de l'adversaire quantique avant le correctif (04, § 7.1)" },
        { table: { head: ["Destinataires cachés", "Avantage sur un fichier"], rows: [["1", "0,105"], ["2", "0,209"], ["4", "0,422"], ["8", "0,787"]] } },
        { h: "09 : le KEM caché est IND-CCA, vérifié par machine (Q2)" },
        { p: "Le « KEM caché » est la partie d'un emplacement à clé qui produit le secret partagé : X-Wing avec l'éphémère X25519 sale, le chiffré ML-KEM encodé par Kemeleon et masqué, le point transmis par son représentant Elligator. <b>À chiffrés décodés, il est IND-CCA</b> ; deux chemins indépendants le prouvent, un seul suffit :" },
        { code: "Adv^IND-CCA ≤ min( 2·Adv^PRF_SHA3 + 6·N_d·P_ctxtcoll + 2·Adv^IND-CCA2_ML-KEM ,                  chemin ML-KEM\n                   2·Adv^gapDH(q_H) + 4·2⁻¹²⁶ + O((q_H + N_d)·2⁻²⁵²) + 2·q_H·N_d·2⁻¹²²⁸⁸ )   chemin X25519, avec C2PRI" },
        { cards: [
          { t: "Chemin ML-KEM, sans oracle aléatoire", p: "Hypothèses : ML-KEM-768 IND-CCA2 et SHA3-256 pseudo-aléatoire de clé <code>ss_M</code>, comme dans l'analyse d'X-Wing. Il tient <b>même si X25519 est entièrement cassé</b> : l'adversaire du modèle reçoit la clé secrète X25519." },
          { t: "Chemin X25519, sous gap-DH et C2PRI", p: "Hypothèses : gap-DH sur Curve25519, SHA3 et SHAKE en oracles aléatoires, et C2PRI d'ML-KEM. Il tient même si le secret d'ML-KEM est compromis." },
          { t: "Une hypothèse oubliée, C2PRI", p: "La première version du modèle X25519 supposait ML-KEM entièrement cassé : CryptoVerif a refusé de conclure. Le combineur d'X-Wing ne hache pas <code>ct_M</code> ; sans résistance à la seconde préimage de chiffré (<b>C2PRI</b>), un second chiffré donnant le même <code>ss_M</code> permettrait de garder <code>ct_X</code>, de changer κ' et d'obtenir la même clé. C2PRI tient pour ML-KEM (transformée de Fujisaki-Okamoto à rejet implicite), sans dépendre de MLWE ; IND-RCCA (document 06) n'est pas touché." },
          { t: "Le lemme du cofacteur", p: "CryptoVerif raisonne dans un groupe d'ordre premier ; Curve25519 a un cofacteur 8 et le point de Janus est « sale ». Le lemme : le scalaire clampé étant multiple de 8, <code>X25519(sk, u(P)) = u(s · π(P))</code>, où <code>π</code> projette sur le sous-groupe premier. Le défi se ramène à un Diffie-Hellman ordinaire ; Elligator ne produit jamais de point de la tordue." }
        ] },
        { table: { head: ["Modèle CryptoVerif 2.13", "Hypothèses", "L'adversaire reçoit en plus", "Résultat"], rows: [
          ["<code>kem_cache_mlkem.ocv</code>", "ML-KEM IND-CCA2, SHA3 PRF de clé <code>ss_M</code> ; <b>aucun oracle aléatoire</b>", "la clé secrète X25519", "<b>Prouvé</b> automatiquement"],
          ["<code>kem_cache_gdh.ocv</code>", "gap-DH, SHA3 et SHAKE oracles aléatoires, C2PRI d'ML-KEM", "un ML-KEM dont il sait décapsuler", "<b>Prouvé</b> automatiquement"]
        ] } },
        { p: "Chaque modèle se vérifie en quelques secondes (<code>preuves/cryptoverif/</code>, avec opam sous Linux ou WSL ; résultat « All queries proved. »). Le masquage de κ et le combineur d'X-Wing y sont modélisés tels qu'ils sont ; Elligator et Kemeleon sont remplacés par l'identité (ce sont des encodages, leur malléabilité bénigne relève d'IND-RCCA)." },
        { h: "09 : face à un ordinateur quantique (QROM)" },
        { cards: [
          { t: "Visages à clé : plus d'oracle aléatoire", p: "Face au quantique, le chemin X25519 ne sert à rien ; il reste le chemin ML-KEM. Chaque usage de l'oracle aléatoire y est remplacé par une hypothèse du modèle standard (SHA3-256 et HMAC-SHA-256 pseudo-aléatoires, IND-CCA d'ML-KEM, MLWE). Les théorèmes 04, 05 et 06 valent alors <b>sans oracle aléatoire</b> : les réductions sont des simulations directes, valables face à un adversaire quantique." },
          { t: "Mots de passe : environ h/2 bits", p: "Argon2id est le seul endroit où l'oracle aléatoire est indispensable. Dans le QROM, l'avantage passe de <code>q_A / 2^h</code> à <code>2·(q_A + 1)·2^(−h/2)</code> : un mot de passe de <code>h</code> bits n'en vaut plus qu'environ <code>h/2</code> (Grover). Chaque requête exige d'évaluer Argon2id en superposition, ce qui dépasse tout matériel envisageable, mais la prudence demeure." },
          { t: "Le conseil", p: "Pour un secret important, <b>préférer une clé</b> à un mot de passe, ou une <b>phrase de passe d'au moins 8 mots</b> tirés au hasard (environ 100 bits d'entropie)." }
        ] },
        { h: "09 : la fuite exacte de la taille (Q4)" },
        { p: "Le calcul est exact, sans échantillonnage : information mutuelle <code>I(L ; F)</code> et fuite maximale (Issa, Wagner, Kamath) pour <code>L</code> uniforme. <b>Proposition :</b> avec le seau, <code>I(L ; F) = I(L ; PADMÉ(Ref(L)))</code> et la fuite maximale est celle de PADMÉ seul. Preuve : les seaux pavent les entiers, donc <code>L → X → F</code> est une chaîne de Markov où <code>X</code> est une fonction de <code>F</code>. Coût : environ 2,2 % de taille en plus au lieu de 0,6 %, et 6,25 % au pire au lieu de 3,12 %." },
        { h: "Bilan des preuves (document 09, § 5)" },
        { table: { head: ["Propriété", "Notion", "Hypothèses (classique)", "Face au quantique", "Vérifié par machine"], rows: [
          ["Confidentialité passive, discrétion, déni", "IND$, DENI (04)", "MLWE <b>ou</b> gap-DH ; Elligator statistique", "modèle standard (chemin ML-KEM) ; mot de passe : h/2 bits", "non"],
          ["KEM caché", "IND-CCA (09)", "(IND-CCA ML-KEM + PRF SHA3) <b>ou</b> (gap-DH + C2PRI)", "modèle standard", "<b>oui, les deux chemins</b>"],
          ["Engagement, intégrité par visage", "collisions, INT-CTXT (05)", "SHA-256, HMAC, ChaCha20-Poly1305", "modèle standard ; collisions en 2⁸⁵ génériques", "non"],
          ["Confidentialité face aux fichiers piégés", "IND-RCCA (06)", "celles ci-dessus", "modèle standard (chemin ML-KEM)", "non (sauf le KEM)"],
          ["Taille du fichier", "fuite = celle de PADMÉ (09)", "aucune (information-théorique)", "idem", "calcul exact"]
        ] } },
        { h: "Ce que les preuves ne couvrent pas" },
        { ul: [
          "<b>Relecture par un cryptographe</b> : indispensable avant toute publication ; non faite. Aucune preuve n'a été relue.",
          "<b>Modèles CryptoVerif du fichier entier</b> : l'en-tête complet, les 4 étiquettes, la réserve et STREAM (déni, confidentialité active) ; seul le KEM caché est vérifié par machine. L'intégrité repose surtout sur des collisions de hachage.",
          "<b>Mots de passe face au quantique</b> : ils ne valent qu'environ la moitié de leurs bits d'entropie.",
          "(Q2, Q4, QROM et la vérification par machine du KEM ne sont plus ouverts : voir le document 09.)",
          "<b>Plusieurs versions du même fichier</b> et <b>traces du système</b> : hors du modèle (pièges 10.1 et 10.6).",
          "<b>Canaux auxiliaires</b> autres que le temps d'ouverture du leurre : ce dernier est mesuré par dudect, pas prouvé.",
          "<b>L'authentification de l'expéditeur</b>, et le retour en arrière complet d'un fichier."
        ] }
      ] },

    { id: "durcissement", cap: "Implémentation et chaîne d'approvisionnement", title: "Durcissement",
      intro: "Les preuves disent ce que le <b>format</b> garantit. Le document 08 décrit ce qui protège l'<b>implémentation</b> : contre ses propres bogues, contre ce que la machine laisse traîner, et contre une chaîne d'approvisionnement compromise. Aucune de ces mesures ne remplace un audit externe.",
      blocks: [
        { h: "Le code" },
        { ul: [
          "<code>#![deny(unsafe_code)]</code> : aucun code <code>unsafe</code>, sauf un module d'environ 150 lignes (<code>memoire.rs</code>) qui appelle le système, chaque bloc y étant justifié par un commentaire <code>SAFETY</code>.",
          "Clippy sans aucun avertissement à chaque poussée ; temps constant vérifié par dudect (Kemeleon, Elligator, Bech32m, ouverture)."
        ] },
        { h: "La mémoire" },
        { table: { head: ["Risque", "Parade"], rows: [
          ["Un secret part dans le <b>fichier d'échange</b> et reste sur le disque", "Identité (graine, clés ML-KEM et X25519) et mots de passe <b>verrouillés en mémoire vive</b> (<code>mlock</code> sous Linux et macOS, <code>VirtualLock</code> sous Windows). Le clair d'une ouverture en mémoire est verrouillé si le système l'accepte (limites basses, souvent 8 Mio sous Linux) ; pour les gros fichiers, la vraie parade est un fichier d'échange chiffré"],
          ["Un plantage écrit un <b>fichier core</b>", "<code>RLIMIT_CORE = 0</code> sous Linux et macOS ; Windows n'écrit pas de fichier core"],
          ["Un autre programme du même utilisateur <b>lit la mémoire</b> (ptrace)", "Sous Linux, le processus se déclare non « dumpable » : <b>ptrace est bloqué</b>"],
          ["Des <b>copies oubliées</b> du clair", "Tous les secrets sont effacés à la destruction. <b>Défaut corrigé :</b> en lisant l'entrée standard, ou en ouvrant en mémoire, le tampon grandissait par réallocations et chaque ancienne copie du clair était libérée <b>sans être effacée</b> ; le tampon est désormais alloué une fois, ou agrandi en effaçant l'ancien"]
        ] } },
        { note: "Ces parades sont « au mieux » : si le système refuse, Janus fonctionne quand même, avec une défense de moins. Le compilateur peut laisser des copies sur la pile, et la bibliothèque Argon2id alloue ses 64 Mio sans les verrouiller.", cls: "warn" },
        { h: "Le fuzzing guidé par la couverture" },
        { p: "À côté des mutations en Rust stable (2 000 par <code>cargo test</code>, 80 000 lors des campagnes longues), <code>cargo-fuzz</code> (libFuzzer et AddressSanitizer) observe les branches atteintes et garde les entrées qui en découvrent de nouvelles. <b>Six cibles</b>, fuzzées <b>chaque nuit en intégration continue</b> (10 minutes chacune, le corpus de la veille repris) ; un plantage fait échouer la tâche, avec l'entrée fautive jointe." },
        { table: { head: ["Cible", "Propriété vérifiée"], rows: [
          ["<code>ouvrir_cle</code>", "jamais de panique ; un succès ne rend jamais plus d'octets que le fichier"],
          ["<code>muter</code>", "l'ouverture échoue, ou rend <b>exactement</b> le leurre d'origine"],
          ["<code>cles_texte</code>", "tout texte accepté se réencode à l'identique"],
          ["<code>kemeleon</code>", "toute chaîne se décode ; tout chiffré fait l'aller-retour"],
          ["<code>elligator</code>", "le représentant redonne exactement le point"],
          ["<code>inspect</code>", "l'analyseur le plus exposé ne panique jamais"]
        ] } },
        { p: "Première campagne (20 novembre 2026, AddressSanitizer) : des millions d'essais au total (3,4 millions pour <code>cles_texte</code> à elle seule), <b>aucun plantage</b>. Sous <code>cargo-fuzz</code> seulement, Argon2id prend des paramètres minuscules ; le programme et les tests ordinaires n'en sont pas affectés." },
        { h: "La chaîne d'approvisionnement" },
        { cards: [
          { t: "cargo-deny", p: "À chaque poussée : aucune dépendance avec une faille connue (base RustSec), retirée ou abandonnée ; licences compatibles avec la MIT ; crates.io uniquement. <code>Cargo.lock</code> et <code>--locked</code> figent les versions exactes." },
          { t: "Builds reproductibles", p: "rustc est épinglé (<code>rust-toolchain.toml</code>), les dépendances aussi, les chemins de compilation sont neutralisés. Le <b>binaire Linux est identique octet pour octet</b> sur toute machine : la CI le recompile deux fois dans deux dossiers à chaque poussée. Chacun peut recompiler une release et comparer l'empreinte, sans faire confiance à GitHub. Windows et macOS ne sont pas garantis reproductibles." },
          { t: "Releases signées par Sigstore", p: "Chaque fichier d'une release (archives et <code>SHA256SUMS.txt</code>) porte une <b>attestation de provenance Sigstore</b>, produite par GitHub Actions sans clé à gérer : elle prouve qu'il vient du workflow <code>release.yml</code> de ce dépôt, depuis cette étiquette. La v0.1.0-alpha n'en a pas." },
          { t: "Aucune dépendance dans les clients", p: "Les quatre clients n'utilisent que leur plateforme (et <code>cryptography</code> pour Python)." }
        ] },
        { code: "gh attestation verify janus-v0.2.0-alpha-x86_64-unknown-linux-gnu.tar.gz --repo moideci/janus\nsha256sum -c SHA256SUMS.txt --ignore-missing" },
        { h: "Ce qui reste" },
        { ul: [
          "Un <b>audit externe</b> du code.",
          "Le fuzzing de l'ouverture à mot de passe <b>avec les vrais paramètres</b> d'Argon2id n'est fait que par mutations, pas par couverture.",
          "La <b>vérification formelle</b> du code (hax et F*, ou libcrux à la place de ML-KEM), qui irait au-delà des tests."
        ] }
      ] },

    { id: "verifie", cap: "Tests et mesures", title: "Ce qui est vérifié",
      intro: "70 tests Rust (<code>cargo test --release</code>) ; côté clients, 31 tests en Python, 18 en TypeScript, 150 en C# et 218 en Java ; des vecteurs de test, dudect, des tests statistiques et du fuzzing ; l'intégration continue est au vert sous Linux, Windows et macOS. Détails dans <code>janus-rs/README.md</code>. Les lignes « aucune fuite détectée » signifient « rien de détecté avec ce nombre de mesures », pas « preuve d'absence ».",
      blocks: [
        { cards: [
          { t: "Conformité", p: "Le vecteur de test officiel n° 1 d'X-Wing (draft-11) est reproduit. Kemeleon : intervalles d'antécédents exacts, tailles du draft, décodage identique à une implémentation de référence. Division par q vérifiée exhaustivement jusqu'à 2²², puis sur un million de tirages jusqu'à 2⁴⁴." },
          { t: "Discrétion", p: "Éphémère X25519 uniforme même face à un adversaire capable de calculer des logarithmes discrets : l'ancien tirage clampé tombait dans la moitié testée 2 000 fois sur 2 000, le nouveau environ une fois sur deux. χ² des κ masqués : 261 pour environ 255 attendus ; chiffrés ML-KEM bruts détectés (χ² = 3129 pour environ 1023). Fichiers Janus : χ² ≈ 265." },
          { t: "Deux visages", p: "Chaque identifiant ouvre son visage et seulement le sien, dans toutes les combinaisons. Vue de l'adversaire contraint, en mélangeant des fichiers à 1 et à 3 visages cachés : χ² = 249,6, p = 0,58. Avant QB-3, avec un secret fait de zéros (pire cas) sur 7,5 millions d'octets : χ² = 265,8, p = 0,31 ; le test détecte un écart de 2 %. Capacité de la réserve exacte à l'octet." },
          { t: "Robustesse : corpus piégé", p: "Bits inversés, troncatures (y compris entre deux lots), ajouts, blocs échangés ou dupliqués, début ou longueur falsifiés, emplacement greffé, fichier aléatoire : tous refusés par l'unique message « impossible de déchiffrer »." },
          { t: "Robustesse : fuzzing", p: "<b>50 000 mutations</b> de 10 types avant QB-3 (relancées le 19 novembre 2026 après les correctifs, 8 min 14 s), puis <b>30 000</b> après, dont un fichier à quatre visages (80 000 au total), et des millions d'essais guidés par la couverture. Aucune panique, jamais un autre clair que l'original. Sur la série de 50 000, 11 339 mutations acceptées, toutes limitées à la réserve ou à l'étiquette de l'autre visage, vérifié octet par octet." },
          { t: "Vecteurs de test", p: "8 fichiers <code>.janus</code> de référence (dont un à deux visages et un à quatre visages, <code>quatre-visages.janus</code>, publiés avec leurs mots de passe) et un manifeste, régénérés avec QB-3. Le chiffrement, avec un aléa déterministe, les reproduit octet pour octet : tout changement involontaire du format fait échouer les tests. Un fichier de 2 Gio abîmé au milieu est refusé sans laisser de trace." }
        ] },
        { cards: [
          { t: "Interopérabilité", p: "Les cinq implémentations (Rust, Python, TypeScript, C#, Java) s'ouvrent mutuellement leurs fichiers : 75 combinaisons sur 75, vérifiées en intégration continue. Chaque client ouvre aussi tous les vecteurs de référence et reproduit les clés depuis les graines." },
          { t: "Fuzzing guidé par la couverture", p: "Six cibles cargo-fuzz, chaque nuit en CI, aucun plantage ; première campagne avec AddressSanitizer le 20 novembre 2026 (voir « Durcissement »)." },
          { t: "Preuves vérifiées par machine", p: "Le KEM caché est IND-CCA, vérifié par CryptoVerif par ses deux chemins (« All queries proved. »). Le calcul de la fuite de la taille est exact (<code>examples/fuite_bourrage.rs</code>)." }
        ] },
        { h: "Temps constant (dudect, seuil |t| = 4,5)" },
        { table: { head: ["Fonction mesurée", "Temps médian", "|t| max", "Verdict"], rows: [
          ["<b>Témoin</b> : décodage num-bigint (20 000 mesures)", "167 µs", "<b>13 274</b>", "fuite détectée"],
          ["Kemeleon.DecodeCtxt (20 000)", "227 µs", "0,92", "aucune fuite détectée"],
          ["Kemeleon.EncodeCtxt (20 000)", "31 µs", "0,97", "aucune fuite détectée"],
          ["Ouverture d'un emplacement, valide ou aléatoire (20 000)", "359 µs", "2,17", "aucune fuite détectée"],
          ["Ouverture du leurre, fichier sans ou avec visage caché (1 000)", "8,1 ms", "1,34", "aucune fuite détectée"],
          ["Inverse d'Elligator 2 maison, deux passages (10 000)", "26 µs", "1,13", "aucune fuite détectée"],
          ["Ouverture ratée (2 000) ; avant le correctif de 05, |t| = 2,85", "12 ms", "1,50", "aucune fuite détectée"]
        ] } },
        { note: "<b>Le témoin prouve que la mesure sait repérer une fuite.</b> Leçon de méthode : dans une première version du banc, préparer chaque entrée juste avant sa mesure perturbait les caches et a produit deux fausses alertes, dont une sur Kemeleon (|t| = 27,8) dont le code n'avait pas changé. Toutes les entrées sont maintenant préparées avant les mesures." }
      ] },

    { id: "perfs", cap: "Mesures", title: "Performances",
      intro: "Windows 11, 16 cœurs logiques. Mesures du 18 novembre 2026, avant le bourrage en seau (environ 1,6 point de taille en plus en moyenne).",
      blocks: [
        { note: "<b>Réserve sur les mesures.</b> Ne pas comparer deux jours : le 18 novembre au soir, Argon2id seul prenait 117 ms contre 83 ms le matin, à code identique. La machine était environ 40 % plus lente lors des mesures v1. Une seule machine, pas de comparaison avec age (non installé).", cls: "warn" },
        { h: "Opérations sur l'en-tête (v1, soir)" },
        { table: { head: ["Opération", "Durée"], rows: [
          ["Encapsulation cachée, par destinataire (éphémère uniforme compris)", "0,32 ms"],
          ["Ouverture par clé (16 emplacements, Kemeleon en temps constant, 16 étiquettes toujours calculées)", "8,8 ms"],
          ["Ouverture par mot de passe (un Argon2id, puis 16 essais d'AEAD)", "125 à 140 ms, dont 117 ms d'Argon2id"],
          ["Chiffrement pour 16 destinataires", "6,0 ms"]
        ] } },
        { h: "De bout en bout, disque compris" },
        { table: { head: ["Opération", "Durée", "Pic mémoire"], rows: [
          ["v1, chiffrer 2 Gio pour une clé", "2,3 s", "42 Mio"],
          ["v1, déchiffrer ces 2 Gio", "2,2 s", "42 Mio"],
          ["v1, chiffrer 2 Gio de leurre et un secret, par mots de passe", "2,6 s", "72 Mio, dont 64 pour Argon2id"],
          ["v1, ouvrir le secret caché dans ce fichier", "0,7 s", "73 Mio"],
          ["<i>v0, matin : chiffrer 2 Gio</i>", "<i>1,45 s</i>", "<i>26 Mio</i>"],
          ["<i>v0, matin : déchiffrer 2 Gio</i>", "<i>1,62 s</i>", "<i>26 Mio</i>"],
          ["gpg 2.4.9 (AES-256, sans compression), matin : chiffrer 256 Mio", "1,71 s", ""],
          ["gpg 2.4.9, matin : déchiffrer 256 Mio", "1,59 s", ""]
        ] } },
        { p: "La v1 écrit 6 % d'octets en plus (la réserve). Même avec la machine ralentie, Janus traite 2 Gio dans un temps proche de celui que gpg mettait pour 256 Mio." }
      ] },

    { id: "limites", cap: "Honnêteté", title: "Limites connues",
      intro: "Aucune de ces limites n'est présentée comme secondaire : elles conditionnent l'usage.",
      blocks: [
        { cards: [
          { t: "Aucun audit externe", p: "Ni du code, ni du format. Les preuves 04 à 06 sont des preuves papier ; seul le KEM caché est vérifié par machine ; aucune n'a été relue par un cryptographe." },
          { t: "IND-RCCA plutôt qu'IND-CCA", p: "On peut fabriquer une autre version d'un fichier qui donne exactement le même clair, en modifiant la réserve ou l'étiquette d'un autre visage. On ne peut pas en fabriquer une qui donne un clair lié. Inévitable avec plusieurs visages (document 06, § 1)." },
          { t: "Sortie en flux", p: "<code>dechiffrer_flux</code> écrit les lots vérifiés au fur et à mesure : un programme qui l'utilise doit jeter toute la sortie si la fonction échoue. La ligne de commande et <code>dechiffrer</code> le font déjà." },
          { t: "Prix du déni", p: "Un auteur malveillant peut faire lire des contenus différents (quatre au plus) à plusieurs destinataires d'un même fichier (comparer l'empreinte du clair). Un tiers peut effacer le secret en écrasant la réserve : garder une copie." },
          { t: "Lecture du leurre", p: "Ouvrir le secret oblige à lire tout le leurre qui le précède (format en flux, sans saut). Sans conséquence pour la discrétion : l'ouverture du leurre prend le même temps avec ou sans secret." },
          { t: "Mémoire et système", p: "Les secrets sont effacés à la destruction et verrouillés en mémoire vive (au mieux : les limites du système sont souvent basses), sans fichier core, avec ptrace bloqué sous Linux. Mais le compilateur peut laisser des copies sur la pile, Argon2id alloue ses 64 Mio sans les verrouiller, et un fichier d'échange non chiffré garde la main sur le reste (voir « Durcissement »)." },
          { t: "Outillage de test", p: "Le fuzzing guidé par la couverture tourne chaque nuit, mais l'ouverture à mot de passe avec les vrais paramètres d'Argon2id n'est fuzzée que par mutations. La batterie NIST STS n'a pas été passée et la comparaison avec age n'est pas faite. Les mesures de performance n'ont tourné que sur une seule machine Windows ; l'intégration continue exécute les tests sous Linux, Windows et macOS." },
          { t: "Compatibilité non garantie", p: "<b>La v0.2.0-alpha est incompatible avec la v0.1.0-alpha pour les fichiers</b> (QB-3 a changé l'en-tête, de 26 208 à 26 272 octets) ; les identités de l'aperçu restent lisibles, les anciennes clés publiques <code>janus-pub-v0-…</code> ne sont plus acceptées. Le format n'est définitivement gelé qu'en v1.0 : une faille trouvée par une relecture ou un audit pourrait encore le modifier." },
          { t: "Clients non constant-time", p: "Les quatre clients (Python, TypeScript, C#, Java) sont des clients d'interopérabilité : pas de garantie de temps constant, certaines primitives écrites de zéro, aucun audit. Pas pour de vrais secrets." },
          { t: "Mots de passe face au quantique", p: "Face à un ordinateur quantique, un mot de passe ne vaut qu'environ la moitié de ses bits d'entropie (document 09, § 3.3) : pour un secret important, préférer une clé, ou une phrase de passe d'au moins 8 mots." },
          { t: "Fonctions manquantes", p: "Pas de signature, pas de mise à jour d'un visage sans passer par <code>modifier</code> et tous les identifiants." }
        ] }
      ] },

    { id: "release", cap: "Feuille de route", title: "Plan de release",
      intro: "Plan mis à jour le 21 novembre 2026. La <b>pré-release v0.2.0-alpha est publiée</b> (<a href=\"https://github.com/moideci/janus/releases/tag/v0.2.0-alpha\" target=\"_blank\" rel=\"noopener\">page de la release</a>) et remplace la v0.1.0-alpha comme <b>version courante</b>. C'est un <b>aperçu non audité</b>, dont le format v1 est <b>candidat au gel</b> (pas encore définitivement gelé) : une release invite d'autres personnes à garder des fichiers chiffrés avec l'outil, ce qui engage.",
      blocks: [
        { h: "Télécharger et vérifier la v0.2.0-alpha" },
        { p: "Chaque archive contient le programme <code>janus</code>, la licence (MIT), le README, la spécification <code>janus-v1.md</code> et la liste des licences des dépendances." },
        { table: { head: ["Système", "Archive"], rows: [
          ["Linux x86-64", "<code>janus-v0.2.0-alpha-x86_64-unknown-linux-gnu.tar.gz</code>"],
          ["Windows x86-64", "<code>janus-v0.2.0-alpha-x86_64-pc-windows-msvc.zip</code>"],
          ["macOS Apple Silicon", "<code>janus-v0.2.0-alpha-aarch64-apple-darwin.tar.gz</code>"]
        ] } },
        { cards: [
          { t: "Provenance (Sigstore)", p: "Chaque fichier porte une attestation qui prouve qu'il a été produit par l'intégration continue du dépôt, depuis l'étiquette <code>v0.2.0-alpha</code> : <code>gh attestation verify &lt;archive&gt; --repo moideci/janus</code>." },
          { t: "Empreintes", p: "<code>sha256sum -c SHA256SUMS.txt --ignore-missing</code>." },
          { t: "Reproductibilité (Linux)", p: "Le binaire Linux se recompile à l'identique, octet pour octet (document 08, § 5)." },
          { t: "Pas de certificat Apple ou Microsoft", p: "Les binaires ne sont pas signés par ces certificats : macOS et Windows affichent un avertissement au premier lancement." }
        ] },
        { note: "<b>Incompatible avec la v0.1.0-alpha pour les fichiers.</b> Les fichiers chiffrés avec l'aperçu précédent (2 étiquettes) ne s'ouvrent pas. Les <b>identités</b> de l'aperçu restent lisibles (<code>janus publique ancienne.cle</code> donne la nouvelle clé publique), mais les anciennes clés publiques <code>janus-pub-v0-…</code> ne sont plus acceptées.", cls: "warn" },
        { h: "Pourquoi un aperçu et pas une version stable" },
        { cards: [
          { t: "1. Le format est candidat au gel, pas gelé", p: "Il a changé plusieurs fois depuis le 18 novembre (deux visages, éphémère uniforme, masquage de κ, puis QB-3 et ses 4 étiquettes). Depuis le 19 novembre toutes les questions de format sont tranchées (Q7 : clés en Bech32m ; QI-1 : pas d'étiquette sur tout le corps) et plus aucun changement n'est prévu, sauf faille trouvée par une relecture ou un audit. Le gel ne sera <b>définitif qu'en v1.0</b> : un fichier chiffré aujourd'hui pourrait donc encore ne plus s'ouvrir plus tard." },
          { t: "2. Les versions alpha ne sont pas compatibles entre elles", p: "La v0.2.0-alpha apporte QB-3 (en-tête de 26 272 octets, jusqu'à 3 visages cachés) : ses fichiers ne s'ouvrent pas avec la v0.1.0-alpha, et réciproquement." },
          { t: "3. Ni audit ni relecture", p: "Le code n'a eu aucun audit externe et les preuves n'ont été relues par personne (seul le KEM caché est vérifié par machine). Le plan ci-dessous mène à la relecture et à l'audit avant la v1.0.0." }
        ] },
        { note: "Ces limites ne sont pas des faiblesses cryptographiques connues : les preuves et les tests sont en place. Ce qui manque relève de la stabilité du format et de la relecture." },
        { h: "Gel du format v1 (19 novembre 2026)" },
        { p: "Toutes les questions de format sont tranchées. Le format v1 est <b>candidat au gel</b> : aucun changement n'est plus prévu, et il ne bougerait encore que si une relecture ou un audit y trouvait une faille. Il ne sera définitivement gelé qu'en v1.0. Décisions (les numéros renvoient aux documents du dépôt) :" },
        { table: { head: ["Question", "Décision", "Où"], rows: [
          ["QB-1 Réserve", "<code>max(64 Kio, ⌈L₁/16⌉)</code>", "03, § 5"],
          ["QB-2 Option « sans réserve »", "Non", "03, § 14"],
          ["QB-3 Nombre d'étiquettes", "4 : un leurre et jusqu'à 3 visages cachés", "03, § 14"],
          ["QB-4 v1 remplace v0", "Oui", "03, § 14"],
          ["QI-1 Étiquette sur tout le corps", "Non", "06, § 6"],
          ["Q3 Version de Kemeleon", "<code>draft-irtf-cfrg-kemeleon-02</code>, figée par les vecteurs", "02, § 12"],
          ["Q5 Nombre d'emplacements", "16", "02, § 12"],
          ["Q6 Argon2id", "64 Mio, t = 3, p = 4", "02, § 3.2"],
          ["Q7 Encodage des clés", "Bech32m, préfixes <code>janus</code> et <code>JANUS-SECRET-KEY-</code>", "02, § 3.1"],
          ["Q10 Ordre des octets de Kemeleon", "Gros-boutiste", "02, § 12"]
        ] } },
        { note: "<b>Spécification et implémentations indépendantes (20 novembre 2026).</b> Le format est décrit en anglais dans <code>spec/janus-v1.md</code> ; quatre clients écrits à partir de ce seul texte l'ouvrent, et les cinq implémentations s'ouvrent mutuellement leurs fichiers. Leurs retours ont servi à préciser la spécification." },
        { note: "<b>Questions de preuve (21 novembre 2026).</b> Traitées dans le document 09 : Q4 a conduit au bourrage « seau » (le chiffrement seul change) ; Q2 est prouvé et vérifié par CryptoVerif ; le chemin ML-KEM se passe de l'oracle aléatoire. Restent la relecture par un cryptographe et les modèles CryptoVerif du fichier entier.", cls: "ok" },
        { h: "Les étapes" },
        { table: { head: ["Version", "Contenu", "Critère ou effet"], rows: [
          ["<b>v0.1.0-alpha</b><br>« aperçu »", "<b>Publiée le 19 novembre 2026</b> : première pré-release GitHub (binaires Linux, Windows, macOS arm64) ; format à deux étiquettes", "<a href=\"https://github.com/moideci/janus/releases/tag/v0.1.0-alpha\" target=\"_blank\" rel=\"noopener\">publiée</a> ; remplacée par la v0.2.0-alpha"],
          ["<b>v0.2.0-alpha</b><br>version courante", "<b>Publiée le 21 novembre 2026</b> : clés en Bech32m, entrée et sortie standard, <code>janus modifier</code>, 4 étiquettes (jusqu'à 3 visages cachés), format candidat au gel ; spécification en anglais ; quatre clients indépendants ; durcissement ; bourrage « seau » ; preuves renforcées (KEM caché vérifié par CryptoVerif) ; archives signées par Sigstore", "<a href=\"https://github.com/moideci/janus/releases/tag/v0.2.0-alpha\" target=\"_blank\" rel=\"noopener\">publiée</a> ; incompatible avec la v0.1.0-alpha pour les fichiers. Restent de cette étape : la batterie NIST STS et la comparaison avec age"],
          ["<b>v0.9.0-beta</b>", "Vecteurs de test définitifs publiés et signés ; modèles CryptoVerif du fichier entier (preuves 04 à 06, au moins G₁ à G₇) ; relecture par des cryptographes (forum CFRG, auteurs de Kemeleon et d'X-Wing)", "candidat au gel du format (déclaré) ; à confirmer par la relecture"],
          ["<b>v1.0.0</b>", "Audit externe du code et du format ; format gelé (tout changement ultérieur = format v2, nouvelles étiquettes de dérivation) ; un fichier chiffré en v1.0 s'ouvrira avec toutes les versions 1.x", "format gelé, compatibilité garantie"]
        ] } },
        { h: "v0.2.0-alpha : le détail" },
        { table: { head: ["Travail", "État"], rows: [
          ["Encodage texte des clés figé (Q7, Bech32m) ; QB-3 (4 étiquettes) ; QI-1 tranché", "<b>Fait</b>"],
          ["Entrée et sortie standard (<code>-</code>), <code>janus modifier</code>", "<b>Fait</b>"],
          ["Spécification normative en anglais ; quatre clients ; test croisé 75/75 en intégration continue", "<b>Fait</b>"],
          ["Durcissement : mémoire, fuzzing guidé (6 cibles, chaque nuit), cargo-deny, rustc épinglé et binaire Linux reproductible, attestations Sigstore", "<b>Fait</b>"],
          ["Bourrage « seau » (Q4) ; KEM caché vérifié par CryptoVerif (Q2) ; QROM", "<b>Fait</b> (document 09)"],
          ["Batterie NIST STS", "Reste à faire"],
          ["Comparaison avec age : débit, taille des fichiers, ce que révèle <code>janus inspect</code>", "Reste à faire"]
        ] } },
        { p: "La v0.2.0-alpha a été publiée le 21 novembre 2026, avec ses archives Linux, Windows et macOS arm64, le fichier <code>SHA256SUMS.txt</code> et leurs attestations, sur la <a href=\"https://github.com/moideci/janus/releases/tag/v0.2.0-alpha\" target=\"_blank\" rel=\"noopener\">page de la release</a>. Le code, les 70 tests, les preuves, les modèles CryptoVerif, les vecteurs de test, les clients et la documentation sont publics sur <a href=\"https://github.com/moideci/janus\" target=\"_blank\" rel=\"noopener\">github.com/moideci/janus</a> ; chacun peut aussi compiler et essayer Janus avec <code>cargo build --release</code>. Rappel : <b>un aperçu non audité, dont le format v1 est candidat au gel mais pas définitivement gelé</b>." }
      ] }
  ],
  stateNote: "Selon le README, la spécification, les notes de version, les documents 07 à 09 et le plan de release du dépôt (21/11/2026) ; à vérifier dans le dépôt.",
  state: {
    done: ["Prototype Rust (bibliothèque et ligne de commande) du format v1 : un leurre et jusqu'à 3 visages cachés ; 70 tests, vecteurs de test, dudect, χ², fuzzing", "Pré-release v0.2.0-alpha publiée le 21/11/2026 (archives Linux, Windows, macOS arm64 ; SHA256SUMS ; attestations Sigstore ; binaire Linux reproductible)", "Spécification normative en anglais et quatre clients indépendants (Python, TypeScript, C#, Java) : interopérabilité 75/75 en CI",
      "Durcissement : mémoire verrouillée, fuzzing guidé par la couverture chaque nuit, cargo-deny, rustc épinglé", "Format v1 candidat au gel (19/11/2026) ; bourrage « seau » : la taille ne révèle que ce que révèle PADMÉ (21/11/2026)", "Preuves : déni, intégrité, IND-RCCA (papier) ; KEM caché IND-CCA vérifié par CryptoVerif par ses deux chemins ; visages à clé sans oracle aléatoire face au quantique"],
    wip: ["Relecture extérieure et audit (code et format)", "Modèles CryptoVerif du fichier entier (déni, confidentialité active)", "Batterie NIST STS", "Comparaison avec age", "v0.9.0-beta, puis v1.0 (gel définitif du format)"],
    risks: ["Prototype non audité : à ne pas utiliser pour de vrais secrets", "Format candidat au gel, pas définitivement gelé : une faille trouvée par une relecture ou un audit pourrait encore le changer avant la v1.0", "Preuves relues par personne ; seul le KEM caché est vérifié par machine", "IND-RCCA et non IND-CCA ; prix du déni (plusieurs contenus possibles, effacement silencieux de la réserve)", "Mots de passe : environ la moitié de leurs bits face au quantique", "Fichiers de la v0.1.0-alpha illisibles avec la v0.2.0-alpha ; clients non constant-time", "Mesures de performance sur une seule machine Windows"]
  },
  docs: [
    { t: "README du dépôt", f: "README.md", d: "Comparatif, deux visages, contenu du dépôt, documents 01 à 09, vérifications." },
    { t: "README de janus-rs", f: "janus-rs/README.md", d: "Commandes, vérifications, performances, limites." },
    { t: "01 · Cartographie", f: "docs/01-cartographie.md", d: "Menaces, exigences J-01 à J-11, failles connues ailleurs, décisions." },
    { t: "02 · Spécification v0", f: "docs/02-spec-v0.md", d: "Format de base : X-Wing caché, Kemeleon, Elligator 2, STREAM, PADMÉ." },
    { t: "03 · Deux visages", f: "docs/03-deux-visages.md", d: "Format v1 : réserve, quatre étiquettes (un leurre, jusqu'à 3 visages cachés), pièges d'usage." },
    { t: "04 · Preuve de déni", f: "docs/04-preuve-deux-visages.md", d: "Séquence de jeux ; faiblesse quantique révélée puis corrigée." },
    { t: "05 · Preuve d'intégrité", f: "docs/05-preuve-integrite.md", d: "Engagement, cohérence par visage, pas d'oracle de partition." },
    { t: "06 · Confidentialité active", f: "docs/06-preuve-confidentialite-active.md", d: "IND-RCCA, et pourquoi IND-CCA strict est impossible." },
    { t: "07 · Plan de release", f: "docs/07-plan-release.md", d: "v0.1.0-alpha et v0.2.0-alpha publiées ; gel du format v1 (décisions) ; étapes jusqu'à v1.0.0." },
    { t: "08 · Durcissement", f: "docs/08-durcissement.md", d: "Mémoire, fuzzing guidé par la couverture, cargo-deny, builds reproductibles, releases signées." },
    { t: "09 · Preuves renforcées", f: "docs/09-preuves-renforcees.md", d: "Fuite exacte de la taille (seau), IND-CCA du KEM caché vérifié par CryptoVerif, QROM, bilan." },
    { t: "Spécification v1 (anglais)", f: "spec/janus-v1.md", d: "Spécification normative et autonome, jointe aux archives." },
    { t: "Clients (Python, TypeScript, C#, Java)", f: "clients/README.md", d: "Quatre implémentations indépendantes, ligne de commande commune, test croisé." },
    { t: "Modèles CryptoVerif", f: "preuves/cryptoverif/README.md", d: "Les deux modèles du KEM caché et la façon de les relancer." },
    { t: "Notes de la v0.2.0-alpha", f: "docs/notes-de-version/v0.2.0-alpha.md", d: "Nouveautés, vérification des archives, limites connues." }
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
