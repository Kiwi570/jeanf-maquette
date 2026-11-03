#!/usr/bin/env python3
"""Convertit les images reçues en WebP, en plusieurs tailles, avec une version téléphone recadrée.

Usage, depuis la racine du projet :
  python3 outils/images.py lot.json

lot.json :
  [
    {"source": "recu/IMG_2041.jpg", "nom": "ouverture", "cadrage": [50, 35], "mobile": true},
    {"source": "recu/grok-salle.png", "nom": "grok/salle", "cadrage": [40, 50]}
  ]

- Écrit assets/images/<nom>-<largeur>.webp pour 640, 1280 et 1920 px, sans jamais agrandir l'original.
- "mobile": true ajoute <nom>-mobile-<largeur>.webp en 9:16, recadré autour du point de cadrage (en %).
- "sourceMobile": "recu/…" utilise une image portrait fournie à part pour la version téléphone.
- "largeurs": [640, 1280] remplace les largeurs standard ; "qualite": 72 règle la compression WebP.
- Un original plus petit que 1920 px garde aussi sa pleine largeur (ex. 640 et 1168 pour une image de 1168 px).
- Le point de cadrage se reporte dans la page : c.media({ nom, cadrage: '50% 35%' }).
- Les images Grok vont dans le dossier grok/ : la mention « Illustration générée » est alors ajoutée seule.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

RACINE = Path(__file__).resolve().parent.parent
LARGEURS = [640, 1280, 1920]
LARGEURS_MOBILE = [640, 1080]


def enregistrer(img, chemin, largeur, qualite=80):
    if img.width > largeur:
        img = img.resize((largeur, round(img.height * largeur / img.width)), Image.LANCZOS)
    chemin.parent.mkdir(parents=True, exist_ok=True)
    img.save(chemin, "WEBP", quality=qualite, method=6)
    return chemin.stat().st_size


def recadrer(img, ratio, cx, cy):
    """Recadre img au ratio (largeur/hauteur) autour du point (cx, cy) en %."""
    w, h = img.size
    if w / h > ratio:
        nw, nh = round(h * ratio), h
    else:
        nw, nh = w, round(w / ratio)
    x = min(max(round(w * cx / 100 - nw / 2), 0), w - nw)
    y = min(max(round(h * cy / 100 - nh / 2), 0), h - nh)
    return img.crop((x, y, x + nw, y + nh))


def largeurs_pour(largeur, liste):
    """Largeurs standard sous la largeur de l'original, plus l'original lui-même s'il est plus petit
    que la plus grande largeur standard (une image de 1168 px garde sa pleine définition)."""
    ws = [x for x in liste if x <= largeur]
    if largeur < max(liste) and largeur not in ws and (not ws or largeur - ws[-1] > 120):
        ws.append(largeur)
    return ws or [largeur]


def traiter(e):
    src = RACINE / e["source"]
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    nom = e["nom"]
    cx, cy = e.get("cadrage", [50, 50])
    qualite = e.get("qualite", 80)
    sorties = []
    for l in largeurs_pour(img.width, e.get("largeurs", LARGEURS)):
        p = RACINE / "assets/images" / f"{nom}-{l}.webp"
        sorties.append((p, enregistrer(img, p, l, qualite)))
    if e.get("mobile") or e.get("sourceMobile"):
        # Version téléphone : une image portrait fournie à part (sourceMobile), sinon un recadrage 9:16.
        if e.get("sourceMobile"):
            m = ImageOps.exif_transpose(Image.open(RACINE / e["sourceMobile"])).convert("RGB")
        else:
            m = recadrer(img, 9 / 16, cx, cy)
        for l in largeurs_pour(m.width, LARGEURS_MOBILE):
            p = RACINE / "assets/images" / f"{nom}-mobile-{l}.webp"
            sorties.append((p, enregistrer(m, p, l, qualite)))
    for p, taille in sorties:
        alerte = "  (plus de 300 Ko)" if taille > 300_000 else ""
        print(f"OK {p.relative_to(RACINE)} {taille // 1024} Ko{alerte}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    for entree in json.loads(Path(sys.argv[1]).read_text()):
        traiter(entree)
