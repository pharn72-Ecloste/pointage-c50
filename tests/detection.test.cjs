// Test de non-régression de la détection : rejoue la séance du 02/10/2026 (3 photos, 10 coups chacune)
// et compare aux résultats de référence dans tests/attendu.json.
//   node tests/detection.test.cjs            -> vérifie
//   node tests/detection.test.cjs --record   -> réécrit attendu.json (à ne faire qu'après validation visuelle)
const path = require("path"), fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { console.error("Playwright manquant : lance `npm install` puis `npx playwright install chromium`."); process.exit(2); }

const ROOT = path.join(__dirname, ".."), PHOTOS = path.join(__dirname, "photos"), REF = path.join(__dirname, "attendu.json");
const SERIES = ["2026-10-02_serie1.jpg", "2026-10-02_serie2.jpg", "2026-10-02_serie3.jpg"];
const TOL_MM = 1.0;   // tolérance sur la position des trous isolés

(async () => {
  const opts = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};
  const browser = await chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("file://" + path.join(ROOT, "index.html"));
  await page.waitForFunction(() => window.__c50 && window.__c50.state.img);
  await page.fill("#fShots", "10");

  const load = async (input, file) => {
    const before = await page.evaluate(() => window.__c50.state.img);       // référence de l'image courante
    await page.evaluate(() => { window.__prevImg = window.__c50.state.img; });
    await page.setInputFiles(input, path.join(PHOTOS, file));
    await page.waitForFunction(() => window.__c50.state.img !== window.__prevImg, null, { timeout: 60000 });
    await page.waitForTimeout(500);
  };
  const snapshot = () => page.evaluate(() => {
    const c = window.__c50, shots = c.currentShots();
    return {
      mode: c.state.detectMode,
      parSerie: shots.reduce((a, s, i) => { const k = c.state.holes[i].s || 0; a[k] = (a[k] || 0) + 1; return a; }, {}),
      points: +document.getElementById("sTot").textContent,
      alignement: c.state.lastAlign ? { rot: +c.state.lastAlign.rot.toFixed(1), tx: c.state.lastAlign.tx, ty: c.state.lastAlign.ty } : null,
      perspectiveMm: c.state.persp.map(v => +(v * 5000).toFixed(2)),          // décalage du vrai centre, en mm
      isoles: shots.map((s, i) => ({ s: c.state.holes[i].s || 0, split: !!c.state.holes[i].split, x: +s.x.toFixed(1), y: +s.y.toFixed(1) })).filter(h => !h.split).map(h => [h.s, h.x, h.y]),
    };
  });

  const result = [];
  await load("#fileGal", SERIES[0]); result.push(await snapshot());
  await load("#fileNext", SERIES[1]); result.push(await snapshot());
  await load("#fileNext", SERIES[2]); result.push(await snapshot());
  await browser.close();

  if (process.argv.includes("--record")) { fs.writeFileSync(REF, JSON.stringify(result, null, 1)); console.log("attendu.json réécrit."); return; }

  const ref = JSON.parse(fs.readFileSync(REF, "utf8")); let ko = 0;
  const check = (label, ok, detail) => { console.log((ok ? "  ok  " : "  ÉCHEC ") + label + (ok ? "" : "  → " + detail)); if (!ok) ko++; };
  if (errors.length) check("aucune erreur JavaScript", false, errors.join(" | "));
  result.forEach((r, i) => {
    const e = ref[i]; console.log(`Photo ${i + 1}`);
    check("mode de détection", r.mode === e.mode, `${r.mode} au lieu de ${e.mode}`);
    check("impacts par série", JSON.stringify(r.parSerie) === JSON.stringify(e.parSerie), `${JSON.stringify(r.parSerie)} au lieu de ${JSON.stringify(e.parSerie)}`);
    check("total des points", r.points === e.points, `${r.points} au lieu de ${e.points}`);
    const far = e.isoles.filter(([s, x, y]) => !r.isoles.some(([s2, x2, y2]) => s2 === s && Math.hypot(x2 - x, y2 - y) <= TOL_MM));
    check(`trous isolés retrouvés à ${TOL_MM} mm près (${e.isoles.length})`, far.length === 0, `${far.length} manquant(s) ou déplacé(s) : ${JSON.stringify(far)}`);
    if (e.alignement) check("recalage entre photos < 1,5 mm et < 1°", Math.abs(r.alignement.tx) <= 1.5 && Math.abs(r.alignement.ty) <= 1.5 && Math.abs(r.alignement.rot) <= 1, JSON.stringify(r.alignement));
  });
  console.log(ko ? `\n${ko} vérification(s) en échec.` : "\nTout est conforme à la référence.");
  process.exit(ko ? 1 : 0);
})();
