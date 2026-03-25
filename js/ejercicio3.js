/* ===================================================
   ejercicio3.js — Cadena de Markov Interactiva
   Máquina Industrial: Estados & Transiciones
   =================================================== */

// ---- Markov chain data ----
const STATES = [
  { id: 0, name: 'Operativa',      short: 'O', color: '#39ff14' },
  { id: 1, name: 'Mantenimiento',  short: 'M', color: '#ff9f00' },
  { id: 2, name: 'Falla Crítica',  short: 'F', color: '#ff2d78' }
];

// Transition matrix P[i][j] = P(go to j | currently in i)
const P = [
  [0.70, 0.20, 0.10],
  [0.60, 0.30, 0.10],
  [0.50, 0.20, 0.30]
];

// Steady-state (solved analytically)
const SS = [0.6528, 0.2222, 0.1250];

// ---- Solution steps ----
const STEPS = [
  {
    title: 'Enunciado del Problema',
    icon: '📋',
    activeState: null,
    content: `
      <p>Una máquina industrial puede estar en 3 estados cada semana:</p>
      <ul style="margin:0.75rem 0 0.75rem 1rem; color: rgba(240,244,255,0.6); font-size:0.88rem; display:flex; flex-direction:column; gap:0.4rem;">
        <li><span style="color:#39ff14">●</span> <strong style="color:#f0f4ff">Operativa (O)</strong> — funcionamiento normal</li>
        <li><span style="color:#ff9f00">●</span> <strong style="color:#f0f4ff">Mantenimiento (M)</strong> — mantenimiento preventivo</li>
        <li><span style="color:#ff2d78">●</span> <strong style="color:#f0f4ff">Falla Crítica (F)</strong> — parada de emergencia</li>
      </ul>
      <p>Con la siguiente matriz de transición semanal:</p>
      <p><em style="font-size:0.82rem;color:rgba(240,244,255,0.45);">Se pide hallar la distribución de estado estacionario.</em></p>
    `
  },
  {
    title: 'Matriz de Transición',
    icon: '🔢',
    activeState: null,
    content: `
      <p>La matriz de transición <strong>P</strong> es:</p>
      <div class="math-block">
          O     M     F
O  [ 0.70  0.20  0.10 ]
M  [ 0.60  0.30  0.10 ]
F  [ 0.50  0.20  0.30 ]</div>
      <p>Donde P[i][j] = probabilidad de pasar del estado i al estado j en una semana.</p>
      <p style="font-size:0.85rem;color:rgba(240,244,255,0.5);">Verificación: cada fila suma 1.00 ✓</p>
    `
  },
  {
    title: 'Ecuaciones de Balance',
    icon: '⚖️',
    activeState: 0,
    content: `
      <p>Para la distribución estacionaria <strong>π</strong> se debe cumplir: <code style="color:#00ffcc">π·P = π</code></p>
      <div class="math-block">
π₀ = 0.70·π₀ + 0.60·π₁ + 0.50·π₂
π₁ = 0.20·π₀ + 0.30·π₁ + 0.20·π₂
π₂ = 0.10·π₀ + 0.10·π₁ + 0.30·π₂

Más la condición de normalización:
π₀ + π₁ + π₂ = 1</div>
      <p>Reorganizando el sistema de ecuaciones lineales...</p>
    `
  },
  {
    title: 'Resolución del Sistema',
    icon: '🧮',
    activeState: 1,
    content: `
      <p>Despejando de las ecuaciones de balance:</p>
      <div class="math-block">
De π₂:  0.70·π₂ = 0.10·π₀ + 0.10·π₁
        π₂ = (π₀ + π₁) / 7

De π₁:  0.70·π₁ = 0.20·π₀ + 0.20·π₂
        → sustituyendo π₂:
        4.7·π₁ = 1.6·π₀
        π₁ = (1.6/4.7)·π₀ ≈ 0.3404·π₀

Entonces:
        π₂ ≈ 0.1915·π₀</div>
    `
  },
  {
    title: 'Distribución Estacionaria',
    icon: '✨',
    activeState: 2,
    content: `
      <p>Aplicando normalización <code style="color:#00ffcc">π₀ + π₁ + π₂ = 1</code>:</p>
      <div class="math-block">
π₀(1 + 0.3404 + 0.1915) = 1
π₀ × 1.5319 = 1
π₀ ≈ 0.6528</div>
      <p>Resultado final:</p>
      <div class="ss-bars">
        <div class="ss-bar-row">
          <span class="ss-bar-label" style="color:#39ff14">● Operativa</span>
          <div class="ss-bar-track"><div class="ss-bar-fill" style="background:#39ff14; width:65.28%;"></div></div>
          <span class="ss-bar-val" style="color:#39ff14">65.28%</span>
        </div>
        <div class="ss-bar-row">
          <span class="ss-bar-label" style="color:#ff9f00">● Mantenimiento</span>
          <div class="ss-bar-track"><div class="ss-bar-fill" style="background:#ff9f00; width:22.22%;"></div></div>
          <span class="ss-bar-val" style="color:#ff9f00">22.22%</span>
        </div>
        <div class="ss-bar-row">
          <span class="ss-bar-label" style="color:#ff2d78">● Falla Crítica</span>
          <div class="ss-bar-track"><div class="ss-bar-fill" style="background:#ff2d78; width:12.50%;"></div></div>
          <span class="ss-bar-val" style="color:#ff2d78">12.50%</span>
        </div>
      </div>
    `
  },
  {
    title: 'Interpretación',
    icon: '💡',
    activeState: null,
    content: `
      <p>A largo plazo, la máquina se encontrará:</p>
      <ul style="margin:0.75rem 0; color:rgba(240,244,255,0.65); font-size:0.88rem; display:flex; flex-direction:column; gap:0.55rem;">
        <li><strong style="color:#39ff14">65.3%</strong> del tiempo en estado Operativa — producción normal ✓</li>
        <li><strong style="color:#ff9f00">22.2%</strong> del tiempo en Mantenimiento — paradas planificadas</li>
        <li><strong style="color:#ff2d78">12.5%</strong> del tiempo en Falla Crítica — requiere intervención urgente</li>
      </ul>
      <p>Disponibilidad efectiva de la máquina: <strong style="color:#39ff14;font-size:1.1rem;">65.28%</strong></p>
      <p style="font-size:0.82rem;color:rgba(240,244,255,0.4);margin-top:0.75rem;">
        Si se mejoran los procedimientos de mantenimiento para reducir la tasa de falla crítica,
        la disponibilidad podría aumentar significativamente.
      </p>
    `
  }
];

let currentStep = 0;

// ---- Render state diagram (SVG) ----
function renderDiagram(highlightState) {
  const svg = document.getElementById('state-diagram-svg');
  if (!svg) return;

  const positions = [
    { x: 190, y: 60  },  // O — top center
    { x: 60,  y: 230 },  // M — bottom left
    { x: 320, y: 230 }   // F — bottom right
  ];

  const radius = 42;

  // Arrow helper
  function arrow(fromIdx, toIdx, label, offset) {
    const from = positions[fromIdx];
    const to   = positions[toIdx];
    const dx   = to.x - from.x;
    const dy   = to.y - from.y;
    const len  = Math.sqrt(dx*dx + dy*dy);
    const ux   = dx / len;
    const uy   = dy / len;

    // Curve control point (perpendicular offset)
    const cx = (from.x + to.x) / 2 - uy * offset;
    const cy = (from.y + to.y) / 2 + ux * offset;

    const sx = from.x + ux * radius;
    const sy = from.y + uy * radius;
    const ex = to.x   - ux * radius;
    const ey = to.y   - uy * radius;

    const lx = cx;
    const ly = cy;

    const color = STATES[fromIdx].color;
    const opacity = 0.55;

    return `
      <path d="M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}"
            fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5"
            marker-end="url(#arrow-${fromIdx})"/>
      <text x="${lx}" y="${ly - 4}" text-anchor="middle"
            font-family="Fira Code" font-size="9" fill="${color}" opacity="0.8">${label}</text>`;
  }

  const arrows = [
    // From O
    arrow(0, 1, '0.20', 30),
    arrow(0, 2, '0.10', -30),
    // From M
    arrow(1, 0, '0.60', 30),
    arrow(1, 2, '0.10', 20),
    // From F
    arrow(2, 0, '0.50', -30),
    arrow(2, 1, '0.20', 20),
  ];

  // Self-loops (simplified text)
  const selfLoops = [
    `<text x="190" y="16" text-anchor="middle" font-family="Fira Code" font-size="8" fill="#39ff14" opacity="0.65">↺ 0.70</text>`,
    `<text x="14"  y="240" text-anchor="start" font-family="Fira Code" font-size="8" fill="#ff9f00" opacity="0.65">↺ 0.30</text>`,
    `<text x="370" y="240" text-anchor="end"   font-family="Fira Code" font-size="8" fill="#ff2d78" opacity="0.65">↺ 0.30</text>`
  ];

  const nodes = positions.map((pos, i) => {
    const s     = STATES[i];
    const isHl  = highlightState === i;
    const glow  = isHl ? `filter="url(#glow-${i})"` : '';
    const scale = isHl ? 1.15 : 1;
    return `
      <g transform="translate(${pos.x}, ${pos.y}) scale(${scale})" style="transition:all 0.4s;">
        <circle r="${radius}" fill="rgba(8,11,20,0.85)"
                stroke="${s.color}" stroke-width="${isHl ? 3 : 1.5}"
                stroke-opacity="${isHl ? 1 : 0.6}"
                ${isHl ? `filter="url(#glow)"` : ''}/>
        <text y="-6" text-anchor="middle" font-family="Space Grotesk" font-size="18"
              font-weight="700" fill="${s.color}">${s.short}</text>
        <text y="12" text-anchor="middle" font-family="Inter" font-size="8"
              fill="${isHl ? s.color : 'rgba(240,244,255,0.5)'}">
          ${isHl ? '★ ' + (SS[i] * 100).toFixed(1) + '%' : s.name.split(' ')[0]}
        </text>
      </g>`;
  });

  svg.innerHTML = `
    <defs>
      ${STATES.map((s, i) => `
        <marker id="arrow-${i}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 Z" fill="${s.color}" opacity="0.7"/>
        </marker>`).join('')}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    ${arrows.join('')}
    ${selfLoops.join('')}
    ${nodes.join('')}`;
}

// ---- Render solution step panel ----
function renderStep(stepIdx) {
  document.querySelectorAll('.solution-step').forEach((el, i) => {
    el.classList.toggle('active', i === stepIdx);
  });

  // Update nav buttons
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) prevBtn.disabled = stepIdx === 0;
  if (nextBtn) nextBtn.disabled = stepIdx === STEPS.length - 1;

  // Step dots
  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === stepIdx);
    dot.classList.toggle('done', i < stepIdx);
  });

  // Indicator text
  const ind = document.getElementById('step-indicator-text');
  if (ind) ind.textContent = `Paso ${stepIdx + 1} de ${STEPS.length}`;

  // Diagram highlight
  renderDiagram(STEPS[stepIdx].activeState);

  // Confetti at final step
  if (stepIdx === STEPS.length - 1) {
    setTimeout(triggerConfetti3, 400);
  }
}

function triggerConfetti3() {
  if (typeof confetti === 'undefined') return;
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 },
             colors: ['#39ff14', '#00d4ff', '#7c3aed'] });
}

// ---- Navigation ----
function goNext() {
  if (currentStep < STEPS.length - 1) { currentStep++; renderStep(currentStep); }
}
function goPrev() {
  if (currentStep > 0) { currentStep--; renderStep(currentStep); }
}

// ---- Build DOM steps ----
function buildStepPanels() {
  const container = document.getElementById('solution-steps-container');
  if (!container) return;

  container.innerHTML = STEPS.map((step, i) => `
    <div class="solution-step glass-card ${i === 0 ? 'active' : ''}">
      <h4><span>${step.icon}</span> ${step.title}</h4>
      ${step.content}
    </div>`).join('');
}

function buildStepDots() {
  const container = document.getElementById('step-dots');
  if (!container) return;
  container.innerHTML = STEPS.map((_, i) =>
    `<div class="step-dot ${i === 0 ? 'active' : ''}"></div>`
  ).join('');
}

// ---- Keyboard navigation ----
document.addEventListener('keydown', e => {
  const ex3 = document.getElementById('ejercicio3');
  if (!ex3) return;
  const rect = ex3.getBoundingClientRect();
  if (rect.top > window.innerHeight || rect.bottom < 0) return;
  if (e.key === 'ArrowRight') goNext();
  if (e.key === 'ArrowLeft')  goPrev();
});

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  buildStepPanels();
  buildStepDots();
  renderStep(0);
});
