"""Replay a recorded HARP native-G1 run in MuJoCo and render it to video.

Inputs are the run's own logs: world.xml (building + movers), trajectory.jsonl (G1 qpos at 20 Hz,
sim time), events.jsonl (pedestrian frames with sim time, LiDAR tracks, avoidance modes).
Nothing is simulated here; every pose comes from the recording.
"""
import argparse
import bisect
import json
import math
import re
import subprocess
from pathlib import Path

import os

import mujoco
import numpy as np

# Unitree's G1 model from unitree_mujoco; override with HARP_G1_XML.
G1 = Path(os.environ.get('HARP_G1_XML', Path.home() / 'harp/unitree_mujoco/unitree_robots/g1/g1_29dof.xml'))

PERSON_COLORS = [
    (0.36, 0.49, 0.69), (0.54, 0.60, 0.36), (0.79, 0.65, 0.42), (0.56, 0.42, 0.54),
    (0.31, 0.54, 0.55), (0.71, 0.40, 0.29), (0.48, 0.50, 0.53),
]


def load_run(run: Path):
    world = (run / 'world.xml').read_text()
    traj = [json.loads(l) for l in open(run / 'trajectory.jsonl')]
    t_traj = np.array([r['time'] for r in traj])
    q_traj = np.array([r['qpos'] for r in traj])
    people_t, people = [], []
    tracks = []  # (time, [tracks])
    modes = []  # (time, mode)
    last_t = 0.0
    for line in open(run / 'events.jsonl'):
        d = json.loads(line)
        if 'people' in d and 'time' in d:
            last_t = d['time']
            people_t.append(d['time'])
            people.append([(p['x'], p['y'], p['vx'], p['vy']) for p in d['people']])
        elif 'tracks' in d:
            # Events are written in arrival order, so the preceding crowd frame dates each one.
            tracks.append((last_t, d['tracks']))
        elif d.get('event') == 'avoidance' and 'mode' in d:
            modes.append((last_t, d['mode']))
    return world, t_traj, q_traj, np.array(people_t), np.array(people), tracks, modes


def build_model(world: str, n_people: int):
    xml = G1.read_text().replace('meshdir="meshes"', f'meshdir="{G1.parent / "meshes"}"')
    statics = []
    for tag in re.findall(r'<geom name="(?:wall|block)\d+"[^>]*/>', world):
        mat = 'wall' if 'name="wall' in tag else 'block'
        tag = re.sub(r'rgba="[^"]*"', f'material="{mat}"', tag)
        if mat == 'wall':
            # Cutaway: draw walls 0.9 m tall (true height 2 m) so the robot is never hidden.
            tag = re.sub(r'size="([\d.]+) ([\d.]+) [\d.]+"', r'size="\1 \2 0.45"', tag)
            tag = re.sub(r'pos="([-\d.]+) ([-\d.]+) [\d.]+"', r'pos="\1 \2 0.45"', tag)
        statics.append(tag)
    people = []
    for i in range(n_people):
        people.append(
            f'<body name="person{i}" mocap="true" pos="0 0 -10">'
            f'<geom type="capsule" size=".20 .5" pos="0 0 .75" material="p{i}" contype="0" conaffinity="0"/>'
            f'<geom type="sphere" size=".15" pos="0 0 1.5" material="head" contype="0" conaffinity="0"/>'
            '</body>'
        )
    mats = ''.join(
        f'<material name="p{i}" rgba="{r} {g} {b} 1" specular="0.15" shininess="0.2"/>'
        for i, (r, g, b) in enumerate(PERSON_COLORS)
    )
    extra = f"""
  <visual>
    <global offwidth="1920" offheight="1080"/>
    <quality shadowsize="8192" offsamples="8"/>
    <headlight ambient="0.46 0.46 0.46" diffuse="0.32 0.32 0.32" specular="0.04 0.04 0.04"/>
    <map znear="0.02" zfar="80" shadowclip="18"/>
  </visual>
  <asset>
    <texture name="sky" type="skybox" builtin="gradient" rgb1="0.95 0.96 0.955" rgb2="0.84 0.88 0.89" width="512" height="512"/>
    <texture name="floorgrid" type="2d" builtin="flat" rgb1="0.925 0.94 0.93" width="40" height="40" mark="edge" markrgb="0.76 0.81 0.79"/>
    <material name="floor" texture="floorgrid" texrepeat="2 2" texuniform="true" reflectance="0.04"/>
    <material name="wall" rgba="0.965 0.955 0.93 1" specular="0.08"/>
    <material name="block" rgba="0.33 0.41 0.58 1" specular="0.1"/>
    <material name="head" rgba="0.90 0.86 0.80 1" specular="0.1"/>
    {mats}
  </asset>
  <worldbody>
    <light name="sun" directional="true" pos="3 -6 14" dir="0.25 0.45 -1" diffuse="0.62 0.61 0.59" specular="0.1 0.1 0.1" castshadow="true"/>
    <geom name="floor" type="plane" size="40 40 0.1" pos="4 0 0" material="floor" contype="0" conaffinity="0"/>
    {''.join(statics)}
    {''.join(people)}
  </worldbody>
"""
    xml = xml.replace('</mujoco>', extra + '\n</mujoco>')
    return mujoco.MjModel.from_xml_string(xml)


def interp_qpos(t, t_traj, q_traj):
    i = int(np.clip(np.searchsorted(t_traj, t) - 1, 0, len(t_traj) - 2))
    a = float(np.clip((t - t_traj[i]) / (t_traj[i + 1] - t_traj[i]), 0, 1))
    q = (1 - a) * q_traj[i] + a * q_traj[i + 1]
    quat = q[3:7]
    if np.dot(q_traj[i][3:7], q_traj[i + 1][3:7]) < 0:
        quat = (1 - a) * q_traj[i][3:7] - a * q_traj[i + 1][3:7]
    q[3:7] = quat / np.linalg.norm(quat)
    return q


def interp_people(t, people_t, people):
    i = int(np.clip(np.searchsorted(people_t, t) - 1, 0, len(people_t) - 2))
    a = float(np.clip((t - people_t[i]) / max(1e-9, people_t[i + 1] - people_t[i]), 0, 1))
    return (1 - a) * people[i] + a * people[i + 1]


def add_geom(scene, gtype, size, pos, rgba, mat=None):
    if scene.ngeom >= scene.maxgeom:
        return None
    g = scene.geoms[scene.ngeom]
    mujoco.mjv_initGeom(g, gtype, np.asarray(size, float), np.asarray(pos, float),
                        (np.eye(3) if mat is None else mat).flatten(), np.asarray(rgba, np.float32))
    scene.ngeom += 1
    return g


def add_segment(scene, a, b, width, rgba, gtype=mujoco.mjtGeom.mjGEOM_CAPSULE):
    if scene.ngeom >= scene.maxgeom:
        return
    g = scene.geoms[scene.ngeom]
    mujoco.mjv_initGeom(g, gtype, np.zeros(3), np.zeros(3), np.eye(3).flatten(), np.asarray(rgba, np.float32))
    mujoco.mjv_connector(g, gtype, width, np.asarray(a, float), np.asarray(b, float))
    scene.ngeom += 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('run', type=Path)
    ap.add_argument('out', type=Path)
    ap.add_argument('--speed', type=float, default=2.5)
    ap.add_argument('--fps', type=int, default=30)
    ap.add_argument('--width', type=int, default=1600)
    ap.add_argument('--height', type=int, default=900)
    ap.add_argument('--start', type=float, default=None, help='sim time to start at')
    ap.add_argument('--end', type=float, default=None)
    ap.add_argument('--stills', type=str, default='', help='comma list of sim times to save as PPM stills instead of video')
    ap.add_argument('--azimuth', type=float, default=112)
    ap.add_argument('--elevation', type=float, default=-50)
    ap.add_argument('--distance', type=float, default=7.2)
    ap.add_argument('--crf', type=int, default=24)
    args = ap.parse_args()

    world, t_traj, q_traj, people_t, people, tracks, modes = load_run(args.run)
    model = build_model(world, people.shape[1])
    data = mujoco.MjData(model)
    renderer = mujoco.Renderer(model, args.height, args.width, max_geom=4000)
    pid = [model.body(f'person{i}').mocapid[0] for i in range(people.shape[1])]
    track_t = [t for t, _ in tracks]
    goal = np.array([9.0, 0.0])

    # Clip: first motion to shortly after arrival.
    xy = q_traj[:, :2]
    moved = np.where(np.linalg.norm(xy - xy[0], axis=1) > 0.05)[0]
    arrive = np.where(np.linalg.norm(xy - goal, axis=1) < 0.35)[0]
    t0 = args.start if args.start is not None else max(t_traj[0], t_traj[moved[0]] - 1.0)
    t1 = args.end if args.end is not None else min(t_traj[-1], (t_traj[arrive[0]] + 2.5) if len(arrive) else t_traj[-1])
    print(f'clip {t0:.2f}..{t1:.2f} sim s, {(t1 - t0) / args.speed:.1f} s video')

    # Path drawn on the floor: pelvis xy with the gait sway averaged out over 1 s.
    kernel = np.ones(21) / 21
    pad = np.pad(q_traj[:, :2], ((10, 10), (0, 0)), mode='edge')
    trail = np.stack([np.convolve(pad[:, d], kernel, mode='valid') for d in (0, 1)], axis=1)

    cam = mujoco.MjvCamera()
    cam.type = mujoco.mjtCamera.mjCAMERA_FREE
    cam.azimuth, cam.elevation, cam.distance = args.azimuth, args.elevation, args.distance
    look = None

    def frame(t):
        nonlocal look
        q = interp_qpos(t, t_traj, q_traj)
        data.qpos[:] = q
        ppl = interp_people(t, people_t, people)
        for k, (x, y, _, _) in enumerate(ppl):
            data.mocap_pos[pid[k]] = [x, y, 0]
        mujoco.mj_forward(model, data)
        target = np.array([np.clip(q[0] + 0.6, 0.8, 8.0), 0.25 * q[1], 0.6])
        look = target if look is None else look + 0.06 * (target - look)
        cam.lookat[:] = look
        renderer.update_scene(data, cam)
        sc = renderer.scene
        # goal marker
        add_geom(sc, mujoco.mjtGeom.mjGEOM_CYLINDER, [0.32, 0.004, 0], [goal[0], goal[1], 0.006], [0.11, 0.17, 0.29, 0.9])
        add_geom(sc, mujoco.mjtGeom.mjGEOM_CYLINDER, [0.22, 0.005, 0], [goal[0], goal[1], 0.008], [0.94, 0.95, 0.94, 1])
        add_geom(sc, mujoco.mjtGeom.mjGEOM_CYLINDER, [0.08, 0.006, 0], [goal[0], goal[1], 0.010], [0.11, 0.17, 0.29, 1])
        # robot trail
        j = int(np.searchsorted(t_traj, t))
        pts = trail[: max(j, 1)][::2]
        for a, b in zip(pts[:-1], pts[1:]):
            add_segment(sc, [a[0], a[1], 0.012], [b[0], b[1], 0.012], 0.028, [0.75, 0.16, 0.23, 0.95])
        # LiDAR tracks at this time: footprint disc plus 1 s velocity arrow
        k = bisect.bisect_right(track_t, t) - 1
        if k >= 0:
            for tr in tracks[k][1]:
                v = np.array([tr.get('vx', 0.0), tr.get('vy', 0.0)])
                if np.linalg.norm(v) < 0.12:
                    continue  # static returns (walls, blocks) stay out of the picture
                r = float(np.clip(tr.get('radius', 0.3), 0.15, 0.7))
                add_geom(sc, mujoco.mjtGeom.mjGEOM_CYLINDER, [r, 0.003, 0], [tr['x'], tr['y'], 0.016], [0.94, 0.84, 0.29, 0.55])
                if True:
                    a = [tr['x'], tr['y'], 0.03]
                    b = [tr['x'] + v[0] * 1.2, tr['y'] + v[1] * 1.2, 0.03]
                    add_segment(sc, a, b, 0.022, [0.11, 0.17, 0.29, 0.85])
        return renderer.render()

    if args.stills:
        for s in [float(x) for x in args.stills.split(',')]:
            img = frame(s)
            p = args.out.with_name(f'{args.out.stem}-{s:05.1f}.ppm')
            with open(p, 'wb') as f:
                f.write(f'P6 {img.shape[1]} {img.shape[0]} 255\n'.encode())
                f.write(img.tobytes())
            print('wrote', p)
        return

    import imageio_ffmpeg
    writer = imageio_ffmpeg.write_frames(
        str(args.out), (args.width, args.height), fps=args.fps, codec='libx264', quality=None,
        output_params=['-crf', str(args.crf), '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
                       '-movflags', '+faststart', '-an'],
        macro_block_size=4,
    )
    writer.send(None)
    n = int((t1 - t0) / args.speed * args.fps)
    # warm the camera smoothing so the first frame is already framed
    for _ in range(60):
        frame(t0)
    for i in range(n):
        t = t0 + i * args.speed / args.fps
        writer.send(np.ascontiguousarray(frame(t)))
        if i % 150 == 0:
            print(f'frame {i}/{n}')
    writer.close()
    print('wrote', args.out)


if __name__ == '__main__':
    main()
