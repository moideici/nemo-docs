# nemo-docs

Point d'entrée de Nemo (révision espacée pour un élève : planning, sessions, blocage pendant les créneaux).
Ce dépôt ne contient **pas de code** : il regroupe la charte graphique et l'architecture, et renvoie vers les dépôts qui font tourner Nemo.

Dernière mise à jour : 11/11/2026

## Les briques

| Brique | Dépôt | Rôle | Branche par défaut | Mise à jour |
|---|---|---|---|---|
| Serveur + site (Cloudflare) | [moidefr/nemo-https](https://github.com/moidefr/nemo-https) | MCP, cours, planning, API, site | `master` | automatique : la CI teste puis déploie à chaque fusion |
| App PC Windows | [moidefr/nemo-pc](https://github.com/moidefr/nemo-pc) | surveillance et blocage, sessions sur le PC, Phiby | `main` | `scripts/install.ps1` (dernier build CI) |
| App Android | [moidefr/nemo-app](https://github.com/moidefr/nemo-app) | app téléphone | `main` | `scripts/update-app.ps1` (dernier APK construit par la CI) |
| Charte + architecture | ce dépôt ([moidefr/nemo-docs](https://github.com/moidefr/nemo-docs)) | identité visuelle, vue d'ensemble | `main` | n/a |
| Serveur local d'origine (historique) | [moidefr/nemo](https://github.com/moidefr/nemo) | ancien serveur MCP en local (stdio), remplacé par nemo-https depuis octobre 2026 | `main` | plus maintenu, candidat à l'archivage |
| Délégation à Codex | [moidefr/agent-hub](https://github.com/moidefr/agent-hub) | outil `ah` : Claude Code délègue des tâches à Codex | `main` | `npm link` |

Comment les briques s'articulent, comment chacune se met à jour et les règles de travail : voir [ARCHITECTURE.md](ARCHITECTURE.md).

## Contenu de ce dépôt

| Fichier | Contenu |
|---|---|
| [charte-nemo.md](charte-nemo.md) | résumé d'implémentation de la charte V1 (principes, couleurs, composants) |
| `charte-nemo.pdf`, `charte-nemo.png` | la charte complète (source du résumé) |
| [charte-commune/](charte-commune/) | « Charte graphique commune » (archive d'origine) et son extrait : `Charte Nemo.dc.html`, `Nemo Showcase.dc.html`, `support.js` |
| [site/](site/README.md) | **site de documentation** : racine `docs.moideici.tech` (synthèse de toutes les docs : statuts, dépôts, parcours) et `/nemo/` (documentation interactive de Nemo : schémas, simulateurs), statique, à publier avec Cloudflare ; aperçu : `node scripts/serve.js` |
| `wrangler.jsonc` | configuration Cloudflare du site (assets statiques de `site/`) |
| [docs/branches-supprimees-2026-10-27.md](docs/branches-supprimees-2026-10-27.md) | branches fusionnées supprimées le 27/10/2026, avec leur dernier commit pour les restaurer |

## Au quotidien

- Où en sont les dépôts ? `git fetch` dans chacun, puis `git status -sb`.
- Quelle version tourne ? Serveur : dernier run « Déploiement » vert de `nemo-https` (`gh run list -R moidefr/nemo-https`). PC : `%LOCALAPPDATA%\Programs\NemoPc\version.txt`. Téléphone : Réglages de l'app.
- Une doc est-elle à jour ? Chaque dépôt a un `docs/README.md` qui donne le statut de ses plans (Réalisé / En cours / Obsolète / Idée).
