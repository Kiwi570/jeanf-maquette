/* v2 — éléments vivants partagés par les pages : bandeaux défilants et compteurs.
   Un bandeau est décoratif (aria-hidden) : il reprend ce que la page dit déjà. Il défile avec la lecture
   (assets/js/vivant.js), s'arrête hors écran et en mode calme, et a toujours son bouton pause. */
import { html } from '../../outils/gabarit.mjs';

export function ruban(c, { id, elements, sens = -1, style = 'clair', incline = -1.5 }) {
  const lot = html`${elements.map((e) => html`<span class="ruban-element">${e}</span><span class="ruban-sep">✦</span>`)}`;
  return html`<div class="ruban-zone ruban-zone--${style}" style="--incline:${incline}deg">
  <div class="ruban ruban--${style}" id="${id}" data-ruban data-visuel data-sens="${sens}" aria-hidden="true">
    <div class="ruban-piste"><div class="ruban-lot">${lot}</div><div class="ruban-lot">${lot}</div></div>
  </div>
  <button type="button" class="ruban-pause" data-pause-pour="${id}" data-libelle-pause="${c.s('commun.ruban.pause')}" data-libelle-lecture="${c.s('commun.ruban.lecture')}"><span class="ruban-pause-icone" aria-hidden="true"></span><span data-libelle-bouton>${c.t('commun.ruban.pause')}</span><span class="visuellement-cache"> ${c.t('commun.ruban.libelle')}</span></button>
</div>`;
}

/** Chiffre qui compte jusqu'à sa valeur en arrivant à l'écran (la valeur finale est dans la page). */
export const compteur = (n) => `<span data-compteur="${n}">${n}</span>`;
