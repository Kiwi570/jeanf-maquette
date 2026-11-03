/* Gabarit commun : head, en-tête, menu, pied de page, barre fixe du téléphone, voile, panneau d'intro.
   Les conventions data-* sont celles que lisent le socle JavaScript et l'audit (voir le README).
   Propre à JeanF : le nom en blocs de mur dans l'intro, le minutage du mur dans l'en-tête. */
import { html, brut } from '../../outils/gabarit.mjs';

const navigation = (c) => c.site.navigation.filter((cle) => c.pages[cle] && (c.pages[cle].langues || c.langues).includes(c.l));

/* Lettres du nom en blocs (7 rangées), comme des pans de mur posés les uns sur les autres. */
const LETTRES = {
  J: ['0111', '0001', '0001', '0001', '0001', '1001', '0110'],
  e: ['0000', '0000', '0110', '1001', '1111', '1000', '0111'],
  a: ['0000', '0000', '0110', '0001', '0111', '1001', '0111'],
  n: ['0000', '0000', '1110', '1001', '1001', '1001', '1001'],
  F: ['1111', '1000', '1000', '1110', '1000', '1000', '1000'],
};

function blocsNom() {
  const blocs = [];
  let col = 1;
  for (const lettre of 'JeanF') {
    const m = LETTRES[lettre];
    m.forEach((rang, r) => [...rang].forEach((v, k) => { if (v === '1') blocs.push({ c: col + k, r: r + 1 }); }));
    col += 5;
  }
  /* Ordre de chute : de bas en haut, de gauche à droite, comme un mur qu'on monte. */
  blocs.sort((a, b) => b.r - a.r || a.c - b.c);
  return blocs.map((b, i) => `<span class="bloc" style="grid-column:${b.c};grid-row:${b.r};--i:${i}"></span>`).join('');
}

function tete(c) {
  const p = c.page, cle = p.cle;
  const titre = c.s(`pages.${cle}.titre`), description = c.s(`pages.${cle}.description`);
  const ici = c.abs(c.url(cle));
  const imagePartage = c.abs(`/assets/partage/${p.partage === false ? 'accueil' : cle}-${c.l}.jpg`);
  const autres = c.alternatives(cle);
  const structure = c.donnees.structure ? JSON.stringify(c.donnees.structure).replace(/</g, '\\u003c') : '';
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${titre}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${ici}">
${autres.length > 1 ? autres.map((a) => html`<link rel="alternate" hreflang="${a.l}" href="${c.abs(a.url)}">\n`) : ''}${autres.length > 1 ? html`<link rel="alternate" hreflang="x-default" href="${c.abs(c.alternatives(cle)[0].url)}">` : ''}
<style>${brut(c.critique.css)}</style>
<script>${brut(c.critique.js)}</script>
${(c.site.polices || []).map((f) => html`<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>\n`)}<link rel="stylesheet" href="${c.asset('css/socle.css')}">
<link rel="stylesheet" href="${c.asset('css/site.css')}">
<link rel="modulepreload" href="${c.asset('js/site.js')}">
<link rel="modulepreload" href="${c.asset('js/socle/index.js')}">
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/SplitText.min.js" defer></script>
<script type="module" src="${c.asset('js/site.js')}"></script>
<meta name="theme-color" content="${c.site.couleurs.theme || c.site.couleurs.fond}">
<link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${c.s('commun.nomComplet')}">
<meta property="og:locale" content="${c.l === 'fr' ? 'fr_BE' : 'en_GB'}">
<meta property="og:title" content="${titre}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${ici}">
<meta property="og:image" content="${imagePartage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${c.s(`pages.${p.partage === false ? 'accueil' : cle}.partageAlt`)}">
<meta name="twitter:card" content="summary_large_image">
${structure ? html`<script type="application/ld+json">${brut(structure)}</script>` : ''}
</head>`;
}

function entete(c) {
  const autreLangue = c.alternatives(c.page.cle).filter((a) => a.l !== c.l);
  const a = c.site.actionEntete;
  return html`<header data-entete>
  <div class="entete-rangee">
    <a class="entete-logo" href="${c.url('accueil')}" data-libelle="${c.libelle('accueil')}"${c.page.cle === 'accueil' ? brut(' aria-current="page"') : ''}>
      <img src="/assets/images/logo.svg" alt="" width="36" height="36"><span class="entete-nom">JeanF</span>
    </a>
    <span class="minutage" data-minutage aria-hidden="true" data-audit-ignorer>00:00:00:00</span>
    <nav data-nav aria-label="${c.s('commun.navigation')}">
      <ul>${navigation(c).filter((k) => k !== 'accueil').map((k) => html`<li>${c.lien(k)}</li>`)}</ul>
    </nav>
    <div class="entete-actions">
      ${autreLangue.map((x) => html`<a class="entete-langue" href="${x.url}" hreflang="${x.l}" lang="${x.l}" data-langue="${x.l}" aria-label="${c.s('commun.langueAutre')}">${x.l}</a>`)}
      ${a ? html`<a class="bouton bouton--entete" href="${c.url(a.page, a.ancre || '')}" data-libelle="${c.libelle(a.page)}" data-magnetique>${c.t('commun.actionEntete')}</a>` : ''}
      <button type="button" data-menu-bouton aria-controls="menu" aria-expanded="false" data-libelle-ouvrir="${c.s('commun.menu')}" data-libelle-fermer="${c.s('commun.fermer')}"><span data-libelle-bouton>${c.t('commun.menu')}</span></button>
    </div>
  </div>
</header>
<div id="menu" data-menu role="dialog" aria-modal="true" aria-label="${c.s('commun.menu')}">
  <ul>${navigation(c).map((k, i) => html`<li style="--i:${i}"><span class="menu-num" aria-hidden="true">0${i + 1}</span>${c.lien(k, { classe: 'menu-lien' })}</li>`)}</ul>
  <div class="menu-bas">
    <p>${a ? html`<a class="bouton" href="${c.url(a.page, a.ancre || '')}" data-libelle="${c.libelle(a.page)}">${c.t('commun.actionEntete')}</a>` : ''}</p>
    <p class="menu-contact"><a href="mailto:${c.site.contact.email}">${c.site.contact.email}</a><br><a href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a></p>
    ${autreLangue.map((x) => html`<p><a class="entete-langue entete-langue--menu" href="${x.url}" hreflang="${x.l}" lang="${x.l}" data-langue="${x.l}">${c.s('commun.langueAutre')}</a></p>`)}
    <p><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></p>
  </div>
</div>`;
}

function pied(c) {
  const k = c.site.contact;
  return html`<footer class="pied" id="pied">
  <div class="conteneur pied-grille">
    <div class="pied-nom">
      <p class="pied-marque"><img src="/assets/images/logo.svg" alt="" width="44" height="44"><span><strong>${c.t('commun.nomComplet')}</strong><br>${c.t('commun.signature')}</span></p>
      <p>${c.loc(k.adresse)}</p>
    </div>
    <div>
      <p class="pied-titre">${c.t('commun.contact')}</p>
      <ul>
        <li><a href="mailto:${k.email}">${k.email}</a></li>
        <li><a href="tel:${k.telephoneLien}">${k.telephone}</a></li>
        <li><a href="${k.facebook}" target="_blank" rel="noopener">${c.t('commun.facebook')}</a></li>
      </ul>
    </div>
    <nav aria-label="${c.s('commun.sommaire')}">
      <p class="pied-titre">${c.t('commun.sommaire')}</p>
      <ul>${navigation(c).map((x) => html`<li>${c.lien(x)}</li>`)}<li>${c.lien('mentions-legales')}</li></ul>
    </nav>
    <div>
      <p class="pied-titre">${c.t('commun.confort')}</p>
      <ul>
        <li><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></li>
        <li><a href="#haut" data-sans-transition>${c.t('commun.retourHaut')}</a></li>
      </ul>
    </div>
  </div>
  <div class="conteneur pied-bas"><p>${c.t('commun.maquette')}</p><p>© JeanF Jans</p></div>
</footer>`;
}

function barre(c) {
  const a = c.site.actionEntete;
  return html`<div data-barre-fixe>
  <a class="bouton bouton--contour" href="tel:${c.site.contact.telephoneLien}">${c.t('commun.appeler')}</a>
  ${a ? html`<a class="bouton" href="${c.url(a.page, a.ancre || '')}" data-libelle="${c.libelle(a.page)}">${c.t('commun.actionCourte')}</a>` : ''}
</div>`;
}

function voile(c) {
  return html`<div data-voile aria-hidden="true"><span class="voile-joint"></span><div class="voile-contenu"><img src="/assets/images/logo-clair.svg" alt="" width="56" height="56"><span data-voile-libelle>${c.libelle(c.page.cle)}</span></div></div>`;
}

function panneau(c) {
  return html`<div class="ouverture-panneau" data-ouverture aria-hidden="true">
  <span class="ouverture-joints"><i></i><i></i><i></i><i></i><i></i></span>
  <span class="ouverture-minutage" data-intro-minutage>00:00:00:00</span>
  <div class="ouverture-centre">
    <div class="ouverture-blocs">${brut(blocsNom())}</div>
    <p class="ouverture-etiquette"><span>${c.t('commun.introLigne')}</span><span>${c.t('commun.introLieu')}</span></p>
  </div>
</div>`;
}

export function page(c, contenu) {
  return html`<!doctype html>
<html lang="${c.l}" data-v="${c.v}" data-gabarit="${c.page.gabarit || c.page.cle}"${c.site.curseur ? brut(' data-curseur') : ''}>
${tete(c)}
<body id="haut" class="page-${c.page.cle}">
${voile(c)}
${panneau(c)}
<a class="evitement" href="#contenu">${c.t('commun.evitement')}</a>
${entete(c)}
<main id="contenu" tabindex="-1"${c.page.sansAction ? brut(' data-sans-action') : ''}>
${contenu}
</main>
${pied(c)}
${barre(c)}
</body>
</html>`;
}
