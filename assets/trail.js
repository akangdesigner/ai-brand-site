/* 滑鼠拖尾：光軌＋像素粒子＋0/1 字元＋十字準星座標（依 Claude Design NewsletterV2）
   設定：window.TRAIL = { mode: 'full' | 'line' | 'off', color: '#7fa0ff' }
   html[data-motion="system"] 且系統開啟「減少動態效果」時自動關閉。 */
(function () {
  var cfg = window.TRAIL || {};
  var mode = cfg.mode || 'full';
  var col = cfg.color || '#7fa0ff';
  if (mode === 'off') return;
  if (window.matchMedia && matchMedia('(hover: none)').matches) return; // 觸控裝置不啟用
  var followSystem = document.documentElement.getAttribute('data-motion') !== 'force';
  if (followSystem && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60';
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d');
  var pts = [], parts = [], mx = -99, my = -99, last = 0, idle = 999, raf = 0;

  function size() {
    var d = window.devicePixelRatio || 1;
    cv.width = innerWidth * d; cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  size(); addEventListener('resize', size);

  addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    mx = e.clientX; my = e.clientY; idle = 0;
    var now = performance.now();
    pts.push({ x: mx, y: my, t: now });
    if (now - last > 28) {
      last = now;
      var g = 8, a = Math.random() * Math.PI * 2;
      parts.push({
        x: Math.round(mx / g) * g, y: Math.round(my / g) * g,
        vx: Math.cos(a) * .4, vy: Math.sin(a) * .4, life: 1,
        s: Math.random() < .3 ? 4 : 2,
        glyph: Math.random() < .12 ? (Math.random() < .5 ? '0' : '1') : null
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  });

  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    var now = performance.now(); idle++;
    while (pts.length && now - pts[0].t > 420) pts.shift();

    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = col; ctx.shadowBlur = 12;
    for (var i = 1; i < pts.length; i++) {
      var k = i / pts.length;
      ctx.strokeStyle = col; ctx.globalAlpha = k * .9; ctx.lineWidth = k * 3;
      ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
    }
    ctx.shadowBlur = 0;

    if (mode === 'full') {
      ctx.font = '10px "JetBrains Mono", monospace';
      for (var j = parts.length - 1; j >= 0; j--) {
        var p = parts[j]; p.x += p.vx; p.y += p.vy; p.life -= .022;
        if (p.life <= 0) { parts.splice(j, 1); continue; }
        ctx.globalAlpha = p.life * .85; ctx.fillStyle = col;
        if (p.glyph) ctx.fillText(p.glyph, p.x, p.y); else ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
    } else { parts.length = 0; }

    if (mx > 0 && idle < 90) {
      var al = Math.max(0, 1 - idle / 90), r = 10, c = 4;
      ctx.globalAlpha = al; ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath();
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
        ctx.moveTo(mx + s[0] * r, my + s[1] * (r - c)); ctx.lineTo(mx + s[0] * r, my + s[1] * r); ctx.lineTo(mx + s[0] * (r - c), my + s[1] * r);
      });
      ctx.stroke();
      ctx.font = '10px "JetBrains Mono", monospace'; ctx.fillStyle = col; ctx.globalAlpha = al * .8;
      ctx.fillText(Math.round(mx) + ',' + Math.round(my), mx + 16, my + 22);
    }
    ctx.globalAlpha = 1;

    // 靜止且畫面清空後停止迴圈，省電
    if (idle >= 90 && !pts.length && !parts.length) { ctx.clearRect(0, 0, innerWidth, innerHeight); raf = 0; return; }
    raf = requestAnimationFrame(tick);
  }
})();
