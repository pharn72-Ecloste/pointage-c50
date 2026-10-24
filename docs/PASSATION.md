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

## Ce que fait l'application (version 22)

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
- Fiche d'une séance enregistrée : munition ou recette, position, vitesse, écart-type et note restent modifiables
  (v14). Calibre, distance et impacts restent figés : ils fixent les points et les MOA.
- Plusieurs tireurs (v15) : chaque tireur a sa liste d'armes (arme, calibre, distance) ; chaque séance est rangée
  à son nom ; l'historique se filtre par tireur ; la sauvegarde `.json` d'un autre tireur s'importe à son nom
  sans toucher aux séances du propriétaire. Le tireur d'une séance enregistrée reste modifiable dans sa fiche.
  Les statistiques « Tous » mélangent les tireurs : filtrer sur un tireur pour lire les siennes.
- Valeur du clic par arme (v16) : choisir une arme remet sa valeur et son unité ; modifier la valeur l'enregistre
  dans l'arme choisie. À la mise à jour, l'ancienne valeur commune est allée à l'arme réglée à ce moment-là.
- Comparaison des munitions par arme (v17) : un tableau par arme (et par tireur s'il y en a plusieurs), qui
  n'apparaît que si cette arme a été tirée avec au moins deux munitions. Avant, le tableau mettait côte à côte
  le P320 tenu à la main et la DDM4 en appui : il mesurait l'arme et le tireur, pas la munition. Sur les 170 coups
  Magtech au P320 (6 séances, 10 à 25 m), la dispersion reste vers 10 MOA quelle que soit la distance : elle vient
  surtout du tireur, et une munition de pistolet se juge en appui stable.
- Moyenne glissante sur la courbe (v18) : pour les courbes d'écart-type radial, un pointillé donne l'écart-type mis
  en commun sur les 3 dernières séances (tous leurs coups). Il ne s'affiche que pour un même tireur et une même arme,
  et en mm pour une même distance : en mm, mêler 10 et 25 m faisait monter la courbe sans que le tir change. Un cumul
  depuis la première séance a été écarté : il devient inerte et cache les progrès. L'info-bulle reste dans le cadre
  et touche aussi le premier et le dernier point.
- Mode Longue-Vue (v19 écrit par l'utilisateur, corrigé en v20) : la caméra filme la cible à l'oculaire. « Caler la
  cible » prend l'image de référence et exige les trois cordons (r = 50, 75, 100). Toutes les 3 s, l'image passe par le
  mode séries, avec 1 coup annoncé et les coups estimés (est) ignorés. Un trou nouveau n'est annoncé à la voix (points,
  heure, « environ » près d'un cordon) qu'après deux images de suite au même endroit, à 4 mm près. Sinon, l'état est
  rendu tel qu'avant l'image. La séance se retrouve dans l'onglet Analyse. Rejeu des vraies séries (plusieurs coups
  entre deux images, ce qui n'est pas le cas réel) : aucune annonce sur une cible inchangée ; le 11/10, 17 annonces
  sur 18 tombent à moins de 3 mm d'un coup noté, et 3 coups sur 20 sont manqués ; une image décalée et éclaircie,
  vue deux fois, a créé un faux trou. Environ 2 s de calcul par image sur la machine de test, sans doute plus sur le
  téléphone. **Rien n'a été testé à travers une longue-vue.**
- Banc d'essai élargi (v21) : séance du 23/10/2026 (P320 X-Carry, 15 m, fond bleu, 6 × 5 coups), 27 coups sur 30 à 3 mm.
  Ses erreurs : trois faux trous sur l'ombre du carton courbé en haut de la photo 5, la déchirure à droite du centre
  du 10 (trois coups à moins de 8 mm, en séries 1, 3 et 5 : lambeaux qui bougent d'une photo à l'autre), deux trous
  collés en série 4 comptés pour un, un trou sur le « 9 » coupé en deux. La v21 rejette, dans la zone claire, un
  candidat au contour mou (moins de 2,5 × le seuil de netteté) ET allongé (plus de 1,7) : sur les 5 séances, les faux
  trous d'ombre sont à 1,3–2 × le seuil et 1,9–4,9 d'allongement, les 13 vrais trous du clair à 3,3 × au moins et
  1,6 au plus. Résultat : 5 → 3 impacts en trop sur le 23/10 (série 5 : 48 points comme l'utilisateur, au lieu de 52),
  aucun changement sur les autres séances.
- Rotation entre photos (v22). Mesure de référence hors de l'appli : corrélation angulaire, sur 360°, de chacun des trois
  anneaux de chiffres (9, 8, 7) entre la photo k et la photo 1 ; les trois concordent à 0,05° près sur 11 paires de photos.
  Sur le 23/10, la v21 (centre des pixels blancs des quatre « 9 ») donnait 1,44 / 0,77 / 0,73 / −0,11 / 0,70° pour
  1,79 / 1,17 / 1,97 / 1,54 / 2,88° réels : un trou dans la fenêtre d'un « 9 » et la photo 1 penchée de 3,6° faisaient
  manquer 0,3 à 0,5° à chaque photo, et l'erreur s'accumulait. Autres séances : écart de 0,33° au plus. La v22 corrèle les
  anneaux sur le calage brut de chaque photo (pas sur le repère recalé : le décalage tiré des trous, près de 1 mm, faisait
  tomber la corrélation de 0,8 à 0,5 et l'angle s'égarait), puis ajoute la rotation de la photo précédente. Résultat :
  toutes les rotations à 0,1° de la référence ; 23/10 : 28 sur 30 et 2 en trop (au lieu de 27 et 3), un faux trou du
  clair en série 4 disparaît (ancien trou mal retiré) et la déchirure en haut à droite est découpée en deux coups ;
  écart au comptage de l'utilisateur : 1 point (série 3) au lieu de 2. Aucun changement de points ni de comptage sur
  les autres séances ; des trous bougent de moins de 1 mm, un faux impact du 11/10 (série 5, au bord du visuel) de 1,8 mm.

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

**Cible vue 25 % trop petite (v12).** Le 04/10/2026, une photo prise depuis l'appli a donné 71 « impacts » posés
sur le bord du visuel noir. Le calage cherche le visuel sur une copie réduite à 720 pixels, où un cordon blanc ne
fait qu'un ou deux pixels. Quand il survit à la réduction, il coupe le visuel en un disque et des couronnes ;
seul le disque intérieur au cordon du 8 (ou du 9) a une forme de disque, il était pris pour le visuel entier.
La couronne noire tombait alors là où l'appli attend du papier blanc. Reproduit sur 17 photos de contrôle sur 56
(les deux photos du 04/10 recadrées ou redimensionnées), corrigé de trois façons : un bord du visuel n'est accepté
que si le papier reste clair au-delà ; si les trois anneaux ne sont pas retrouvés, on réessaie aux échelles
100/75 et 100/50, puis avec une fermeture morphologique ; sans bord ni deux anneaux, le calage est signalé
douteux et rien n'est détecté. Le réessai aux autres échelles corrige seul les 56 photos, la fermeture aussi ;
la fermeture reste pourtant en dernier recours. Elle n'est pas appliquée d'office : elle déplaçait le calage des photos saines de quelques dixièmes de mm, assez pour
faire réapparaître le « 4 » du bas comme impact et fusionner deux coups d'une déchirure sur la série 2 du 04/10.

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

## La séance du 04/10/2026

P320, 9 mm, Magtech 124 gr, 25 m, appui, 20 coups en deux séries. Photos dans `tests/photos/`, reçues déjà
recompressées en 1500 × 2000 sans métadonnées. Les recadrages `_recadree` (200 px en moins en haut) servent au
test du calage.

| Série | Trouvés automatiquement | Points |
|---|---|---|
| 1 | 10 sur 10 | 70 |
| 2 | 10 sur 10 (déchirure de gauche découpée en 4) | 74 |
| Total | 20 sur 20 | 144 |

L'utilisateur a enregistré ce résultat tel quel. Deux impacts sont à moins d'1 mm d'un cordon : le n° 2 de la
série 1 (0,3 mm du cordon du 7, compté 6) et le dernier de la série 2 (0,8 mm du cordon du 6, compté 6). Le premier
n'a pas été vérifié à la jauge. Lors d'un autre essai, l'utilisateur a obtenu 19 sur 20 à cause d'un double impact
très proche ; ce cas n'a pas été reproduit sur ces fichiers.

## La séance DDM4 .300 BLK (25 m, v13)

Daniel Defense DDM4 300S, .300 AAC Blackout supersonique, 25 m, 15 coups en trois séries de 5 sur une cible C50
à 10 blanc. Fond noir derrière la cible : les trous sont noirs, y compris dans le visuel. Comptage de l'utilisateur
à la jauge : 50, 50, 49 = 149. Le coup à 3 h de la série 1 touche le 10 de 0,2 à 0,3 mm (mesure photo : 0,5 à 0,8 mm),
alors que le trou visible ne touche pas le blanc. Mesures au pied à coulisse : trou n° 1, ouverture 7,80 mm et
8,22 mm avec la corolle ; trou n° 2, 5,58 et 6,00 mm. Le trou est plus petit que l'ogive (7,82 mm), au contraire
du 9 mm rond qui arrache le carton.

Cette séance a révélé trois défauts, corrigés en v13.

**Perspective doublée (v8 à v12).** Le centre de la cible était juste, mais le décalage des anneaux était appliqué
deux fois : jusqu'à 3 à 5 mm d'erreur au bord du visuel sur une photo de biais. Mesuré indépendamment (cercles
ajustés sur l'image brute) : après correction, le bord du visuel tombe à 100 ± 0,4 mm sur 16 rayons, sur toutes
les photos. Effets : un faux impact sur le bord du visuel (série 3 DDM4), l'impact n° 4 du 02/10 passe de 10 à 9
comme à la jauge, plusieurs impacts du 04/10 bougent de 1 à 4 mm sans changer le total.

**Coups cachés dans le groupement.** À 25 m à la carabine, les coups se chevauchent : le mode séries effaçait
4 coups sur 15 avec les anciens trous. La surface gagnée par chaque déchirure les retrouve tous (149 points,
égal au comptage). Le même calcul place le coup de la série 3 du 02/10, en zone et en points justes, mais à 17 mm
de la position notée par l'utilisateur.

**Rotation entre photos fausse de 4 à 5°.** Avec des trous tous près du centre, une rotation les déplace trop peu
pour être mesurée sur eux. Les quatre « 9 » imprimés la donnent à 0,02° près (essai sur une photo tournée de 3°).

## La séance du 11/10/2026 (9 mm, 25 m) : premier banc d'essai

P320, Magtech 124 gr, 25 m, deux mains debout, 30 coups : 10, puis quatre séries de 5. Photos dans `tests/photos/`,
reçues sans métadonnées. Vérité terrain : les positions de la sauvegarde `.json` de l'utilisateur, après ses
corrections au stand (`tests/verite-2026-10-11.json`). Son total : 72, 40, 37, 43, 39 = 231.

Résultat de la v14 : 28 coups sur 30 retrouvés à 3 mm dans la bonne série, 4 impacts en trop, 248 points. Les deux
coups manqués (série 1 dans le 7 en haut à gauche, série 3 dans le 7 en haut à droite) sont des trous du visuel
noir vus une série trop tard. Le fond vu à travers était brun-gris, de la luminance du carton noir (écart de −1 à
−13) : seul un écart de teinte les trahit, juste sous le seuil (33 pour 34). Le reste en découle : faute de trouver
le coup annoncé, l'appli découpe à tort un trou voisin, puis compte le trou en retard dans une série suivante.

Mesure de la teinte : indice de chaleur (bleu en moins + rouge en plus par rapport au carton) de 11 à 15 dans les
trous ratés, sous 10 sur le carton noir intact (sous 8 dans 99,9 % des pixels). Essai d'un critère « chaleur ≥ 10
dans le noir » : série 2 parfaite, mais un faux impact sur un chiffre « 8 », un trou du groupe perdu et le trou de
la série 3 toujours raté, soit 26 sur 30. Non retenu. Piste pratique sans code : un fond clair derrière la cible.

## Pistes d'évolution

L'utilisateur a dit avoir des idées d'évolution sans les avoir encore détaillées : demande-les lui avant de
proposer les tiennes. Ce qui a été évoqué ou qui découle des limites :

- Tester le .300 Win Mag (100 et 200 m), le .300 BLK subsonique (trous ovales possibles) et la C50 à 10 noir.
- Cibles vierges des deux modèles, promises par l'utilisateur : test « zéro impact » et calage du modèle à 10 noir.
- Enrichir le banc d'essai à chaque séance réelle : photos + sauvegarde `.json` (vérité terrain), puis régler la détection
  des trous sur fond sombre sur l'ensemble des séances.
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
