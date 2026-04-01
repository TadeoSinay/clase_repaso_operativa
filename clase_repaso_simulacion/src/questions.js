const QUESTIONS = [
  {
    id: 1,
    text: "¿Cuál es la principal ventaja de la simulación frente a los modelos analíticos?",
    options: [
      "Siempre produce resultados más precisos",
      "Permite modelar sistemas complejos sin solución analítica cerrada",
      "Requiere menos datos de entrada",
      "Es más rápida de implementar que cualquier modelo matemático"
    ],
    correct: 1,
    explanation: "La simulación brilla cuando el sistema es demasiado complejo para resolverse analíticamente (colas con múltiples servidores, variabilidad aleatoria, etc.)."
  },
  {
    id: 2,
    text: "En el método de Monte Carlo, ¿qué rol cumplen los números pseudoaleatorios?",
    options: [
      "Definen los parámetros fijos del modelo",
      "Calculan el valor esperado de forma exacta",
      "Representan la incertidumbre mediante muestreo probabilístico",
      "Determinan únicamente la duración de la simulación"
    ],
    correct: 2,
    explanation: "Los números U(0,1) se transforman en muestras de las distribuciones de los procesos, modelando la aleatoriedad inherente del sistema."
  },
  {
    id: 3,
    text: "Una cola M/M/1 tiene ρ = 0.8. ¿Cuántos clientes hay en promedio en el sistema (Ls)?",
    options: [
      "0.8 clientes",
      "3.2 clientes",
      "1.6 clientes",
      "4 clientes"
    ],
    correct: 3,
    explanation: "Ls = ρ / (1 − ρ) = 0.8 / 0.2 = 4. ¡Ojo con confundir Ls (sistema) con Lq (sólo en cola = ρ² / (1−ρ) = 3.2)!"
  },
  {
    id: 4,
    text: "¿Por qué se descarta el período inicial (warm-up) al analizar estado estacionario?",
    options: [
      "Los datos del inicio son estadísticamente incorrectos por definición",
      "El sistema aún no alcanzó el estado estacionario y sesgaría las estadísticas",
      "Consumen demasiada memoria de cómputo",
      "Los generadores pseudoaleatorios son menos confiables al inicio"
    ],
    correct: 1,
    explanation: "Durante el warm-up el sistema parte de condiciones iniciales artificiales (ej. cola vacía). Incluir ese período sobreestima o subestima las métricas de largo plazo."
  },
  {
    id: 5,
    text: "Para generar X ~ Exponencial(λ) con la transformada inversa (U ~ Uniforme(0,1)), la fórmula correcta es:",
    options: [
      "X = λ · ln(U)",
      "X = −ln(U) / λ",
      "X = −λ · ln(1 − U)",
      "Las opciones B y C son equivalentes entre sí"
    ],
    correct: 3,
    explanation: "Como (1−U) ~ U(0,1), −ln(U)/λ y −ln(1−U)/λ generan la misma distribución. Ambas son correctas e intercambiables."
  },
  {
    id: 6,
    text: "Si se duplica el número de réplicas en una simulación Monte Carlo, el error estándar del estimador:",
    options: [
      "Se duplica",
      "Se reduce a la mitad",
      "No cambia",
      "Se reduce en un factor de √2 (≈ 1.41)"
    ],
    correct: 3,
    explanation: "SE = σ/√n. Al pasar de n a 2n, SE nueva = σ/√(2n) = SE original / √2. Reducir el error a la mitad requiere cuadruplicar las réplicas."
  },
  {
    id: 7,
    text: "¿Cuál es la diferencia clave entre verificación y validación de un modelo de simulación?",
    options: [
      "Son sinónimos; ambas evalúan si el modelo es correcto",
      "Verificación: el modelo está bien programado; Validación: representa el sistema real",
      "Validación: el código no tiene bugs; Verificación: el modelo es realista",
      "Solo la validación es necesaria en proyectos industriales"
    ],
    correct: 1,
    explanation: "Verificar = ¿construimos el modelo correctamente? (código). Validar = ¿construimos el modelo correcto? (¿refleja la realidad?). Ambas son indispensables."
  },
  {
    id: 8,
    text: "En una simulación estocástica, ¿cuál es el propósito de ejecutar múltiples réplicas independientes?",
    options: [
      "Reducir el tiempo total de cómputo distribuyendo la carga",
      "Generar más datos de entrada para el modelo",
      "Estimar la variabilidad y construir intervalos de confianza sobre las métricas",
      "Validar el modelo comparando con distintos parámetros"
    ],
    correct: 2,
    explanation: "Cada réplica usa semillas distintas → resultados distintos. El conjunto permite calcular media, varianza e IC, cuantificando la incertidumbre del estimador."
  },
  {
    id: 9,
    text: "Si en un sistema de colas λ > μ en forma sostenida, ¿qué le ocurre a la longitud de la cola?",
    options: [
      "Fluctúa estocásticamente alrededor de un valor fijo",
      "Crece indefinidamente: el sistema es inestable (ρ > 1)",
      "Se vacía periódicamente durante las horas valle",
      "Converge al estado estacionario con Ls = λ/(μ − λ)"
    ],
    correct: 1,
    explanation: "ρ = λ/μ > 1 implica que llegan más clientes de los que se pueden atender. La cola crece sin límite → el sistema no tiene estado estacionario."
  },
  {
    id: 10,
    text: "Una simulación reporta tiempo medio de espera = 4.2 min con IC 95% [3.8 ; 4.6]. El modelo analítico da 4.0 min. ¿Qué concluís?",
    options: [
      "La simulación tiene errores; su resultado debería coincidir exactamente",
      "El modelo analítico es incorrecto ya que no coincide con 4.2",
      "El valor analítico cae dentro del IC → ambos modelos son estadísticamente consistentes",
      "Hay que aumentar las réplicas hasta que los valores coincidan exactamente"
    ],
    correct: 2,
    explanation: "4.0 ∈ [3.8 ; 4.6] → no hay evidencia estadística de discrepancia. La simulación es aleatoria; la exactitud se mide con IC, no con coincidencia puntual."
  }
]

export default QUESTIONS
