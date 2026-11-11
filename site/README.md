# Site de documentation de Nemo

Dernière mise à jour : 11/11/2026

Documentation interactive de Nemo : schémas cliquables, session pas à pas, simulateurs (planning, révision espacée,
jeu), formats d'exercice jouables, outils MCP filtrables, recherche (`Ctrl K`), thème clair/sombre. Elle suit la
[charte V1](../charte-nemo.md) : encre d'abord, un fluo un sens, coins 14 px, trait 2 px, ombre pleine, aucun flou ni dégradé.

Le site est **100 % statique** (HTML, CSS, JavaScript sans dépendance ni étape de build). Seules les polices viennent de
Google Fonts (Bricolage Grotesque, Atkinson Hyperlegible, DM Mono).

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | le contenu : sections, textes, conteneurs des schémas |
| `css/style.css` | charte (variables clair/sombre), composants, mise en page, mobile |
| `js/data.js` | **le contenu des schémas et simulateurs** : briques, nœuds et liens de l'architecture, étapes de la session, états du verrou, formats, outils MCP, onglets d'installation. C'est le fichier à éditer pour corriger un texte. |
| `js/diagrams.js` | dessine les 3 schémas SVG (architecture, séquence, verrou) à partir de `data.js` |
| `js/sims.js` | simulateurs : hero, planning, formats (mini-démos), Leitner, jeu, outils, installation |
| `js/ui.js` | thème, progression, apparitions, compteurs, curseur-bulle, palette `Ctrl K`, easter egg |
| `_headers` | en-têtes de sécurité et cache pour Cloudflare |
| `favicon.svg` | la bulle du logo |

Tous les liens sont **relatifs** : le site marche à la racine d'un domaine comme dans un sous-dossier.

## Aperçu local

```bash
node scripts/serve.js        # depuis la racine de nemo-docs → http://localhost:4322
```

## Garder le contenu exact

Les chiffres et règles affichés viennent des dépôts, pas de l'imagination : barème et niveaux
(`nemo-https/public/static/game/rules.js`), intervalles de Leitner (`nemo-https/src/spacedRepetition.js`),
cycle de session et garde-fous (README de `nemo-pc`, `nemo-app`), pipeline (`ARCHITECTURE.md`).
Quand l'un d'eux change, mettre à jour `js/data.js` (ou `index.html`) **dans le même commit** que le dépôt concerné,
puis la date en haut de ce fichier et dans le pied de page.

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
