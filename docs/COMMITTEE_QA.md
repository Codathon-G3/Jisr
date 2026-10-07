# 🛡️ Committee Defense & Q&A Playbook

> **Audience**: Evaluation Committee — Ai4LY National Codathon 2026  
> **Session Format**: ~5 minutes of questions directly following the 5-minute presentation  
> **Prepared for**: Mohamed Thabet (Team Leader) and Team Presenters (Rayan, Muatz, Shima)

The evaluation committee is composed of AI experts, medical/mental health lecturers, and industry judges. Below are the 5 core questions they are guaranteed to ask, along with our prepared, evidence-based responses.

---

### Q1: "How is this not just another chatbot or wrapper around ChatGPT?"

#### Core Defense Point:
**Architectural direction & interaction duration.** A chatbot is designed to maximize engagement and keep the user conversing with the AI. Jisr does the exact opposite: it minimizes screen time, never holds conversations, and terminates at a real human.

#### Prepared Answer:
> *"Chatbots attempt to simulate human empathy and maintain an open-ended conversation with the user. In mental health, that carries severe ethical risks of emotional attachment and dangerous advice.  
> Jisr is strictly an **authoring companion, not a conversational partner**. The user interacts for less than 60 seconds: they tap chips, type 1–2 sentences, review 3 drafts, and export to WhatsApp.  
> Furthermore, forms and static templates cannot structure messy natural language into coherent requests, while chatbots drift into unregulated pseudo-therapy. Jisr occupies the safe, productive middle ground: using AI solely to lower the articulation barrier, then immediately stepping aside."*

---

### Q2: "Where does the user's data go, and how do you protect user privacy?"

#### Core Defense Point:
**Zero-retention architecture, on-device sandboxing, and PII sanitization.**

#### Prepared Answer:
> *"We treat user emotional state as the most sensitive data possible. Our architecture adheres to three strict privacy guarantees:  
> 1. **No Accounts or Telemetry**: The app requires no login, no phone number, no email, and stores no usage tracking.  
> 2. **Pre-Transmission PII Scrubbing**: Before any text leaves the phone for drafting, regex filters strip personal names, Libyan phone numbers (+218 / 091...), and emails, replacing them with generic placeholders.  
> 3. **Stateless API & On-Device Memory**: The backend server logs nothing to disk. The only persistence is an optional chip history stored solely inside sandboxed phone storage (`AsyncStorage`), which never transmits over the network and can be wiped with one tap."*

---

### Q3: "What if the AI hallucinates, invents feelings, or writes something harmful?"

#### Core Defense Point:
**The Guardian Layer, the Faithfulness Check, and human-in-the-loop approval.**

#### Prepared Answer:
> *"We employ three defense-in-depth mechanisms:  
> 1. **The Guardian Layer runs BEFORE drafting**: If crisis phrasing is detected, the text never reaches the drafting model—drafting is bypassed, and a static support card is displayed.  
> 2. **Deterministic Output Filter**: Every generated draft is scanned for clinical words, medication terms, and diagnosis labels. Violations are instantly blocked and replaced with a vetted template.  
> 3. **Human-in-the-Loop & The Faithfulness View**: The AI never sends messages automatically. The user reviews the draft, sees visual highlighting of which words came from their input, edits any sentence, and must manually tap Share in their messaging app."*

---

### Q4: "Does this product diagnose conditions or replace mental health specialists?"

#### Core Defense Point:
**Explicit non-clinical boundaries and routing toward early human support.**

#### Prepared Answer:
> *"No, and we explicitly design against clinical mimicry.  
> Specialist psychiatrists and clinical psychologists in Libya are scarce and should not be burdened with everyday exam stress or relational tension. Jisr focuses on early stress intervention by mobilizing existing social circles—siblings, parents, and close friends.  
> Our system prompts and output checks strictly forbid medical diagnosis, condition naming, or therapy jargon. On every screen, our stated limits explicitly declare: 'Jisr is not a doctor, not a diagnostic tool, and not a crisis service.'"*

---

### Q5: "Why is this solution feasible and culturally applicable in Libya specifically?"

#### Core Defense Point:
**Linguistic tuning (Libyan dialect), social norms, and infrastructure realities.**

#### Prepared Answer:
> *"Most global mental health apps fail in Libya for three reasons: language, stigma, and infrastructure.  
> 1. **Language & Dialect**: Young Libyans express stress in Libyan Arabic (*'مضغوط'*, *'حاس روحي بنجنن'*) and Latin-transliterated text (*Arabizi*). Our models and keyword safety lists are specifically calibrated for Libyan dialect.  
> 2. **Stigma & Family Values**: Mental health in Libya is viewed through family and community lenses. Jisr includes family and trusted adults as recipient choices, using neutral framing (*'ضغط'*, *'امتحانات'*) rather than stigmatizing clinical labels.  
> 3. **Infrastructure**: Jisr works on ordinary phones, requires minimal bandwidth (short text payloads), features an airplane-mode fallback to pre-written templates, and integrates directly with WhatsApp and Messenger, which are ubiquitous in Libya."*
