# Pointage C50

Application web autonome qui analyse la photo d'une cible de tir C50 : elle retrouve les impacts,
compte les points selon la règle ISSF, mesure le groupement (écart-types, point moyen d'impact)
et garde un historique des séances. Elle sert à un seul tireur, sur son téléphone Android, au stand
et sans réseau.

Ce fichier donne l'essentiel. L'historique des décisions et les mesures de terrain sont dans
`docs/PASSATION.md` : lis-le avant de toucher à la détection.

## Avec qui tu travailles

L'utilisateur est tireur sportif. Il n'est pas développeur et découvre GitHub : explique chaque manipulation
pas à pas, sans jargon, et propose toujours le chemin le plus simple.

- Réponds en français, d'un ton direct. Phrases de longueur variée, pas de transitions lourdes,
  pas de listes quand un paragraphe suffit.
- Ne valide jamais une affirmation sans la vérifier. S'il se trompe, dis-le clairement. Si tu ne peux
  pas vérifier, dis « je ne peux pas vérifier ».
- Termine une analyse par ton niveau de confiance (élevé, moyen, faible) et par la meilleure décision.
- Son poste Windows n'a ni Node ni terminal de développement : tout se fait dans les sessions cloud.
- Il juge l'appli sur ses vraies cibles. Une affirmation du type « la détection marche » doit s'appuyer
  sur les photos de test, jamais sur une cible de synthèse seule.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Toute l'application : HTML, CSS et JavaScript dans un seul fichier. |
| `sw.js` | Service worker : cache pour le fonctionnement hors ligne. |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` | Installation comme appli (PWA). |
| `tests/detection.test.cjs` | Test de non-régression de la détection. |
| `tests/photos/` | Séances réelles : 02/10/2026 (9 mm, 10 m, 3 photos), 04/10/2026 (9 mm, 25 m, 2 photos, plus deux recadrages pour le calage), DDM4 .300 BLK (25 m, 3 photos de 5 coups ; la série 1 porte les annotations au pied à coulisse de l'utilisateur), 11/10/2026 (9 mm, 25 m, 5 photos : 10 + 5 + 5 + 5 + 5 coups), 23/10/2026 (P320 X-Carry, 9 mm, 15 m, fond bleu, 6 photos de 5 coups). |
| `tests/attendu*.json` | Résultats de référence, vérifiés sur l'image et contre le comptage de l'utilisateur. |
| `tests/verite-*.json` | Vérité terrain : positions de l'utilisateur après correction, tirées de sa sauvegarde `.json`. Base du banc d'essai. |
| `docs/PASSATION.md` | Historique, mesures au pied à coulisse, décisions et pistes. |

## Mise en ligne

GitHub Pages publie la branche `main`, dossier racine. **Tout commit sur `main` est en production
en une à deux minutes**, sur le téléphone de l'utilisateur. Travaille donc sur une branche, fais passer le test,
puis propose la fusion.

À chaque livraison :

1. Incrémente le numéro de version affiché sous le titre : cherche `· v23` dans `index.html`.
2. Incrémente le nom du cache dans `sw.js` (`pointage-c50-v23`).
3. Dis à l'utilisateur quel numéro il doit lire sur son téléphone pour confirmer la mise à jour.

Les séances sont stockées dans le `localStorage` du téléphone (`c50_seances`, `c50_settings`,
`c50_hmetric`, et depuis la v15 `c50_tireurs` : la liste des tireurs et de leurs armes ; depuis la v16, chaque arme
porte aussi `click` et `unit`, la valeur d'un clic de ses organes de visée ; depuis la v23, `c50_lvcam` garde l'objectif et le zoom choisis en mode Longue-Vue). **Ne change jamais leur format sans conserver la lecture de l'ancien** : il n'existe
aucune autre copie que les sauvegardes `.json` que l'utilisateur fait à la main. Une séance contient
`shots: [[x, y, série, pointsCorrigés?], …]` en millimètres, origine au centre, y vers le haut.
Depuis la v15, une séance peut porter `tireur` : le nom d'un autre tireur. Les séances du propriétaire du
téléphone (le premier de `c50_tireurs`) n'ont **pas** ce champ, celles d'avant la v15 non plus : elles suivent son
nom même s'il le renomme. « Restaurer » reprend ses propres séances ; « Importer un tireur » range la sauvegarde
d'un autre tireur à son nom, avec des identifiants préfixés `t-<nom>-` pour ne jamais se mélanger aux siennes.

Le même `index.html` a aussi tourné comme page hébergée par Claude, où `window.claude.use("db")`
et `use("downloads")` existent. En version autonome `window.claude` est absent : l'historique passe
par `localStorage` et les exports par un lien de téléchargement. Garde ces deux branches intactes.

## La cible et le calcul des points

Cible C50 (GEF n° 50, précision pistolet ISSF) : zones de 25 mm de large, zone 10 de rayon 25 mm,
visuel noir de rayon 100 mm (zones 7 à 10), 10 intérieur de rayon 12,5 mm. Deux modèles existent :
centre du 10 blanc (celui utilisé ici) ou noir. Le code détecte lequel.

Règle du cordon : un impact compte la zone supérieure dès que le bord de l'ogive touche le cordon.
On calcule donc avec `distance au centre − calibre / 2`, et avec le diamètre de l'ogive (9 mm), pas
celui du trou visible. À moins de 0,4 mm d'un cordon, le calcul ne tranche pas : l'appli l'affiche
avec ≈ et laisse l'utilisateur corriger les points à la main (`h.o`).

## La détection, dans l'ordre (`detectHoles`)

1. **Calage** (`calibrate`, qui appelle `autoCalib` puis `refineCalib`). Le visuel noir donne une première ellipse. Puis on relève
   sur 240 rayons les cordons blancs du 9 (r = 50) et du 8 (r = 75) et le bord du visuel (r = 100).
   Le décalage de leurs centres, proportionnel à r², donne la perspective. Modèle :
   `p = c0 + M·u / (1 + w·u)`. Sans cette étape le centre est faux de 3 mm sur une photo prise de biais.
   Le cercle de rayon r a pour image une ellipse décalée de −M·w·r² (pas r²/2 : erreur des v8 à v12, qui
   doublait la perspective et déplaçait de 3 à 5 mm les points proches du bord du visuel).
   Si les trois anneaux ne sont pas retrouvés, le disque noir pris au départ était sans doute l'intérieur
   d'un cordon : on réessaie à l'échelle 100/75 et 100/50, puis avec une fermeture morphologique. Sans bord
   du visuel ou avec un seul anneau, le calage est « douteux » : rien n'est détecté, l'utilisateur recale.
2. **Masque « pas du papier »**. Le carton n'a que deux teintes. Un pixel qui s'écarte de la teinte
   locale attendue (luminance et couleur, par cellules de 40 mm) est un candidat. Cette méthode ne
   dépend pas de ce qu'il y a derrière la cible.
3. **Nettoyage** : fermeture puis ouverture morphologiques, qui effacent cordons et chiffres.
4. **Tri par la forme** : on rejette ce qui touche le bord de la photo, ce dont le contour est flou
   (ombres), ce qui est démesuré, et les fragments de chiffres imprimés.
5. **Taille d'un trou isolé**, apprise sur la cible et bornée par les mesures au pied à coulisse,
   séparément sur le noir et sur le clair.
6. **Nombre d'impacts par trou** : un trou nettement plus grand que la normale est découpé (k-means).
   Si le nombre de coups annoncé n'est pas atteint, le reste est signalé « non localisé », jamais inventé.
7. **Centre de l'impact** : sur l'ouverture (le vide), pas sur les fibres arrachées.
8. **Séries** : à la photo suivante, on recale sur la précédente puis on retire tout ce qui était
   déjà troué. Seuls les nouveaux trous sont comptés. Depuis la v22, la rotation entre photos vient de la
   corrélation des trois anneaux de chiffres blancs (9, 8 et 7, entre 29 et 96 mm) relevés sur le calage brut
   de chaque photo (`ringPolar`, `ringRotation`) ; à défaut, des quatre « 9 » (`digitAngles`). Les trous
   n'affinent que le décalage. Sur un groupement serré, les trous seuls se trompaient de 4 à 5° ; les quatre « 9 »
   seuls dérivaient sur le 23/10 (2,2° d'erreur à la photo 6), un trou près d'un chiffre tirant leur mesure.
9. **Coups tombés dans une déchirure** (mode séries, seulement s'il manque des coups annoncés) : pour chaque
   déchirure, surplus = surface gagnée depuis la photo précédente − surface des nouveaux impacts comptés
   dedans. Chaque coup manquant va à la déchirure au plus grand surplus (au moins 0,4 trou isolé), en
   position estimée (`est`, pointillé). Le bruit d'une photo à l'autre reste sous 0,5 trou. La surface dit
   où, jamais combien : le nombre vient de l'utilisateur.

## Tester avant de livrer

```
npm install
npx playwright install chromium
npm test
```

Le test rejoue la séance du 02/10/2026 et compare à `tests/attendu.json` : 9, 10 puis 9 impacts
localisés, 265 points en automatique. Après les trois corrections manuelles de l'utilisateur, la séance vaut
283 points sur 300 (91, 93, 99). Depuis la v13 (perspective corrigée, coup caché placé), l'automatique donne 82, 175 puis 274 :
l'impact n° 4 passe à 9 comme à la jauge, et le coup ajouté à la main en série 3 est placé, compté 10.
Il rejoue aussi la séance du 04/10/2026 (25 m) : 10 puis 10 impacts, 70 + 74 = 144 points ; la séance
DDM4 .300 BLK (25 m, 5 + 5 + 5) : 15 coups, 50, 50 et 49 points, égal au comptage de l'utilisateur à la
jauge (149), dont 5 coups placés dans des déchirures ; et le calage sur deux recadrages qui le faisaient
échouer en v11.

**Banc d'essai (vérité terrain).** Pour la séance du 11/10/2026, le test compare aussi l'appli aux 30 positions
corrigées par l'utilisateur (`tests/verite-2026-10-11.json`) : coups retrouvés à 3 mm dans la bonne série, et
impacts en trop. Niveau de la v14 : 28 sur 30, 4 en trop. Même banc pour la séance du 23/10/2026
(`tests/verite-2026-10-23.json`) : 28 sur 30, 2 en trop depuis la v22. Le test vérifie aussi chaque rotation entre
photos à 0,2° près contre une référence (`rotRef`) mesurée hors de l'appli sur les trois anneaux de chiffres. Attention :
la vérité terrain hérite du recalage de l'appli du téléphone pour les coups non déplacés, elle ne juge pas la rotation. Le plancher échoue si l'on recule ; quand une
amélioration le dépasse, relève-le. Chaque nouvelle séance avec photos et sauvegarde `.json` s'ajoute de la
même façon : c'est sur l'ensemble des séances qu'on règle la détection, jamais sur une seule.
Dans la session cloud, si Playwright ne trouve pas son navigateur, lance le test avec
`PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm test`. N'utilise `--record` qu'après avoir regardé le résultat sur l'image :
réécrire la référence pour faire passer un test, c'est perdre le garde-fou.

## Limites connues, à ne pas présenter comme résolues

- Une balle passée entièrement dans un trou existant ne laisse aucune trace. Aucune méthode sur photo
  ne la retrouvera.
- Un trou dont le carton s'est refermé n'est pas vu : sur la photo 1, deux balles superposées à 4 h
  ont été comptées pour une.
- Dans les grandes déchirures, le nombre d'impacts est fiable avec le mode séries, mais leur position
  est estimée. Sur le 02/10, le coup placé en série 3 tombe à 17 mm de la position notée par l'utilisateur
  (même zone, même score) : ne présente jamais une position estimée comme mesurée.
- Validé sur trois séances réelles : 9 mm à 10 et 25 m, .300 BLK supersonique à 25 m. Rien n'a été testé au
  .300 Win Mag, en subsonique, au-delà de 25 m, ni sur le modèle de C50 à 10 noir.
- Au .300 BLK, le trou visible est plus petit que l'ogive (5,6 à 7,8 mm pour 7,82 mm) : près d'un cordon,
  le comptage à l'œil peut donner un point de moins que la jauge et que l'appli.
- Fond sombre derrière la cible : à travers un trou du visuel noir, il peut avoir la luminance du carton.
  Le trou ne se distingue plus que par sa teinte, plus chaude, et passe sous le seuil (11/10 : deux trous
  vus une série trop tard). Un critère de teinte essayé seul a fait pire (26 sur 30) : à régler sur plusieurs séances.
- La détection reste sensible à de petits écarts de calage : un décalage de quelques dixièmes de mm
  suffit à faire apparaître un fragment de chiffre ou à changer le découpage d'une déchirure.
- Mode Longue-Vue : jamais testé à travers une longue-vue, seulement en rejouant des photos. Un reflet ou un décalage
  qui se répète sur deux images peut être annoncé comme impact ; une balle passée dans un trou existant ne l'est pas.
- Ombre portée sur la zone claire (carton courbé en haut) : depuis la v21, un morceau de cordon épaissi par l'ombre,
  allongé et au contour mou, est rejeté (3 faux trous de moins le 23/10). Une ombre plus nette ou un vrai trou très
  allongé dans le clair pourraient passer du mauvais côté de la règle : elle n'est réglée que sur 5 séances.
- La rotation de la première photo n'est pas corrigée (seule la rotation entre photos d'une série l'est) :
  une photo penchée fausse la répartition horizontal/vertical, pas le score.

## À ne jamais faire

- Publier un keystore, un `.apk` ou `signing-key-info.txt` : le dépôt est public.
- Ajouter des photos montrant autre chose que la cible, ou contenant des métadonnées de localisation.
- Remplacer un impact « non localisé » par une position inventée pour atteindre un total.
- Annoncer un score ou un taux de réussite sans l'avoir mesuré sur les photos de test.
