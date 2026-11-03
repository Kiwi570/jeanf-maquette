/* JeanF — effets propres au projet (direction « Le Mur »). Le socle gère l'ouverture, les transitions,
   l'en-tête, le menu, le mode calme, les boucles et les mesures : ce fichier ne contient que ce qui est
   propre à JeanF.
   1. Intro : des pans de mur tombent et forment le nom, l'étiquette se tape, le mur coulisse.
   2. Banc de montage : murs épinglés à défilement horizontal, coupes entre séries, minutage dans l'en-tête.
   3. Volets : les triptyques passent de la vraie photo fermée à la vraie photo ouverte.
   4. Étiquettes tamponnées, mots « stück » qui s'emboîtent, route Laundry qui se trace.
   5. Visionneuse avec loupe, « Voir au mur » à l'échelle, filtres gardés dans l'adresse.
   6. Table de montage des films : fiches, lecteur chargé au clic, minutage au survol.
   7. Lumière de vitrail derrière Dérive-Dérêve (canvas, s'arrête hors écran, image fixe en mode calme). */
import { demarrer, boucle, etat, quand, rafraichir, aller, allerAncre, bloquerDefilement, debloquerDefilement, suivre, lacher } from './socle/index.js?v=1';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const souris = matchMedia('(hover: hover) and (pointer: fine)').matches;
const essayer = (nom, fn) => { try { fn(); } catch (err) { console.error('[jeanf]', nom, err); } };
/* Retour arrière ou avant, mode calme : tout est déjà dans son état final, rien ne se cache pour réapparaître. */
const sansEntree = () => etat.calme || etat.arrivee === 'retour' || html.classList.contains('secours');
const deuxChiffres = (n) => String(Math.floor(n)).padStart(2, '0');
const minutage = (s) => `${deuxChiffres(s / 3600)}:${deuxChiffres((s / 60) % 60)}:${deuxChiffres(s % 60)}:${deuxChiffres((s % 1) * 25)}`;

/* ——— Volets fermé / ouvert ——— */
function etatVolets(v, ouvert, { instant = false } = {}) {
  const o = $('.volet--ouvert', v), f = $('.volet--ferme', v);
  const bouton = v.nextElementSibling && v.nextElementSibling.matches('[data-volets-bouton]') ? v.nextElementSibling : null;
  if (bouton) {
    bouton.setAttribute('aria-pressed', String(ouvert));
    $('[data-libelle-bouton]', bouton).textContent = ouvert ? bouton.dataset.libelleFermer : bouton.dataset.libelleOuvrir;
  }
  if (!gsap || instant || etat.calme) {
    v.dataset.etat = ouvert ? 'ouvert' : 'ferme';
    if (gsap) gsap.set([o, f], { clearProps: 'clipPath,opacity,visibility,transform' });
    return;
  }
  gsap.killTweensOf([o, f]);
  if (ouvert) {
    gsap.set(f, { visibility: 'visible' });
    gsap.timeline({ onComplete: () => { v.dataset.etat = 'ouvert'; gsap.set([o, f], { clearProps: 'clipPath,opacity,visibility,transform' }); } })
      .fromTo(o, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut' }, 0)
      .fromTo(f, { opacity: 1, scaleX: 1 }, { opacity: 0, scaleX: 0.55, duration: 0.55, ease: 'power2.in' }, 0);
  } else {
    gsap.set(f, { visibility: 'visible' });
    gsap.timeline({ onComplete: () => { v.dataset.etat = 'ferme'; gsap.set([o, f], { clearProps: 'clipPath,opacity,visibility,transform' }); } })
      .fromTo(o, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 50% 0% 50%)', duration: 0.8, ease: 'power3.inOut' }, 0)
      .fromTo(f, { opacity: 0, scaleX: 0.55 }, { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power2.out' }, 0.25);
  }
}
const ouvrirVolets = (v, o) => { if (v && v.dataset.etat !== 'ouvert' && !v.dataset.vu) { v.dataset.vu = '1'; etatVolets(v, true, o); } };

function initVolets() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-volets-bouton]');
    if (!b) return;
    const v = b.previousElementSibling;
    if (!v || !v.matches('[data-volets]')) return;
    v.dataset.vu = '1';
    etatVolets(v, v.dataset.etat !== 'ouvert');
  });
}

/* ——— Minutage du mur dans l'en-tête : la page est un montage, un écran = 4 secondes ——— */
function initMinutage() {
  const el = $('[data-minutage]');
  if (!el || !ST || etat.calme) return;
  let total = 0;
  ST.create({
    start: 0, end: 'max',
    onRefresh: () => { total = (ST.maxScroll(window) / Math.max(1, window.innerHeight)) * 4; },
    onUpdate: (s) => { el.textContent = minutage(s.progress * total); },
  });
}

/* ——— Banc de montage : mur épinglé à défilement horizontal ——— */
/* Le mur défile 1 / 0,6 fois plus vite que la molette : 34 pièces tiennent en moins d'écrans. */
const VITESSE_MUR = 0.6;
function initMurs() {
  $$('.mur').forEach((section) => {
    const piste = $('.mur-piste', section);
    const barre = $('.mur-progres span', section);
    if (!piste) return;
    const cartesVolets = () => $$('.carte-oeuvre [data-volets]', piste);
    if (!gsap || !ST || etat.calme) { cartesVolets().forEach((v) => etatVolets(v, true, { instant: true })); return; }
    ST.matchMedia({
      '(min-width: 900px) and (min-height: 520px)': () => {
        piste.removeAttribute('tabindex');
        const distance = () => Math.max(0, piste.scrollWidth - window.innerWidth);
        const tween = gsap.fromTo(piste, { x: 0 }, {
          x: () => -distance(), ease: 'none',
          scrollTrigger: {
            trigger: section, start: 'top top', end: () => '+=' + Math.round(distance() * VITESSE_MUR), pin: true, anticipatePin: 1, scrub: 0.5, invalidateOnRefresh: true,
            onUpdate: (s) => { if (barre) barre.style.transform = `scaleX(${s.progress.toFixed(4)})`; },
          },
        });
        section._tween = tween;
        /* Les triptyques ouvrent leurs volets en arrivant vers le centre. */
        cartesVolets().forEach((v) => {
          ST.create({ trigger: v.closest('.carte-oeuvre'), containerAnimation: tween, start: 'left 62%', onEnter: () => ouvrirVolets(v) });
        });
        /* Clavier : la carte qui reçoit le focus est amenée au centre de l'écran. */
        const auFocus = (e) => {
          const carte = e.target.closest && e.target.closest('.carte-oeuvre, .mur-fin, .pan-tete');
          if (!carte || !tween.scrollTrigger) return;
          const st = tween.scrollTrigger, d = distance();
          if (!d) return;
          let x = 0, el = carte;
          while (el && el !== piste) { x += el.offsetLeft; el = el.offsetParent; }
          const cible = Math.min(d, Math.max(0, x - (window.innerWidth - carte.offsetWidth) / 2));
          aller(st.start + (cible / d) * (st.end - st.start), { instant: true });
          /* Épinglage appliqué tout de suite : l'élément qui reçoit le focus est à l'écran dès cette image. */
          ST.update();
        };
        piste.addEventListener('focusin', auFocus);
        return () => { piste.setAttribute('tabindex', '0'); piste.removeEventListener('focusin', auFocus); section._tween = null; };
      },
      '(max-width: 899px), (max-height: 519px)': () => {
        const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { ouvrirVolets($('[data-volets]', e.target)); io.unobserve(e.target); } }), { root: piste, threshold: 0.6 });
        cartesVolets().forEach((v) => io.observe(v.closest('.carte-oeuvre')));
        piste.addEventListener('scroll', () => { if (barre) barre.style.transform = `scaleX(${(piste.scrollLeft / Math.max(1, piste.scrollWidth - piste.clientWidth)).toFixed(4)})`; }, { passive: true });
        return () => io.disconnect();
      },
    });
  });
}

/* ——— Étiquettes tamponnées (transition CSS déclenchée par une classe) ——— */
function initTampons() {
  const els = $$('[data-tampon]');
  if (sansEntree() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('tamponne')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('tamponne'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((e) => io.observe(e));
}

/* ——— Titres découpés en lignes, qui montent ——— */
function initTitres() {
  const titres = $$('[data-decoupe]');
  if (!gsap || !window.SplitText || sansEntree()) { titres.forEach((t) => t.classList.add('decoupe-prete')); return; }
  titres.forEach((t) => {
    window.SplitText.create(t, {
      /* reduceWhiteSpace: false garde les espaces insécables fines (« intéresse ? ») que SplitText changerait en espaces. */
      type: 'lines', mask: 'lines', linesClass: 'ligne', autoSplit: true, reduceWhiteSpace: false,
      onSplit(self) {
        t.classList.add('decoupe-prete');
        return gsap.fromTo(self.lines, { yPercent: 108 }, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.08, scrollTrigger: { trigger: t, start: 'top 88%', once: true } });
      },
    });
  });
}

/* ——— Manifeste : les mots s'emboîtent sur « stück » ——— */
function initStuck() {
  const bloc = $('[data-stuck]');
  if (!bloc) return;
  if (!gsap || !ST || sansEntree()) { bloc.classList.add('joue'); return; }
  const avant = $$('.stuck-avant', bloc), fin = $$('.stuck-fin', bloc), glose = $$('.stuck-glose', bloc);
  gsap.set(avant, { xPercent: -40, opacity: 0 });
  gsap.set(fin, { xPercent: 60, opacity: 0 });
  gsap.set(glose, { opacity: 0 });
  ST.create({ trigger: bloc, start: 'top 80%', once: true, onEnter: () => {
    bloc.classList.add('joue');
    gsap.timeline()
      .fromTo(avant, { xPercent: -40, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power3.out' }, 0)
      .fromTo(fin, { xPercent: 60, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'back.out(1.6)' }, 0.12)
      .fromTo(glose, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.09 }, 0.5);
  } });
}

/* ——— Laundry : la route des résidences se trace ——— */
function initRoute() {
  const carte = $('.laundry-carte');
  if (!carte || !gsap || !ST || sansEntree()) return;
  const traces = $$('[data-trace]', carte), points = $$('.carte-point', carte), etiquettes = $$('.carte-etiquette', carte);
  traces.forEach((p) => { const l = p.getTotalLength(); p.dataset.l = l; if (!p.classList.contains('carte-route--avortee')) gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); else gsap.set(p, { opacity: 0 }); });
  gsap.set(points, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
  gsap.set(etiquettes, { opacity: 0 });
  ST.create({ trigger: carte, start: 'top 75%', once: true, onEnter: () => {
    const tl = gsap.timeline();
    tl.fromTo(points, { scale: 0 }, { scale: 1, duration: 0.4, stagger: 0.12, ease: 'back.out(2)' }, 0)
      .fromTo(etiquettes, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.12 }, 0.1);
    let t = 0.2;
    traces.forEach((p) => {
      if (p.classList.contains('carte-route--avortee')) tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.5 }, t);
      else tl.fromTo(p, { strokeDashoffset: +p.dataset.l }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, t);
      t += 0.7;
    });
    tl.eventCallback('onComplete', () => traces.forEach((p) => gsap.set(p, { clearProps: 'strokeDasharray,strokeDashoffset,opacity' })));
  } });
}

/* ——— Images qui bougent au défilement (agrandies de leur déplacement : on n'en voit jamais le bord) ——— */
function initParallaxe() {
  if (!gsap || !ST || etat.calme) return;
  $$('.contact-accueil-media img, .fin-oeuvres-media img, .fin-films-media img, .agenda-media img, .manifeste-media img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: img.closest('section') || img, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ——— Boutons magnétiques et curseur qui affiche le code de la pièce ——— */
function initMagnetique() {
  if (!souris || !gsap || etat.calme) return;
  $$('[data-magnetique]').forEach((b) => {
    let r = null;
    const x = gsap.quickTo(b, 'x', { duration: 0.35, ease: 'power3' }), y = gsap.quickTo(b, 'y', { duration: 0.35, ease: 'power3' });
    b.addEventListener('pointerenter', () => { r = b.getBoundingClientRect(); });
    b.addEventListener('pointermove', (e) => { if (!r || e.pointerType !== 'mouse') return; x(((e.clientX - r.left) / r.width - 0.5) * 10); y(((e.clientY - r.top) / r.height - 0.5) * 8); });
    b.addEventListener('pointerleave', () => { x(0); y(0); r = null; });
  });
}
function initCurseurTexte() {
  if (!souris || etat.calme) return;
  const texte = $('[data-curseur]') ? 'curseurVoir' : null;
  if (!texte) return;
  document.addEventListener('pointerover', (e) => {
    const c = $('.curseur');
    if (!c) return;
    const carte = e.target.closest && e.target.closest('.carte-oeuvre[data-code], .bande-bouton');
    if (carte && carte.dataset.code) c.dataset.texte = carte.dataset.code;
    else if (carte && carte.matches('.bande-bouton')) c.dataset.texte = carte.dataset.duree || '';
    else delete c.dataset.texte;
  }, { passive: true });
}

/* ——— Fenêtres plein écran du projet (visionneuse, voir au mur) : focus gardé, Échap, bande suivie ——— */
function fenetre(el, { onFermer } = {}) {
  let retour = null;
  const focusables = () => $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', el).filter((x) => x.offsetParent !== null);
  const clavier = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); fermer(); }
    if (e.key === 'Tab') {
      const f = focusables(); if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  function ouvrir(depuis) {
    retour = depuis || document.activeElement;
    el.hidden = false;
    el.inert = false;
    bloquerDefilement(el.id);
    suivre(el);
    el.addEventListener('keydown', clavier);
    requestAnimationFrame(() => { const f = focusables()[0]; f && f.focus({ preventScroll: true }); });
  }
  function fermer() {
    if (el.hidden) return;
    el.hidden = true;
    el.inert = true;
    debloquerDefilement(el.id);
    lacher(el);
    el.removeEventListener('keydown', clavier);
    onFermer && onFermer();
    if (retour && retour.focus) retour.focus({ preventScroll: true });
  }
  return { ouvrir, fermer, estOuverte: () => !el.hidden };
}

/* ——— Visionneuse des œuvres, loupe, lien direct #oeuvre-… ——— */
function initVisionneuse() {
  const boite = $('[data-visionneuse-boite]');
  if (!boite) return;
  const compte = $('.visionneuse-compte', boite);
  let courante = null, index = 0;
  const f = fenetre(boite, { onFermer: () => { history.replaceState(null, '', location.pathname + location.search); courante = null; cacherLoupe(); } });
  const images = () => $$('.visionneuse-image', courante);
  function montrer(i) {
    const ims = images();
    index = (i + ims.length) % ims.length;
    ims.forEach((fig, k) => {
      fig.hidden = k !== index;
      const img = $('img', fig);
      if (k === index && img.dataset.src && !img.src) img.src = img.dataset.src;
    });
    const suiv = ims[(index + 1) % ims.length];
    const s = suiv && $('img', suiv); if (s && s.dataset.src && !s.src) s.src = s.dataset.src;
    compte.textContent = (compte.dataset.compteModele || '{i} / {n}').replace('{i}', index + 1).replace('{n}', ims.length);
  }
  function ouvrir(id, depuis) {
    const art = $(`.visionneuse-oeuvre[data-oeuvre="${CSS.escape(id)}"]`, boite);
    if (!art) return false;
    $$('.visionneuse-oeuvre', boite).forEach((a) => (a.hidden = a !== art));
    courante = art;
    montrer(0);
    f.ouvrir(depuis);
    history.replaceState(null, '', `${location.pathname}${location.search}#oeuvre-${id}`);
    return true;
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('[data-visionneuse]');
    if (a) { e.preventDefault(); ouvrir(a.dataset.visionneuse, a); return; }
    if (!f.estOuverte()) return;
    if (e.target.closest('[data-visionneuse-fermer]')) f.fermer();
    else if (e.target.closest('[data-visionneuse-prec]')) montrer(index - 1);
    else if (e.target.closest('[data-visionneuse-suiv]')) montrer(index + 1);
  });
  boite.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') montrer(index - 1);
    if (e.key === 'ArrowRight') montrer(index + 1);
  });
  /* Glissement au doigt. */
  let x0 = null;
  boite.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' && e.target.closest('.visionneuse-scene')) x0 = e.clientX; });
  boite.addEventListener('pointerup', (e) => { if (x0 === null) return; const d = e.clientX - x0; x0 = null; if (Math.abs(d) > 50) montrer(index + (d < 0 ? 1 : -1)); });
  /* Loupe (souris) ; au toucher, un toucher agrandit l'image. */
  const loupe = document.createElement('div');
  loupe.className = 'loupe'; loupe.setAttribute('aria-hidden', 'true'); loupe.setAttribute('data-audit-ignorer', '');
  boite.appendChild(loupe);
  function cacherLoupe() { loupe.style.display = 'none'; }
  if (souris) {
    boite.addEventListener('pointermove', (e) => {
      const img = e.target.closest && e.target.closest('img[data-loupe]');
      if (!img || e.pointerType !== 'mouse' || !img.complete) { cacherLoupe(); return; }
      const r = img.getBoundingClientRect(), k = 2.6;
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      loupe.style.display = 'block';
      loupe.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
      loupe.style.backgroundSize = `${r.width * k}px ${r.height * k}px`;
      loupe.style.backgroundPosition = `${-(px * r.width * k - 110)}px ${-(py * r.height * k - 110)}px`;
      loupe.style.transform = `translate3d(${e.clientX - 110}px, ${e.clientY - 110}px, 0)`;
    });
    boite.addEventListener('pointerleave', cacherLoupe);
  } else {
    boite.addEventListener('click', (e) => { const img = e.target.closest && e.target.closest('img[data-loupe]'); if (img) img.classList.toggle('zoom'); });
  }
  /* Lien direct vers une œuvre. */
  const depuisAdresse = () => { const m = location.hash.match(/^#oeuvre-(.+)$/); if (m) ouvrir(decodeURIComponent(m[1])); };
  quand('pret', depuisAdresse);
  window.addEventListener('hashchange', depuisAdresse);
  boite._ouvrir = ouvrir;
}

/* ——— Voir au mur : l'œuvre posée à l'échelle au-dessus d'un banc d'environ 120 cm ——— */
const SCENE = {
  paysage: { banc: 0.649, haut: 784 / 1168, bancHaut: 0.348 },
  portrait: { banc: 0.797, haut: 1168 / 784, bancHaut: 0.268 },
};
function initVoirMur() {
  const boite = $('[data-voir-mur]');
  if (!boite) return;
  const scene = $('[data-voir-mur-scene]', boite), fond = $('.voir-mur-fond', boite), fondImg = $('img', fond), oeuvre = $('[data-voir-mur-image]', boite), titre = $('[data-voir-mur-titre]', boite);
  const f = fenetre(boite);
  let l = 0, h = 0;
  function placer() {
    if (!l || !h) return;
    const W = scene.clientWidth, H = scene.clientHeight;
    const s = W / H < 0.75 ? SCENE.portrait : SCENE.paysage;
    const imgCm = 120 / s.banc, imgHautCm = imgCm * s.haut, bancCm = imgHautCm * s.bancHaut;
    const basCm = Math.max(bancCm + 20, 150 - h / 2);
    const besoinH = basCm + h + 25, besoinL = Math.max(l + 40, imgCm * 0.7);
    const ppc = Math.min(H / besoinH, W / besoinL);
    fond.style.width = `${imgCm * ppc}px`;
    oeuvre.style.width = `${l * ppc}px`;
    oeuvre.style.height = `${h * ppc}px`;
    oeuvre.style.bottom = `${basCm * ppc}px`;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-voir-mur-ouvrir]');
    if (b) {
      const art = b.closest('.visionneuse-oeuvre');
      l = +art.dataset.l; h = +art.dataset.h;
      const img = $('.visionneuse-image:not([hidden]) img', art) || $('img', art);
      oeuvre.src = img.currentSrc || img.src || img.dataset.src;
      oeuvre.alt = img.alt;
      titre.textContent = $('.etiquette-titre', art).textContent;
      if (fondImg.dataset.src && !fondImg.src) { $$('source', fond).forEach((s) => (s.srcset = s.dataset.srcset)); fondImg.src = fondImg.dataset.src; }
      f.ouvrir(b);
      requestAnimationFrame(placer);
      return;
    }
    if (f.estOuverte() && e.target.closest('[data-voir-mur-fermer]')) f.fermer();
  });
  window.addEventListener('resize', () => { if (f.estOuverte()) placer(); }, { passive: true });
}

/* ——— Filtres (œuvres par série, agenda par type), gardés dans l'adresse ——— */
function initFiltres({ groupe, param, appliquer }) {
  const g = $(groupe);
  if (!g) return;
  const boutons = $$('[data-filtre]', g);
  const choisir = (v, { pousser = true } = {}) => {
    if (!boutons.some((b) => b.dataset.filtre === v)) v = 'tous';
    boutons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtre === v)));
    appliquer(v, { depuisAdresse: !pousser });
    if (pousser) {
      const u = new URL(location.href);
      if (v === 'tous') u.searchParams.delete(param); else u.searchParams.set(param, v);
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    }
    rafraichir();
  };
  g.addEventListener('click', (e) => { const b = e.target.closest('[data-filtre]'); if (b) choisir(b.dataset.filtre); });
  const initial = new URLSearchParams(location.search).get(param);
  if (initial) choisir(initial, { pousser: false });
}
function initFiltresOeuvres() {
  const section = $('.mur--complet');
  initFiltres({
    groupe: '[data-filtres]', param: 'serie',
    appliquer: (v, { depuisAdresse }) => {
      if (!section) return;
      /* Filtre lu dans l'adresse au chargement : la page ne bouge pas (l'intro repart du haut). */
      const avant = !depuisAdresse && window.scrollY > (section.offsetTop || 0) + window.innerHeight;
      $$('.pan', section).forEach((p) => (p.hidden = v !== 'tous' && p.dataset.serie !== v));
      const coupes = $$('.pan .coupe', section);
      coupes.forEach((c) => (c.hidden = v !== 'tous'));
      const piste = $('.mur-piste', section);
      if (piste) piste.scrollLeft = 0;
      /* La galerie a raccourci : retour au début du mur si on était plus loin. */
      if (avant) requestAnimationFrame(() => requestAnimationFrame(() => aller(section, { instant: true })));
    },
  });
}
function initFiltresAgenda() {
  initFiltres({
    groupe: '[data-filtres-agenda]', param: 'type',
    appliquer: (v) => {
      let total = 0;
      $$('.agenda-annee').forEach((a) => {
        let n = 0;
        $$('.agenda-date', a).forEach((d) => { const ok = v === 'tous' || d.dataset.type === v; d.hidden = !ok; if (ok) n++; });
        a.hidden = !n; total += n;
      });
      const vide = $('[data-agenda-vide]'); if (vide) vide.hidden = total > 0;
    },
  });
}

/* ——— Films : fiches, lecteur au clic, minutage au survol ——— */
function initFilms() {
  const bandes = $$('[data-bande]');
  if (!bandes.length) return;
  const basculer = (b, ouvert) => {
    const fiche = document.getElementById(b.getAttribute('aria-controls'));
    if (!fiche) return;
    b.setAttribute('aria-expanded', String(ouvert));
    fiche.hidden = !ouvert;
    if (!ouvert) $$('iframe', fiche).forEach((i) => i.remove());
    rafraichir();
  };
  bandes.forEach((b) => {
    b.addEventListener('click', () => basculer(b, b.getAttribute('aria-expanded') !== 'true'));
    const compteur = $('[data-bande-compteur]', b);
    if (!gsap || etat.calme || !compteur) return;
    const final = compteur.textContent;
    const [m, s] = (b.dataset.duree || '00:00:00:00').split(':').slice(1, 3).map(Number);
    const total = m * 60 + s;
    const jouer = () => {
      const o = { t: 0 };
      gsap.fromTo(o, { t: 0 }, { t: total, duration: 0.7, ease: 'power2.out', onUpdate: () => { const v = Math.round(o.t); compteur.textContent = `${Math.floor(v / 60)}’${String(v % 60).padStart(2, '0')}`; }, onComplete: () => { compteur.textContent = final; } });
    };
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') jouer(); });
    b.addEventListener('focus', jouer);
  });
  /* Liens vers une fiche (#film-…) : la fiche s'ouvre avant que la page défile jusqu'à elle. */
  const ouvrirDepuis = (hash) => {
    const m = (hash || '').match(/^#film-(.+)$/);
    if (!m) return;
    const b = $(`#film-${CSS.escape(decodeURIComponent(m[1]))} [data-bande]`);
    if (b && b.getAttribute('aria-expanded') !== 'true') basculer(b, true);
  };
  document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[href*="#film-"]'); if (a && new URL(a.href).pathname === location.pathname) ouvrirDepuis(new URL(a.href).hash); }, true);
  quand('pret', () => { if (/^#film-/.test(location.hash)) { ouvrirDepuis(location.hash); requestAnimationFrame(() => allerAncre(location.hash, { pousser: false })); } });
  /* Lecteur : YouTube (sans cookies) ou Vimeo, chargé seulement au clic. */
  document.addEventListener('click', (e) => {
    const bouton = e.target.closest && e.target.closest('[data-lecteur-jouer]');
    if (!bouton) return;
    const l = bouton.closest('[data-lecteur]');
    $$('[data-lecteur] iframe').forEach((i) => i.remove());
    const i = document.createElement('iframe');
    i.src = l.dataset.lecteur === 'vimeo' ? `https://player.vimeo.com/video/${l.dataset.id}?autoplay=1&dnt=1` : `https://www.youtube-nocookie.com/embed/${l.dataset.id}?autoplay=1&rel=0`;
    i.title = l.dataset.titre;
    i.allow = 'autoplay; fullscreen; picture-in-picture';
    i.allowFullscreen = true;
    l.appendChild(i);
    i.focus();
  });
}

/* ——— Lumière de vitrail derrière Dérive-Dérêve ——— */
function initVitrail() {
  const canvas = $('[data-vitrail]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const couleurs = ['36, 92, 170', '52, 140, 120', '205, 150, 60', '70, 120, 200', '150, 60, 50'];
  const taches = couleurs.map((c, i) => ({ c, x: 0.15 + i * 0.18, y: 0.3 + (i % 2) * 0.35, r: 0.22 + (i % 3) * 0.05, v: 0.04 + i * 0.012 }));
  let W = 0, H = 0;
  const taille = () => { const r = canvas.parentElement.getBoundingClientRect(); W = canvas.width = Math.max(1, Math.round(r.width / 2)); H = canvas.height = Math.max(1, Math.round(r.height / 2)); };
  taille();
  new ResizeObserver(taille).observe(canvas.parentElement);
  boucle(canvas, (dt, t) => {
    ctx.clearRect(0, 0, W, H);
    taches.forEach((p, i) => {
      const x = (p.x + Math.sin(t * p.v * 6 + i) * 0.06) * W, y = (p.y + Math.cos(t * p.v * 5 + i * 2) * 0.08) * H, r = p.r * Math.max(W, H);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${p.c}, .22)`); g.addColorStop(1, `rgba(${p.c}, 0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
  }, { lourde: true });
}

/* ——— Ouverture ——— */
const elementsArrivee = () => $$('.hero [data-anime="gsap"], .tete [data-anime="gsap"]');

function arriveeContenu(tl, debut) {
  const nom = $('.hero-nom'), lignes = $$('.tete-ligne');
  const autres = elementsArrivee().filter((e) => e !== nom && !e.classList.contains('tete-ligne') && !e.matches('.hero-oeuvre, .tete-oeuvre, .tete-film'));
  const oeuvre = $('.hero-oeuvre, .tete-oeuvre, .tete-film');
  if (nom) tl.fromTo(nom, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power4.out' }, debut);
  if (lignes.length) tl.fromTo(lignes, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power4.out', stagger: 0.08 }, debut);
  if (autres.length) tl.fromTo(autres, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.06 }, debut + 0.12);
  if (oeuvre) tl.fromTo(oeuvre, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, debut + 0.05);
  return tl;
}

function ouvrirVoletsTete() {
  const v = $('.hero-oeuvre [data-volets], .tete-oeuvre [data-volets]');
  if (v) setTimeout(() => ouvrirVolets(v), 350);
}

demarrer({
  preparer() {
    essayer('volets', initVolets);
    essayer('minutage', initMinutage);
    essayer('murs', initMurs);
    essayer('tampons', initTampons);
    essayer('titres', initTitres);
    essayer('stuck', initStuck);
    essayer('route', initRoute);
    essayer('parallaxe', initParallaxe);
    essayer('magnetique', initMagnetique);
    essayer('curseur', initCurseurTexte);
    essayer('visionneuse', initVisionneuse);
    essayer('voir-mur', initVoirMur);
    essayer('filtres', initFiltresOeuvres);
    essayer('agenda', initFiltresAgenda);
    essayer('films', initFilms);
    essayer('vitrail', initVitrail);
    /* Sécurité : un titre jamais découpé ne reste pas caché. */
    quand('pret', ({ mode }) => {
      $$('[data-decoupe]').forEach((t) => t.classList.add('decoupe-prete'));
      if (mode === 'jouee' || mode === 'voile') ouvrirVoletsTete();
    });
  },
  /* Intro complète, environ 2,2 s : joints, pans qui tombent et forment « JeanF », étiquette tapée,
     minutage, puis le mur s'efface en glissant à peine vers la gauche et découvre la page. */
  jouer() {
    if (!gsap) return null;
    const panneau = $('.ouverture-panneau');
    const blocs = $$('.ouverture-blocs .bloc');
    const compteur = $('[data-intro-minutage]');
    const t = { s: 0 };
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.ouverture-joints i:nth-child(-n+2)', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.inOut', stagger: 0.06 }, 0)
      .fromTo('.ouverture-joints i:nth-child(n+3)', { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power2.inOut', stagger: 0.05 }, 0.05)
      .fromTo(blocs, { y: () => -window.innerHeight * 1.2 }, { y: 0, duration: 0.42, ease: 'power4.in', stagger: { each: 0.0105 } }, 0.15)
      .fromTo('.ouverture-etiquette', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'steps(16)' }, 1.02)
      .fromTo(t, { s: 0 }, { s: 1.64, duration: 0.75, ease: 'none', onUpdate: () => { if (compteur) compteur.textContent = minutage(t.s); } }, 0.9)
      .fromTo(panneau, { opacity: 1, x: 0 }, { opacity: 0, x: () => -window.innerWidth * 0.06, duration: 0.55, ease: 'power2.inOut' }, 1.6);
    arriveeContenu(tl, 1.78);
    return tl;
  },
  /* État final (retour arrière, mode calme, secours) : tout est en place, volets ouverts, route tracée. */
  etatFinal() {
    if (gsap) {
      gsap.set(elementsArrivee(), { clearProps: 'transform,opacity' });
      /* Seulement ce que GSAP a posé : les étiquettes de la carte gardent leur position (style left/top du HTML). */
      gsap.set($$('.stuck-avant, .stuck-fin, .stuck-glose'), { clearProps: 'transform,opacity' });
      gsap.set($$('.carte-point'), { clearProps: 'transform,transformOrigin,transformBox' });
      gsap.set($$('.carte-etiquette'), { clearProps: 'opacity' });
      gsap.set($$('[data-trace]'), { clearProps: 'strokeDasharray,strokeDashoffset,opacity' });
    }
    $$('[data-tampon]').forEach((e) => e.classList.add('tamponne'));
    $$('[data-decoupe]').forEach((t) => t.classList.add('decoupe-prete'));
    $$('.hero-oeuvre [data-volets], .tete-oeuvre [data-volets]').forEach((v) => { v.dataset.vu = '1'; etatVolets(v, true, { instant: true }); });
    if (etat.calme) $$('[data-volets]').forEach((v) => etatVolets(v, true, { instant: true }));
  },
  /* Arrivée par un lien interne : le premier écran se met en place pendant que le voile se retire. */
  arrivee() {
    if (!gsap) return;
    arriveeContenu(gsap.timeline(), 0.1);
  },
});
