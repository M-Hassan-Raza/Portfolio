---
title: "Scoring Fraud in Legal Intake Calls"
date: 2026-02-20T10:00:00+05:00
description: "A walkthrough of RISQ, the intake scoring system I built to combine transcripts, external verification, and disposition gates."
draft: false
tags: ["AI", "Fraud Detection", "Legal Tech", "Python", "LLM", "AssemblyAI"]
showComments: true
ShowToc: true
cover:
  image: "/assets/legal-intake-fraud-cover.svg"
  alt: "Legal intake fraud scoring cover"
---

I built RISQ, a fraud detection system for legal intake calls. Mass tort law firms receive thousands of calls from potential claimants, and a significant percentage are fraudulent — coached callers reading from scripts, people who never actually used the drug or product in question, or repeat callers under different names.

RISQ listens to these calls, scores them for authenticity, and recommends whether to transfer the caller to a closer, flag them for review, or quarantine the call.

## The RIQ Scoring Framework

The core of RISQ is a composite score called RIQ (Real-time Integrity Scoring for Qualification). It combines four independent scores:

| Score | What It Measures | Weight in Composite |
|-------|-----------------|-------------------|
| **R (Recall)** | How well the caller remembers details about their experience | 20% |
| **I (Integrity)** | Speech authenticity and absence of fraud indicators | 35% |
| **Q (Qualification)** | Whether the caller meets the legal criteria for this specific campaign | 45% |
| **S (Session)** | Quality of the intake agent's technique | Not in composite |

```
RIQ = 0.20 * R + 0.35 * I + 0.45 * Q
```

The S-Score exists but doesn't go into the composite — it measures the agent, not the caller. A poor S-Score means the intake agent didn't ask the right questions, so the other scores might be unreliable. It acts as a pre-gate: if the session quality is too low, RISQ flags the call for re-screening rather than making a disposition.

## Disposition Logic

The scoring feeds into a five-level disposition system with cascading gates:

1. **DQ check** — instant disqualification if campaign rules are violated
2. **S-Score pre-gate** — if session quality is critically low, mark as INCOMPLETE
3. **Hard gates** — if I-Score or Q-Score fall below absolute thresholds, quarantine or flag
4. **Checklist-only detection** — catches callers who hit every checklist item perfectly but show no genuine recall (a sign of coaching)
5. **RIQ disposition matrix** — composite score mapped to transfer, review, or quarantine

The checklist-only detection is interesting. Coached callers often have high Q-Scores (they studied what qualifies them) but low R-Scores (they can't remember real details about their experience). A high Q-Score combined with a suspiciously low R-Score triggers additional scrutiny.

## Multi-Modal Analysis Pipeline

A single call goes through multiple analysis stages:

**1. Audio Transcription + Speaker Diarization**

AssemblyAI transcribes the call and separates speakers. This matters because the caller's responses need to be isolated from the agent's questions for accurate scoring.

**2. LLM Claim Extraction**

Claude Sonnet analyzes the transcript and extracts structured claims: what product the caller used, when, what symptoms they experienced, which doctors they saw, and which facilities treated them. Each claim gets tagged with a confidence level.

**3. Linguistic Fraud Indicators**

The LLM also flags linguistic patterns associated with fraud:
- Unnaturally specific dates and details (coached callers memorize exact dates but can't recall surrounding context)
- Repeated use of legal terminology a regular person wouldn't know
- Contradictions between early and late parts of the call
- Scripted-sounding responses vs. natural conversation patterns

**4. External Verification**

Extracted claims are verified against real databases:
- **NPI Registry** — validates that named doctors actually exist and practice in the stated specialty
- **CMS Database** — validates that named facilities are real healthcare providers
- **Campaign-specific databases** — depending on the tort type, additional verification against product recall lists, geographic eligibility, etc.

A caller claiming they were treated by "Dr. Smith at Memorial Hospital" gets checked. If the NPI Registry shows no Dr. Smith with the claimed specialty, or Memorial Hospital isn't in the CMS database, those claims get flagged and the I-Score drops.

**5. Image Verification (NotHotDog)**

For some campaigns, callers are asked to provide photo proof (medical records, product packaging). RISQ sends an SMS requesting the photo, receives it via Twilio/Telnyx webhooks, and analyzes the image with Google Gemini Vision to verify it matches the claimed evidence.

The name "NotHotDog" is a Silicon Valley reference. The system's job is to determine if the uploaded image is actually what the caller claims it is, or if it's a stock photo, someone else's medical record, or completely unrelated.

## Campaign-Specific Rule Engines

Different mass tort campaigns have different qualification criteria. A pharmaceutical lawsuit requires proving the caller used a specific drug during a specific time window. A device recall case requires proving the caller had a specific medical device implanted.

Instead of hardcoding these rules, RISQ uses campaign configurations that define:
- Which qualification questions are required
- What constitutes a disqualifying answer
- Severity weights for different fraud indicators
- Which external databases to check against
- Minimum score thresholds for each disposition

When a new campaign launches, the legal team defines the rules. The scoring engine applies them without code changes.

## What I Learned

**Fraud detection is adversarial.** Fraudsters adapt. When we started flagging callers with perfect checklist responses, some started intentionally getting minor details wrong to appear more natural. The scoring model needs regular recalibration.

**Multi-modal beats single-modal.** A transcript-only analysis catches most fraud. Adding external verification catches sophisticated fraud. Adding image verification catches the rest. Each additional signal mode has diminishing returns individually but compounds with the others.

**The S-Score was the most valuable addition.** Measuring agent quality and gating on it prevented the most false positives. A bad intake agent asking leading questions can make a legitimate caller sound coached. Without the S-Score gate, those callers would be wrongly quarantined.
