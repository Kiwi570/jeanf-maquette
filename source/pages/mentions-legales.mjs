/* Mentions légales : fiche récapitulative à compléter, éditeur, hébergeur, crédits (illustrations générées),
   confidentialité. Barre de lecture et sommaire qui suit la lecture. */
import { html } from '../../outils/gabarit.mjs';

export const page = { cle: 'mentions-legales', fichier: 'mentions-legales', imagePartage: 'grok/platre-1168.webp', sansAction: true };

const sections = ['fiche', 'editeur', 'hebergeur', 'credits', 'confidentialite'];

/* « à compléter » en pastille ; la fiche récapitulative en liste, une information par ligne. */
const pastilles = (c, texte) => {
  const m = c.s('commun.aCompleter');
  return texte.split(m).map((p, i) => (i ? html`<span class="a-completer">${m}</span>${p}` : html`${p}`));
};
const contenu = (c, s) => {
  const t = c.s(`mentions.${s}.texte`);
  if (s !== 'fiche') return html`<p>${pastilles(c, t)}</p>`;
  return html`<ul class="fiche-liste">${t.split(/(?<=\.)\s+/).map((x) => html`<li>${pastilles(c, x.replace(/\.$/, ''))}</li>`)}</ul>`;
};

export default (c) => html`
<div data-barre-lecture aria-hidden="true"></div>
<section class="page-tete page-tete--court conteneur" id="debut">
  <div>
    <h1 class="tete-titre">${c.t('mentions.titre')}</h1>
    <nav data-sommaire aria-label="${c.s('commun.sommaire')}"><ul>${sections.map((s) => html`<li><a href="#${s}">${c.t(`mentions.${s}.titre`)}</a></li>`)}</ul></nav>
  </div>
  ${c.media({ nom: 'grok/platre', alt: c.s('mentions.alt'), priorite: true, classe: 'page-tete-media', sizes: '(max-width: 760px) 100vw, 40vw' })}
</section>
<div class="texte-long conteneur" data-sans-visuel>
  ${sections.map((s) => html`<section id="${s}" data-sans-visuel><h2>${c.t(`mentions.${s}.titre`)}</h2>${contenu(c, s)}</section>`)}
</div>
`;
