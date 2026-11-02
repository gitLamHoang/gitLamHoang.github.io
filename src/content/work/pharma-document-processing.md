---
title: Document intelligence for pharmaceutical supply chains
summary: An OCR, retrieval, and classification pipeline for pharmaceutical vendor files, benchmarked across OCR engines, LLMs, and chunking strategies, with a public continuation that settles ambiguous dates from evidence in the same recall notice.
org: Pfizer
role: AI Engineer Apprentice
dates: Jun. to Sep. 2026, public continuation 2026
order: 2
overview: Pharmaceutical supply chains run on vendor paperwork, scanned files whose fields must be read, checked, and routed to the right team. The project asked how far an OCR, retrieval, and LLM pipeline can automate that intake, and where it breaks.
contribution: As an AI Engineer Apprentice at Pfizer, I built the end-to-end Python and Docker pipeline, benchmarked OCR and LLM choices, reviewed outputs by hand to diagnose failures, and delivered a demo interface and a technical report with deployment recommendations. I then built a public continuation on 60 real MHRA recall and defect notices that keeps every extracted date traceable to its source cell, and added a resolver that reads a document's date order from its own unambiguous dates.
claim: A three-stage pipeline (OCR, retrieval, classification) can route pharmaceutical vendor files. A date that reads two ways, like 09/10/2026, can be settled by other dates in the same document that read only one way, and left unresolved when that evidence is missing or mixed.
result: 50+ vendor files processed; 4 OCR/LLM approaches compared across 6 chunking configurations; 100+ outputs reviewed. In the public register of 742 source-linked date cells, same-notice evidence suggests a reading for 118 of 123 ambiguous dates, and a leave-one-out check agrees on 390 of 399 dates with 0 disagreements.
highlight: agrees on 390 of 399 dates with 0 disagreements
limit: The Pfizer code and data are internal. Every public notice is English and day-first, so the resolver is untested on real month-first documents, and its 118 suggestions still need human review.
stack: [Python, Docker, Tesseract, PaddleOCR, Mistral, Phi-2, scikit-learn, TypeScript, SQL]
specs:
  - label: Pipeline
    value: OCR, retrieval, classification
  - label: OCR engines
    value: Tesseract, PaddleOCR
  - label: LLMs
    value: Mistral, Phi-2
  - label: Evaluation
    value: 100+ outputs reviewed for failure analysis
  - label: Public corpus
    value: 60 MHRA notices, 742 date cells
  - label: Date order
    value: Unanimous same-notice vote; abstains on conflict
links:
  - label: Public workspace
    href: https://gitlamhoang.github.io/pharma-ocr-date-rag/
  - label: Repository
    href: https://github.com/gitLamHoang/pharma-ocr-date-rag
figure:
  src: ../../assets/work/pharma-public-notices.png
  alt: The public notices workspace on grid paper, with an ambiguous expiry date selected and the same-notice dates that suggest its day-first reading listed beside the source row.
  caption: The public continuation. An ambiguous date cites the dates in its own notice that settle its reading, and stays unresolved until a reviewer confirms it.
  href: https://gitlamhoang.github.io/pharma-ocr-date-rag/
sources:
  - Current CV (Pharmaceutical Document Processing, AI Engineer Apprenticeship, Pfizer)
  - Earlier resume (OCR/LLM tools, demo UI, technical report)
  - gitLamHoang/pharma-ocr-date-rag README
  - gitLamHoang/pharma-ocr-date-rag reports/document_conventions.json (python scripts/benchmark_conventions.py)
---

## The problem

A supplier document can carry manufacturing, expiry, inspection, audit, and arrival dates. Finding a date is only part of the job: a reviewer needs to know what it refers to, which date convention the document uses, and where it came from. A flat OCR transcript loses those relationships.

## What I built

**AI Engineer Apprenticeship, Pfizer (June to September 2026)**

- A Python and Docker pipeline for OCR, retrieval, and classification of 50+ pharmaceutical vendor files.
- A benchmark of 4 OCR/LLM approaches (Tesseract, PaddleOCR, Mistral, Phi-2) across 6 chunking configurations, scored on OCR accuracy, retrieval quality, and routing performance.
- Manual review of 100+ outputs, tracing failures to the OCR, retrieval, or routing stage.
- A demo interface and a technical report covering model trade-offs, optimization steps, and deployment recommendations.

**Public continuation**

- A bounded, cached collector for 60 real MHRA recall and defect notices, with 371 batch rows and source hashes.
- A trained table-column classifier (character TF-IDF and logistic regression, fitted on 36 notices with chronological document-group splits, against keyword and majority baselines).
- A searchable register of 742 source-linked date cells from those English notices, plus a separate synthetic workflow that parses dates in English, French, German, Spanish, and Vietnamese.
- Ambiguity kept visible: when `09/10/2026` has two valid readings, the value stays unresolved and both candidates are shown.
- A date-order resolver. A date like `31/10/2026` can only be day-first, so it is evidence for its whole document. When every such date in a notice agrees, the ambiguous dates get a suggested reading with the cited cells; any conflict or missing evidence abstains. It suggests a reading for 118 of 123 ambiguous public dates (5 abstain, 0 conflicts). Hiding each of 399 order-revealing dates and predicting it from the rest of its notice agrees 390 times, disagrees 0 times, and abstains 9 times. On authored fixtures with a declared convention, 4 of 4 suggestions are correct.
- A browser workspace redesigned as an evidence ledger, with source rows, the cited order evidence, reasoned review decisions, and CSV and JSON exports.

## Limits

- Code, data, and results from the Pfizer apprenticeship are internal, so this page describes them at the level of the CV.
- The public workspace is a historical research snapshot, not a live recall service or a medication-safety tool.
- Every public notice comes from one publisher and is day-first, so the leave-one-out check tests consistency within a notice, not telling day-first and month-first documents apart. The only month-first case is a synthetic fixture.
- A suggested date is not a confirmed date. All 742 public cells still need review.
- Original-PDF OCR was measured on 3 public PDFs (6 pages). Customer demand and time savings have not been measured.
