/* Accueil : l'ouverture (Cantico delle creature qui s'ouvre), le manifeste Mauerstücke, le mur des pièces
   phares, Laundry et sa route, les films, Gare aux Rumeurs, les derniers repères, le contact. */
import { html, brut } from '../../outils/gabarit.mjs';
import { accrochage, etiquette, carte, trouver, titreDe, toutes } from '../gabarits/oeuvre.mjs';
import { ruban } from '../gabarits/vivant.mjs';

export const page = { cle: 'accueil', fichier: 'index', imagePartage: 'oeuvres/tr-cantico-ouvert-1280.webp' };

/* Carte des résidences : projection simple, avec une coupure de l'Atlantique (repère « coupe »). */
const X = (lon) => (lon < -40 ? 70 : 260 + (lon + 5) * 17.5);
const Y = (lat) => 60 + (56 - lat) * 16.43;
const POSITIONS = { houston: 'droite', 'le-caire': 'gauche', naples: 'droite', tourinnes: 'gauche', minsk: 'gauche', igualada: 'gauche' };

function carteLaundry(c, residences) {
  const pts = residences.map((r) => ({ r, x: X(r.lon), y: Y(r.lat) }));
  const p = Object.fromEntries(pts.map((q) => [q.r.id, q]));
  const seg = (a, b, h) => `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${((a.x + b.x) / 2).toFixed(1)} ${(Math.min(a.y, b.y) - h).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  const route = [seg(p.houston, p['le-caire'], 547), seg(p['le-caire'], p.naples, 60), seg(p.naples, p.tourinnes, 50)].join(' ');
  const avortee = seg(p.tourinnes, p.minsk, 40);
  const retour = seg(p.minsk, p.igualada, 70);
  const lignes = [0, 10, 20, 30].map((lon) => html`<line x1="${X(lon)}" y1="40" x2="${X(lon)}" y2="540" class="graticule"/>`);
  const paralleles = [30, 40, 50].map((lat) => html`<line x1="230" y1="${Y(lat)}" x2="990" y2="${Y(lat)}" class="graticule"/>`);
  return html`<figure class="laundry-carte" data-visuel>
  <div class="carte-cadre">
    <svg viewBox="0 0 1000 560" role="img" aria-label="${c.s('accueil.laundry.carteAlt')}" preserveAspectRatio="xMidYMid meet">
      ${lignes}${paralleles}
      <line x1="70" y1="40" x2="70" y2="540" class="graticule"/>
      <g class="carte-coupe"><line x1="150" y1="40" x2="170" y2="540"/><line x1="166" y1="40" x2="186" y2="540"/></g>
      <path d="${brut(route)}" class="carte-route" data-trace/>
      <path d="${brut(avortee)}" class="carte-route carte-route--avortee" data-trace/>
      <path d="${brut(retour)}" class="carte-route" data-trace/>
      ${pts.map((q) => html`<g class="carte-point${q.r.statut === 'avortee' ? ' carte-point--avorte' : ''}" style="--i:${pts.indexOf(q)}"><circle class="carte-pouls" cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="9"/><circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="9"/><circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="3.5" class="carte-coeur"/></g>`)}
    </svg>
    ${pts.map((q) => html`<a class="carte-etiquette carte-etiquette--${POSITIONS[q.r.id]}" href="#laundry-${q.r.id}" data-repere data-sans-transition style="left:${(q.x / 10).toFixed(2)}%;top:${(q.y / 5.6).toFixed(2)}%"><span class="carte-num">${q.r.num}</span><span class="carte-ville">${c.loc(q.r.ville)}</span></a>`)}
  </div>
  <figcaption>${c.t('accueil.laundry.carteTitre')}<span class="carte-legende-villes"> · ${residences.map((r) => `${r.num} ${c.loc(r.ville)}`).join(' · ')}</span><br><span class="carte-legende-coupe" aria-hidden="true"></span>${c.t('accueil.laundry.carteCoupe')}</figcaption>
</figure>`;
}

export default (c) => {
  const { s: sC, o: cantico } = trouver(c, 'retables', 'cantico');
  const phares = c.donnees.oeuvres.phares.map(([s, o]) => trouver(c, s, o));
  const films = c.donnees.films;
  const sl = films.find((f) => f.id === 'still-lives');
  const autres = ['streitquartett', 'road-map', 'o-mensch'].map((id) => films.find((f) => f.id === id));
  const dates = c.donnees.agenda.dates.filter((d) => d.mois).slice(0, 5);
  const typeNom = (id) => c.donnees.agenda.types.find((t) => t.id === id).un;
  return html`
<section class="hero ecran" id="debut">
  ${c.media({ nom: 'grok/accueil-mur', alt: '', cadrage: '50% 40%', cadrageMobile: '50% 40%', classe: 'hero-fond', sizes: '100vw', priorite: true })}
  <div class="hero-grille">
    <div class="hero-texte">
      <h1 class="hero-titre"><span class="hero-nom" data-anime="gsap">${brut([...'JeanF'].map((l) => `<span class="hero-lettre">${l}</span>`).join(''))}</span><span class="visuellement-cache">, ${c.t('commun.signature')}</span></h1>
      <p class="hero-etiquette" data-anime="gsap"><span class="etiquette-pastille" aria-hidden="true"></span><span>${c.t('accueil.hero.etiquette')}</span></p>
      <p class="hero-intro" data-anime="gsap">${c.t('accueil.hero.texte')}</p>
      <p class="hero-actions" data-anime="gsap">
        ${c.lien('oeuvres', { classe: 'bouton', texte: c.t('accueil.hero.action'), attrs: 'data-action-principale data-magnetique' })}
        ${c.lien('films', { classe: 'bouton bouton--contour', texte: c.t('accueil.hero.action2') })}
      </p>
      <p class="hero-info" data-info-cle data-anime="gsap">${c.t('accueil.hero.info')}</p>
    </div>
    <figure class="hero-oeuvre" data-anime="gsap">
      ${accrochage(c, sC, cantico, { sizes: '(max-width: 760px) 70vw, 34vw', priorite: true, idBouton: 'volets-hero' })}
      <figcaption>${etiquette(c, sC, cantico, { technique: true })}</figcaption>
    </figure>
  </div>
</section>

${ruban(c, { id: 'ruban-codes', style: 'rouge', incline: -1.4, elements: c.donnees.oeuvres.codes.map((k) => html`<b class="ruban-code">${k.code}</b> ${c.loc(k.nom)}`) })}

<section class="manifeste" id="manifeste">
  <div class="conteneur manifeste-grille">
    <div class="manifeste-cote">
      <h2 class="titre-section" data-decoupe>${c.t('accueil.manifeste.titre')}</h2>
      <p class="surtitre">${c.t('accueil.manifeste.sous')}</p>
      <div class="stuck" data-stuck>
        ${[['Müll', 'stück', 'mull'], ['Kurz', 'stück', 'kurz'], ['Skulp', 'tück', 'skulp'], ['Bild', 'stück', 'bild']].map(([a, b, k]) => html`<p class="stuck-mot" lang="de"><span class="stuck-avant">${a}</span><span class="stuck-fin${b === 'tück' ? ' stuck-fin--court' : ''}">${b}</span><span class="stuck-glose" lang="${c.l}">${c.t(`accueil.manifeste.${k}`)}</span></p>`)}
      </div>
      ${c.media({ nom: 'grok/joints', alt: c.s('accueil.manifeste.alt'), classe: 'manifeste-media', sizes: '(max-width: 760px) 100vw, 30vw' })}
    </div>
    <div class="manifeste-texte">
      <p class="manifeste-p manifeste-p--grand" data-anime>${c.t('accueil.manifeste.p1')}</p>
      <p class="manifeste-p" data-anime>${c.t('accueil.manifeste.p2')}</p>
      <p class="manifeste-p" data-anime>${c.t('accueil.manifeste.p3')}</p>
      <p class="manifeste-note" data-anime>${c.t('accueil.manifeste.note')}<br>${c.t('accueil.manifeste.credit')}</p>
      <div class="codes" data-anime>
        <p class="codes-titre">${c.t('commun.codes')}</p>
        <ul class="codes-liste">${c.donnees.oeuvres.codes.map((k) => html`<li><span class="etiquette-code">${k.code}</span> ${k.nom}</li>`)}</ul>
        <p class="codes-texte">${c.t('accueil.manifeste.codesTexte')}</p>
      </div>
    </div>
  </div>
</section>

<section class="mur ecran epingle" id="mur" data-entete-cache>
  <div class="mur-tete conteneur">
    <h2 class="titre-section">${c.t('accueil.mur.titre')}</h2>
    <p>${c.t('accueil.mur.texte')}</p>
  </div>
  <div class="piste mur-piste" data-galerie tabindex="0" role="region" aria-label="${c.s('accueil.mur.region')}">
    ${phares.map(({ s, o }, i) => html`${i && phares[i - 1].s.id !== s.id ? html`<span class="coupe" aria-hidden="true"><i></i></span>` : ''}${carte(c, s, o, { page: 'accueil', id: false })}`)}
    <div class="mur-fin">${c.lien('oeuvres', { classe: 'bouton', texte: c.t('accueil.mur.action') })}</div>
  </div>
  <div class="mur-bas conteneur">
    <div class="mur-progres" aria-hidden="true"><span></span></div>
    <p class="mur-glisser">${c.t('accueil.mur.glisser')}</p>
  </div>
</section>

<section class="chiffres conteneur" id="chiffres" aria-labelledby="chiffres-titre">
  <h2 class="visuellement-cache" id="chiffres-titre">${c.t('accueil.chiffres.titre')}</h2>
  <ul class="chiffres-liste" data-visuel>
    ${[[toutes(c).length, 'pieces'], [c.donnees.films.length, 'films'], [c.donnees.laundry.length, 'residences'], [c.donnees.agenda.dates.length, 'dates']].map(([n, k], i) => html`<li class="chiffre" style="--i:${i}"><span class="chiffre-nombre" data-compteur="${n}">${n}</span><span class="chiffre-libelle">${c.t(`accueil.chiffres.${k}`)}</span></li>`)}
  </ul>
</section>

<section class="laundry" id="laundry">
  <div class="conteneur laundry-tete">
    <h2 class="titre-section" data-decoupe>${c.t('accueil.laundry.titre')}</h2>
    <blockquote class="laundry-citation" data-anime><p>${c.t('accueil.laundry.citation')}</p><footer>JeanF Jans</footer></blockquote>
    <p class="laundry-texte" data-anime>${c.t('accueil.laundry.texte')}</p>
  </div>
  <div class="conteneur laundry-grille">
    ${carteLaundry(c, c.donnees.laundry)}
    <ol class="laundry-liste">
      ${c.donnees.laundry.map((r) => html`<li class="residence residence--${r.statut}" id="laundry-${r.id}" data-anime>
        ${r.image ? c.media({ nom: r.image, alt: c.loc(r.alt), classe: 'residence-media', sizes: '(max-width: 760px) 40vw, 12vw' }) : html`<div class="residence-media residence-vide" data-visuel aria-hidden="true"><span class="residence-vide-num">${r.num}</span><span class="residence-vide-texte">${c.s('accueil.laundry.sansPhoto')}</span></div>`}
        <div class="residence-texte">
          <p class="residence-num"><span class="etiquette-code">L${['I', 'II', 'III', 'IV', 'V', 'VI'].indexOf(r.num) + 1}</span> <span class="insecable">Laundry ${r.num}</span> · ${c.loc(r.ville)} · ${r.annee}${r.statut === 'avortee' ? html` <span class="statut statut--avorte">${c.t('accueil.laundry.avortee')}</span>` : ''}${r.statut === 'encours' ? html` <span class="statut">${c.t('accueil.laundry.encours')}</span>` : ''}</p>
          <h3>${c.loc(r.titre)}</h3>
          <p>${c.loc(r.avec)}</p>
          <p class="residence-formes">${c.loc(r.formes)}${r.note ? html` · ${c.loc(r.note)}` : ''}</p>${r.credit ? html`
          <p class="residence-credit">© ${r.credit}</p>` : ''}
        </div>
      </li>`)}
    </ol>
  </div>
</section>

<section class="films-accueil" id="films" data-grain>
  <div class="conteneur">
    <div class="films-accueil-tete">
      <h2 class="titre-section" data-decoupe>${c.t('accueil.films.titre')}</h2>
      <p>${c.t('accueil.films.texte')}</p>
    </div>
    <article class="vedette">
      <a class="vedette-cadre pellicule" href="${c.url('films', `film-${sl.id}`)}" data-libelle="${c.libelle('films')}">
        ${c.media({ nom: sl.image, alt: `${sl.titre}, ${c.s('accueil.films.voir')}`, classe: 'vedette-media', sizes: '(max-width: 760px) 92vw, 60vw' })}
        <span class="vedette-minutage" aria-hidden="true">${sl.duree}</span>
      </a>
      <div class="vedette-texte">
        <p class="prix" data-tampon>${c.t('accueil.films.prix')}</p>
        <h3>${sl.titre} <span class="vedette-sous">${c.loc(sl.sousTitre)}</span></h3>
        <p class="vedette-meta">${sl.annee} · ${c.loc(sl.format)} · ${sl.duree}</p>
        <p>${c.loc(sl.synopsis)}</p>
      </div>
    </article>
    <ul class="films-accueil-liste">
      ${autres.map((f) => html`<li><a class="film-mini" href="${c.url('films', `film-${f.id}`)}" data-libelle="${c.libelle('films')}">
        ${c.media({ nom: f.image, alt: '', classe: 'film-mini-media', sizes: '(max-width: 760px) 80vw, 24vw' })}
        <span class="film-mini-titre">${f.titre}</span><span class="film-mini-meta">${f.annee} · ${f.duree}</span></a></li>`)}
    </ul>
    <p class="films-accueil-action">${c.lien('films', { classe: 'bouton bouton--contour', texte: c.t('accueil.films.action') })}</p>
  </div>
</section>

<section class="gare conteneur" id="gare">
  ${c.media({ nom: 'gare/couverture', alt: c.s('accueil.gare.alt'), classe: 'gare-media', cadrage: '40% 50%', sizes: '(max-width: 760px) 100vw, 50vw' })}
  <div class="gare-texte">
    <h2 class="titre-section" data-decoupe>${c.t('accueil.gare.titre')}</h2>
    <p class="gare-chapeau" data-anime>${c.t('accueil.gare.texte')}</p>
    <p data-anime>${c.t('accueil.gare.detail')}</p>
    <p class="gare-statut" data-anime><span class="etiquette-code">Coll</span> ${c.t('accueil.gare.statut')}</p>
    <p data-anime><a class="bouton bouton--contour" href="/assets/documents/gare-aux-rumeurs-livret.pdf" target="_blank" rel="noopener" data-sans-transition>${c.t('accueil.gare.action')}</a></p>
  </div>
</section>

<section class="reperes conteneur" id="reperes">
  <div class="reperes-tete">
    <h2 class="titre-section" data-decoupe>${c.t('accueil.reperes.titre')}</h2>
    <p>${c.t('accueil.reperes.texte')}</p>
    <div class="reperes-annees" data-visuel aria-hidden="true">${[...new Set(dates.map((d) => String(d.annee)))].map((a) => html`<span>${a}</span>`)}</div>
    <p>${c.lien('a-propos', { ancre: 'agenda', classe: 'bouton bouton--contour', texte: c.t('accueil.reperes.action') })}</p>
  </div>
  <ol class="reperes-liste">
    ${dates.map((d) => html`<li class="repere" data-anime>
      <p class="repere-date"><span>${d.mois}</span> ${d.annee}</p>
      <div><p class="repere-type">${c.loc(typeNom(d.type))}</p>
      <h3>${typeof d.titre === 'string' ? d.titre : c.loc(d.titre)}</h3><p>${c.loc(d.detail)}</p></div>
    </li>`)}
  </ol>
</section>

<section class="contact-accueil" id="contact">
  ${c.media({ nom: 'grok/atelier', alt: c.s('accueil.contact.alt'), classe: 'contact-accueil-media', cadrage: '40% 50%', sizes: '100vw' })}
  <div class="contact-accueil-carte">
    <h2 class="titre-section" data-decoupe>${c.t('accueil.contact.titre')}</h2>
    <p>${c.t('accueil.contact.texte')}</p>
    <p>${c.lien('a-propos', { ancre: 'contact', classe: 'bouton', texte: c.t('accueil.contact.action'), attrs: 'data-magnetique' })}</p>
    <p class="contact-direct"><a href="mailto:${c.site.contact.email}">${c.site.contact.email}</a><br><a href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a></p>
  </div>
</section>
`;
};
