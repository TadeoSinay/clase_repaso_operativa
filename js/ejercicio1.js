/* ===================================================
   ejercicio1.js — Distribución de Poisson Interactiva
   Robot Seleccionador — Fallas en el Pistón
   =================================================== */

// ---- Math helpers ----
function factorial(n) {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poissonPMF(lambda, k) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function poissonCDF(lambda, k) {
  let sum = 0;
  for (let i = 0; i <= k; i++) sum += poissonPMF(lambda, i);
  return sum;
}

// ---- Exercise answers (λ=3, fixed) ----
const EX_LAMBDA = 3;

function computeAnswers(lam) {
  return {
    a: poissonPMF(lam, 2),
    b: poissonCDF(lam, 1),
    c: 1 - poissonCDF(lam, 3),
    d: Math.exp(-lam * 2)   // λ_total = lam*2 for 2 shifts, P(X=0)
  };
}

// ---- Chart setup ----
let poissonChart;
const K_MAX = 14;
const HIGHLIGHT_K = 2; // default highlight

function buildChartData(lam) {
  const labels = [];
  const data   = [];
  const colors = [];
  for (let k = 0; k <= K_MAX; k++) {
    labels.push('k=' + k);
    const p = poissonPMF(lam, k);
    data.push(p);
    if (k === HIGHLIGHT_K) {
      colors.push('rgba(0,212,255,0.9)');
    } else if (k === 0 || k === 1) {
      colors.push('rgba(124,58,237,0.7)');
    } else if (k >= 4) {
      colors.push('rgba(255,45,120,0.65)');
    } else {
      colors.push('rgba(0,255,204,0.55)');
    }
  }
  return { labels, data, colors };
}

function initChart() {
  const ctx = document.getElementById('poisson-chart');
  if (!ctx) return;

  const { labels, data, colors } = buildChartData(EX_LAMBDA);

  poissonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'P(X = k)',
        data,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace(/[\d.]+\)$/, '1)')),
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 350, easing: 'easeInOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(8,11,20,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
          callbacks: {
            label: ctx => {
              const val = ctx.raw;
              return ` P(X=${ctx.dataIndex}) = ${(val * 100).toFixed(3)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: 'rgba(240,244,255,0.45)', font: { family: 'Fira Code', size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: 'rgba(240,244,255,0.45)',
            font: { family: 'Fira Code', size: 11 },
            callback: v => (v * 100).toFixed(1) + '%'
          },
          beginAtZero: true
        }
      }
    }
  });
}

function updateChart(lam) {
  if (!poissonChart) return;
  const { data, colors } = buildChartData(lam);
  poissonChart.data.datasets[0].data = data;
  poissonChart.data.datasets[0].backgroundColor = colors;
  poissonChart.update();
}

// ---- Probability table ----
function renderTable(lam) {
  const tbody = document.getElementById('prob-table-body');
  if (!tbody) return;
  let html = '';
  let cumul = 0;
  for (let k = 0; k <= K_MAX; k++) {
    const p    = poissonPMF(lam, k);
    cumul += p;
    const pGe  = 1 - cumul + p;
    const isHl = (k === 2);
    html += `<tr class="${isHl ? 'highlighted-row' : ''}">
      <td>${k}</td>
      <td>${(p * 100).toFixed(4)}%</td>
      <td>${(cumul * 100).toFixed(4)}%</td>
      <td>${((1 - cumul + p) * 100).toFixed(4)}%</td>
    </tr>`;
  }
  tbody.innerHTML = html;
}

// ---- Answer cards ----
function renderAnswers(lam) {
  const ans = computeAnswers(lam);
  const defs = [
    { id: 'ans-a', val: ans.a, expr: 'P(X = 2)', label: 'a)' },
    { id: 'ans-b', val: ans.b, expr: 'P(X ≤ 1)', label: 'b)' },
    { id: 'ans-c', val: ans.c, expr: 'P(X ≥ 4)', label: 'c)' },
    { id: 'ans-d', val: ans.d, expr: 'P(X=0, 2 turnos)', label: 'd)' }
  ];
  defs.forEach(({ id, val, expr, label }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.querySelector('.answer-card-val').textContent  = val.toFixed(4);
    el.querySelector('.answer-card-pct').textContent  = (val * 100).toFixed(2) + '%';
    el.querySelector('.answer-card-expr').textContent = expr + '  (λ=' + lam + ')';
    el.classList.add('solved');
  });
}

// ---- Robot animation toggle ----
let failInterval;
function startFailAnimation() {
  const container = document.getElementById('robot-container');
  if (!container) return;
  container.classList.add('failing');
  clearTimeout(failInterval);
  failInterval = setTimeout(() => container.classList.remove('failing'), 1800);
}

// ---- Sliders ----
function initSliders() {
  const lambdaSlider = document.getElementById('lambda-slider');
  const lambdaVal    = document.getElementById('lambda-val');
  if (!lambdaSlider) return;

  function onUpdate() {
    const lam = parseFloat(lambdaSlider.value);
    lambdaVal.textContent = lam.toFixed(1);
    updateChart(lam);
    renderTable(lam);
    renderAnswers(lam);
    if (lam > 3) startFailAnimation();
  }

  lambdaSlider.addEventListener('input', onUpdate);
  // Init with exercise value
  lambdaSlider.value = EX_LAMBDA;
  onUpdate();
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  initChart();
  initSliders();
  renderTable(EX_LAMBDA);
  renderAnswers(EX_LAMBDA);

  // Trigger robot fail animation every 4s for fun
  setInterval(startFailAnimation, 4000);
});
