/* A small, dependency-free research sketch. All shapes are illustrative. */
(() => {
  'use strict';
  const canvas = document.getElementById('research-scene');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  const lime = [212, 255, 116];
  const cyan = [147, 230, 220];
  let width = 1, height = 1, dpr = 1;
  let mode = 'cloth', paused = reduced.matches, visible = true, frameId = 0;
  let time = 0, last = 0, yaw = -.48, pitch = .48;
  let drag = null, fade = 1;
  canvas.style.touchAction = 'pan-y';

  const rgba = (color, alpha) => `rgba(${color[0]},${color[1]},${color[2]},${Math.max(0, Math.min(1, alpha))})`;
  function project(x, y, z) {
    const angle = yaw + (Math.sin(time * .11) * .07);
    const a = x * Math.cos(angle) + z * Math.sin(angle);
    const b = z * Math.cos(angle) - x * Math.sin(angle);
    const py = y * Math.cos(pitch) - b * Math.sin(pitch);
    const pz = y * Math.sin(pitch) + b * Math.cos(pitch);
    const scale = Math.min(width, height) * 1.08 / (6 + pz);
    return { x: width * .5 + a * scale, y: height * .49 - py * scale, z: pz, scale };
  }
  function line(points, color, alpha, lineWidth = 1, close = false) {
    if (!points.length) return;
    ctx.beginPath();
    points.forEach((point, i) => {
      const p = project(...point);
      if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
    });
    if (close) ctx.closePath();
    ctx.strokeStyle = rgba(color, alpha * fade);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  function dot(point, color, alpha, radius = 1.2) {
    const p = project(...point);
    ctx.fillStyle = rgba(color, alpha * fade);
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(.35, radius * p.scale / 85), 0, TAU);
    ctx.fill();
  }
  function ring(cx, cy, cz, radius, color, alpha, flat = true) {
    const points = [];
    for (let i = 0; i <= 96; i++) {
      const t = i / 96 * TAU;
      points.push(flat ? [cx + Math.cos(t) * radius, cy, cz + Math.sin(t) * radius] : [cx + Math.cos(t) * radius, cy + Math.sin(t) * radius, cz]);
    }
    line(points, color, alpha);
  }
  function ground() {
    const y = -1.38;
    for (let x = -4; x <= 4.01; x += .5) line([[x, y, -3], [x, y, 3]], cyan, .045);
    for (let z = -3; z <= 3.01; z += .5) line([[-4, y, z], [4, y, z]], cyan, .045);
    ring(0, y, 0, 2.75, lime, .11);
    const t = time * .17;
    const orbit = [Math.cos(t) * 2.75, y, Math.sin(t) * 2.75];
    dot(orbit, lime, .8, 2.5);
  }
  function clothPoint(u, v, small = false, side = 0) {
    const phase = time * .7;
    const elevation = Math.sin(u * 2.5 + phase * .45) * .45
      + Math.cos(v * 2.7 - phase * .34) * .22
      + Math.sin((u + v) * 3.3 + phase * .18) * .13;
    return small ? [side + u * .95, elevation * .75 + .1, v * 1.18] : [u * 2.65, elevation + .15, v * 2.08];
  }
  function cloth() {
    const nx = 40, ny = 28, points = [];
    for (let j = 0; j <= ny; j++) {
      const row = [];
      for (let i = 0; i <= nx; i++) row.push(clothPoint(i / nx * 2 - 1, j / ny * 2 - 1));
      points.push(row);
    }
    // Soft translucent quads give the wire surface volume, without a heavy fill.
    const quads = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const p = [points[j][i], points[j][i + 1], points[j + 1][i + 1], points[j + 1][i]].map(v => project(...v));
      quads.push({ p, depth: p.reduce((s, v) => s + v.z, 0) / 4, j });
    }
    quads.sort((a, b) => b.depth - a.depth);
    for (const q of quads) {
      ctx.beginPath(); q.p.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
      ctx.fillStyle = rgba(q.j > ny * .6 ? cyan : lime, .018 * fade); ctx.fill();
    }
    for (let j = 0; j <= ny; j++) line(points[j], j > ny * .62 ? cyan : lime, .24 + .12 * Math.sin(j / ny * Math.PI), j % 7 === 0 ? 1.15 : .65);
    for (let i = 0; i <= nx; i++) line(points.map(row => row[i]), lime, i % 5 === 0 ? .3 : .17, i % 5 === 0 ? 1 : .65);
    for (let j = 0; j <= ny; j += 2) for (let i = 0; i <= nx; i += 2) dot(points[j][i], j > ny * .62 ? cyan : lime, .6, 1.12);
    [[0, 0], [nx, 0], [0, ny], [nx, ny]].forEach(([i, j]) => {
      const p = points[j][i];
      line([p, [p[0], -1.38, p[2]]], cyan, .15, .7);
      dot(p, lime, .9, 2.2);
    });
  }
  function obstacle(cx, cz, radius, high) {
    ring(cx, -1.35, cz, radius, cyan, .24);
    ring(cx, high, cz, radius, cyan, .42);
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * TAU;
      const x = cx + radius * Math.cos(a), z = cz + radius * Math.sin(a);
      line([[x, -1.35, z], [x, high, z]], cyan, .15, .8);
      dot([x, high, z], cyan, .55, 1.3);
    }
  }
  function path(t) {
    return [Math.sin(t * Math.PI * 1.65 - .45) * 1.05, -1.05, -2.75 + t * 5.5];
  }
  function navigation() {
    obstacle(-1.3, -.5, .43, .55);
    obstacle(1.1, 1.5, .42, .8);
    const route = [];
    for (let i = 0; i <= 120; i++) route.push(path(i / 120));
    line(route, lime, .12, 12);
    line(route, lime, .3, 4);
    line(route, lime, .95, 1.8);
    for (let side of [-1, 1]) line(route.map(p => [p[0] + side * .19, p[1] - .01, p[2]]), lime, .2, .6);
    for (let i = 0; i <= 120; i += 4) dot(route[i], lime, .7, 1.5);
    const progress = (time * .055) % 1;
    const p = path(progress), body = .17;
    const base = [[-body, 0, -body], [body, 0, -body], [body, 0, body], [-body, 0, body]].map(v => [p[0] + v[0], p[1] + .09, p[2] + v[2]]);
    const roof = base.map(v => [v[0], v[1] + .35, v[2]]);
    line(base, lime, .8, 1.4, true); line(roof, lime, 1, 1.4, true);
    base.forEach((v, i) => line([v, roof[i]], lime, .8, 1.4));
    for (let r = 0; r < 3; r++) {
      const pulse = ((time * .32 + r / 3) % 1);
      ring(p[0], -1.33, p[2], .38 + pulse * 1.1, lime, .32 * (1 - pulse));
    }
    ring(...route[0], .22, cyan, .7); ring(...route[120], .22, lime, .7);
    for (let x = -3; x <= 3; x += .35) for (let z = -2.7; z <= 2.7; z += .35) {
      if (Math.hypot(x + 1.3, z + .5) < .7 || Math.hypot(x - 1.1, z - 1.5) < .65) continue;
      dot([x, -1.36, z], cyan, .2, .8);
    }
  }
  function transfer() {
    const n = 18, m = 20;
    for (const side of [-1.75, 1.75]) {
      const color = side < 0 ? cyan : lime;
      const mesh = [];
      for (let j = 0; j <= m; j++) {
        const row = [];
        for (let i = 0; i <= n; i++) {
          const p = clothPoint(i / n * 2 - 1, j / m * 2 - 1, true, side);
          if (side > 0) p[1] += Math.sin(i * .55 + j * .3) * .065;
          row.push(p);
          if (!(i % 2) && !(j % 2)) dot(p, color, .7, 1.4);
        }
        mesh.push(row); line(row, color, .3, .75);
      }
      for (let i = 0; i <= n; i++) line(mesh.map(row => row[i]), color, .25, .7);
      ring(side, -1.38, 0, 1.4, color, .22);
    }
    // Sparse correspondences bridge two domains; particles travel on those curves.
    for (let i = 0; i < 8; i++) {
      const z = (i / 7 * 2 - 1) * 1.05;
      const curve = t => [-.78 + t * 1.56, .25 + Math.sin(t * Math.PI) * .55 + Math.sin(time * .3 + i * .4) * .1, z];
      const points = [];
      for (let j = 0; j <= 40; j++) points.push(curve(j / 40));
      line(points, cyan, .15, .7);
      dot(curve((time * .18 + i * .127) % 1), lime, .85, 1.8);
    }
  }
  function render() {
    ctx.clearRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(width * .52, height * .49, 0, width * .52, height * .49, Math.min(width, height) * .55);
    glow.addColorStop(0, 'rgba(166,217,95,0.045)'); glow.addColorStop(.6, 'rgba(90,150,140,0.015)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    ground();
    if (mode === 'navigation') navigation(); else if (mode === 'transfer') transfer(); else cloth();
  }
  function tick(stamp) {
    frameId = 0;
    if (!visible || document.hidden || paused) { last = 0; return; }
    if (last) time += Math.min((stamp - last) / 1000, .06);
    last = stamp; fade = Math.min(1, fade + .045);
    render(); frameId = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!paused && visible && !document.hidden && !frameId) frameId = requestAnimationFrame(tick);
    else if (paused) render();
  }
  function stop() { if (frameId) cancelAnimationFrame(frameId); frameId = 0; last = 0; }
  function setPaused(value) { paused = Boolean(value); stop(); render(); schedule(); }
  function setMode(value) {
    if (!['cloth', 'navigation', 'transfer'].includes(value)) return;
    mode = value; fade = paused ? 1 : .3; render(); schedule();
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); render();
  }
  canvas.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, yaw, pitch };
    canvas.setPointerCapture(event.pointerId); canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointermove', event => {
    if (!drag) return;
    yaw = drag.yaw + (event.clientX - drag.x) * .006;
    pitch = Math.max(.12, Math.min(1.05, drag.pitch + (event.clientY - drag.y) * .004));
    render();
  });
  function release() { drag = null; canvas.style.cursor = 'grab'; }
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.scene)));
  document.addEventListener('scene-motion', event => setPaused(event.detail?.paused ?? false));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else schedule(); });
  reduced.addEventListener('change', event => setPaused(event.matches));
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) stop(); else schedule(); }, { rootMargin: '40px' }).observe(canvas);
  canvas.style.cursor = 'grab';
  window.researchScene = { setMode, setPaused };
  resize(); schedule();
})();
