---
title: Predictive crowd navigation for a humanoid robot
summary: A LiDAR-to-velocity avoidance layer with multi-object tracking, crowd forecasting, and nonlinear MPC that steers HARP's walking Unitree G1 through people who do not yield.
org: HARP, Stanford Student Robotics
role: Software Engineer Lead, Human Perception & Social Interaction Team
dates: Oct. 2026 to present
order: 1
overview: HARP, the Humanoid Athletic Robotics Project at Stanford Student Robotics, is building a Unitree G1 humanoid that can work in human spaces, walking naturally, getting around obstacles, finding people, and approaching them. Every command reaches the motors through HARP's safety harness and runs in MuJoCo first; walking comes from NVIDIA's GR00T locomotion policy.
contribution: I lead navigation for the Human Perception & Social Interaction Team. My current work is a predictive avoidance layer between the route planner and the walking policy. It turns raw LiDAR into tracked, forecast obstacles, then uses a nonlinear model predictive controller (NMPC) to choose the G1's body-frame velocity request five times a second. Before this I built the team's waypoint routes, manual takeover, odometry route recorder, and speed and turn ramping.
claim: A sampled-and-refined NMPC can steer a walking G1 through moving, non-yielding pedestrians without contact, using only its own LiDAR tracks and never simulator ground truth.
result: 7 of 7 native G1 crowd trials with zero contacts across adversarial and mixed crowds, static pillars, and 1.5× pedestrian flow, up from 2 of 5 before the least-intrusion fallback. 115 local tests pass.
highlight: 7 of 7 native G1 crowd trials with zero contacts
limit: Simulation with synthetic crowds only; the Foxy, Nav2, and HIM integration and real hardware are not yet validated. In the newer building world, mixed crowds reach the goal on some seeds, and adversarial crowds still cause contacts.
stack: [Python, ROS 2, MuJoCo, SciPy (SLSQP), NumPy, Nav2, Docker]
specs:
  - label: Control rate
    value: 5 Hz, 0.15 s planning deadline
  - label: Horizon
    value: 4 s, three velocity blocks
  - label: Control
    value: Body-frame forward, lateral, and yaw rate
  - label: Solver
    value: Sampled candidates refined by SLSQP
  - label: Forecast
    value: Constant velocity, bounded uncertainty
  - label: Robot
    value: Unitree G1, 29 DoF, GR00T walker
links:
  - label: 'Branch: lam/predictive-avoidance'
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/tree/lam/predictive-avoidance
  - label: Team repository
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction
  - label: 'PR #2: waypoint routes and safeguards'
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/2
  - label: 'PR #5: route recorder and speed smoothing'
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/5
  - label: 'PR #6: odometry guards and turn ramps'
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/6
  - label: 'PR #7: input gating and failure handling'
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/7
showcase: harp
sources:
  - HARP branch lam/predictive-avoidance (context/predictive-avoidance.md, context/native-crowd.md, submission/harp/SFM_NMPC_REFERENCE.md, predictive_mpc.py)
  - 'Local HARP runs, crowd-least-intrusion-20261101T083948Z (7/7 suite) and building-suite-20261101T092032Z (replayed run, building-mixed-seed3)'
  - HARP PR #2, #5, #6, #7 descriptions
  - HARP social-interaction README (team context)
---

## The problem

People in a hallway do not wait for a robot. A humanoid also responds slowly: in native trials the walking G1 moved about 0.21 m/s sideways for a 0.35 m/s request, with forward response faster than lateral. Stopping is not automatically safe either. In an earlier version of this controller, every traced crowd contact began with the planner frozen in place while a non-yielding pedestrian walked into it.

So the controller has to predict where people will be, plan around the robot's real response, and still pick the least harmful action when no option is certifiably safe.

## How it works

1. **Perception.** LiDAR returns are motion-compensated with stamped transforms, floor and self points are removed, and the rest is grouped into voxel clusters.
2. **Tracking.** Clusters are matched to tracks by joint Hungarian assignment, with motion-seeded splitting of merged returns. Tracks coast for 2.5 s through occlusion, and expired obstacles are remembered as occupied surface cells rather than forgotten.
3. **Forecast.** Each track is extended at constant velocity with bounded uncertainty inflation. The model does not assume that people will cooperate.
4. **NMPC.** Three velocity blocks span a 4 s horizon in body-frame forward, lateral, and yaw rate. Rollouts start from measured velocity and include acceleration limits, response delay, and separate forward and lateral tracking gains. Sampled passing and turning candidates are refined with SLSQP, and swept-disc checks with a braking tail test every candidate against the forecast. The cost rewards progress toward the goal, request tracking, a stable passing side, and clearance. Only the first request runs before the next replan.
5. **Fallback.** If even braking is not certifiably clear, standing still is scored like every other candidate by time-discounted, integrated intrusion, and the least intrusive motion runs with an alert. Zero is chosen only when no motion reduces predicted intrusion by at least 10%.
6. **Integration.** The filter runs at 5 Hz between Nav2 and the walker, with a 0.15 s planning deadline. Stale or malformed input, or a planning failure, sends zero.

The NMPC is an independent implementation informed by the velocity-block objective and nonlinear planar rollout of [PIC4SeR/sfm-nmpc](https://github.com/PIC4SeR/sfm-nmpc); no upstream code is copied.

## Measured results

| Check | Result |
|---|---|
| Native G1 crowd suite (seven pedestrians, GR00T walker) | 7 of 7 pass with zero contacts: adversarial seeds 2 and 3, mixed seeds 1 and 2 (with pillars), and 1.5× flow; 26.4 to 43.7 s to goal |
| Before the least-intrusion fallback | 2 of 5 pass; every traced contact began with the planner frozen |
| Longest standstill in the passing suite | 2.70 s or less |
| Local tests | 115 pass, including live ROS DDS input loss and recovery |
| Planar MuJoCo scenarios | 4 of 4 pass (ideal odometry, circular footprints) |
| Replayed building run (mixed crowd, seed 3) | Goal reached in 64.7 s, 0.18 m from target, zero contacts, longest standstill 2.05 s |

Trials pass only with zero contacts, arrival, a stable G1, every pedestrian observed moving, early progress, and no standstill over 8 s, so waiting until the crowd leaves cannot pass.

## Earlier merged work

- **[PR #2](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/2): waypoint routes and runtime safeguards.** Validated route files and repeated laps, bounded goal handling, and a manual takeover that pauses and later resends the current waypoint. A recorded run completed all six visits over three laps after an 8.2 s takeover with zero contacts; 127 tests and 195 subtests pass.
- **[PR #5](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/5): route recorder and speed smoothing.** Records positions and headings from ROS 2 odometry into reusable routes, and ramps straight-walk speed down near the target. 27 tests pass.
- **[PR #6](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/6): planned-move guards.** Holds zero until odometry is valid and aborts after 0.5 s without it, measures signed progress along the start heading with drift limits, and ramps turn rate near the target angle. 42 tests pass.
- **[PR #7](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/7): input gating and failure handling.** Holds Nav2 output at zero until LiDAR, its transform, and speed feedback are valid, decodes padded and big-endian point clouds, latches zero after a failed route, and bounds the controller. 59 tests pass, including three C++17 tests.

## Limits

- All results are from simulation. The crowds are synthetic kinematic agents, not articulated humans or recorded human data.
- Seven passing runs do not establish robustness to arbitrary crowds; more seeds, denser flow, and occupied goals are untested.
- The building world with doorways and a hallway is in progress. Some seeds time out, and adversarial crowds still produce contacts there.
- The full Docker, Foxy, Nav2, and HIM stack and physical deployment remain unvalidated.

## Team context

The G1 platform, HARP's safety harness and simulator, NVIDIA's GR00T walking policy, and the Nav2 setup are team and partner infrastructure; teammates moved the stack onto the harness. The video and the run explorer on this page replay a recorded native MuJoCo trial; walls are cut away to 0.9 m in the video so the robot stays visible.
