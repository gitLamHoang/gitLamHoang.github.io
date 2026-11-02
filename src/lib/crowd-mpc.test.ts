import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PLANNER, actuate, len, makeScenario, plan, rollout, stepAgents, type Agent, type Scenario, type World } from './crowd-mpc.ts';

const world: World = { length: 14, width: 4 };
const cfg = DEFAULT_PLANNER;
const start = { p: { x: 1, y: 2 }, v: { x: 0, y: 0 } };
const goal = { x: 13, y: 2 };

/** Smallest gap between the robot path and any forecast agent, minus both radii. */
function minGap(path: { x: number; y: number }[], agents: Agent[]): number {
  let gap = Infinity;
  path.forEach((q, k) => {
    const t = (k + 1) * cfg.dt;
    for (const a of agents) {
      const ax = a.p.x + a.v.x * t;
      const ay = a.p.y + a.v.y * t;
      gap = Math.min(gap, Math.hypot(q.x - ax, q.y - ay) - cfg.robotRadius - a.r);
    }
  });
  return gap;
}

test('rollout respects the speed cap and the acceleration limit', () => {
  const path = rollout({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: cfg.vMax, y: 0 }, cfg);
  assert.equal(path.length, Math.round(cfg.horizon / cfg.dt));
  let prev = { x: 0, y: 0 };
  let vPrev = 0;
  for (const q of path) {
    const v = Math.hypot(q.x - prev.x, q.y - prev.y) / cfg.dt;
    assert.ok(v <= cfg.vMax + 1e-9, 'speed cap');
    assert.ok(v - vPrev <= cfg.accel * cfg.dt + 1e-9, 'acceleration limit');
    prev = q;
    vPrev = v;
  }
  assert.ok(vPrev > 0.95 * cfg.vMax, 'reaches the commanded speed within the horizon');
});

test('an empty hallway gives a straight run at top speed', () => {
  const out = plan(start, goal, [], world, cfg, { x: 0, y: 0 });
  assert.equal(out.mode, 'follow');
  assert.ok(Math.abs(out.best.u.y) < 0.05);
  assert.ok(out.best.u.x > 0.95 * cfg.vMax);
  assert.ok(out.evaluated > 100);
});

test('a pedestrian walking straight at the robot is avoided with clearance', () => {
  const agents: Agent[] = [{ p: { x: 4, y: 2 }, v: { x: -0.8, y: 0 }, r: 0.25 }];
  const out = plan(start, goal, agents, world, cfg, { x: 0.6, y: 0 });
  assert.ok(out.mode === 'evade' || out.mode === 'yield', out.mode);
  assert.ok(!out.best.collides);
  assert.ok(minGap(out.best.path, agents) >= 0, 'no predicted contact');
});

test('the chosen path never leaves the hallway', () => {
  const nearWall = { p: { x: 1, y: 0.45 }, v: { x: 0, y: 0 } };
  const out = plan(nearWall, { x: 13, y: 0.4 }, [], world, cfg, { x: 0, y: 0 });
  for (const q of out.best.path) {
    assert.ok(q.y - cfg.robotRadius >= -1e-9 && q.y + cfg.robotRadius <= world.width + 1e-9, `y = ${q.y}`);
  }
});

test('when every option collides, the least intrusive one runs and the plan says blocked', () => {
  const ring: Agent[] = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * 2 * Math.PI;
    return { p: { x: 4 + 0.75 * Math.cos(a), y: 2 + 0.75 * Math.sin(a) }, v: { x: -0.9 * Math.cos(a), y: -0.9 * Math.sin(a) }, r: 0.25 };
  });
  const out = plan({ p: { x: 4, y: 2 }, v: { x: 0, y: 0 } }, goal, ring, world, cfg, { x: 0, y: 0 });
  assert.equal(out.mode, 'blocked');
  assert.ok(out.best.collides);
  const least = Math.min(...out.candidates.map((c) => c.intrusion));
  assert.ok(out.best.intrusion <= least + 1e-9);
});

test('planning is deterministic', () => {
  const agents: Agent[] = [
    { p: { x: 5, y: 1.5 }, v: { x: -0.6, y: 0.1 }, r: 0.25 },
    { p: { x: 7, y: 3 }, v: { x: -0.4, y: -0.2 }, r: 0.25 },
  ];
  const a = plan(start, goal, agents, world, cfg, { x: 0.3, y: 0 });
  const b = plan(start, goal, agents, world, cfg, { x: 0.3, y: 0 });
  assert.deepEqual(a.best.u, b.best.u);
  assert.equal(a.mode, b.mode);
});

test('pedestrians keep constant velocity, bounce off walls, and wrap at the hallway ends', () => {
  const agents: Agent[] = [
    { p: { x: 5, y: 3.7 }, v: { x: 0, y: 0.5 }, r: 0.25 },
    { p: { x: -0.1, y: 2 }, v: { x: -1, y: 0 }, r: 0.25 },
  ];
  stepAgents(agents, 0.2, world);
  assert.ok(agents[0].v.y < 0, 'reflected at the wall');
  assert.ok(agents[0].p.y + agents[0].r <= world.width);
  assert.ok(agents[1].p.x > world.length - 1, 'wrapped to the far end');
  assert.ok(Math.abs(len(agents[1].v) - 1) < 1e-12, 'speed kept');
});

/** The lab's closed loop: plan at 5 Hz, actuate at 50 Hz, people never yield, the robot shuttles. */
function closedLoop(kind: Scenario, seconds: number) {
  const people = makeScenario(kind, world);
  const robot = { p: { x: 0.8, y: 2 }, v: { x: 0, y: 0 } };
  let goal = { x: world.length - 0.8, y: 2 };
  let u = { x: 0, y: 0 };
  let crossings = 0;
  let contacts = 0;
  const touching = new Set<Agent>();
  const dt = 0.02;
  for (let i = 0; i * dt < seconds; i++) {
    if (i % 10 === 0) u = plan(robot, goal, people, world, cfg, u).best.u;
    actuate(robot, u, dt, world, cfg);
    stepAgents(people, dt, world);
    for (const a of people) {
      const t = Math.hypot(a.p.x - robot.p.x, a.p.y - robot.p.y) < a.r + cfg.robotRadius - 0.01;
      if (t && !touching.has(a)) {
        touching.add(a);
        contacts++;
      } else if (!t) touching.delete(a);
    }
    if (Math.hypot(goal.x - robot.p.x, goal.y - robot.p.y) < 0.3) {
      crossings++;
      goal = { x: goal.x > world.length / 2 ? 0.8 : world.length - 0.8, y: 2 };
    }
  }
  return { crossings, contacts };
}

for (const kind of ['headon', 'crossing', 'dense'] as const) {
  test(`closed loop, ${kind} crowd: the robot keeps crossing the hallway`, () => {
    const { crossings, contacts } = closedLoop(kind, 120);
    console.log(`  ${kind}: ${crossings} crossings, ${contacts} contacts in 120 s`);
    assert.ok(crossings >= 3, `only ${crossings} crossings`);
    if (kind !== 'dense') assert.equal(contacts, 0, `${contacts} contacts`);
  });
}
