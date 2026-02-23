/* ── Simplex Noise ─────────────────────────────────────────────── */
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
      let t0 = 0.5 - x0*x0 - y0*y0;
      if (t0 >= 0) { t0 *= t0; n0 = t0*t0*dot(this.permMod12[ii+this.perm[jj]], x0, y0); }
      let t1 = 0.5 - x1*x1 - y1*y1;
      if (t1 >= 0) { t1 *= t1; n1 = t1*t1*dot(this.permMod12[ii+i1+this.perm[jj+j1]], x1, y1); }
      let t2 = 0.5 - x2*x2 - y2*y2;
      if (t2 >= 0) { t2 *= t2; n2 = t2*t2*dot(this.permMod12[ii+1+this.perm[jj+1]], x2, y2); }
      return 70 * (n0 + n1 + n2);
    }
  }
  return SimplexNoise;
})();

/* ── Colour Helpers ────────────────────────────────────────────── */
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

/* ── Palette ─────────────────────────────────────────────────────  */
const PALETTE = {
  // Warm ambers (home base)
  hotAmber:    hexToRgb('#F0A830'),
  brightHoney: hexToRgb('#E8B840'),
  goldenCore:  hexToRgb('#FFD068'),
  richAmber:   hexToRgb('#C47A20'),
  deepHoney:   hexToRgb('#B06818'),
  burntGold:   hexToRgb('#D49138'),
  darkAmber:   hexToRgb('#7A4010'),
  deepResin:   hexToRgb('#5C2E08'),
  shadowAmber: hexToRgb('#3A1A04'),
  // Curious — lighter, warmer gold
  paleGold:    hexToRgb('#F5C84C'),
  sunGlow:     hexToRgb('#FADA70'),
  softGold:    hexToRgb('#D4A520'),
  // Focused — deeper, tighter copper
  deepCopper:  hexToRgb('#B8621A'),
  darkCopper:  hexToRgb('#8B4513'),
  bronzeCore:  hexToRgb('#A0522D'),
  // Joyful — bright warm peach/apricot
  peachGlow:   hexToRgb('#FFB366'),
  apricot:     hexToRgb('#FF9944'),
  warmCoral:   hexToRgb('#E87830'),
  // Concerned — muted, cooler amber
  dustyAmber:  hexToRgb('#B89060'),
  mutedGold:   hexToRgb('#A08050'),
  fadedResin:  hexToRgb('#6B5030'),
  // Excited — vivid bright flame
  flameOrange: hexToRgb('#FF8C1A'),
  brightFlame: hexToRgb('#FFB030'),
  deepFlame:   hexToRgb('#CC6600'),
};

/* ── Moods — each has colours, speed, amplitude and a size scale ─ */
const MOODS = {
  calm:     { colors: ['hotAmber',    'richAmber',   'darkAmber'],    speed: 0.5, amplitude: 1.3, size: 1.0   },
  curious:  { colors: ['paleGold',    'softGold',    'deepHoney'],    speed: 0.8, amplitude: 1.5, size: 1.08  },
  focused:  { colors: ['deepCopper',  'darkCopper',  'bronzeCore'],   speed: 1.2, amplitude: 1.1, size: 0.88  },
  joyful:   { colors: ['peachGlow',   'apricot',     'warmCoral'],    speed: 1.0, amplitude: 1.6, size: 1.12  },
  concerned:{ colors: ['dustyAmber',  'mutedGold',   'fadedResin'],   speed: 0.4, amplitude: 1.0, size: 0.92  },
  excited:  { colors: ['flameOrange', 'brightFlame', 'deepFlame'],    speed: 1.8, amplitude: 2.2, size: 1.18  },
  working:  { colors: ['hotAmber',    'burntGold',   'shadowAmber'],  speed: 2.0, amplitude: 2.4, size: 1.0   },
};

/* ── Orb Animation ─────────────────────────────────────────────── */
class FaeOrb {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.noise = new SimplexNoise(42);
    this.time = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Current interpolated values
    this.currentColors = MOODS.calm.colors.map(c => PALETTE[c]);
    this.currentSpeed = MOODS.calm.speed;
    this.currentAmp = MOODS.calm.amplitude;
    this.currentSize = MOODS.calm.size;

    // Transition
    this.mood = 'calm';
    this.targetMood = 'calm';
    this.prevMood = 'calm';
    this.moodTransition = 0;

    // Demo cycle through all moods
    this.moodCycle = ['calm', 'curious', 'focused', 'joyful', 'concerned', 'excited', 'working', 'calm'];
    this.moodIndex = 0;
    this.moodTimer = 0;
    this.moodInterval = 6000;

    this.particles = [];
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.breathPhase = 0;
    this.flares = [];
    this.flareTimer = 0;

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
        speed: 0.00006 + Math.random() * 0.00012,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.45,
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
    this.baseOrbRadius = size * 0.3;
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

  _lerpMoodValue(prop) {
    const c = MOODS[this.mood][prop];
    const t = MOODS[this.targetMood][prop];
    return c + (t - c) * this.moodTransition;
  }

  _getColors() {
    const current = MOODS[this.mood];
    const target = MOODS[this.targetMood];
    const t = this.moodTransition;
    return current.colors.map((cName, i) => {
      const cColor = PALETTE[cName];
      const tColor = PALETTE[target.colors[i]] || cColor;
      return lerpColor(cColor, tColor, t);
    });
  }

  _getSpeed()     { return this._lerpMoodValue('speed'); }
  _getAmplitude() { return this._lerpMoodValue('amplitude'); }
  _getSize()      { return this._lerpMoodValue('size'); }

  _drawOrb(dt) {
    const ctx = this.ctx;
    const colors = this._getColors();
    const speed = this._getSpeed();
    const amp = this._getAmplitude();
    const sizeScale = this._getSize();
    const orbRadius = this.baseOrbRadius * sizeScale;

    this.breathPhase += dt * 0.001 * speed * (0.8 + amp * 0.5);
    const breathDepth = 0.015 + amp * 0.02;
    const breathScale = 1 + Math.sin(this.breathPhase) * breathDepth;

    const mx = (this.mouseX - 0.5) * 10;
    const my = (this.mouseY - 0.5) * 10;

    const layers = 10;
    for (let l = 0; l < layers; l++) {
      const layerT = l / layers;
      const layerRadius = orbRadius * (0.15 + layerT * 0.85) * breathScale;
      const noiseScale = 1.0 + layerT * 0.7;
      const noiseAmp = (40 + layerT * 65) * amp;
      const alpha = 0.08 + layerT * 0.14;

      let color;
      if (layerT < 0.35) {
        color = lerpColor(colors[2], colors[1], layerT / 0.35);
      } else {
        color = lerpColor(colors[1], colors[0], (layerT - 0.35) / 0.65);
      }

      ctx.beginPath();
      const steps = 80;
      for (let s = 0; s <= steps; s++) {
        const angle = (s / steps) * Math.PI * 2;
        const n1 = this.noise.noise2D(
          Math.cos(angle) * noiseScale * 0.5 + this.time * 0.2 * speed + l * 0.7,
          Math.sin(angle) * noiseScale * 0.5 + this.time * 0.15 * speed + l * 0.5
        );
        const n2 = this.noise.noise2D(
          Math.cos(angle) * noiseScale * 2.2 + this.time * 0.35 * speed + l * 1.3 + 5.5,
          Math.sin(angle) * noiseScale * 2.2 + this.time * 0.25 * speed + l * 0.9 + 5.5
        );
        const n = n1 * 0.55 + n2 * 0.45;
        const r = layerRadius + n * noiseAmp + mx * Math.cos(angle) + my * Math.sin(angle);
        const x = this.cx + Math.cos(angle) * r;
        const y = this.cy + Math.sin(angle) * r;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(
        this.cx + mx * 2, this.cy + my * 2, layerRadius * 0.05,
        this.cx, this.cy, layerRadius * 1.1
      );
      grad.addColorStop(0, rgbaStr(color, alpha * 2.0));
      grad.addColorStop(0.3, rgbaStr(color, alpha * 1.2));
      grad.addColorStop(0.65, rgbaStr(color, alpha * 0.4));
      grad.addColorStop(1, rgbaStr(color, 0));
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Bright light point
    const bpAngle = this.time * 0.15 + Math.sin(this.time * 0.23) * 0.8;
    const bpR = orbRadius * (0.2 + Math.sin(this.time * 0.18) * 0.12);
    const bpX = this.cx + Math.cos(bpAngle) * bpR;
    const bpY = this.cy + Math.sin(bpAngle) * bpR;

    const bpWide = ctx.createRadialGradient(bpX, bpY, 0, bpX, bpY, orbRadius * 0.12);
    bpWide.addColorStop(0, 'rgba(255, 240, 200, 0.25)');
    bpWide.addColorStop(0.2, 'rgba(245, 220, 160, 0.12)');
    bpWide.addColorStop(0.5, 'rgba(230, 190, 120, 0.04)');
    bpWide.addColorStop(1, 'rgba(220, 170, 100, 0)');
    ctx.fillStyle = bpWide;
    ctx.beginPath();
    ctx.arc(bpX, bpY, orbRadius * 0.08, 0, Math.PI * 2);
    ctx.fill();

    const bpCore = ctx.createRadialGradient(bpX, bpY, 0, bpX, bpY, 1.5);
    bpCore.addColorStop(0, 'rgba(255,250,238,0.8)');
    bpCore.addColorStop(1, 'rgba(255,235,180,0)');
    ctx.fillStyle = bpCore;
    ctx.beginPath();
    ctx.arc(bpX, bpY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawParticles(dt) {
    const ctx = this.ctx;
    const colors = this._getColors();
    const speed = this._getSpeed();

    for (const p of this.particles) {
      p.angle += p.speed * dt * speed * speed;
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

  _updateFlares(dt) {
    const ctx = this.ctx;
    const colors = this._getColors();
    const speed = this._getSpeed();
    const sizeScale = this._getSize();
    const orbRadius = this.baseOrbRadius * sizeScale;

    this.flareTimer += dt;
    const spawnChance = speed > 1.0 ? 0.018 : 0.005;
    if (this.flareTimer > 300 && Math.random() < spawnChance) {
      this.flareTimer = 0;
      const baseAngle = Math.random() * Math.PI * 2;
      const reach = orbRadius * (0.3 + Math.random() * 0.55);
      const curve = (Math.random() - 0.5) * 0.3;
      const noiseSeed = Math.random() * 100;
      this.flares.push({
        angle: baseAngle, reach, curve,
        life: 1.0,
        decay: 0.15 + Math.random() * 0.2,
        baseWidth: 6 + Math.random() * 8,
        noiseSeed,
        colorIdx: Math.floor(Math.random() * colors.length),
      });
    }

    for (let i = this.flares.length - 1; i >= 0; i--) {
      const f = this.flares[i];
      f.life -= f.decay * dt * 0.001;
      if (f.life <= 0) { this.flares.splice(i, 1); continue; }

      const alpha = f.life * f.life * f.life;
      const color = colors[0];
      const flareColor = lerpColor(color, colors[1], 0.2);
      const startR = orbRadius * 0.1;
      const endR = startR + f.reach * f.life;
      const segments = 20;
      const perpDir = f.angle + Math.PI * 0.5;
      const leftPts = [], rightPts = [];

      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const dist = startR + (endR - startR) * t;
        const curveOff = Math.sin(t * Math.PI) * f.curve * f.reach * 0.1;
        const cx2 = this.cx + Math.cos(f.angle) * dist + Math.cos(perpDir) * curveOff;
        const cy2 = this.cy + Math.sin(f.angle) * dist + Math.sin(perpDir) * curveOff;
        const taper = (1 - t * t) * f.baseWidth * alpha;
        const wNoise = this.noise.noise2D(t * 3 + f.noiseSeed, this.time * 0.3) * taper * 0.4;
        const halfW = Math.max(0.5, (taper + wNoise) * 0.5);
        leftPts.push({ x: cx2 + Math.cos(perpDir) * halfW, y: cy2 + Math.sin(perpDir) * halfW });
        rightPts.push({ x: cx2 - Math.cos(perpDir) * halfW, y: cy2 - Math.sin(perpDir) * halfW });
      }

      ctx.beginPath();
      leftPts.forEach((p, idx) => idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      for (let s = rightPts.length - 1; s >= 0; s--) ctx.lineTo(rightPts[s].x, rightPts[s].y);
      ctx.closePath();
      ctx.fillStyle = rgbaStr(flareColor, alpha * 0.15);
      ctx.fill();

      ctx.beginPath();
      const coreShrink = 0.45;
      leftPts.forEach((p, idx) => {
        const r = rightPts[idx];
        const mx2 = (p.x + r.x) * 0.5, my2 = (p.y + r.y) * 0.5;
        const px = mx2 + (p.x - mx2) * coreShrink;
        const py = my2 + (p.y - my2) * coreShrink;
        idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      for (let s = rightPts.length - 1; s >= 0; s--) {
        const p = leftPts[s], r = rightPts[s];
        const mx2 = (p.x + r.x) * 0.5, my2 = (p.y + r.y) * 0.5;
        ctx.lineTo(mx2 + (r.x - mx2) * coreShrink, my2 + (r.y - my2) * coreShrink);
      }
      ctx.closePath();
      ctx.fillStyle = rgbaStr(flareColor, alpha * 0.3);
      ctx.fill();
    }
  }

  _updateMoodCycle(dt) {
    this.moodTimer += dt;
    if (this.moodTimer >= this.moodInterval) {
      this.moodTimer = 0;
      this.moodIndex = (this.moodIndex + 1) % this.moodCycle.length;
      this.prevMood = this.mood;
      this.targetMood = this.moodCycle[this.moodIndex];
      this.moodTransition = 0;
    }
    if (this.mood !== this.targetMood) {
      this.moodTransition += dt * 0.002;
      if (this.moodTransition >= 1) {
        this.moodTransition = 0;
        this.mood = this.targetMood;
      }
    }
  }

  _loop(now) {
    if (!this._lastFrame) this._lastFrame = now || 0;
    const dt = Math.min((now || 0) - this._lastFrame, 50);
    this._lastFrame = now || 0;
    this.time += dt * 0.001;
    this._updateMoodCycle(dt);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.size, this.size);

    // Outer glow (night-mode values for dark site background)
    const colors = this._getColors();
    const outerGlow = ctx.createRadialGradient(
      this.cx, this.cy, this.baseOrbRadius * 0.6,
      this.cx, this.cy, this.baseOrbRadius * 1.8
    );
    outerGlow.addColorStop(0, rgbaStr(colors[0], 0.35));
    outerGlow.addColorStop(0.3, rgbaStr(colors[1], 0.18));
    outerGlow.addColorStop(0.6, rgbaStr(colors[2], 0.08));
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, this.size, this.size);

    this._drawOrb(dt);
    this._updateFlares(dt);
    this._drawParticles(dt);

    requestAnimationFrame((t) => this._loop(t));
  }
}

/* ── Init ──────────────────────────────────────────────────────── */
window.FaeOrb = FaeOrb;
