/* Éléments propres à JeanF, partagés par les pages : étiquettes, œuvres accrochées (avec volets
   fermé / ouvert), cartes du mur, film en pellicule. Les dimensions réelles des images donnent
   leurs proportions : une œuvre n'est jamais recadrée (object-fit: contain dans site.css). */
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { html, brut } from '../../outils/gabarit.mjs';
import { dimensions } from '../../outils/dimensions.mjs';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const cache = new Map();

/** Largeur et hauteur de l'image la plus grande produite pour ce nom. */
export function dims(nom) {
  if (cache.has(nom)) return cache.get(nom);
  const dossier = join(racine, 'assets/images', dirname(nom));
  const base = nom.split('/').pop();
  let r = { l: 4, h: 3 };
  if (existsSync(dossier)) {
    const ws = readdirSync(dossier).map((f) => f.match(new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.webp$`))).filter(Boolean).map((m) => +m[1]);
    if (ws.length) {
      const d = dimensions(join(dossier, `${base}-${Math.max(...ws)}.webp`));
      if (d) r = { l: d.largeur, h: d.hauteur };
    }
  }
  cache.set(nom, r);
  return r;
}
export const ratio = (nom) => { const d = dims(nom); return +(d.l / d.h).toFixed(4); };

export const titreDe = (c, o) => (typeof o.titre === 'string' ? o.titre : c.loc(o.titre));

/** Toutes les œuvres, avec leur série, dans l'ordre du mur. */
export function toutes(c) {
  return c.donnees.oeuvres.series.flatMap((s) => s.oeuvres.map((o) => ({ s, o })));
}
export function trouver(c, idSerie, idOeuvre) {
  const s = c.donnees.oeuvres.series.find((x) => x.id === idSerie);
  return { s, o: s && s.oeuvres.find((x) => x.id === idOeuvre) };
}

const fermee = (o) => o.images.find((i) => i.etat === 'ferme');
const ouverte = (o) => o.images.find((i) => i.etat === 'ouvert');
export const aVolets = (o) => !!(fermee(o) && ouverte(o));
const principale = (o) => ouverte(o) || o.images[0];

/** Dimensions sans coupure : « 230 × 140 cm » ne se sépare ni autour du ×, ni avant l'unité. */
export const dimsTexte = (d) => String(d).replace(/\s*×\s*/g, '\u202f×\u202f').replace(/(\d)\s+(cm|m)\b/g, '$1\u00a0$2');

/** Étiquette de musée, gabarit fixe : code de la démarche (s'il existe), titre, « année · dimensions »
   (ce qui manque est marqué « à compléter »), puis la technique quand on la demande. Un détail le dit. */
export function etiquette(c, s, o, { technique = false, classe = '', detail = false } = {}) {
  const code = o.film ? (c.donnees.films.find((f) => f.id === o.film) || {}).code || 'CM' : s.code;
  const annee = o.annee ? (typeof o.annee === 'string' ? o.annee : c.loc(o.annee)) : null;
  const dimensions = o.dimensions ? dimsTexte(c.loc(o.dimensions)) : null;
  const manque = (cle) => html`<span class="a-completer a-completer--etiquette">${c.t(cle)}</span>`;
  const ligne = o.film
    ? html`${[annee, c.loc(o.technique)].filter(Boolean).join(' · ')}`
    : annee && dimensions ? html`${annee} · ${dimensions}`
      : annee ? html`${annee} · ${manque('oeuvres.carte.dimsInconnues')}`
        : dimensions ? html`${manque('oeuvres.carte.anneeInconnue')} · ${dimensions}`
          : manque('oeuvres.carte.infosInconnues');
  return html`<p class="etiquette ${classe}" data-tampon>
  ${code ? html`<span class="etiquette-code" title="${c.donnees.oeuvres.codes.find((x) => x.code === code.replace(/\d+$/, ''))?.nom || ''}">${code}</span>` : ''}
  <span class="etiquette-texte"><span class="etiquette-titre">${titreDe(c, o)}</span>
  <span class="etiquette-ligne">${detail ? html`${c.t('oeuvres.carte.detail')} · ` : ''}${ligne}</span>${technique && !o.film && o.technique ? html`<span class="etiquette-ligne">${c.loc(o.technique)}</span>` : ''}</span>
</p>`;
}

/** Image d'une œuvre, jamais recadrée. */
export function image(c, im, alt, { sizes = '(max-width: 760px) 80vw, 40vw', priorite = false, classe = '' } = {}) {
  return c.media({ nom: im.nom, alt, cadrage: im.cadrage || '50% 50%', sizes, priorite, classe: `media--oeuvre ${classe}`, ratio: `${dims(im.nom).l} / ${dims(im.nom).h}` });
}

/** Œuvre accrochée : une image, ou deux (fermée puis ouverte) avec ses volets. */
export function accrochage(c, s, o, { sizes, priorite = false, idBouton = '', badge = '' } = {}) {
  const titre = titreDe(c, o);
  if (!aVolets(o)) {
    const im = principale(o);
    return html`<div class="accroche" style="--ratio:${ratio(im.nom)}">${image(c, im, titre, { sizes, priorite })}${badge}</div>`;
  }
  const f = fermee(o), ov = ouverte(o);
  const rf = ratio(f.nom), ro = ratio(ov.nom);
  return html`<div class="accroche volets" data-volets data-etat="ferme" style="--ratio:${ro};--ratio-ferme:${rf}">
  <div class="volet volet--ouvert">${image(c, ov, `${titre}, ${c.s('oeuvres.carte.ouvert')}`, { sizes, priorite })}</div>
  <div class="volet volet--ferme" data-ephemere>${image(c, f, `${titre}, ${c.s('oeuvres.carte.ferme')}`, { sizes, priorite })}</div>
</div>
<button type="button" class="volets-bouton" data-volets-bouton aria-pressed="false"${idBouton ? brut(` id="${idBouton}"`) : ''} data-libelle-ouvrir="${c.s('oeuvres.carte.ouvrir')}" data-libelle-fermer="${c.s('oeuvres.carte.fermer')}"><span class="volets-icone" aria-hidden="true"></span><span data-libelle-bouton>${c.t('oeuvres.carte.ouvrir')}</span><span class="visuellement-cache"> : ${titre}</span></button>`;
}

/** Carte du mur : œuvre accrochée et son étiquette. Lien vers la visionneuse (page Œuvres) ou le film. */
export function carte(c, s, o, { page = 'oeuvres', sizes = '(max-width: 760px) 78vw, 34vw', id = true } = {}) {
  const h = o.h ? Math.min(1, Math.max(0.62, o.h / 230 + 0.45)) : 0.86;
  const im = principale(o);
  const lien = o.film
    ? c.lien('films', { ancre: `film-${o.film}`, classe: 'carte-lien', texte: html`<span class="visuellement-cache">${c.s('oeuvres.carte.film')} : ${titreDe(c, o)}</span>` })
    : page === 'oeuvres'
      ? html`<a class="carte-lien" href="#oeuvre-${o.id}" data-visionneuse="${o.id}" data-sans-transition><span class="visuellement-cache">${c.s('oeuvres.carte.agrandir')} : ${titreDe(c, o)}</span></a>`
      : c.lien('oeuvres', { ancre: `oeuvre-${o.id}`, classe: 'carte-lien', texte: html`<span class="visuellement-cache">${c.s('oeuvres.carte.agrandir')} : ${titreDe(c, o)}</span>` });
  return html`<article class="carte-oeuvre${o.film ? ' carte-oeuvre--film' : ''}" ${id ? brut(`id="oeuvre-${o.id}" `) : ''}data-serie="${s.id}" data-code="${o.film ? 'CM' : s.code || ''}" data-titre="${titreDe(c, o)}" style="--ratio:${ratio(im.nom)};--echelle:${h.toFixed(3)}">
  <div class="carte-oeuvre-mur">
    ${accrochage(c, s, o, { sizes, badge: o.images.length > 1 && !aVolets(o) ? html`<p class="carte-oeuvre-nb">${c.s('oeuvres.carte.photos', { n: o.images.length })}</p>` : '' })}
    ${lien}
  </div>
  ${etiquette(c, s, o)}
</article>`;
}

/** Durée « 12’08 » en minutage « 00:12:08:00 ». */
export const minutage = (secondes) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(Math.floor(secondes / 3600))}:${p(Math.floor(secondes / 60) % 60)}:${p(secondes % 60)}:00`;
};
