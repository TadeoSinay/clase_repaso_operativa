/* ===================================================
   manim-canvas.js
   Animación estilo Manim, renderizada en Canvas HTML5.
   Muestra: fórmula → sustitución → distribución barra a barra → respuestas.
   =================================================== */

(function () {
  const LAMBDA = 3;
  const BG     = '#060810';
  const BLUE   = '#00d4ff';
  const VIOLET = '#7c3aed';
  const CYAN   = '#00ffcc';
  const PINK   = '#ff2d78';
  const GREEN  = '#39ff14';
  const WHITE  = '#f0f4ff';
  const DIM    = 'rgba(240,244,255,0.45)';
  const MONO   = "500 14px 'Fira Code', monospace";
  const HEAD   = "700 18px 'Space Grotesk', sans-serif";

  // ---- Poisson PMF ----
  function factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
  function pmf(lam, k)  { return Math.pow(lam, k) * Math.exp(-lam) / factorial(k); }

  // ---- Canvas setup ----
  const canvas = document.getElementById('manim-canvas');
  if (!canvas) return;

  let W, H, ctx, animId, scene, sceneT, sceneStart, running;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width   || 800;
    H = canvas.height = Math.round(W * 0.42);
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  ctx = canvas.getContext('2d');

  // ── Utility ──
  function lerp(a, b, t) { return a + (b - a) * Math.min(1, Math.max(0, t)); }
  function easeOut(t)    { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t)  { return t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

  function clear() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
  }

  function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // ── Text helpers ──
  function txt(text, x, y, font, color, align='left', alpha=1) {
    ctx.save();
    ctx.font        = font;
    ctx.fillStyle   = color;
    ctx.globalAlpha = alpha;
    ctx.textAlign   = align;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function typeText(text, x, y, font, color, progress, align='left') {
    const visible = Math.floor(progress * text.length);
    txt(text.slice(0, visible), x, y, font, color, align);
    // Cursor blink
    if (visible < text.length) {
      ctx.save();
      ctx.globalAlpha = Math.sin(Date.now() / 250) > 0 ? 0.8 : 0;
      ctx.font  = font;
      const w = ctx.measureText(text.slice(0, visible)).width;
      ctx.fillStyle = color;
      const ox = align === 'center' ? -ctx.measureText(text).width/2 : 0;
      ctx.fillRect(x + ox + w + 2, y - 14, 2, 16);
      ctx.restore();
    }
  }

  // ── Bar chart helper ──
  function drawBar(x, y, barW, barH, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const grad = ctx.createLinearGradient(x, y - barH, x, y);
    grad.addColorStop(0, hexAlpha(color, 0.9));
    grad.addColorStop(1, hexAlpha(color, 0.4));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y - barH, barW, barH, [3, 3, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = hexAlpha(color, 0.7);
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.restore();
  }

  // ═══════════════════════════════════════
  //  SCENES
  // ═══════════════════════════════════════

  const SCENES = [
    { id: 'title',    dur: 2.4 },   // Title card
    { id: 'formula',  dur: 3.5 },   // Formula reveal
    { id: 'substit',  dur: 3.0 },   // λ=3 substitution
    { id: 'bars',     dur: 5.0 },   // Bar chart building
    { id: 'answers',  dur: 4.5 },   // Answers reveal
    { id: 'end',      dur: 2.0 },   // Final hold
  ];

  let sceneIdx = 0;
  let lastTs   = null;
  let elapsed  = 0;

  function sceneProgress() {
    return Math.min(1, elapsed / SCENES[sceneIdx].dur);
  }

  // ── Scene: Title ──
  function drawTitle(p) {
    const e = easeOut(p);
    clear();
    // Tag
    txt('UTN FRBA · Repaso Operativa', W/2, H*0.3 - 10, "500 13px 'Fira Code', monospace", CYAN, 'center', e);
    // Main title (reveal left to right)
    ctx.save();
    ctx.font = `800 ${Math.round(W*0.065)}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center';
    const grad = ctx.createLinearGradient(W*0.2, 0, W*0.8, 0);
    grad.addColorStop(0, BLUE);
    grad.addColorStop(0.5, VIOLET);
    grad.addColorStop(1, CYAN);
    ctx.fillStyle = grad;
    ctx.globalAlpha = e;
    ctx.fillText('Distribución de Poisson', W/2, H*0.5);
    ctx.restore();
    // Subtitle
    txt('Robot Seleccionador — Fallas en el Pistón', W/2, H*0.65,
        "400 14px 'Inter', sans-serif", DIM, 'center', e * 0.8);
  }

  // ── Scene: Formula ──
  function drawFormula(p) {
    clear();
    const e = easeOut(Math.min(1, p * 1.4));
    txt('La fórmula de Poisson:', W*0.07, H*0.22, HEAD, DIM, 'left', e);

    // Formula components animated in sequence
    const parts = [
      { text: 'P(X = k)  =',    x: W*0.07, color: WHITE,  t: 0.0 },
      { text: 'λ',               x: W*0.46, color: CYAN,   t: 0.3, sup: 'k' },
      { text: '·  e',            x: W*0.54, color: WHITE,  t: 0.35 },
      { text: '─────────',       x: W*0.44, color: DIM,    t: 0.5, isDiv: true },
      { text: 'k!',              x: W*0.46, color: VIOLET, t: 0.6 },
    ];

    const fSize = Math.round(W * 0.028);
    const fy = H * 0.5;

    // Main formula line
    const prog = Math.min(1, p / 0.7);
    ctx.save();
    ctx.font = `600 ${fSize}px 'Fira Code', monospace`;
    ctx.globalAlpha = e;

    // P(X=k) =
    ctx.fillStyle = WHITE;
    ctx.textAlign = 'left';
    ctx.fillText('P(X = k)  =', W*0.08, fy);

    const rx = W * 0.42;
    // Numerator: λᵏ · e⁻λ
    ctx.fillStyle = CYAN;
    ctx.fillText('λ', rx, fy - fSize*0.9);
    ctx.font = `500 ${Math.round(fSize*0.65)}px 'Fira Code', monospace`;
    ctx.fillStyle = CYAN;
    ctx.fillText('k', rx + fSize*0.7, fy - fSize*1.3);
    ctx.font = `600 ${fSize}px 'Fira Code', monospace`;
    ctx.fillStyle = WHITE;
    ctx.fillText('  ·  e', rx + fSize, fy - fSize*0.9);
    ctx.font = `500 ${Math.round(fSize*0.65)}px 'Fira Code', monospace`;
    ctx.fillStyle = PINK;
    ctx.fillText('−λ', rx + fSize*3.1, fy - fSize*1.3);

    // Division bar
    ctx.fillStyle = DIM;
    ctx.fillRect(rx - 4, fy - fSize*0.4, fSize*5.2, 2);

    // Denominator: k!
    ctx.font = `600 ${fSize}px 'Fira Code', monospace`;
    ctx.fillStyle = VIOLET;
    ctx.fillText('k!', rx + fSize*1.6, fy + fSize*0.7);

    ctx.restore();

    // Parameter definitions (appear after formula)
    if (p > 0.6) {
      const defAlpha = easeOut((p - 0.6) / 0.4);
      const defs = [
        `λ = tasa promedio de fallas = ${LAMBDA} / turno`,
        `k = número de fallas a calcular (0, 1, 2, ...)`,
        `e ≈ 2.71828  (base neperiana)`,
      ];
      defs.forEach((d, i) => {
        const col = i === 0 ? CYAN : i === 2 ? DIM : WHITE;
        txt('›  ' + d, W*0.08, H*0.72 + i*22, "400 13px 'Fira Code', monospace", col, 'left', defAlpha);
      });
    }
  }

  // ── Scene: Substitution ──
  function drawSubstit(p) {
    clear();
    txt('Sustituyendo  λ = 3:', W*0.07, H*0.2, HEAD, DIM);

    const e  = easeOut(p);
    const fS = Math.round(W * 0.025);
    const fy = H * 0.48;
    const rx = W * 0.37;

    ctx.save();
    ctx.globalAlpha = e;
    ctx.font = `600 ${fS}px 'Fira Code', monospace`;

    ctx.fillStyle = WHITE;
    ctx.textAlign = 'left';
    ctx.fillText('P(X = k)  =', W*0.08, fy);

    // Numerator: 3ᵏ · e⁻³
    ctx.fillStyle = CYAN;
    ctx.fillText('3', rx, fy - fS*0.85);
    ctx.font = `500 ${Math.round(fS*0.65)}px 'Fira Code', monospace`;
    ctx.fillText('k', rx + fS*0.72, fy - fS*1.25);

    ctx.font = `600 ${fS}px 'Fira Code', monospace`;
    ctx.fillStyle = WHITE;
    ctx.fillText('  ·  e', rx + fS, fy - fS*0.85);

    ctx.font = `500 ${Math.round(fS*0.65)}px 'Fira Code', monospace`;
    ctx.fillStyle = PINK;
    ctx.fillText('−3', rx + fS*3.15, fy - fS*1.25);

    ctx.fillStyle = DIM;
    ctx.fillRect(rx - 4, fy - fS*0.3, fS*5.2, 2);

    ctx.font = `600 ${fS}px 'Fira Code', monospace`;
    ctx.fillStyle = VIOLET;
    ctx.fillText('k!', rx + fS*1.65, fy + fS*0.7);

    ctx.restore();

    // e^-3 value
    if (p > 0.5) {
      const a2 = easeOut((p - 0.5) / 0.5);
      txt(`e⁻³ ≈ 0.04979`, W/2, H*0.72, "500 13px 'Fira Code', monospace", PINK, 'center', a2);
      txt(`Esta constante multiplica a cada término de la distribución`,
          W/2, H*0.82, "400 12px 'Inter', sans-serif", DIM, 'center', a2 * 0.7);
    }
  }

  // ── Scene: Bar chart ──
  const K_MAX  = 10;
  const probs  = Array.from({length: K_MAX+1}, (_, k) => pmf(LAMBDA, k));
  const maxP   = Math.max(...probs);

  const BAR_COLORS = [
    VIOLET, VIOLET,
    BLUE,    // k=2 highlight
    CYAN,
    ...Array(7).fill(PINK)
  ];

  function drawBars(p) {
    clear();
    txt(`Distribución Poisson  (λ = ${LAMBDA})`, W*0.07, H*0.12, HEAD, WHITE);

    const barsToShow = p * (K_MAX + 1);
    const chartH     = H * 0.58;
    const originX    = W * 0.08;
    const originY    = H * 0.85;
    const totalW     = W * 0.85;
    const spacing    = totalW / (K_MAX + 1);
    const barW       = spacing * 0.62;

    // Axes
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(originX, originY - chartH);
    ctx.lineTo(originX, originY);
    ctx.lineTo(originX + totalW, originY);
    ctx.stroke();
    ctx.restore();

    for (let k = 0; k <= K_MAX; k++) {
      const barAlpha = Math.min(1, Math.max(0, barsToShow - k));
      if (barAlpha <= 0) break;

      const bx = originX + k * spacing + (spacing - barW) / 2;
      const bh = (probs[k] / maxP) * chartH * easeOut(barAlpha);

      drawBar(bx, originY, barW, bh, BAR_COLORS[k], 0.9);

      // K label
      txt(`k=${k}`, bx + barW/2, originY + 16, "400 10px 'Fira Code', monospace", DIM, 'center', barAlpha);

      // Percentage on top
      if (barAlpha > 0.8) {
        txt(`${(probs[k]*100).toFixed(1)}%`, bx + barW/2, originY - bh - 5,
            "500 9px 'Fira Code', monospace", BAR_COLORS[k], 'center', barAlpha);
      }
    }

    // Legend callouts (appear near end of scene)
    if (p > 0.65) {
      const la = easeOut((p - 0.65) / 0.35);
      // highlight k=2
      const bx2 = originX + 2*spacing + (spacing-barW)/2;
      ctx.save();
      ctx.globalAlpha = la;
      ctx.strokeStyle = BLUE;
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([3,3]);
      ctx.strokeRect(bx2 - 3, originY - (probs[2]/maxP)*chartH - 26, barW + 6, (probs[2]/maxP)*chartH + 26);
      ctx.setLineDash([]);
      ctx.restore();
      txt('P(X=2)=22.4%', bx2 + barW/2, originY - (probs[2]/maxP)*chartH - 32,
          "600 11px 'Fira Code', monospace", BLUE, 'center', la);
    }
  }

  // ── Scene: Answers ──
  const ANSWERS = [
    { label: 'a)  P(X = 2)',           val: pmf(3,2),               color: BLUE   },
    { label: 'b)  P(X ≤ 1)',           val: pmf(3,0)+pmf(3,1),      color: VIOLET },
    { label: 'c)  P(X ≥ 4)',           val: 1-[0,1,2,3].reduce((s,k)=>s+pmf(3,k),0), color: PINK },
    { label: 'd)  P(X=0, 2 turnos)',   val: Math.exp(-6),            color: CYAN   },
  ];

  function drawAnswers(p) {
    clear();
    txt('Respuestas del Ejercicio', W/2, H*0.14, `700 ${Math.round(W*0.025)}px 'Space Grotesk', sans-serif`, WHITE, 'center');

    const rowH   = H * 0.155;
    const startY = H * 0.26;
    const cols   = 2;

    ANSWERS.forEach((a, i) => {
      const delay = i * 0.18;
      const ap    = easeOut(Math.min(1, Math.max(0, (p - delay) / 0.35)));

      const col  = i % cols;
      const row  = Math.floor(i / cols);
      const cx   = W * (col === 0 ? 0.27 : 0.77);
      const cy   = startY + row * rowH;

      // Card bg
      ctx.save();
      ctx.globalAlpha = ap * 0.7;
      ctx.fillStyle   = hexAlpha(a.color, 0.08);
      ctx.strokeStyle = hexAlpha(a.color, 0.35);
      ctx.lineWidth   = 1;
      const cw = W * 0.38;
      const ch = rowH * 0.8;
      ctx.beginPath();
      ctx.roundRect(cx - cw/2, cy - ch*0.15, cw, ch, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      txt(a.label, cx, cy + 14, "500 13px 'Fira Code', monospace", DIM, 'center', ap);
      txt(a.val.toFixed(4), cx, cy + 38, `700 ${Math.round(W*0.032)}px 'Space Grotesk', sans-serif`, a.color, 'center', ap);
      txt(`(${(a.val*100).toFixed(2)}%)`, cx, cy + 55, "400 12px 'Inter', sans-serif", hexAlpha(a.color.replace('#',''),'0.65') || DIM, 'center', ap * 0.75);
    });

    // Final checkmark
    if (p > 0.9) {
      const fa = easeOut((p - 0.9) / 0.1);
      txt('¡Ejercicio resuelto! 🎯', W/2, H*0.93,
          "700 16px 'Space Grotesk', sans-serif", GREEN, 'center', fa);
    }
  }

  // ── Scene: End ──
  function drawEnd(p) {
    clear();
    const e = Math.min(1, p * 2);
    txt('¡Listo!', W/2, H*0.5, `800 ${Math.round(W*0.07)}px 'Space Grotesk', sans-serif`, CYAN, 'center', e);
    txt('Ahora explorá la calculadora interactiva abajo ↓', W/2, H*0.67,
        "400 13px 'Inter', sans-serif", DIM, 'center', e * 0.7);
  }

  // ── Scene dispatcher ──
  const DRAW_FNS = {
    title:   drawTitle,
    formula: drawFormula,
    substit: drawSubstit,
    bars:    drawBars,
    answers: drawAnswers,
    end:     drawEnd,
  };

  // ── Animation loop ──
  function loop(ts) {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs   = ts;
    elapsed += dt;

    const s = SCENES[sceneIdx];
    DRAW_FNS[s.id](Math.min(1, elapsed / s.dur));

    if (elapsed >= s.dur + 0.25) {
      sceneIdx++;
      elapsed = 0;
      lastTs  = null;
      if (sceneIdx >= SCENES.length) {
        running = false;
        // Show replay button
        document.getElementById('manim-replay-btn').style.opacity = '1';
        return;
      }
    }
    animId = requestAnimationFrame(loop);
  }

  // ── Start/Reset ──
  window.startManimAnimation = function () {
    cancelAnimationFrame(animId);
    sceneIdx = 0;
    elapsed  = 0;
    lastTs   = null;
    running  = true;
    document.getElementById('manim-replay-btn').style.opacity = '0.5';
    animId = requestAnimationFrame(loop);
  };

  // Auto-start when section enters viewport
  const section = document.getElementById('ejercicio1');
  if (section) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !running) {
        window.startManimAnimation();
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(section);
  } else {
    window.startManimAnimation();
  }
})();
