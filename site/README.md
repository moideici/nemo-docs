# Site de documentation de Nemo

Dernière mise à jour : 11/11/2026

Documentation interactive de Nemo, destinée à un public extérieur, répartie en **8 pages courtes** : schémas cliquables,
session jouée automatiquement, planificateur dont chaque bloc est détaillé au clic, aperçus d'exercices fidèles au vrai
rendu, simulateurs, outils MCP filtrables, recherche (`Ctrl K`), thème clair/sombre automatique.

Le style du site est volontairement **neutre et moderne** (surfaces claires, filets fins, un seul accent bleu, ombres
douces, police Inter) et diffère de la charte « encre et fluo » des apps. Une exception voulue : les **aperçus de pages
d'exercice** (en-tête de l'accueil et démos de la page Exercices) reprennent la charte V1 à l'identique, dans un cadre
isolé (`.nm` dans `css/pages.css`) : fond papier, trait 2 px, ombre pleine, pastille lettre, juste = vert + coche,
faux = rose + croix barrée, explication en cadre pointillé, barre de parcours. Elles suivent donc aussi le mode sombre
(« Nuit »). La charte de référence est [charte-nemo.md](../charte-nemo.md) ; les styles réels viennent de
`nemo-https/src/templates/charte.js`.

Le site est **100 % statique** (HTML, CSS, JavaScript sans dépendance ni étape de build). Seules les polices viennent de
Google Fonts (Inter, JetBrains Mono pour le site ; Bricolage Grotesque, Atkinson Hyperlegible, DM Mono pour les aperçus
d'exercice). Les textes sont impersonnels (pas de tutoiement).

## Pages

| Page | Contenu |
|---|---|
| `index.html` | accueil : aperçu d'exercice qui se joue seul, pipeline animé, tuiles vers les autres pages |
| `architecture.html` | schéma interactif (serveur, apps, assistant, CI) + les 4 briques |
| `session.html` | cycle d'une session (diagramme de séquence **lu automatiquement** à l'arrivée) + planificateur cliquable |
| `exercices.html` | 22 formats ; 8 démos jouables (`?f=cloze` ouvre directement un format) |
| `progression.html` | révision espacée (Leitner) + gamification, deux simulateurs qui tournent seuls |
| `mcp.html` | outils MCP filtrables (`?q=publish` pré-remplit le filtre), brancher Claude / ChatGPT |
| `verrou.html` | états du verrou (parcours automatique) et garde-fous |
| `installer.html` | installation et mises à jour par brique, règles de travail, dépôts |

## Structure

| Fichier | Rôle |
|---|---|
| `*.html` | le contenu de chaque page. La navigation, le pied de page, le bouton « page suivante » et la palette `Ctrl K` sont construits par `js/ui.js` à partir de la liste `NEMO.pages` : pour ajouter une page, créer le HTML (copier une page existante) et l'ajouter à `NEMO.pages` dans `js/data2.js` |
| `css/style.css` | thème (variables clair/sombre), composants, mise en page. Les variables `--sky`, `--green`… sont des teintes douces, `--d-sky`… les teintes franches des points de couleur. |
| `css/pages.css` | en-têtes de sous-pages, animations, tuiles, planificateur, aperçus d'exercice fidèles (`.nm`) |
| `js/data.js` | **contenu des schémas et simulateurs** : briques, nœuds et liens de l'architecture, étapes de la session, états du verrou, formats, outils MCP, onglets d'installation. C'est le fichier à éditer pour corriger un texte. |
| `js/data2.js` | liste des pages, journée type du planificateur, questions de l'aperçu d'accueil, utilitaires d'animation (`onVisible`, `whileVisible`) |
| `js/diagrams.js` | les 3 schémas SVG (architecture, séquence, verrou) : apparition au scroll, lecture automatique |
| `js/sims.js` | aperçu d'exercice (`nmQuiz`), planificateur, démos de formats, Leitner, jeu, outils, installation |
| `js/ui.js` | navigation, pied de page, thème, progression de lecture, apparitions en cascade, compteurs, palette |
| `_headers` | en-têtes de sécurité et cache pour Cloudflare |
| `favicon.svg` | l'icône du site |

Tous les liens sont **relatifs** : le site marche à la racine d'un domaine comme dans un sous-dossier.

## Animations

- **À l'apparition** : en-têtes de page, cascades de cartes et de lignes de tableau (`data-stagger`), schémas qui se construisent.
- **Qui se jouent seules** (uniquement quand elles sont visibles, et arrêtées dès que le visiteur interagit) : la session
  (séquence), l'aperçu d'exercice de l'accueil, le pipeline, Leitner, le jeu, les états du verrou.
- `prefers-reduced-motion` est respecté : tout s'affiche sans animation et sans lecture automatique.
- Transitions de page fluides (`@view-transition`) dans les navigateurs qui les gèrent.

## Aperçu local

```bash
node scripts/serve.js        # depuis la racine de nemo-docs → http://localhost:4322
```

## Garder le contenu exact

Les chiffres et règles affichés viennent des dépôts, pas de l'imagination : barème et niveaux
(`nemo-https/public/static/game/rules.js`), intervalles de Leitner (`nemo-https/src/spacedRepetition.js`),
cycle de session et garde-fous (README de `nemo-pc`, `nemo-app`), pipeline (`ARCHITECTURE.md`).
La journée du planificateur (cours, plages) est un **exemple** ; ses règles (préavis 5 min, rattrapage, heures calmes)
sont celles du README de `nemo-pc`.
Quand l'un d'eux change, mettre à jour `js/data.js` (ou la page concernée) **dans le même commit** que le dépôt concerné,
puis la date en haut de ce fichier et dans le pied de page (`js/ui.js`).

## Publier avec Cloudflare

`nemo.moideici.tech` est **déjà le Custom Domain du Worker `nemo-https`** (le serveur de Nemo : site, API, MCP).
Y publier cette documentation à la place casserait les apps. Trois façons de faire, de la plus simple à la plus couplée :

| Option | Adresse | Mise en place | Remarque |
|---|---|---|---|
| **A. Sous-domaine dédié** (recommandé) | `docs.moideici.tech` | Décommenter la ligne `routes` de `wrangler.jsonc`, puis `npx wrangler deploy` | Indépendant du serveur : une erreur ici ne touche jamais l'API. |
| **B. Chemin du serveur** | `nemo.moideici.tech/docs/` | Copier `site/` vers `nemo-https/public/docs/` | Même domaine, mais chaque mise à jour de la doc déclenche le test + déploiement du serveur. |
| **C. Cloudflare Pages** | `nemo-docs.pages.dev`, puis un domaine perso | Relier le dépôt, dossier de sortie `site`, pas de commande de build | Déploiement à chaque push, sans CI à écrire. |

Un sous-domaine de second niveau (`docs.nemo.moideici.tech`) n'est pas couvert par le certificat gratuit
de Cloudflare (`*.moideici.tech` seulement) : préférer `docs.moideici.tech`, ou `nemo-docs.moideici.tech`.

Première publication (option A) :

```bash
npx wrangler login          # une seule fois
npx wrangler deploy         # publie site/ ; sans `routes`, l'adresse est nemo-docs.<compte>.workers.dev
```

Un changement de doc seule se commite avec **`[skip ci]`** (règle de tous les dépôts Nemo).
