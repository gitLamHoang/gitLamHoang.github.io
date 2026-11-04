---
title: Physics-based EKF and control for an AUV
summary: A custom extended Kalman filter and model-based control for Stanford RoboSub's eight-thruster AUV, built on the vehicle's underwater equations of motion instead of a constant-velocity guess.
org: Stanford AUV, Stanford Student Robotics
role: Software Engineer
dates: Sep 2026 - Present
order: 2
overview: Stanford Student Robotics' RoboSub team builds an eight-thruster autonomous underwater vehicle that runs ROS 2 Humble on a Jetson AGX Orin. Each tick, an Xsens IMU, a Doppler velocity log (DVL), a depth sensor, and a camera heading correction feed an EKF; six PID loops compare its estimate with the mission's desired pose at 60 Hz; and a pseudo-inverse splits the resulting wrench across the eight thrusters. Today both the filter and the controller treat the sub as a body with no water physics.
contribution: I'm building the water physics into both. I'm deriving the vehicle's underwater equations of motion after Fossen, writing a custom EKF whose prediction step integrates them from the commanded thrust, fitting the hydrodynamic coefficients from logged runs, and adding model-based control on top of the PID. Before this I traced the whole sense-to-thruster pipeline from source and wrote the mission route for the team's 1 November pool test.
claim: A filter and controller that know how the sub moves through water should drift less between DVL updates and track the mission more closely than a constant-velocity filter and six independent PID loops.
result: 'No measurements yet. Reading the source found what the project fixes: the filter predicts with no thrust, drag, or added mass; the IMU''s turn rate is never used; the PID''s D term subtracts a body-frame velocity from a world-frame one; and the simulator''s hydrodynamic coefficients are unsourced guesses.'
limit: In progress. The derivation and the new filter are being written, and nothing has run in simulation or on the vehicle, so there is no drift or tracking result yet. Every finding above comes from reading code, not from a bag or a pool run.
stack: [Python, ROS 2, NumPy, Gazebo]
method:
  - "Models the sub with Fossen's marine-craft equations, M ν̇ + C(ν)ν + D(ν)ν + g(η) = τ: rigid-body and added-mass inertia, drag, Coriolis terms, and buoyancy, in the repository's x-forward, y-left, z-up frames."
  - "Replaces robot_localization's constant-velocity prediction with a custom EKF that integrates those dynamics from the commanded wrench, fusing the IMU's orientation and turn rate, the DVL's body-frame velocity with its lever arm, depth, and the camera's absolute heading."
  - "Fits about 20 added-mass and drag coefficients by least squares from logged runs, in one file shared with the Gazebo simulator in place of its guessed values."
  - "Adds model feedforward to the six 60 Hz PID loops, then inverse dynamics, where the PID chooses an acceleration and the model turns it into a wrench, with gains set from natural frequency and damping; every quantity carries its frame."
  - "Validates offline before the pool: Jacobians unit-tested against numerical derivatives, recorded thrust replayed through the model against measured velocity, simulator ground truth, then bagged pool runs before and after on the team's localization stress-test mission."
  - "Before this: wrote the mission route for the 1 November pool test, a submerge, a gate pass with a 23° roll, and two spins."
specs:
  - label: Vehicle
    value: Eight thrusters, Jetson AGX Orin, ROS 2 Humble
  - label: Sensors
    value: Xsens IMU, DVL, depth sensor, camera heading correction
  - label: Control
    value: Six PID loops at 60 Hz, pseudo-inverse thrust allocation
  - label: Model
    value: Fossen marine-craft equations, about 20 fitted coefficients
  - label: Interfaces kept
    value: /odometry/filtered, odom to base_link, /set_pose; stock filter selectable
links:
  - label: Team repository
    href: https://github.com/Stanford-AUV/RoboSub
  - label: 'Branch: lam_planning_for_11_01 (pool-test route)'
    href: https://github.com/Stanford-AUV/RoboSub/tree/lam_planning_for_11_01
figure:
  src: ../../assets/work/auv-pipeline.png
  alt: The sub's software loop as a diagram. The Xsens IMU, DVL, depth sensor, and camera feed the EKF; the EKF's estimate and the mission player's desired pose feed the PID; the PID's wrench goes to thrust allocation, motor signals, and the Arduino that drives eight motors. The EKF and the PID are highlighted.
  caption: The sub's loop today. The two highlighted pieces, the EKF and the PID, are the ones this project rebuilds.
  fit: contain
sources:
  - SSR - Robosub/EKF-PID project 1 - overview.md (source reading of Stanford-AUV/RoboSub at b0b3a26, 2 November 2026; architecture, weaknesses, deliverables, validation order)
  - SSR - Robosub/EKF-PID project 2 - fundamentals.md (dynamics, estimation, control tiers, testing)
  - SSR - Robosub/AGENTS.md (vehicle, ROS 2 Humble, Jetson AGX Orin, pipeline)
  - Stanford-AUV/RoboSub branch lam_planning_for_11_01, commits ca82475 and cbf0689 (planning_11_01.yaml)
  - SSR - Robosub/robosub_software_pipeline.png (figure, cropped above its legend)
  - Stanford Student Robotics welcome card, Harvey Phan, 2026 - 2027, Stanford AUV
---

## The loop today

The sub senses, estimates, decides, and acts many times a second. Its estimate comes from
`robot_localization`'s EKF, which predicts between sensor readings as if the sub kept moving as it
was: no thrust, no drag, no water carried along with the hull. Six PID loops then push on x, y, z,
roll, pitch, and yaw as if those directions were independent, with buoyancy handled by one constant
fitted by hand.

## What I'm building

- **A model of the vehicle.** The marine-craft equations of motion, M ν̇ + C(ν)ν + D(ν)ν + g(η) = τ,
  written in the repository's frames, with the derivation and Jacobians kept next to the code.
- **A filter that knows the physics.** A custom EKF whose prediction step integrates that model from
  the commanded wrench, and whose measurement models handle the DVL's lever arm and the IMU's turn
  rate.
- **Coefficients from data.** About 20 added-mass and drag numbers fitted by least squares from
  logged runs, shared with the simulator.
- **Control on the model.** Feedforward from the model on top of the PID first, then inverse
  dynamics, with gains chosen from a target natural frequency and damping.

## How it will be checked

Offline first: each Jacobian against a numerical derivative, recorded thrust replayed through the
model against measured velocity, and the simulator's ground truth. Then pool runs on the team's
localization stress-test mission, bagged before and after.

## Where it stands

The work is in progress. No new filter or controller has run in simulation or on the vehicle, so
there is no result to report yet. The findings above come from reading the code, and each needs a
bag or bench check before it is relied on.
