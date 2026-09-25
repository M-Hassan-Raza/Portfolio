---
title: "Anatomia"
date: 2026-04-08T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "A nurse callback and case review product where transcripts, AI triage and follow-up calls all have to stay attached to the right patient."
tier: flagship
weight: 4
projectLabel: "Clinical callback workflow"
facts:
  role: "[FACT?] Backend workflow and parts of the frontend"
  team: "Entropy Labs team, for a healthcare client"
  timeline: "2025"
  status: "[FACT?]"
  stack: ["FastAPI", "React", "PostgreSQL", "AWS Cognito", "AWS S3", "AWS KMS", "Redis", "OpenAI", "Vapi"]
  source: "Private, client work"
outcomes:
  - "Transcripts and recordings encrypted and access-controlled by default, not as a later compliance pass"
  - "AI limited to bounded jobs: summarizing, urgency scoring and drafting, with a nurse deciding"
  - "Callbacks, recordings and follow-ups tied to one case across every role handoff"
tags: ["Healthcare", "FastAPI", "React", "AWS", "AI"]
cover:
  ascii: "anatomia-cover"
  alt: "Anatomia, halftone illustration"
---

Anatomia is a care workflow product built around callbacks. A patient calls, the call is transcribed and analyzed, a nurse reviews the case, escalates to a doctor when needed, and a follow-up goes out, sometimes by an automated voice call. The product is the loop between a call coming in and a patient being looked after; the health records live elsewhere.

It was a team project for a healthcare client. My part was mostly the backend workflow: case state, transcript and triage handling, and the follow-up paths that have to land on the right patient.

## Sensitive by default

Transcripts, recordings and anything linked to a patient are treated as sensitive from the start. Encryption with managed keys, role-based access, audit logging and retention rules are part of the core design, because adding them after the fact means finding every place the data already leaked to.

## AI that assists without deciding

The AI does specific, checkable jobs: summarizing a transcript, scoring urgency, labeling priority and drafting the callback. A nurse reviews every case. That split is what makes the AI useful in a clinical setting: it saves reading time without anyone pretending the model is making clinical decisions.

## Handoffs are the product

A case moves through nurse review, doctor review, waiting states and completion. Most of the ways a care workflow fails are handoff failures: the doctor sees the case without the context the nurse had, or a follow-up goes out against the wrong record. So the case carries its context with it (medications, allergies, history, the call itself) through every stage, and every state change is recorded.

## Follow-up calls that know where they belong

Outbound voice follow-up only helps if the call, its recording, its transcript and the resulting state all end up on the right case. Most of that work was plumbing, and all of it was necessary.

## What I took away

Products like this are judged on trust long before polish. If access rules are fuzzy, audit trails thin, or context gets lost between roles, people stop relying on the system, however good the AI is.
