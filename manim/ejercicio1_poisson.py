"""
ejercicio1_poisson.py — Animación Manim
Distribución de Poisson: Robot Seleccionador

Uso:
    pip install manim
    manim -pql ejercicio1_poisson.py PoissonExercise

Genera: media/videos/ejercicio1_poisson/480p15/PoissonExercise.mp4
Para alta calidad: manim -pqh ejercicio1_poisson.py PoissonExercise
"""

from manim import *
import numpy as np


NEON_BLUE   = "#00d4ff"
NEON_VIOLET = "#7c3aed"
NEON_CYAN   = "#00ffcc"
NEON_PINK   = "#ff2d78"
NEON_GREEN  = "#39ff14"
BG_COLOR    = "#080b14"

LAMBDA_VAL  = 3   # Tasa de fallas por turno


def poisson_pmf(lam: float, k: int) -> float:
    from math import factorial, exp
    return (lam ** k) * exp(-lam) / factorial(k)


class PoissonExercise(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        # 1. Título
        self._scene_title()
        # 2. Enunciado
        self._scene_problem()
        # 3. Fórmula
        self._scene_formula()
        # 4. Distribución animada
        self._scene_distribution()
        # 5. Respuestas
        self._scene_answers()

    # --------------------------------------------------
    def _scene_title(self):
        tag = Text("UTN FRBA · Repaso Operativa",
                   font_size=18, color=NEON_CYAN,
                   font="Fira Code").to_edge(UP, buff=0.3)

        title = Text("Distribución de Poisson",
                     font_size=40, color=NEON_BLUE,
                     weight=BOLD)

        subtitle = Text("Robot Seleccionador — Fallas en el Pistón",
                        font_size=22, color=WHITE)
        subtitle.set_opacity(0.65)

        group = VGroup(title, subtitle).arrange(DOWN, buff=0.4).center()

        self.play(Write(tag), run_time=0.8)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=0.8)
        self.play(FadeIn(subtitle), run_time=0.6)
        self.wait(1.5)
        self.play(FadeOut(group), FadeOut(tag))

    # --------------------------------------------------
    def _scene_problem(self):
        header = Text("Enunciado", font_size=28, color=NEON_VIOLET, weight=BOLD)
        header.to_edge(UP, buff=0.5)

        lines = [
            "Un robot seleccionador en una planta automotriz",
            "clasifica piezas con un pistón hidráulico.",
            "",
            "Las fallas del pistón siguen una distribución",
            f"de Poisson con  λ = {LAMBDA_VAL}  fallas por turno.",
            "",
            "Calcular:",
            "  a)  P(X = 2)             exactamente 2 fallas",
            "  b)  P(X ≤ 1)             a lo sumo 1 falla",
            "  c)  P(X ≥ 4)             4 o más fallas",
            "  d)  P(X = 0) en 2 turnos  ninguna falla",
        ]

        texts = VGroup(*[
            Text(line, font_size=18,
                 color=NEON_CYAN if "λ" in line or "Poisson" in line else
                       YELLOW if line.startswith("  ") else WHITE)
            for line in lines
        ]).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        texts.next_to(header, DOWN, buff=0.5).to_edge(LEFT, buff=1)

        self.play(Write(header), run_time=0.6)
        for t in texts:
            self.play(FadeIn(t, shift=RIGHT * 0.2), run_time=0.25)
        self.wait(2)
        self.play(FadeOut(VGroup(header, texts)))

    # --------------------------------------------------
    def _scene_formula(self):
        header = Text("La Fórmula de Poisson", font_size=30, color=NEON_BLUE, weight=BOLD)
        header.to_edge(UP, buff=0.5)

        formula = MathTex(
            r"P(X = k) = \frac{\lambda^k \cdot e^{-\lambda}}{k!}",
            font_size=54, color=WHITE
        )
        formula.center()

        parts_desc = VGroup(
            Text("λ  =  tasa promedio de fallas  =  3", font_size=18, color=NEON_CYAN),
            Text("k  =  número de fallas en el período", font_size=18, color=NEON_CYAN),
            Text("e  ≈  2.71828  (base neperiana)", font_size=18, color=NEON_CYAN),
        ).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        parts_desc.to_edge(DOWN, buff=1)

        self.play(Write(header))
        self.play(Write(formula), run_time=1.5)
        self.wait(0.5)
        for d in parts_desc:
            self.play(FadeIn(d, shift=UP * 0.15), run_time=0.4)
        self.wait(2)

        # Substitute λ=3
        formula_sub = MathTex(
            r"P(X = k) = \frac{3^k \cdot e^{-3}}{k!}",
            font_size=54, color=NEON_CYAN
        ).center()

        self.play(TransformMatchingTex(formula, formula_sub), run_time=1)
        self.wait(1.5)
        self.play(FadeOut(VGroup(header, formula_sub, parts_desc)))

    # --------------------------------------------------
    def _scene_distribution(self):
        header = Text(f"Distribución Poisson (λ = {LAMBDA_VAL})",
                      font_size=28, color=NEON_BLUE, weight=BOLD)
        header.to_edge(UP, buff=0.4)
        self.play(Write(header))

        k_vals   = list(range(11))
        probs    = [poisson_pmf(LAMBDA_VAL, k) for k in k_vals]
        max_prob = max(probs)

        bar_w = 0.5
        spacing = 0.65
        chart_h = 3.5
        origin = np.array([-3.2, -2.0, 0])

        colors_map = {
            0: NEON_VIOLET, 1: NEON_VIOLET,
            2: NEON_BLUE,
            3: NEON_CYAN,
            **{k: NEON_PINK for k in range(4, 11)}
        }

        bars = []
        labels = []
        val_labels = []

        for i, (k, p) in enumerate(zip(k_vals, probs)):
            bar_h = (p / max_prob) * chart_h
            x     = origin[0] + i * spacing
            y_bot = origin[1]
            rect  = Rectangle(width=bar_w, height=bar_h,
                               fill_color=colors_map.get(k, NEON_CYAN),
                               fill_opacity=0.85,
                               stroke_color=WHITE,
                               stroke_width=0.5)
            rect.move_to(np.array([x, y_bot + bar_h / 2, 0]))
            bars.append(rect)

            lbl = Text(f"k={k}", font_size=11, color=WHITE).set_opacity(0.65)
            lbl.move_to(np.array([x, y_bot - 0.22, 0]))
            labels.append(lbl)

            pct = Text(f"{p*100:.1f}%", font_size=9, color=colors_map.get(k, NEON_CYAN))
            pct.move_to(np.array([x, y_bot + bar_h + 0.18, 0]))
            val_labels.append(pct)

        # Axes
        x_axis = Line(origin, origin + np.array([spacing * 10 + 0.5, 0, 0]),
                      color=WHITE, stroke_opacity=0.3, stroke_width=1.5)
        y_axis = Line(origin, origin + np.array([0, chart_h + 0.4, 0]),
                      color=WHITE, stroke_opacity=0.3, stroke_width=1.5)

        self.play(Create(x_axis), Create(y_axis))
        for lbl in labels:
            self.add(lbl)

        for bar, pct in zip(bars, val_labels):
            self.play(GrowFromEdge(bar, DOWN), run_time=0.18)
            self.add(pct)

        self.wait(2)

        # Highlight k=2 (answer a)
        highlight_box = SurroundingRectangle(bars[2], color=NEON_BLUE, buff=0.06, stroke_width=2)
        hl_label = Text("P(X=2) = 22.40%", font_size=14, color=NEON_BLUE)
        hl_label.next_to(highlight_box, UP, buff=0.15)
        self.play(Create(highlight_box), Write(hl_label), run_time=0.8)
        self.wait(1.2)

        # Highlight k=0,1 (answer b)
        hl2 = SurroundingRectangle(
            VGroup(bars[0], bars[1]), color=NEON_VIOLET, buff=0.06, stroke_width=2
        )
        hl2_lbl = Text("P(X≤1) = 19.91%", font_size=14, color=NEON_VIOLET)
        hl2_lbl.next_to(hl2, DOWN, buff=0.15)
        self.play(Create(hl2), Write(hl2_lbl), run_time=0.8)
        self.wait(1.2)

        # Highlight k>=4 (answer c)
        hl3 = SurroundingRectangle(
            VGroup(*bars[4:]), color=NEON_PINK, buff=0.06, stroke_width=2
        )
        hl3_lbl = Text("P(X≥4) = 35.28%", font_size=14, color=NEON_PINK)
        hl3_lbl.next_to(hl3, UR, buff=0.08)
        self.play(Create(hl3), Write(hl3_lbl), run_time=0.8)
        self.wait(2)

        self.play(FadeOut(VGroup(
            x_axis, y_axis, *bars, *labels, *val_labels,
            highlight_box, hl_label, hl2, hl2_lbl, hl3, hl3_lbl,
            header
        )))

    # --------------------------------------------------
    def _scene_answers(self):
        header = Text("Respuestas", font_size=32, color=NEON_GREEN, weight=BOLD)
        header.to_edge(UP, buff=0.5)

        answers = [
            ("a)", "P(X = 2)",          "0.2240", "22.40%", NEON_BLUE),
            ("b)", "P(X ≤ 1)",          "0.1991", "19.91%", NEON_VIOLET),
            ("c)", "P(X ≥ 4)",          "0.3528", "35.28%", NEON_PINK),
            ("d)", "P(X=0, 2 turnos)",  "0.0025",  "0.25%", NEON_CYAN),
        ]

        rows = VGroup()
        for letter, expr, val, pct, color in answers:
            row = VGroup(
                Text(letter, font_size=20, color=color),
                Text(expr,   font_size=20, color=WHITE),
                Text("=",    font_size=20, color=WHITE).set_opacity(0.5),
                Text(val,    font_size=22, color=color, weight=BOLD),
                Text(f"({pct})", font_size=16, color=color).set_opacity(0.7),
            ).arrange(RIGHT, buff=0.35)
            rows.add(row)

        rows.arrange(DOWN, buff=0.45, aligned_edge=LEFT).center()

        self.play(Write(header))
        for row in rows:
            self.play(FadeIn(row, shift=RIGHT * 0.3), run_time=0.5)
        self.wait(0.5)

        # Final checkmarks
        checks = VGroup(*[
            Text("✓", font_size=28, color=NEON_GREEN).next_to(row, RIGHT, buff=0.3)
            for row in rows
        ])
        for check in checks:
            self.play(FadeIn(check, scale=1.5), run_time=0.25)

        self.wait(2.5)

        finale = Text("¡Listo! 🎯", font_size=48, color=NEON_GREEN, weight=BOLD).center()
        self.play(FadeOut(VGroup(header, rows, checks)))
        self.play(FadeIn(finale, scale=0.5))
        self.wait(2)
