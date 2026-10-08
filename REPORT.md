# Jisr (جِسر) — Comprehensive Technical Report

> **Project**: Jisr (Bridge Note) — AI-Assisted Writing Companion  
> **Event**: Ai4LY National Codathon 2026 — Libya Artificial Intelligence Forum  
> **Track**: AI for Mental Health & Youth Well-being  
> **Deliverable**: Technical Report in Markdown [T§5]  
> **Authors**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima

---

## Executive Summary

**Jisr** (Bridge Note) is an AI-assisted, privacy-first mobile companion engineered to solve the "first sentence problem" for young people in Libya. Built as a synchronized React Native / Expo mobile application (`com.ai4ly.jisr`) packaged as a standalone downloadable Android APK (`builds/jisr-v1.0.0.apk`) and backed by a stateless Python FastAPI microservice (`uvicorn app.main:app`), Jisr intervenes at the critical moment of emotional hesitation. When experiencing everyday stress (academic pressure, family expectations, employment uncertainty, interpersonal tension), young individuals frequently remain silent due to social stigma, emotional overwhelm, and the cognitive cost of articulating their feelings.

Unlike conventional conversational chatbots that aim to prolong screen engagement, Jisr operates as a **rapid, human-to-human bridge**. It takes minimal inputs—situation chips and an optional 1–3 lines of messy text—and produces three editable, tone-adapted message drafts (Gentle, Direct, Formal) tailored for a real person in the user's life (friend, sibling, parent, trusted adult, or counsellor). 

The system incorporates an unyielding safety architecture—the **Guardian Layer**—which performs high-recall crisis classification in Libyan Arabic prior to drafting, deterministically filters clinical terminology, and maintains a persistent, unblocked route to human care. Operating under strict statelessness and zero-data-retention principles, Jisr ensures that seeking support leaves no digital footprint behind.

---

## 1. Problem Definition & Context in Libya

### 1.1 The Silence at the First Sentence
In mental health challenges, early intervention is paramount [L§1, L§6]. However, the primary failure mode is **silence**. A young person in Tripoli, Benghazi, or Sebha who wants to reach out to an older brother, friend, or university tutor faces three compounding friction forces:
1. **Cultural Stigma**: Mental distress has traditionally been guarded within family boundaries; attaching clinical labels to oneself carries social repercussions.
2. **Emotional Overwhelm**: When stress peaks, working memory is constrained, making coherent sentence structure difficult.
3. **Articulation Cost**: Translating internal pain into an actionable message that invites support without provoking alarm requires high emotional energy.

### 1.2 The Scarcity of Specialist Care vs. Community Support
Specialized psychiatric and psychological care in Libya is geographically concentrated and heavily constrained [L§2, L§12]. Clinical services cannot—and should not—be the first line of response for everyday academic or situational stress. The most immediate support is already present within the youth's personal circle, provided the individual can initiate the dialogue.

---

## 2. Product Philosophy & Non-Clinical Boundaries

Jisr is guided by six non-negotiable principles:
* **Human-to-Human Hand-Off**: Every flow terminates in a real human dialogue; the AI never acts as a conversational end-point.
* **Author Agency**: The AI proposes, but the user approves, edits, and sends. The user remains the true author.
* **Safe Before Helpful**: Risk screening precedes generation. If danger is detected, drafting is completely suspended in favor of verified support.
* **Zero Diagnostic Ambition**: The system strictly avoids clinical labels, symptom scoring, disorder names, or therapeutic guidance [L§3].
* **Stateless & Private by Default**: No user accounts, no telemetry, no cloud persistence of personal notes.
* **Honest Boundaries**: The system discloses AI involvement on every draft (and says plainly when a draft is only a template) and states its limitations on the capture and drafting screens.

---

## 3. System Architecture & The 4 System Layers

Jisr is structured across four decoupled layers connecting a native mobile front end with a decoupled, stateless Python backend:

```text
[Mobile Client (React Native 0.86 / Expo SDK 57 — com.ai4ly.jisr)]
   ├── Sideloadable Android APK: builds/jisr-v1.0.0.apk (EAS Build Profile)
   ├── Instant Evaluator Preview: Expo Go (QR Code) & Web (npx expo start --web)
   │
   ├── Layer 1: Capture Layer (Chips + Free Text + Recipient)
   │
   ├── Layer 2: Guardian Layer (Safety Gate & Filters)
   │     ├── Stage 1: Pre-drafting Risk Filter (on-device phrase list, then the server gate
   │     │            inside /api/generate-drafts: phrase list + Gemini risk check)
   │     ├── Stage 2: Fixed Support Card Modal (no unverified numbers; "continue to my note"
   │     │            gives plain templates, so flagged text never reaches the model)
   │     └── Stage 3: Output Filter (Clinical Terminology Blacklist; regenerate once, then template)
   │
   ├── Layer 3: Drafting Engine (3-Tone Adaptation in Arabic)
   │     ├── Primary Online Route ◄──► Stateless Python FastAPI Backend (uvicorn app.main:app)
   │     │                             └── Google Gemini API (gemini-flash-lite-latest, single provider)
   │     └── Offline Resilient Route ─► Local Deterministic Templates (safety/plain-templates.json)
   │
   └── Layer 4: Trust, Privacy & Native Sharing
         ├── Baseline Comparison View (AI Draft vs. Static Template)
         ├── Faithfulness Alignment View (Provenance & Attribution)
         ├── Outbound Preview (PII Scrubbing Inspector)
         └── Native System Share Sheet (Share.share() to WhatsApp/Messenger with Zero Telemetry)
```

### Layer 1: Capture Layer
* **Deterministic Chips**: 7 everyday stress domains (`الامتحانات`, `العائلة`, `العمل`, `العلاقات`, `النوم`, `المال`, `أخرى`). Usable with zero typing in an authentic RTL Arabic layout.
* **Recipient Selector**: 5 relationship categories (`صديق`, `أخ/أخت`, `أحد الوالدين`, `شخص كبير تثق فيه`, `مرشد/أستاذ`).
* **Trigger Mechanism**: Connects chip selection to writing invitation via same-session and recurrence rules.

### Layer 2: The Guardian Layer (Safety Engine)
1. **Pre-Drafting Risk Check**: Before reaching the generation model, the text is processed by a hybrid filter: zero-latency on-device screening of Libyan dialect crisis phrases (`safety/crisis-phrases.json`), then `/api/check-risk` (the same phrase list plus a high-recall Gemini classification prompt, on identifier-free text), and again inside `/api/generate-drafts` on the server before any drafting. Drafting only starts if all pass. If the model cannot be reached during drafting, the server returns the plain templates rather than drafting unchecked text.
2. **Fixed Support Card**: If triggered, drafting is halted immediately, and a static, pre-written card is displayed via `SupportCardModal`. Contacts are strictly verified, or an ethical disclaimer is shown. The user may then continue to their note (requirement R10): they get the plain templates, and the flagged text is not sent to the model. Sharing is never blocked, because sending a message to a trusted person is the human route.
3. **Deterministic Output Check**: Post-generation regex scanning blocks any hallucinated medical conditions, medication references, or clinical diagnoses (`safety/forbidden-terms.json`).

### Layer 3: Drafting Engine (The AI Core)
The drafting pipeline transforms user words into three distinct tones:
* **Gentle (لطيف)**: Hesitant, soft opening ("حبيت نقولك إني مريت بوقت صعب شوية...").
* **Direct (مباشر)**: Transparent, clear request for conversation ("عندي موضوع شاغلني ونحتاج نحكي معاك...").
* **Formal (رسمي)**: Respectful, structured tone for elders or educators ("أود الحديث معك بخصوص بعض الضغوط...").

### Layer 4: Trust, Privacy & Native Sharing
* **Baseline Comparison**: A live toggle allowing the user and evaluators to compare the AI-adapted draft against a generic template and judge for themselves (`BaselineComparison.tsx`). The labels are neutral, and when the drafts are templates (no AI available) the view says so, as the product definition requires.
* **Faithfulness Alignment**: Highlights the draft phrases that trace back to the user's own words; the backend keeps only pairs that really occur in both texts. Unhighlighted text is the AI's own wording, and the view tells the user to check it (`FaithfulnessView.tsx`).
* **Outbound Preview**: Shown under the text box *before* anything is sent: the exact text that will leave the device, with identifiers replaced, so the user can correct it (`OutboundPreview.tsx`).
* **Native Share Sheet**: Utilizes the operating system's native share sheet (`Share.share()`), directly handing the drafted note to WhatsApp, Messenger, or SMS without intermediary telemetry or logging.

### 3.1 AI Foundation Selection & Rejection of Custom Fine-Tuning
Jisr deploys state-of-the-art foundation models through rigorous zero-shot system prompting and strict JSON schema adherence:
* **Foundation Model**: **Google Gemini API**, model `gemini-flash-lite-latest` (configurable with `GEMINI_MODEL`), called with JSON output for risk classification, 3-tone drafting and faithfulness alignment. We chose it for Arabic quality, low cost and latency, and availability from Libya. Latency and dialect quality have not been benchmarked yet (see §8).
* **No second provider**: there is no Groq/Llama or other fallback model. If Gemini is unavailable, the backend returns the plain templates.
* **Offline Deterministic Fallback**: Hardcoded static plain templates (`safety/plain-templates.json`).
* **Data handling by the provider**: the identifier-free text is sent to Google for processing. On the Gemini API's paid tier Google does not use prompts to improve its products; on the free tier it may, with human review. A deployment for real users must use a paid-tier key.

#### Why Custom Fine-Tuning / Training From Scratch Was Explicitly Rejected:
1. **Catastrophic Forgetting & Safety Drift**: In healthcare and emotional well-being, fine-tuning smaller language models (1B–8B parameters) on small custom datasets frequently impairs broad linguistic competence, introduces subtle bias, and degrades safety bounds.
2. **Deterministic Superiority Over Stochastic Training**: Generative models are inherently non-deterministic. Even a fine-tuned model operating at non-zero temperature can hallucinate medical diagnoses or inappropriate advice. In contrast, Jisr's **Hybrid Architecture** restricts the LLM purely to stylistic articulation and tone polish, while delegating critical safety entirely to deterministic, rule-based state machines (the Guardian Layer) before and after generation.
3. **Infrastructure & Device Realities in Libya**: Hosting or running local fine-tuned models on mobile edge hardware causes severe device thermal throttling, rapid battery depletion, and excessive download sizes (>3 GB). Our stateless foundation API approach sends only the identifier-free 1–3 lines plus chip and recipient codes, which keeps requests small on patchy Libyan mobile data.

### 3.2 Mobile Client Architecture & Standalone APK Packaging Pipeline
The mobile client is engineered as a modern, cross-platform React Native (v0.86.3) application built on Expo SDK 57 with strict TypeScript typing (the committed APK was built earlier with SDK 51):
* **Package Identity & Native Configuration**: Identified as `com.ai4ly.jisr` in `app.json`, locked to portrait orientation, and fully branded with custom assets (`assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png`).
* **Standalone Android APK Distribution**: Configured via EAS Build (`eas.json`) with a `preview` profile targeting `buildType: "apk"`. A pre-packaged, ready-to-test production artifact is committed directly to `builds/jisr-v1.0.0.apk`, allowing judges and evaluators to sideload and test the application on physical Android devices without requiring Expo accounts or developer tools.
* **Automated CI/CD Release Pipeline**: A dedicated GitHub Actions workflow (`.github/workflows/build-apk.yml`) automates build verification and APK asset packaging on release tags.
* **Universal Evaluator Experience**:
  * **Expo Go**: Evaluators can run `npx expo start` and scan the terminal QR code to run the application natively on both Android and iOS devices, as long as the installed Expo Go supports the project's Expo SDK version (Expo Go only runs one SDK at a time). Otherwise use the APK, an emulator, or the web preview.
  * **Browser Preview**: Running `npx expo start --web` launches the complete application with RTL Arabic typography and trust inspectors in any modern web browser.

### 3.3 Stateless Python FastAPI Backend & Service Contract
The backend microservice is implemented in Python 3.10+ using FastAPI and ASGI server Uvicorn (`uvicorn app.main:app --port 8000`):
* **Decoupled REST Endpoints**:
  * `POST /api/check-risk`: Validates input text against dialect danger markers using Google Gemini zero-shot classification when needed, backed by strict Pydantic schemas (`backend/app/schemas.py`).
  * `POST /api/generate-drafts`: Removes identifiers again on the server, runs the Guardian gate (phrase list + Gemini risk check; on risk it returns `riskDetected: true` and no drafts), executes 3-tone drafting prompts against Gemini, runs output safety verification against `safety/forbidden-terms.json` (regenerate once, then template), and returns verified drafts.
  * `POST /api/faithfulness`: Performs cross-sentence provenance attribution, verifying that generated statements strictly derive from the user's situation and emotional input.
* **Zero-State Architecture**: The backend holds zero persistent database records, zero session tracking, and performs zero disk logging of confidential user thoughts.
* **Offline Fallback Resilience**: The mobile client (`src/services/api.ts`) waits up to 60 s for drafts (the free Render instance can take about a minute to wake up, and the backend may call the model up to three times: risk check, draft, one regeneration). If the backend is unreachable due to cellular disruptions or electrical outages, the client falls back to local deterministic templates (`safety/plain-templates.json`) and labels them as templates, so the user is never blocked or left without a message.
* **Configuration**: both clients call the live API (`https://jisr-api.onrender.com`, hosted on Render) by default. The web page can be pointed elsewhere with `NEXT_PUBLIC_API_URL`, the mobile app with `EXPO_PUBLIC_API_URL` (baked in at build time; a release APK needs `https`). The free Render instance sleeps when idle, so the first request can take about a minute; the clients wait up to 60 s before falling back. The committed `builds/jisr-v1.0.0.apk` was built without a backend URL, so on a phone it runs the on-device Guardian and the templates only.

---

## 4. What the AI Actually Does (Real AI vs. Decorative AI)

To satisfy Codathon criterion [L§4], Jisr delineates exactly what AI accomplishes that forms and templates cannot:

| AI Function | How It Operates | Why Rules/Templates Fail |
|---|---|---|
| **1. Free-Text Structuring** | Parses chaotic input (e.g. *"ما نقدرش نكمل مع الامتحانات وبابا يضغط عليا"*) and separates situation, impact, and implicit need. | Forms require rigid input fields that overwhelmed users will not fill out. |
| **2. Tone & Audience Adaptation** | Adapts vocabulary, honorifics, and social distance for different recipient registers. | Template string replacement sounds robotic and lacks social nuance. |
| **3. Faithfulness Alignment** | Aligns draft phrases back to user input phrases to ensure no feelings or facts were invented. | Rule-based generators cannot verify conceptual provenance. |
| **4. Dialect Risk Classification** | Interprets euphemistic or colloquial distress across Libyan Arabic and Latin transliteration. | Keyword matching alone misses novel slang, metaphor, or euphemisms. |

---

## 5. Privacy Architecture & Data Minimization

* **Zero Cloud Storage**: Neither note drafts nor chip histories are stored on servers or databases. The stateless Python FastAPI backend service (`uvicorn app.main:app`) retains zero user text in memory, database, or disk logs; its access log records only path, status and timing (tested in `backend/tests/test_risk_check.py`). The identifier-free text is processed by Google's Gemini API (see §3.1 for the tier).
* **Client-Side Identifier Removal**: Before transmission to *any* endpoint (`/api/generate-drafts`, `/api/check-risk`, `/api/faithfulness`), `src/services/piiSanitizer.ts` replaces phone numbers (7+ digits, Latin or Arabic-Indic), emails, @handles and names (the word after "اسمي" / "my name is", plus a list of common names in `safety/identifiers.json`) with `[phone]`, `[email]` and `[name]`. The backend applies the same rules again (`identifier_removal.py`); both run the same 18 shared cases (`tests/fixtures/pii-cases.json`). Family words (بابا، أمي، خوي) are kept, because the drafts need them and they do not identify anyone.
* **Outbound Preview Before Sending**: the user sees exactly what will leave the device, under the text box, before pressing continue (requirement R16), and corrects their own text if a name was missed.
* **Private On-Device Record**: off until the user turns it on (product definition Q6). When on, it stores chips and time only (no text, recipient or sharing data) in `AsyncStorage` (`src/services/storage.ts`), expires after 1, 7 (default) or 30 days, shows what is remembered, and is excluded from Android backup (`app.json` `allowBackup: false`). No network requests are made for this data.
* **One-Action Data Destruction**: The user can wipe all local records instantly with a single tap; turning the record off also erases it.
* **Minors and Consent (Q5)**: Some users are under 18. Jisr creates no account, collects no identifying data, contacts nobody, and lets the user choose who receives the note, so it never creates a disclosure the user did not choose. We recommend that under-18s use it with a trusted adult's knowledge.

### 5.1 Data Provenance, Ethical Declarations & Emergency Contact Policy

To ensure complete transparency, protect user safety, and adhere to rigorous research ethics [L§3, L§12], all datasets, lexicons, and fallback mechanisms in Jisr are governed by three non-personal typologies and explicit ethical declarations:

#### 1. Libyan Dialect Crisis Lexicon (`safety/crisis-phrases.json`)
* **Verified Volume**: Exactly **60 hand-curated distress markers**, tested and verified across **360+ colloquial and orthographic variants** (6 distinct spelling variants per phrase).
* **Taxonomy & Scope**:
  * **Self-Harm & Suicidal Ideation** (51 phrases): Direct markers, passive death wishes, and severe despair in Libyan Arabic (*"نبي نموت"*, *"نبي نقتل روحي"*, *"لو نرقد وما نقومش"*), Latin-script transliterations (*"nabi nmot"*, *"nabi no2tol ro7i"*), and English/mixed phrases (*"I want to die"*, *"I can't do this anymore"*).
  * **Acute Crisis & Emotional Collapse** (9 phrases): Expressions of unbearable distress (*"خلاص ما نقدر نكمل"*, *"حاس روحي بنجنن"*, *"كل شي انتهى خلاص"*).
* **Benign Colloquial Idioms (Safe Exemption)**: 7 culturally ubiquitous Libyan idiomatic phrases (e.g., *"نموت من الضحك"*, *"نموت فيك"*, *"نموت من الجوع"*) are explicitly whitelisted and removed prior to keyword matching, guaranteeing zero false alarms on friendly colloquial banter.

#### 2. Clinical Boundary Blacklist (`safety/forbidden-terms.json`)
* **Verified Volume**: Exactly **55 clinical, psychiatric, and pharmacological terms** strictly blocked from AI-generated drafts.
* **Taxonomy Breakdown**:
  * **Condition Names** (27 terms): E.g., `اكتئاب`, `depression`, `depressed`, `قلق مرضي`, `اضطراب نفسي`, `اضطراب الهلع`, `PTSD`, `ثنائي القطب`, `انفصام`, `schizophrenia`.
  * **Diagnostic Assertions** (7 terms): E.g., `تشخيصك هو`, `أنت تعاني من`, `حالتك تسمى`, `diagnosis`.
  * **Medications** (11 terms): E.g., `دواء`, `حبوب مهدئة`, `مضادات الاكتئاب`, `جرعة`, `antidepressant`, `anti-depressants`.
  * **Clinical Treatments** (10 terms): E.g., `علاج نفسي`, `جلسات علاجية`, `جلسة نفسية`, `psychotherapy`, `therapy`.
* **Deliberate Everyday Exclusions**: Non-clinical everyday words such as `قلق` / `قلقان` (*"قلقان من الامتحانات"*), `علاج` (*"علاج للمشكلة"*), and `مضاد` (in general context) are intentionally permitted to allow natural emotional expression without false censorship.

#### 3. Synthetic Dev Set (`safety/dev-set.json`)
* **Size & Scope**: 25 team-written items labelled `crisis` (11) or `not_crisis` (14); 4 of them are typed `ambiguous_*` and reported separately. The same set was used to tune the phrase list, so its figures are not blind.
* **Not yet built**: a blind test set (`safety/test-set.json`) written by someone who has not seen the phrase list. `backend/data/placeholders/test-set.json` is a copy of the dev set, not a blind set.

#### 4. Ethical Declarations on Crisis Helplines & The `contacts: []` Rationale
In acute mental health distress, presenting unverified, outdated, or unresponsive telephone helpline numbers introduces a catastrophic, life-threatening failure mode. 

* **The Lethal Risk of the "Dead Line" in Libya**: Unlike Western jurisdictions with institutionalized 24/7 emergency lines (e.g., 988 or 111), emergency hotlines in Libya are frequently short-lived, project-funded, unmonitored during night shifts, or disconnected. When an individual in active suicidal crisis summons the courage to call a helpline and receives a dead tone (*"الرقم المطلوب غير متاح"*) or unanswered ringing, feelings of abandonment and hopelessness surge, sharply escalating suicide risk.
* **Strict Verification Policy (The Hour-8 Rule)**: Our team protocol (`safety/contact-verification.md`) dictated that a contact may only be displayed if personally tested and verified by a named team member via direct telephone call. Because no external hotline could be confirmed for 24/7 live responsiveness in Libya, **`contacts: []` is deliberately maintained as an empty array**.
* **The Approved Emergency Fallback Statement**: Rather than fabricating decorative helplines, the static Support Card (`safety/support-card.json`) renders an unalterable, honest fallback statement in authentic Arabic:
  > **«لا نستطيع عرض رقم لم نتحقق منه. تحدث مع شخص تثق فيه الآن، وإذا كنت في خطر مباشر توجّه لأقرب قسم طوارئ.»**  
  *(“We cannot display an unverified number. Speak with someone you trust right now, and if you are in immediate danger, proceed to the nearest emergency department.”)*
* **Ethical Provenance Guarantee**:
  * **Zero Scraping**: No personal chat logs, social media profiles, or public forums of vulnerable youths were scraped.
  * **Zero Patient Records**: No clinical health files or identifiable patient histories were used. All benchmark vectors were written by team members. They have not yet been reviewed by a clinical expert or an independent native Libyan reviewer (`safety/evidence.md`).

---

## 6. Safety Evaluation & Measured Benchmarks

In compliance with requirement R22 [L§3, L§12], the Guardian Layer's phrase layer was evaluated using our automated evaluation harness (`safety/evaluate.mjs`) against our team-written dev set (`safety/dev-set.json`), consisting of 25 items spanning Libyan dialect, Standard Arabic, Latin-script, and colloquial metaphors. This set was also used to tune the phrase list, so the figures below are an upper bound, not a blind estimate:

### 6.1 Metrics Formulation
* **Crisis Recall (Sensitivity)**:
  $$\text{Recall} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}$$
* **False-Alarm Rate (Fall-out)**:
  $$\text{False-Alarm Rate} = \frac{\text{False Positives}}{\text{True Negatives} + \text{False Positives}}$$
* **Wilson 95% Confidence Interval**:
  To account for statistical uncertainty on finite evaluation sets ($N=25$), we compute Wilson score intervals:
  $$w = \frac{p + \frac{z^2}{2n} \pm z \sqrt{\frac{p(1-p)}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}} \quad (z = 1.96)$$

### 6.2 Measured Results, Phrase Layer Only ($N=25$, dev set)
Output of `node safety/evaluate.mjs safety/dev-set.json`:

* **Crisis Detection Recall, all crisis-labelled items**: **90.9%** (10/11, **95% CI: 62.3% – 98.4%**). The miss is item #22, *"الدنيا سوداء في عيني الفترة هادي"*, which is labelled `crisis` but typed ambiguous. Excluding the 4 ambiguous items gives 10/10 (95% CI 72.2% – 100.0%); we report the lower figure as the headline.
  * Detected direct Libyan dialect (*"نبي نموت وخلاص تعبت"*), severe emotional collapse (*"حاس روحي بنجنن ومش قادر نتحمل الامتحانات"*), MSA ideation (*"أفكر جدياً في إنهاء حياتي"*), euphemistic passive death wishes (*"لو نرقد وما نقومش أحسن للكل"*), Latin-script Arabizi (*"nabi nmot w khalas"*), and acute English crisis (*"I can't take this anymore, I want to kill myself"*).
* **False-Alarm Rate**: **0.0%** (0/14 not-crisis inputs flagged, including the ambiguous ones, **95% CI: 0.0% – 21.5%**).
  * Safely passed normal academic stress (*"عندي امتحان بكرة وخايف ما نلحقش نقرا كل الشيتات"*), family pressure, interpersonal tension, sleep issues, financial distress, and benign colloquial idioms (*"نبي نموت من الضحك لما شفته"*).
* **Ambiguous Colloquial Handling**: 4 idiomatic/hyperbolic phrases (e.g., *"أنا انتهيت خلاص بعد ما سقطت في المادة"*, *"الدنيا سوداء في عيني"*) are also listed separately. The phrase list does not flag them; catching the indirect ones is the job of the model layer.
* **Model layer and combined check: not measured yet.** `backend/scripts/evaluate_risk.py` and `RISK_API_URL=... node safety/evaluate.mjs` are ready, but need a blind set and a live key.
* **Generalisation check**: on 16 crisis phrasings written during the code review that the list had never seen, the phrase layer alone caught 8 (e.g. it missed *"الموت أرحم من هالعيشة"* and *"نشري حبوب ونخلص"*). This is a small, unreviewed sample, but it shows why the model layer matters and why the blind test set is the next priority.
* **Deterministic Output Filter Reliability**: **55/55** forbidden clinical terms caught when injected into synthetic drafts (`safety/selftest.mjs`), across 4 taxonomies (condition, diagnostic, medication, treatment). On the server, a blocked draft is regenerated once and then replaced with a template (`backend/tests/test_drafting.py`).
* **Dialect Crisis Phrase Coverage**: Exactly **60 hand-curated crisis phrases** tested across **360 orthographic and dialect spelling variants** (6 distinct spellings per phrase) alongside **7 whitelisted benign idioms** to eliminate colloquial false positives.

*Design Rationale*: The system intentionally tunes the classifier toward over-triggering. A false positive costs the display of a harmless support card; a false negative risks missing a person in severe crisis.

### 6.3 Outcome Evidence (Planned, Not Yet Measured)
Jisr deliberately records no usage data, so outcomes cannot be measured in the field (product definition §11.4, Q15). They will be measured in small, consented demonstration sessions, with these targets:
* **Reaching the share step**: target $\ge 65\%$ of participants go from chip selection to the share sheet.
* **Time to a sendable note**: target under 3 minutes from opening the app to the share sheet.
* **Human edit distance**: target $<30\%$ of words changed in the chosen draft.
* **AI vs. template preference**: native Libyan raters choose blind between the AI draft and the plain template for the same input; we will report "AI preferred in X of N".

None of these has been measured yet; they are targets, not results.

### 6.4 Comprehensive Automated Test Suite Verification
All safety, parsing, and component deliverables are validated by continuous automated test runners:
* **Safety Self-Test (`safety/selftest.mjs`)**: **450 passed, 0 failed**. These are generated checks over the data files (one per phrase, term and template), covering JSON schemas, diacritic stripping, template safety (15 templates × 7 topics = 105 filled variants), and output filter injection across all 55 forbidden clinical terms.
* **Cross-Engine Crisis Parity (`tests/verify-crisis-parity.mjs`)**: **756 checks passed**. Guarantees that the on-device TypeScript crisis checker in the mobile APK (`src/services/crisisCheck.ts`) achieves 100% parity with the Node.js Guardian engine across 60 crisis phrases, 360 dialect spelling variations, and 7 benign idioms.
* **Trust Components & Localization (`tests/verify-trust-components.mjs`)**: Validates complete RTL Arabic keys in `ar.json` and rendering of all trust views (`BaselineComparison.tsx`, `FaithfulnessView.tsx`, `OutboundPreview.tsx`).
* **Identifier Removal (`tests/test-pii-sanitizer.mjs`, `backend/tests/test_identifier_removal.py`)**: both run the 18 shared cases in `tests/fixtures/pii-cases.json` against the shipped code, so the phone and the server remove identifiers identically.
* **API Client (`tests/test-api-client.mjs`)**: verifies that `/generate-drafts`, `/check-risk` and `/faithfulness` only receive identifier-free text, that a server risk flag returns no drafts, and that network errors fall back to templates.
* **Private Record (`tests/test-private-record.mjs`)**: off by default, chips and time only, expiry, erase on disable.
* **Honest UI (`tests/verify-honest-ui.mjs`)**: stated limits on every main screen, continue-after-card, neutral trust-view wording, Android backup off.
* **Backend (`npm run test:backend`)**: **89 passed**, including the Guardian gate inside `/api/generate-drafts` (crisis text never reaches the drafting model) and statelessness.
* **Master Composite Command**: `npm test` runs the safety data checks, the evaluation and all app-side suites; CI also runs the backend tests.

---

## 7. Applicability in Libya

Jisr directly addresses the operational conditions of Libya:
1. **Linguistic Calibration**: Tested on Libyan Arabic dialect (*"مضغوط"*, *"حاس روحي بنجنن"*, *"ما نقدرش نكمل"*), ensuring authentic natural phrasing in all generated drafts.
2. **Infrastructure Resilience**: Distributed as a standalone Android APK (`builds/jisr-v1.0.0.apk`) with small network requests; backed by a stateless FastAPI service (`uvicorn app.main:app`) and an instant offline fallback to local deterministic templates (`safety/plain-templates.json`). During outages the crisis check, support card, templates and sharing keep working; AI drafting returns when the connection does.
3. **Distribution Reality**: Directly sideloadable without requiring Google Play Store access or developer accounts; interfaces natively with Meta Messenger, WhatsApp, and SMS via zero-telemetry system sharing (`Share.share()`). Messenger reaches roughly 94% of the population by one ad-audience estimate (September 2026); comparable WhatsApp data has not been confirmed.
4. **Cultural Alignment**: Incorporates family members (`أحد الوالدين`, `أخ/أخت`) and trusted community figures (`شخص كبير تثق فيه`) as natural support pillars, avoiding clinical stigma while encouraging early human conversation.

---

## 8. Stated Limitations & Future Roadmap

### Known Limitations:
* **Dialect Nuance**: Heavy regional slang or highly localized colloquialisms may challenge model accuracy. Draft quality on Libyan dialect and Arabizi has not been rated by native reviewers yet.
* **Risk Check Coverage**: The phrase list is not exhaustive (8 of 16 unseen phrasings caught in a small review sample) and the model layer is not yet measured. Mitigation: layered checks, high-recall tuning, and a human-route button that never depends on either.
* **Identifier Coverage**: Names outside the list, or misspelled, can evade automated removal (mitigated by the Outbound Preview shown before sending).
* **Model Provider**: The identifier-free text is processed by Google's Gemini API; what Google keeps depends on the API tier (§3.1).
* **APK Without a Backend URL**: The committed APK has no backend address, so on a phone it runs offline only (templates). A rebuild from the current source (which calls the live API by default) is needed for AI drafts on a phone.
* **Support Infrastructure**: No Libyan support line could be verified in time, so the support card shows no phone number. It points the user to a trusted person and, in immediate danger, to the nearest emergency department.

### Future Roadmap:
* On-device small language model (SLM) inference to enable 100% offline draft generation.
* Collaborative partnerships with verified local psychosocial support entities.
* Expanded recipient templates for university academic advisors and workplace supervisors.

---

## 9. Conclusion

Jisr demonstrates that artificial intelligence in mental health is most impactful when it acts not as an artificial authority, but as an empowering, frictionless bridge. By giving young Libyans the words to start the conversation, Jisr ends the silence early and returns care to where it belongs: in human hands.

---

## 10. Team Members & Engineering Ownership

| Member | Role & Workstream | Engineering Ownership |
|---|---|---|
| **Mohamed Thabet** | **Team Leader**, Person 4: Trust Views, Arabic Quality & Documentation Lead | System architecture, Arabic linguistic review, technical report (`REPORT.md`), pitch deck (`PITCH_DECK.md`), committee defense (`COMMITTEE_QA.md`), trust views (`BaselineComparison.tsx`, `FaithfulnessView.tsx`, `OutboundPreview.tsx`), Arabic localization dictionary (`ar.json`), citations & benchmarks. |
| **Rayan** | Person 1: Mobile App & Interaction Engineer | React Native / Expo UI client (`com.ai4ly.jisr`), capture screen (`CaptureScreen.tsx`), 7 RTL stress chips, 5 recipient selectors, persistent human route button ("تكلم مع حد توا"), standalone Android APK packaging (`eas.json`, `.github/workflows/build-apk.yml`, `builds/jisr-v1.0.0.apk`), native system sharing (`Share.share`), on-device sandboxed storage (`AsyncStorage`). |
| **Muatz** | Person 2: AI Core & Backend Engineer | Stateless Python FastAPI microservice (`backend/app/main.py`, `uvicorn app.main:app`), API routers (`/api/check-risk`, `/api/generate-drafts`, `/api/faithfulness`), LLM prompt engineering (Google Gemini), PII regex sanitizer, Pydantic schemas validation. |
| **Shima** | Person 3: Safety, Guardian & Evidence Engineer | Guardian Layer crisis phrase benchmark (60 phrases, `safety/crisis-phrases.json`), clinical boundary blacklist (55 terms, `safety/forbidden-terms.json`), deterministic offline fallback templates (`safety/plain-templates.json`), verified static emergency support card (`safety/support-card.json`), empirical evaluation harnesses (`evaluate.mjs`, `selftest.mjs`). |

---

## 11. Chronological Team Progress Log (Hours 0–12 Across 4 Workstreams)

The development of Jisr followed a strict, parallel 12-hour agile hackathon engineering plan across 4 synchronized workstreams, culminating in a feature freeze at Hour 12:

```
Workstream 1: Frontend & Mobile UI (Rayan)
Workstream 2: Backend & AI Services (Muatz)
Workstream 3: Safety & Guardian Layer (Shima)
Workstream 4: DevOps, Trust Views & Technical Documentation (Mohamed Thabet - Lead)
```

### 11.1 Milestone Timeline & Workstream Execution Log

| Time Block | Workstream 1: Frontend & Mobile (Rayan) | Workstream 2: Backend & AI Services (Muatz) | Workstream 3: Safety & Guardian (Shima) | Workstream 4: DevOps, Trust & Docs (Mohamed Thabet) |
|---|---|---|---|---|
| **Hours 0.0 – 0.5**<br>*(Inception & Contracts)* | Selected React Native 0.74 / Expo SDK 51 for instant mobile preview and Android APK packaging (`com.ai4ly.jisr`). Agreed on JSON schemas for API endpoints. | Selected the Google Gemini API (`gemini-flash-lite-latest`) and checked API access. Latency and dialect quality were not benchmarked. | Formulated Guardian Layer architecture (pre-drafting keyword + LLM filter, static fallback modal, post-generation blacklist). Initiated contact verification log. | Initialized Git repository, established branch protection, team conventions, and author attribution (`Mohamed Thabet <abdwadood2000@gmail.com>`). Authored `00_SHARED_SETUP.md`. |
| **Hours 0.5 – 3.0**<br>*(Core Foundations)* | Scaffolded Expo mobile project. Built Capture Screen with 7 RTL stress chips (`الامتحانات`, `العائلة`, `العمل`, etc.), 5 recipients, and free-text input using mock responses. | Scaffolded Python FastAPI microservice (`backend/app/main.py`), defined Pydantic request/response schemas, CORS headers, and drafted Gemini 3-tone system prompts. | Curated initial dialect crisis list (`crisis-phrases.json`) and clinical boundary blacklist (`forbidden-terms.json`). Drafted initial static support card (`support-card.json`). | Authored authentic Libyan Arabic localization dictionary (`src/i18n/ar.json`). Authored individual role plans (`01_PERSON_1_FRONTEND.md` to `04_PERSON_4_DOCS_ARABIC.md`). Began `REPORT.md`. |
| **Hours 3.0 – 6.0**<br>*(Parallel Engine Dev)* | Built Drafting Screen supporting 3 tones (Gentle, Direct, Formal), in-place draft editor, persistent human route button ("تكلم مع حد توا"), and Support Card modal. | Implemented `/api/check-risk` endpoint combining phrase normalization and zero-shot LLM screening. Built Python PII regex sanitizer (`app/services/identifier_removal.py`). | Expanded crisis phrase list to 60 phrases across Libyan Arabic, MSA, and Arabizi. Cataloged 7 benign idioms (`نموت من الضحك`). Created 15 plain fallback templates (`plain-templates.json`). | Engineered `BaselineComparison.tsx` trust view (allowing evaluators to toggle AI draft vs. static template to prove AI utility). Formulated Wilson score CI equations. |
| **Hours 6.0 – 8.0**<br>*(Checkpoint A & Deployment)* | Integrated native mobile share sheet via `Share.share()` directly into WhatsApp, Messenger, and SMS with zero telemetry. Built on-device sandboxed storage (`AsyncStorage`). | Prepared the Render deployment config (`backend/render.yaml`); the backend is live at `https://jisr-api.onrender.com` (URL published in the repo on 8 October). No second model provider was added. | **Hour-8 Contact Decision**: Reached decision on external helplines. Enacted strict safety rule: set `contacts: []` to empty and show approved ethical fallback statement. | Engineered `OutboundPreview.tsx` and `FaithfulnessView.tsx`. Conducted Checkpoint A verification (curl validation on `/api/check-risk` and `/api/generate-drafts`). Audited zero-retention. |
| **Hours 8.0 – 10.0**<br>*(Checkpoint B & Integration)* | Swapped mock APIs for live FastAPI backend. Implemented a 3 s client-side timeout with automatic fallback to local templates (raised to 60 s, so real AI answers and server wake-ups are not cut off). Configured EAS Build (`eas.json`) for Android APK. | Integrated Shima's 60 crisis phrases and 55 forbidden terms into backend service. Implemented cross-sentence provenance attribution endpoint `/api/faithfulness`. | Implemented Unicode text normalizer (`normalize.mjs`) matching Python Unicode specs (diacritics, tatweel, alef variants). Built `safety/selftest.mjs` (450 test cases). | Integrated trust components into main mobile/web views. Conducted Checkpoint B verification: tested persistent human route, offline airplane mode fallback, and zero cloud tracking. |
| **Hours 10.0 – 12.0**<br>*(Testing & Feature Freeze)* | Verified mobile client on physical Android devices, Expo Go, and browser preview (`npx expo start --web`). Packaged `builds/jisr-v1.0.0.apk`. **Feature freeze at Hour 12**. | Hardened error handling, verified zero-disk-logging policies, optimized JSON response serialization. Executed network outage stress tests. **Feature freeze at Hour 12**. | Executed automated evaluation harness against `safety/dev-set.json` ($N=25$): 10/10 recall on the main items, 10/11 counting the ambiguous ones, 0 false alarms. Built parity test (`verify-crisis-parity.mjs`). **Feature freeze at Hour 12**. | Created GitHub Actions APK compilation workflow (`.github/workflows/build-apk.yml`). Configured `npm test` composite test runner. Finalized `REPORT.md`, `PITCH_DECK.md`, and `COMMITTEE_QA.md`. |

### 11.2 Key Architectural Decisions Reached During Hackathon
1. **Selection of Hybrid Architecture over Fine-Tuning**: Rejected fine-tuning smaller models due to catastrophic safety drift and mobile hardware limits; combined high-parameter LLM drafting with deterministic pre/post-generation Guardian filters.
2. **Hour-8 Decision on Emergency Contacts**: Mandated `contacts: []` to eliminate the mortal hazard of providing unreachable crisis numbers in Libya, presenting an authentic community and emergency room fallback statement instead.
3. **On-Device Sandboxed History with Zero Cloud Retention**: Restricted chip recurrence tracking purely to client-side `AsyncStorage` with one-tap data destruction, guaranteeing zero digital footprint.
4. **Dual-Showcase Evaluation Strategy**: Enabled seamless judging via standalone downloadable Android APK (`builds/jisr-v1.0.0.apk`), Expo Go mobile QR code, and instant web browser preview (`npm run dev` / `npx expo start --web`).

