# Committee Defense & Q&A Playbook

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
> Jisr is strictly an **authoring companion, not a conversational partner**. A session is designed to take a few minutes at most: they tap chips, type 1–2 sentences, review 3 drafts, and export to WhatsApp. (We have not timed real users yet; that is part of our planned consented test sessions.)  
> Furthermore, forms and static templates cannot structure messy natural language into coherent requests, while chatbots drift into unregulated pseudo-therapy. Jisr occupies the safe, productive middle ground: using AI solely to lower the articulation barrier, then immediately stepping aside."*

---

### Q2: "Where does the user's data go, and how do you protect user privacy?"

#### Core Defense Point:
**Zero-retention architecture, on-device sandboxing, and PII sanitization.**

#### Prepared Answer:
> *"We treat user emotional state as the most sensitive data possible. Our architecture adheres to three strict privacy guarantees:  
> 1. **No Accounts or Telemetry**: The app requires no login, no phone number, no email, and stores no usage tracking.  
> 2. **Identifiers Removed, and Shown First**: Before any text leaves the phone, the app replaces phone numbers, emails, @handles and names (after 'اسمي', or from a list of common names) with placeholders, and shows the user exactly what will be sent before they press continue. A name outside our list can slip through; the preview is the user's final check. The server removes identifiers again with the same rules.  
> 3. **Stateless API & On-Device Memory**: The backend keeps no user text; its log records only path, status and timing. The identifier-free text is processed by Google's Gemini API; on the paid tier Google does not use it to improve its products. The only persistence is an optional chip history on the phone, off by default, holding chip topics and time only, expiring after 1, 7 or 30 days, excluded from Android backup, and erasable with one tap."*

---

### Q3: "What if the AI hallucinates, invents feelings, or writes something harmful?"

#### Core Defense Point:
**The Guardian Layer, the Faithfulness Check, and human-in-the-loop approval.**

#### Prepared Answer:
> *"We employ three defense-in-depth mechanisms:  
> 1. **The Guardian Layer runs BEFORE drafting, on the phone and on the server**: the phone checks our dialect phrase list; then the drafting endpoint itself runs the phrase list and a Gemini risk check before any drafting. If either flags, the text never reaches the drafting model, and a static support card is displayed. If the risk model is down, we return templates rather than draft unchecked text.  
> 2. **Deterministic Output Filter**: Every generated draft is scanned for clinical words, medication terms, and diagnosis labels. A blocked draft is regenerated once, then replaced with a vetted template.  
> 3. **Human-in-the-Loop & The Faithfulness View**: The AI never sends messages automatically. The user reviews the draft, sees which phrases came from their own words (the rest is marked as the AI's wording to check), edits any sentence, and must manually tap Share in their messaging app."*

---

### Q4: "Does this product diagnose conditions or replace mental health specialists?"

#### Core Defense Point:
**Explicit non-clinical boundaries and routing toward early human support.**

#### Prepared Answer:
> *"No, and we explicitly design against clinical mimicry.  
> Specialist psychiatrists and clinical psychologists in Libya are scarce and should not be burdened with everyday exam stress or relational tension. Jisr focuses on early stress intervention by mobilizing existing social circles—siblings, parents, and close friends.  
> Our system prompts and output checks strictly forbid medical diagnosis, condition naming, or therapy jargon. On the capture and drafting screens, our stated limits declare: 'Jisr is not a doctor, not a therapist, not a diagnosis tool, not a replacement for specialists, and not an emergency service.'"*

---

### Q5: "Why is this solution feasible and culturally applicable in Libya specifically?"

#### Core Defense Point:
**Linguistic tuning (Libyan dialect), social norms, and infrastructure realities.**

#### Prepared Answer:
> *"Most global mental health apps fail in Libya for three reasons: language, stigma, and infrastructure.  
> 1. **Language & Dialect**: Young Libyans express stress in Libyan Arabic (*'مضغوط'*, *'حاس روحي بنجنن'*) and Latin-transliterated text (*Arabizi*). Our keyword safety lists are written in Libyan dialect and Arabizi, and our prompts ask the model to match the user's dialect. Rating the drafts' dialect quality with native reviewers is our next step.  
> 2. **Stigma & Family Values**: Mental health in Libya is viewed through family and community lenses. Jisr includes family and trusted adults as recipient choices, using neutral framing (*'ضغط'*, *'امتحانات'*) rather than stigmatizing clinical labels.  
> 3. **Infrastructure**: Jisr is distributed as a lightweight, standalone Android APK (`builds/jisr-v1.0.0.apk`) running on ordinary devices, requires minimal bandwidth (short text payloads), features an offline fallback to pre-written templates (`safety/plain-templates.json`), and integrates directly with WhatsApp and Messenger, which are ubiquitous in Libya."*

---

### Q6: "Why didn't you train or fine-tune an Arabic LLM on local mental health datasets?"

#### Core Defense Point:
**Deterministic safety superiority, avoidance of catastrophic forgetting, and mobile edge constraints.**

#### Prepared Answer:
> *"Three reasons. First, data: we refused to collect real crisis text from young people, and a few hundred synthetic examples are not enough to fine-tune well. Second, risk: fine-tuning a small model on little data can weaken its general language ability and its safety behaviour, and no model, fine-tuned or not, can guarantee it never writes something harmful.  
> So we adopted a **Hybrid Architecture**: one foundation model (Google Gemini, `gemini-flash-lite-latest`) does only the language work, structuring, tone and alignment, inside **deterministic checks** (the Guardian Layer) before and after generation. Safety that matters is enforced by code we can test. Third, devices: running a local model on ordinary phones in Libya would mean large downloads and battery drain; an on-device small model is on our roadmap for offline drafting."*

---

### Q7: "Where did your crisis data come from, and did you scrape private conversations?"

#### Core Defense Point:
**Team-written data, no scraping of private individuals, and honest limits on review.**

#### Prepared Answer:
> *"No private chat logs, social media posts, or vulnerable individuals were scraped—doing so would violate fundamental research ethics.  
> Our datasets fall into three distinct, non-personal typologies, all written by the team:  
> 1. **Crisis Lexicon (60 phrases, tested across 360+ spelling variants)**: written by team members in Libyan colloquial Arabic, MSA, Arabizi and English. It has not yet had an independent native or clinical review; that is on our list.  
> 2. **Clinical Blacklist (55 terms)**: Curated diagnostic and pharmacological terminology barred from generation.  
> 3. **Dev Set (25 items)**: synthetic examples of everyday stress, crisis, and ambiguous hyperbole (*'أنا انتهيت بعد الامتحان'*) used to measure recall and false alarms, and also to tune the list. A blind test set is the next step."*

---

### Q8: "Is that 100% recall measured on the same data you tuned on?"

#### Prepared Answer:
> *"Yes, and we say so. On our 25-item dev set the phrase list catches 10 of 11 crisis items, 90.9%, with a 95% confidence range of 62 to 98%. The one miss, 'الدنيا سوداء في عيني', is exactly the kind of indirect phrasing the model layer is there for. We have not yet measured the model layer or a blind set, so we do not claim a final number. That is also why the 'talk to someone now' button never depends on either check."*

---

### Q9: "Does the APK actually call the AI?"

#### Prepared Answer:
> *"The committed APK was built before our backend URL was published, so on a phone it runs the on-device crisis check, the support card and the plain templates, and it labels them as templates rather than AI. The AI path is live in the web version and in a development build pointed at the backend; a rebuild of the APK with the backend's https address gives the same on a phone."* (Demo from the web version or an emulator with the backend running.)

---

### Q10: "How do you know the AI draft is better than the template?"

#### Prepared Answer:
> *"The comparison view exists so anyone can judge, and its labels are neutral: if the template is better, the user can pick it. We have not yet run a blind rating with native speakers; our plan is 10 dialect inputs, 2 to 3 raters choosing blind between the AI draft and the template, reported as 'AI preferred in X of 30'."*

---

### Q11: "Some users are under 18. How do you handle minors?"

#### Prepared Answer:
> *"Jisr creates no account, collects no identifying data, contacts nobody, and the young person chooses who receives the note, so it never creates a disclosure they did not choose. We recommend that under-18s use it with a trusted adult's knowledge, and the support card always points to a trusted person and, in danger, to the nearest emergency department."*
