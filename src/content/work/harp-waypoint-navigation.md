---
title: Waypoint navigation for a humanoid robot
summary: Repeatable routes, laps, and a safe handoff to a human operator for HARP's Unitree G1, built and tested in simulation.
role: Software Engineer Lead, HARP Human Perception & Social Interaction Team
dates: Oct. 2026 to present
order: 1
claim: The Unitree G1 can follow configurable waypoint routes and repeated laps in simulation, with manual takeover and runtime safeguards.
result: Two merged pull requests. In a recorded simulator run, the robot completed all six waypoint visits over three laps after an 8.2-second manual takeover, with zero contacts.
highlight: all six waypoint visits over three laps
limit: These are simulator measurements, not hardware guarantees. Physical robot runs are untested, and the new speed ramp is tested only against a synthetic point-mass model.
stack: [Python, ROS 2, Nav2, MuJoCo, Docker]
links:
  - label: 'PR #2: waypoint routes and safeguards'
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/2
  - label: 'PR #5: route recorder and speed smoothing'
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/5
  - label: Team repository
    href: https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction
  - label: Contribution tour
    href: https://github.com/gitLamHoang/gitLamHoang/blob/main/TOUR.md
routeFigure: true
sources:
  - HARP PR #2 and PR #5 descriptions and file lists
  - gitLamHoang/gitLamHoang README.md and TOUR.md
  - HARP social-interaction README (team context)
---

## The problem

HARP's Human Interaction subteam at Stanford Student Robotics wants a robot that moves like a person, gets around obstacles, and walks up to people. The robot is a Unitree G1 EDU with 29 joints. Team code reaches the motors only through HARP's safety harness, and everything runs in a MuJoCo simulator first.

Course tests need routes the robot can walk again and again, and an operator has to be able to take over at any moment and hand control back without losing the run.

## What I built

**Waypoint routes and runtime safeguards** ([PR #2](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/2))

- Route files and repeated `--waypoint X Y [HEADING]` arguments share one validated input, with a `--laps` option. Only a confirmed arrival advances progress, and goal submission and cancellation are bounded.
- Manual takeover confirms that navigation is cancelled and pauses the current waypoint. Handing control back resends that target with its remaining execution budget.
- The walker rejects non-finite control, state, and policy values, and telemetry failures can no longer bypass damping.
- Navigation requires fresh sensor data in both costmaps before it moves, and run records are written atomically.

**Route recorder and speed smoothing** ([PR #5](https://github.com/Humanoid-Athletic-Robotics-Project-HARP/social-interaction/pull/5))

- An interactive tool records positions and headings from ROS 2 odometry, supports undo, and saves reusable route files.
- Straight-distance walks ramp their speed requests and slow near the target. Completion and timeout still request zero speed immediately.

## Measured results

| Check | Result |
|---|---|
| Automated tests, PR #2 | All nine packages build; 127 tests and 195 subtests pass |
| Recorded three-lap run | All six visits completed after an 8.2-second manual takeover, zero contacts or recoveries |
| Fault trial | After relay loss, a zero-velocity request followed in 1.443 s, with no later nonzero requests |
| Stop button (B) | Triggered the walker stop event in 4.364 ms |
| Automated tests, PR #5 | 27 tests pass, including recorder capture, undo, save, and the speed-profile checks |

## Limits

- Every number above comes from simulation or local tests. Physical robot operation and real bag replay are untested.
- The PR #5 changes have not yet run in the team's Docker image or in the full GR00T simulation.
- The speed-profile test uses a synthetic point-mass response, not the real walking policy.

## Team context

The G1 platform, HARP's safety harness and simulator, NVIDIA's GR00T walking policy, and the Nav2 setup are team and partner infrastructure. My work sits on top of them. The route field on this site illustrates the controller behavior in the browser; it is not robot data.
