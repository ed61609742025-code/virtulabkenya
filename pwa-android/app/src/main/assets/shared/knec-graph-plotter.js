/**
 * VirtuLab Kenya — Interactive KNEC Graph Plotting Engine
 * High-precision canvas-based graph plotting component designed for KCSE Paper 3 practical exams
 * (Solubility Curves, Reaction Kinetics / Rates, Thermochemistry Cooling Curves).
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KNECGraphPlotter = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  class KNECGraphPlotter {
    constructor(options = {}) {
      this.container = typeof options.container === 'string'
        ? document.getElementById(options.container)
        : options.container;

      this.title = options.title || 'Graph Sheet (KNEC 233/3 Standard)';
      this.xLabel = options.xLabel || 'Temperature (°C)';
      this.yLabel = options.yLabel || 'Solubility (g/100g H₂O)';
      this.xUnit = options.xUnit || '°C';
      this.yUnit = options.yUnit || 'g/100g';

      this.xMin = Number(options.xMin) || 0;
      this.xMax = Number(options.xMax) || 100;
      this.xStep = Number(options.xStep) || 20;

      this.yMin = Number(options.yMin) || 0;
      this.yMax = Number(options.yMax) || 160;
      this.yStep = Number(options.yStep) || 20;

      this.points = Array.isArray(options.initialPoints) ? [...options.initialPoints] : [];
      this.mode = options.defaultMode || 'curve'; // 'curve', 'line', 'points_only', 'tangent'
      this.markerType = options.markerType || 'cross'; // 'cross' (x) or 'circle_dot' (⊙)
      this.tangentPointIndex = null;
      this.onChange = typeof options.onChange === 'function' ? options.onChange : null;

      // Internal Canvas State
      this.canvas = null;
      this.ctx = null;
      this.hoverCoord = null;
      this.pad = { left: 70, right: 30, top: 35, bottom: 55 };

      if (this.container) {
        this.mount();
      }
    }

    mount() {
      this.container.innerHTML = `
        <div class="knec-graph-widget">
          <div class="knec-graph-header">
            <div class="knec-graph-title-group">
              <span class="knec-graph-icon">📈</span>
              <div>
                <h4 class="knec-graph-title">${this.escape(this.title)}</h4>
                <div class="knec-graph-sublabel">Plot: <b>${this.escape(this.yLabel)}</b> (y-axis) vs <b>${this.escape(this.xLabel)}</b> (x-axis)</div>
              </div>
            </div>
            <div class="knec-graph-tools-bar">
              <button type="button" class="kg-btn ${this.mode === 'curve' ? 'active' : ''}" data-action="setMode" data-val="curve" title="Draw smooth curve of best fit">
                〰️ Smooth Curve
              </button>
              <button type="button" class="kg-btn ${this.mode === 'line' ? 'active' : ''}" data-action="setMode" data-val="line" title="Draw straight line of best fit">
                📏 Best-Fit Line
              </button>
              <button type="button" class="kg-btn ${this.mode === 'tangent' ? 'active' : ''}" data-action="setMode" data-val="tangent" title="Compute gradient / rate via tangent">
                📐 Tangent &amp; Slope
              </button>
              <button type="button" class="kg-btn" data-action="undo" title="Remove last point">
                ↺ Undo
              </button>
              <button type="button" class="kg-btn kg-btn-danger" data-action="clear" title="Clear all points">
                🗑️ Clear
              </button>
            </div>
          </div>

          <!-- Canvas Display Frame -->
          <div class="knec-graph-canvas-frame" style="position:relative; width:100%; height:440px; background:#0F172A; border-radius:8px; overflow:hidden; border:1.5px solid var(--card-border, #334155);">
            <canvas class="knec-graph-canvas" style="display:block; width:100%; height:100%; cursor:crosshair;"></canvas>
            <div class="knec-graph-readout-pill" style="display:none; position:absolute; top:12px; right:12px; background:rgba(15,23,42,0.85); border:1px solid rgba(6,182,212,0.4); border-radius:6px; padding:4px 10px; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#38BDF8; pointer-events:none;">
              X: <span class="kg-x-readout">0.0</span> | Y: <span class="kg-y-readout">0.0</span>
            </div>
          </div>

          <!-- Point Entry & Statistics Row -->
          <div class="knec-graph-footer">
            <form class="knec-graph-entry-form" onsubmit="return false;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted, #94A3B8);">Add Point:</span>
              <label class="kg-input-wrap">
                <span>X (${this.escape(this.xUnit)}):</span>
                <input type="number" class="kg-coord-input kg-input-x" step="0.1" min="${this.xMin}" max="${this.xMax}" placeholder="${(this.xMin + this.xStep).toFixed(1)}">
              </label>
              <label class="kg-input-wrap">
                <span>Y (${this.escape(this.yUnit)}):</span>
                <input type="number" class="kg-coord-input kg-input-y" step="0.1" min="${this.yMin}" max="${this.yMax}" placeholder="${(this.yMin + this.yStep).toFixed(1)}">
              </label>
              <button type="button" class="kg-btn kg-btn-primary" data-action="addPoint">＋ Plot Point</button>
            </form>

            <div class="knec-graph-stats">
              <span class="kg-pill">📍 Points: <b class="kg-points-count">0</b></span>
              <span class="kg-pill kg-slope-pill" style="display:none;">📐 Gradient: <b class="kg-slope-val">0.00</b></span>
            </div>
          </div>
        </div>
      `;

      this.canvas = this.container.querySelector('.knec-graph-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.readoutPill = this.container.querySelector('.knec-graph-readout-pill');
      this.xReadout = this.container.querySelector('.kg-x-readout');
      this.yReadout = this.container.querySelector('.kg-y-readout');
      this.pointsCountEl = this.container.querySelector('.kg-points-count');
      this.slopePill = this.container.querySelector('.kg-slope-pill');
      this.slopeValEl = this.container.querySelector('.kg-slope-val');
      this.inputX = this.container.querySelector('.kg-input-x');
      this.inputY = this.container.querySelector('.kg-input-y');

      this.bindEvents();
      this.resize();
      this.render();
    }

    bindEvents() {
      // Toolbar action buttons
      this.container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const act = btn.getAttribute('data-action');
          const val = btn.getAttribute('data-val');
          if (act === 'setMode') this.setMode(val);
          if (act === 'undo') this.undoPoint();
          if (act === 'clear') this.clearPoints();
          if (act === 'addPoint') this.submitInputPoint();
        });
      });

      // Canvas click to plot
      this.canvas.addEventListener('click', (e) => {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          this.addPoint(coords.x, coords.y);
        }
      });

      // Canvas hover crosshairs
      this.canvas.addEventListener('mousemove', (e) => {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          this.hoverCoord = coords;
          if (this.readoutPill) {
            this.readoutPill.style.display = 'block';
            this.xReadout.textContent = coords.x.toFixed(1);
            this.yReadout.textContent = coords.y.toFixed(1);
          }
          this.render();
        }
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.hoverCoord = null;
        if (this.readoutPill) this.readoutPill.style.display = 'none';
        this.render();
      });

      // Window resize
      window.addEventListener('resize', () => {
        this.resize();
        this.render();
      });
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
      this.cssWidth = rect.width;
      this.cssHeight = rect.height;
    }

    getCanvasCoords(e) {
      if (!this.canvas) return null;
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const gw = this.cssWidth - this.pad.left - this.pad.right;
      const gh = this.cssHeight - this.pad.top - this.pad.bottom;

      if (px < this.pad.left || px > this.pad.left + gw || py < this.pad.top || py > this.pad.top + gh) {
        return null;
      }

      const x = this.xMin + ((px - this.pad.left) / gw) * (this.xMax - this.xMin);
      const y = this.yMin + ((this.pad.top + gh - py) / gh) * (this.yMax - this.yMin);

      return {
        x: parseFloat(Math.max(this.xMin, Math.min(this.xMax, x)).toFixed(1)),
        y: parseFloat(Math.max(this.yMin, Math.min(this.yMax, y)).toFixed(1)),
        px,
        py
      };
    }

    dataToPixel(x, y) {
      const gw = this.cssWidth - this.pad.left - this.pad.right;
      const gh = this.cssHeight - this.pad.top - this.pad.bottom;

      const px = this.pad.left + ((x - this.xMin) / (this.xMax - this.xMin)) * gw;
      const py = this.pad.top + gh - ((y - this.yMin) / (this.yMax - this.yMin)) * gh;

      return { px, py };
    }

    addPoint(x, y) {
      this.points.push({ x: Number(x), y: Number(y) });
      this.points.sort((a, b) => a.x - b.x);
      this.updateUI();
      this.render();
      if (this.onChange) this.onChange(this.points, this.toDataURL());
    }

    undoPoint() {
      if (this.points.length > 0) {
        this.points.pop();
        this.updateUI();
        this.render();
        if (this.onChange) this.onChange(this.points, this.toDataURL());
      }
    }

    clearPoints(force = false) {
      const shouldClear = force || (typeof window !== 'undefined' && typeof window.confirm === 'function' ? window.confirm('Clear all plotted points from the graph?') : true);
      if (shouldClear) {
        this.points = [];
        this.updateUI();
        this.render();
        if (this.onChange) this.onChange(this.points, this.toDataURL());
      }
    }

    setMode(mode) {
      this.mode = mode;
      this.container.querySelectorAll('[data-action="setMode"]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-val') === mode);
      });
      this.render();
    }

    submitInputPoint() {
      const vx = parseFloat(this.inputX.value);
      const vy = parseFloat(this.inputY.value);
      if (isNaN(vx) || isNaN(vy)) {
        alert('Please enter valid numeric coordinates for X and Y.');
        return;
      }
      this.addPoint(vx, vy);
      this.inputX.value = '';
      this.inputY.value = '';
      this.inputX.focus();
    }

    updateUI() {
      if (this.pointsCountEl) this.pointsCountEl.textContent = this.points.length;
      if (this.mode === 'tangent' && this.points.length >= 2) {
        const slope = this.calculateBestFitSlope();
        if (this.slopePill && this.slopeValEl) {
          this.slopePill.style.display = 'inline-flex';
          this.slopeValEl.textContent = `${slope.m.toFixed(3)} ${this.yUnit}/${this.xUnit}`;
        }
      } else if (this.slopePill) {
        this.slopePill.style.display = 'none';
      }
    }

    render() {
      if (!this.ctx || !this.cssWidth || !this.cssHeight) return;
      const ctx = this.ctx;
      const w = this.cssWidth;
      const h = this.cssHeight;

      ctx.clearRect(0, 0, w, h);

      const gw = w - this.pad.left - this.pad.right;
      const gh = h - this.pad.top - this.pad.bottom;

      // ── 1. KNEC Authentic Millimeter Graph Grid ──────────────────────
      // Minor 1mm subdivisions (cyan/slate subtle mesh)
      const minorXCount = (this.xMax - this.xMin) / (this.xStep / 10);
      const minorYCount = (this.yMax - this.yMin) / (this.yStep / 10);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i <= minorXCount; i++) {
        const x = this.pad.left + (i / minorXCount) * gw;
        ctx.beginPath();
        ctx.moveTo(x, this.pad.top);
        ctx.lineTo(x, this.pad.top + gh);
        ctx.stroke();
      }
      for (let j = 0; j <= minorYCount; j++) {
        const y = this.pad.top + (j / minorYCount) * gh;
        ctx.beginPath();
        ctx.moveTo(this.pad.left, y);
        ctx.lineTo(this.pad.left + gw, y);
        ctx.stroke();
      }

      // Medium 5mm subdivisions
      const medXCount = (this.xMax - this.xMin) / (this.xStep / 2);
      const medYCount = (this.yMax - this.yMin) / (this.yStep / 2);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.16)';
      ctx.lineWidth = 0.9;
      for (let i = 0; i <= medXCount; i++) {
        const x = this.pad.left + (i / medXCount) * gw;
        ctx.beginPath();
        ctx.moveTo(x, this.pad.top);
        ctx.lineTo(x, this.pad.top + gh);
        ctx.stroke();
      }
      for (let j = 0; j <= medYCount; j++) {
        const y = this.pad.top + (j / medYCount) * gh;
        ctx.beginPath();
        ctx.moveTo(this.pad.left, y);
        ctx.lineTo(this.pad.left + gw, y);
        ctx.stroke();
      }

      // Major Grid Lines (every xStep / yStep)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1.3;
      for (let vx = this.xMin; vx <= this.xMax + 0.001; vx += this.xStep) {
        const { px } = this.dataToPixel(vx, this.yMin);
        ctx.beginPath();
        ctx.moveTo(px, this.pad.top);
        ctx.lineTo(px, this.pad.top + gh);
        ctx.stroke();
      }
      for (let vy = this.yMin; vy <= this.yMax + 0.001; vy += this.yStep) {
        const { py } = this.dataToPixel(this.xMin, vy);
        ctx.beginPath();
        ctx.moveTo(this.pad.left, py);
        ctx.lineTo(this.pad.left + gw, py);
        ctx.stroke();
      }

      // ── 2. Primary Axes ──────────────────────────────────────────────
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(this.pad.left, this.pad.top);
      ctx.lineTo(this.pad.left, this.pad.top + gh);
      ctx.lineTo(this.pad.left + gw, this.pad.top + gh);
      ctx.stroke();

      // Axis Arrowheads
      this.drawArrow(ctx, this.pad.left + gw, this.pad.top + gh, 'right');
      this.drawArrow(ctx, this.pad.left, this.pad.top, 'up');

      // ── 3. Axis Labels and Number Ticks ──────────────────────────────
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      for (let vx = this.xMin; vx <= this.xMax + 0.001; vx += this.xStep) {
        const { px, py } = this.dataToPixel(vx, this.yMin);
        ctx.fillText(vx.toString(), px, py + 6);
      }

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let vy = this.yMin; vy <= this.yMax + 0.001; vy += this.yStep) {
        const { py } = this.dataToPixel(this.xMin, vy);
        ctx.fillText(vy.toString(), px - 8, py);
      }

      // Axis Titles
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.xLabel}`, this.pad.left + gw / 2, this.pad.top + gh + 32);

      ctx.save();
      ctx.translate(18, this.pad.top + gh / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${this.yLabel}`, 0, 0);
      ctx.restore();

      // ── 4. Monotone Spline Curve / Linear Regression ─────────────────
      if (this.points.length >= 2) {
        if (this.mode === 'curve') {
          this.drawSmoothCurve(ctx);
        } else if (this.mode === 'line') {
          this.drawBestFitLine(ctx);
        } else if (this.mode === 'tangent') {
          this.drawSmoothCurve(ctx);
          this.drawTangentSlope(ctx);
        }
      }

      // ── 5. Plotted Points (Authentic KNEC Markers) ───────────────────
      this.points.forEach((pt, idx) => {
        const { px, py } = this.dataToPixel(pt.x, pt.y);
        this.drawMarker(ctx, px, py, this.markerType, '#F59E0B');
      });

      // ── 6. Hover Crosshair & Coordinate Indicator ────────────────────
      if (this.hoverCoord) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(this.hoverCoord.px, this.pad.top);
        ctx.lineTo(this.hoverCoord.px, this.pad.top + gh);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.pad.left, this.hoverCoord.py);
        ctx.lineTo(this.pad.left + gw, this.hoverCoord.py);
        ctx.stroke();

        ctx.setLineDash([]);
      }
    }

    drawMarker(ctx, px, py, type, color = '#F59E0B') {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.0;

      if (type === 'cross') {
        const r = 5.5;
        ctx.beginPath();
        ctx.moveTo(px - r, py - r);
        ctx.lineTo(px + r, py + r);
        ctx.moveTo(px + r, py - r);
        ctx.lineTo(px - r, py + r);
        ctx.stroke();
      } else {
        // Circled dot (⊙)
        ctx.beginPath();
        ctx.arc(px, py, 5.0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawArrow(ctx, x, y, dir) {
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      if (dir === 'right') {
        ctx.moveTo(x + 8, y);
        ctx.lineTo(x, y - 4);
        ctx.lineTo(x, y + 4);
      } else if (dir === 'up') {
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x - 4, y);
        ctx.lineTo(x + 4, y);
      }
      ctx.fill();
    }

    drawSmoothCurve(ctx) {
      const n = this.points.length;
      if (n < 2) return;

      const pts = this.points.map(p => this.dataToPixel(p.x, p.y));

      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0].px, pts[0].py);

      if (n === 2) {
        ctx.lineTo(pts[1].px, pts[1].py);
      } else {
        // Catmull-Rom to Cubic Bezier conversion for natural smooth curvature
        for (let i = 0; i < n - 1; i++) {
          const p0 = i > 0 ? pts[i - 1] : pts[i];
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const p3 = i != n - 2 ? pts[i + 2] : p2;

          const cp1x = p1.px + (p2.px - p0.px) / 6;
          const cp1y = p1.py + (p2.py - p0.py) / 6;

          const cp2x = p2.px - (p3.px - p1.px) / 6;
          const cp2y = p2.py - (p3.py - p1.py) / 6;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.px, p2.py);
        }
      }
      ctx.stroke();
    }

    drawBestFitLine(ctx) {
      const { m, c } = this.calculateBestFitSlope();
      const p1 = this.dataToPixel(this.xMin, m * this.xMin + c);
      const p2 = this.dataToPixel(this.xMax, m * this.xMax + c);

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    }

    calculateBestFitSlope() {
      const n = this.points.length;
      if (n < 2) return { m: 0, c: 0 };

      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for (const p of this.points) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumXX += p.x * p.x;
      }
      const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
      const c = (sumY - m * sumX) / n;
      return { m, c };
    }

    drawTangentSlope(ctx) {
      if (this.points.length < 2) return;
      const midIdx = Math.floor(this.points.length / 2);
      const midPt = this.points[midIdx];

      const { m } = this.calculateBestFitSlope();
      const dx = (this.xMax - this.xMin) * 0.25;
      const x1 = Math.max(this.xMin, midPt.x - dx);
      const x2 = Math.min(this.xMax, midPt.x + dx);
      const y1 = midPt.y - m * (midPt.x - x1);
      const y2 = midPt.y + m * (x2 - midPt.x);

      const pMid = this.dataToPixel(midPt.x, midPt.y);
      const p1 = this.dataToPixel(x1, y1);
      const p2 = this.dataToPixel(x2, y2);
      const pCorner = this.dataToPixel(x2, y1);

      // Tangent Line
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 2.0;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
      ctx.setLineDash([]);

      // KNEC Slope Triangle: Δy / Δx
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.2;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(pCorner.px, pCorner.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Delta labels
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`Δx = ${(x2 - x1).toFixed(1)}`, (p1.px + pCorner.px) / 2, pCorner.py + 12);
      ctx.fillText(`Δy = ${(y2 - y1).toFixed(1)}`, pCorner.px + 14, (pCorner.py + p2.py) / 2);
    }

    toDataURL() {
      return this.canvas ? this.canvas.toDataURL('image/png') : '';
    }

    escape(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  return KNECGraphPlotter;
}));
