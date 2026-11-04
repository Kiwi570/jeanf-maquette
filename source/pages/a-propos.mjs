/* À propos et contact : ouverture sur l'atelier, bio, formation, agenda 2012-2024 filtrable
   (filtre gardé dans l'adresse : ?type=film), bibliographie, compagnons de route, formulaire simulé
   prérempli par l'adresse (?sujet=oeuvre&oeuvre=…). */
import { html, brut } from '../../outils/gabarit.mjs';
import { ruban } from '../gabarits/vivant.mjs';

export const page = { cle: 'a-propos', fichier: 'a-propos', imagePartage: 'apropos/atelier-1134.webp' };

export default (c) => {
  const { types, dates } = c.donnees.agenda;
  const annees = [...new Set(dates.map((d) => d.annee))];
  const typeNom = (id) => c.loc(types.find((t) => t.id === id).nom);
  const typeUn = (id) => c.loc(types.find((t) => t.id === id).un);
  const statut = (d) => (d.statut ? html` <span class="statut statut--avorte">${c.s(`apropos.agenda.${d.statut}`)}</span>` : '');
  const k = c.site.contact;
  return html`
<section class="tete tete--apropos ecran" id="debut">
  ${c.media({ nom: 'apropos/atelier', alt: c.s('apropos.tete.alt'), cadrage: '45% 50%', cadrageMobile: '50% 45%', classe: 'tete-fond tete-fond--photo', sizes: '100vw', priorite: true })}
  <div class="tete-grille">
    <div class="tete-texte tete-texte--carte">
      <p class="surtitre" data-anime="gsap">${c.t('apropos.tete.sous')}</p>
      <h1 class="tete-titre"><span data-anime="gsap" class="tete-ligne">${c.t('apropos.tete.titre')}</span></h1>
      <p class="tete-intro" data-anime="gsap">${c.t('apropos.tete.texte')}</p>
      <p class="tete-actions" data-anime="gsap"><a class="bouton" href="#contact" data-action-principale data-magnetique>${c.t('commun.actionEntete')}</a></p>
      <p class="tete-info" data-info-cle data-anime="gsap"><span class="a-completer">${c.t('apropos.tete.info')}</span></p>
    </div>
  </div>
</section>

<section class="bio conteneur" id="bio">
  ${c.media({ nom: 'grok/outils', alt: c.s('apropos.bio.alt'), classe: 'bio-media', sizes: '(max-width: 760px) 100vw, 34vw' })}
  <div>
    <h2 class="titre-section" data-decoupe>${c.t('apropos.bio.titre')}</h2>
    <p class="bio-texte" data-anime>${c.t('apropos.bio.texte')}</p>
  </div>
</section>

<section class="parcours conteneur" id="parcours">
  <div class="parcours-cote">
    <h2 class="titre-section" data-decoupe>${c.t('apropos.parcours.titre')}</h2>
    ${c.media({ nom: 'apropos/atelier-sculpt', alt: c.s('pages.a-propos.partageAlt'), classe: 'parcours-media', sizes: '(max-width: 760px) 100vw, 34vw' })}
  </div>
  <ol class="parcours-liste">
    ${c.donnees.apropos.parcours.map((p) => html`<li data-anime><p class="parcours-quand">${c.loc(p.quand)}</p><p>${c.loc(p.quoi)}</p></li>`)}
  </ol>
</section>

${ruban(c, { id: 'ruban-annees', style: 'encre', incline: -1, elements: annees.map((a) => { const n = dates.filter((d) => d.annee === a).length; return html`<b class="ruban-annee">${a}</b> ${n} ${c.s(n > 1 ? 'commun.ruban.dates' : 'commun.ruban.date')}`; }) })}

<section class="agenda" id="agenda">
  ${c.media({ nom: 'grok/traces', alt: c.s('apropos.agenda.alt'), classe: 'agenda-media', cadrage: '50% 50%', sizes: '100vw' })}
  <div class="conteneur">
    <div class="agenda-tete">
      <h2 class="titre-section" data-decoupe>${c.t('apropos.agenda.titre')}</h2>
      <p>${c.t('apropos.agenda.texte')}</p>
      <div class="filtres" role="group" aria-label="${c.s('apropos.agenda.filtre')}" data-filtres-agenda>
        <button type="button" class="filtre" data-filtre="tous" aria-pressed="true">${c.t('apropos.agenda.tous')}</button>
        ${types.map((t) => html`<button type="button" class="filtre" data-filtre="${t.id}" aria-pressed="false">${c.loc(t.nom)}</button>`)}
      </div>
    </div>
    <div class="agenda-annees" data-agenda>
      ${annees.map((a) => html`<div class="agenda-annee" data-annee="${a}">
        <h3 class="agenda-an${String(a).includes('-') ? ' agenda-an--plage' : ''}">${a}</h3>
        <ul class="agenda-liste">${dates.filter((d) => d.annee === a).map((d) => html`<li class="agenda-date" data-type="${d.type}">
          <p class="agenda-mois">${d.mois || '—'}</p>
          <div><p class="agenda-type">${typeUn(d.type)}${statut(d)}${d.prix ? html` <span class="statut statut--prix">Remi Platinum</span>` : ''}</p>
          <p class="agenda-titre">${typeof d.titre === 'string' ? d.titre : c.loc(d.titre)}</p>
          <p class="agenda-detail">${c.loc(d.detail)}</p></div>
        </li>`)}</ul>
      </div>`)}
      <p class="agenda-vide" data-agenda-vide hidden>${c.t('apropos.agenda.vide')}</p>
    </div>
  </div>
</section>

<section class="biblio conteneur" id="bibliographie">
  <div class="biblio-cote">
    <h2 class="titre-section" data-decoupe>${c.t('apropos.bibliographie.titre')}</h2>
    ${c.media({ nom: 'grok/catalogues', alt: c.s('apropos.bibliographie.alt'), classe: 'biblio-media', sizes: '(max-width: 760px) 100vw, 34vw' })}
  </div>
  <ol class="biblio-liste">
    ${c.donnees.apropos.bibliographie.map((b) => html`<li data-anime><span class="biblio-annee">${b.annee || '—'}</span><span>${c.loc(b.texte)}</span></li>`)}
  </ol>
</section>

<section class="avec conteneur" id="avec">
  <h2 class="titre-section" data-decoupe>${c.t('apropos.avec.titre')}</h2>
  <p>${c.t('apropos.avec.texte')}</p>
  <ul class="avec-mur" data-visuel>${c.donnees.apropos.avec.map((n, i) => html`<li style="--i:${i}">${n}</li>`)}</ul>
</section>

<section class="contact conteneur" id="contact">
  <div class="contact-cote">
    <h2 class="titre-section" data-decoupe>${c.t('apropos.contact.titre')}</h2>
    <p>${c.t('apropos.contact.texte')}</p>
    <ul class="contact-coordonnees">
      <li><span class="contact-libelle">${c.t('commun.email')}</span><a href="mailto:${k.email}">${k.email}</a></li>
      <li><span class="contact-libelle">${c.t('commun.telephone')}</span><a href="tel:${k.telephoneLien}">${k.telephone}</a></li>
      <li><span class="contact-libelle">${c.t('commun.facebook')}</span><a href="${k.facebook}" target="_blank" rel="noopener">facquodvis</a></li>
      <li><span class="contact-libelle">${c.t('commun.atelierLibelle')}</span><span class="a-completer">${c.t('commun.aCompleter')}</span></li>
    </ul>
    ${c.media({ nom: 'grok/carnet', alt: c.s('apropos.contact.alt'), classe: 'contact-media', sizes: '(max-width: 760px) 100vw, 36vw' })}
  </div>
  <form data-formulaire class="formulaire" action="#" novalidate data-texte-email="${c.s('apropos.contact.erreurEmail')}" data-texte-tel="${c.s('apropos.contact.erreurTel')}">
    <div class="champ"><label for="f-nom">${c.t('apropos.contact.nom')}</label><input id="f-nom" name="nom" autocomplete="name" required></div>
    <div class="champ"><label for="f-email">${c.t('apropos.contact.email')}</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
    <div class="champ"><label for="f-tel">${c.t('apropos.contact.tel')}</label><input id="f-tel" name="tel" type="tel" autocomplete="tel"></div>
    <div class="champ"><label for="f-sujet">${c.t('apropos.contact.sujet')}</label>
      <select id="f-sujet" name="sujet">
        <option value="oeuvre">${c.t('apropos.contact.sujetOeuvre')}</option>
        <option value="projection">${c.t('apropos.contact.sujetProjection')}</option>
        <option value="residence">${c.t('apropos.contact.sujetResidence')}</option>
        <option value="autre" selected>${c.t('apropos.contact.sujetAutre')}</option>
      </select></div>
    <div class="champ"><label for="f-oeuvre">${c.t('apropos.contact.oeuvre')}</label><input id="f-oeuvre" name="oeuvre" autocomplete="off"></div>
    <div class="champ"><label for="f-message">${c.t('apropos.contact.message')}</label><textarea id="f-message" name="message" rows="5" required></textarea></div>
    <p class="mention-donnees">${c.tb('apropos.contact.donnees')}</p>
    <button type="submit" class="bouton">${c.t('apropos.contact.envoyer')}</button>
    <p data-message-envoi role="status" tabindex="-1" hidden data-texte="${c.s('apropos.contact.envoye')}"></p>
  </form>
</section>
`;
};
