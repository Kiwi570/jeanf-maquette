# Historique des audits de la v2

La v1 s'était terminée à 0 échec (voir l'archive v1). Audits de la v2, dans l'ordre :

1. Audit rapide, 04/11/2026 dans l'après-midi : 184 échecs, presque tous dus aux nouveaux effets. Ils ont tous été corrigés :
   - textes des bandeaux sous 12 px ;
   - bouton pause des bandeaux rogné ;
   - chiffres de l'Accueil qui se chevauchaient ;
   - décalages de mise en page causés par le curseur, qui changeait de taille ;
   - traits de joint du voile le long des bords de l'écran ;
   - balancement des cadres saccadé sur Œuvres (16 à 20 % d'images lentes).
2. Audit complet, 04/11/2026 à 17:53 (43 min, 11 pages, 13 tailles, 4 modes) : 41 échecs, 70 points à regarder. Tous les échecs ont été corrigés :
   - bouton pause rogné à 768, 844 et 1024 px ;
   - clignotements à l'arrivée, parce que les briques tombaient trop vite ;
   - bande en bas de l'écran causée par le rebond des briques ;
   - couleur de la bande sur le côté de l'écran ;
   - grain des films redessiné à chaque image.
3. Relecture par un second agent, avec un regard neuf : 30 remarques. Celles qui ont été retenues sont corrigées :
   - curseur qui cachait les œuvres ;
   - compteurs affichant « 0 séries » ;
   - double image dans l'intro ;
   - balancement trop uniforme ;
   - survol qui restait collé au doigt ;
   - boucles sans pause au-delà de 5 s ;
   - écouteurs jamais retirés ;
   - lectures de mise en page pendant le défilement ;
   - volets qui clignotaient au retour arrière ;
   - briques qui retombaient ;
   - `will-change` permanent.
4. Audit complet, 04/11/2026 à 19:07 (43 min) : 28 échecs. Ils venaient des bandes le long des bords pendant le voile et du curseur. Les deux ont été corrigés : les briques se posent d'un coup, et le curseur ne bouge plus que par transformation.
5. Contrôle ciblé (fichiers, films, bords, fluidité), 04/11/2026 à 19:21 (13 min) : 9 échecs, tous des bandes le long des bords pendant le voile. Ils venaient du conteneur du voile, compté comme couvrant l'écran pendant que les briques bougent. Correction : pendant le montage et le démontage, seul le mur de briques est visible.
6. Même contrôle ciblé, 04/11/2026 à 19:38 (13 min) : 0 échec, 3 points à regarder. L'un d'eux a été corrigé : au retour arrière vers l'Accueil, le décor du haut arrivait en retard, il se charge maintenant en priorité.
7. Audit complet, 04/11/2026 à 20:21 (43 min, 11 pages, 13 tailles, 4 modes) : 1 échec, 6 points à regarder, 1 contrôle non lancé (Safari).
   - Échec non reproduit : « épinglage : image isolée différente (flash) » sur /en/oeuvres à 1366 × 768, à 334 ms. La planche montre un défilement continu, avec des images trop espacées pendant un défilement rapide. Le même film a été refait trois fois, puis l'audit a relancé « tient dans l'écran » et les films des épinglages sur /oeuvres et /en/oeuvres : 0 échec.
   - À regarder, corrigé : sur téléphone, le lien de /oeuvres vers /a-propos#contact laissait le fond sombre un instant après la chute des blocs, puis l'éclairait d'un coup. Le fond du site devenait transparent pour laisser passer la lumière de galerie, et le socle donne à html la couleur du voile tant que le voile n'est pas levé. Le plâtre est maintenant peint par une couche fixe sous le contenu, et html ne se voit plus que dans la bande de la barre de défilement.
8. Contrôles touchés par cette correction relancés à toutes les tailles et dans tous les modes, 04/11/2026 à 20:56 (26 min). Ils couvrent les fichiers, les mesures, les films (ouvertures, transitions, retours, ancres), les bords de l'écran, « tient dans l'écran » avec les films des épinglages, la fluidité et la vitesse. Résultat : 0 échec et 2 points à regarder. C'est le rapport.md actuel.
   - À regarder, sur /films et /en/films : changement brusque vers 2 s à l'ouverture. C'est attendu : à la fin de l'intro, le grain de pellicule et la lumière du projecteur s'allument sur le décor.
   - Les parcours (intro, menu, clavier, liens, hauteur, mode calme, parcours du projet) n'ont pas été relancés. La correction ne touche qu'une couche de fond sans clic possible, et ils étaient tous passés à l'audit complet du point 7.
   - Non lancé : Safari (WebKit), qui ne s'installe pas ici. Points à vérifier dans Safari sur le Mac :
     - ouverture de chaque page : rien ne clignote, l'intro est complète ;
     - changement de page : les blocs montent puis tombent, sans page blanche ni fond sombre dessous ; au retour arrière, ni intro ni voile resté ;
     - défilement : fluide, cadres qui se balancent sur Œuvres, bandeaux qui défilent ;
     - lumière de galerie et curseur sur les œuvres ; amorce 3-2-1 avant un film ;
     - menu sur iPhone (mode Responsive), polices, mention « Illustration générée », formulaire et barre du bas.
