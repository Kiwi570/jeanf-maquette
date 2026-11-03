# Historique des audits de la v1

1. Audit complet, 03/11/2026 à 18:41 (41 min, 11 pages, 13 tailles, 4 modes) : 10 échecs.
   Ils ont tous été corrigés :
   - titre sous l'en-tête sans JavaScript à 320 px ;
   - années « 2021-2022 » de l'agenda à 1024 px ;
   - liste des pièces sans visuel ;
   - focus clavier sur un bouton des volets hors de l'écran.
2. Audit complet, 03/11/2026 à 19:27 (41 min) : 1 échec, 2 points à regarder, 1 contrôle non lancé.
   - Échec, corrigé : sans JavaScript, à 320 × 568 px, l'information clé de /en/oeuvres passait sous la barre du bas.
   - À regarder, sur /films et /en/films : l'écran diffère après un rechargement au milieu de la page. C'est attendu : le test ouvre des fiches de films, qui se referment au rechargement.
   - Non lancé : Safari (WebKit), qui ne s'installe pas ici. Points à vérifier dans Safari sur le Mac :
     - ouverture de chaque page : rien ne clignote, l'intro est complète au premier chargement et au rechargement ;
     - changement de page : le voile couvre l'écran, pas de page blanche ; au retour arrière, ni intro ni voile resté ;
     - défilement : fluide, en-tête qui se cache et revient, mur épinglé entier ;
     - menu sur iPhone (mode Responsive) : ouverture, fermeture, page bloquée derrière ;
     - polices, images, mention « Illustration générée », formulaire et barre du bas.
3. Contrôles des fichiers et mesures relancés après la correction, à toutes les tailles et dans tous les modes, 03/11/2026 à 19:37 : 0 échec. C'est le rapport.md actuel.
