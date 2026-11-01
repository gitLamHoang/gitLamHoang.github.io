// Waypoint-following model for the hero route field.
// Mirrors the behavior of HARP PRs #2 and #5: repeated laps over a waypoint loop, speed that
// ramps up and slows near each target, and a manual takeover that stops at once.
// Units are meters, seconds, and radians. This is an illustration, not robot data.

export interface Vec {
  x: number;
  y: number;
}

export type Mode = 'idle' | 'turning' | 'walking' | 'slowing' | 'takeover' | 'done';

export interface Limits {
  /** top speed, m/s */
  vMax: number;
  /** speed-up rate, m/s² */
  accel: number;
  /** slow-down rate used for the approach to a target, m/s² */
  decel: number;
  /** max turn rate, rad/s */
  turnRate: number;
  /** heading error above which the robot turns in place, rad */
  turnInPlace: number;
  /** distance at which a waypoint counts as reached, m */
  arriveRadius: number;
}

export const DEFAULT_LIMITS: Limits = {
  vMax: 0.8,
  accel: 0.5,
  decel: 0.45,
  turnRate: 1.8,
  turnInPlace: 0.45,
  arriveRadius: 0.06,
};

export interface RobotState {
  pos: Vec;
  heading: number;
  v: number;
  /** index of the waypoint being walked to */
  target: number;
  /** 1-based lap counter */
  lap: number;
  mode: Mode;
}

export const distance = (a: Vec, b: Vec): number => Math.hypot(b.x - a.x, b.y - a.y);

/** Wrap an angle to (-π, π]. */
export function wrapAngle(a: number): number {
  let r = a % (2 * Math.PI);
  if (r > Math.PI) r -= 2 * Math.PI;
  if (r <= -Math.PI) r += 2 * Math.PI;
  return r;
}

/**
 * Speed for the next tick: ramp up by `accel`, never above `vMax`, and never faster than the
 * speed from which the robot can still stop at the target: v = min(vMax, v + a·dt, √(2·a_dec·d)).
 */
export function nextSpeed(v: number, dt: number, dRemaining: number, limits: Limits = DEFAULT_LIMITS): number {
  const stoppable = Math.sqrt(2 * limits.decel * Math.max(0, dRemaining));
  return Math.max(0, Math.min(limits.vMax, v + limits.accel * dt, stoppable));
}

/** Total length of one closed lap through every waypoint and back to the first. */
export function lapLength(route: readonly Vec[]): number {
  if (route.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < route.length; i++) total += distance(route[i], route[(i + 1) % route.length]);
  return total;
}

/** A robot parked on the first waypoint, facing the second. */
export function initialState(route: readonly Vec[]): RobotState {
  const start = route[0] ?? { x: 0, y: 0 };
  const next = route[1] ?? start;
  return {
    pos: { ...start },
    heading: Math.atan2(next.y - start.y, next.x - start.x),
    v: 0,
    target: route.length > 1 ? 1 : 0,
    lap: 1,
    mode: 'idle',
  };
}

/** Start or resume walking. A finished route restarts its lap count from where the robot stands. */
export function run(state: RobotState, route: readonly Vec[]): RobotState {
  if (route.length < 2) return state;
  const lap = state.mode === 'done' ? 1 : state.lap;
  return { ...state, lap, mode: 'walking' };
}

/** Manual takeover: speed requests drop to zero immediately, no ramp-down. */
export function takeover(state: RobotState): RobotState {
  if (state.mode === 'idle' || state.mode === 'done') return state;
  return { ...state, v: 0, mode: 'takeover' };
}

/** Advance the simulation by `dt` seconds. */
export function step(
  state: RobotState,
  route: readonly Vec[],
  laps: number,
  dt: number,
  limits: Limits = DEFAULT_LIMITS,
): RobotState {
  if (state.mode === 'idle' || state.mode === 'done' || state.mode === 'takeover') return state;
  if (route.length < 2) return { ...state, v: 0, mode: 'done' };

  let { target, lap } = state;
  let goal = route[target];
  let d = distance(state.pos, goal);

  if (d <= limits.arriveRadius) {
    // Waypoint reached. Index 0 closes a lap.
    if (target === 0) {
      if (lap >= laps) return { ...state, pos: { ...goal }, v: 0, mode: 'done' };
      lap += 1;
    }
    target = (target + 1) % route.length;
    goal = route[target];
    d = distance(state.pos, goal);
  }

  const desired = Math.atan2(goal.y - state.pos.y, goal.x - state.pos.x);
  const error = wrapAngle(desired - state.heading);
  const maxTurn = limits.turnRate * dt;
  const heading = wrapAngle(state.heading + Math.max(-maxTurn, Math.min(maxTurn, error)));

  let v: number;
  let mode: Mode;
  if (Math.abs(error) > limits.turnInPlace) {
    // Facing the wrong way: brake, then turn in place.
    v = Math.max(0, state.v - limits.decel * dt);
    mode = 'turning';
  } else {
    v = nextSpeed(state.v, dt, d, limits);
    const braking = Math.sqrt(2 * limits.decel * d) < Math.min(limits.vMax, state.v + limits.accel * dt);
    mode = braking ? 'slowing' : 'walking';
  }

  const travel = Math.min(v * dt, d);
  const pos = {
    x: state.pos.x + Math.cos(heading) * travel,
    y: state.pos.y + Math.sin(heading) * travel,
  };
  return { pos, heading, v, target, lap, mode };
}
