# Passation du projet Pointage C50

Ce document reprend ce qui a été appris pendant la construction de l'application, entre le
28 septembre et le 4 octobre 2026. Il complète `CLAUDE.md`, qui décrit l'état actuel.

## Pourquoi cette application

L'utilisateur tire au pistolet et à la carabine sur des cibles C50. Il comptait ses points à la main et
marquait chaque série au crayon de couleur. Il voulait un outil qui lise la cible sur photo, compte
les points, mesure la dispersion et garde l'historique, pour suivre sa progression et repérer ses
fautes de tir (coup de doigt, respiration).

Son matériel et ses habitudes :

- Pistolet Sig Sauer P320 X-Five Legion, 9 mm, ogive FMJ ronde. Distances : 10, 15 et 25 m.
- Carabine Bergara Wilderness Thumbhole en .300 Win Mag, à 100 et 200 m sur C50.
- Carabine Daniel Defense DDM4 300S en .300 AAC Blackout.
- Il recharge ses munitions de carabine : comparer des recettes l'intéresse.
- 5 à 30 coups par cible, par séries de 10. Il photographie la cible après chaque série,
  sur le porte-cible, avec le vide du pas de tir derrière.
- Téléphone Android et PC Windows 10. L'appli est installée depuis Chrome.

## Ce que fait l'application (version 11)

- Calage automatique de la cible, avec correction de perspective, et poignées de réglage manuel.
- Détection des impacts, correction à la main : ajouter, supprimer, déplacer, annuler.
- Mode séries : une photo par série, seuls les nouveaux trous sont comptés, une couleur par série.
- Points entiers, décimaux, mouches ; correction des points à la jauge.
- Groupement : point moyen d'impact (PMI), écart-types horizontal, vertical et radial avec fourchette
  à 95 %, rayon moyen, écart maximal ; valeurs en mm, MOA et mrad.
- Réglage de hausse conseillé, calculé sans les coups écartés, et « dans le bruit » si le décalage
  n'est pas significatif.
- Coups écartés : impacts au-delà de 3 σ du cœur du groupement, avec une piste de faute par direction.
- Carnet : arme, munition ou recette, position, vitesse au chronographe, note.
- Historique : courbe d'évolution, filtres, comparaison des munitions, export CSV,
  sauvegarde et restauration en `.json`.

## Les mesures de terrain

Faites par l'utilisateur au pied à coulisse, sur du 9 mm FMJ dans le carton GEF :

| Mesure | Valeur |
|---|---|
| Ouverture visible (le vide) | 5 à 8 mm |
| Zone abîmée, fibres comprises | 10 à 11 mm |
| Trou dans le noir, mesuré | 10,35 mm |
| Trou dans le blanc, mesuré | 9,41 mm |
| Deux balles superposées (impact n° 9) | 15 à 16 mm |

Dans le blanc du 10, une corolle grise entoure le trou. Dans le noir elle est invisible : on voit
une couronne de fibres blanches arrachées. Le code n'utilise pas la corolle comme critère, les
filtres de forme ont suffi sur les photos disponibles.

Deux gros plans annotés par l'utilisateur sont dans `docs/zooms/` :

- `trou-9mm-noir-10.35mm.jpg` : impact dans le visuel noir, avec sa couronne de fibres blanches.
- `trou-9mm-blanc-9.41mm.jpg` : impact dans le blanc du 10, avec sa corolle grise.

Ces images ont été agrandies et lissées par un traitement d'image avant d'être transmises. Elles
montrent l'aspect d'un trou, mais ne servent pas à régler la détection : celle-ci se règle sur les
photos de cible entière de `tests/photos/`.

## Ce qui a échoué, et pourquoi

**Détection par contraste simple (v1).** Sur les vraies cibles, le 10 blanc était pris pour un
énorme trou. Corrigé en traitant le 10 comme une zone à part.

**Détection par la couleur du fond (v2 à v7).** Elle cherchait la teinte vue à travers les trous :
le bois de la table sur les photos de septembre. Au stand, la cible est sur un porte-cible avec le
vide derrière, donc sans couleur stable. L'algorithme a pris la baguette en bois du porte-cible
pour la couleur des trous et a posé tous les impacts dessus. Cette méthode reste disponible en
secours sous le bouton « Trou modèle », mais n'est plus automatique.

**Centrage sur le visuel noir seul.** Une photo prise de biais décale le centre apparent d'un cercle
d'autant plus qu'il est grand. Erreur mesurée : jusqu'à 3,6 mm entre deux photos de la même cible.
Corrigé en v8 avec les trois anneaux. Après correction, trois photos prises à main levée concordent
à moins d'1 mm.

**Centre du trou sur toute la zone abîmée.** Les fibres partent d'un seul côté et tiraient le centre
d'environ 0,5 mm. Corrigé en v9 : centre sur l'ouverture.

**Positions inventées.** Quand le nombre de coups annoncé dépassait le nombre de trous, l'appli
doublait des trous isolés pour atteindre le total. Remplacé en v8 par un signalement
« non localisé ».

**Fragment de chiffre imprimé.** Le « 4 » en haut de la cible a été pris pour un impact après un
simple réenregistrement de la photo en JPEG. Corrigé en v11 par un filtre sur les positions connues
des chiffres. Cet épisode montre que la détection reste sensible à de petites variations d'image.

## La séance de référence (02/10/2026)

P320, 9 mm, 10 m, 30 coups en trois séries sur une même cible. Photos dans `tests/photos/`.

| Série | Trouvés automatiquement | Points en automatique | Après correction de l'utilisateur |
|---|---|---|---|
| 1 | 9 sur 10 | 83 | 91 |
| 2 | 10 sur 10 | 93 | 93 |
| 3 | 9 sur 10 | 89 | 99 |
| Total | 28 sur 30 | 265 | 283 sur 300 |

Les trois corrections de l'utilisateur :

1. Impact n° 4, à 2 h contre le disque blanc : à 0,1 mm du cordon du 10. Compté 9 à la jauge.
2. Impact ajouté en série 1 à côté du n° 9, à 4 h : deux balles presque superposées, trou de
   15 à 16 mm. Position posée à la main vers (28, −15) mm : 9 points.
3. Impact ajouté en série 3 entre le n° 22 et le n° 12 : corolle grise visible sur la cible, pont de
   carton emporté sur 14 mm. Position posée à la main vers (−10, −2) mm : 10 points.

Les positions 2 et 3 sont estimées à 1 ou 2 mm près.

Deux cibles de septembre (photos sur table en bois, trous entourés au crayon de couleur) ont servi
aux premiers réglages. Elles ne sont pas dans le dépôt : elles montrent l'intérieur du logement.

## Pistes d'évolution

L'utilisateur a dit avoir des idées d'évolution sans les avoir encore détaillées : demande-les lui avant de
proposer les tiennes. Ce qui a été évoqué ou qui découle des limites :

- Tester et régler la détection à la carabine (ogive de 7,82 mm) et à 25 m.
- Enrichir le jeu de tests à chaque nouvelle séance réelle, avec le comptage manuel de l'utilisateur.
- Découper `index.html` en modules, une fois les tests en place, sans changer le déploiement.
- Carte cumulée des coups écartés sur toutes les séances, pour repérer une faute récurrente.
- Synchronisation de l'historique entre téléphone et PC, aujourd'hui remplacée par l'export `.json`.
- Détection des trous refermés (balles superposées), en s'appuyant sur la longueur de la zone abîmée.

## Points d'attention

- La carte « direction du coup écarté → faute » est une grille d'enseignement du tir au pistolet,
  pas une vérité. Elle est inversée pour un gaucher et ne s'applique pas à la carabine.
- Les fichiers produits par PWABuilder (keystore, `.apk`, `.aab`) ne doivent jamais entrer dans le
  dépôt. L'utilisateur a abandonné l'APK au profit de l'installation depuis Chrome.
- L'utilisateur n'a pas donné la valeur d'un clic de ses organes de visée : ne suppose aucune valeur par défaut.
