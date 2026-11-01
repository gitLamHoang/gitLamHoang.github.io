# HARP run replay

Regenerates the hero video and the run explorer data from one recorded native G1 trial. Nothing is simulated here: every robot joint angle and pedestrian position comes from the run's own logs (`world.xml`, `trajectory.jsonl`, `events.jsonl`).

Needs a local HARP checkout with its `runs/` directory and Unitree's `unitree_mujoco` models (set `HARP_G1_XML` if they are not under `~/harp`).

```bash
uv venv .venv --python 3.12
uv pip install --python .venv/bin/python "mujoco==3.17.0" "numpy<3" "imageio-ffmpeg==0.6.0"

RUN=~/harp/stanford-harp-social-interaction/runs/building-suite-20261101T092032Z/building-mixed-seed3
.venv/bin/python replay.py "$RUN" ../../public/media/harp-crowd-replay.mp4 --width 1600 --height 900 --speed 2.5 --crf 27
.venv/bin/python export_run.py "$RUN" ../../src/data/harp-crowd-run.json
```

The video draws walls at 0.9 m (true height 2 m) so the robot is never hidden, shows only moving LiDAR tracks, and smooths the floor path over 1 s to remove gait sway. The site says so next to the video.
