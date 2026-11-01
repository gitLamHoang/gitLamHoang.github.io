// Drives every [data-route] figure: draws the route, runs the motion model, and wires the controls.
import {
  DEFAULT_LIMITS,
  distance,
  initialState,
  run,
  step,
  takeover,
  type Mode,
  type RobotState,
  type Vec,
} from '../lib/route-model.ts';

const PX_PER_M = 80; // 0.5 m = 40 px, the same square as the page grid
const MAX_WAYPOINTS = 8;
const EDGE = 0.35; // keep waypoints this far inside the floor, m
const TRACE_SECONDS = 20;
const TRACE_HZ = 30;
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Default route as fractions of the floor, so it fits any width. */
const DEFAULT_ROUTE: Vec[] = [
  { x: 0.12, y: 0.3 },
  { x: 0.36, y: 0.76 },
  { x: 0.6, y: 0.32 },
];

const MODE_TEXT: Record<Mode, string> = {
  idle: 'idle',
  turning: 'turning',
  walking: 'walking',
  slowing: 'slowing',
  takeover: 'manual takeover',
  done: 'route complete',
};

type ReadKey = 'state' | 'speed' | 'dist' | 'lap';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initRouteFields(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-route]')) {
    if (el.dataset.ready) continue;
    el.dataset.ready = 'true';
    new RouteField(el);
  }
}

class RouteField {
  private readonly svg: SVGSVGElement;
  private readonly stage: HTMLElement;
  private readonly pathEl: SVGPolylineElement;
  private readonly trailEl: SVGPolylineElement;
  private readonly waypointLayer: SVGGElement;
  private readonly robotEl: SVGGElement;
  private readonly traceEl: SVGPolylineElement;
  private readonly hint: HTMLElement | null;
  private readonly status: HTMLElement | null;
  private readonly label: HTMLElement | null;
  private readonly reads: Record<ReadKey, HTMLElement | null>;

  private width = 1;
  private height = 1;
  private route: Vec[] = [];
  private robot!: RobotState;
  private laps = 1;
  private trail: Vec[] = [];
  private trace: number[] = [];
  private traceClock = 0;
  private frame = 0;
  private last = 0;
  private visible = true;
  private lastAnnounced = '';

  constructor(private readonly root: HTMLElement) {
    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
    this.svg = q('[data-route-svg]');
    this.stage = q('[data-route-stage]');
    this.pathEl = q('[data-route-path]');
    this.trailEl = q('[data-route-trail]');
    this.waypointLayer = q('[data-route-waypoints]');
    this.robotEl = q('[data-route-robot]');
    this.traceEl = q('[data-route-trace]');
    this.hint = root.querySelector('[data-route-hint]');
    this.status = root.querySelector('[data-route-status]');
    this.label = root.querySelector('[data-route-label]');
    this.reads = {
      state: root.querySelector('[data-read="state"]'),
      speed: root.querySelector('[data-read="speed"]'),
      dist: root.querySelector('[data-read="dist"]'),
      lap: root.querySelector('[data-read="lap"]'),
    };

    this.measure();
    this.resetRoute();
    this.bind();

    if (root.dataset.autoplay && !reducedMotion()) {
      // The page's one orchestrated moment: a single lap of the default route.
      window.setTimeout(() => this.start(), 600);
    }
  }

  // ---------- geometry ----------

  private measure(): void {
    const box = this.stage.getBoundingClientRect();
    const w = Math.max(box.width, 200) / PX_PER_M;
    const h = Math.max(box.height, 200) / PX_PER_M;
    if (this.route.length) {
      // Keep the route in place relative to the floor when the floor changes size.
      const sx = w / this.width;
      const sy = h / this.height;
      this.route = this.route.map((p) => ({ x: p.x * sx, y: p.y * sy }));
      this.trail = this.trail.map((p) => ({ x: p.x * sx, y: p.y * sy }));
      this.robot = { ...this.robot, pos: { x: this.robot.pos.x * sx, y: this.robot.pos.y * sy } };
    }
    this.width = w;
    this.height = h;
    this.svg.setAttribute('viewBox', `0 0 ${w.toFixed(3)} ${h.toFixed(3)}`);
  }

  private toWorld(clientX: number, clientY: number): Vec | null {
    const ctm = this.svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  private clamp(p: Vec): Vec {
    return {
      x: Math.min(this.width - EDGE, Math.max(EDGE, p.x)),
      y: Math.min(this.height - EDGE, Math.max(EDGE, p.y)),
    };
  }

  // ---------- route editing ----------

  private resetRoute(): void {
    this.stop(false);
    this.route = DEFAULT_ROUTE.map((f) => this.clamp({ x: f.x * this.width, y: f.y * this.height }));
    this.robot = initialState(this.route);
    this.trail = [];
    this.trace = [];
    this.render();
    this.updateAria();
  }

  private addWaypoint(p: Vec): void {
    if (this.route.length >= MAX_WAYPOINTS) {
      this.say(`The route is full at ${MAX_WAYPOINTS} waypoints. Reset to start over.`);
      return;
    }
    this.route.push(this.clamp(p));
    if (this.robot.mode === 'idle' && this.route.length === 2) this.robot = initialState(this.route);
    this.hint?.classList.add('is-hidden');
    this.say(`Waypoint ${this.route.length} added.`);
    this.render();
    this.updateAria();
  }

  private addRandomWaypoint(): void {
    let best: Vec = { x: this.width / 2, y: this.height / 2 };
    let bestGap = -1;
    // Pick the candidate farthest from existing waypoints, so random points spread out.
    for (let i = 0; i < 24; i++) {
      const c = this.clamp({ x: Math.random() * this.width, y: Math.random() * this.height });
      const gap = Math.min(...this.route.map((p) => distance(p, c)), Infinity);
      if (gap > bestGap) {
        best = c;
        bestGap = gap;
      }
    }
    this.addWaypoint(best);
  }

  // ---------- running ----------

  private start(): void {
    if (this.route.length < 2) {
      this.say('Add at least two waypoints to run a route.');
      return;
    }
    if (this.robot.mode === 'done') this.trail = [];
    this.robot = run(this.robot, this.route);
    this.say(`Running ${this.laps === 1 ? 'one lap' : `${this.laps} laps`}.`);
    this.loop();
  }

  private stop(announce = true): void {
    if (!this.robot) return;
    const wasMoving = this.robot.mode !== 'idle' && this.robot.mode !== 'done';
    this.robot = takeover(this.robot);
    if (announce && wasMoving) this.say('Manual takeover. Speed request set to zero.');
    this.render();
  }

  private loop(): void {
    if (this.frame) return;
    this.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      if (this.visible) this.advance(dt);
      const moving = this.robot.mode !== 'idle' && this.robot.mode !== 'done' && this.robot.mode !== 'takeover';
      // Keep ticking briefly after a stop so the speed trace shows the drop to zero.
      if (moving || this.traceClock < 1.5) {
        if (!moving) this.traceClock += dt;
        this.frame = requestAnimationFrame(tick);
      } else {
        this.frame = 0;
      }
      if (moving) this.traceClock = 0;
    };
    this.frame = requestAnimationFrame(tick);
  }

  private advance(dt: number): void {
    const before = this.robot.mode;
    this.robot = step(this.robot, this.route, this.laps, dt);
    const last = this.trail[this.trail.length - 1];
    if (!last || distance(last, this.robot.pos) > 0.02) {
      this.trail.push({ ...this.robot.pos });
      if (this.trail.length > 1200) this.trail.shift();
    }
    this.pushTrace(this.robot.v, dt);
    if (before !== 'done' && this.robot.mode === 'done') this.say('Route complete.');
    this.render();
  }

  private pushTrace(v: number, dt: number): void {
    const samples = Math.max(1, Math.round(dt * TRACE_HZ));
    for (let i = 0; i < samples; i++) this.trace.push(v);
    const cap = TRACE_SECONDS * TRACE_HZ;
    if (this.trace.length > cap) this.trace.splice(0, this.trace.length - cap);
  }

  // ---------- drawing ----------

  private render(): void {
    const pts = (list: Vec[]) => list.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' ');
    const loop = this.route.length > 2 ? [...this.route, this.route[0]] : this.route;
    this.pathEl.setAttribute('points', pts(loop));
    this.trailEl.setAttribute('points', pts(this.trail));

    if (this.waypointLayer.childElementCount !== this.route.length) this.drawWaypoints();
    this.route.forEach((p, i) => {
      const g = this.waypointLayer.children[i] as SVGGElement;
      g.setAttribute('transform', `translate(${p.x.toFixed(3)} ${p.y.toFixed(3)})`);
      const active = this.robot.mode !== 'idle' && this.robot.mode !== 'done' && i === this.robot.target;
      g.classList.toggle('is-target', active);
    });

    const { pos, heading } = this.robot;
    this.robotEl.setAttribute(
      'transform',
      `translate(${pos.x.toFixed(3)} ${pos.y.toFixed(3)}) rotate(${((heading * 180) / Math.PI).toFixed(1)})`,
    );

    const cap = TRACE_SECONDS * TRACE_HZ;
    const offset = cap - this.trace.length;
    const vmax = DEFAULT_LIMITS.vMax;
    this.traceEl.setAttribute(
      'points',
      this.trace.map((v, i) => `${(((offset + i) / cap) * 600).toFixed(1)},${(58 - (v / vmax) * 52).toFixed(1)}`).join(' '),
    );

    const goal = this.route[this.robot.target];
    const d = goal ? distance(this.robot.pos, goal) : 0;
    this.write('state', MODE_TEXT[this.robot.mode]);
    this.write('speed', `${this.robot.v.toFixed(2)} m/s`);
    this.write('dist', `${d.toFixed(1)} m`);
    this.write('lap', `${Math.min(this.robot.lap, this.laps)} of ${this.laps}`);
    if (this.label) {
      const n = this.route.length;
      this.label.textContent = `route: ${n} waypoint${n === 1 ? '' : 's'}, ${this.laps} lap${this.laps === 1 ? '' : 's'}`;
    }
    this.updateAria();
  }

  private drawWaypoints(): void {
    this.waypointLayer.replaceChildren(
      ...this.route.map((_, i) => {
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', 'wp');
        const c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('r', '0.19');
        const t = document.createElementNS(SVG_NS, 'text');
        t.textContent = String(i + 1);
        g.append(c, t);
        return g;
      }),
    );
  }

  private write(key: ReadKey, text: string): void {
    const el = this.reads[key];
    if (el && el.textContent !== text) el.textContent = text;
  }

  private updateAria(): void {
    const n = this.route.length;
    const { mode, target, lap } = this.robot;
    const where =
      mode === 'idle'
        ? 'The robot is parked on waypoint 1.'
        : mode === 'done'
          ? 'The route is complete.'
          : mode === 'takeover'
            ? 'Manual takeover: the robot is stopped.'
            : `The robot is ${MODE_TEXT[mode]} toward waypoint ${target + 1}, lap ${lap} of ${this.laps}.`;
    const text = `Route field with ${n} waypoint${n === 1 ? '' : 's'}. ${where}`;
    if (text !== this.lastAnnounced) {
      this.svg.setAttribute('aria-label', text);
      this.lastAnnounced = text;
    }
  }

  private say(message: string): void {
    if (this.status) this.status.textContent = message;
  }

  // ---------- events ----------

  private bind(): void {
    this.svg.addEventListener('click', (e) => {
      const p = this.toWorld(e.clientX, e.clientY);
      if (p) this.addWaypoint(p);
    });

    this.root.querySelector('[data-act="run"]')?.addEventListener('click', () => this.start());
    this.root.querySelector('[data-act="stop"]')?.addEventListener('click', () => this.stop());
    this.root.querySelector('[data-act="reset"]')?.addEventListener('click', () => {
      this.resetRoute();
      this.hint?.classList.remove('is-hidden');
      this.say('Route reset to three waypoints.');
    });
    this.root.querySelector('[data-act="add"]')?.addEventListener('click', () => this.addRandomWaypoint());

    const lapButtons = [...this.root.querySelectorAll<HTMLButtonElement>('[data-laps]')];
    for (const button of lapButtons) {
      button.addEventListener('click', () => {
        this.laps = Number(button.dataset.laps);
        for (const b of lapButtons) b.setAttribute('aria-pressed', String(b === button));
        this.render();
      });
    }

    new ResizeObserver(() => {
      this.measure();
      this.render();
    }).observe(this.stage);

    new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
    }).observe(this.root);
  }
}
