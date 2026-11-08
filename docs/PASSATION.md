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

## Ce que fait l'application (version 27)

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
- Choix de l'objectif en mode Longue-Vue (v23) : sur le Samsung S21 de l'utilisateur (d'abord annoncé comme un S10), l'image vidéo à travers
  l'oculaire était minuscule alors que l'appareil photo Samsung marchait bien. facingMode « environment » laisse le
  navigateur choisir parmi les trois caméras arrière. L'appli liste désormais les caméras, ouvre par défaut la
  principale (« camera2 0, facing back » sous Chrome Android, non vérifié sur ce téléphone), propose un menu
  « Objectif » et, si la caméra le permet, un curseur de zoom ; choix et zoom sont gardés dans c50_lvcam. Résolution
  demandée : 3840×2160 (le navigateur donne ce qu'il peut). Changer d'objectif ou de zoom impose de recaler la cible.
  Testé avec une caméra simulée à quatre objectifs, pas sur le téléphone.
- Premier essai réel du mode Longue-Vue (27/10, S21, SV28) et v24. Chrome y voit deux caméras arrière nommées
  « camera 0, facing back » et « camera 2, facing back » (le téléobjectif n'est pas proposé) et deux avant ; la
  caméra 0 offre un zoom. Le calage échouait : à travers l'oculaire, le plus sombre de l'image est le cadre noir
  autour du cercle, pas le visuel (gris) ; autoCalib l'écarte (il touche les bords) et abandonne. v24 : au calage,
  le disque clair de l'oculaire est repéré (pixels au-dessus de 0,3 × le 95e centile, bords de l'image sombres,
  zone claire en disque), chaque image est recadrée dessus et le noir autour repeint de la couleur du papier. Sur la
  capture de l'utilisateur, le visuel est alors trouvé avec les cordons du 8 et du bord, pas celui du 9 : calage
  toujours refusé. Image à environ 2 px/mm, floue, croissant d'ombre (téléphone décentré), cible à 10 noir (jamais
  testée). Aussi en v24 : bouton « Enregistrer l'image » (image brute de la caméra en JPEG, sans métadonnées), les
  trous vus au calage ne servent plus que de référence (bilan et séance ne comptent que les coups tirés ensuite),
  noms « camera N » reconnus. Testé sur une longue-vue simulée avec les photos du 23/10 : série 2 annoncée en
  5 coups, 48 points comme l'utilisateur.
- Images enregistrées à l'oculaire le 28/10 (S21, SV28, cible à 10 noir, fond sombre) et v25. Image entière : oculaire
  repéré, trois cordons, calage juste (cordons calculés posés sur les cordons imprimés), environ 4 px/mm. Images trop
  zoomées (visuel coupé) : calage refusé, comme voulu. Détection : aucun des vrais trous vu (taches à peine plus
  sombres que le visuel), 49 faux trous au calage (bord de l'oculaire côté croissant d'ombre, chiffres blancs).
  Tremblements simulés (6 à 15 px, < 1°) : 9 faux impacts annoncés en 6 images. v25 : (1) le bord réel du champ est
  relevé à chaque image sur 180 rayons, en partant de 1,08 × le rayon vers l'intérieur (premier pixel clair, médiane
  de 7 rayons, marge de 4 % du rayon) et tout ce qui est au-delà est repeint couleur papier ; (2) un trou n'est annoncé
  qu'après trois images de suite au même endroit (4 mm). Sur 45 images bougées : 0 faux impact annoncé ; 16 faux trous
  au calage (chiffres, liseré), qui ne comptent pas. Reste à faire : rendre les vrais trous visibles (adaptateur de
  digiscopie, fond clair) ; si besoin, détection par différence entre images, à évaluer sur une paire avant/après tir.
- v26, référence glissante en mode Longue-Vue. Deux nouvelles images à l'oculaire (28/10, plus de lumière) : calage
  juste sur les deux (trois cordons, ~3,6 px/mm), vrais trous toujours invisibles. Données l'une après l'autre, la
  cible n'ayant pas changé : 1 et 5 fausses annonces, des chiffres imprimés qui changent d'aspect (échelle +3 %,
  luminance du visuel +14 %, du papier +6 %). Corrections : (1) une image sans trou nouveau devient la référence de la
  suivante ; tant qu'un trou attend sa confirmation, la référence ne bouge pas ; (2) mesures globales à chaque image
  (échelle, luminance du visuel à 55–70 mm et du papier à 105–120 mm, hors des axes) : écart > 2 % d'échelle ou > 8 %
  de lumière, l'image devient la référence sans annonce ; (3) marge d'exclusion autour de l'existant portée de 1 à
  2 mm (state.exclCells, mode Longue-Vue seulement) ; (4) images suivantes acceptées avec le bord du visuel et un seul
  cordon (le calage initial en exige toujours trois). Résultats : 0 fausse annonce sur la paire réelle et sur 45 images
  bougées ; longue-vue simulée avec les photos des séries 2 et 3 du 23/10 (même lumière) : 4 impacts annoncés,
  « 9 points » à 3, 9, 4 et 4 heures, les 4 coups séparés de la série 3 ; le 5e, dans la déchirure, n'est pas vu.
- Stand du 01/11 et v27. Mode Longue-Vue : voix muette. Photos prises après chaque coup (5 coups, 25 m, cible à 10
  noir, soleil en bande), importées en mode photo : 4 coups sur 5, 15 faux trous. Causes, vérifiées sur les photos et
  sur les captures de l'utilisateur : (1) les chiffres blancs « 8 » et « 9 » du visuel, éclatants, survivent au nettoyage
  à ~3,7 px/mm ; ils entrent aussi dans la mémoire « déjà troué », même supprimés à la main, et deux coups tombés sur le
  « 9 » et le « 8 » du bas étaient perdus ; (2) le champ de l'oculaire déborde de l'image : la méthode du disque entier
  (v24) ne le voyait plus, d'où des faux trous au bord sombre ; (3) en direct, la confirmation exigeait le même ensemble
  de trous sur trois images. La bande de soleil ne donnait qu'un faux trou. Corrections : (1) candidat « chiffre »
  (centré à 3 mm sur l'emplacement, ≥ 20 % d'encre claire neutre, < 30 % de sombre) écarté avant la mémoire ; mesures :
  chiffres 22–91 % d'encre et 2–15 % de sombre, vrais trous 94–100 % de sombre ; exception en mode séries pour un candidat
  nouveau de la taille d'une balle (coup du 11/10 au centre du « 7 » : 64 mm², chiffres apparus après coup ≤ 48 mm²).
  Deux essais écartés : écarter les pixels d'encre un à un (11/10 : 28 → 14 puis 25 coups) ; (2) cercle de l'oculaire
  ajusté par moindres carrés sur le contour clair/noir extérieur (quatre passes de 25 % à 4 %), aucune des 21 photos
  ordinaires du banc ne le déclenche ; recadrage limité à la photo (peindre au-delà créait des faux trous le long des
  côtés) ; bord du champ traité comme le bord d'une photo (3 mm) ; photos importées à l'oculaire recadrées aussi ;
  (3) confirmation trou par trou ; en direct, chiffres écartés sans exception, tolérance 5 mm sur l'axe et 4,5 sur le rayon.
  Résultats : 01/11 en mode photo 5/5 et 4 en trop ; les quatre autres séances inchangées ; rejeu en direct du 01/11 :
  4 coups annoncés sur 4, 1 fausse annonce ; 45 images bougées et paire du 28/10 : 0 fausse annonce.
- Séance longue-vue du 06/11 (30 photos, cible à 10 blanc, 25 m) et v28. Reconstitution : 25 trous, un par photo sauf
  photos 21–23, 27, 30 ; JSON de l'utilisateur incomplet (20 coups, série 19 vide, s'arrête à la photo 20), à refaire avant
  d'entrer au banc. Rejeu v27 (1 coup par photo utile) : 11 coups sur 25 à la bonne photo, 12 faux trous (chiffres doublés
  par le flou, décalés de 3 à 6 mm de leur emplacement), 6 coups estimés hors du carton. Critère « noirceur seule »
  vérifié et écarté : vrais trous 16–100 % de sombre (médiane 87 %), les deux coups tombés sur un chiffre à 16 et 41 %.
  Retouches d'image essayées (contraste, gris, négatif) : aucune nette amélioration, le négatif fait échouer le calage.
  v28 (saisie) : séries vides affichées, « Annuler la dernière photo », alerte photo identique ou sans trou, suppression
  d'une série dans l'historique, numéro de série près de chaque impact, aucune estimation dans une déchirure qui touche un
  bord. Banc inchangé. 06/11 en v28 : 9 coups sur 25 à la bonne photo, 14 faux, 3 estimés dans la cible (1 juste) ; l'écart
  avec la v27 vient du recalage par les trous, instable sur ces photos (décalage de 3 à 4 mm aux photos 8–9). Essai
  d'une variante sans estimation sur les images d'oculaire : rejeté, la séance DDM4 tombait (149 → 129 points), signe que ses photos sont recadrées comme prises à l'oculaire : à vérifier.
- v29, import par lot, demandé par l'utilisateur après la saisie du 06/11 (30 photos une à une). Tri par le dernier
  groupe de chiffres du nom (numérotation de la galerie Android), sinon par date du fichier. Coups modifiables photo par
  photo (séries de 1 à 5 coups). Chaque série garde son calage (poignées, perspective) ; les impacts sont tenus en mm et
  replacés sur la photo de la série affichée, les séries suivantes mises de côté. Enregistrer revient d'abord à la
  dernière série, pour tout sauver. Essai sur le 06/11 : 30 photos analysées en ~40 s sur la machine de test, mêmes
  impacts par série que l'import photo par photo ; banc inchangé.
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

## La séance du 06/11/2026 (9 mm, 25 m, mode Longue-Vue) : au banc depuis le 08/11

Trente images de la caméra en mode Longue-Vue (2160 × 3840, ramenées à 2600 px comme le fait l'appli), cible à 10 blanc,
un coup par photo. Vérité terrain : sauvegarde de l'utilisateur refaite avec l'import par lot (v29). Comparée aux photos
recalées entre elles : 29 coups laissent une trace nouvelle à la position notée. Le coup de la série 21 est noté dans le
trou de la série 19 (0,5 mm) sans aucune trace nouvelle : aucune méthode sur photo ne le retrouvera. Une première
reconstitution (« 25 trous », 08/11) avait manqué les coups des photos 22, 23, 27 et 30, tombés dans ou contre une
déchirure existante. L'utilisateur signale que les photos où la détection peine sont fortement floues.

Niveau v29 : 14 sur 30 à 3 mm dans la bonne série, 19 en trop. Sept séries ne donnent rien ; le recalage par les trous
dérive de 2 à 3,5 mm aux photos 6 et 11 (zoom changé) et 8-9 (floues), d'où un plafond `decalageMax` de 3,5 mm propre
à cette séance. C'est la séance la plus dure du banc : la régler sans faire reculer les quatre autres.

## v30 (08/11/2026) : recalage par l'image et contrôle par la photo précédente

Sur le 06/11, le recalage par les trous s'égarait de 2 à 4 mm (photos floues, zoom changé) : tous les chiffres
imprimés devenaient de nouveaux trous, et les vrais coups étaient pris pour d'anciens trous. Le décalage entre photos
vient désormais de l'image entière : relief (gradient de luminance) relevé tous les 0,5 mm entre 15 et 105 mm du centre,
corrélé à celui de la photo précédente pour la rotation donnée par les anneaux (pic net exigé, sinon retour aux trous).
Sur les cinq autres séances il tombe sous 0,1 mm (au lieu de 0,25 à 0,5 mm), mêmes points. Essai d'affinage par les
trous à ± 0,5 mm : le banc recule (23/10 : 29 → 28 sur 30, 06/11 : 27 → 24), abandonné.

Photos à la longue-vue seulement : carte de ce qui a changé depuis la photo précédente (luminance lissée sur 1,5 mm,
corrigée de l'écart local de lumière). Mesuré sur le 06/11 : un vrai coup assombrit 20 à 63 mm² dans un disque de
5,5 mm ; un chiffre ou un ancien trou repris à tort, au plus 22, et un chiffre flou s'éclaircit autant qu'il
s'assombrit. Règle : un nouvel impact doit avoir assombri au moins 18 mm² et s'éclaircir de moins de 0,9 fois autant ;
s'il manque des coups annoncés, les zones assombries les plus fortes (au moins 18 mm², à plus de 7 mm d'un impact de
la série) deviennent des impacts, avant les positions estimées. Appliquée aux photos sur papier, elle faisait perdre
15 coups sur 60 (11/10, 23/10) : là, un trou du visuel noir éclaircit souvent. Un apprentissage du sens zone par zone,
sur les anciens trous, a été essayé et rejeté (06/11 : 11 sur 30).

Banc après v30 : 06/11 27 sur 30, 3 en trop (14 et 19 en v29) ; 23/10 29 sur 30, 1 en trop ; 01/11 5 sur 5, 1 en trop ;
11/10 28 sur 30, 4 en trop ; 02/10, 04/10 et DDM4 : mêmes impacts et mêmes points (149 à la jauge). Temps ajouté par
photo sur ordinateur : environ 0,2 s.

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
