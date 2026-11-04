/* JeanF v2 — un mur vivant. Effets ajoutés par-dessus site.js, tous coupés en mode calme :
   1. Lumière de galerie qui suit la souris, posée derrière le contenu : elle éclaire le plâtre, jamais les œuvres.
   2. Cadres qui s'inclinent légèrement sous la souris, et qui se balancent sur leur clou quand le mur défile.
   3. Curseur qui dit ce qu'on peut faire (voir, lire, glisser…), boutons magnétiques.
   4. Bandeaux qui défilent avec la lecture (plus vite quand on défile, dans le sens du défilement), avec un bouton pause.
   5. Étiquettes tapées à la machine en arrivant à l'écran.
   6. Pied de page : le nom en blocs se monte quand on y arrive ; un bloc touché saute, un bloc cliqué tombe et revient.
   7. Films : grain de pellicule et lumière de projecteur derrière le contenu, amorce 3-2-1 avant la lecture.
   Aucune mesure de mise en page pendant le défilement : les positions sont lues à l'arrêt, ou une seule fois. */
import { boucle, etat } from './socle/index.js?v=2';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const souris = matchMedia('(hover: hover) and (pointer: fine)').matches;
const sansEntree = () => etat.calme || etat.arrivee === 'retour' || document.documentElement.classList.contains('secours');
const textes = (() => { try { return JSON.parse(document.body.dataset.textesVivants || '{}'); } catch { return {}; } })();

/* Défilement en cours : on ne lit aucune position tant que la page bouge. */
let dernierDefilement = 0;
addEventListener('scroll', () => { dernierDefilement = performance.now(); }, { passive: true });
const defile = () => performance.now() - dernierDefilement < 650;

/* ——— 1. Lumière de galerie ——— */
export function initLumiere() {
  if (!souris || !gsap || etat.calme) return;
  const l = document.createElement('div');
  l.className = 'lumiere';
  l.setAttribute('aria-hidden', 'true');
  l.setAttribute('data-audit-ignorer', '');
  document.body.prepend(l);
  const x = gsap.quickTo(l, 'x', { duration: 0.9, ease: 'power3' });
  const y = gsap.quickTo(l, 'y', { duration: 0.9, ease: 'power3' });
  let vu = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!vu) { vu = true; gsap.set(l, { x: e.clientX, y: e.clientY }); }
    l.classList.add('lumiere--allumee');
    x(e.clientX); y(e.clientY);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => l.classList.remove('lumiere--allumee'));
}

/* ——— 2a. Cadres qui s'inclinent sous la souris (l'œuvre entière bouge comme un cadre, sans être déformée) ——— */
export function initCadres() {
  if (!souris || !gsap || etat.calme) return;
  let actif = null, r = null, rx = null, ry = null;
  const lacher = () => {
    if (!actif) return;
    gsap.to(actif, { rotationX: 0, rotationY: 0, duration: 1.2, ease: 'elastic.out(1, .45)', overwrite: 'auto' });
    actif = null; r = null;
  };
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const zone = e.target.closest && e.target.closest('.carte-oeuvre-mur, .hero-oeuvre, .tete-oeuvre');
    const a = zone && $('.accroche', zone);
    if (a === actif) return;
    lacher();
    if (!a || defile()) return;
    actif = a; r = null;
    gsap.set(a, { transformPerspective: 1000 });
    rx = gsap.quickTo(a, 'rotationX', { duration: 0.6, ease: 'power3' });
    ry = gsap.quickTo(a, 'rotationY', { duration: 0.6, ease: 'power3' });
  }, { passive: true });
  document.addEventListener('pointermove', (e) => {
    if (!actif || e.pointerType !== 'mouse') return;
    if (defile()) { lacher(); return; }
    if (!r) r = actif.getBoundingClientRect();
    const px = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
    const py = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
    ry(px * 3); rx(-py * 2);
  }, { passive: true });
  addEventListener('scroll', lacher, { passive: true });
}

/* ——— 2b. Balancement : les cadres oscillent sur leur clou quand le mur accélère, puis se calment ——— */
export function balanceur(piste, { position = () => Number(gsap.getProperty(piste, 'x')) || 0 } = {}) {
  const rien = () => {};
  rien.detruire = rien;
  if (!gsap || etat.calme || !piste) return rien;
  const o = { a: 0 };
  let tl = null, visee = 0, pose = 0;
  /* La rotation est posée sur chaque cadre (propriété rotate, séparée de l'inclinaison au survol), et
     seulement sur les cadres à l'écran : leurs positions dans le mur sont lues une fois, jamais en défilant.
     Un cadre large bouge moins qu'un cadre haut, comme un vrai tableau sur son clou. */
  const cadres = $$('.carte-oeuvre .accroche', piste).map((el) => {
    const ratio = parseFloat(getComputedStyle(el).getPropertyValue('--ratio')) || 1;
    return { el, g: 0, d: 0, a: 0, k: Math.max(0.45, Math.min(1.2, 1 / Math.sqrt(ratio))) };
  });
  const mesurer = () => {
    const base = piste.getBoundingClientRect().left;
    cadres.forEach((c) => { const r = c.el.getBoundingClientRect(); c.g = r.left - base; c.d = r.right - base; });
  };
  mesurer();
  if (ST) ST.addEventListener('refresh', mesurer);
  const poser = () => {
    if (Math.abs(o.a - pose) < 0.02) return;
    pose = o.a;
    const x = position(), w = window.innerWidth;
    for (const c of cadres) {
      const vu = c.d + x > -200 && c.g + x < w + 200;
      /* Un cadre à l'écran a sa propre couche : il tourne sans que l'image soit repeinte. */
      if (vu !== c.vu) { c.vu = vu; c.el.style.willChange = vu ? 'transform' : ''; }
      const a = vu ? o.a * c.k : 0;
      if (Math.abs(a - c.a) < 0.02) continue;
      c.a = a;
      c.el.style.rotate = `${a.toFixed(2)}deg`;
    }
  };
  const balancer = (vitesse) => {
    const cible = Math.max(-1.8, Math.min(1.8, -vitesse / 600));
    if (tl && Math.abs(cible - visee) < 0.2) return;
    visee = cible;
    if (tl) tl.kill();
    tl = gsap.timeline({ onUpdate: poser })
      .to(o, { a: cible, duration: 0.35, ease: 'power2.out' })
      .to(o, { a: 0, duration: 1.6, ease: 'elastic.out(1, .32)', onStart: () => { visee = 0; } }, '+=0.06');
  };
  balancer.detruire = () => {
    if (ST) ST.removeEventListener('refresh', mesurer);
    if (tl) tl.kill();
    cadres.forEach((c) => { c.el.style.rotate = ''; c.el.style.willChange = ''; });
  };
  return balancer;
}
/* Mur en défilement natif (téléphone, mode sans épinglage) : la vitesse vient du défilement horizontal. */
export function balancementNatif(piste) {
  let x0 = piste.scrollLeft, t0 = performance.now();
  /* La position lue dans l'écouteur sert aussi au balancement : une seule lecture par événement. */
  const balancer = balanceur(piste, { position: () => -x0 });
  const ecouter = () => {
    const t = performance.now(), x = piste.scrollLeft;
    const v = ((x - x0) / Math.max(8, t - t0)) * 1000;
    x0 = x; t0 = t;
    balancer(v);
  };
  piste.addEventListener('scroll', ecouter, { passive: true });
  return () => { piste.removeEventListener('scroll', ecouter); balancer.detruire(); };
}

/* ——— 3a. Curseur qui dit ce qu'on peut faire ——— */
export function initCurseurContexte() {
  if (!souris || etat.calme) return;
  document.addEventListener('pointerover', (e) => {
    const c = $('.curseur');
    if (!c || !e.target.closest) return;
    const t = e.target;
    let texte = '';
    /* Sur une œuvre, le curseur devient un anneau et son libellé se décale : il ne cache jamais l'œuvre.
       Sur la loupe de la visionneuse, il s'efface : la loupe fait déjà office de curseur. */
    let anneau = false;
    const bande = t.closest('.bande-bouton');
    if (bande) texte = `${textes.fiche} · ${bande.dataset.dureeCourte || ''}`;
    else if (t.closest('[data-lecteur-jouer]')) texte = `▶ ${textes.lire}`;
    else if (t.closest('.carte-oeuvre--film')) { texte = textes.film; anneau = true; }
    else if (t.closest('.carte-oeuvre, .hero-oeuvre .accroche, .tete-oeuvre .accroche')) { texte = textes.voir; anneau = true; }
    else if (t.closest('.pied-blocs')) texte = textes.pousser;
    else if (t.closest('.mur-piste')) texte = textes.defiler;
    c.classList.toggle('curseur--loupe', !!t.closest('img[data-loupe]'));
    c.classList.toggle('curseur--anneau', anneau);
    if (texte) c.dataset.texte = texte; else delete c.dataset.texte;
  }, { passive: true });
}

/* ——— 3b. Boutons magnétiques : ils suivent un peu la souris, puis reviennent avec un rebond ——— */
export function initMagnetique() {
  if (!souris || !gsap || etat.calme) return;
  $$('[data-magnetique], .bouton, .filtre, .volets-bouton').forEach((b) => {
    if (b.closest('[data-menu], [data-voile], .visionneuse, .voir-mur')) return;
    let r = null;
    const x = gsap.quickTo(b, 'x', { duration: 0.35, ease: 'power3' });
    const y = gsap.quickTo(b, 'y', { duration: 0.35, ease: 'power3' });
    b.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || defile()) return;
      if (!r) r = b.getBoundingClientRect();
      x(((e.clientX - r.left) / r.width - 0.5) * 12);
      y(((e.clientY - r.top) / r.height - 0.5) * 9);
    });
    b.addEventListener('pointerleave', () => { r = null; gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, .4)', overwrite: 'auto' }); });
  });
}

/* ——— 4. Bandeaux qui défilent avec la lecture ——— */
export function initRubans() {
  $$('[data-ruban]').forEach((ruban) => {
    const piste = $('.ruban-piste', ruban), lot = $('.ruban-lot', ruban);
    if (!piste || !lot || !gsap || etat.calme) return;
    let largeur = lot.offsetWidth;
    new ResizeObserver(() => { largeur = lot.offsetWidth; }).observe(lot);
    const sens = Number(ruban.dataset.sens || -1);
    /* Vitesse signée et lissée : le bandeau accélère avec la lecture et change de sens en douceur. */
    let x = 0, y0 = window.scrollY, signe = 1, v = 42;
    boucle(ruban, (dt) => {
      const y = window.scrollY, dy = Math.max(-60, Math.min(60, y - y0));
      y0 = y;
      if (dy) signe = dy > 0 ? 1 : -1;
      v += (signe * (42 + Math.abs(dy) * 16) - v) * Math.min(1, dt * 4);
      x += sens * v * dt;
      if (largeur) { while (x <= -largeur) x += largeur; while (x > 0) x -= largeur; }
      piste.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    });
  });
}

/* ——— 5. Étiquettes tapées à la machine ——— */
export function initFrappe() {
  if (etat.calme || sansEntree() || !('IntersectionObserver' in window)) return;
  const els = $$('.surtitre, .pan-num, .repere-type, .pied-titre, .mur-glisser, .codes-titre')
    .filter((el) => !el.closest('.tete, .hero, [data-ouverture], [data-menu], .visionneuse, .voir-mur') && el.textContent.trim().length > 1);
  if (!els.length) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, n = Math.max(4, Math.min(40, el.textContent.trim().length));
    el.classList.remove('a-taper');
    el.classList.add('en-frappe');
    const a = el.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: n * 34, easing: `steps(${n}, end)`, fill: 'both' });
    a.finished.then(() => { el.classList.remove('en-frappe'); a.cancel(); }).catch(() => {});
  }), { rootMargin: '0px 0px -8% 0px' });
  /* Seuls les éléments encore sous l'écran se cachent : rien de visible ne disparaît. */
  const bas = window.innerHeight;
  els.forEach((el) => { if (el.getBoundingClientRect().top > bas) { el.classList.add('a-taper'); io.observe(el); } });
}

/* ——— 5b. Agenda : le filet de chaque année se trace quand elle arrive à l'écran ——— */
export function initFilets() {
  const annees = $$('.agenda-annee');
  if (!annees.length) return;
  if (sansEntree() || !('IntersectionObserver' in window)) { annees.forEach((a) => a.classList.add('trace')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('trace'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  annees.forEach((a) => io.observe(a));
}

/* ——— 6. Le nom en blocs dans le pied de page ——— */
export function initPiedBlocs() {
  const zone = $('.pied-blocs');
  if (!zone || !gsap) return;
  const blocs = $$('.pied-bloc', zone);
  if (!sansEntree() && ST) {
    gsap.set(blocs, { y: -220, opacity: 0 });
    ST.create({ trigger: zone, start: 'top 92%', once: true, onEnter: () => {
      gsap.to(blocs, { y: 0, opacity: 1, duration: 0.5, ease: 'bounce.out', stagger: { each: 0.012 }, onComplete: () => gsap.set(blocs, { clearProps: 'transform,opacity' }) });
    } });
  }
  if (etat.calme) return;
  const tomber = (b) => {
    if (!b || gsap.isTweening(b)) return;
    gsap.timeline({ onComplete: () => gsap.set(b, { clearProps: 'transform,opacity' }) })
      .to(b, { y: 160, rotation: gsap.utils.random(-70, 70), opacity: 0, duration: 0.7, ease: 'power2.in' })
      .set(b, { y: -180, rotation: 0 })
      .to(b, { y: 0, opacity: 1, duration: 0.7, ease: 'bounce.out' }, '+=0.8');
  };
  zone.addEventListener('click', (e) => {
    /* Au doigt, les blocs sont trop petits pour être visés : un toucher fait tomber quelques blocs au hasard. */
    if (!souris) { gsap.utils.shuffle(blocs.slice()).slice(0, 5).forEach((b, i) => gsap.delayedCall(i * 0.06, () => tomber(b))); return; }
    tomber(e.target.closest && e.target.closest('.pied-bloc'));
  });
}

/* Boucles brèves : une animation continue s'arrête après 5 s, et repart 5 s quand on fait défiler la page
   (au-delà de 5 s de mouvement, il faudrait un bouton pause). */
export function breve(controle) {
  if (!controle || etat.calme) return controle;
  let fin = setTimeout(() => controle.pause(true), 5000);
  addEventListener('scroll', () => {
    controle.pause(false);
    clearTimeout(fin);
    fin = setTimeout(() => controle.pause(true), 5000);
  }, { passive: true });
  return controle;
}

/* Juste au-dessus du décor de la section, sous tout son contenu. */
const poserDerriere = (zone, el) => { const fond = zone.querySelector(':scope > .tete-fond, :scope > .table-montage-fond'); if (fond) fond.after(el); else zone.prepend(el); };

/* ——— 7a. Grain de pellicule, derrière le contenu (les photogrammes restent intacts) ———
   Le bruit est dessiné une seule fois ; douze fois par seconde, la couche est juste déplacée (aucun redessin). */
let tuileGrain = '';
function tuile() {
  if (tuileGrain) return tuileGrain;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  const image = ctx.createImageData(256, 256), d = image.data;
  for (let i = 0; i < d.length; i += 4) { const v = (Math.random() * 255) | 0; d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255; }
  ctx.putImageData(image, 0, 0);
  tuileGrain = c.toDataURL('image/png');
  return tuileGrain;
}
export function initGrain() {
  $$('[data-grain]').forEach((zone) => {
    const url = tuile();
    if (!url) return;
    const g = document.createElement('div');
    g.className = 'grain';
    g.setAttribute('aria-hidden', 'true');
    g.setAttribute('data-audit-ignorer', '');
    g.style.backgroundImage = `url(${url})`;
    poserDerriere(zone, g);
    let attente = 1;
    breve(boucle(g, (dt) => {
      attente += dt;
      if (dt && attente < 1 / 12) return;
      attente = 0;
      g.style.transform = `translate3d(${(Math.random() * 256) | 0}px, ${(Math.random() * 256) | 0}px, 0)`;
    }));
  });
}

/* ——— 7b. Lumière de projecteur qui vacille sur le décor des Films ——— */
export function initProjecteur() {
  $$('[data-projecteur]').forEach((zone) => {
    const p = document.createElement('div');
    p.className = 'projecteur';
    p.setAttribute('aria-hidden', 'true');
    p.setAttribute('data-audit-ignorer', '');
    poserDerriere(zone, p);
    breve(boucle(p, (dt, t) => {
      const v = 0.8 + Math.sin(t * 13) * 0.04 + Math.sin(t * 31.7) * 0.03 + (Math.random() < 0.03 ? -0.06 : 0);
      p.style.opacity = v.toFixed(3);
    }));
  });
}

/* ——— 7c. Amorce 3-2-1 avant que le lecteur se charge ———
   Une seule amorce à la fois : une nouvelle annule la précédente, dont le lecteur ne se charge pas. */
let amorceEnCours = null;
export function amorce(lecteur) {
  if (amorceEnCours) amorceEnCours();
  if (!gsap || etat.calme) return Promise.resolve(true);
  const a = document.createElement('div');
  a.className = 'amorce';
  a.setAttribute('aria-hidden', 'true');
  a.innerHTML = '<span class="amorce-croix"></span><span class="amorce-cercle"></span><span class="amorce-chiffre">3</span>';
  lecteur.appendChild(a);
  const chiffre = $('.amorce-chiffre', a), cercle = $('.amorce-cercle', a);
  return new Promise((fin) => {
    const tl = gsap.timeline({ onComplete: () => { amorceEnCours = null; a.remove(); fin(true); } });
    amorceEnCours = () => { amorceEnCours = null; tl.kill(); a.remove(); fin(false); };
    ['3', '2', '1'].forEach((n, i) => {
      tl.call(() => { chiffre.textContent = n; }, null, i * 0.42)
        .fromTo(cercle, { '--angle': '0deg' }, { '--angle': '360deg', duration: 0.42, ease: 'none' }, i * 0.42)
        .fromTo(chiffre, { scale: 1.25, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }, i * 0.42);
    });
  });
}

/* ——— Apparitions après un filtre : les pièces gardées arrivent en cascade ——— */
export function cascade(elements) {
  if (!gsap || etat.calme || !elements.length) return;
  gsap.fromTo(elements, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.035, overwrite: 'auto', clearProps: 'transform,opacity' });
}
