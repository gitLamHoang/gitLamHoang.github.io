"""Export a compact top-down record of one HARP native-G1 run for the site's planner view.

Writes JSON with walls/blocks (rectangles), the goal, and 5 Hz samples of robot pose, pedestrian
positions, and the predictive filter's mode. All values come from the run's own logs.
"""
import json
import re
import sys
from pathlib import Path

import numpy as np

run, out = Path(sys.argv[1]), Path(sys.argv[2])
HZ = 5

world = (run / 'world.xml').read_text()
rects = []
for name, size, pos in re.findall(r'<geom name="((?:wall|block)\d+)" type="box" size="([^"]+)" pos="([^"]+)"', world):
    sx, sy, _ = map(float, size.split())
    px, py, _ = map(float, pos.split())
    rects.append({'kind': 'wall' if name.startswith('wall') else 'block',
                  'x': round(px - sx, 3), 'y': round(py - sy, 3), 'w': round(2 * sx, 3), 'h': round(2 * sy, 3)})

traj = [json.loads(l) for l in open(run / 'trajectory.jsonl')]
t_traj = np.array([r['time'] for r in traj])
q = np.array([r['qpos'] for r in traj])
# yaw from the base quaternion (w, x, y, z)
w, x, y, z = q[:, 3], q[:, 4], q[:, 5], q[:, 6]
yaw = np.arctan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
# average out the gait sway over 1 s, as on the video's floor path
k = np.ones(21) / 21
def smooth(a):
    return np.convolve(np.pad(a, 10, mode='edge'), k, mode='valid')
rx, ry = smooth(q[:, 0]), smooth(q[:, 1])

people_t, people, modes = [], [], []
last_t = 0.0
for line in open(run / 'events.jsonl'):
    d = json.loads(line)
    if 'people' in d and 'time' in d:
        last_t = d['time']
        people_t.append(d['time'])
        people.append([(p['x'], p['y']) for p in d['people']])
    elif d.get('event') == 'avoidance' and 'mode' in d:
        modes.append((last_t, d['mode']))
people_t = np.array(people_t)
people = np.array(people)

summary = json.loads((run / 'summary.json').read_text())
goal = [9.0, 0.0]
xy = q[:, :2]
moved = np.where(np.linalg.norm(xy - xy[0], axis=1) > 0.05)[0]
arrive = np.where(np.linalg.norm(xy - np.array(goal), axis=1) < 0.35)[0]
t0 = max(t_traj[0], t_traj[moved[0]] - 1.0)
t1 = min(t_traj[-1], t_traj[arrive[0]] + 2.5) if len(arrive) else t_traj[-1]

frames = []
for t in np.arange(t0, t1, 1 / HZ):
    i = int(np.clip(np.searchsorted(t_traj, t), 0, len(t_traj) - 1))
    j = int(np.clip(np.searchsorted(people_t, t), 0, len(people_t) - 1))
    m = [md for (mt, md) in modes if mt <= t]
    frames.append({
        't': round(float(t - t0), 2),
        'r': [round(float(rx[i]), 3), round(float(ry[i]), 3), round(float(yaw[i]), 3)],
        'p': [[round(float(a), 3), round(float(b), 3)] for a, b in people[j]],
        'm': m[-1] if m else 'idle',
    })

out.write_text(json.dumps({
    'source': f'{run.parent.name}/{run.name}',
    'goal': goal,
    'rects': rects,
    'hz': HZ,
    'summary': {k: summary[k] for k in ('status', 'contacts', 'seconds', 'longest_standstill_s',
                                         'true_goal_error_m', 'minimum_people_center_separation_m',
                                         'avoidance_mode_transitions', 'locomotion')},
    'frames': frames,
}, separators=(',', ':')))
print(f'{len(frames)} frames, {out.stat().st_size / 1024:.0f} KB, modes {sorted({f["m"] for f in frames})}')
