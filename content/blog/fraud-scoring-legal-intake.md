---
title: "Scoring Fraud in Legal Intake Calls"
date: 2026-04-08T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "Coached callers, invented doctors and borrowed photos. How RISQ scores intake calls for mass tort firms, and why the most useful score measures the interviewer, not the caller."
tags: ["AI", "Fraud Detection", "Legal Tech", "LLM"]
categories: ["AI systems"]
ShowToc: true
cover:
  ascii: "post-fraud"
  alt: "Legal intake fraud scoring"
---

Mass tort firms run intake lines that take a lot of calls from people who may qualify for a case: they took a certain drug, had a certain device implanted, lived near a certain plant. Some share of those callers aren't who they say they are. Some are coached and reading from a script. Some never used the product. Some call back under a different name.

[RISQ](/projects/risq/) listens to those calls, scores them, and recommends one of three things: send the caller on to a closer, flag them for a human to review, or quarantine the call. This post is about how the scoring works in principle. The actual weights and thresholds belong to the client, so they're not here.

## Four questions, asked separately

RISQ doesn't produce one "fraud score". It asks four separate questions and only then combines them:

- **Recall.** Does the caller remember the texture of what happened to them: when, where, who treated them, what it felt like?
- **Integrity.** Does the call sound like a real person telling their own story, or does it carry the markers of a script?
- **Qualification.** Does the caller meet this campaign's legal criteria?
- **Session.** Did the intake agent ask good questions?

The first three feed the recommendation. The fourth doesn't, and it turned out to be the most important of the lot.

## Scoring the interviewer

A bad intake interview makes honest callers look suspicious. If the agent asks leading questions ("you took this between 2018 and 2020, right?"), a real claimant's answers sound rehearsed, because the agent rehearsed them. If the agent skips the questions that would reveal real recall, the caller never gets the chance to show it.

So the session score works as a gate in front of everything else. If the interview itself was poor, RISQ doesn't recommend anything about the caller. It marks the call for re-screening. That one gate prevented more wrongly quarantined callers than any other change we made.

## Decisions as a series of gates

The recommendation comes from a sequence of gates, and a call leaves at the first one it fails:

1. Hard disqualifiers from the campaign rules.
2. The session gate above.
3. Minimums on integrity and qualification that no composite can make up for.
4. A check for the coaching pattern described below.
5. Only then, the combined score mapped to transfer, review or quarantine.

Ordering it this way keeps the explanations honest. When a call is quarantined, the reviewer can see which gate it failed, not just a number.

## The perfect caller problem

Coached callers have a signature. They know exactly what qualifies them, because someone told them, so their qualification looks excellent. But they can't fill in the details around it: the pharmacy, what the pills looked like, what else was going on that year. High qualification with thin recall is suspicious in a way that neither score is on its own, so RISQ checks for that combination explicitly.

## What happens to one call

**Transcription with speaker separation.** The caller's words have to be separated from the agent's, or the agent's phrasing leaks into the caller's scores.

**Claim extraction.** An LLM reads the transcript and pulls out structured claims: which product, when, which symptoms, which doctors and facilities. Each claim carries a confidence level.

**Language signals.** The same pass flags things like dates that are oddly exact while everything around them is vague, legal vocabulary most people wouldn't use, and contradictions between the start and end of the call.

**Checking claims against public registries.** Named doctors are checked against the NPI registry for existence and specialty, and named facilities against CMS provider data. "Dr. Smith at Memorial Hospital" either exists with the right specialty or it doesn't.

**Photo evidence.** For some campaigns the caller is asked by text to send a photo: packaging, a prescription label, a record. A vision model checks whether the image is what it claims to be, rather than a stock photo or someone else's paperwork.

## Rules as configuration

Every campaign has different criteria: which drug and which years, which device, which region. None of that is hard-coded. A campaign is a configuration covering the required questions, disqualifying answers, which registries to check and what the gates are, so a new campaign doesn't need new code.

## What I took away

**It's adversarial, so it drifts.** Once coached callers stop getting through, the coaching changes. Some callers started getting small details wrong on purpose to sound more natural. Any fixed set of signals goes stale, so recalibration has to be routine work, not a project.

**Different kinds of evidence compound.** The transcript alone catches a lot. Registry checks catch people who've done some homework. Photos catch most of what's left. None of them is decisive alone; together they're hard to fake all at once.

**Measure the process before you judge the person.** The session gate matters most, and it's the least technical part of the system.
