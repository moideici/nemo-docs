# Charte Nemo V1 — résumé d'implémentation

Source : `charte-nemo.pdf` / `charte-nemo.png` (même dossier ; l'image montre logo, composants, app Android et site — LA regarder avec Read).

## Principes
1. **Encre d'abord** : le texte est toujours à l'encre (noir bleuté en clair, craie en sombre). La couleur se met DERRIÈRE le texte (pastilles, surlignage, fonds), jamais dans les lettres. Texte sur fluo = toujours encre.
2. **Un fluo, un sens** : jaune = XP / niveau / surlignage ; corail = série, bulle, énergie ; vert = juste, connecté ; rose = faux, erreur, à revoir ; bleu = action ; ciel = sélection, focus.
3. **Rond & franc** : coins 14 px, trait 2 px (couleur encre), OMBRE PLEINE décalée de 3 px (3px 3px 0 encre), AUCUN flou, AUCUN dégradé.

## Couleurs (hex calculés depuis oklch)
| Rôle | Clair | Sombre |
|---|---|---|
| fond | Papier #FCFAF4 | Nuit #0E141F |
| cartes | Feuille #FFFFFF | Ardoise #1A2230 |
| texte, traits | Encre #11161F | Craie #F3F2EC |
| actions | Bleu Nemo #1D54C1 | Bleu nuit #7DAAFD |
Fluos (identiques clair et sombre, texte dessus TOUJOURS encre #11161F) : Jaune #F5EA4D, Corail #FF8A6D, Vert #7BE595, Rose #FF99C1, Ciel #BED8FF.
Matières : pastilles pastel des fluos (Maths bleu clair, Français rose/corail, SVT vert, Histoire-Géo jaune, Anglais jaune-orangé, Physique-Chimie turquoise).
Un bouton principal = fond Bleu Nemo, texte blanc (clair) / encre sur Bleu nuit (sombre), trait 2 px encre, ombre pleine 3 px. « Récompense » = fond jaune, texte encre. Secondaire = fond carte, trait encre. Désactivé = trait pointillé, sans ombre, texte atténué.

## Typographie
- **Bricolage Grotesque** 700/800 : titres, logo, chiffres-clés (Titre 1 48/32 ; Titre 2 28/22 ; Question 20/18).
- **Atkinson Hyperlegible** 400/700 : texte, boutons, réponses (16).
- **DM Mono** : chrono, scores, horaires. Légendes : 12 px MAJUSCULES espacées.
(Google Fonts pour le site ; pour Android, télécharger les .ttf dans res/font ou, à défaut, repli sans-serif gras.)

## Logo
« nem » + une bulle ronde corail à la place du « o » (trait encre 2 px). Sur encre : texte craie. Sur bleu : bulle jaune. Mini : 80 px de large (logotype), 16 px (bulle seule = icône, favicon, notifications). Éviter : surligner en corail, logo en couleur, dégradé. Un surlignage jaune sous « nem » est le principal sur papier.

## Composants (voir l'image)
- Choix de réponse : ligne arrondie, pastille lettre A/B/C ; choisi = fond Ciel ; juste = fond Vert + pastille coche ; faux = fond Rose + pastille ✕ + texte barré (lisible sans la couleur).
- Texte à trous : trou = trait pointillé / pastille Ciel pour la réponse.
- Carte flashcard : carte blanche, ombre pleine CORAIL décalée, légende « FLASHCARD · RECTO ».
- Pastilles matière + titre (Maths · Fractions, « QCM · 10 questions », score 9/10 en vert) ; champ (label en caps, trait bleu au focus) ; interrupteur (piste bleue, bouton rond).
- Gamification : niveau = bulle jaune ronde avec le chiffre + barre XP ; série = carte CORAIL « 12 jours » + points ; badges = bulles (la forme du logo) ; fin de session = carte encre « 8/10 » + pastille jaune « +80 XP ».
- Fond : papier avec un très léger quadrillage (grille fine) sur l'accueil/hero.

## App Android (voir « 06 App Android » dans l'image)
Accueil : « Salut <prénom> » + pastille série corail ; carte PROCHAINE SESSION fond Bleu Nemo (texte blanc, bouton « Commencer » jaune) ; carte « N notions à revoir » avec pastilles matière ; carte « PC connecté » pastille verte. Barre du bas : Accueil · Planning · Algo · Réglages, l'onglet actif = pastille jaune encadrée. Lecteur QCM : en-tête pastille matière + « 04/10 · 00:42 » en DM Mono, barre de progression en segments, question en grand, choix, explication en cadre pointillé, bouton bleu « Question suivante ». Fin de session (sombre) : « 8/10 » + bulle corail, pastilles +XP / jours, carte niveau, liste d'erreurs avec puces roses, boutons « Refaire les erreurs » (bleu nuit) et « Retour à Claude » (contour). Planning (sombre) : sélecteur de jours en pastilles, cours en pointillé, révision en bleu clair, « Notions du jour » en jaune, « Libre » en carte.

## Site (voir « 07 Site »)
Barre : logo à gauche, liens (Comment ça marche, Listes à réviser, Rejoindre la classe), bouton « Accéder à mon espace » bleu. Hero : légende caps « RÉVISION SCOLAIRE ASSISTÉE », titre énorme Bricolage avec mots surlignés en jaune, boutons jaune (principal) + blanc contour ; à droite une carte exercice (QCM) avec ombre pleine et pastilles +10 XP / SÉRIE 12 jours inclinées.

## Règles de lisibilité (bug actuel : « noir sur noir »)
Toujours définir texte ET fond ensemble (paire fond/onFond). En sombre : fond Nuit, cartes Ardoise, texte Craie. Jamais de texte clair sur fond clair ni de texte encre sur fond Nuit. Contraste ≥ 4.5:1.
