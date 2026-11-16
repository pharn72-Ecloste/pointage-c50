// Direct Longue-Vue de bout en bout, caméra et micro simulés (hors de npm test). La caméra montre une photo de séance ;
// à chaque coup, on passe à la photo suivante et, si demandé, le micro reçoit un bruit de coup synthétique au même instant.
// Mesure le délai entre le coup et l'annonce, avec ou sans « Analyser aussitôt après le bruit d'un coup ».
// Usage : node tests/direct-camera.cjs APP DIR PREMIERE NB SON(0|1)
//   ex. node tests/direct-camera.cjs index.html tests/photos-06 9 4 1   (photos triées du dossier, 1re = calage)
const path = require("path"), fs = require("fs"); const { chromium } = require("playwright");
const [APP, DIR, P0s, NBs, SONs] = process.argv.slice(2), P0 = +P0s || 1, NB = +NBs || 3, SON = SONs === "1";
const photos = fs.readdirSync(DIR).filter(f => f.endsWith(".jpg")).sort();
(async () => {
  const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ["--autoplay-policy=no-user-gesture-required"] });
  const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => {
    window.__cur = null;
    navigator.mediaDevices.enumerateDevices = async () => [{kind: "videoinput", deviceId: "cam0", label: "camera2 0, facing back", groupId: "g"}];
    navigator.mediaDevices.getUserMedia = async (c) => {
      if (c.audio){
        const ac = new AudioContext(), dst = ac.createMediaStreamDestination(), bruit = ac.createBufferSource(), sr = ac.sampleRate;
        const nb = ac.createBuffer(1, sr*2, sr), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1)*0.02;
        bruit.buffer = nb; bruit.loop = true; bruit.connect(dst); bruit.start();
        window.__bang = () => { const bb = ac.createBuffer(1, Math.round(sr*0.3), sr), x = bb.getChannelData(0);
          for (let i = 0; i < x.length; i++){ const t = i/sr; x[i] = Math.max(-1, Math.min(1, (Math.random()*2-1)*3*Math.exp(-t/0.04))); }
          const s = ac.createBufferSource(); s.buffer = bb; s.connect(dst); s.start(); };
        return dst.stream;
      }
      const cv = document.createElement("canvas"); cv.width = window.__cur.naturalWidth; cv.height = window.__cur.naturalHeight; const g = cv.getContext("2d");
      setInterval(() => g.drawImage(window.__cur, 0, 0, cv.width, cv.height), 66); g.drawImage(window.__cur, 0, 0);
      return cv.captureStream(15);
    };
  });
  await p.goto("file://" + path.resolve(APP)); await p.waitForFunction(() => window.__c50 && window.__c50.state.img);
  const show = async i => { const b64 = fs.readFileSync(path.join(DIR, photos[i])).toString("base64");
    await p.evaluate(async b => { const im = new Image(); im.src = "data:image/jpeg;base64," + b; await im.decode(); window.__cur = im; }, b64); };
  await show(P0 - 1);
  await p.click("#tab-lv"); await p.evaluate(s => { document.getElementById("lvFigeChk").checked = false; document.getElementById("lvSonChk").checked = s; }, SON);
  await p.click("#bLvCamStart"); await p.waitForFunction(() => document.getElementById("lvVideo").videoWidth > 0); await p.waitForTimeout(500);
  await p.click("#bLvCal"); await p.waitForFunction(() => /Cible calée|non calée/.test(document.getElementById("lvStatus").textContent), null, {timeout: 60000});
  console.log(photos[P0-1], (await p.textContent("#lvStatus")).slice(0, 90));
  await p.click("#bLvAuto"); await p.waitForTimeout(7000);
  const res = [];
  for (let k = 0; k < NB && P0 + k < photos.length; k++){
    const before = await p.evaluate(() => window.__c50.currentShots().length);
    await show(P0 + k); const t0 = Date.now(); if (SON) await p.evaluate(() => window.__bang && window.__bang());
    let dt = null;
    try { await p.waitForFunction(n => window.__c50.currentShots().length > n, before, {timeout: 30000, polling: 100}); dt = (Date.now() - t0)/1000; } catch(e){}
    const st = await p.textContent("#lvStatus");
    res.push(dt); console.log(`${photos[P0+k]} : ${dt == null ? "rien en 30 s" : dt.toFixed(1) + " s"} — ${st.slice(0, 140)}`);
    await p.waitForTimeout(7000);
  }
  const ok = res.filter(x => x != null);
  console.log(`BILAN son=${SON ? 1 : 0} : ${ok.length}/${res.length} annoncés, délai moyen ${ok.length ? (ok.reduce((a, c) => a + c, 0)/ok.length).toFixed(1) : "-"} s`, errs.length ? errs : "");
  await b.close();
})();
