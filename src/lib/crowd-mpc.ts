// A compact sampling-based model predictive controller for a robot crossing a hallway of people
// who do not yield. It is a browser illustration of the ideas in Harvey's HARP predictive-avoidance
// layer (constant-velocity forecasts, rollouts with a response model, hard collision rejection,
// a least-intrusion fallback), written for this site. It is not the HARP controller code.

export interface V2 {
  x: number;
  y: number;
}

export interface Agent {
  p: V2;
  v: V2;
  r: number;
}

export interface World {
  /** hallway runs from x = 0 to x = length */
  length: number;
  /** and from y = 0 to y = width */
  width: number;
}

export interface PlannerConfig {
  /** prediction horizon, s */
  horizon: number;
  /** rollout step, s */
  dt: number;
  /** top speed, m/s */
  vMax: number;
  /** largest change in velocity per second, m/s² */
  accel: number;
  /** first-order velocity response time, s */
  tau: number;
  robotRadius: number;
  /** soft comfort margin beyond contact, m */
  margin: number;
  /** sampled speeds, as fractions of vMax */
  speeds: readonly number[];
  /** sampled headings around the circle */
  headings: number;
  wGoal: number;
  wTrack: number;
  wClear: number;
  wSmooth: number;
  /** per-step discount on clearance costs, so near conflicts dominate */
  discount: number;
}

export const DEFAULT_PLANNER: PlannerConfig = {
  horizon: 3,
  dt: 0.1,
  vMax: 0.8,
  accel: 1.2,
  tau: 0.35,
  robotRadius: 0.3,
  margin: 0.25,
  speeds: [0.25, 0.5, 0.75, 1],
  headings: 32,
  wGoal: 1,
  wTrack: 0.35,
  wClear: 6,
  wSmooth: 0.25,
  discount: 0.97,
};

export interface Candidate {
  /** commanded velocity, held over the horizon */
  u: V2;
  /** predicted robot positions at dt, 2dt, ... */
  path: V2[];
  cost: number;
  /** smallest predicted gap to any person or wall, m (negative means contact) */
  clearance: number;
  collides: boolean;
  /** time-discounted, integrated depth of predicted contact */
  intrusion: number;
}

export type Mode = 'follow' | 'evade' | 'yield' | 'blocked';

export interface Plan {
  best: Candidate;
  candidates: Candidate[];
  mode: Mode;
  evaluated: number;
}

export const len = (v: V2): number => Math.hypot(v.x, v.y);

/** Predicted positions under a held command, with first-order response and an acceleration cap. */
export function rollout(p0: V2, v0: V2, u: V2, cfg: PlannerConfig = DEFAULT_PLANNER): V2[] {
  const steps = Math.round(cfg.horizon / cfg.dt);
  const out: V2[] = [];
  let px = p0.x;
  let py = p0.y;
  let vx = v0.x;
  let vy = v0.y;
  const cap = cfg.accel * cfg.dt;
  for (let k = 0; k < steps; k++) {
    let dx = ((u.x - vx) * cfg.dt) / cfg.tau;
    let dy = ((u.y - vy) * cfg.dt) / cfg.tau;
    const d = Math.hypot(dx, dy);
    if (d > cap) {
      dx *= cap / d;
      dy *= cap / d;
    }
    vx += dx;
    vy += dy;
    const s = Math.hypot(vx, vy);
    if (s > cfg.vMax) {
      vx *= cfg.vMax / s;
      vy *= cfg.vMax / s;
    }
    px += vx * cfg.dt;
    py += vy * cfg.dt;
    out.push({ x: px, y: py });
  }
  return out;
}

function evaluate(
  robot: { p: V2; v: V2 },
  u: V2,
  goal: V2,
  agents: readonly Agent[],
  world: World,
  cfg: PlannerConfig,
  uPrev: V2,
  uWant: V2,
): Candidate {
  const path = rollout(robot.p, robot.v, u, cfg);
  let clearance = Infinity;
  let intrusion = 0;
  let soft = 0;
  let w = 1;
  for (let k = 0; k < path.length; k++) {
    const q = path[k];
    const t = (k + 1) * cfg.dt;
    // walls are hard limits
    const wallGap = Math.min(q.y - cfg.robotRadius, world.width - cfg.robotRadius - q.y);
    clearance = Math.min(clearance, wallGap);
    if (wallGap < 0) intrusion += -wallGap * w * cfg.dt;
    for (const a of agents) {
      const gap = Math.hypot(q.x - (a.p.x + a.v.x * t), q.y - (a.p.y + a.v.y * t)) - cfg.robotRadius - a.r;
      if (gap < clearance) clearance = gap;
      if (gap < 0) intrusion += -gap * w * cfg.dt;
      else if (gap < cfg.margin) soft += (cfg.margin - gap) ** 2 * w * cfg.dt;
    }
    w *= cfg.discount;
  }
  const end = path[path.length - 1];
  const cost =
    cfg.wGoal * Math.hypot(goal.x - end.x, goal.y - end.y) +
    cfg.wTrack * ((u.x - uWant.x) ** 2 + (u.y - uWant.y) ** 2) +
    cfg.wClear * soft +
    cfg.wSmooth * ((u.x - uPrev.x) ** 2 + (u.y - uPrev.y) ** 2);
  return { u, path, cost, clearance, collides: intrusion > 0, intrusion };
}

/**
 * One planning cycle: sample held velocity commands, roll each out against constant-velocity
 * forecasts, reject anything with predicted contact, refine around the cheapest, and fall back to
 * the least intrusive command when nothing is clear. Only the first part of the plan is executed.
 */
export function plan(
  robot: { p: V2; v: V2 },
  goal: V2,
  agents: readonly Agent[],
  world: World,
  cfg: PlannerConfig = DEFAULT_PLANNER,
  uPrev: V2 = { x: 0, y: 0 },
): Plan {
  const toGoal = { x: goal.x - robot.p.x, y: goal.y - robot.p.y };
  const dGoal = len(toGoal);
  // Desired request: straight at the goal, slowing over the last metre.
  const want = dGoal > 1e-6 ? Math.min(cfg.vMax, cfg.vMax * dGoal) / dGoal : 0;
  const uWant = { x: toGoal.x * want, y: toGoal.y * want };

  const commands: V2[] = [{ x: 0, y: 0 }, uWant, uPrev];
  for (const s of cfg.speeds) {
    for (let h = 0; h < cfg.headings; h++) {
      const a = (h / cfg.headings) * 2 * Math.PI;
      commands.push({ x: Math.cos(a) * s * cfg.vMax, y: Math.sin(a) * s * cfg.vMax });
    }
  }
  const candidates = commands.map((u) => evaluate(robot, u, goal, agents, world, cfg, uPrev, uWant));

  const clear = candidates.filter((c) => !c.collides);
  let best: Candidate;
  if (clear.length) {
    best = clear.reduce((m, c) => (c.cost < m.cost ? c : m));
    // Local refinement: a small pattern search around the cheapest clear command.
    for (const step of [0.12, 0.06]) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        let u = { x: best.u.x + dx * step, y: best.u.y + dy * step };
        const s = len(u);
        if (s > cfg.vMax) u = { x: (u.x * cfg.vMax) / s, y: (u.y * cfg.vMax) / s };
        const c = evaluate(robot, u, goal, agents, world, cfg, uPrev, uWant);
        candidates.push(c);
        if (!c.collides && c.cost < best.cost) best = c;
      }
    }
  } else {
    best = candidates.reduce((m, c) => (c.intrusion < m.intrusion || (c.intrusion === m.intrusion && c.cost < m.cost) ? c : m));
  }

  let mode: Mode;
  if (best.collides) mode = 'blocked';
  else {
    const speed = len(best.u);
    const wantSpeed = len(uWant);
    const angle = speed > 1e-6 && wantSpeed > 1e-6
      ? Math.acos(Math.max(-1, Math.min(1, (best.u.x * uWant.x + best.u.y * uWant.y) / (speed * wantSpeed))))
      : 0;
    if (angle > (14 * Math.PI) / 180 && speed > 0.15) mode = 'evade';
    else if (speed < 0.85 * wantSpeed) mode = 'yield';
    else mode = 'follow';
  }
  return { best, candidates, mode, evaluated: candidates.length };
}

/** Advance pedestrians: constant velocity, reflect off the walls, wrap at the hallway ends. */
export function stepAgents(agents: Agent[], dt: number, world: World): void {
  for (const a of agents) {
    a.p.x += a.v.x * dt;
    a.p.y += a.v.y * dt;
    if (a.p.y - a.r < 0) {
      a.p.y = a.r + (a.r - a.p.y);
      a.v.y = Math.abs(a.v.y);
    } else if (a.p.y + a.r > world.width) {
      a.p.y = world.width - a.r - (a.p.y + a.r - world.width);
      a.v.y = -Math.abs(a.v.y);
    }
    if (a.p.x < -a.r) a.p.x += world.length + 2 * a.r;
    else if (a.p.x > world.length + a.r) a.p.x -= world.length + 2 * a.r;
  }
}

/** Apply a velocity command for dt seconds with the same response model the planner predicts with. */
export function actuate(robot: { p: V2; v: V2 }, u: V2, dt: number, world: World, cfg: PlannerConfig = DEFAULT_PLANNER): void {
  const v = robot.v;
  let dx = ((u.x - v.x) * dt) / cfg.tau;
  let dy = ((u.y - v.y) * dt) / cfg.tau;
  const d = Math.hypot(dx, dy);
  if (d > cfg.accel * dt) {
    dx *= (cfg.accel * dt) / d;
    dy *= (cfg.accel * dt) / d;
  }
  v.x += dx;
  v.y += dy;
  const s = len(v);
  if (s > cfg.vMax) {
    v.x *= cfg.vMax / s;
    v.y *= cfg.vMax / s;
  }
  robot.p.x += v.x * dt;
  robot.p.y = Math.min(world.width - cfg.robotRadius, Math.max(cfg.robotRadius, robot.p.y + v.y * dt));
}

export type Scenario = 'headon' | 'crossing' | 'dense';

/** Small seeded PRNG so each scenario starts the same way every time. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The lab's starting crowds: people walking at the robot, across its path, or both. */
export function makeScenario(kind: Scenario, world: World): Agent[] {
  const r = rng(kind === 'headon' ? 7 : kind === 'crossing' ? 11 : 23);
  const L = world.length;
  const W = world.width;
  const people: Agent[] = [];
  const add = (x: number, y: number, vx: number, vy: number) => people.push({ p: { x, y }, v: { x: vx, y: vy }, r: 0.25 });
  if (kind === 'headon') {
    for (let i = 0; i < 6; i++) add(L * (0.3 + 0.12 * i), 0.6 + r() * (W - 1.2), -(0.5 + r() * 0.4), (r() - 0.5) * 0.15);
  } else if (kind === 'crossing') {
    for (let i = 0; i < 6; i++) {
      const up = i % 2 === 0;
      add(L * (0.22 + 0.11 * i), up ? 0.5 + r() * 0.8 : W - 0.5 - r() * 0.8, (r() - 0.5) * 0.2, (up ? 1 : -1) * (0.45 + r() * 0.3));
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const dir = r() < 0.6 ? -1 : 1;
      add(L * (0.15 + r() * 0.75), 0.4 + r() * (W - 0.8), dir * (0.35 + r() * 0.5), (r() - 0.5) * 0.5);
    }
  }
  return people;
}
