# Architecture de Nemo

Dernière mise à jour : 16/11/2026. Les détails de chaque brique sont dans le README de son dépôt ; ce document donne la vue d'ensemble.

## Vue d'ensemble

```
                          ┌───────────────────────────────────────────┐
                          │ nemo-https  (Cloudflare Worker, R2, DO)   │
   EcoleDirecte ────────► │  planning · cours · exercices · résultats │
   (emploi du temps)      │  MCP (outils pour les assistants IA)      │
                          │  nemo.moideici.tech                       │
                          └───────▲───────────────▲───────────────────┘
                                  │ API (jeton du profil)
                  ┌───────────────┴───┐       ┌───┴────────────────┐
                  │ nemo-pc (Windows) │       │ nemo-app (Android) │
                  │ verrou, blocage,  │       │ blocage, notifs,   │
                  │ Phiby, sessions   │       │ Ma session, widget │
                  └───────────────────┘       └────────────────────┘
                         ▲  un seul appareil prépare chaque créneau (/api/slot/*)
```

- **Le serveur est la source de vérité**: planning, cours, exercices, résultats, état des créneaux partagés.
- **Les apps sont des clientes**: elles lisent `/api/plan`, réclament le créneau (`/api/slot/claim`), font construire la session par un assistant IA (outils MCP Nemo), jouent l'exercice dans une page web et renvoient le résultat (`/api/exercise/:id/result`).
- **Un seul appareil prépare la session d'un créneau** (PC ou téléphone) ; les autres reprennent son lien. Sans le serveur, chaque appareil retombe sur sa génération locale.

## Les briques

| Brique | Technologies | Où ça tourne |
|---|---|---|
| nemo-https | Node 22, Cloudflare Workers, R2 (`nemo-courses`, `nemo-class-courses`), Durable Objects | `nemo.moideici.tech` |
| nemo-pc | C# / .NET 9, WPF, WebView2 | `%LOCALAPPDATA%\Programs\NemoPc`, démarrage avec Windows |
| nemo-app | Kotlin, Android 9+ | téléphone de l'élève |
| charte + site de documentation (ce dépôt, `nemo-docs`) | Markdown, PDF, HTML/CSS/JS statiques (`site/`) | GitHub `moideici/nemo-docs` ; site à publier avec Cloudflare (voir `site/README.md`) |
| nemo (historique) | Node, serveur MCP local en stdio | plus utilisé: remplacé par nemo-https |

## Contrat de verrou entre les apps et le lecteur de séance

Le **verrou de l'appareil** (empêcher de quitter pendant le créneau) reste la responsabilité de l'**app native** ; la **page** du lecteur de séance (nemo-https) ne fait que l'afficher et protéger ses propres sorties. Aucun pont natif n'est ajouté pour cela.

```
  nemo-app (Android) / nemo-pc (Windows)                 page du lecteur (nemo-https)
  ──────────────────────────────────────                 ────────────────────────────
  verrou de l'appareil (écran de blocage,                public/static/interface/lock.js
  fenêtre plein écran) : source de l'heure de fin        (session.js et problem.js)

  1. avant les scripts de la page :   ───────────────►   window.NEMO_LOCK = { endsAt: <ms epoch> }
     (Android : script de début de document,             (nombre fini > 0 ; sinon ignoré)
      limité à l'origine du serveur ; PC : injection        repli test web : ?lockEnds=<ms epoch>
      WebView2 équivalente)                                la valeur native a priorité sur l'URL

  2. la fin change (pause, libération) :  ─────────────►  document.dispatchEvent(
                                                            new CustomEvent('nemo:lock', { detail:{ endsAt } }))
                                                           endsAt:null = plus de verrou affiché

                                                          la page :
                                                           · compteur = temps RESTANT du créneau (même en pause)
                                                           · bannière « Verrouillé · libéré à HH:MM »
                                                           · bloque liens, bouton de sortie et fermeture (beforeunload)
                                                           · libère dès la séance terminée dans les 30 dernières minutes
                                                          sans contrat valide : temps passé, rien n'est bloqué

  3. fin de série (NemoAndroid.onNemoEvent, localResult) et résultat posté (onResultPosted)  ◄──  la page prévient l'app,
     qui libère le téléphone ; le résultat part vers /api/exercise/:id/result.                      l'app reste maître du verrou.
```

Règles : la page ne décide jamais seule d'ouvrir ou de fermer l'appareil ; l'heure de fin vient toujours de l'app ; le pont `NemoAndroid` ne répond qu'à une page de l'origine du serveur configuré ; la fenêtre « documents » du double écran PC ne protège rien (une seule fenêtre porte le verrou). Le bail partagé entre appareils (`/api/lock/lease`, un seul créneau pour PC et téléphones) est un autre mécanisme, côté serveur : voir le README de nemo-https.

**État du contrat `NEMO_LOCK` (16/11/2026) : fusionné des deux côtés.** Android : `core/PageLock.kt` (nemo-app #31) ; PC : `PageLockContract` (nemo-pc #20) ; site : `public/static/interface/lock.js`, utilisé par `session.js` et `problem.js` (nemo-https #60). Le nom `window.NEMO_LOCK` et l'événement `nemo:lock` sont figés : les renommer casse en silence les deux apps (la page n'affiche plus de verrou).

**Fin de séance confirmée par le serveur (en cours de fusion).** Règle décidée : une séance finie libère l'appareil tout de suite si elle se termine dans les 30 dernières minutes du créneau, sinon 5 minutes après, sinon à l'heure de fin ; et la fin doit être **confirmée par le serveur**, jamais déclarée par la page. Contrat commun : `docs/verrou-fin-confirmee.md` de nemo-https.

| Pièce | Rôle | État |
|---|---|---|
| `GET /api/session/:id/status` (jeton de l'appareil) | `confirmed` seulement si toutes les étapes sont enregistrées par le serveur, avec de vraies réponses et un rythme plausible | nemo-https #76 (ouverte) |
| `NEMO_LOCK.release` (2) et `releaseAt`, événement `exit` | l'app pousse l'heure de sortie ; la page affiche « Fini : sortie dans 4:32 » ou « confirmation du serveur en attente » | site #76 ; apps fusionnées |
| Règle de libération côté app (`ReleaseRule`, horloge monotone, coupure réseau = verrou tenu) | l'app reste maître du verrou | nemo-pc #41 et nemo-app #43 (fusionnés) |

Compatibilité : nouvelles apps avec l'ancien site : la route est absente, la fin n'est jamais « confirmée », le verrou dure jusqu'à l'heure de fin (jamais au-delà). Nouveau site avec d'anciennes apps : comportement d'avant (règle des 30 minutes). Tant que #76 n'est pas fusionnée, les apps sont donc dans le premier cas.

Pause d'urgence et reprise : voir « Pause d'urgence et reprise au temps restant » plus bas.

## Double écran du lecteur de séance (PC)

Décisions de l'élève (15/11/2026, deux moniteurs) : la question est toujours sur l'écran principal de Windows ; avec un 2e écran, il sert toujours ; sur un seul écran, on adapte puis on défile. Détail côté site : `docs/double-ecran.md` de nemo-https ; côté PC : README de nemo-pc, « Double écran et écran unique ».

```
   écran principal                                    2e écran (2e fenêtre, une seule, qui change de rôle)
   ───────────────                                    ────────────────────────────────────────────────────
   page rôle  work : la question seule, en grand      page rôle  aside : temps, progression, zones, brouillon, calculatrice
   (ou  all : tout, si un seul écran / « regrouper »)  ou        docs  : énoncé et documents (tâche complexe)
        │  { step, from:"work" } à chaque étape ─────────►  suit l'étape
        ◄──── { from:"aside" | "docs" } à l'ouverture  (redemande l'étape ou le document affiché)
        └────────── relais PC borné et nettoyé : DualScreen.SanitizeSync (jamais de contenu libre)
```

- **Rôles de page** (`sessionDual.js`, `<body data-dual>`) : `all` (un écran, ou « Tout sur un seul écran »), `work`, `aside`, `docs`. Le rôle vient de l'app (`window.__nemoDualInit`, puis `nemoDual.set` en direct) et prime sur `#pane=…` de l'adresse. Sur un problème, `aside` est traité comme `docs` (jamais une 2e copie complète du problème). Passer `all` ↔ `work` ↔ `docs` se fait sans recharger.
- **2e fenêtre PC** : une seule fenêtre sur le plus grand des autres écrans, qui **change de rôle** sans se fermer (`DocsWindow.SwitchAsync`). Cycle de vie par une machine à états pure (`SideWindowPlanner.Decide` : fermée, ouverture, chargement, prête) ; la page principale ne passe en `work` qu'une fois la 2e fenêtre prête, la couverture reste devant l'écran tant qu'elle charge, 3 essais puis tout est regroupé sur l'écran principal (nouvel essai 10 s plus tard). Écrans branchés/débranchés ou changement d'échelle en pleine séance : recalage (événement regroupé sur 400 ms, renvoyé sur le fil des fenêtres). Le placement réel est journalisé (« calée » ou « DÉCALÉE »).
- **Annonce d'espace de travail** : sur un problème, `problem.js` annonce `problem` puis `interface/main.js` annonce `single` ; l'app (`WorkspaceTracker`) rattache chaque annonce au document qui l'envoie, remet à zéro à `ContentLoading` et garde `problem` acquis pour tout le document.
- **Garde de fenêtre secondaire** (`src/templates/dualGuard.js` de nemo-https) : premier script de chaque page ; dans une fenêtre `aside` ou `docs`, toute requête autre qu'une lecture répond 204 sans partir, `sendBeacon` et les écritures XHR sont neutralisés, `window.__NEMO_SECONDARY` est posé et la synchro en direct ne démarre pas. **Aucune écriture serveur ne vient de la 2e fenêtre** : pas de résultat en double, pas de consommation de Durable Objects doublée. Côté PC, les navigations lancées depuis la copie (liens d'étape, « Quitter ») sont refusées.
- **Relais borné** : seuls `{ step, from }` (et `{ doc, from }` pour le document affiché) circulent ; `DualScreen.SanitizeSync` borne et nettoie chaque message. Sans l'app, essai avec deux onglets `?dual=work` et `?dual=aside|docs` (relais `BroadcastChannel`, `dual.js`).
- **Un seul écran : adapter puis défiler** : le texte se réduit jusqu'à un minimum lisible, puis la carte défile ; aucune règle ne coupe le contenu. Choix de 48 px au moins ; les boutons d'action restent en bas (lecteur de problèmes ; « Teste-moi » et problèmes sur Android, en PR).
- **Le double écran n'existe que pendant un verrou** (pas pour la révision libre) ; la fenêtre « documents » ne porte aucun verrou.

**Contrat entre les deux fenêtres (résumé ; source : `docs/double-ecran.md` de nemo-https, test miroir `DualSyncContractTests` côté PC)** :

| Élément | Valeur |
|---|---|
| Rôle de la page | `window.__nemoDualInit` puis `nemoDual.set(rôle)` ; rôles `all`, `work`, `aside`, `docs` ; `<body data-dual>` |
| Messages entre fenêtres (relais PC) | `{ step, from }` et `{ doc, from }` seulement ; `from` vaut `work`, `aside` ou `docs` ; tout le reste est rejeté par `DualScreen.SanitizeSync` |
| Fenêtre secondaire | `window.__NEMO_SECONDARY` posé par `dualGuard.js` : aucune écriture serveur, pas de synchro en direct, pas de remontée d'erreurs |
| Jauge de sortie et série | relayées du lecteur vers l'app (la fin absolue ; le 2e écran décompte seul) |

Changer un nom de rôle ou un champ des messages d'un seul côté dégrade le double écran sans erreur visible : modifier les trois dépôts ensemble.

## Pause d'urgence et reprise au temps restant (PC)

- **Pause d'urgence** (nemo-pc #21) : pendant un verrou, « Pause 5 min » appelle `/api/emergency/use` (2 par jour, 5 min, repli local si le serveur ne répond pas), comme sur Android. Le créneau ne s'allonge jamais ; une pause dans les 5 dernières minutes s'arrête à l'heure de fin. La 2e fenêtre ne réapparaît pas pendant la pause et revient au bon rôle ensuite. La pastille native de compte à rebours s'efface quand le lecteur affiche son bandeau (événement `pageLock`).
- **Reprise au temps restant** (nemo-pc #28) : le temps déjà fait est noté chaque minute pendant le verrou (`SavedAt` de la session à reprendre) ; « Reprendre » après la fin du créneau ne rend que le reste (au moins 10 min, jamais plus que prévu). Cas qui a motivé le correctif : une séance 13:00-15:00 reprise à 14:57 verrouillait jusqu'à 16:32. Le créneau en cours (`SameSlot`) garde son heure de fin d'origine.

## Remontée des erreurs des pages

`public/static/page-errors.js` (nemo-https #59, fusionné dans #60) capte `error` et `unhandledrejection` des pages du site (lecteur, problèmes, pages espace), les regroupe, les envoie en lot à `POST /api/page-errors` (borné : 3 envois/min, 10 par page, 8 Ko ; 6/min et 120/jour par profil côté serveur), puis une requête Durable Object (table `page_errors`, purge à 14 jours). Consultation : `/admin/erreurs-pages`. Jamais envoyé : texte saisi, contenu d'exercice, requête d'URL, pile complète. La 2e fenêtre du double écran n'envoie rien. Détail : `docs/erreurs-pages.md` de nemo-https.

**Contrat vers les apps (rien à implémenter côté natif, mais à ne pas casser)** : le serveur déduit la plate-forme dans la page, pas côté serveur : « WebView2 PC » si `window.chrome.webview` existe, « WebView Android » si `window.NemoAndroid` existe ou si l'agent utilisateur contient `; wv)`, sinon « Chrome 131 · Android » (navigateur et système). Si une app change son agent utilisateur, retire le pont `NemoAndroid` ou la WebView2, ses erreurs sont rangées sous un autre navigateur sans que rien n'échoue. Le rôle de la page (`all`, `work`) vient de `body[data-dual]` ; la 2e fenêtre (`__NEMO_SECONDARY`) n'envoie rien.

## Chargement des pages et service worker

- **CSS et JS communs en fichiers mis en cache** (nemo-https #61, fusionné dans #60) : `pageShell` ne recopie plus le CSS et le script communs dans chaque HTML ; il cite `/static/build/<nom>.<empreinte>.css|js` (`site.css`, `player.css`, `page.js`, `exercise.js`, `game.js`), calculés par le Worker à partir des gabarits (pas d'étape de build), `immutable` un an, ETag et 304 ; une empreinte périmée reçoit le contenu actuel en `no-store`. HTML : accueil 368 → 102 Ko, étape 197 → 64 Ko, problème 286 → 21 Ko. Restent en ligne : le garde de fenêtre secondaire (premier script), les réglages appliqués avant le premier affichage, `PLAYER_BASE_CSS` et les variables de la page.
- **Service worker « réseau d'abord » pour le lecteur** (nemo-https #57, fusionné dans #60) : jusqu'ici `/static/*` est servi cache d'abord, donc la première page ouverte après un déploiement affiche l'ancien lecteur (constaté le 15/11 : 2e écran sans le document). Avec #57, `/static/interface/*` est réseau d'abord (2,5 s au plus), copie en cache en repli, hors ligne inchangé.

## `publish_session` en `dryRun`

Les assistants peuvent valider un parcours **sans rien publier** : `publish_session` accepte `dryRun` (nemo-https #55, fusionné dans #60) ; le prompt PC s'en sert pour vérifier la durée et la composition avant l'unique publication (nemo-pc #31 et #34, fusionnés). Le même lot raccourcit les descriptions d'outils MCP (86 056 → 64 221 caractères), rend `explanation` obligatoire dans les formes et aligne durées et quotas sur `sessionBudget.js`. Règle côté PC : le créneau garde le **premier** lien publié (`publishSlot`) ; le prompt PC demande donc de compléter la séance avant l'unique `publish_session`, sans republier.

## Procédure de test du verrou sur de vrais écrans (PC)

Pourquoi une tâche planifiée : Claude Desktop est un paquet MSIX ; tout processus lancé depuis ses shells voit une **copie privée** de `%LOCALAPPDATA%\NemoPc` (journal, config, état) et ne s'affiche pas toujours sur le vrai bureau. Une tâche planifiée « interactive » tourne dans la session de l'élève : vrais écrans, vraie configuration. Les binaires (`%LOCALAPPDATA%\Programs\NemoPc`) sont partagés.

1. Arrêter l'app réelle pour libérer l'écran : `schtasks /End /TN NemoPc` (et `schtasks /End /TN NemoPcHostsHelper` si le blocage de sites tourne).
2. Enregistrer une tâche temporaire (Interactive, utilisateur courant, niveau normal) qui lance `NemoPc.exe --dev --test-lock N --test-url <url>` : `--dev` (Échap ×3 déverrouille, sécurité de l'essai), `N` en secondes, `<url>` une page de nemo-https (par exemple un problème d'un parcours, ou une page avec `?lockEnds=<ms epoch>`), sans serveur ni planning. Le mode test transmet l'origine de la page comme adresse du serveur ; sans cela (avant nemo-pc #32, fusionné) la page n'est pas « de confiance » et la 2e fenêtre ne s'ouvre jamais, et il faut alors un build qui contient #32. Depuis nemo-pc #39, ces options de test ne sont acceptées que par un build Debug.
3. La lancer avec `schtasks /Run /TN <nom>`, laisser l'app ouvrir les fenêtres (compter 5 à 10 s avec deux écrans), puis faire les gestes de la checklist.
4. Capturer l'écran par une tâche planifiée interactive (la même, en enchaînant, ou une 2e) : script PowerShell qui se déclare « DPI aware » (`SetProcessDpiAwarenessContext(-4)`), crée un `Bitmap` de la taille de `SystemInformation.VirtualScreen` et appelle `Graphics.CopyFromScreen` ; écrire aussi les `Screen.AllScreens` (nom, rectangle, écran principal) à côté de l'image. Une capture de tous les écrans montre en noir la zone hors écran quand les écrans n'ont pas la même hauteur (essai du 15/11 : 3280 × 1080, 2e écran 1360 × 768 en (1920, 177)) ; pour juger une fenêtre, capturer un seul écran.
5. Lire le journal réel (`%LOCALAPPDATA%\NemoPc\nemo-pc.log`) par une tâche planifiée qui le copie dans un dossier lisible, puis le comparer aux lignes attendues de la checklist `docs/verification-ecran-reel.md` de nemo-pc (`Double écran : Open …`, `Keep — à jour …`, `… — calée`).
6. Supprimer les tâches temporaires (`schtasks /Delete /TN <nom> /F`) et relancer l'app normale : `schtasks /Run /TN NemoPc`. Ne jamais lancer `NemoPc.exe` directement depuis Claude pour l'usage normal, et ne pas réinstaller l'app sans l'accord de l'élève (règle 4 des mises à jour).

Options voisines de `NemoPc.exe` (README de nemo-pc) : `--self-complete MS` (la page poste un résultat « terminé » : teste le déverrouillage de bout en bout) et `--preview home|settings|resume|tray --shot fichier.png` (captures sans verrou).

## État au 16/11/2026

Vérifié avec `gh`. **Fusionné** = sur la branche par défaut ; pour nemo-https, déployé par la CI ; pour PC et Android, build CI disponible (installation à la demande de l'élève). L'état du 15/11 en fin de journée, avec ses liens, est dans [docs/journal-2026-11-15.md](docs/journal-2026-11-15.md).

| Sujet | Fusionné | Encore en PR |
|---|---|---|
| Contrat de verrou `NEMO_LOCK` / `nemo:lock` | PC #20, Android #31, site (dans #60) | |
| Double écran (rôles, 2e fenêtre, garde, un seul état) | site #50, #54, #66 ; PC #23, #26, #29, #32, #33, #35, #36 | |
| Intégration du 15/11 (lecteur, erreurs de pages, CSS/JS en cache, SW réseau d'abord, `dryRun`) | nemo-https #60 | |
| Écran de fin, leçons complètes, formules strictes, correction IA | nemo-https #63, #64, #68, #69, #73 | |
| Lecteur concentré, cohérence entre écrans, perf et quotas | nemo-https #71, #77, #79, #80 ; PC #40, #42 ; Android #41, #42 | |
| Livraison sûre (test de fumée, retour arrière) et sécurité des pages (CSP à nonce, sessions opaques) | nemo-https #72, #75 ; Android #39 ; PC #39 | |
| Fin de séance confirmée par le serveur | PC #41, Android #43 | **nemo-https #76** (sans elle, les apps gardent le verrou jusqu'à l'heure de fin) |
| Données et limites (plafonds IA, suppression complète, migrations, sauvegarde) | | nemo-https #78 |
| Lexique commun, pages espace | | nemo-https #74, #81 |
| Maintenance (dépendances, README, tests du routeur) | | nemo-https #82, #83 |

Rien de ce qui précède n'a été vérifié sur de vrais écrans ni sur un téléphone, sauf indication contraire dans le journal.

## Glossaire

Mots employés dans les trois dépôts et à l'écran. Quand deux mots désignent la même chose, le premier est celui à écrire dans l'interface ; l'autre est un nom de code ou un ancien nom.

| Mot | Ce que c'est | À ne pas confondre avec |
|---|---|---|
| **créneau** (`slot`) | une plage horaire du planning où l'élève doit travailler (début, fin). Il a un identifiant, est « réclamé » par un appareil, et peut être « fait ». | la séance |
| **séance** (`session`) | le contenu travaillé pendant un créneau : une suite d'étapes (leçon, exercices, problèmes) publiée par l'assistant IA. Les noms de code `session`, `parcours` et « Ma session » (Android) désignent la même chose. | le créneau ; la session web (cookie de connexion) |
| **série** | côté jeu, une suite d'exercices réussis ; sur l'accueil, la **série de jours** (« jours d'affilée ») : le nombre de jours de suite où l'élève a travaillé, avec ses jours de repos. Une seule définition pour le site, le PC et Android depuis le 15/11. | le combo |
| **combo** | le nombre de bonnes réponses d'affilée dans une séance. Il se rompt à la première erreur. | la série de jours |
| **jours d'affilée** | la formulation à l'écran de la série de jours. | |
| **verrou** | l'état où l'appareil empêche de quitter la séance jusqu'à l'heure de fin ; c'est l'**app native** qui le tient. Contrat : `window.NEMO_LOCK`, `nemo:lock`. | le bail |
| **bail** (`lease`) | le mécanisme serveur (`/api/lock/lease`) qui rattache plusieurs appareils d'un même profil au même créneau ; un seul verrou pour PC et téléphones. Le bail ne refuse plus personne. | le verrou |
| **sortie d'urgence** | une pause de 5 minutes, 2 par jour et par profil (`/api/emergency/*`), qui ne rallonge jamais le créneau. Affichée « Pause 5 min (n restantes) » sur PC ; Android parle de « libération anticipée » pour la sortie à 30 minutes de la fin. | la libération confirmée (fin de séance) |
| **fin confirmée** | une séance terminée dont le serveur a reçu et validé toutes les étapes ; seule elle libère l'appareil avant l'heure de fin. | un « terminé » déclaré par la page |
| **double écran** | question sur l'écran principal, suivi et documents sur le 2e écran (PC). Rôles : `all`, `work`, `aside`, `docs`. | l'écran unique (adapter puis défiler) |
| **planning non fiable** (`reliable:false`) | le serveur ne sait pas quels jours ont cours : les apps ne verrouillent pas. | |
| **profil** | un élève (ou le profil principal de l'administrateur) avec son jeton ; ses données sont cloisonnées. | le compte EcoleDirecte |
| **notion** | un point du cours suivi pour la révision espacée (« à revoir »). | un exercice |

## Mises à jour : qui construit, qui installe

| Brique | Construit par | Installe | Publié quand |
|---|---|---|---|
| nemo-https | GitHub Actions (`Tests`, puis `Déploiement`) | la CI elle-même (`wrangler deploy`) | à chaque fusion sur `master`, tests verts |
| nemo-pc | GitHub Actions (`Nemo PC`, version `0.1.<n° de build>`) | `scripts/install.ps1` : télécharge le dernier build réussi | à la demande de l'élève |
| nemo-app | GitHub Actions (`Android APK`, version `0.17.<n° de build>`) | `scripts/update-app.ps1` : `adb install -r` du dernier build réussi | à la demande de l'élève |

Règles qui découlent de ce tableau :

1. **Aucun APK ni build PC ne se construit sur une machine** (décision du 12/10/2026): une seule clé de signature, celle du secret de dépôt `NEMO_DEBUG_KEYSTORE_B64`. Sinon une mise à jour ne s'installe plus par-dessus (perte du jeton et des réglages).
2. **Le serveur se déploie en fusionnant**, pas à la main (`npm run deploy` reste possible mais n'est plus le chemin normal).
3. **Un changement de doc seule se pousse avec `[skip ci]`** dans le message de commit : sinon chaque push sur `master` relance les tests et un déploiement, et chaque push sur une app relance un build.
4. **Réinstaller Nemo PC arrête l'app de blocage** (qui tourne en administrateur) : à lancer par l'élève ou avec son accord explicite.

## Branches

| Dépôt | Branche par défaut | Convention |
|---|---|---|
| nemo-https | `master` | une branche par sujet (`feature/…`, `fix/…`), fusion par pull request, branche supprimée après fusion |
| nemo-pc | `main` | idem |
| nemo-app | `main` (renommée le 27/10/2026, ancien nom `moidefr-restore-android-implementation` (ancien pseudo GitHub)) | idem |

Les branches de travail d'outils (`claude/…`, `codex/…`) suivent la même règle: fusion puis suppression. Une branche non fusionnée est soit à fusionner, soit à archiver par un tag avant suppression.

## Documentation

- Chaque dépôt : un `README.md` (usage et exploitation) et un `docs/README.md` (index des plans avec statut: **Réalisé**, **En cours**, **Obsolète**, **Idée**).
- Toute fusion qui change un comportement met à jour le README concerné **et** le statut du plan dans `docs/README.md`.
- nemo-https vérifie par un test que chaque fichier de `docs/` figure dans l'index.
- Les règles de travail des agents IA sont dans le `AGENTS.md` de chaque dépôt.

## Outils de travail

- **agent-hub** (`ah`, dépôt `moideici/agent-hub`) : Claude Code délègue des tâches à Codex dans des worktrees git isolés, puis relit le diff avant de fusionner. Utilisé pour les mises à jour de documentation.
