const QUESTIONS = [
  {
    id: 1,
    text: "Una línea de producción fabrica el 60% de las piezas en máquina A y 40% en máquina B. La tasa de defectos de A es 3% y la de B es 5%. Se encuentra una pieza defectuosa. ¿Cuál es la probabilidad de que provenga de la máquina B? (Bayes)",
    options: [
      "31.6%",
      "47.4%",
      "52.6%",
      "60.0%"
    ],
    correct: 2,
    explanation: "P(B|D) = P(D|B)·P(B) / [P(D|A)·P(A)+P(D|B)·P(B)] = (0.05×0.40) / (0.03×0.60 + 0.05×0.40) = 0.020 / 0.038 ≈ 52.6%. El teorema de Bayes invierte la condicional."
  },
  {
    id: 2,
    text: "El 2% de los tornillos de una planta son defectuosos. Un sensor detecta el 95% de los defectuosos pero también genera falsos positivos en el 3% de los buenos. Si el sensor marca un tornillo como defectuoso, ¿cuál es la probabilidad real de que lo sea?",
    options: [
      "2.0%",
      "39.3%",
      "61.2%",
      "95.0%"
    ],
    correct: 1,
    explanation: "P(D|+) = (0.95×0.02) / (0.95×0.02 + 0.03×0.98) = 0.019 / 0.0484 ≈ 39.3%. Aunque el sensor es preciso, la baja prevalencia de defectos (2%) hace que casi el 61% de las alarmas sean falsas."
  },
  {
    id: 3,
    text: "Un sistema de seguridad tiene 3 sensores independientes, cada uno con probabilidad de falla de 0.10. El sistema falla sólo si los 3 sensores fallan simultáneamente. ¿Cuál es la probabilidad de que el sistema funcione correctamente?",
    options: [
      "72.9%",
      "90.0%",
      "97.0%",
      "99.9%"
    ],
    correct: 3,
    explanation: "P(falla sistema) = 0.1³ = 0.001. P(funciona) = 1 − 0.001 = 0.999 = 99.9%. La redundancia en paralelo reduce drásticamente la probabilidad de falla total."
  },
  {
    id: 4,
    text: "El diámetro de piezas producidas sigue N(μ=50mm, σ=0.5mm). Las piezas son aceptables entre 49 y 51 mm. ¿Qué porcentaje de piezas está dentro de tolerancia?",
    options: [
      "68.27%  (±1σ)",
      "95.44%  (±2σ)",
      "97.72%",
      "99.73%  (±3σ)"
    ],
    correct: 1,
    explanation: "Z₁ = (49−50)/0.5 = −2 y Z₂ = (51−50)/0.5 = +2. P(−2 < Z < 2) = 95.44%. La regla empírica: ±2σ cubre el 95.44% de la producción."
  },
  {
    id: 5,
    text: "El tiempo de ensamble de un componente sigue N(μ=12 min, σ=2 min). ¿Cuál es la probabilidad de que un operario tarde MÁS de 15 minutos?",
    options: [
      "1.50%",
      "6.68%",
      "15.00%",
      "93.32%"
    ],
    correct: 1,
    explanation: "Z = (15−12)/2 = 1.5. P(Z > 1.5) = 1 − Φ(1.5) = 1 − 0.9332 = 6.68%. Sólo 1 de cada 15 operarios superará los 15 min en condiciones normales."
  },
  {
    id: 6,
    text: "Las roturas de máquinas en una planta siguen Poisson con λ=3 roturas/semana. ¿Cuál es la probabilidad de que haya EXACTAMENTE 2 roturas en una semana?",
    options: [
      "0.1494",
      "0.2240",
      "0.3333",
      "0.4232"
    ],
    correct: 1,
    explanation: "P(X=2) = e⁻³ · 3² / 2! = e⁻³ · 9/2 ≈ 0.0498 · 4.5 ≈ 0.2240. La Poisson modela eventos raros en un intervalo fijo, muy útil para planificar mantenimiento."
  },
  {
    id: 7,
    text: "Llegan camiones a un depósito según Poisson con λ=5 camiones/hora. ¿Cuál es la probabilidad de que en una hora lleguen A LO SUMO 3 camiones?",
    options: [
      "0.1247",
      "0.2650",
      "0.4405",
      "0.7350"
    ],
    correct: 1,
    explanation: "P(X≤3) = Σ e⁻⁵·5ᵏ/k! para k=0..3 = e⁻⁵(1+5+12.5+20.83) ≈ 0.00674·39.33 ≈ 0.2650. Con λ=5 hay alta probabilidad de superar 3 llegadas; el depósito debe dimensionarse para eso."
  },
  {
    id: 8,
    text: "El tiempo entre fallas de una máquina sigue Exp(λ=0.25 fallas/hora), es decir MTTF=4 h. ¿Cuál es la probabilidad de que funcione MÁS de 6 horas sin fallar?",
    options: [
      "0.1054",
      "0.2231",
      "0.3935",
      "0.7769"
    ],
    correct: 1,
    explanation: "P(T > 6) = e^(−λt) = e^(−0.25·6) = e^(−1.5) ≈ 0.2231. La exponencial tiene la propiedad de falta de memoria: la máquina no 'recuerda' cuánto lleva funcionando."
  },
  {
    id: 9,
    text: "El balance de materiales de una planta está dado por el sistema:\n  3x₁ + 2x₂ = 2400\n  x₁  + 4x₂ = 1600\n¿Cuántas unidades se producen del producto 1 (x₁)?",
    options: [
      "x₁ = 400",
      "x₁ = 480",
      "x₁ = 600",
      "x₁ = 640"
    ],
    correct: 3,
    explanation: "De la 2ª ecuación: x₁ = 1600−4x₂. Sustituyendo: 3(1600−4x₂)+2x₂=2400 → x₂=240. Entonces x₁=1600−960=640. Resolver sistemas lineales con matrices es clave en optimización de producción."
  },
  {
    id: 10,
    text: "La matriz de costos de un proceso es A = [[4, 2], [1, 3]]. Calculás det(A) para verificar si el sistema tiene solución única. ¿Cuál es det(A) y qué concluís?",
    options: [
      "det(A) = 6 → sistema sin solución",
      "det(A) = 10 → sistema con solución única",
      "det(A) = 10 → infinitas soluciones",
      "det(A) = 14 → sistema inconsistente"
    ],
    correct: 1,
    explanation: "det(A) = 4·3 − 2·1 = 12 − 2 = 10 ≠ 0. Si el determinante es distinto de cero, la matriz es invertible y el sistema tiene solución única. Si fuera 0, el sistema no tendría solución o tendría infinitas."
  }
]

export default QUESTIONS
