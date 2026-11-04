---
title: Predictive crowd navigation for a humanoid robot
summary: A LiDAR-to-velocity avoidance layer for HARP's walking Unitree G1, with tracking, crowd forecasting, and a game-theoretic planner that steers through people in simulation.
org: HARP, Stanford Student Robotics
role: Software Engineer Lead, Human Perception & Social Interaction Team
dates: Oct 2026 - Present
order: 1
overview: HARP, the Humanoid Athletic Robotics Project at Stanford Student Robotics, is building a Unitree G1 humanoid that can work in human spaces, walking naturally, getting around obstacles, finding people, and approaching them. Every command reaches the motors through HARP's safety harness and runs in MuJoCo first; walking comes from NVIDIA's GR00T locomotion policy.
contribution: "I lead navigation for the Human Perception & Social Interaction Team. My current work is a predictive avoidance layer between Nav2's route and the walking policy. It turns LiDAR and the head depth camera into tracked people, then plans the G1's body-frame velocity five times a second. On my branch the planner is now a game-theoretic core, after BRNE (Sun et al., IJRR 2024); the earlier sampling MPC is on main as an opt-in (PR #15) and stays selectable. Before this I built the team's waypoint routes, manual takeover, odometry route recorder, and speed and turn ramping."
claim: Planning with the crowd as players, rather than forecasting everyone straight on, gets the G1 to goals on worlds it has never seen, where the sampling MPC stops short.
result: 'On four held-out worlds made before any run, the game core reached the goal in 3 of 4 runs and the sampling MPC in 0 of 4, with 0 contacts for both (commit 48d8ab7). In the newest suite, 10 runs at commit 7ce8c00, it reached the goal in 5 of 10, passed every check in 2 of 10, and had 1 contact.'
highlight: reached the goal in 3 of 4 runs and the sampling MPC in 0 of 4
stat:
  value: '3 of 4'
  label: unseen worlds reached by the game core, against 0 of 4 for the sampling MPC
limit: Simulation only, at a 0.5 m/s test speed with walkers who give way; it has not run on the robot. In the held-out comparison no run kept the 0.30 m clearance rule, and the newest committed code (3a87d78) has unit tests but no simulator run of its own.
stack: [Python, ROS 2, Nav2, MuJoCo, NumPy, SciPy, Docker]
specs:
  - label: Control rate
    value: 5 Hz, 0.15 s planning deadline
  - label: Planner
    value: Game-theoretic core (after BRNE); sampling MPC selectable
  - label: Game
    value: About 260 robot paths, 32 per person, 8 nearest people within 5 m, six rounds of best responses
  - label: Safety
    value: Clear of straight-line forecasts for 1.2 s, with a 2.5 s plan B
  - label: Sensing
    value: LiDAR and head depth camera, multi-object tracking
  - label: Robot
    value: Unitree G1, 29 DoF, GR00T walker
links:
  - label: 'Branch: lam/predictive-avoidance (game core)'
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/tree/lam/predictive-avoidance
  - label: 'PR #15: predictive avoidance, opt-in on main'
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/15
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
  - HARP branch lam/predictive-avoidance at 3a87d78 (context/predictive-avoidance.md, harp/game_planner.py; commits a3a444c, b4ae890, 40f5d0a, 586c0ae, 3a87d78)
  - 'Local HARP runs, Nov 3: oneshot37 (four held-out worlds committed in 48d8ab7, game core vs sampling MPC), ab46 and ab47 (newest suite, commit 7ce8c00), each summary.json; .design-loop/harp-status-2026-11-03.md re-derives every tally'
  - HARP PR #15 description (eight held-out one-shots, sampling MPC vs reactive)
  - 'Earlier native-sim runs, Nov 1: crowd-least-intrusion-20261101T083948Z (7 of 7, commit 94c78f6), g1-final-20261101T115643Z (7 of 9), building-suite-20261101T092032Z (replayed run, building-mixed-seed3)'
  - HARP PR #2, #5, #6, #7 descriptions; HARP social-interaction README (team context)
---

## The problem

People in a hallway do not wait for a robot. A humanoid also responds slowly: in the Nov 1 native trials the walking G1 moved about 0.21 m/s sideways for a 0.35 m/s request. And forecasting every person as walking straight on, never reacting, makes a crowd look like a wall: standing, turning, and walking all read as collisions, and the robot freezes.

So the planner has to treat people as agents who react, plan around the robot's real response, and still pick the least harmful action when no option is clear.

## How it works

1. **Perception.** LiDAR returns are motion-compensated with stamped transforms, floor and self points are removed, and the rest is grouped into clusters. Since Nov 2 the head depth camera covers the floor and legs about 0.3 to 2.7 m ahead, where the LiDAR's head shadow leaves gaps.
2. **Tracking.** Clusters are matched to tracks by joint Hungarian assignment, and tracks coast through occlusion. Only objects that actually moved leave Nav2's map, and a track counts as moving only while it is away from where it was first seen.
3. **The game.** The robot and the 8 nearest people within 5 m are players. The robot gets about 260 candidate paths near Nav2's request and each person 32; six rounds of Bayesian best responses settle on a joint plan. People react after 0.5 s, the robot keeps right when meeting someone head-on, and the choice is risk-sensitive (CVaR).
4. **Safety.** The chosen request must keep the body clear of straight-line forecasts for 1.2 s, judged after the 0.2 s delay, and leave a plan B that keeps a comfort gap for 2.5 s. If no request can, the least violation runs.
5. **Integration.** The filter runs at 5 Hz between Nav2 and the walker, with a 0.15 s planning deadline. Stale or malformed input, or a planning failure, sends zero.

The game core is written from the BRNE paper (Sun et al., IJRR 2024). The older sampling MPC stays selectable with `HARP_PREDICTIVE_PLANNER=mpc`: three velocity blocks over a 4 s horizon, sampled candidates refined with SLSQP, swept-disc checks, and a least-intrusion fallback. It is an independent implementation informed by [PIC4SeR/sfm-nmpc](https://github.com/PIC4SeR/sfm-nmpc), and it is the planner in the replayed run above.

## Measured results

| Check | Result |
|---|---|
| Four held-out worlds, made before any run (commit 48d8ab7) | Game core reached the goal in 3 of 4 (78.2, 95.2, and 122.0 s; the last is over the 120 s limit), sampling MPC in 0 of 4; 0 contacts for both; 0 of 8 passed every check, with closest passes of 0.19 to 0.29 m |
| Newest suite: atrium and the next four held-out worlds, 10 runs (commit 7ce8c00) | Reached 5 of 10 (atrium 2 of 6, held-out 3 of 4), passed every check 2 of 10, 1 contact |
| PR #15's eight held-out worlds, sampling MPC against main's reactive filter | MPC reached 4 of 8, passed 0 of 8, 2 contacts; reactive reached 3 of 8, passed 2 of 8, 0 contacts |
| 90 generated worlds in the planner benchmark, walkers who give way (no full simulator) | MPC to game core: passed every check 6 to 20, reached 80 to 83, median time 50 to 45 s; with walkers who never react, contacts the robot caused 47 to 38 |
| Unit tests | 209 passed on the merged main (c123e2b); the branch tip (3a87d78) has 223, not yet run as a full suite |

A run passes only when the goal is reached inside its time limit, the closest pass to people and walls is at least 0.30 m, there are no contacts and at most three recoveries, and the robot ends within 0.35 m of the goal. Walkers are movers the simulator's physics does not see, so contacts and clearance are scored offline from the logged paths.

### Earlier work, Nov 1, native MuJoCo simulator (since removed)

| Check | Result |
|---|---|
| Crowd suite, earlier planner (commit 94c78f6) | 7 of 7 passed with zero contacts across five scenarios (adversarial seed 2 three times), 26.4 to 43.7 s to goal; 115 local tests passed |
| Crowd suite after the Nov 1 rework | 7 of 9 passed (17.9 to 45.1 s); the two failures each met a non-yielding walker |
| Replayed building run (mixed crowd, seed 3) | Goal reached in 64.7 s, 0.18 m from target, zero contacts; the only pass among the four completed trials of its suite |

The native simulator and its harness were removed on Nov 2, when testing moved to the team's harness, so these runs cannot be repeated.

## Earlier merged work

- **[PR #15](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/15): predictive avoidance, opt-in.** Puts the sampling MPC on main behind `--avoidance predictive` (simulation only; hardware is rejected), with crowd and held-out worlds, scoring, and Nav2 start-up fixes. Main's default filter is unchanged.
- **[PR #2](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/2): waypoint routes and runtime safeguards.** Validated route files and repeated laps, bounded goal handling, and a manual takeover that pauses and later resends the current waypoint. A recorded run completed all six visits over three laps after an 8.2 s takeover with zero contacts; 127 tests and 195 subtests pass.
- **[PR #5](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/5): route recorder and speed smoothing.** Records positions and headings from ROS 2 odometry into reusable routes, and ramps straight-walk speed down near the target. 27 tests pass.
- **[PR #6](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/6): planned-move guards.** Holds zero until odometry is valid and aborts after 0.5 s without it, measures signed progress along the start heading with drift limits, and ramps turn rate near the target angle. 42 tests pass.
- **[PR #7](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/7): input gating and failure handling.** Holds Nav2 output at zero until LiDAR, its transform, and speed feedback are valid, decodes padded and big-endian point clouds, latches zero after a failed route, and bounds the controller. 59 tests pass, including three C++17 tests.

## Limits

- All results are from simulation, at a 0.5 m/s test speed, with walkers who give way unless noted. The planner has not run on the robot; planning time on the Jetson and the real G1's sidestep response are unmeasured.
- Samples are small, 4 to 10 runs per suite, and the simulator varies from run to run. The four worlds of the newest suite had been seen once before, so it is not a one-shot test.
- Clearance is the open problem: most runs pass a person or a wall closer than the 0.30 m rule, and in the 90-world benchmark 60 of 90 runs pass a person under 0.30 m for every setting tried.
- The game core has not reached the office world's goal in any valid run.
- The newest committed code (3a87d78) re-implements the rule the newest suite ran from a working-tree change; it has unit tests but no simulator run of its own.

## Team context

The G1 platform, HARP's safety harness and simulator (HIM), NVIDIA's GR00T walking policy, and the Nav2 setup are team and partner infrastructure. The video and the run explorer replay a native MuJoCo trial from Nov 1, before testing moved to HIM's harness; walls are cut away to 0.9 m in the video so the robot stays visible.
