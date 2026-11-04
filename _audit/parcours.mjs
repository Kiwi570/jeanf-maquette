/* Parcours propres à JeanF : ce que les contrôles généraux ne peuvent pas deviner.
   - Œuvres : visionneuse (ouverture, image chargée, focus gardé, flèches, Échap, retour du focus, lien direct),
     voir au mur (œuvre posée à l'échelle, fermeture), filtres par série (et ?serie= dans l'adresse).
   - Films : fiche qui s'ouvre, lecteur chargé seulement au clic, films privés sans lecteur, lien #film- direct.
   - À propos : filtres de l'agenda (et ?type=).
   - Accueil : volets de l'œuvre d'ouverture (bouton et état).
   Chaque problème s'ajoute au rapport : R.echec(controle, detail, { page, taille, selecteur }). */
export default async function ({ contexte, attendrePret, attendre, BASE, R, T }) {
  const tailles = [T('390×844'), T('1366×768')];

  for (const taille of tailles) {
    const ou = (page) => ({ page, taille: taille.nom });

    /* ---------- Œuvres : visionneuse et voir au mur ---------- */
    {
      const { ctx, page, erreurs } = await contexte({ taille });
      try {
        await page.goto(BASE + '/oeuvres', { waitUntil: 'load' });
        await attendrePret(page);
        const lien = page.locator('.mur--complet [data-visionneuse]').first();
        const id = await lien.getAttribute('data-visionneuse');
        await lien.scrollIntoViewIfNeeded();
        await lien.click({ force: true });
        await attendre(500);
        const ouvert = await page.evaluate(() => {
          const b = document.querySelector('#visionneuse');
          const art = b && b.querySelector('.visionneuse-oeuvre:not([hidden])');
          const img = art && art.querySelector('.visionneuse-image:not([hidden]) img');
          return {
            visible: !!b && !b.hidden && !b.inert && getComputedStyle(b).display !== 'none',
            focusDedans: !!b && b.contains(document.activeElement),
            image: !!img && img.complete && img.naturalWidth > 0,
            nbImages: art ? art.querySelectorAll('.visionneuse-image').length : 0,
            hash: location.hash,
            voirMur: !!(art && art.querySelector('[data-voir-mur-ouvrir]')),
          };
        });
        if (!ouvert.visible) R.echec('visionneuse', 'la visionneuse ne s’ouvre pas au clic sur une œuvre', ou('/oeuvres'));
        else {
          if (!ouvert.focusDedans) R.echec('visionneuse', 'le focus ne passe pas dans la visionneuse à l’ouverture', ou('/oeuvres'));
          if (!ouvert.image) R.echec('visionneuse', 'l’image de l’œuvre n’est pas chargée à l’ouverture', ou('/oeuvres'));
          if (ouvert.hash !== `#oeuvre-${id}`) R.echec('visionneuse', `adresse ${ouvert.hash || '(vide)'} au lieu de #oeuvre-${id}`, ou('/oeuvres'));
          /* Tab répété : le focus reste dans la fenêtre. */
          for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
          if (!(await page.evaluate(() => document.querySelector('#visionneuse').contains(document.activeElement)))) R.echec('visionneuse', 'le focus sort de la visionneuse avec Tab', ou('/oeuvres'));

          /* Voir au mur. */
          if (ouvert.voirMur) {
            await page.locator('#visionneuse .visionneuse-oeuvre:not([hidden]) [data-voir-mur-ouvrir]').click();
            await attendre(900);
            const mur = await page.evaluate(() => {
              const b = document.querySelector('#voir-mur');
              const o = b && b.querySelector('[data-voir-mur-image]');
              const s = b && b.querySelector('[data-voir-mur-scene]');
              const r = o && o.getBoundingClientRect(), rs = s && s.getBoundingClientRect();
              return {
                visible: !!b && !b.hidden && !b.inert,
                taille: r ? { l: r.width, h: r.height } : null,
                dedans: !!(r && rs && r.left >= rs.left - 1 && r.right <= rs.right + 1 && r.top >= rs.top - 1 && r.bottom <= rs.bottom + 1),
                focusDedans: !!b && b.contains(document.activeElement),
              };
            });
            if (!mur.visible) R.echec('voir au mur', 'la vue « au mur » ne s’ouvre pas', ou('/oeuvres'));
            else {
              if (!mur.taille || mur.taille.l < 20 || mur.taille.h < 20) R.echec('voir au mur', `œuvre posée trop petite (${mur.taille ? Math.round(mur.taille.l) + '×' + Math.round(mur.taille.h) : 'absente'})`, ou('/oeuvres'));
              if (!mur.dedans) R.echec('voir au mur', 'l’œuvre dépasse de la scène', ou('/oeuvres'));
              if (!mur.focusDedans) R.echec('voir au mur', 'le focus ne passe pas dans la vue « au mur »', ou('/oeuvres'));
              await page.keyboard.press('Escape');
              await attendre(300);
              const apres = await page.evaluate(() => ({ mur: document.querySelector('#voir-mur').hidden, vis: !document.querySelector('#visionneuse').hidden }));
              if (!apres.mur || !apres.vis) R.echec('voir au mur', 'Échap ne referme pas seulement la vue « au mur »', ou('/oeuvres'));
            }
          }

          /* Flèches, si l'œuvre a plusieurs images. */
          if (ouvert.nbImages > 1) {
            const avant = await page.locator('.visionneuse-compte').textContent();
            await page.keyboard.press('ArrowRight');
            await attendre(200);
            if ((await page.locator('.visionneuse-compte').textContent()) === avant) R.echec('visionneuse', 'la flèche droite ne change pas d’image', ou('/oeuvres'));
          }

          /* Échap : fermeture, focus rendu, défilement rendu, adresse nettoyée. */
          await page.keyboard.press('Escape');
          await attendre(400);
          const ferme = await page.evaluate((id) => {
            const b = document.querySelector('#visionneuse');
            const a = document.activeElement;
            return { ferme: b.hidden && b.inert, focus: !!(a && a.dataset && a.dataset.visionneuse === id), hash: location.hash, bloque: getComputedStyle(document.documentElement).overflow === 'hidden' || getComputedStyle(document.body).overflow === 'hidden' };
          }, id);
          if (!ferme.ferme) R.echec('visionneuse', 'Échap ne ferme pas la visionneuse', ou('/oeuvres'));
          if (!ferme.focus) R.echec('visionneuse', 'le focus ne revient pas sur l’œuvre cliquée', ou('/oeuvres'));
          if (ferme.hash) R.echec('visionneuse', `l’adresse garde ${ferme.hash} après fermeture`, ou('/oeuvres'));
          if (ferme.bloque) R.echec('visionneuse', 'le défilement reste bloqué après fermeture', ou('/oeuvres'));
        }

        /* Filtres par série. */
        const series = await page.evaluate(() => [...document.querySelectorAll('[data-filtres] [data-filtre]')].map((b) => b.dataset.filtre).filter((v) => v !== 'tous'));
        if (!series.length) R.echec('filtres œuvres', 'aucun filtre par série', ou('/oeuvres'));
        for (const s of series.slice(0, 2)) {
          await page.locator(`[data-filtres] [data-filtre="${s}"]`).click();
          await attendre(400);
          const r = await page.evaluate((s) => {
            const pans = [...document.querySelectorAll('.mur--complet .pan')];
            const visibles = pans.filter((p) => !p.hidden);
            return {
              ok: visibles.length === 1 && visibles[0].dataset.serie === s,
              cartes: visibles.reduce((n, p) => n + p.querySelectorAll('.carte-oeuvre').length, 0),
              adresse: new URLSearchParams(location.search).get('serie'),
              presse: document.querySelector(`[data-filtres] [data-filtre="${s}"]`).getAttribute('aria-pressed'),
            };
          }, s);
          if (!r.ok) R.echec('filtres œuvres', `le filtre « ${s} » ne garde pas seulement ce pan`, ou('/oeuvres'));
          if (!r.cartes) R.echec('filtres œuvres', `le filtre « ${s} » ne montre aucune œuvre`, ou('/oeuvres'));
          if (r.adresse !== s) R.echec('filtres œuvres', `?serie=${s} absent de l’adresse`, ou('/oeuvres'));
          if (r.presse !== 'true') R.echec('filtres œuvres', `bouton « ${s} » sans aria-pressed="true"`, ou('/oeuvres'));
        }
        await page.locator('[data-filtres] [data-filtre="tous"]').click();
        await attendre(300);
        if (await page.evaluate(() => [...document.querySelectorAll('.mur--complet .pan')].some((p) => p.hidden))) R.echec('filtres œuvres', '« Tout » ne remet pas tous les pans', ou('/oeuvres'));
        [...new Set(erreurs)].forEach((e) => R.echec('erreur de console ou ressource', e, ou('/oeuvres (parcours)')));
      } finally { await ctx.close(); }
    }

    /* Lien direct vers une œuvre et vers un filtre. */
    {
      const { ctx, page } = await contexte({ taille });
      try {
        await page.goto(BASE + '/oeuvres?serie=pepiniere#oeuvre-rosa', { waitUntil: 'load' });
        await attendrePret(page);
        await attendre(500);
        const r = await page.evaluate(() => ({
          vis: !document.querySelector('#visionneuse').hidden && !!document.querySelector('#visionneuse .visionneuse-oeuvre[data-oeuvre="rosa"]:not([hidden])'),
          filtre: [...document.querySelectorAll('.mur--complet .pan')].filter((p) => !p.hidden).map((p) => p.dataset.serie).join(','),
        }));
        if (!r.vis) R.echec('visionneuse', 'le lien direct #oeuvre-rosa n’ouvre pas l’œuvre', ou('/oeuvres?serie=pepiniere#oeuvre-rosa'));
        if (r.filtre !== 'pepiniere') R.echec('filtres œuvres', `?serie=pepiniere donne « ${r.filtre} »`, ou('/oeuvres?serie=pepiniere'));
      } finally { await ctx.close(); }
    }

    /* ---------- Films : fiches et lecteur ---------- */
    {
      const { ctx, page, erreurs } = await contexte({ taille });
      const externes = [];
      page.on('request', (q) => { if (/youtube|vimeo|ytimg/.test(q.url())) externes.push(q.url()); });
      try {
        await page.goto(BASE + '/films', { waitUntil: 'load' });
        await attendrePret(page);
        await attendre(400);
        if (externes.length) R.echec('films', `vidéo chargée avant tout clic : ${externes[0].slice(0, 80)}`, ou('/films'));
        const bandes = await page.evaluate(() => [...document.querySelectorAll('[data-bande]')].map((b) => {
          const fiche = document.getElementById(b.getAttribute('aria-controls'));
          return { id: b.getAttribute('aria-controls'), jouer: !!(fiche && fiche.querySelector('[data-lecteur-jouer]')), prive: !!(fiche && fiche.querySelector('[data-lecteur]') && !fiche.querySelector('[data-lecteur-jouer]')) };
        }));
        if (bandes.length !== 12) R.echec('films', `${bandes.length} bandes au lieu de 12`, ou('/films'));
        const integrable = bandes.find((b) => b.jouer);
        const prive = bandes.find((b) => !b.jouer);
        for (const b of [integrable, prive].filter(Boolean)) {
          const bouton = page.locator(`[aria-controls="${b.id}"]`);
          await bouton.scrollIntoViewIfNeeded();
          await bouton.click();
          await attendre(400);
          const r = await page.evaluate((id) => {
            const f = document.getElementById(id);
            const rr = f.getBoundingClientRect();
            return { ouverte: !f.hidden && rr.height > 40, expanded: document.querySelector(`[aria-controls="${id}"]`).getAttribute('aria-expanded') };
          }, b.id);
          if (!r.ouverte) R.echec('films', `la fiche ${b.id} ne s’ouvre pas`, ou('/films'));
          if (r.expanded !== 'true') R.echec('films', `bouton de ${b.id} sans aria-expanded="true"`, ou('/films'));
          if (b === integrable) {
            await page.locator(`#${b.id} [data-lecteur-jouer]`).click();
            /* Amorce 3-2-1 (environ 1,3 s) avant que le lecteur se charge. */
            await attendre(1900);
            const src = await page.evaluate((id) => { const i = document.querySelector(`#${id} iframe`); return i ? i.src : ''; }, b.id);
            if (!/^https:\/\/(www\.youtube-nocookie\.com|player\.vimeo\.com)\//.test(src)) R.echec('films', `lecteur absent ou sans youtube-nocookie / vimeo après le clic (${src || 'aucun'})`, ou('/films'));
            await bouton.click();
            await attendre(300);
            if (await page.evaluate((id) => !!document.querySelector(`#${id} iframe`), b.id)) R.echec('films', 'le lecteur reste chargé fiche fermée', ou('/films'));
          } else {
            const mention = await page.evaluate((id) => (document.getElementById(id).textContent || '').trim().length > 20, b.id);
            if (!mention) R.echec('films', `film privé ${b.id} sans mention ni lien`, ou('/films'));
          }
        }
        [...new Set(erreurs)].filter((e) => !/youtube|vimeo/.test(e)).forEach((e) => R.echec('erreur de console ou ressource', e, ou('/films (parcours)')));
      } finally { await ctx.close(); }
    }
    {
      const { ctx, page } = await contexte({ taille });
      try {
        await page.goto(BASE + '/films#film-issues', { waitUntil: 'load' });
        await attendrePret(page);
        await attendre(900);
        const r = await page.evaluate(() => {
          const b = document.querySelector('#film-issues [data-bande]');
          const f = b && document.getElementById(b.getAttribute('aria-controls'));
          const rr = document.querySelector('#film-issues').getBoundingClientRect();
          return { ouverte: !!f && !f.hidden, vue: rr.top < innerHeight && rr.bottom > 0 };
        });
        if (!r.ouverte) R.echec('films', 'le lien #film-issues n’ouvre pas la fiche', ou('/films#film-issues'));
        if (!r.vue) R.echec('films', 'le lien #film-issues ne mène pas au film', ou('/films#film-issues'));
      } finally { await ctx.close(); }
    }

    /* ---------- À propos : filtres de l'agenda ---------- */
    {
      const { ctx, page } = await contexte({ taille });
      try {
        await page.goto(BASE + '/a-propos', { waitUntil: 'load' });
        await attendrePret(page);
        const types = await page.evaluate(() => [...document.querySelectorAll('[data-filtres-agenda] [data-filtre]')].map((b) => b.dataset.filtre).filter((v) => v !== 'tous'));
        if (!types.length) R.echec('agenda', 'aucun filtre par type', ou('/a-propos'));
        for (const t of types) {
          await page.locator(`[data-filtres-agenda] [data-filtre="${t}"]`).click();
          await attendre(200);
          const r = await page.evaluate((t) => {
            const dates = [...document.querySelectorAll('.agenda-date')];
            const vis = dates.filter((d) => !d.hidden && !d.closest('.agenda-annee').hidden);
            const anneesVides = [...document.querySelectorAll('.agenda-annee')].filter((a) => !a.hidden && !a.querySelector('.agenda-date:not([hidden])')).length;
            return { n: vis.length, intrus: vis.filter((d) => d.dataset.type !== t).length, anneesVides, adresse: new URLSearchParams(location.search).get('type') };
          }, t);
          if (!r.n) R.echec('agenda', `le filtre « ${t} » ne montre aucune date`, ou('/a-propos'));
          if (r.intrus) R.echec('agenda', `le filtre « ${t} » laisse ${r.intrus} date(s) d’un autre type`, ou('/a-propos'));
          if (r.anneesVides) R.echec('agenda', `le filtre « ${t} » laisse ${r.anneesVides} année(s) vide(s)`, ou('/a-propos'));
          if (r.adresse !== t) R.echec('agenda', `?type=${t} absent de l’adresse`, ou('/a-propos'));
        }
        await page.locator('[data-filtres-agenda] [data-filtre="tous"]').click();
        await attendre(200);
        if (await page.evaluate(() => document.querySelectorAll('.agenda-date[hidden]').length)) R.echec('agenda', '« Tout » ne remet pas toutes les dates', ou('/a-propos'));
      } finally { await ctx.close(); }
    }

    /* ---------- Accueil : volets de l'œuvre d'ouverture ---------- */
    {
      const { ctx, page } = await contexte({ taille });
      try {
        await page.goto(BASE + '/', { waitUntil: 'load' });
        await attendrePret(page);
        await attendre(2600);
        const b = page.locator('#volets-hero');
        if (!(await b.count())) R.echec('volets', 'bouton des volets absent de l’ouverture', ou('/'));
        else {
          const e0 = await page.evaluate(() => ({ etat: document.querySelector('.hero-oeuvre [data-volets]').dataset.etat, presse: document.querySelector('#volets-hero').getAttribute('aria-pressed') }));
          await b.click();
          await attendre(1400);
          const e1 = await page.evaluate(() => ({ etat: document.querySelector('.hero-oeuvre [data-volets]').dataset.etat, presse: document.querySelector('#volets-hero').getAttribute('aria-pressed') }));
          if (e0.etat === e1.etat) R.echec('volets', `le bouton ne change pas l’état des volets (${e0.etat})`, ou('/'));
          if (e0.presse === e1.presse) R.echec('volets', 'aria-pressed ne suit pas les volets', ou('/'));
          if ((e1.etat === 'ouvert') !== (e1.presse === 'true')) R.echec('volets', `état ${e1.etat} et aria-pressed=${e1.presse} ne concordent pas`, ou('/'));
        }
      } finally { await ctx.close(); }
    }
  }
}
