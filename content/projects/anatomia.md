---
title: "Anatomia Healthcare"
date: 2025-01-10
description: "Care workflow platform for nurse callbacks, case review, encrypted transcripts, and voice follow-up."
tags: ["Healthcare", "FastAPI", "React", "AWS", "Vapi", "AI"]
categories: ["Projects"]
showToc: true
showReadingTime: true
weight: -8
featured: true
projectLabel: "Clinical callback workflow"
projectFocus: "PHI controls, nurse review, escalation paths, and voice follow-up."
---

Anatomia is a care workflow product centered on callbacks and case review. The core loop is not a general healthcare record system. It is a nurse-facing workflow where calls, transcripts, AI triage, patient context, follow-up work, and escalations all have to move cleanly between staff roles.

**Tech Stack:** FastAPI, React, PostgreSQL, AWS Cognito, AWS S3, AWS KMS, Redis, OpenAI, Vapi

**Source:** Private (healthcare client)

---

## What The Product Handles

The product code points to a workflow with:

- nurse review, callback response, and doctor escalation
- patient context including medications, allergies, conditions, labs, vitals, imaging, and consultation history
- call transcripts, AI analysis, urgency scoring, and suggested follow-up language
- outbound voice follow-up through Vapi
- analytics and case state tracking across several workflow stages

## The Hard Parts

### PHI Handling Changes The Whole Shape Of The System

The interesting work here is not just calling an LLM on a transcript. The product has to treat transcripts, recordings, and patient-linked data as sensitive by default. That pushes encryption, access control, audit logging, retention, and search constraints into the center of the architecture instead of leaving them as a later compliance pass.

### Triage Has To Stay Useful Without Pretending To Be Magic

The AI layer is doing concrete, bounded work: transcript analysis, urgency scoring, priority labeling, and callback drafting. That is a better fit for a real workflow than pretending the model is making clinical decisions on its own.

### Role Handoffs Are The Product

The frontend workflow is explicitly staged across nurse review, doctor review, waiting states, and completion. That matters because a care workflow breaks down quickly if assignment, escalation, and patient context are not carried through in a consistent way.

### Voice Follow-Up Has To Connect Back To The Case

The outbound voice assistant is not interesting on its own. It becomes useful when the callback, the recording, the transcript, and the follow-up state all stay tied to the right case and the right staff workflow.

## What I Learned

Products like this get judged on trust long before they get judged on polish. If access rules are fuzzy, if audit trails are thin, or if callbacks lose context between roles, people stop trusting the system.

That is what makes Anatomia worth including here. It is a reminder that sensitive workflows usually fail on operational details first, not on lack of cleverness.
