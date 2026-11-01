---
title: Cross-subject EEG state classification
summary: An auditable EEG pipeline, from hash-verified public recordings to predictions on participants the model never saw.
org: Hanoi University of Science and Technology
role: Machine Learning Researcher
dates: 2024 prototype; public benchmark 2026
order: 3
overview: Classifying mental or physiological state from EEG is a core brain-computer interface problem, and the hard part is generalizing to new people. Windows from the same person are correlated, so a random split leaks subjects into the test set and inflates accuracy. This project keeps participants separate from feature extraction to final evaluation, on PhysioNet's 109-subject EEG Motor Movement/Imagery dataset.
contribution: I started the work in 2024 as a single-channel hardware and machine learning prototype at Hanoi University of Science and Technology, with guidance from Professor Trinh Van Chien. I later rebuilt it as a reproducible multichannel benchmark with verified acquisition, 512 spectral features, participant-grouped model selection, a sealed holdout, and versioned model artifacts.
claim: Spectral features separate eyes-open from eyes-closed EEG recordings in participants the model never saw during training or selection.
result: 79.9% balanced accuracy on 22 unseen participants (95% CI 72.7 to 86.2), against 50.0% for a majority-class baseline.
highlight: 79.9% balanced accuracy
limit: Offline evaluation within one dataset. Baseline run order is fixed, so condition and run effects are confounded.
stack: [Python, MNE, SciPy, scikit-learn]
specs:
  - label: Data
    value: 3,052 windows, 109 participants, 64 channels
  - label: Features
    value: 512 Welch-spectrum features per window
  - label: Selection
    value: 8 candidates, 5 participant-disjoint folds
  - label: Uncertainty
    value: 2,000-sample participant-cluster bootstrap
links:
  - label: Repository
    href: https://github.com/gitLamHoang/Classfying-brain-wave-state
  - label: Experiment protocol
    href: https://github.com/gitLamHoang/Classfying-brain-wave-state/blob/main/docs/real_eeg_benchmark.md
figure:
  src: ../../assets/work/eeg-benchmark.png
  alt: Grouped model-selection scores and the confusion matrix on the held-out participants.
  caption: Grouped model selection, then one final evaluation on 22 held-out participants.
  fit: contain
sources:
  - gitLamHoang/Classfying-brain-wave-state README (PhysioNet benchmark)
  - Current CV (HUST role, 2026 public-data continuation)
---

## The problem

EEG windows from the same person are correlated. A random row split lets a model see the test participants during training, which makes it look more useful than it is. This project keeps participants separate through model selection and evaluation, then packages the selected model with its exact feature schema and provenance.

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
