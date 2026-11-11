# Site de documentation (racine `docs.moideici.tech` + documentation de Nemo)

Dernière mise à jour : 11/11/2026

Le dossier `site/` est un site **100 % statique** (HTML, CSS, JavaScript sans dépendance ni étape de build) qui contient trois choses :

| Chemin | Contenu |
|---|---|
| `/` (`index.html`) | la **racine de la documentation** : carte orbitale des projets, grille filtrable des neuf projets (Nemo compris), activité récente, détail de Nemo (statuts et 24 documents filtrables) et parcours de lecture ; recherche globale `Ctrl K` |
| `/nemo/` | la **documentation interactive de Nemo**, en 8 pages (voir plus bas) |
| `/agent-hub/`, `/prisme/`, `/multi/`, `/garry/`, `/wikicards/`, `/py2x/`, `/cppt/`, `/outils/` | la **documentation des autres projets**, une page par projet (voir « Pages de projets ») |

Le style est volontairement **neutre et moderne** (surfaces claires, filets fins, un seul accent bleu, ombres douces, police Inter),
avec un **arrière-plan animé** (aurore + réseau de points, `js/bg.js`) qui suit le thème clair/sombre, réagit à la souris et au
défilement, se met en pause hors écran et reste figé si le système demande moins d'animations.
Une exception voulue : les **aperçus de pages d'exercice** de Nemo reprennent la charte V1 à l'identique dans un cadre isolé
(`.nm` dans `css/pages.css`). La charte de référence est [charte-nemo.md](../charte-nemo.md) ; les styles réels viennent de
`nemo-https/src/templates/charte.js`.

Seules les polices viennent de Google Fonts (Inter, JetBrains Mono ; Bricolage Grotesque, Atkinson Hyperlegible et DM Mono pour les
aperçus d'exercice). Les textes sont impersonnels (pas de tutoiement).

## La racine : synthèse de toutes les docs

| Fichier | Rôle |
|---|---|
| `index.html` | la page : en-tête, synthèse en 4 points, projets et dépôts, documents filtrables, statuts, parcours |
| `js/hub-data.js` | **les données** : statuts, dépôts, liste des documents (titre, résumé, statut, fichier, code concerné), synthèse, parcours. Pour ajouter un document ou un projet, compléter ce fichier, rien d'autre. |
| `js/hub.js` | construit la page à partir des données (anneau, cartes, filtres, compteurs) |
| `css/hub.css` | styles propres à la racine |

Les statuts et résumés viennent des index `docs/README.md` de `nemo-https` et `nemo-app` (27/10/2026) et des README de chaque dépôt.
Quand un index de dépôt change, mettre à jour `HUB.docs` et `HUB.updated` dans le même commit. Les chiffres (nombre de documents,
réalisés, en cours) sont **calculés** : aucun nombre n'est écrit à la main.

## `/nemo/` : documentation interactive de Nemo (8 pages)

| Page | Contenu |
|---|---|
| `nemo/index.html` | accueil : aperçu d'exercice qui se joue seul, pipeline animé, tuiles vers les autres pages |
| `nemo/architecture.html` | schéma interactif (serveur, apps, assistant, CI) + les 4 briques |
| `nemo/session.html` | cycle d'une session (diagramme **lu automatiquement** à l'arrivée) + planificateur cliquable |
| `nemo/exercices.html` | 22 formats ; 8 démos jouables (`?f=cloze` ouvre directement un format) |
| `nemo/progression.html` | révision espacée (Leitner) + gamification, deux simulateurs qui tournent seuls |
| `nemo/mcp.html` | outils MCP filtrables (`?q=publish` pré-remplit le filtre), brancher Claude / ChatGPT |
| `nemo/verrou.html` | états du verrou (parcours automatique) et garde-fous |
| `nemo/installer.html` | installation et mises à jour par brique, règles de travail, dépôts |

**Détails au survol** : sur les schémas (architecture, séquence, verrou) et sur les blocs du planificateur, une info-bulle
s'affiche près du pointeur au passage de la souris et le panneau de détail se met à jour ; un clic épingle l'élément (indispensable
au tactile). Code : `NEMO.tip` dans `js/data2.js`.

## Racine : animations et recherche

| Élément | Où | Détail |
|---|---|---|
| Mot qui tourne, compteurs | en-tête | « Documentation de … » change toutes les 2,2 s ; les quatre chiffres comptent à l'apparition |
| Carte orbitale | en-tête (`js/home.js`) | un nœud par projet, couleur = état ; survol ou focus clavier = description ; un trait animé relie deux projets qui s'utilisent (agent-hub ↔ Nemo, Garry ↔ multi, py2x ↔ mindmap_portable) |
| Grille des projets | `#projets` | filtre par état, recherche, halo qui suit la souris, légère inclinaison, apparition en cascade ; le titre d'une tuile devient le titre de la page (transition de vue, navigateurs compatibles) |
| Activité récente | `#activite` | barres qui se remplissent à l'apparition, plus longues pour une activité plus récente |
| Recherche globale | `js/palette.js` | `Ctrl K` ou `/` : projets, pages de Nemo, cartes, commandes, risques et documents ; ↑ ↓ Entrée Échap |
| Pages de projets | `js/proj.js` | barre de progression, bouton « Haut », chiffres clés qui comptent, blocs d'architecture cliquables |

Fichiers : `js/home.js` (racine), `js/palette.js` (toutes les pages de projets et la racine), `css/ux.css` (tout le mouvement, coupé par
`prefers-reduced-motion`). Les relations de la carte orbitale sont dans `LINKS` en tête de `js/home.js` : à tenir à jour avec les projets.

## Pages de projets (hors Nemo)

Une page par projet : **agent-hub** (délégation à Codex), **Prisme** (éditeur d'images, dépôt `photo-editor`), **multi** (mini-jeux multijoueurs),
**Garry** (IA de jeux logiques et Input, dépôt `logic-lab`), **WikiCards**, **py2x** (dossier `ia`, sans dépôt GitHub) et **cppt** (dépôt `C-suit`, branche `cppt`),
plus une page **Petits outils** (mindmap-portable, agent-ia, ecole2recte). Chaque page donne un résumé, des chiffres clés, un schéma d'architecture cliquable,
les commandes utiles (avec bouton Copier), le contenu fonctionnel, l'état (réalisé, en cours, limites et risques) et les documents du dépôt.

| Fichier | Rôle |
|---|---|
| `<projet>/index.html` | squelette de la page (`<body data-project="…">`) ; identique d'un projet à l'autre |
| `js/proj-data.js` | **les données** de tous les projets (`PROJ.list`) : à éditer pour corriger un texte ou ajouter un projet |
| `js/proj.js` | construit la page à partir des données (navigation, schéma, commandes, cartes, état, documents, pager) |
| `css/proj.css` | styles propres à ces pages et aux tuiles de projet |

Pour ajouter un projet : ajouter une entrée à `PROJ.list`, copier le dossier d'une autre page en changeant `data-project` et le `<title>`. La racine affiche
automatiquement une tuile, un nœud ne s'ajoute à la carte orbitale que si son id figure dans `ORDER` de `js/home.js`. Sources : README et plans de chaque dépôt, bilan des projets du 01/11/2026, `git log`. Les statuts sont **à vérifier dans les dépôts** ;
mettre à jour `PROJ.updated` avec le contenu.

## Fichiers partagés

| Fichier | Rôle |
|---|---|
| `css/style.css` | thème (variables clair/sombre), composants, mise en page. Les variables `--sky`, `--green`… sont des teintes douces, `--d-sky`… les teintes franches des points de couleur. |
| `css/pages.css` | en-têtes de sous-pages, animations, tuiles, planificateur, info-bulle, arrière-plan, aperçus d'exercice fidèles (`.nm`) |
| `js/data.js` | **contenu des schémas et simulateurs de Nemo** : briques, nœuds et liens, étapes de la session, états du verrou, formats, outils MCP, installation. C'est le fichier à éditer pour corriger un texte. |
| `js/data2.js` | liste des pages de Nemo, journée type du planificateur, questions de l'aperçu d'accueil, utilitaires (`onVisible`, `whileVisible`, `tip`) |
| `js/diagrams.js` | les 3 schémas SVG : apparition au scroll, lecture automatique, survol |
| `js/sims.js` | aperçu d'exercice (`nmQuiz`), planificateur, démos de formats, Leitner, jeu, outils, installation |
| `js/ui.js` | navigation, pied de page, thème, progression, apparitions, compteurs, palette `Ctrl K` (pages de `/nemo/`) |
| `js/bg.js` | arrière-plan animé (canvas), chargé par toutes les pages |
| `_headers` | en-têtes de sécurité et cache pour Cloudflare |

Pour ajouter une page à Nemo : copier une page de `nemo/`, l'ajouter à `NEMO.pages` dans `js/data2.js`. Tous les liens sont
**relatifs** : le site marche à la racine d'un domaine comme dans un sous-dossier.

## Animations

- **À l'apparition** : en-têtes de page, cascades de cartes et de lignes de tableau (`data-stagger`), schémas qui se construisent.
- **Qui se jouent seules** (uniquement visibles, arrêtées dès que le visiteur interagit) : la session (séquence), l'aperçu d'exercice,
  le pipeline, Leitner, le jeu, les états du verrou, l'anneau des statuts.
- `prefers-reduced-motion` est respecté : tout s'affiche sans animation, sans lecture automatique et avec un fond figé.
- Transitions de page fluides (`@view-transition`) dans les navigateurs qui les gèrent.

## Aperçu local

```bash
node scripts/serve.js        # depuis la racine de nemo-docs → http://localhost:4322 (racine) et /nemo/
```

## Garder le contenu exact

Les chiffres et règles affichés viennent des dépôts, pas de l'imagination : barème et niveaux
(`nemo-https/public/static/game/rules.js`), intervalles de Leitner (`nemo-https/src/spacedRepetition.js`),
cycle de session et garde-fous (README de `nemo-pc`, `nemo-app`), pipeline (`ARCHITECTURE.md`), statuts (index `docs/README.md`).
La journée du planificateur (cours, plages) est un **exemple** ; ses règles (préavis 5 min, rattrapage, heures calmes)
sont celles du README de `nemo-pc`.
Quand l'un d'eux change, mettre à jour `js/data.js` / `js/hub-data.js` **dans le même commit** que le dépôt concerné,
puis les dates (`HUB.siteUpdated` dans `js/hub-data.js`, pied de page de `js/ui.js`, date de ce fichier).

## Publier avec Cloudflare : la racine de `docs.moideici.tech`

La **racine** du site est la synthèse ; Nemo vit sous `/nemo/`. `nemo.moideici.tech` est **déjà le Custom Domain du Worker
`nemo-https`** (le serveur de Nemo) : ne pas y publier ce site à la place, cela casserait les apps.

| Option | Adresse | Mise en place | Remarque |
|---|---|---|---|
| **A. Sous-domaine dédié** (recommandé) | `docs.moideici.tech` (racine) et `docs.moideici.tech/nemo/` | Décommenter la ligne `routes` de `wrangler.jsonc`, puis `npx wrangler deploy` | Indépendant du serveur : une erreur ici ne touche jamais l'API. |
| **B. Chemin du serveur** | `nemo.moideici.tech/docs/` et `/docs/nemo/` | Copier `site/` vers `nemo-https/public/docs/` | Même domaine, mais chaque mise à jour de la doc déclenche le test + déploiement du serveur. |
| **C. Cloudflare Pages** | `nemo-docs.pages.dev`, puis `docs.moideici.tech` | Relier le dépôt, dossier de sortie `site`, pas de commande de build | Déploiement à chaque push, sans CI à écrire. |

Un sous-domaine de second niveau (`docs.nemo.moideici.tech`) n'est pas couvert par le certificat gratuit
de Cloudflare (`*.moideici.tech` seulement) : utiliser `docs.moideici.tech`.

**Publié le 11/11/2026** : option A, `https://docs.moideici.tech/` (synthèse) et `https://docs.moideici.tech/nemo/` (Nemo), Worker `nemo-docs`. Pour mettre à jour : `npx wrangler deploy`. Cloudflare redirige `/page.html` vers `/page` (307), sans conséquence pour les liens relatifs.

Première publication (option A) :

```bash
npx wrangler login          # une seule fois
npx wrangler deploy         # publie site/ ; sans `routes`, l'adresse est nemo-docs.<compte>.workers.dev
```

Un changement de doc seule se commite avec **`[skip ci]`** (règle de tous les dépôts Nemo).
