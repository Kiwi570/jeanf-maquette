/* Page 404 : un pan de mur manquant. Une seule version (langue par défaut). */
import { html } from '../../outils/gabarit.mjs';

export const page = { cle: '404', fichier: '404', langues: ['fr'], partage: false };

export default (c) => html`
<section class="tete tete--introuvable ecran" id="debut">
  ${c.media({ nom: 'grok/pan-manquant', alt: c.s('introuvable.alt'), cadrage: '30% 45%', classe: 'tete-fond', sizes: '100vw', priorite: true })}
  <div class="tete-grille">
    <div class="tete-texte tete-texte--carte">
      <p class="surtitre" data-anime="gsap">404</p>
      <h1 class="tete-titre"><span data-anime="gsap" class="tete-ligne">${c.t('introuvable.titre')}</span></h1>
      <p class="tete-intro" data-anime="gsap">${c.t('introuvable.texte')}</p>
      <p class="tete-actions" data-anime="gsap">${c.lien('accueil', { classe: 'bouton', texte: c.t('introuvable.retour'), attrs: 'data-action-principale' })} ${c.lien('oeuvres', { classe: 'bouton bouton--contour', texte: c.t('introuvable.oeuvres') })}</p>
    </div>
  </div>
</section>
`;
