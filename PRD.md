# PRD — Arogya AI: The Intelligent Clinical Safety Layer

**Doc owner:** 
**Last updated:** 2026-01-05
**Status:** Draft

## 1. Executive Summary
Arogya AI is an AI-powered Clinical Decision Support System (CDSS) that acts as a **clinical safety layer** for healthcare.

- For **doctors**, it reduces diagnostic and documentation fatigue by summarizing patient history, enabling grounded Q&A over medical records, and flagging potential findings from imaging.
- For **patients**, it provides a zero-install experience through **WhatsApp**, explaining prescriptions in accessible mixed-language dialects (e.g., Hinglish/Telugish), extracting prescriptions from photos, and issuing reminders.

Arogya AI combines:
- **Deterministic safety checks** (DrugBank-based dataset lookup) for high-confidence interaction detection.
- **LLM reasoning** (Gemini) for explanation, context, and patient-friendly guidance.
- **Vision model inference** (MedGemma) for imaging assistance.

Arogya AI is not a diagnostic replacement; it is a clinician-support and patient-adherence system.

---

## 2. Problem Statement
### 2.1 Context
In high-traffic clinical environments, clinicians may have only minutes per patient. Patient information is often fragmented across:
- handwritten notes,
- PDFs,
- lab reports,
- imaging scans,
- prior prescriptions.

### 2.2 Problems to Solve
1. **Medication safety gaps**
   - Drug–Drug and Drug–Food interactions are easy to miss under time pressure.
   - A single missed interaction can cause severe harm.

2. **Decision fatigue and cognitive overload**
   - Reading long longitudinal records increases risk of oversight.
   - Clinicians need high-signal summaries and fast retrieval.

3. **Patient comprehension & adherence gap**
   - Many patients cannot interpret medical English or complex app UX.
   - Non-compliance (wrong timing, missed doses, food conflicts) increases complications.

### 2.3 Opportunity
Arogya AI can:
- compress clinical information into reliable summaries,
- provide rapid “chat with records” capability,
- automate interaction checking,
- deliver multilingual, low-friction patient support on WhatsApp.

---

## 3. Goals and Non-Goals
### 3.1 Goals (What success looks like)
**Doctor-facing**
- Reduce time to understand patient history to < 60 seconds.
- Provide grounded answers to record questions within seconds.
- Provide imaging assistance that flags potential abnormalities for attention.
- Provide deterministic interaction alerts at prescribing time.

**Patient-facing**
- Deliver understandable prescription explanations via WhatsApp.
- Support mixed-language replies and simple phrasing.
- Extract prescription images into structured medication schedules.
- Send reminders and interaction warnings in patient language.

### 3.2 Non-Goals (Explicit exclusions)
- Arogya AI does **not** provide definitive diagnoses.
- Arogya AI does **not** replace clinician judgment.
- Arogya AI does **not** autonomously prescribe.
- This PRD does not define billing/insurance workflows.

---

## 4. Target Users and Personas
### 4.1 Primary Personas
1. **Busy clinician (Doctor)**
   - Needs speed, accuracy, and minimal distraction.
   - Values cited evidence from records.

2. **Semi-literate patient / caregiver**
   - Prefers WhatsApp over new apps.
   - Needs guidance in a familiar dialect and simple instructions.

### 4.2 Secondary Personas
- Nurse / pharmacist (optional later): wants quick interaction checks and instruction clarity.
- Clinic admin (optional later): wants audit logs and onboarding.

---

## 5. Product Scope (MVP)
### 5.1 MVP Modules
1. **Doctor Dashboard (Web)**
   - Patient profile view
   - Upload records (PDF) and imaging (X-ray/MRI)
   - AI summary panel
   - Chat-with-records panel
   - Imaging analysis results panel
   - Interaction check panel for selected meds

2. **WhatsApp Bot (Patient)**
   - Receive patient messages
   - Accept media (prescription photo, PDF)
   - Extract medication schedule
   - Explain medicines in mixed-language style
   - Send reminders and warnings

3. **Hybrid Safety Engine**
   - Deterministic dataset lookup (e.g., `data_final_v5.csv`)
   - LLM explanation when interaction detected

---

## 6. User Journeys
### 6.1 Patient → WhatsApp → Doctor Dashboard
1. Patient sends report/scan/prescription via WhatsApp.
2. WPPConnect forwards media metadata + content to backend webhook.
3. Backend classifies file type:
   - Document → summarization + entity extraction
   - Imaging → vision inference
4. Doctor dashboard updates patient context.

### 6.2 Doctor Prescribing → Safety Check → Patient Alert
1. Doctor selects/inputs medications.
2. Hybrid safety engine checks interactions.
3. Dashboard shows safe/warning with rationale.
4. Patient receives WhatsApp message:
   - interaction warning + plain-language guidance
   - schedule reminders (if applicable)

---

## 7. Requirements

### 7.1 Functional Requirements — Doctor Dashboard
**FR-D1: Patient record ingestion**
- Upload PDF(s) and associate them with a patient ID.
- Store file metadata (name, date uploaded, type).

**FR-D2: AI clinical summary**
- Generate a concise summary (e.g., 5 bullets) from uploaded documents.
- Summary should include high-signal items: chronic conditions, allergies, current meds, key labs/trends if available, major past events.

**FR-D3: Chat-with-records (grounded Q&A)**
- Doctors can ask questions about the patient’s history.
- System responds using only the uploaded record corpus.
- Response should include “grounding” references (e.g., document title/date/section) as available.

**FR-D4: Imaging analysis**
- Upload image(s) (X-ray/MRI).
- Run vision model inference and return flagged findings / areas of concern.
- Clearly label output as assistive, not diagnostic.

**FR-D5: Medication interaction check (hybrid safety)**
- Doctor enters medication list (at minimum drug names).
- System checks Drug–Drug and Drug–Food interactions deterministically using dataset.
- If interaction exists:
  - show severity level (if dataset supports it)
  - produce an explanation via LLM
  - provide “suggested next steps” phrasing (e.g., consult pharmacist/consider alternative) without prescribing autonomously.

**FR-D6: Audit trail**
- Log key events: uploads, summaries generated, Q&A queries, interaction checks, outbound patient messages.

### 7.2 Functional Requirements — WhatsApp Bot
**FR-W1: WhatsApp message ingestion**
- Receive inbound text and media.
- Map WhatsApp sender to a patient profile (by phone number or explicit patient ID workflow).

**FR-W2: Mixed-language responses**
- Support Hinglish/Telugish response generation.
- Keep responses short, simple, and actionable.

**FR-W3: Prescription image → structured meds**
- Accept prescription photo.
- Extract medication names, dosage, timing (e.g., 1-0-1), duration if present.
- Confirm extracted details with patient/caregiver.

**FR-W4: Reminders**
- Create reminder schedule from extracted prescription data.
- Send WhatsApp reminders at scheduled times.

**FR-W5: Safety alerts**
- If interaction risk is identified (doctor-confirmed medication list or extracted list), send patient-friendly warning.

### 7.3 Functional Requirements — Backend & Data
**FR-B1: API endpoints**
- Provide endpoints for:
  - patient creation/lookup
  - file upload
  - summarization trigger
  - Q&A query
  - imaging analysis trigger
  - interaction check
  - WhatsApp webhook receiver

**FR-B2: Deterministic interaction dataset**
- Load CSV dataset and support queries by drug name.
- Implement normalization for drug strings (case, spacing, common synonyms if available).

**FR-B3: Data storage**
- Store patient objects, documents, extracted meds, interaction results, and logs.

---

## 8. Non-Functional Requirements (NFRs)
### 8.1 Safety & Clinical Guardrails
- All outputs must include clinician-first framing for diagnosis and prescribing.
- Interaction “existence” must come from deterministic tier where possible.
- LLM outputs should be constrained (templates/structured output) to reduce drift.

### 8.2 Privacy & Security
- Encrypt sensitive data at rest (deployment-dependent).
- Use TLS in transit.
- Restrict dashboard access via authentication.
- Store minimal WhatsApp identifiers necessary for operation.

### 8.3 Performance
- Typical summary generation: target < 30 seconds per document batch (depends on model + size).
- Q&A latency: target < 5 seconds (best-effort).
- Interaction check latency: target < 1 second for deterministic tier.

### 8.4 Reliability
- Webhook ingestion must be resilient to retries and duplicates.
- Logs and audit entries must be consistent.

### 8.5 Observability
- Track request latency, error rates, model failure rates.
- Store structured logs for tracing patient flows.

---

## 9. Metrics and Success Criteria
### 9.1 Doctor Metrics
- Median time-to-summary after upload.
- Reduction in time spent reviewing records (self-reported or measured).
- Interaction checks performed per patient visit.

### 9.2 Patient Metrics
- Reminder adherence proxy (responses/confirmations).
- Prescription comprehension score (simple follow-up questions).

### 9.3 Safety Metrics
- Number of interactions flagged.
- Confirmed prevented adverse events (where measurable).
- False positive / false negative analysis (requires clinical evaluation).

---

## 10. Assumptions
- Clinics can obtain consent to process patient documents.
- WhatsApp channel is acceptable for the intended environment.
- The interaction dataset is available and permitted for use.
- Model access tokens (Gemini / HuggingFace) are available.

---

## 11. Dependencies
- Google Gemini API (keys, quotas)
- Hugging Face (MedGemma model access)
- WPPConnect server infrastructure
- Drug interaction dataset (CSV)

---

## 12. Risks and Mitigations
**Risk: LLM hallucination in clinical context**
- Mitigation: grounded retrieval, citations, deterministic checks for interactions, structured outputs.

**Risk: Patient privacy exposure via WhatsApp**
- Mitigation: minimize PHI in messages, secure backend storage, consent flows, access control.

**Risk: OCR extraction errors from prescription images**
- Mitigation: confirmation step with user; allow manual correction by doctor.

**Risk: Imaging model misinterpretation**
- Mitigation: label as assistive, provide confidence/uncertainty, encourage clinician review.

---

## 13. Rollout Plan (Suggested)
### Phase 0: Prototype
- Document upload + summary
- Interaction check from a fixed medication list

### Phase 1: MVP
- Full doctor dashboard
- WhatsApp bot basic flows (text + prescription photo)
- Reminder scheduling

### Phase 2: Safety hardening
- Stronger grounding/citations
- Role-based access control
- Audit log dashboard

---

## 14. Open Questions
- What is the exact schema and severity labeling in `data_final_v5.csv`?
- Which languages/dialects are required for MVP (Telugu, Hindi, English)?
- Who initiates patient identity mapping (doctor invites patient vs patient self-register)?
- Where will this be deployed (clinic server vs cloud), and what privacy constraints apply?
