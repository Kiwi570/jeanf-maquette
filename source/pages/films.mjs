/* Films : ouverture sur Still Lives, puis la table de montage (une bande par film, longue comme sa durée).
   Chaque bande ouvre sa fiche (lien direct #film-…) ; le lecteur YouTube ou Vimeo ne se charge qu'au clic. */
import { html, brut } from '../../outils/gabarit.mjs';
import { minutage } from '../gabarits/oeuvre.mjs';
import { ruban } from '../gabarits/vivant.mjs';

export const page = { cle: 'films', fichier: 'films', imagePartage: 'films/still-lives-1280.webp' };

const lienService = (v) => (v.service === 'Vimeo' ? `https://vimeo.com/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`);

function fiche(c, f, max) {
  const v = f.video;
  const demander = c.url('a-propos', 'contact', `sujet=projection&oeuvre=${encodeURIComponent(f.titre)}`);
  return html`<div class="fiche" id="fiche-${f.id}" role="region" aria-label="${f.titre}" hidden>
  <div class="fiche-lecteur lecteur" data-lecteur="${v.integrable ? v.service.toLowerCase() : ''}" data-id="${v.id}" data-titre="${f.titre}">
    <div class="lecteur-affiche" data-visuel aria-hidden="true"><span class="lecteur-minutage">${minutage(f.secondes)}</span><span class="lecteur-titre">${f.titre}</span></div>
    ${v.integrable
      ? html`<button type="button" class="lecteur-jouer" data-lecteur-jouer><span class="lecteur-triangle" aria-hidden="true"></span><span>${c.t('films.fiche.jouer')}<span class="visuellement-cache"> : ${f.titre}</span></span></button>`
      : html`<p class="lecteur-prive">${c.t('films.fiche.prive')}</p>`}
  </div>
  <div class="fiche-texte">
    <p class="fiche-chargement">${v.integrable ? c.t('films.fiche.chargement', { service: v.service }) : ''}</p>
    <dl class="fiche-donnees">
      <div><dt>${c.t('films.fiche.production')}</dt><dd>${f.annee}</dd></div>
      <div><dt>${c.t('films.fiche.format')}</dt><dd>${c.loc(f.format)}</dd></div>
      <div><dt>${c.t('films.fiche.duree')}</dt><dd>${f.duree}${f.dureeAVerifier ? html` <span class="a-completer">${c.t('films.fiche.dureeAVerifier')}</span>` : ''}</dd></div>
      ${f.lieu ? html`<div><dt>${c.t('films.fiche.lieu')}</dt><dd>${c.loc(f.lieu)}</dd></div>` : ''}
      ${f.montre ? html`<div class="fiche-montre"><dt>${c.t('films.fiche.montre')}</dt><dd>${c.loc(f.montre)}</dd></div>` : ''}
    </dl>
    <p class="fiche-synopsis">${c.loc(f.synopsis)}</p>
    <p class="fiche-actions">
      <a class="bouton bouton--contour" href="${lienService(v)}" target="_blank" rel="noopener">${c.t('films.fiche.ouvrirService', { service: v.service })}</a>
      ${!v.integrable ? html`<a class="bouton" href="${demander}" data-libelle="${c.libelle('a-propos')}">${c.t('films.fiche.demander')}</a>` : ''}
      ${(f.autres || []).map((a) => html`<a class="lien-fleche" href="${lienService(a)}" target="_blank" rel="noopener">${c.loc(a.libelle)}</a>`)}
    </p>
  </div>
</div>`;
}

export default (c) => {
  const films = c.donnees.films;
  const sl = films.find((f) => f.id === 'still-lives');
  const max = Math.max(...films.map((f) => f.secondes));
  return html`
<section class="tete tete--films ecran" id="debut" data-grain data-projecteur>
  ${c.media({ nom: 'grok/montage', alt: '', cadrage: '60% 50%', classe: 'tete-fond', sizes: '100vw' })}
  <div class="tete-grille">
    <div class="tete-texte tete-texte--sombre">
      <p class="surtitre" data-anime="gsap">${c.t('films.tete.sous')}</p>
      <h1 class="tete-titre"><span data-anime="gsap" class="tete-ligne">${c.t('films.tete.titre')}</span></h1>
      <p class="tete-intro" data-anime="gsap">${c.t('films.tete.texte')}</p>
      <p class="tete-actions" data-anime="gsap"><a class="bouton" href="#film-${sl.id}" data-action-principale data-magnetique data-sans-transition>${c.t('films.tete.action')}</a></p>
      <p class="tete-info prix" data-info-cle data-anime="gsap">${c.t('films.tete.info')}</p>
    </div>
    <figure class="tete-film pellicule" data-anime="gsap">
      ${c.media({ nom: sl.image, alt: `${sl.titre}, ${sl.annee}`, classe: 'tete-film-media', sizes: '(max-width: 760px) 92vw, 46vw', priorite: true })}
      <figcaption><span class="etiquette-code">${sl.code}</span> ${sl.titre} · ${sl.annee} · ${sl.duree}</figcaption>
    </figure>
  </div>
</section>

${ruban(c, { id: 'ruban-films', style: 'pellicule', incline: 0, sens: 1, elements: films.map((f) => html`${f.titre} <span class="ruban-duree">${f.duree}</span>`) })}

<section class="table-montage" id="table" data-grain>
  ${c.media({ nom: 'grok/pellicule', alt: '', classe: 'table-montage-fond', cadrage: '50% 50%', sizes: '100vw' })}
  <div class="conteneur table-montage-tete">
    <h2 class="titre-section" data-decoupe>${c.t('films.table.titre')}</h2>
    <p><span class="aide-tactile">${c.t('films.table.texte')}</span><span class="aide-souris">${c.t('films.table.texteSouris')}</span></p>
    <p class="echelle" aria-hidden="true"><span class="echelle-ligne"><span class="echelle-trait" style="--part:${(60 / max).toFixed(4)}"></span><span>${c.t('films.table.echelle')}</span></span></p>
  </div>
  <ol class="bandes conteneur" aria-label="${c.s('films.table.region')}">
    ${films.map((f) => {
      const image = f.id === 'still-lives' ? 'laundry/houston' : f.image;
      return html`<li class="bande" id="film-${f.id}" style="--part:${(f.secondes / max).toFixed(4)}">
      <button type="button" class="bande-bouton" aria-expanded="false" aria-controls="fiche-${f.id}" data-bande data-duree="${minutage(f.secondes)}" data-duree-courte="${f.duree}">
        <span class="bande-annee">${f.annee}</span>
        <span class="bande-titre"><span class="etiquette-code">${f.code}</span>${f.cesure || f.titre}${f.prix ? html` <span class="bande-prix">Remi Platinum</span>` : ''}</span>
        <span class="bande-duree" data-bande-compteur>${f.duree}</span>
        <span class="bande-film" aria-hidden="true">
          ${image ? c.media({ nom: image, alt: '', classe: 'bande-image', sizes: '(max-width: 760px) 40vw, 18vw' }) : html`<span class="bande-image bande-image--code" data-visuel><span>${f.titre.replace(/\s+/g, "")}</span></span>`}
        </span>
      </button>
      ${fiche(c, f, max)}
    </li>`;
    })}
  </ol>
</section>

<section class="fin-films" id="fin">
  ${c.media({ nom: 'grok/faisceau', alt: c.s('films.fin.alt'), classe: 'fin-films-media', cadrage: '35% 50%', sizes: '100vw' })}
  <div class="conteneur fin-films-texte">
    <h2 class="titre-section" data-decoupe>${c.t('films.fin.titre')}</h2>
    <p>${c.t('films.fin.texte')}</p>
    <p>${c.lien('a-propos', { ancre: 'contact', params: 'sujet=projection', classe: 'bouton', texte: c.t('films.fin.action'), attrs: 'data-magnetique' })}</p>
  </div>
</section>
`;
};
