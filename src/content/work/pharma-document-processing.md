---
title: Pharmaceutical document processing
summary: Document AI for pharmaceutical vendor files, then a public follow-up that keeps every extracted date tied to its source.
role: AI Engineer Apprentice, Pfizer
dates: Jun. to Sep. 2026, public continuation 2026
order: 2
claim: A Python and Docker pipeline can run OCR, retrieval, and classification over pharmaceutical vendor files, and a public follow-up can keep every extracted date tied to its source text.
result: 50+ vendor files processed; 4 OCR/LLM approaches compared across 6 chunking configurations; 100+ outputs reviewed. Public continuation covers 742 source-linked date cells from 60 MHRA notices.
limit: The Pfizer code and data are internal. The public continuation is a historical snapshot, and its original-PDF OCR was measured on only 3 PDFs.
stack: [Python, Docker, Tesseract, PaddleOCR, Mistral, Phi-2, TypeScript, SQL]
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

A supplier document can carry manufacturing, expiry, inspection, audit, and arrival dates. Finding a date is only part of the job: a reviewer needs to know what it refers to, which date convention the document uses, and where it came from.

## What I built

**AI Engineer Apprenticeship, Pfizer (June to September 2026)**

- A Python and Docker pipeline for OCR, retrieval, and classification of 50+ pharmaceutical vendor files.
- A comparison of 4 OCR/LLM approaches (Tesseract, PaddleOCR, Mistral, Phi-2) across 6 chunking configurations, with 100+ outputs reviewed to study errors and model trade-offs.
- A demo interface and a technical report covering model trade-offs, optimization steps, and deployment recommendations.

**Public continuation**

- A bounded collector for 60 real MHRA recall and defect notices, with 371 batch rows and source hashes.
- A trained table-column classifier (character TF-IDF and logistic regression, fitted on 36 notices with chronological document-group splits).
- A searchable register of 742 source-linked date cells, in English, French, German, Spanish, and Vietnamese.
- Ambiguity kept visible: when `09/10/2026` has two valid readings, the value stays unresolved and both candidates are shown.
- A browser workspace with source highlights, reasoned review decisions, and CSV and JSON exports.

## Limits

- Code, data, and results from the Pfizer apprenticeship are internal, so this page describes them only at the level of the CV.
- The public workspace is a historical research snapshot, not a live recall service or a medication-safety tool.
- Original-PDF OCR was measured on 3 public PDFs (6 pages). Customer demand and time savings have not been measured.
