---
title: Hourly taxi demand forecasting for New York City
summary: One-hour-ahead pickup forecasts for all 262 NYC Taxi Zones under a strict no-leakage contract, with walk-forward evaluation and an interactive explorer.
org: Independent project
role: Sole developer
dates: '2026'
order: 4
overview: Demand forecasts decide where vehicles should be before riders ask for them. This project forecasts yellow-taxi pickups for every NYC Taxi Zone one hour ahead. At the start of hour t it may use only observations through hour t − 1, and evaluation walks forward in time so no model ever sees its own future.
contribution: I built it end to end. That covers acquisition and source hashing for 23.3 million trips, past-only feature engineering, gradient-boosted and baseline models, walk-forward evaluation with matched-control ablations, a FastAPI inference prototype, and a TypeScript map explorer that runs from a committed snapshot.
claim: A boosting model on past-only features forecasts hourly pickups per zone better than a weekly baseline.
result: MAE 3.693 vs 5.104 (27.65% lower) over 559,370 zone-hours of walk-forward validation.
highlight: MAE 3.693 vs 5.104
stat:
  value: '3.693'
  label: mean absolute error, against 5.104 for a weekly baseline
limit: Boosting is worse on sparse-zone MAE in every month, and no live data feed exists.
stack: [Python, SQL, FastAPI, TypeScript, SVG]
method:
  - "Forecasts yellow-taxi pickups for all 262 NYC Taxi Zones one hour ahead; at the start of hour t the model may use only observations through hour t − 1."
  - "Acquired and hashed 23.3 million trips from Dec. 2025 to May 2026, engineered past-only features, and trained gradient-boosted models against baselines."
  - "Evaluates walk-forward over an expanding history with May sealed, with matched-control ablations on delay, XGBoost depth, borough, and weather."
  - "Ships a FastAPI inference prototype and a TypeScript map explorer that runs from a committed snapshot."
specs:
  - label: Data
    value: 23,263,775 pickups, Dec. 2025 to May 2026
  - label: Target
    value: Pickups per zone-hour, 262 zones
  - label: Validation
    value: Walk-forward, expanding history; May sealed
  - label: Ablations
    value: Delay, XGBoost depth, borough, weather
links:
  - label: Live demo
    href: https://gitlamhoang.github.io/nyc-mobility-intelligence/
  - label: Repository
    href: https://github.com/gitLamHoang/nyc-mobility-intelligence
figure:
  src: ../../assets/work/nyc-explorer.png
  alt: The historical demand explorer, with a zone map of New York and an hourly trace for one neighborhood.
  caption: The explorer runs from a small committed snapshot, with no login or API key.
  href: https://gitlamhoang.github.io/nyc-mobility-intelligence/
sources:
  - gitLamHoang/nyc-mobility-intelligence README
---

## The problem

At the start of each hour, predict yellow-taxi pickups in every NYC Taxi Zone using only observations through the previous hour. The target is recorded pickups, not all travel or unmet demand, and every one of the 262 zones counts, including its zero-demand hours.

## What I built

- Acquisition and hourly aggregation of 23,263,775 accepted pickups from December 2025 through May 2026, with source hashes for every file.
- Past-only features, models, walk-forward evaluation, and a local FastAPI inference prototype in Python.
- SQL borough summaries checked against the demo export.
- A TypeScript and SVG explorer: compare three forecast methods, inspect a zone's 48-hour trace, find the largest misses, and download CSVs.

## Measured results

| Comparison | Result | Main limit |
|---|---|---|
| Walk-forward validation, 559,370 zone-hours | MAE 3.693 vs 5.104 for the weekly baseline, 27.65% lower | Worse on sparse-zone MAE in every month |
| Six-hour observation delay | MAE 22.94% higher than the matched zero-delay control | Assumes historical counts; no live feed exists |
| XGBoost, depth 6 | MAE 0.76% lower than the matched temporal control | RMSE increases slightly |
| Borough context | MAE 0.416% lower than the matched temporal control | Sparse-zone and zero-target errors worsen every month |
| Weather inputs | MAE 2.32% to 2.74% worse | Historical weather quality is unverified |

MAE is mean absolute error in pickups per zone-hour. Each study uses its own matched control, so the percentages are not one ranking. The May test month stays sealed until model selection is frozen.

## Limits

- Six months of data do not cover a full annual cycle, and the patterns are descriptive, not causal.
- TLC publication delay rules out real-time use; zero counts can also reflect reporting gaps.
- The two-day demo illustrates behavior and does not estimate full-study performance.
