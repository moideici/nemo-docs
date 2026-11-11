/* Arrière-plan animé : aurore (grandes lueurs qui dérivent) + réseau de points discrets, sensible à la souris
   et au défilement. S'adapte au thème clair/sombre, se met en pause hors écran, reste figé si l'utilisateur
   préfère moins d'animations. */
(function () {
  var cv = document.createElement("canvas");
  cv.id = "bg"; cv.setAttribute("aria-hidden", "true");
  document.body.insertBefore(cv, document.body.firstChild);
  var ctx = cv.getContext("2d");
  if (!ctx) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = 1, dark = false, pts = [], mx = -999, my = -999, tx = -999, ty = -999, running = false, t0 = performance.now();

  // lueurs : [couleur claire, couleur sombre, rayon relatif, vitesses x/y, phases, alpha clair, alpha sombre]
  var blobs = [
    { c: [37, 99, 235], r: .55, sx: .00011, sy: .00014, px: 0, py: 1.2, a: .20, ad: .30, ox: .25, oy: .20 },
    { c: [124, 92, 224], r: .50, sx: .00013, sy: .00009, px: 2.1, py: .4, a: .18, ad: .26, ox: .78, oy: .28 },
    { c: [20, 184, 166], r: .46, sx: .00008, sy: .00012, px: 4.0, py: 2.4, a: .14, ad: .18, ox: .55, oy: .78 },
    { c: [242, 112, 63], r: .34, sx: .00015, sy: .00010, px: 1.0, py: 3.3, a: .11, ad: .14, ox: .12, oy: .75 }
  ];

  function readTheme() {
    var t = document.documentElement.dataset.theme;
    dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(70, Math.round(W * H / 24000));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, r: .8 + Math.random() * 1.4 });
    if (!running) draw(performance.now());
  }

  function draw(now) {
    var t = now - t0, m = Math.min(W, H), sc = (window.scrollY || 0);
    ctx.clearRect(0, 0, W, H);
    // aurore
    ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
    blobs.forEach(function (b) {
      var x = (b.ox + .22 * Math.sin(t * b.sx + b.px)) * W + (tx > -900 ? (mx - W / 2) * .03 : 0);
      var y = (b.oy + .20 * Math.cos(t * b.sy + b.py)) * H - sc * .06;
      var r = b.r * Math.max(W, H) * .62 * (1 + .08 * Math.sin(t * .0004 + b.px));
      var g = ctx.createRadialGradient(x, y, 0, x, y, r), a = dark ? b.ad : b.a;
      g.addColorStop(0, "rgba(" + b.c + "," + a + ")");
      g.addColorStop(.55, "rgba(" + b.c + "," + a * .35 + ")");
      g.addColorStop(1, "rgba(" + b.c + ",0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    // réseau de points
    ctx.globalCompositeOperation = "source-over";
    var ink = dark ? "231,234,240" : "15,23,42", la = dark ? .22 : .14, pa = dark ? .6 : .38;
    mx += (tx - mx) * .08; my += (ty - my) * .08;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
      if (d2 < 14000) { var f = (1 - d2 / 14000) * .6; p.x += dx / Math.sqrt(d2 + 1) * f; p.y += dy / Math.sqrt(d2 + 1) * f; }
      ctx.fillStyle = "rgba(" + ink + "," + pa + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], ex = p.x - q.x, ey = p.y - q.y, dd = ex * ex + ey * ey;
        if (dd < 16000) { ctx.strokeStyle = "rgba(" + ink + "," + la * (1 - dd / 16000) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
    }
  }

  function loop(now) { if (!running) return; draw(now); requestAnimationFrame(loop); }
  function start() { if (running || reduce || document.hidden) return; running = true; requestAnimationFrame(loop); }
  function stop() { running = false; }

  readTheme(); resize();
  addEventListener("resize", resize);
  addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; if (mx < -900) { mx = tx; my = ty; } }, { passive: true });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  new MutationObserver(function () { readTheme(); if (!running) draw(performance.now()); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener && matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { readTheme(); if (!running) draw(performance.now()); });
  start();
})();
