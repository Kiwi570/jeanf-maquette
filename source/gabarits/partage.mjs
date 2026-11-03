/* Image de partage 1200×630 de chaque page : fond de plâtre, logo, accroche, nom, œuvre ou photo du lieu
   posée sans recadrage. outils/images-partage.mjs photographie ces pages (assets/partage/<page>-<langue>.jpg). */
import { html, brut } from '../../outils/gabarit.mjs';

export function page(c) {
  const cle = c.page.cle;
  const image = c.page.imagePartage || c.site.imagePartage;
  return html`<!doctype html>
<html lang="${c.l}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/css/socle.css"><link rel="stylesheet" href="/assets/css/site.css">
<style>${brut(`:root{--fond:${c.site.couleurs.fond};--texte:${c.site.couleurs.texte}}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--fond);color:var(--texte)}
.carte{display:grid;grid-template-columns:560px 1fr;width:1200px;height:630px;background:repeating-linear-gradient(90deg,transparent 0 299px,rgba(22,21,20,.12) 299px 300px)}
.carte-texte{display:flex;flex-direction:column;justify-content:space-between;padding:56px}
.carte-texte img{width:72px;height:72px}
.carte-titre{font-family:var(--police-titres);font-stretch:64%;font-weight:800;font-size:92px;line-height:.9;margin:0;text-wrap:balance}
.carte-nom{font-family:var(--police-mono);font-size:22px;margin:0;display:flex;gap:0}
.carte-nom span{padding:.35em .7em;background:#161514;color:#e4e0d8}.carte-nom span+span{background:#a62f19}
.carte-image{margin:48px 48px 48px 0;background:center/contain no-repeat;filter:drop-shadow(0 18px 22px rgba(22,21,20,.35))}`)}</style>
</head><body>
<div class="carte">
  <div class="carte-texte">
    <img src="/assets/images/logo.svg" alt="">
    <p class="carte-titre">${c.t(`pages.${cle}.accroche`)}</p>
    <p class="carte-nom"><span>JeanF Jans</span><span>${c.t('commun.signature')}</span></p>
  </div>
  <div class="carte-image" style="background-image:url('/assets/images/${image}')"></div>
</div>
</body></html>`;
}
