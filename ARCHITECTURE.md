# Architecture de Nemo

Dernière mise à jour : 15/11/2026. Les détails de chaque brique sont dans le README de son dépôt ; ce document donne la vue d'ensemble.

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

État au 15/11/2026 : côté site, `session.js` et `problem.js` implémentent le contrat (nemo-https, PR « verrou lecteur de problèmes ») ; côté Android, le script de début de page et l'événement sont dans la PR `feature/verrou-page-nemo-lock` de nemo-app (en cours de relecture) ; côté PC, voir la branche de l'agent PC. Ce schéma décrit la cible ; ne pas le lire comme « déployé partout ».

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
