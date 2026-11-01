---
title: Forecasting NYC taxi demand by zone and hour
summary: Where yellow-taxi pickups concentrate across 262 zones, and where hourly forecasts miss.
role: Personal project
dates: '2026'
order: 4
claim: A boosting model on past-only features forecasts hourly pickups per zone better than a weekly baseline.
result: MAE 3.693 vs 5.104 (27.65% lower) over 559,370 zone-hours of walk-forward validation.
highlight: MAE 3.693 vs 5.104
limit: Boosting is worse on sparse-zone MAE in every month, and no live data feed exists.
stack: [Python, SQL, FastAPI, TypeScript, SVG]
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
