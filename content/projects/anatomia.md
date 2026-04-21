---
title: "Anatomia Healthcare"
date: 2025-01-10
description: "HIPAA-compliant healthcare platform with AI clinical decision support"
tags: ["Healthcare", "HIPAA", "FastAPI", "React", "AWS", "FHIR", "AI"]
categories: ["Projects"]
showToc: true
showReadingTime: true
weight: -8
featured: true
projectLabel: "Healthcare workflow"
projectFocus: "FHIR, HIPAA-heavy constraints, and clinical data handling."
---

Anatomia is a healthcare communication platform that handles patient-provider interactions with HIPAA compliance baked in. It integrates real-time transcription, AI-powered clinical decision support, and standardized healthcare data exchange through FHIR.

**Tech Stack:** FastAPI, React, AWS HealthLake, AWS Transcribe Medical, AWS Comprehend Medical, Vapi

**Source:** Private (healthcare client)

---

## The Problem

Healthcare providers needed a platform that could:
- Handle real-time patient consultations with transcription
- Provide clinical decision support during consultations
- Exchange data with other healthcare systems (referrals, diagnostics)
- Meet HIPAA requirements without slowing down workflows

The challenge was building something that felt fast and modern while meeting the strict compliance requirements healthcare demands.

---

## Technical Approach

### HIPAA Compliance Architecture

HIPAA compliance isn't just encryption—it's a set of requirements around access control, audit logging, data handling, and breach notification. The architecture had to support all of this from the ground up.

I used AWS services designed for healthcare: HealthLake for FHIR-compliant data storage, and the Medical variants of Transcribe and Comprehend that are covered under AWS's BAA. All data in transit and at rest is encrypted. Access is logged at every level.

The application layer enforces role-based access control. Different user types (providers, nurses, administrators) see different data based on their role and their relationship to the patient. Every data access is logged with timestamp, user, and reason.

### Real-Time Transcription

Patient consultations are transcribed in real-time using AWS Transcribe Medical. The medical variant is important—it's trained on healthcare terminology and produces more accurate transcriptions of clinical conversations.

The transcription feeds into the clinical decision support system, which highlights relevant information as the conversation happens. If a patient mentions symptoms that might indicate a specific condition, the system surfaces relevant clinical guidelines.

### FHIR Integration

Healthcare data exchange happens through FHIR R4, the industry standard. The platform can send and receive referrals, lab results, and patient summaries in a format other healthcare systems understand.

AWS HealthLake handles the FHIR server implementation. I built adapters that translate between our internal data models and FHIR resources. This abstraction means the application code doesn't need to think about FHIR directly—it just works with domain objects.

HL7 integration handles legacy systems that haven't adopted FHIR yet. The platform can receive HL7 messages and translate them to FHIR resources.

### Voice Agent for Follow-Ups

Patient follow-ups are handled by a Vapi-powered voice agent. It can call patients to check on recovery, remind them of appointments, and escalate to human staff when needed.

The voice agent integrates with the clinical record, so it knows the patient's context. It can reference recent visits and ask relevant follow-up questions. All interactions are transcribed and added to the patient record.

---

## What I Learned

**Compliance is a feature, not a burden.** HIPAA requirements forced good practices: audit logging, access control, encryption. These make the system more robust even beyond the compliance benefits.

**Medical AI requires careful framing.** Clinical decision support should augment providers, not replace their judgment. The UI presents suggestions as information to consider, not instructions to follow.

**Healthcare interoperability is hard.** FHIR helps, but every healthcare system has its own quirks. Building robust adapters that handle edge cases took significant effort.

---

## Interested?

If you're building healthcare software or need help with HIPAA-compliant architecture, [book a call](/book-a-call/).
