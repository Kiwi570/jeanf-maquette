# Ce qui a changé

Chaque version ajoute sa partie en tête de ce fichier, construite en comparant l'archive précédente et la nouvelle, jamais de mémoire.

## v2 — un mur vivant

Comparaison faite entre l'archive v1 et la v2 : 3 fichiers ajoutés (`assets/js/vivant.js`, `assets/js/socle/voile.js`, `source/gabarits/vivant.mjs`), les pages, le style, les scripts et les textes modifiés, rien de retiré.

**Changer de page**
- Le voile est un mur : au clic, des blocs à joints décalés se montent depuis le bas, le nom de la page d'arrivée s'affiche, puis les blocs tombent et découvrent la nouvelle page. Même chose pour les grands sauts dans une page.

**Le mur réagit à la souris** (ordinateur)
- Une lumière de galerie suit le curseur sur le plâtre, désormais légèrement texturé. Elle passe derrière les œuvres et les textes : rien n'est éclairé ni filtré.
- Les œuvres s'inclinent à peine sous la souris (2 à 3 degrés), comme un cadre qu'on touche, puis reviennent.
- Sur les murs qui défilent (Accueil, Œuvres), chaque cadre a son clou et se balance quand le mur accélère ; un cadre large bouge moins qu'un cadre haut.
- Le curseur dit ce qu'on peut faire : Voir, Le film, Fiche, Lecture, Défiler, Pousser. Sur une œuvre, il devient un simple anneau et son libellé se décale : il ne cache jamais l'œuvre. Sur la loupe de la visionneuse, il s'efface.
- Tous les boutons et les filtres sont magnétiques.

**Textes et bandeaux**
- Un bandeau posé de travers comme un ruban adhésif sur chaque page : les codes de la démarche sur l'Accueil, les titres des pièces sur Œuvres, les films et leurs durées sur Films (en pellicule), les années de l'agenda sur À propos. Il défile plus vite et change de sens avec la lecture. Il a un bouton pause et s'arrête hors écran.
- Les lettres des titres tombent dans leur ligne comme des briques qu'on pose.
- Les petites étiquettes (surtitres, numéros de pans, repères, pied de page) se tapent à la machine en arrivant à l'écran.
- Accueil : quatre chiffres qui comptent (34 pièces, 12 courts-métrages, 6 résidences Laundry, 60 dates).
- Chaque lettre de « JeanF » sur l'Accueil se bouscule au survol. Le pied de page porte le nom en blocs sur toute sa largeur : il se monte à l'arrivée, un bloc touché saute, un bloc cliqué tombe puis revient (au doigt, un toucher en fait tomber quelques-uns).
- Intro : le mur en blocs se replie vers la gauche comme un volet, puis le triptyque d'ouverture s'ouvre aussitôt.
- Agenda : l'année reste en haut pendant qu'on lit ses dates, et le filet de chaque année se trace en arrivant.

**Films**
- Grain de pellicule et lumière de projecteur qui vacille sur le décor (et du grain sur la section films de l'Accueil). Ils restent derrière le contenu : les photogrammes ne sont jamais recouverts. Comme le vitrail de Dérive-Dérêve, ils s'arrêtent après 5 s et repartent quand on fait défiler.
- Au survol d'une bande, la pellicule défile (à la souris seulement).
- Avant chaque lecture, une amorce de projectionniste compte 3, 2, 1 ; une seule à la fois.

**Détails**
- Les résidences de la carte Laundry battent trois fois quand la carte arrive à l'écran.
- Après un filtre, les pièces et les dates gardées arrivent en cascade.
- La visionneuse s'allume et l'œuvre s'avance.
- Le logo, les noms de la section « Avec », les chiffres et les étiquettes réagissent au survol.

**Confort et technique**
- En mode calme, tout s'arrête : pas de lumière, pas de bandeau, pas de grain, pas d'amorce.
- Le plâtre est peint par une couche fixe sous le contenu : quand les blocs du voile tombent, la page est claire dessous, même au milieu d'une page (lien vers le contact).
- Le décor du haut de l'Accueil se charge en priorité : au retour arrière, il arrive avec l'œuvre.
- Numéro de version des fichiers : ?v=2.
- Le parcours d'audit des films attend la fin de l'amorce.

## v1 — la base

**Direction artistique « Le Mur »** : le site est un mur d'exposition fait de *Mauerstücke* (pans de mur), comme le manifeste de l'artiste. Plâtre clair, joints, encre, un seul rouge ; étiquettes de musée en Plex Mono ; titres en Archivo condensé ; minutage de montage (00:00:00:00) dans l'en-tête.

**Pages (FR et EN)**
- **Accueil** : intro de moins de 3 s (les pans tombent et forment « JeanF »), œuvre d'ouverture *Cantico* dont les volets s'ouvrent, manifeste Mauerstücke en entier avec les dix codes de la démarche, mur épinglé des huit œuvres phares, carte des six résidences Laundry (Minsk 2020 marquée avortée), films, Gare aux Rumeurs (livret en PDF), repères, contact.
- **Œuvres** : 32 œuvres en cinq pans (Retables, Pépinière, Road Map, RDM, Dérive-Dérêve), filtres par série gardés dans l'adresse, liste complète, visionneuse (loupe, glissement, lien direct par œuvre), « voir au mur » à l'échelle au-dessus d'un banc pour les œuvres dont les dimensions sont connues.
- **Films** : table de montage des douze films, durée proportionnelle, fiche par film, lecteur YouTube sans cookies ou Vimeo chargé seulement au clic, mention et « Demander le lien » pour les trois films privés.
- **À propos & contact** : parcours, agenda 2012–2024 (60 dates) filtrable par type, bibliographie, artistes et commissaires croisés (« Avec »), coordonnées, formulaire simulé (rien n'est envoyé).
- **Mentions légales** et **404** (un pan de mur manquant).

**Étiquettes de musée** : même gabarit partout (code de la démarche quand il existe, titre, année · dimensions, technique dans la visionneuse) ; ce qui manque est marqué « à compléter ».

**Images** : œuvres, photogrammes et documentation aux couleurs d'origine, jamais recadrés (vignettes comprises) ; 7 photos tirées du livret RDM ; 15 illustrations générées (Grok) pour les décors, chacune avec la mention « Illustration générée » ; images de partage 1200×630 par page et par langue.

**Confort** : mode calme (réglage de l'appareil ou bouton), retour arrière sans intro, navigation au clavier, zones tactiles de 44 px, barre « Appeler / Écrire » sur téléphone, contrastes AA.

**Mise en ligne** : site statique pour Vercel, `noindex` partout (maquette), adresses sans `.html`.

**À fournir par l'artiste** : voir « Ce que l'artiste doit encore fournir » dans le README.
