# JeanF — maquette « Le Mur »

Maquette du site de JeanF Jans, artiste « Nomade Polymedia » (Bruxelles). Direction artistique : le mur d'exposition et les *Mauerstücke* (pans de mur), plâtre, joints, étiquettes de musée, minutage de montage. Français et anglais.

**Pages** : Accueil (œuvre d'ouverture à volets, manifeste Mauerstücke en entier, mur épinglé des œuvres phares, carte des résidences Laundry, films, Gare aux Rumeurs, repères, contact) · Œuvres (mur complet en cinq pans avec filtres, liste, visionneuse avec loupe, « voir au mur » à l'échelle) · Films (table de montage des douze films, fiche et lecteur chargé au clic) · À propos & contact (parcours, agenda 2012–2024 filtrable, bibliographie, formulaire simulé) · Mentions légales · 404.

**Règles tenues** : les œuvres ne sont jamais recadrées ni filtrées ; aucune œuvre n'est générée ; chaque image générée porte la mention « Illustration générée » ; rien n'est inventé (ce qui manque est marqué « à compléter ») ; aucun lien vers l'ancien site.

**Sources** : textes, œuvres, films et agenda relevés sur le site actuel et dans les PDF du site (`donnees/`) ; photos du livret RDM dans `recu/rdm/` ; conversion par `outils/lot-jeanf.py` puis `python3 outils/images.py recu/lot.json`. Les images d'origine ne sont pas dans le zip (trop lourdes) : pour reconvertir, copier le contenu du dossier `jeanf-images` (zip des images du site) dans `recu/site/` et celui du dossier `jeanf-grok` (zip des images Grok) dans `recu/grok/`. Les images converties, elles, sont dans `assets/images/`.

## Effets vivants (v2)

- `assets/js/vivant.js` contient :
  - la lumière de galerie, les cadres inclinables et leur balancement, le curseur qui dit ce qu'on peut faire et les boutons magnétiques ;
  - les bandeaux, les étiquettes tapées, le nom en blocs du pied de page ;
  - le grain, le projecteur et l'amorce des films.

  Tout est coupé en mode calme, et aucune position n'est lue pendant le défilement.
- `source/gabarits/vivant.mjs` contient les bandeaux défilants (toujours avec un bouton pause) et les compteurs.
- Voile en pans de mur : `assets/js/socle/voile.js` est une option ajoutée au socle. Elle s'active quand le voile contient `[data-voile-blocs]` ; `transitions.js` et `ouverture.js` l'utilisent, et sans blocs le voile glisse comme avant.

## Reconstruire

```
python3 outils/lot-jeanf.py && python3 outils/images.py recu/lot.json && python3 outils/teintes.py
node outils/generer.mjs && node outils/images-partage.mjs
node _audit/audit.mjs
```

L'audit a besoin de Playwright : `cd _audit && npm install playwright && npx playwright install chromium` (le dossier `node_modules` n'est pas livré).

## Ce que l'artiste doit encore fournir

- Adresse de l'atelier (contact, données structurées) et statut d'éditeur pour les mentions légales.
- Dimensions de 18 œuvres sur 32 (sans elles, pas d'échelle « voir au mur ») : *Songes de ma voisine de quartier*, *Triptyque Shaimaa al Sabbagh*, *Holy quest of…*, *Menu*, *Police calibrée*, les neuf *Pépinière*, le livre *Russian Diary Moods*, *Floating migrants*, *Détails de vitrail*, *Home window*.
- Prix et disponibilité (aujourd'hui « sur demande »).
- Durée exacte de *Du, mein Spiegel !* ; une image de *3 - 1 = 3* ; liens privés d'*Issues*, *Huis clos* et *Apocalypse* (vidéos non intégrables).
- Un portrait, si l'artiste le souhaite.
- À faire valider (les sources se contredisent, rien n'a été tranché) : durée de *Scattered Limbs of Osiris* (8’45 sur le site, 8'40" dans le programme du Caire) ; dates de Laundry V (été 2020 ou septembre-octobre 2020) et de Laundry VI ; année d'*O, Mensch…* (2014 ou 2013) et de *Mi chiami ?* (2013 ou 2012) ; graphies « Manu » ou « Manuel vb Tintoré », « NONO_C » ou « NONO-C », musée de Casoria ; code « Mû » ou « Mü » pour Müllstücke ; synopsis anglais de *Huis clos* (traduit ici depuis le français).
- Les illustrations Grok en plus grand si possible (plusieurs sont à 1168 px de large).

## À la mise en ligne définitive (ce projet)

- Retirer : `noindex` (balise robots dans `source/gabarits/commun.mjs`, X-Robots-Tag dans `vercel.json`), la mention « Maquette » du pied de page, le formulaire simulé (le brancher sur un vrai service), les mentions « à compléter ».
- Garder : la mention « Illustration générée » sur les 15 illustrations Grok (`assets/images/grok/`), les liens externes en nouvel onglet avec `noopener`, `youtube-nocookie.com` et le chargement des vidéos au clic seulement.

---

# Base de départ des maquettes (socle)

Base testée, commune à toutes les maquettes : chaque projet part d'une copie de ce dossier au lieu de tout réécrire.
Les pages d'exemple (accueil, à propos, mentions légales, 404) et leurs images sont à remplacer par le contenu du client.

## Démarrer un projet

1. Copier le contenu de `socle/` à la racine du projet `[client]-maquette/`, et le dossier `audit/` de la skill dans `_audit/`. Les fichiers cachés (`.vercelignore`, `assets/partage/.gitkeep`) peuvent manquer dans la copie de la skill reçue dans une conversation : le générateur (étape 5) recrée `.vercelignore` s'il manque et le complète s'il lui manque une ligne, et `outils/images-partage.mjs` crée `assets/partage/`. Sans `.vercelignore`, `_audit/`, `source/`, `outils/` et `donnees/` seraient mis en ligne ; l'audit le vérifie.
2. Remplir `donnees/site.json` (nom, adresse Vercel prévue, langues, couleurs — `fond`, `texte`, `voile`, et si besoin `ouverture` pour le panneau de l'intro et `menu` pour le fond du menu —, contact, site actuel), puis `donnees/textes/<langue>.json` et les autres données (`donnees/*.json`).
3. Écrire les pages dans `source/pages/*.mjs`, le style dans `assets/css/site.css`, les effets dans `assets/js/site.js`.
4. Convertir les images reçues : `python3 outils/images.py recu/lot.json` (modèle : `outils/lot.exemple.json`).
5. Générer les pages : `node outils/generer.mjs`, puis les images de partage : `node outils/images-partage.mjs`.
6. Auditer : `node _audit/audit.mjs`.

Ne jamais modifier à la main les pages générées (`index.html`, `en/index.html`…) : elles sont réécrites par `generer.mjs`.

## Dossiers

| Dossier | Contenu |
|---|---|
| `donnees/` | Source unique des textes et des données : `site.json`, `textes/<langue>.json`, `*.json` (champs traduits sous la forme `{ "fr": …, "en": … }`), `structure.json` (données schema.org réelles). |
| `source/critique/` | Style et script critiques, copiés en ligne dans chaque page : couleur de fond dès la première image, mode d'arrivée (intro, voile, retour), délai de secours. |
| `source/gabarits/` | `commun.mjs` (head, en-tête, menu, pied de page, barre du téléphone, voile, panneau d'ouverture), `partage.mjs` (image de partage 1200×630). |
| `source/pages/` | Une page par fichier : `export const page = { cle, fichier }` et `export default (c) => html\`…\``. |
| `assets/js/socle/` | Comportements communs (voir plus bas). Le projet ne les modifie pas : il les règle depuis `site.js`. |
| `assets/vendor/` | GSAP 3.15 (gsap, ScrollTrigger, SplitText), sans numéro de version. |
| `outils/` | `generer.mjs`, `images-partage.mjs`, `images.py`, `gabarit.mjs`, `dimensions.mjs`. |

## Ce que fait le socle

- **Ouverture** : l'intro complète se joue à chaque arrivée sur le site et à chaque rechargement. Elle se termine moins de 3 s après le premier octet, attente comprise (le socle l'accélère si l'attente l'a retardée). Une première action l'accélère, une seconde la passe (clic, touche, molette, glissement ; un geste continu compte pour une action). Défilement bloqué dès le premier affichage. Au retour arrière ou avant, la page revient directement dans son état final. Les changements de page internes passent par le voile, jamais par l'intro. En mode calme, et au rechargement dû au bouton du mode calme : état final directement. Une attente qui échoue ne bloque jamais l'écran.
- **Voile de transition** : couvre l'écran, navigation, la page d'arrivée démarre couverte (style critique), se prépare dessous, puis le voile se retire et les animations d'arrivée démarrent à mesure que la page se découvre. Délai de secours 2 s. Page suivante préchargée à l'approche du lien. Grands sauts dans une même page sous le voile. Défilement bloqué tant que le voile couvre l'écran, au départ comme à l'arrivée. Le voile est placé en tête de `<body>` pour être là dès la première image.
- **Bande de la barre de défilement** (`gouttiere.js`) : sur un ordinateur à barre de défilement classique (Windows, Mac avec une souris), `scrollbar-gutter: stable` réserve une bande d'environ 15 px à droite ; défilement bloqué, le navigateur la peint avec la couleur de fond de `<html>`, qu'aucun panneau fixe ne peut recouvrir, et il n'y peint ni image ni dégradé. Le style critique donne donc à `<html>` la couleur du voile ou de l'intro dès la première image, puis le socle suit le panneau qui couvre l'écran (intro, voile, menu) : la bande prend la couleur de ce qui en couvre la plus grande partie, mélangée selon l'opacité pendant un fondu. Pour une fenêtre plein écran propre au projet : `suivre(el)` à l'ouverture, `lacher(el)` à la fermeture (exportés par `socle/index.js`), et `data-recouvrement` pour que l'audit la contrôle. Un panneau à fond d'image ou de dégradé indique la couleur de la bande avec `data-gouttiere="#…"`.
- **En-tête** : opaque, se cache en descendant et revient en remontant avec un seuil, bouton Menu dès que les liens ne tiennent plus (mesure réelle), menu avec Échap, focus gardé, page bloquée, libellé qui revient à « Menu ».
- **Mode calme** : réglage de l'appareil respecté, bouton `[data-calme-bascule]`, retour à la section après rechargement, boucles et défilement adouci coupés.
- **Défilement** : natif sur Mac, iPhone, iPad et écrans tactiles ; adouci à la molette sous Windows et Linux seulement.
- **Mesures** : `--entete-h` et `--barres-h` réelles, `ScrollTrigger.refresh()` regroupé quand la hauteur de la page change.
- **Boucles** : `boucle(element, (dt, t) => …)` ne tourne qu'à l'écran, onglet visible, jamais en mode calme (une image fixe est dessinée).
- **Formulaires** `[data-formulaire]` : préremplis par l'adresse (`?sujet=visite`), erreurs à côté du champ, pas de double envoi, message « simulé ».
- **Compteurs** `[data-compteur]`, **barre de lecture** `[data-barre-lecture]`, **sommaire** `[data-sommaire]`, **curseur** (attribut `data-curseur` sur `<html>`, souris seulement).

## API du projet (`assets/js/site.js`)

```js
import { demarrer, boucle, etat } from './socle/index.js?v=1';
demarrer({
  preparer() { /* ScrollTrigger, SplitText, boucles : états de départ posés ici */ },
  jouer() { return gsap.timeline() /* intro complète, environ 2 s */; },
  etatFinal() { /* éléments animés par le projet dans leur état final */ },
  arrivee() { /* animations d'arrivée pendant que le voile se retire (facultatif) */ },
  pret: [/* promesses en plus : shaders, scènes ; un échec ne bloque rien */],
});
```

## Conventions lues par le socle et par l'audit

| Attribut | Rôle |
|---|---|
| `data-ouverture` | Élément d'ouverture, visible et entier dès la première image (panneau du gabarit commun). |
| `data-anime` | Caché jusqu'à son apparition (`.vu`). `data-anime="gsap"` : animé par le projet. |
| `data-voile`, `data-voile-libelle` | Voile de transition et nom de la page d'arrivée. |
| `data-gabarit` | Sur `<html>`, posé par le générateur : la clé de la page, ou `page.gabarit` s'il est donné. Les pages en série (fiches produits…) partagent la même valeur ; l'audit en contrôle 3 entièrement et les autres en contrôle léger. |
| `data-gouttiere` | Sur un panneau qui couvre l'écran : couleur de la bande de la barre de défilement quand son fond est une image ou un dégradé. |
| `data-recouvrement` | Fenêtre plein écran du projet (visionneuse, panier) : l'audit contrôle les bords de l'écran pendant qu'elle est ouverte. |
| `data-entete`, `data-nav`, `data-menu`, `data-menu-bouton` | En-tête, navigation, menu, bouton Menu. |
| `data-barre-fixe` | Barre fixe du bas (téléphone). `data-masque-barre` : zone où elle se masque. |
| `data-action-principale`, `data-info-cle` | Bouton principal et information clé du premier écran. |
| `data-entete-cache` | Scène épinglée pendant laquelle l'en-tête se cache. |
| `data-plein-ecran` | Section plein écran vérifiée par le test « tient dans l'écran ». |
| `data-galerie` | Galerie horizontale (ses cartes au bord de l'écran ne sont pas des « textes coupés »). |
| `data-boucle-css`, `data-pause-pour` | Animation CSS en boucle et son bouton pause. |
| `data-superpose` | Superposition voulue (exclue du contrôle des chevauchements). |
| `data-audit-ignorer` | Élément décoratif ignoré par l'audit (curseur, particules). |
| `data-ephemere` | Élément qui doit disparaître après son animation. |
| `data-prix`, `data-repere`, `data-indicateur` | Prix, repère de schéma ou de carte, indicateur : jamais recouverts ni coupés (audit). |
| `data-sans-visuel` | Bloc dispensé d'image par section (sections de texte des pages légales). |
| `data-sans-action` | Sur `<main>` : page sans bouton principal (pages légales ; posé par `page.sansAction`). |
| `data-visuel`, `data-section` | Visuel dessiné autrement qu'en image ; section qui n'est pas une balise `<section>`. |
| `data-ruban` | Bandeau défilant (ignoré par le contrôle des textes coupés). |
| `data-typo-ignorer` | Texte exclu du contrôle de typographie française (code, citation en langue étrangère). |
| `data-sans-transition` | Lien interne sans voile (ancre « retour en haut », téléchargement). |
| `data-defilement-natif` | Sur `<html>` : défilement natif partout, choix du projet. |
| `data-langue` | Lien vers une autre langue : le choix est mémorisé. |
| `data-formulaire`, `data-message-envoi` | Formulaire simulé et zone du message « rien n'a été envoyé ». |
| `data-compteur`, `data-barre-lecture`, `data-sommaire` | Compteur animé, barre de lecture, sommaire qui suit la lecture. |
| `data-calme-bascule` | Bouton « Réduire les animations ». |
| `data-libelle` | Nom de la page d'arrivée affiché sur le voile (posé par `c.lien`). |
| Dossier `assets/images/grok/` | Image générée : `c.media()` ajoute la mention « Illustration générée ». |

## Gabarits (`c` dans les pages)

`c.t('cle')` texte échappé avec typographie française · `c.tb('cle')` fragment HTML de confiance · `c.s('cle')` texte brut ·
`c.lien('page', { ancre, params, texte, classe })` lien avec `data-libelle` et `aria-current` · `c.url('page', ancre, params)` ·
`c.media({ nom, alt, cadrage, cadrageMobile, sizes, priorite, classe, ratio })` image en plusieurs tailles, version téléphone, largeur et hauteur réelles ·
`c.donnees.<fichier>` données localisées · `c.l` langue · `c.site` réglages.

En français, la typographie est appliquée automatiquement : espaces insécables avant `: ; ? ! »`, après `«`, entre un nombre et son unité, dans les milliers.

## À la mise en ligne définitive

- Retirer : `noindex` (balise robots dans `source/gabarits/commun.mjs` et en-tête X-Robots-Tag dans `vercel.json`), données de démonstration, formulaires, panier et réservations simulés, mentions « à compléter ».
- Garder : la mention « Illustration générée » sur les images créées par IA.
