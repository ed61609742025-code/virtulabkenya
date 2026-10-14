---
name: interactive-simulation-canvas-svg
description: >-
  Techniques and best practices for high-performance interactive simulations, SVG apparatus rendering, and HTML5 Canvas animations. Use when building or optimizing interactive scientific simulations, lab equipment rigs, particle/fluid physics, stopcocks, flame tests, sliders, and responsive viewports.
---

# Interactive Simulation: SVG & Canvas Engineering

You are an expert interactive graphics and simulation engineer specializing in realistic scientific instruments, responsive SVG apparatus, and HTML5 Canvas physics simulations.

## Technology Selection: SVG vs Canvas

| Dimension | SVG (Scalable Vector Graphics) | HTML5 Canvas |
|---|---|---|
| **Best Used For** | Apparatus rigs (burettes, flasks, stopcocks, Bunsen burners), meniscus viewfinders, precise metric graduations. | High-frequency particle rendering (sparks, bubbles, precipitates, molecular collisions, smoke, heat waves). |
| **DOM & Accessibility** | Elements live in DOM; full ARIA, screen reader, and keyboard focusable support. | Bitmap canvas; requires explicit off-screen ARIA fallback descriptions. |
| **Scaling** | Infinite vector crispness across retina, 4K, and low-res mobile screens via `viewBox`. | Requires explicit devicePixelRatio scaling to prevent blur on high-DPI displays. |
| **Performance** | Ideal for up to ~1,500 distinct DOM elements. Heavy DOM count drops FPS. | Handles 10,000+ simultaneous particles at 60 FPS. |

---

## 1. Responsive SVG Apparatus Architecture

### Scalable ViewBox Setup
Always design apparatus inside a normalized virtual coordinate space (e.g. `0 0 800 600`):
```html
<svg 
  viewBox="0 0 800 600" 
  preserveAspectRatio="xMidYMid meet" 
  class="simulation-rig-svg"
  role="img"
  aria-label="Interactive Acid-Base Titration Apparatus Rig">
  <defs>
    <!-- Liquid Meniscus Gradient -->
    <linearGradient id="meniscusGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.95" />
    </linearGradient>
  </defs>
  
  <!-- Apparatus Components with Clean Z-Ordering -->
  <g id="retort-stand" class="apparatus-base"></g>
  <g id="burette-tube" class="apparatus-glassware"></g>
  <g id="burette-liquid" class="apparatus-fluid"></g>
  <g id="stopcock-lever" class="apparatus-control interactive"></g>
  <g id="conical-flask" class="apparatus-receiver"></g>
</svg>
```

### CSS Hardware Acceleration
```css
.simulation-rig-svg {
  width: 100%;
  max-height: 70vh;
  touch-action: none; /* Prevents browser scroll interference during manipulation */
  user-select: none;
  -webkit-user-select: none;
}

.apparatus-control.interactive {
  cursor: grab;
  transform-origin: center;
  transition: transform 0.05s ease-out;
}

.apparatus-control.interactive:active {
  cursor: grabbing;
}
```

---

## 2. Touch & Pointer Event Normalization

Never bind separate `touchstart`, `touchmove`, `mousedown`, and `mousemove` listeners. Standardize strictly on Pointer Events:
```javascript
class SimulationController {
  constructor(controlElement, onValueChange) {
    this.el = controlElement;
    this.onChange = onValueChange;
    this.isDragging = false;
    this.startY = 0;
    this.currentValue = 0;

    this.bindEvents();
  }

  bindEvents() {
    this.el.addEventListener('pointerdown', this.onDown.bind(this));
    window.addEventListener('pointermove', this.onMove.bind(this));
    window.addEventListener('pointerup', this.onUp.bind(this));
    window.addEventListener('pointercancel', this.onUp.bind(this));
  }

  onDown(e) {
    this.isDragging = true;
    this.startY = e.clientY;
    this.el.setPointerCapture(e.pointerId); // Retains track even if pointer leaves element
  }

  onMove(e) {
    if (!this.isDragging) return;
    const deltaY = this.startY - e.clientY;
    this.onChange(deltaY);
  }

  onUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    try {
      this.el.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }
}
```

---

## 3. High-Performance Canvas Rendering Loop

When rendering particle effects, flame tests, or liquid turbulence:
```javascript
class CanvasParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.lastTime = performance.now();
    this.animationFrameId = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  start() {
    const loop = (timestamp) => {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // Clamp to prevent jump on tab switch
      this.lastTime = timestamp;

      this.update(dt);
      this.draw();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const p of this.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
```
