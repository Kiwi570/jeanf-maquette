/* Œuvres : un seul mur en cinq pans (une série par pan), filtres par série gardés dans l'adresse,
   visionneuse avec loupe (lien direct #oeuvre-…), mode « Voir au mur » à l'échelle, liste complète. */
import { html, brut } from '../../outils/gabarit.mjs';
import { image, etiquette, carte, trouver, toutes, titreDe, dims, ratio, dimsTexte } from '../gabarits/oeuvre.mjs';

export const page = { cle: 'oeuvres', fichier: 'oeuvres', imagePartage: 'oeuvres/tr-songes-ouvert-1280.webp' };

export default (c) => {
  const series = c.donnees.oeuvres.series;
  const liste = toutes(c);
  const pieces = liste.length;
  const { s: sW, o: wayOut } = trouver(c, 'retables', 'way-out');
  const detail = wayOut.images.find((i) => i.detail);
  const demander = (o) => c.url('a-propos', 'contact', `sujet=oeuvre&oeuvre=${encodeURIComponent(titreDe(c, o))}`);
  return html`
<section class="tete tete--oeuvres ecran" id="debut">
  ${c.media({ nom: 'grok/galerie', alt: '', cadrage: '50% 45%', classe: 'tete-fond', sizes: '100vw' })}
  <div class="tete-grille">
    <div class="tete-texte tete-texte--carte">
      <p class="surtitre" data-anime="gsap">${c.t('oeuvres.tete.sous')}</p>
      <h1 class="tete-titre"><span data-anime="gsap" class="tete-ligne">${c.t('oeuvres.tete.titre')}</span></h1>
      <p class="tete-intro" data-anime="gsap">${c.t('oeuvres.tete.texte')}</p>
      <p class="tete-actions" data-anime="gsap"><a class="bouton" href="#mur" data-action-principale data-magnetique>${c.t('oeuvres.tete.action')}</a></p>
      <p class="tete-info" data-info-cle data-anime="gsap">${c.t('oeuvres.tete.info', { series: series.length, pieces })}</p>
    </div>
    <figure class="tete-oeuvre" data-anime="gsap">
      <div class="accroche" style="--ratio:${ratio(detail.nom)}">${image(c, detail, `${titreDe(c, wayOut)} (${c.s('oeuvres.carte.detail')})`, { sizes: '(max-width: 760px) 80vw, 38vw', priorite: true })}</div>
      <figcaption>${etiquette(c, sW, wayOut, { detail: true, technique: true })}</figcaption>
    </figure>
  </div>
</section>

<section class="mur mur--complet ecran epingle" id="mur" data-entete-cache>
  <div class="mur-tete conteneur">
    <h2 class="titre-section">${c.t('oeuvres.mur.titre')}</h2>
    <p class="mur-sauter"><a class="lien-fleche" href="#liste" data-sans-transition>${c.t('oeuvres.mur.sauter')}</a></p>
    <div class="filtres" role="group" aria-label="${c.s('oeuvres.filtres.libelle')}" data-filtres>
      <button type="button" class="filtre" data-filtre="tous" aria-pressed="true">${c.t('oeuvres.filtres.tous')}</button>
      ${series.map((s) => html`<button type="button" class="filtre" data-filtre="${s.id}" aria-pressed="false">${s.code ? html`<span class="etiquette-code">${s.code}</span>` : ''}${c.loc(s.titre)}</button>`)}
    </div>
  </div>
  <div class="piste mur-piste" data-galerie tabindex="0" role="region" aria-label="${c.s('oeuvres.mur.region')}">
    ${series.map((s, i) => html`<div class="pan" id="pan-${s.id}" data-serie="${s.id}">
      ${i ? html`<span class="coupe" aria-hidden="true"><i></i></span>` : ''}
      <article class="pan-tete">
        <p class="pan-num">${c.t('oeuvres.mur.pan')} ${String(i + 1).padStart(2, '0')}${s.code ? html` · <span class="etiquette-code">${s.code}</span>` : ''}</p>
        <h3>${c.loc(s.titre)}</h3>
        ${s.sous ? html`<p class="pan-sous">${c.loc(s.sous)}</p>` : ''}
        <p class="pan-meta">${c.loc(s.technique)} · ${typeof s.annees === 'string' ? s.annees : c.loc(s.annees)}</p>
        <p class="pan-texte pan-texte--large">${c.loc(s.texte)[0]}</p>
        <details class="pan-details"><summary>${c.t('oeuvres.mur.presentation')}</summary><p class="pan-texte">${c.loc(s.texte)[0]}</p></details>
        ${s.pdf ? html`<p><a class="lien-fleche" href="/assets/documents/${s.pdf}" target="_blank" rel="noopener" data-sans-transition>${c.t('oeuvres.mur.synopsis')}</a></p>` : ''}
      </article>
      ${s.id === 'derive' ? html`<canvas class="vitrail-lumiere" data-vitrail aria-hidden="true" data-audit-ignorer></canvas>` : ''}
      ${s.oeuvres.map((o) => carte(c, s, o, { page: 'oeuvres' }))}
    </div>`)}
  </div>
  <div class="mur-bas conteneur">
    <div class="mur-progres" aria-hidden="true"><span></span></div>
    <p class="mur-glisser">${c.t('oeuvres.mur.glisser')}</p>
  </div>
</section>

<section class="liste-oeuvres conteneur" id="liste">
  <h2 class="titre-section" data-decoupe>${c.t('oeuvres.liste.titre')}</h2>
  <p>${c.t('oeuvres.liste.texte')}</p>
  <p class="liste-plan" data-visuel aria-hidden="true">${series.map((s, i) => html`<span class="liste-plan-pan" style="--n:${s.oeuvres.length}"><span>${s.code || String(i + 1).padStart(2, '0')}</span><strong>${s.oeuvres.length}</strong></span>`)}</p>
  <table class="liste">
    <thead><tr><th scope="col">${c.t('oeuvres.liste.titreCol')}</th><th scope="col">${c.t('oeuvres.liste.serieCol')}</th><th scope="col">${c.t('oeuvres.liste.techniqueCol')}</th><th scope="col">${c.t('oeuvres.liste.dimensionsCol')}</th><th scope="col">${c.t('oeuvres.liste.anneeCol')}</th><th scope="col">${c.t('oeuvres.liste.dispoCol')}</th></tr></thead>
    <tbody>
      ${liste.map(({ s, o }) => html`<tr data-serie="${s.id}">
        <th scope="row">${o.film ? c.lien('films', { ancre: `film-${o.film}`, texte: titreDe(c, o) }) : html`<a href="#oeuvre-${o.id}" data-visionneuse="${o.id}" data-sans-transition>${titreDe(c, o)}</a>`}</th>
        <td data-libelle="${c.s('oeuvres.liste.serieCol')}">${c.loc(s.titre)}</td>
        <td data-libelle="${c.s('oeuvres.liste.techniqueCol')}">${c.loc(o.technique)}</td>
        <td data-libelle="${c.s('oeuvres.liste.dimensionsCol')}">${o.dimensions ? dimsTexte(c.loc(o.dimensions)) : o.film ? '—' : html`<span class="a-completer">${c.t('oeuvres.liste.inconnu')}</span>`}</td>
        <td data-libelle="${c.s('oeuvres.liste.anneeCol')}">${o.annee ? (typeof o.annee === 'string' ? o.annee : c.loc(o.annee)) : html`<span class="a-completer">${c.t('oeuvres.liste.inconnu')}</span>`}</td>
        <td data-libelle="${c.s('oeuvres.liste.dispoCol')}">${o.film ? '—' : html`<a href="${demander(o)}" data-libelle="${c.libelle('a-propos')}">${c.t('oeuvres.liste.demander')}<span class="visuellement-cache"> : ${titreDe(c, o)}</span></a>`}</td>
      </tr>`)}
    </tbody>
  </table>
</section>

<section class="fin-oeuvres" id="fin">
  ${c.media({ nom: 'grok/coupe-mur', alt: '', classe: 'fin-oeuvres-media', cadrage: '50% 50%', sizes: '100vw' })}
  <div class="conteneur fin-oeuvres-texte">
    <h2 class="titre-section" data-decoupe>${c.t('oeuvres.fin.titre')}</h2>
    <p>${c.t('oeuvres.fin.texte')}</p>
    <p>${c.lien('a-propos', { ancre: 'contact', params: 'sujet=oeuvre', classe: 'bouton', texte: c.t('oeuvres.fin.action'), attrs: 'data-magnetique' })}</p>
  </div>
</section>

<div class="visionneuse" id="visionneuse" data-visionneuse-boite data-recouvrement role="dialog" aria-modal="true" aria-label="${c.s('oeuvres.visionneuse.titre')}" hidden inert>
  <div class="visionneuse-barre">
    <p class="visionneuse-compte" aria-live="polite" data-compte-modele="${c.s('oeuvres.visionneuse.compte')}"></p>
    <button type="button" class="visionneuse-fermer" data-visionneuse-fermer>${c.t('commun.fermer')}</button>
  </div>
  ${liste.filter(({ o }) => !o.film).map(({ s, o }) => html`<article class="visionneuse-oeuvre" data-oeuvre="${o.id}" data-l="${o.l || ''}" data-h="${o.h || ''}" hidden>
    <div class="visionneuse-scene">
      ${o.images.map((im, k) => html`<figure class="visionneuse-image" data-index="${k}"${k ? brut(' hidden') : ''}>
        <img data-src="/assets/images/${im.nom}-${dims(im.nom).l >= 1920 ? 1920 : dims(im.nom).l >= 1280 ? 1280 : dims(im.nom).l}.webp" alt="${titreDe(c, o)}${im.etat ? `, ${c.s(`oeuvres.carte.${im.etat}`)}` : ''}${im.detail ? ` (${c.s('oeuvres.carte.detail')})` : ''}" width="${dims(im.nom).l}" height="${dims(im.nom).h}" data-loupe>
      </figure>`)}
      ${o.images.length > 1 ? html`<button type="button" class="visionneuse-nav visionneuse-nav--prec" data-visionneuse-prec><span aria-hidden="true">←</span><span class="visuellement-cache">${c.t('oeuvres.visionneuse.precedent')}</span></button>
      <button type="button" class="visionneuse-nav visionneuse-nav--suiv" data-visionneuse-suiv><span aria-hidden="true">→</span><span class="visuellement-cache">${c.t('oeuvres.visionneuse.suivant')}</span></button>` : ''}
    </div>
    <div class="visionneuse-texte">
      ${etiquette(c, s, o, { technique: true, classe: 'etiquette--grande' })}
      <p class="visionneuse-serie">${c.loc(s.titre)}${o.lieu ? html` · ${c.loc(o.lieu)}` : ''}</p>
      <p class="visionneuse-aide"><span class="aide-souris">${c.t('oeuvres.visionneuse.loupe')}</span><span class="aide-tactile">${c.t('oeuvres.visionneuse.loupeTactile')}</span></p>
      <p class="visionneuse-actions">
        ${o.l && o.h ? html`<button type="button" class="bouton bouton--contour" data-voir-mur-ouvrir="${o.id}">${c.t('oeuvres.carte.voirMur')}</button>` : html`<span class="a-completer">${c.t('oeuvres.voirMur.sansDimensions')}</span>`}
        <a class="bouton" href="${demander(o)}" data-libelle="${c.libelle('a-propos')}">${c.t('oeuvres.liste.demander')}</a>
      </p>
    </div>
  </article>`)}
</div>

<div class="voir-mur" id="voir-mur" data-voir-mur data-recouvrement role="dialog" aria-modal="true" aria-label="${c.s('oeuvres.voirMur.titre')}" hidden inert>
  <div class="voir-mur-scene" data-voir-mur-scene>
    <picture class="voir-mur-fond">
      <source media="(max-aspect-ratio: 3/4)" data-srcset="/assets/images/grok/voir-au-mur-mobile-${dims('grok/voir-au-mur-mobile').l}.webp">
      <img data-src="/assets/images/grok/voir-au-mur-${dims('grok/voir-au-mur').l}.webp" alt="${c.s('oeuvres.voirMur.alt')}" width="${dims('grok/voir-au-mur').l}" height="${dims('grok/voir-au-mur').h}">
    </picture>
    <img class="voir-mur-oeuvre" alt="" data-voir-mur-image>
    <span class="mention-ia">${c.t('commun.mentionIa')}</span>
  </div>
  <div class="voir-mur-barre">
    <p><strong data-voir-mur-titre></strong><br><span>${c.t('oeuvres.voirMur.texte')}</span></p>
    <button type="button" class="bouton bouton--contour" data-voir-mur-fermer>${c.t('commun.fermer')}</button>
  </div>
</div>
`;
};
