# Motion Guidelines: Scoreboard & Track Theme

This reference outlines the transition, animation, and interaction guidelines tailored to the **Stadium Scoreboard meets Track & Field** aesthetic. 

Our animation model mimics mechanical, physical scoreboards and structured athletic track motions, explicitly avoiding bouncy, playful, or complex modern SaaS UI dynamics.

---

## 1. Scoreboard Count-up Animation
* **Target Elements**: All major numerical totals (KPI grids, scorecard metrics).
* **Framework**: Native browser `requestAnimationFrame` loop, avoiding spring-based libraries.
* **Duration**: Exactly **800ms** from initial render or state update.
* **Easing Curve**: Quadratic Ease-Out (`easeOutQuad`):
  $$\text{value} = t \times (2 - t)$$
  *Rationale*: Smoothly brakes to a halt at the final value, mimicking the gradual lock of a mechanical flip-digit, without bouncy rebound states.

---

## 2. Track & Field Bar Re-sorting
* **Target Elements**: Recharts horizontal and vertical bars during parameter switches or filter re-evaluations.
* **Property**: Positions and widths animate smoothly when values scale or indices shift.
* **Config (Recharts)**:
  - `isAnimationActive`: `true`
  - `animationDuration`: `400ms`
  - `animationEasing`: `ease-out`
  *Rationale*: Bars glide along their lanes like runners finishing a race.

---

## 3. Strict Easing Restrictions
* **Permitted Easings**:
  - `linear` (constant speed, mechanical rotation).
  - `ease-out` (smooth decrescendo).
* **Forbidden Easings**:
  - `elastic` / `bounce` / `spring` (bounciness is strictly prohibited; these are too playful for a scoreboard aesthetic).
  - Heavy `ease-in` drag (delays initial response feels lagging).

---

## 4. Podium Rank Interactivity
* **Gold Column (Rank 1)**:
  - Trigger: Hover state.
  - Animation: CSS `transition: filter 0.2s ease-out`.
  - Effect: Shifting `filter: brightness(1.15)` (brightness increases slightly, simulating a scoreboard spotlight turning on).
  - Restrictions: **No sweep animations, shiny gradients, or structural transformations** (scale up/down).
* **Silver & Bronze Columns**:
  - State: Static structure.
  - Hover: No hover transformations (restrains visual clutter, focusing user attention on peak rank achievements).
