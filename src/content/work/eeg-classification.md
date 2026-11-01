---
title: EEG classification on people the model never saw
summary: An auditable EEG pipeline, from verified public recordings to predictions on held-out participants.
role: Machine Learning Researcher, HUST (prototype); public benchmark later
dates: Started 2024, public benchmark 2026
order: 3
claim: Spectral features separate eyes-open from eyes-closed EEG recordings in participants the model never saw during training or selection.
result: 79.9% balanced accuracy on 22 unseen participants (95% CI 72.7 to 86.2), against 50.0% for a majority-class baseline.
highlight: 79.9% balanced accuracy
limit: Offline evaluation within one dataset. Baseline run order is fixed, so condition and run effects are confounded.
stack: [Python, MNE, SciPy, scikit-learn]
links:
  - label: Repository
    href: https://github.com/gitLamHoang/Classfying-brain-wave-state
  - label: Experiment protocol
    href: https://github.com/gitLamHoang/Classfying-brain-wave-state/blob/main/docs/real_eeg_benchmark.md
figure:
  src: ../../assets/work/eeg-benchmark.png
  alt: Grouped model-selection scores and the confusion matrix on the held-out participants.
  caption: Grouped model selection, then one final evaluation on 22 held-out participants.
sources:
  - gitLamHoang/Classfying-brain-wave-state README (PhysioNet benchmark)
  - Current CV (HUST role, 2026 public-data continuation)
---

## The problem

EEG windows from the same person are correlated. A random row split lets a model see the test participants during training, which makes it look more useful than it is. This project keeps participants separate through model selection and evaluation.

It started as a single-channel hardware and machine learning prototype at Hanoi University of Science and Technology in 2024, with guidance from Professor Trinh Van Chien. The public benchmark is a later engineering extension using PhysioNet's EEG Motor Movement/Imagery Dataset.

## What I built

- Verified acquisition: concurrent downloads with retries and atomic writes, checked against the publisher's SHA-256 hashes.
- Fixed signal processing with MNE and SciPy, Welch spectra, and an explicit quality-control audit.
- 512 spectral features per window from 64 channels. Participant, condition, run, and time metadata are excluded from the predictors.
- Grouped selection over eight fixed candidates (dummy, logistic regression, RBF SVM, random forest) with five participant-disjoint folds and training-only scaling.
- A versioned model artifact with its exact feature schema, input hashes, and a schema-checked batch prediction CLI.

## Measured results

| Step | Result |
|---|---|
| Data kept | 3,052 windows from 109 participants (218 recordings, 64 channels) |
| Model selection | RBF SVM (C = 1), chosen using only the 87 training participants |
| Final holdout | 79.9% balanced accuracy on 22 unseen participants (616 windows) |
| Baseline | 50.0% for the majority class |
| Uncertainty | 95% participant-cluster bootstrap interval 72.7% to 86.2% (2,000 resamples) |

## Limits

- Same-dataset, offline evaluation. Participant separation does not establish validity across devices or datasets.
- Baseline run order is fixed, so condition and run effects are confounded.
- Zero-phase filtering uses future samples within each recording, and the quality checks do not remove every physiological artifact.
- The experiment supports no diagnosis, sleep-detection, or live-streaming claim.
