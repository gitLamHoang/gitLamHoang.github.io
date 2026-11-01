---
title: Document intelligence for pharmaceutical supply chains
summary: An OCR, retrieval, and classification pipeline for pharmaceutical vendor files, benchmarked across OCR engines, LLMs, and chunking strategies, with a public continuation on real recall notices.
org: Pfizer
role: AI Engineer Apprentice
dates: Jun. to Sep. 2026, public continuation 2026
order: 2
overview: Pharmaceutical supply chains run on vendor paperwork, scanned files whose fields must be read, checked, and routed to the right team. The project asked how far an OCR, retrieval, and LLM pipeline can automate that intake, and where it breaks.
contribution: As an AI Engineer Apprentice at Pfizer, I built the end-to-end Python and Docker pipeline, benchmarked OCR and LLM choices, reviewed outputs by hand to diagnose failures, and delivered a demo interface and a technical report with deployment recommendations. I then built a public continuation on real MHRA recall and defect notices, focused on keeping every extracted date traceable to its source.
claim: A three-stage pipeline (OCR, retrieval, classification) can route pharmaceutical vendor files, and a source-linked review workspace can keep ambiguous dates visible instead of guessing.
result: 50+ vendor files processed; 4 OCR/LLM approaches compared across 6 chunking configurations; 100+ outputs reviewed. The public continuation covers 742 source-linked date cells from 60 MHRA notices in 5 languages.
limit: The Pfizer code and data are internal. The public continuation is a historical snapshot, and its original-PDF OCR was measured on only 3 PDFs.
stack: [Python, Docker, Tesseract, PaddleOCR, Mistral, Phi-2, TypeScript, SQL]
specs:
  - label: Pipeline
    value: OCR, retrieval, classification
  - label: OCR engines
    value: Tesseract, PaddleOCR
  - label: LLMs
    value: Mistral, Phi-2
  - label: Evaluation
    value: 100+ outputs reviewed for failure analysis
links:
  - label: Public workspace
    href: https://gitlamhoang.github.io/pharma-ocr-date-rag/
  - label: Repository
    href: https://github.com/gitLamHoang/pharma-ocr-date-rag
figure:
  src: ../../assets/work/pharma-public-notices.png
  alt: The public notices workspace, with batch search, candidate dates, and the source evidence for each.
  caption: The public continuation. Each candidate date links back to the notice row it came from.
  href: https://gitlamhoang.github.io/pharma-ocr-date-rag/
sources:
  - Current CV (Pharmaceutical Document Processing, AI Engineer Apprenticeship, Pfizer)
  - Earlier resume (OCR/LLM tools, demo UI, technical report)
  - gitLamHoang/pharma-ocr-date-rag README
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
- A searchable register of 742 source-linked date cells in English, French, German, Spanish, and Vietnamese.
- Ambiguity kept visible: when `09/10/2026` has two valid readings, the value stays unresolved and both candidates are shown.
- A browser workspace with source highlights, reasoned review decisions, and CSV and JSON exports.

## Limits

- Code, data, and results from the Pfizer apprenticeship are internal, so this page describes them at the level of the CV.
- The public workspace is a historical research snapshot, not a live recall service or a medication-safety tool.
- Original-PDF OCR was measured on 3 public PDFs (6 pages). Customer demand and time savings have not been measured.
