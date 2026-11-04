/* Voile en blocs, option d'un projet : si le voile contient [data-voile-blocs] (des rangées de blocs,
   chaque bloc avec data-r et data-c), le voile se monte bloc par bloc au départ, du bas vers le haut comme
   un mur, puis se démonte à l'arrivée ; sinon il glisse (comportement par défaut, dans transitions.js).
   Pendant le montage et le démontage (classes voile-monte et voile-demonte sur <html>), le voile lui-même
   est transparent et caché : seuls ses blocs se voient. La bande de la barre de défilement garde donc la
   couleur de la page, et ne prend celle du voile qu'une fois le mur entier. */
import { html } from './etat.js?v=2';

export const enBlocs = (v) => !!(v && v.querySelector('[data-voile-blocs]'));

const blocsDe = (v) => [...v.querySelectorAll('[data-voile-blocs] [data-r]')];
const rangs = (blocs) => 1 + Math.max(0, ...blocs.map((b) => +b.dataset.r));
/* Petit écart régulier, toujours le même pour un bloc donné : le mur n'a pas l'air mécanique. */
const ecart = (r, c) => ((r * 7 + c * 3) % 5) / 5;

function nettoyer(v) {
  v.getAnimations({ subtree: true }).forEach((a) => a.cancel());
}

/** Monte le mur (départ) : se résout quand tous les blocs sont posés et le nom de la page affiché. */
export function monter(v, duree = 450) {
  nettoyer(v);
  html.classList.remove('voile-leve', 'voile-demonte');
  html.classList.add('voile-monte');
  v.style.visibility = 'visible';
  v.style.transform = 'none';
  const blocs = blocsDe(v), R = rangs(blocs);
  /* Chaque bloc monte en accélérant et claque à sa place, sans la dépasser ni s'en approcher lentement :
     aucun jour ne traîne au bord de l'écran. */
  const poses = blocs.map((b) => {
    const r = +b.dataset.r, c = +b.dataset.c;
    const delai = ((R - 1 - r) * 0.085 + c * 0.022 + ecart(r, c) * 0.05) * duree;
    return b.animate([
      { transform: `translate3d(0, 110vh, 0) rotate(${(ecart(c, r) - 0.5) * 10}deg)` },
      { transform: 'none' },
    ], { duration: duree * 0.6, delay: delai, easing: 'cubic-bezier(.55,.05,.75,.3)', fill: 'both' });
  });
  const finis = Promise.all(poses.map((a) => a.finished)).catch(() => {}).then(() => {
    html.classList.remove('voile-monte');
  });
  const contenu = v.querySelector('.voile-contenu');
  const titre = contenu ? contenu.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 180, delay: duree * 0.95, fill: 'both' }).finished.catch(() => {}) : null;
  return Promise.all([finis, titre]);
}

/** Démonte le mur (arrivée, ou après un grand saut) : les blocs se détachent un à un, du bas vers le haut,
    glissent un peu et s'effacent. attente : les blocs restent en place ce temps-là, le temps que la page
    pose ses états de départ dessous. */
export function demonter(v, duree = 520, { attente = 0 } = {}) {
  nettoyer(v);
  html.classList.remove('voile-monte');
  html.classList.add('voile-demonte');
  v.style.visibility = 'visible';
  v.style.transform = 'none';
  const blocs = blocsDe(v), R = rangs(blocs);
  const animations = blocs.map((b) => {
    const r = +b.dataset.r, c = +b.dataset.c, e = ecart(r, c);
    const delai = attente + ((R - 1 - r) * 0.07 + e * 0.1) * duree;
    return b.animate([
      { transform: 'none', opacity: 1 },
      { transform: `translate3d(${(e - 0.5) * 40}px, 20vh, 0) rotate(${(e - 0.5) * 22}deg)`, opacity: 0 },
    ], { duration: duree * 0.7, delay: delai, easing: 'cubic-bezier(.45,0,.75,.5)', fill: 'both' });
  });
  const contenu = v.querySelector('.voile-contenu');
  if (contenu) animations.push(contenu.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, delay: attente + duree * 0.22, fill: 'both' }));
  return Promise.all(animations.map((a) => a.finished)).catch(() => {}).then(() => {
    nettoyer(v);
    v.style.visibility = '';
    v.style.transform = '';
    html.classList.add('voile-leve');
    html.classList.remove('voile-demonte');
  });
}

export { nettoyer as nettoyerVoile };
