// Test de non-régression de la détection. Rejoue les séances réelles et compare aux résultats de référence :
//   02/10/2026, 10 m : 3 photos de 10 coups, référence tests/attendu.json
//   04/10/2026, 25 m : 2 photos de 10 coups, référence tests/attendu-2026-10-04.json
//   DDM4 .300 BLK, 25 m : 3 photos de 5 coups, référence tests/attendu-ddm4-300blk.json
//     (comptage de l'utilisateur à la jauge : 50, 50, 49 = 149)
// Puis vérifie le calage sur des photos recadrées, qui faisaient voir la cible 25 ou 50 % trop petite avant la v12.
//   node tests/detection.test.cjs            -> vérifie
//   node tests/detection.test.cjs --record   -> réécrit les références (à ne faire qu'après validation visuelle)
const path = require("path"), fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { console.error("Playwright manquant : lance `npm install` puis `npx playwright install chromium`."); process.exit(2); }

const ROOT = path.join(__dirname, ".."), PHOTOS = path.join(__dirname, "photos");
const SEANCES = [
  { nom: "02/10/2026", ref: "attendu.json", photos: ["2026-10-02_serie1.jpg", "2026-10-02_serie2.jpg", "2026-10-02_serie3.jpg"] },
  { nom: "04/10/2026", ref: "attendu-2026-10-04.json", photos: ["2026-10-04_serie1.jpg", "2026-10-04_serie2.jpg"] },
  { nom: "DDM4 .300 BLK", ref: "attendu-ddm4-300blk.json", cal: "7.82|blk", coups: 5, comptage: [50, 100, 149],
    photos: ["ddm4-300blk-25m_serie1.jpg", "ddm4-300blk-25m_serie2.jpg", "ddm4-300blk-25m_serie3.jpg"] },
];
// photo recadrée de 200 px en haut -> même échelle, centre décalé de 200 px vers le haut
const RECADRAGES = [
  { photo: "2026-10-04_serie1_recadree.jpg", source: "2026-10-04_serie1.jpg", dy: -200 },
  { photo: "2026-10-04_serie2_recadree.jpg", source: "2026-10-04_serie2.jpg", dy: -200 },
];
const TOL_MM = 1.0;   // tolérance sur la position des trous isolés

(async () => {
  const opts = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};
  const browser = await chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("file://" + path.join(ROOT, "index.html"));
  await page.waitForFunction(() => window.__c50 && window.__c50.state.img);

  const load = async (input, file) => {
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
      perspectiveMm: c.state.persp.map(v => +(v * 10000).toFixed(2)),         // décalage du vrai centre, en mm (w·R²)
      isoles: shots.map((s, i) => ({ s: c.state.holes[i].s || 0, split: !!c.state.holes[i].split, x: +s.x.toFixed(1), y: +s.y.toFixed(1) })).filter(h => !h.split).map(h => [h.s, h.x, h.y]),
    };
  });
  const calage = () => page.evaluate(() => {
    const c = window.__c50, cal = c.getCal();
    return { cx: cal.cx, cy: cal.cy, pxmm: cal.pxmm, anneaux: (c.state.calInfo || []).map(m => m.R), douteux: !!c.state.calSuspect };
  });

  const resultats = [];
  for (const se of SEANCES){
    await page.selectOption("#fCal", se.cal || "9.0"); await page.fill("#fShots", String(se.coups || 10));
    const r = [];
    for (let i = 0; i < se.photos.length; i++){ await load(i ? "#fileNext" : "#fileGal", se.photos[i]); r.push(await snapshot()); }
    resultats.push(r);
  }
  const recadrages = [];
  await page.selectOption("#fCal", "9.0"); await page.fill("#fShots", "10");
  for (const rc of RECADRAGES){
    await load("#fileGal", rc.source); const a = await calage();
    await load("#fileGal", rc.photo); const b = await calage();
    recadrages.push({ rc, a, b });
  }
  await browser.close();

  if (process.argv.includes("--record")){
    SEANCES.forEach((se, i) => fs.writeFileSync(path.join(__dirname, se.ref), JSON.stringify(resultats[i], null, 1)));
    console.log("Références réécrites."); return;
  }

  let ko = 0;
  const check = (label, ok, detail) => { console.log((ok ? "  ok  " : "  ÉCHEC ") + label + (ok ? "" : "  → " + detail)); if (!ok) ko++; };
  if (errors.length) check("aucune erreur JavaScript", false, errors.join(" | "));
  SEANCES.forEach((se, k) => {
    const ref = JSON.parse(fs.readFileSync(path.join(__dirname, se.ref), "utf8"));
    resultats[k].forEach((r, i) => {
      const e = ref[i]; console.log(`Séance du ${se.nom}, photo ${i + 1}`);
      check("mode de détection", r.mode === e.mode, `${r.mode} au lieu de ${e.mode}`);
      check("impacts par série", JSON.stringify(r.parSerie) === JSON.stringify(e.parSerie), `${JSON.stringify(r.parSerie)} au lieu de ${JSON.stringify(e.parSerie)}`);
      check("total des points", r.points === e.points, `${r.points} au lieu de ${e.points}`);
      const far = e.isoles.filter(([s, x, y]) => !r.isoles.some(([s2, x2, y2]) => s2 === s && Math.hypot(x2 - x, y2 - y) <= TOL_MM));
      check(`trous isolés retrouvés à ${TOL_MM} mm près (${e.isoles.length})`, far.length === 0, `${far.length} manquant(s) ou déplacé(s) : ${JSON.stringify(far)}`);
      if (se.comptage) check(`même total que le comptage de l'utilisateur (${se.comptage[i]})`, r.points === se.comptage[i], `${r.points}`);
      if (e.alignement) check("recalage entre photos < 1,5 mm et < 1°", Math.abs(r.alignement.tx) <= 1.5 && Math.abs(r.alignement.ty) <= 1.5 && Math.abs(r.alignement.rot) <= 1, JSON.stringify(r.alignement));
    });
  });
  for (const { rc, a, b } of recadrages){
    console.log(`Calage sur ${rc.photo}`);
    check("trois anneaux retrouvés", b.anneaux.length === 3 && !b.douteux, `anneaux ${b.anneaux.join(", ") || "aucun"}`);
    check("même échelle que la photo entière (< 1 %)", Math.abs(b.pxmm / a.pxmm - 1) < 0.01, `rapport ${(b.pxmm / a.pxmm).toFixed(3)}`);
    const dc = Math.hypot(b.cx - a.cx, b.cy - (a.cy + rc.dy)) / a.pxmm;
    check("même centre à 0,5 mm près", dc < 0.5, `écart ${dc.toFixed(2)} mm`);
  }
  console.log(ko ? `\n${ko} vérification(s) en échec.` : "\nTout est conforme à la référence.");
  process.exit(ko ? 1 : 0);
})();
