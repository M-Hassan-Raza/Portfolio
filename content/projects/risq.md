---
title: "RISQ"
date: 2026-09-25T10:00:00+05:00
description: "Scoring intake calls for mass tort firms: separating real claimants from coached callers, with evidence a reviewer can follow."
tier: flagship
weight: 5
projectLabel: "Legal intake fraud scoring"
facts:
  role: "One of the two core engineers"
  team: "A small team, for a legal-intake client"
  timeline: "2025 to now"
  status: "Actively developed"
  stack: ["Python", "Speech-to-text with speaker separation", "LLM claim extraction", "Vision model checks", "NPI and CMS registries", "SMS webhooks"]
  source: "Private, client work"
outcomes:
  - "Every call ends in one of three recommendations: transfer, review or quarantine"
  - "Each recommendation shows the gate that produced it, so a reviewer can check the reasoning"
  - "New campaigns are configuration, not code"
tags: ["AI", "Fraud Detection", "Legal Tech"]
cover:
  ascii: "risq-cover"
  alt: "RISQ, typographic cover"
---

Mass tort firms take a lot of calls from people who might qualify for a case. Some callers are coached, some never used the product, some call back under another name. RISQ listens to each intake call and recommends whether to send the caller on to a closer, flag them for review, or quarantine the call.

The interesting parts are how it scores, and why the score that matters most measures the interviewer rather than the caller. I've written that up in detail in [Scoring fraud in legal intake calls](/blog/fraud-scoring-legal-intake/). Here's the short version.

## Separate questions before a verdict

RISQ asks four questions separately: does the caller remember real detail, does the story sound like their own, do they meet the campaign's criteria, and did the intake agent ask good questions. Only the first three feed the recommendation. The fourth is a gate: a poor interview makes honest people sound rehearsed, so RISQ refuses to judge the caller when the interview itself was bad.

## Evidence from more than one direction

A call is transcribed with the speakers separated, then an LLM extracts structured claims: which product, when, which doctors and facilities. Doctors and facilities are checked against public registries. For some campaigns the caller is asked to text a photo, and a vision model checks it's what it claims to be. None of those signals decides alone. Together they're hard to fake at the same time.

## Decisions a reviewer can follow

The recommendation comes out of a sequence of gates, and each call stops at the first one it fails. When a call is quarantined, the reviewer sees why, not just a score.
