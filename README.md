# Pointage C50

Application web autonome pour analyser une cible de tir C50 à partir d'une photo : détection des
impacts, points ISSF, groupement, coups écartés et historique des séances.

Elle fonctionne hors ligne une fois installée depuis le navigateur du téléphone. Les données restent
sur l'appareil.

- Fonctionnement et règles de travail : [`CLAUDE.md`](CLAUDE.md)
- Historique du projet et mesures de terrain : [`docs/PASSATION.md`](docs/PASSATION.md)
- Vérifier la détection : `npm install`, `npx playwright install chromium`, puis `npm test`
