// Direct Longue-Vue simulé, images bruitées : chaque photo donne FR images différentes (décalage, gain, balance des
// blancs, bruit de capteur), comme une caméra réelle. Usage :
//   node tests/direct-simule.cjs APP DIR VERITE MODE FR [FLAGS] [SEED]
// Exemple : node tests/direct-simule.cjs index.html dossier-photos tests/verite-2026-11-06.json fige 5
// (dossier-photos : un dossier ne contenant que les photos de la séance, dans l'ordre ; FLAGS ex. __lvAvg=0 pour couper la
// référence moyennée ; SEED change le tirage des perturbations). Hors de npm test : environ 3 s par image.
// MODE : auto (exposition et balance des blancs automatiques qui flottent) | fige (caméra verrouillée) | net (sans perturbation)
const path = require("path"), fs = require("fs"); const { chromium } = require("playwright");
const [APP, DIR, VER, MODE, FRs, FLAGS, SEEDs] = process.argv.slice(2);
const FR = +FRs || 5, SEED = +SEEDs || 1;
const truth = JSON.parse(fs.readFileSync(VER, "utf8")).shots;
const photos = fs.readdirSync(DIR).filter(f => f.endsWith(".jpg")).sort();
const P = { auto: { g: 0.08, wb: 0.03, sh: 3, nz: 5 }, fige: { g: 0.01, wb: 0.005, sh: 3, nz: 5 }, net: { g: 0, wb: 0, sh: 0, nz: 0 } }[MODE];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  if (FLAGS) await p.addInitScript(f => { for (const k of f.split(",")){ const [a, v] = k.split("="); window[a] = v === undefined ? true : +v; } }, FLAGS);
  await p.goto("file://" + path.resolve(APP)); await p.waitForFunction(() => window.__c50 && window.__c50.state.img); await p.selectOption("#fCal", "9.0");
  await p.evaluate(([P, seed]) => { let s = seed >>> 0; window.__rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const gauss = () => { let u = 0, v = 0; while (!u) u = __rnd(); v = __rnd(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
    window.__frame = (im) => { const sc = Math.min(1, 2600/Math.max(im.naturalWidth, im.naturalHeight)), W = Math.round(im.naturalWidth*sc), H = Math.round(im.naturalHeight*sc);
      const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
      const dx = (__rnd()*2-1)*P.sh, dy = (__rnd()*2-1)*P.sh; g.drawImage(im, dx, dy, W, H);
      if (!P.g && !P.nz) return c;
      const gain = 1 + (__rnd()*2-1)*P.g, gr = gain*(1 + (__rnd()*2-1)*P.wb), gb = gain*(1 + (__rnd()*2-1)*P.wb);
      const d = g.getImageData(0, 0, W, H), a = d.data;
      for (let i = 0; i < a.length; i += 4){ const n = P.nz ? gauss()*P.nz : 0;
        a[i] = a[i]*gr + n; a[i+1] = a[i+1]*gain + n; a[i+2] = a[i+2]*gb + n; }
      g.putImageData(d, 0, 0); return c; }; }, [P, SEED]);
  const used = new Set(); let ok = 0, faux = 0, calI = -1, frames = 0; const t0 = Date.now(); const log = [];
  for (let i = 0; i < photos.length; i++){
    const b64 = fs.readFileSync(path.join(DIR, photos[i])).toString("base64");
    await p.evaluate(async b => { const im = new Image(); im.src = "data:image/jpeg;base64," + b; await im.decode(); window.__im = im; }, b64);
    if (calI < 0){
      const r = await p.evaluate(() => { const c = window.__c50, raw = __frame(__im); window.__circle = c.lvFindOculaire(raw);
        c.setImage(c.lvCrop(raw, window.__circle), false); const R = (c.state.calInfo || []).map(m => m.R);
        const ok = !!c.getCal() && !c.state.calSuspect && [50, 75, 100].every(x => R.includes(x)); if (ok){ c.state.holes = []; c.lvSetRef(); } return ok; });
      if (r) calI = i; log.push(`photo ${i+1} calage ${r}`); continue;
    }
    const ann = [];
    for (let k = 0; k < FR; k++){ frames++;
      const r = await p.evaluate(() => { const c = window.__c50, raw = __frame(__im), o = c.lvFindOculaire(raw) || window.__circle;
        const n = c.lvFrame(c.lvCrop(raw, o)); window.__avgN = (window.__avgN || []); window.__avgN.push(c.state.prevCol ? (c.state.prevCol.avgN || 1) : 0); return n ? n.map(q => [+q.x.toFixed(1), +q.y.toFixed(1)]) : null; });
      if (!r) continue;
      for (const q of r){ let bi = -1, bd = 1e9; truth.forEach((t, j) => { if (used.has(j) || t[2] <= calI || t[2] > i) return; const d = Math.hypot(t[0]-q[0], t[1]-q[1]); if (d < bd){ bd = d; bi = j; } });
        if (bd <= 5){ used.add(bi); ok++; ann.push(`${q} JUSTE${truth[bi][2] < i ? "(retard)" : ""}`); } else { faux++; ann.push(`${q} FAUX`); } } }
    log.push(`photo ${i+1} : ${ann.join(" ; ")}`);
  }
  const attendus = truth.filter(t => t[2] > calI).length;
  console.log(log.join("\n")); console.log('avgN', JSON.stringify(await p.evaluate(() => window.__avgN))); console.log(`BILAN ${MODE} ${FLAGS || "-"} seed ${SEED} : ${ok}/${attendus} justes, ${faux} fausses, ${frames} images, ${((Date.now()-t0)/frames/1000).toFixed(1)} s/image`, errs.length ? errs : "");
  await b.close();
})();
