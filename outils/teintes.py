"""Teinte moyenne de chaque image convertie (assets/images/**/<nom>-<largeur>.webp), écrite dans
donnees/teintes.json. Le générateur la pose sous l'image (--teinte) : tant que l'image n'est pas
décodée, le cadre a déjà sa couleur au lieu d'un blanc qui saute.
Usage, depuis la racine, après images.py : python3 outils/teintes.py"""
import json, os, re
from PIL import Image

racine = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
images = os.path.join(racine, 'assets', 'images')
plus_petite = {}
for dossier, _, fichiers in os.walk(images):
    for f in fichiers:
        m = re.match(r'^(.*)-(\d+)\.webp$', f)
        if not m:
            continue
        nom = os.path.relpath(os.path.join(dossier, m.group(1)), images).replace(os.sep, '/')
        w = int(m.group(2))
        if nom not in plus_petite or w < plus_petite[nom][0]:
            plus_petite[nom] = (w, os.path.join(dossier, f))

teintes = {}
for nom, (_, chemin) in sorted(plus_petite.items()):
    with Image.open(chemin) as im:
        r, g, b = im.convert('RGB').resize((1, 1), Image.BOX).getpixel((0, 0))
    teintes[nom] = f'#{r:02x}{g:02x}{b:02x}'

with open(os.path.join(racine, 'donnees', 'teintes.json'), 'w') as f:
    json.dump(teintes, f, indent=0, sort_keys=True)
print(len(teintes), 'teintes dans donnees/teintes.json')
