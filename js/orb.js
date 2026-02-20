/**
 * Fae Orb — Website Hero Animation
 * Adapted from Fae's native macOS orb animation engine.
 *
 * Renders a living, breathing orb using simplex noise, layered blobs,
 * a particle system, and the Scottish-themed colour palette.
 */

/* ── Simplex Noise (fast 2D/3D) ─────────────────────────────────── */
const SimplexNoise = (() => {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];

  class SimplexNoise {
    constructor(seed = Math.random()) {
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);
      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) p[i] = i;
      let s = seed * 2147483647;
      for (let i = 255; i > 0; i--) {
        s = (s * 16807) % 2147483647;
        const j = s % (i + 1);
        [p[i], p[j]] = [p[j], p[i]];
      }
      for (let i = 0; i < 512; i++) {
        this.perm[i] = p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }

    noise2D(x, y) {
      const s = (x + y) * F2;
      const i = Math.floor(x + s), j = Math.floor(y + s);
      const t = (i + j) * G2;
      const x0 = x - (i - t), y0 = y - (j - t);
      const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;

      const dot = (gi, dx, dy) => grad3[gi][0] * dx + grad3[gi][1] * dy;

      let n0 = 0, n1 = 0, n2 = 0;
      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot(this.permMod12[ii + this.perm[jj]], x0, y0); }
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot(this.permMod12[ii + i1 + this.perm[jj + j1]], x1, y1); }
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot(this.permMod12[ii + 1 + this.perm[jj + 1]], x2, y2); }

      return 70 * (n0 + n1 + n2);
    }
  }

  return SimplexNoise;
})();

/* ── Colour Helpers ──────────────────────────────────────────────── */
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function rgbaStr(rgb, a) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

/* ── Scottish Palette ────────────────────────────────────────────── */
const PALETTE = {
  heatherMist:   hexToRgb('#B4A8C4'),
  glenGreen:     hexToRgb('#5F7F6F'),
  lochGreyGreen: hexToRgb('#7A9B8E'),
  autumnBracken: hexToRgb('#A67B5B'),
  silverMist:    hexToRgb('#C8D3D5'),
  rowanBerry:    hexToRgb('#8B4653'),
  mossStone:     hexToRgb('#4A5D52'),
  dawnLight:     hexToRgb('#E8DED2'),
  peatEarth:     hexToRgb('#3D3630'),
  warmGold:      hexToRgb('#D4A574'),
  warmRose:      hexToRgb('#C4917A'),
};

/* ── Feelings (ambient mood states) ──────────────────────────────── */
const FEELINGS = {
  neutral:   { colors: ['heatherMist', 'silverMist', 'glenGreen'],     speed: 1.0, amplitude: 1.0 },
  calm:      { colors: ['lochGreyGreen', 'silverMist', 'mossStone'],   speed: 0.6, amplitude: 0.7 },
  curiosity: { colors: ['dawnLight', 'heatherMist', 'autumnBracken'],  speed: 1.3, amplitude: 1.2 },
  warmth:    { colors: ['warmGold', 'warmRose', 'autumnBracken'],      speed: 0.9, amplitude: 1.0 },
  delight:   { colors: ['dawnLight', 'warmGold', 'heatherMist'],       speed: 1.5, amplitude: 1.4 },
  focus:     { colors: ['mossStone', 'glenGreen', 'lochGreyGreen'],    speed: 0.8, amplitude: 0.6 },
};

/* ── Orb Animation ───────────────────────────────────────────────── */
class FaeOrb {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.noise = new SimplexNoise(42);
    this.time = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.feeling = 'warmth'; // default feeling for website
    this.feelingTransition = 0;
    this.targetFeeling = 'warmth';
    this.prevFeeling = 'warmth';
    this.particles = [];
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.breathPhase = 0;

    // Auto-cycle feelings for the website
    this.feelingCycle = ['warmth', 'calm', 'curiosity', 'delight', 'neutral', 'focus'];
    this.feelingIndex = 0;
    this.feelingTimer = 0;
    this.feelingInterval = 8000; // ms between feeling changes

    this._initParticles();
    this._resize();
    this._bindEvents();
    this._loop();
  }

  _initParticles() {
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 0.35 + Math.random() * 0.25,
        speed: 0.0003 + Math.random() * 0.0005,
        size: 1 + Math.random() * 2.5,
        alpha: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  _resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height, 520);
    this.canvas.width = size * this.dpr;
    this.canvas.height = size * this.dpr;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.size = size;
    this.cx = size / 2;
    this.cy = size / 2;
    this.orbRadius = size * 0.3;
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._resize());

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width;
      this.mouseY = (e.clientY - rect.top) / rect.height;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = 0.5;
      this.mouseY = 0.5;
    });
  }

  _getColors() {
    const current = FEELINGS[this.feeling];
    const target = FEELINGS[this.targetFeeling];
    const t = this.feelingTransition;

    return current.colors.map((cName, i) => {
      const cColor = PALETTE[cName];
      const tColor = PALETTE[target.colors[i]] || cColor;
      return lerpColor(cColor, tColor, t);
    });
  }

  _getSpeed() {
    const c = FEELINGS[this.feeling].speed;
    const t = FEELINGS[this.targetFeeling].speed;
    return c + (t - c) * this.feelingTransition;
  }

  _getAmplitude() {
    const c = FEELINGS[this.feeling].amplitude;
    const t = FEELINGS[this.targetFeeling].amplitude;
    return c + (t - c) * this.feelingTransition;
  }

  _drawOrb(dt) {
    const ctx = this.ctx;
    const colors = this._getColors();
    const speed = this._getSpeed();
    const amp = this._getAmplitude();

    // Breathing
    this.breathPhase += dt * 0.001 * speed;
    const breathScale = 1 + Math.sin(this.breathPhase) * 0.02 * amp;

    // Mouse influence
    const mx = (this.mouseX - 0.5) * 10;
    const my = (this.mouseY - 0.5) * 10;

    // Draw layered blobs
    const layers = 12;
    for (let l = 0; l < layers; l++) {
      const layerT = l / layers;
      const layerRadius = this.orbRadius * (0.4 + layerT * 0.6) * breathScale;
      const noiseScale = 0.8 + layerT * 0.5;
      const noiseAmp = (8 + layerT * 18) * amp;
      const alpha = (0.06 + (1 - layerT) * 0.12);
      const colorIdx = Math.floor(layerT * colors.length) % colors.length;
      const nextIdx = (colorIdx + 1) % colors.length;
      const colorT = (layerT * colors.length) % 1;
      const color = lerpColor(colors[colorIdx], colors[nextIdx], colorT);

      ctx.beginPath();
      const steps = 80;
      for (let s = 0; s <= steps; s++) {
        const angle = (s / steps) * Math.PI * 2;
        const nx = Math.cos(angle) * noiseScale + this.time * 0.3 * speed + l * 0.5;
        const ny = Math.sin(angle) * noiseScale + this.time * 0.2 * speed + l * 0.3;
        const n = this.noise.noise2D(nx, ny);
        const r = layerRadius + n * noiseAmp + mx * Math.cos(angle) + my * Math.sin(angle);
        const x = this.cx + Math.cos(angle) * r;
        const y = this.cy + Math.sin(angle) * r;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(
        this.cx + mx * 2, this.cy + my * 2, layerRadius * 0.1,
        this.cx, this.cy, layerRadius * 1.2
      );
      grad.addColorStop(0, rgbaStr(color, alpha * 1.5));
      grad.addColorStop(0.6, rgbaStr(color, alpha));
      grad.addColorStop(1, rgbaStr(color, 0));
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Core glow
    const coreGrad = ctx.createRadialGradient(
      this.cx + mx, this.cy + my, 0,
      this.cx, this.cy, this.orbRadius * 0.5
    );
    const coreColor = lerpColor(colors[0], [255, 255, 255], 0.3);
    coreGrad.addColorStop(0, rgbaStr(coreColor, 0.25 * amp));
    coreGrad.addColorStop(0.4, rgbaStr(colors[0], 0.08));
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(this.cx + mx, this.cy + my, this.orbRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawParticles(dt) {
    const ctx = this.ctx;
    const colors = this._getColors();
    const speed = this._getSpeed();

    for (const p of this.particles) {
      p.angle += p.speed * dt * speed;
      p.phase += dt * 0.001;
      const drift = Math.sin(p.phase) * 0.05;
      const r = (p.radius + drift) * this.size * 0.5;
      const x = this.cx + Math.cos(p.angle) * r;
      const y = this.cy + Math.sin(p.angle) * r;
      const alpha = p.alpha * (0.6 + Math.sin(p.phase * 2) * 0.4);

      const colorIdx = Math.floor(p.angle * colors.length / (Math.PI * 2)) % colors.length;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = rgbaStr(colors[colorIdx], alpha);
      ctx.fill();
    }
  }

  _drawAmbientRings() {
    const ctx = this.ctx;
    const colors = this._getColors();

    for (let i = 0; i < 3; i++) {
      const phase = this.time * 0.15 + i * 2.1;
      const r = this.orbRadius * (1.2 + i * 0.15 + Math.sin(phase) * 0.05);
      const alpha = 0.03 + Math.sin(phase + 1) * 0.015;

      ctx.beginPath();
      ctx.arc(this.cx, this.cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = rgbaStr(colors[i % colors.length], alpha);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  _updateFeelingCycle(dt) {
    this.feelingTimer += dt;
    if (this.feelingTimer >= this.feelingInterval) {
      this.feelingTimer = 0;
      this.feelingIndex = (this.feelingIndex + 1) % this.feelingCycle.length;
      this.prevFeeling = this.feeling;
      this.targetFeeling = this.feelingCycle[this.feelingIndex];
      this.feelingTransition = 0;
    }

    if (this.feeling !== this.targetFeeling) {
      this.feelingTransition += dt * 0.0005;
      if (this.feelingTransition >= 1) {
        this.feelingTransition = 0;
        this.feeling = this.targetFeeling;
      }
    }
  }

  _loop(now) {
    if (!this._lastFrame) this._lastFrame = now || 0;
    const dt = Math.min((now || 0) - this._lastFrame, 50);
    this._lastFrame = now || 0;

    this.time += dt * 0.001;
    this._updateFeelingCycle(dt);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.size, this.size);

    // Outer glow
    const outerGlow = ctx.createRadialGradient(
      this.cx, this.cy, this.orbRadius * 0.5,
      this.cx, this.cy, this.orbRadius * 2
    );
    const colors = this._getColors();
    outerGlow.addColorStop(0, rgbaStr(colors[0], 0.06));
    outerGlow.addColorStop(0.5, rgbaStr(colors[1], 0.02));
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, this.size, this.size);

    this._drawAmbientRings();
    this._drawOrb(dt);
    this._drawParticles(dt);

    requestAnimationFrame((t) => this._loop(t));
  }
}

/* ── Export / Init ────────────────────────────────────────────────── */
window.FaeOrb = FaeOrb;
