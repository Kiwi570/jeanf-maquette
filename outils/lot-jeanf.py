#!/usr/bin/env python3
"""Construit recu/lot.json pour outils/images.py à partir des données du projet
(oeuvres.json, films.json, laundry.json) et de la liste des images Grok et des visuels fixes.
Usage, depuis la racine : python3 outils/lot-jeanf.py && python3 outils/images.py recu/lot.json"""
import json
from pathlib import Path

R = Path(__file__).resolve().parent.parent
D = lambda f: json.loads((R / "donnees" / f).read_text())
lot, vus = [], set()


def ajouter(nom, source, **o):
    if not source or nom in vus:
        return
    vus.add(nom)
    e = {"source": "recu/" + source, "nom": nom}
    if o.get("sourceMobile"):
        o["sourceMobile"] = "recu/" + o["sourceMobile"]
    e.update(o)
    lot.append(e)


for s in D("oeuvres.json")["series"]:
    for o in s["oeuvres"]:
        for im in o["images"]:
            ajouter(im["nom"], im["source"], qualite=82)
for f in D("films.json"):
    ajouter(f["image"], f["source"], qualite=80)
for l in D("laundry.json"):
    ajouter(l["image"], l["source"], qualite=80)

G = "grok/"
ajouter("grok/accueil-mur", G + "accueil-ouverture-mur-16x9.jpg", sourceMobile=G + "accueil-ouverture-mur-9x16.jpg", qualite=76)
ajouter("grok/joints", G + "accueil-manifeste-joints-4x5.jpg", qualite=76)
ajouter("grok/atelier", G + "accueil-contact-atelier-16x9.jpg", sourceMobile=G + "accueil-contact-atelier-4x5.jpg", qualite=76)
ajouter("grok/galerie", G + "oeuvres-ouverture-galerie-16x9.jpg", sourceMobile=G + "oeuvres-ouverture-galerie-9x16.jpg", qualite=76)
ajouter("grok/voir-au-mur", G + "oeuvres-voir-au-mur-16x9.jpg", sourceMobile=G + "oeuvres-voir-au-mur-9x16.jpg", qualite=78)
ajouter("grok/coupe-mur", G + "oeuvres-coupe-mur-21x9.jpg", qualite=76)
ajouter("grok/montage", G + "films-ouverture-montage-16x9.jpg", sourceMobile=G + "films-ouverture-montage-9x16.jpg", qualite=78)
ajouter("grok/pellicule", G + "films-pellicule-texture-21x9.jpg", qualite=76)
ajouter("grok/faisceau", G + "films-projection-faisceau-16x9.jpg", qualite=76)
ajouter("grok/outils", G + "apropos-outils-restauration-4x5.jpg", qualite=78)
ajouter("grok/catalogues", G + "apropos-catalogues-3x2.jpg", qualite=78)
ajouter("grok/carnet", G + "apropos-contact-carnet-16x9.jpg", qualite=78)
ajouter("grok/traces", G + "apropos-agenda-traces-3x2.jpg", qualite=76)
ajouter("grok/platre", G + "mentions-legales-platre-16x9.jpg", sourceMobile=G + "mentions-legales-platre-9x16.jpg", qualite=76)
ajouter("grok/pan-manquant", G + "404-pan-manquant-16x9.jpg", sourceMobile=G + "404-pan-manquant-9x16.jpg", qualite=76)

ajouter("gare/couverture", "site/gare-aux-rumeurs/01-couverture-livret.jpg", qualite=78)
ajouter("apropos/atelier", "site/oeuvres/pepiniere/31-nepenthes-sanguinea-atelier.jpg", sourceMobile="site/oeuvres/pepiniere/32-nepenthes-sanguinea-atelier.jpg", qualite=80)
ajouter("apropos/atelier-sculpt", "site/oeuvres/pepiniere/08-atelier-sculpt.jpg", qualite=80)

(R / "recu" / "lot.json").write_text(json.dumps(lot, ensure_ascii=False, indent=1))
print(len(lot), "images dans recu/lot.json")
