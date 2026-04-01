const QUESTIONS = [
  {
    id: 1,
    text: "¿Qué mide P(A|B)?",
    options: [
      "La probabilidad de A y B juntos",
      "La probabilidad de A dado que B ocurrió",
      "La probabilidad de B dado que A ocurrió",
      "La probabilidad de A o B"
    ],
    correct: 1,
    explanation: "P(A|B) es la probabilidad condicional de A dado B: restringe el espacio muestral al evento B ya ocurrido."
  },
  {
    id: 2,
    text: "A y B son independientes. ¿Cuál es la fórmula correcta?",
    options: [
      "P(A∩B) = P(A) + P(B)",
      "P(A|B) = P(B)",
      "P(A∩B) = P(A) · P(B)",
      "P(A∪B) = P(A) · P(B)"
    ],
    correct: 2,
    explanation: "Si A y B son independientes, P(A∩B) = P(A)·P(B). Equivalentemente, P(A|B) = P(A): B no aporta información sobre A."
  },
  {
    id: 3,
    text: "¿Qué establece el Teorema de Bayes?",
    options: [
      "Cómo sumar probabilidades de eventos mutuamente excluyentes",
      "Cómo actualizar una probabilidad a priori con nueva evidencia",
      "Que dos eventos independientes tienen probabilidad cero de intersección",
      "Cómo calcular la esperanza de una distribución continua"
    ],
    correct: 1,
    explanation: "Bayes permite 'invertir' la condicional: P(H|E) = P(E|H)·P(H) / P(E). Se usa para actualizar creencias con evidencia nueva."
  },
  {
    id: 4,
    text: "En una distribución Normal N(μ, σ), ¿qué porcentaje de datos cae en el intervalo [μ−2σ, μ+2σ]?",
    options: [
      "68.27%",
      "90.00%",
      "95.44%",
      "99.73%"
    ],
    correct: 2,
    explanation: "Regla empírica: ±1σ → 68.27%, ±2σ → 95.44%, ±3σ → 99.73%. En control de calidad, ±2σ es el criterio más usado."
  },
  {
    id: 5,
    text: "¿Qué parámetro define completamente a una distribución de Poisson?",
    options: [
      "μ y σ",
      "n y p",
      "λ (tasa media de ocurrencia)",
      "μ y λ"
    ],
    correct: 2,
    explanation: "La Poisson sólo necesita λ, que es a la vez su media y su varianza. Modela cantidad de eventos en un intervalo fijo (fallas, llegadas, defectos)."
  },
  {
    id: 6,
    text: "¿Cuál es la propiedad clave de la distribución Exponencial?",
    options: [
      "Su media siempre es mayor que su varianza",
      "Es simétrica respecto a la media",
      "No tiene memoria: P(T>s+t | T>s) = P(T>t)",
      "Solo toma valores enteros positivos"
    ],
    correct: 2,
    explanation: "La falta de memoria significa que el tiempo ya transcurrido no afecta la probabilidad futura. Por eso modela tiempos entre llegadas y tiempos de vida."
  },
  {
    id: 7,
    text: "La distribución Poisson es apropiada para modelar:",
    options: [
      "Tiempos de espera entre eventos",
      "Cantidad de eventos en un intervalo, cuando son raros e independientes",
      "Variables continuas con distribución simétrica",
      "Proporciones entre 0 y 1"
    ],
    correct: 1,
    explanation: "Poisson cuenta eventos discretos en un intervalo (tiempo, área, volumen) cuando ocurren a tasa constante e independientemente entre sí."
  },
  {
    id: 8,
    text: "¿Qué indica que el determinante de una matriz A sea igual a cero?",
    options: [
      "La matriz tiene solución única",
      "La matriz es invertible",
      "Las filas son linealmente dependientes; el sistema no tiene solución única",
      "Todos los elementos de A son cero"
    ],
    correct: 2,
    explanation: "det(A) = 0 → la matriz es singular (no invertible). Las filas son linealmente dependientes, por lo que el sistema Ax=b no tiene solución única."
  },
  {
    id: 9,
    text: "Para resolver el sistema Ax = b usando la inversa, la fórmula es:",
    options: [
      "x = b · A",
      "x = A · b",
      "x = A⁻¹ · b",
      "x = b⁻¹ · A"
    ],
    correct: 2,
    explanation: "Si det(A) ≠ 0, se puede multiplicar a izquierda por A⁻¹: A⁻¹·A·x = A⁻¹·b → x = A⁻¹·b."
  },
  {
    id: 10,
    text: "¿Cuál es la relación entre la distribución Exponencial y la Poisson?",
    options: [
      "No tienen relación",
      "Si los eventos siguen Poisson(λ), el tiempo entre eventos sigue Exp(λ)",
      "Si los eventos siguen Poisson(λ), el tiempo entre eventos sigue Normal(λ, λ)",
      "La Exponencial es un caso especial de la Poisson para n grande"
    ],
    correct: 1,
    explanation: "Son dos caras del mismo proceso: Poisson cuenta cuántos eventos hay en un intervalo; Exponencial mide cuánto tiempo pasa entre un evento y el siguiente."
  }
]

export default QUESTIONS
