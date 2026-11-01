import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LIMITS,
  initialState,
  lapLength,
  nextSpeed,
  run,
  step,
  takeover,
  wrapAngle,
  type RobotState,
  type Vec,
} from './route-model.ts';

const square: Vec[] = [
  { x: 1, y: 1 },
  { x: 5, y: 1 },
  { x: 5, y: 4 },
  { x: 1, y: 4 },
];

function simulate(route: Vec[], laps: number, seconds: number, onTick?: (s: RobotState) => void): RobotState {
  let s = run(initialState(route), route);
  const dt = 1 / 60;
  for (let t = 0; t < seconds && s.mode !== 'done'; t += dt) {
    s = step(s, route, laps, dt);
    onTick?.(s);
  }
  return s;
}

test('nextSpeed never exceeds vMax', () => {
  let v = 0;
  for (let i = 0; i < 600; i++) v = nextSpeed(v, 1 / 60, 100);
  assert.equal(v, DEFAULT_LIMITS.vMax);
});

test('nextSpeed ramps by at most accel·dt', () => {
  assert.ok(Math.abs(nextSpeed(0.1, 0.1, 100) - (0.1 + DEFAULT_LIMITS.accel * 0.1)) < 1e-12);
});

test('nextSpeed caps speed so the robot can stop at the target', () => {
  const d = 0.05;
  assert.ok(nextSpeed(0.6, 1 / 60, d) <= Math.sqrt(2 * DEFAULT_LIMITS.decel * d) + 1e-12);
  assert.equal(nextSpeed(0.6, 1 / 60, 0), 0);
});

test('wrapAngle maps into (-π, π]', () => {
  assert.ok(Math.abs(wrapAngle(3 * Math.PI) - Math.PI) < 1e-12);
  assert.ok(Math.abs(wrapAngle(-Math.PI / 2) + Math.PI / 2) < 1e-12);
});

test('lapLength closes the loop', () => {
  assert.equal(lapLength(square), 14);
  assert.equal(lapLength([{ x: 0, y: 0 }]), 0);
});

test('the robot completes the requested laps and parks on the first waypoint', () => {
  const end = simulate(square, 2, 600);
  assert.equal(end.mode, 'done');
  assert.equal(end.lap, 2);
  assert.deepEqual(end.pos, square[0]);
  assert.equal(end.v, 0);
});

test('speed stays within limits and slows into each waypoint', () => {
  let maxV = 0;
  let slowedNearTarget = false;
  simulate(square, 1, 600, (s) => {
    maxV = Math.max(maxV, s.v);
    const d = Math.hypot(square[s.target].x - s.pos.x, square[s.target].y - s.pos.y);
    if (s.mode === 'slowing' && d < 0.3) slowedNearTarget = true;
  });
  assert.ok(maxV <= DEFAULT_LIMITS.vMax + 1e-12);
  assert.ok(maxV > 0.55, 'reaches near top speed on a 4 m leg');
  assert.ok(slowedNearTarget);
});

test('takeover drops speed to zero at once and freezes the robot', () => {
  let s = run(initialState(square), square);
  for (let i = 0; i < 120; i++) s = step(s, square, 1, 1 / 60);
  assert.ok(s.v > 0);
  const stopped = takeover(s);
  assert.equal(stopped.v, 0);
  assert.equal(stopped.mode, 'takeover');
  assert.deepEqual(step(stopped, square, 1, 1 / 60), stopped);
});

test('run after takeover resumes; run after done restarts the lap count', () => {
  const resumed = run(takeover({ ...initialState(square), mode: 'walking', v: 0.3, lap: 2 }), square);
  assert.equal(resumed.mode, 'walking');
  assert.equal(resumed.lap, 2);
  const restarted = run({ ...initialState(square), mode: 'done', lap: 3 }, square);
  assert.equal(restarted.lap, 1);
});

test('a route with fewer than two waypoints never moves', () => {
  const one = [{ x: 2, y: 2 }];
  const s = run(initialState(one), one);
  assert.equal(s.mode, 'idle');
  assert.equal(step({ ...s, mode: 'walking' }, one, 1, 0.1).mode, 'done');
});
