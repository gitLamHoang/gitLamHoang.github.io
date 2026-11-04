// Drives every [data-lab] figure: a hallway of non-yielding people and a robot that re-plans with
// the sampling MPC in src/lib/crowd-mpc.ts five times a second. Canvas rendering, high-DPI aware,
// theme aware, paused off screen and in background tabs.
import {
  DEFAULT_PLANNER,
  actuate,
  len,
  makeScenario,
  plan,
  stepAgents,
  type Scenario,
  type Agent,
  type Mode,
  type Plan,
  type PlannerConfig,
  type V2,
  type World,
} from '../lib/crowd-mpc.ts';

const WIDTH = 4; // hallway width, m
const PLAN_DT = 0.2; // 5 Hz, as on the robot
const MAX_PEOPLE = 16;
const PERSON = ['#5b7db0', '#8a9a5b', '#c9a66b', '#8f6c8a', '#4f8a8b', '#b5654a', '#7a7f88'];
const MODE_LABEL: Record<Mode, string> = { follow: 'Follow', evade: 'Evade', yield: 'Yield', blocked: 'Blocked' };
interface Palette {
  paper: string;
  raised: string;
  grid: string;
  ink: string;
  graphite: string;
  pen: string;
}

function palette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
  return {
    paper: v('--paper', '#eef2ef'),
    raised: v('--paper-raised', '#f6f8f6'),
    grid: v('--grid', '#d3ded9'),
    ink: v('--ink', '#1c2b4b'),
    graphite: v('--graphite', '#3f4957'),
    pen: v('--robot', '#ffcf3f'),
  };
}

export function initCrowdLabs(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-lab]')) {
    if (el.dataset.ready) continue;
    el.dataset.ready = 'true';
    new CrowdLab(el);
  }
}

class CrowdLab {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly stage: HTMLElement;
  private readonly runBtn: HTMLButtonElement;
  private readonly reads: Record<string, HTMLElement>;
  private readonly hint: HTMLElement | null;

  private world: World = { length: 14, width: WIDTH };
  private cfg: PlannerConfig = { ...DEFAULT_PLANNER };
  private people: Agent[] = [];
  private robot = { p: { x: 0.8, y: WIDTH / 2 }, v: { x: 0, y: 0 } };
  private u: V2 = { x: 0, y: 0 };
  private goal: V2 = { x: 13.2, y: WIDTH / 2 };
  private trail: V2[] = [];
  private last: Plan | null = null;
  private kind: Scenario = 'headon';
  private showCandidates = true;
  private sinceplan = PLAN_DT;
  private crossings = 0;
  private contacts = 0;
  private touching = new Set<Agent>();
  private solveMs = 0;

  private scale = 50; // px per metre
  private pad = 14;
  private dpr = 1;
  private colors: Palette = palette();
  private running: boolean;
  private visible = true;
  private frame = 0;
  private lastTime = 0;
  private drag: { start: V2; now: V2 } | null = null;

  constructor(private readonly root: HTMLElement) {
    this.canvas = root.querySelector('[data-lab-canvas]')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.stage = root.querySelector('[data-lab-stage]')!;
    this.runBtn = root.querySelector('[data-lab-act="run"]')!;
    this.hint = root.querySelector('[data-lab-hint]');
    this.reads = Object.fromEntries(
      [...root.querySelectorAll<HTMLElement>('[data-lab-read]')].map((e) => [e.dataset.labRead!, e]),
    );
    this.running = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize();
    this.reset();
    this.bind();
    this.syncRun();
    this.loop();
  }

  // ---------- setup ----------

  private resize(): void {
    const w = this.stage.clientWidth || 800;
    // Shorter hallway on narrow screens so people stay large enough to see and tap.
    const length = Math.max(7, Math.min(14, (w - 2 * this.pad) / 62));
    const changed = Math.abs(length - this.world.length) > 0.01;
    this.world = { length, width: WIDTH };
    this.scale = (w - 2 * this.pad) / length;
    const h = WIDTH * this.scale + 2 * this.pad;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.height = `${h}px`;
    if (changed && this.people.length) this.reset();
  }

  private reset(): void {
    this.people = makeScenario(this.kind, this.world);
    this.robot = { p: { x: 0.8, y: WIDTH / 2 }, v: { x: 0, y: 0 } };
    this.goal = { x: this.world.length - 0.8, y: WIDTH / 2 };
    this.u = { x: 0, y: 0 };
    this.trail = [];
    this.last = null;
    this.sinceplan = PLAN_DT;
    this.crossings = 0;
    this.contacts = 0;
    this.touching.clear();
    this.replan();
    this.draw();
  }

  // ---------- simulation ----------

  private replan(): void {
    const t0 = performance.now();
    this.last = plan(this.robot, this.goal, this.people, this.world, this.cfg, this.u);
    this.solveMs = performance.now() - t0;
    this.u = this.last.best.u;
    this.writeReads();
  }

  private step(dt: number): void {
    this.sinceplan += dt;
    if (this.sinceplan >= PLAN_DT) {
      this.sinceplan = 0;
      this.replan();
    }
    // Execute the command with the same response model the planner predicts with.
    actuate(this.robot, this.u, dt, this.world, this.cfg);
    const p = this.robot.p;
    stepAgents(this.people, dt, this.world);

    const lastTrail = this.trail[this.trail.length - 1];
    if (!lastTrail || Math.hypot(lastTrail.x - p.x, lastTrail.y - p.y) > 0.05) {
      this.trail.push({ x: p.x, y: p.y });
      if (this.trail.length > 400) this.trail.shift();
    }

    for (const a of this.people) {
      const touching = Math.hypot(a.p.x - p.x, a.p.y - p.y) < a.r + this.cfg.robotRadius - 0.01;
      if (touching && !this.touching.has(a)) {
        this.touching.add(a);
        this.contacts += 1;
      } else if (!touching) this.touching.delete(a);
    }

    // Shuttle: on arrival, turn around and cross back.
    if (Math.hypot(this.goal.x - p.x, this.goal.y - p.y) < 0.3) {
      this.crossings += 1;
      this.goal = { x: this.goal.x > this.world.length / 2 ? 0.8 : this.world.length - 0.8, y: WIDTH / 2 };
      this.trail = [];
    }
  }

  private loop(): void {
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000 || 0);
      this.lastTime = now;
      if (this.running && this.visible && !document.hidden) {
        this.step(dt);
        this.draw();
      }
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame((now) => {
      this.lastTime = now;
      tick(now);
    });
  }

  // ---------- drawing ----------

  private X(x: number) {
    return this.pad + x * this.scale;
  }

  private Y(y: number) {
    return this.pad + (WIDTH - y) * this.scale;
  }

  private draw(): void {
    const { ctx, colors: c, scale } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.raised;
    ctx.fillRect(0, 0, w, h);

    // 0.5 m grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= this.world.length + 1e-6; x += 0.5) {
      ctx.moveTo(Math.round(this.X(x)) + 0.5, this.Y(WIDTH));
      ctx.lineTo(Math.round(this.X(x)) + 0.5, this.Y(0));
    }
    for (let y = 0; y <= WIDTH + 1e-6; y += 0.5) {
      ctx.moveTo(this.X(0), Math.round(this.Y(y)) + 0.5);
      ctx.lineTo(this.X(this.world.length), Math.round(this.Y(y)) + 0.5);
    }
    ctx.stroke();

    // walls
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.X(0), this.Y(0));
    ctx.lineTo(this.X(this.world.length), this.Y(0));
    ctx.moveTo(this.X(0), this.Y(WIDTH));
    ctx.lineTo(this.X(this.world.length), this.Y(WIDTH));
    ctx.stroke();

    // goal
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.X(this.goal.x), this.Y(this.goal.y), 0.28 * scale, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = c.ink;
    ctx.beginPath();
    ctx.arc(this.X(this.goal.x), this.Y(this.goal.y), 0.08 * scale, 0, 2 * Math.PI);
    ctx.fill();

    // candidate fan, cheapest darkest
    const plan = this.last;
    if (plan && this.showCandidates) {
      const clear = plan.candidates.filter((k) => !k.collides);
      const costs = clear.map((k) => k.cost);
      const lo = Math.min(...costs);
      const hi = Math.max(...costs);
      ctx.lineWidth = 1;
      for (const k of plan.candidates) {
        if (k.collides) {
          ctx.strokeStyle = c.pen;
          ctx.globalAlpha = 0.1;
        } else {
          ctx.strokeStyle = c.ink;
          ctx.globalAlpha = 0.06 + 0.3 * (1 - (k.cost - lo) / Math.max(1e-6, hi - lo));
        }
        ctx.beginPath();
        ctx.moveTo(this.X(this.robot.p.x), this.Y(this.robot.p.y));
        for (const q of k.path) ctx.lineTo(this.X(q.x), this.Y(q.y));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // trail
    if (this.trail.length > 1) {
      ctx.strokeStyle = c.graphite;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.X(this.trail[0].x), this.Y(this.trail[0].y));
      for (const q of this.trail) ctx.lineTo(this.X(q.x), this.Y(q.y));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // people with their constant-velocity forecasts
    const H = this.cfg.horizon;
    this.people.forEach((a, i) => {
      const color = PERSON[i % PERSON.length];
      const fx = a.p.x + a.v.x * H;
      const fy = a.p.y + a.v.y * H;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.X(a.p.x), this.Y(a.p.y));
      ctx.lineTo(this.X(fx), this.Y(fy));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.X(fx), this.Y(fy), a.r * scale, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(this.X(a.p.x), this.Y(a.p.y), a.r * scale, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = c.raised;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // chosen plan
    if (plan) {
      ctx.strokeStyle = c.pen;
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.X(this.robot.p.x), this.Y(this.robot.p.y));
      for (const q of plan.best.path) ctx.lineTo(this.X(q.x), this.Y(q.y));
      ctx.stroke();
    }

    // robot: red disc, heading tick, narrow arrowhead
    const p = this.robot.p;
    const v = this.robot.v;
    const heading = len(v) > 0.05 ? Math.atan2(v.y, v.x) : Math.atan2(this.goal.y - p.y, this.goal.x - p.x);
    ctx.save();
    ctx.translate(this.X(p.x), this.Y(p.y));
    ctx.rotate(-heading);
    const R = this.cfg.robotRadius * scale;
    ctx.strokeStyle = c.pen;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(R, 0);
    ctx.lineTo(R + 0.18 * scale, 0);
    ctx.stroke();
    ctx.fillStyle = c.pen;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = c.raised;
    ctx.beginPath();
    ctx.moveTo(R * 0.55, 0);
    ctx.lineTo(-R * 0.35, -R * 0.32);
    ctx.lineTo(-R * 0.35, R * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // drag preview for a new person
    if (this.drag) {
      const { start, now } = this.drag;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.X(start.x), this.Y(start.y), 0.25 * scale, 0, 2 * Math.PI);
      ctx.moveTo(this.X(start.x), this.Y(start.y));
      ctx.lineTo(this.X(now.x), this.Y(now.y));
      ctx.stroke();
    }
  }

  private writeReads(): void {
    const plan = this.last;
    if (!plan) return;
    const set = (k: string, text: string) => {
      const el = this.reads[k];
      if (el && el.textContent !== text) el.textContent = text;
    };
    const chip = this.reads.mode;
    if (chip && chip.dataset.mode !== plan.mode) {
      chip.dataset.mode = plan.mode;
      chip.className = `mode-chip m-${plan.mode}`;
      chip.textContent = MODE_LABEL[plan.mode];
    }
    set('speed', `${len(this.robot.v).toFixed(2)} m/s`);
    set('clear', Number.isFinite(plan.best.clearance) ? `${Math.max(0, plan.best.clearance).toFixed(2)} m` : 'n/a');
    set('evaluated', String(plan.evaluated));
    set('ms', `${this.solveMs.toFixed(1)} ms`);
    set('score', `${this.crossings}, ${this.contacts} contact${this.contacts === 1 ? '' : 's'}`);
  }

  // ---------- interaction ----------

  private toWorld(e: PointerEvent): V2 {
    const r = this.canvas.getBoundingClientRect();
    const x = (e.clientX - r.left - this.pad) / this.scale;
    const y = WIDTH - (e.clientY - r.top - this.pad) / this.scale;
    return { x: Math.min(this.world.length, Math.max(0, x)), y: Math.min(WIDTH - 0.3, Math.max(0.3, y)) };
  }

  private addPerson(p: V2, v?: V2): void {
    const vel = v ?? { x: (p.x > this.robot.p.x ? -1 : 1) * 0.7, y: 0 };
    this.people.push({ p, v: vel, r: 0.25 });
    if (this.people.length > MAX_PEOPLE) this.people.shift();
    this.hint?.classList.add('is-hidden');
    this.replan();
    this.draw();
  }

  private syncRun(): void {
    this.runBtn.textContent = this.running ? 'Pause' : 'Play';
    this.runBtn.setAttribute('aria-pressed', String(!this.running));
  }

  private bind(): void {
    this.runBtn.addEventListener('click', () => {
      this.running = !this.running;
      this.syncRun();
    });
    this.root.querySelector('[data-lab-act="reset"]')?.addEventListener('click', () => this.reset());
    this.root.querySelector('[data-lab-act="add"]')?.addEventListener('click', () => {
      const ahead = this.goal.x > this.robot.p.x ? 1 : -1;
      const x = Math.min(this.world.length - 0.5, Math.max(0.5, this.robot.p.x + ahead * (3 + Math.random() * 2)));
      this.addPerson({ x, y: 0.6 + Math.random() * 2.8 }, { x: -ahead * (0.5 + Math.random() * 0.4), y: (Math.random() - 0.5) * 0.3 });
    });

    const scenarioButtons = [...this.root.querySelectorAll<HTMLButtonElement>('[data-scenario]')];
    for (const b of scenarioButtons) {
      b.addEventListener('click', () => {
        this.kind = b.dataset.scenario as Scenario;
        for (const o of scenarioButtons) o.setAttribute('aria-pressed', String(o === b));
        this.reset();
      });
    }

    const knob = (name: string) => this.root.querySelector<HTMLInputElement>(`[data-lab-knob="${name}"]`)!;
    const out = (name: string) => this.root.querySelector<HTMLOutputElement>(`[data-lab-out="${name}"]`)!;
    knob('horizon').addEventListener('input', (e) => {
      const v = Number((e.target as HTMLInputElement).value);
      this.cfg = { ...this.cfg, horizon: v };
      out('horizon').textContent = `${v.toFixed(1)} s`;
      this.replan();
      this.draw();
    });
    knob('margin').addEventListener('input', (e) => {
      const v = Number((e.target as HTMLInputElement).value);
      this.cfg = { ...this.cfg, margin: v };
      out('margin').textContent = `${v.toFixed(2)} m`;
      this.replan();
      this.draw();
    });
    knob('candidates').addEventListener('change', (e) => {
      this.showCandidates = (e.target as HTMLInputElement).checked;
      this.draw();
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      const p = this.toWorld(e);
      this.drag = { start: p, now: p };
      this.canvas.setPointerCapture(e.pointerId);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      this.drag.now = this.toWorld(e);
      if (!this.running) this.draw();
    });
    this.canvas.addEventListener('pointerup', () => {
      if (!this.drag) return;
      const { start, now } = this.drag;
      this.drag = null;
      const d = { x: now.x - start.x, y: now.y - start.y };
      const s = len(d);
      // A drag sets walking direction and speed (capped at 1.3 m/s); a tap walks toward the robot.
      const v = s > 0.15 ? { x: (d.x / s) * Math.min(1.3, s), y: (d.y / s) * Math.min(1.3, s) } : undefined;
      this.addPerson(start, v);
    });
    this.canvas.addEventListener('pointercancel', () => (this.drag = null));

    new ResizeObserver(() => {
      this.resize();
      this.draw();
    }).observe(this.stage);
    new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
    }).observe(this.stage);

    // Re-read theme colors when the theme changes.
    const refresh = () => {
      this.colors = palette();
      this.draw();
    };
    new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);
  }
}
