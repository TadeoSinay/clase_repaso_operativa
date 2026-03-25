/* ===================================================
   ejercicio2.js — Funnel de Conversión Interactivo
   Side Quest: Probabilidades Condicionales
   =================================================== */

const FUNNEL_STAGES = [
  {
    id: 'stage-0',
    name: 'Impresión del Anuncio',
    icon: '📢',
    rate: 1.00,
    convRate: null,
    users: 10000,
    color: '#00d4ff',
    cta: 'Lanzar Campaña',
    desc: 'La campaña de e-learning llega a 10.000 usuarios en redes sociales.'
  },
  {
    id: 'stage-1',
    name: 'Click en Banner',
    icon: '🖱️',
    rate: 0.08,
    convRate: 0.08,
    users: 800,
    color: '#7c3aed',
    cta: '¡Clickear Banner!',
    desc: 'De los impactados, un 8% hace click en el banner publicitario.'
  },
  {
    id: 'stage-2',
    name: 'Registro / Lead',
    icon: '✍️',
    rate: 0.30,
    convRate: 0.30,
    users: 240,
    color: '#00ffcc',
    cta: 'Completar Formulario',
    desc: 'De quienes clickearon, el 30% completa el formulario de registro.'
  },
  {
    id: 'stage-3',
    name: 'Inicio del Curso',
    icon: '🎓',
    rate: 0.50,
    convRate: 0.50,
    users: 120,
    color: '#ff9f00',
    cta: 'Comenzar Clases',
    desc: 'El 50% de los registrados inicia activamente el curso.'
  },
  {
    id: 'stage-4',
    name: 'Certificación',
    icon: '🏆',
    rate: 0.40,
    convRate: 0.40,
    users: 48,
    color: '#39ff14',
    cta: '¡Obtener Certificado!',
    desc: 'Solo el 40% de los activos completa y recibe su certificado.'
  }
];

let currentStage = 0;

// ---- Compute cumulative conversion ----
function getCumulativeProb(upToIndex) {
  let prob = 1;
  for (let i = 1; i <= upToIndex; i++) {
    prob *= FUNNEL_STAGES[i].convRate;
  }
  return prob;
}

// ---- Render funnel stages ----
function renderStages() {
  const container = document.getElementById('funnel-stages');
  if (!container) return;

  container.innerHTML = FUNNEL_STAGES.map((s, i) => {
    let stateClass = '';
    if (i < currentStage)       stateClass = 'done';
    else if (i === currentStage) stateClass = 'active';
    else                         stateClass = 'locked';

    const cumProb = i === 0 ? 100 : (getCumulativeProb(i) * 100);

    return `
    <div class="funnel-stage ${stateClass}" data-stage="${i}"
         style="--stage-color: ${s.color};">
      <div class="stage-header">
        <div class="stage-icon">${s.icon}</div>
        <div class="stage-info">
          <div class="stage-name">${s.name}</div>
          <div class="stage-rate">
            ${s.convRate !== null
              ? `Tasa etapa: <strong>${(s.convRate * 100).toFixed(0)}%</strong> &nbsp;·&nbsp; Usuarios: ~${s.users.toLocaleString()}`
              : `Universo inicial: <strong>${s.users.toLocaleString()}</strong> usuarios`
            }
          </div>
        </div>
        <div class="stage-badge ${i < currentStage ? 'done-badge' : ''}">
          ${i < currentStage ? '✓ Completado' : i === currentStage ? 'ACTIVO' : 'Bloqueado'}
        </div>
      </div>
      <div class="stage-progress-bar">
        <div class="stage-progress-fill ${i < currentStage ? 'done-fill' : ''}"
             style="width:${i < currentStage ? '100%' : '0%'}; background:${s.color};"></div>
      </div>
      ${i === currentStage ? `
        <div style="margin-top:0.75rem; font-size:0.85rem; color:rgba(240,244,255,0.6);">${s.desc}</div>
        <button class="funnel-cta-btn" onclick="advanceStage()" style="background:${s.color};">
          ${s.cta} →
        </button>
      ` : ''}
    </div>`;
  }).join('<div class="stage-connector" style="text-align:center;color:rgba(240,244,255,0.3);font-size:0.75rem;padding:0.15rem 0;">↓</div>');
}

// ---- Render probability sidebar ----
function renderSidebar() {
  const meterEl = document.getElementById('prob-meter-val');
  const chainEl = document.getElementById('prob-chain');
  if (!meterEl || !chainEl) return;

  const cumProb = currentStage === 0 ? 1 : getCumulativeProb(currentStage);
  meterEl.textContent = currentStage === 0 ? '100%' : (cumProb * 100).toFixed(3) + '%';

  let chainHtml = '';
  for (let i = 0; i <= currentStage; i++) {
    const s = FUNNEL_STAGES[i];
    const prob = i === 0 ? 1 : getCumulativeProb(i);
    const isCurrent = i === currentStage;

    chainHtml += `
      <div class="prob-chain-row visible ${isCurrent ? 'current' : ''}">
        <span class="pcr-label">${s.icon} ${s.name}</span>
        <span class="pcr-val" style="color:${s.color};">
          ${i === 0 ? '100%' : (prob * 100).toFixed(3) + '%'}
        </span>
      </div>`;

    if (i < currentStage) {
      chainHtml += `<div class="prob-chain-arrow">× ${(FUNNEL_STAGES[i+1].convRate * 100).toFixed(0)}%</div>`;
    }
  }

  // Pending locked stages (greyed)
  for (let i = currentStage + 1; i < FUNNEL_STAGES.length; i++) {
    chainHtml += `
      <div class="prob-chain-row">
        <span class="pcr-label" style="opacity:0.4;">${FUNNEL_STAGES[i].icon} ${FUNNEL_STAGES[i].name}</span>
        <span class="pcr-val" style="opacity:0.25;">—</span>
      </div>`;
  }

  chainEl.innerHTML = chainHtml;
}

// ---- Advance stage ----
function advanceStage() {
  if (currentStage >= FUNNEL_STAGES.length - 1) return;
  currentStage++;
  renderStages();
  renderSidebar();
  showUnlockToast(FUNNEL_STAGES[currentStage].name);

  if (currentStage === FUNNEL_STAGES.length - 1) {
    setTimeout(showFunnelSummary, 600);
    setTimeout(triggerConfetti, 800);
  }
}

// ---- Toast notification ----
let toastTimeout;
function showUnlockToast(stageName) {
  const toast = document.getElementById('unlock-toast');
  if (!toast) return;
  toast.textContent = '🎯 Etapa desbloqueada: ' + stageName;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ---- Funnel summary table ----
function showFunnelSummary() {
  const el = document.getElementById('funnel-summary');
  if (!el) return;
  el.classList.add('visible');

  let cumProb = 1;
  let rows = FUNNEL_STAGES.map((s, i) => {
    if (i > 0) cumProb *= s.convRate;
    return `<tr>
      <td>${s.icon} ${s.name}</td>
      <td class="num">${s.convRate !== null ? (s.convRate*100).toFixed(0)+'%' : '—'}</td>
      <td class="num">${(cumProb*100).toFixed(4)}%</td>
      <td class="num">${Math.round(10000 * cumProb).toLocaleString()}</td>
    </tr>`;
  }).join('');

  el.querySelector('.summary-tbody').innerHTML = rows;
}

// ---- Confetti ----
function triggerConfetti() {
  if (typeof confetti === 'undefined') return;
  const colors = ['#00d4ff', '#7c3aed', '#00ffcc', '#39ff14', '#ff2d78'];
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors });
  setTimeout(() => confetti({ particleCount: 80, spread: 120, angle: 60, origin: { x: 0, y: 0.6 }, colors }), 300);
  setTimeout(() => confetti({ particleCount: 80, spread: 120, angle: 120, origin: { x: 1, y: 0.6 }, colors }), 500);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderStages();
  renderSidebar();
});
