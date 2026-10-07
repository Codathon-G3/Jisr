# 📑 Jisr (جِسر) — Comprehensive Technical Report

> **Project**: Jisr (Bridge Note) — AI-Assisted Writing Companion  
> **Event**: Ai4LY National Codathon 2026 — Libya Artificial Intelligence Forum  
> **Track**: AI for Mental Health & Youth Well-being  
> **Deliverable**: Technical Report in Markdown [T§5]  
> **Authors**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima

---

## Executive Summary

**Jisr** (Bridge Note) is an AI-assisted, privacy-first mobile companion engineered to solve the "first sentence problem" for young people in Libya. When experiencing everyday stress (academic pressure, family expectations, employment uncertainty, interpersonal tension), young individuals frequently remain silent due to social stigma, emotional overwhelm, and the cognitive cost of articulating their feelings.

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
* **Honest Boundaries**: The system clearly discloses AI involvement and states its limitations on every screen.

---

## 3. System Architecture & The 4 System Layers

Jisr is structured across four decoupled layers:

```
[Mobile Client (React Native / Expo)]
      │
      ├── Layer 1: Capture Layer (Chips + Free Text + Recipient)
      │
      ├── Layer 2: Guardian Layer (Safety Gate & Filters)
      │     ├── Stage 1: Pre-drafting Risk Filter (Keyword + LLM)
      │     ├── Stage 2: Fixed Support Card (Deterministic Fallback)
      │     └── Stage 3: Output Filter (Blacklist of Clinical Terms)
      │
      ├── Layer 3: Drafting Engine (3-Tone Adaptation in Arabic)
      │
      └── Layer 4: Trust & Control (Baseline Comparison + Native Share Sheet)
```

### Layer 1: Capture Layer
* **Deterministic Chips**: 7 everyday stress domains (`الامتحانات`, `العائلة`, `العمل`, `العلاقات`, `النوم`, `المال`, `أخرى`). Usable with zero typing.
* **Recipient Selector**: 5 relationship categories (`صديق`, `أخ/أخت`, `أحد الوالدين`, `شخص كبير تثق فيه`, `مرشد/أستاذ`).
* **Trigger Mechanism**: Connects chip selection to writing invitation via same-session and recurrence rules.

### Layer 2: The Guardian Layer (Safety Engine)
1. **Pre-Drafting Risk Check**: Before reaching the generation model, the text is processed by a hybrid filter: a regex dictionary of Libyan dialect crisis phrases and a high-recall zero-shot classification prompt.
2. **Fixed Support Card**: If triggered, drafting is halted, and a static, pre-written card is displayed. Contacts are strictly verified, or an ethical disclaimer is shown.
3. **Deterministic Output Check**: Post-generation regex scanning blocks any hallucinated medical conditions, medication references, or clinical diagnoses.

### Layer 3: Drafting Engine (The AI Core)
The drafting pipeline transforms user words into three distinct tones:
* **Gentle (لطيف)**: Hesitant, soft opening ("حبيت نقولك إني مريت بوقت صعب شوية...").
* **Direct (مباشر)**: Transparent, clear request for conversation ("عندي موضوع شاغلني ونحتاج نحكي معاك...").
* **Formal (رسمي)**: Respectful, structured tone for elders or educators ("أود الحديث معك بخصوص بعض الضغوط...").

### Layer 4: Trust, Privacy & Native Sharing
* **Baseline Comparison**: A live toggle allowing the user and evaluators to compare the AI-adapted draft against a generic template, proving real AI utility.
* **Outbound Preview**: Displays the exact text being transmitted to the model with personal identifiers removed.
* **Native Share Sheet**: Utilizes the operating system's native share sheet (`Share.share()`), directly handing the drafted note to WhatsApp, Messenger, or Telegram without intermediary tracking.

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

* **Zero Cloud Storage**: Neither note drafts nor chip histories are stored on servers or databases.
* **Client-Side Identifier Removal**: Before transmission to the backend API, regex filters scrub Libyan mobile numbers (`+218`, `091`, `092`), emails, and common names, substituting placeholders (`[name]`, `[phone]`).
* **On-Device Sandboxed History**: If enabled, recurring chip selections are stored strictly inside the mobile device's sandboxed storage (`AsyncStorage`). No network requests are initiated for this data.
* **One-Action Data Destruction**: The user can wipe all local records instantly with a single tap.

---

## 6. Safety Evaluation & Measured Benchmarks

In compliance with requirement R22 [L§3, L§12], the Guardian Layer was evaluated against the **Ai4LY Synthetic Crisis Benchmark** (`safety/test-set.json`), consisting of 25 synthetic cases spanning Libyan dialect, Standard Arabic, Latin-script, and colloquial metaphors:

### 6.1 Metrics Formulation
$$\text{Recall} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}$$

$$\text{False-Alarm Rate} = \frac{\text{False Positives}}{\text{True Negatives} + \text{False Positives}}$$

### 6.2 Benchmark Results (Test Set $N=25$)
* **Crisis Detection Recall**: **100.0%** (11/11 crisis cases flagged).
* **False-Alarm Rate**: **14.2%** (2/14 benign or ambiguous cases flagged).
* **Output Filter Reliability**: **100.0%** of synthetic drafts containing forbidden clinical keywords were blocked and replaced with fallback templates.

*Design Rationale*: The system intentionally tunes the classifier toward over-triggering. A false positive costs the display of a harmless support card; a false negative risks missing a person in severe crisis.

---

## 7. Applicability in Libya

Jisr directly addresses the operational conditions of Libya:
1. **Linguistic Calibration**: Tested on Libyan Arabic dialect (*"مضغوط"*, *"حاس روحي بنجنن"*, *"ما نقدرش نكمل"*).
2. **Infrastructure Resilience**: Lightweight payload size (<2 KB); graceful automatic fallback to plain templates if cellular networks drop.
3. **Distribution Reality**: Interfaces with Meta Messenger and WhatsApp, reaching over 90% of Libyan social messaging users.
4. **Cultural Alignment**: Incorporates family members (`أحد الوالدين`, `أخ/أخت`) and trusted community figures (`شخص كبير تثق فيه`) as natural support pillars.

---

## 8. Stated Limitations & Future Roadmap

### Known Limitations:
* **Dialect Nuance**: Heavy regional slang or highly localized colloquialisms may challenge model accuracy.
* **Identifier Coverage**: Misspelled names may occasionally evade automated regex scrubbing (mitigated by the Outbound Preview).
* **Support Infrastructure**: Due to the scarcity of verified emergency mental health hotlines in Libya, the support card currently relies on verified humanitarian contacts or points to trusted personal ties.

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
| **Mohamed Thabet** | **Team Leader**, Person 4: Trust Views, Arabic Quality & Documentation Lead | System architecture, Arabic linguistic review, technical report, pitch deck, baseline comparison components |
| **Rayan** | Person 1: Mobile App & Interaction Engineer | React Native / Expo UI client, chip selector, native share sheet integration, on-device sandboxed storage |
| **Muatz** | Person 2: AI Core & Backend Engineer | LLM prompt engineering, risk check API, drafting engine, PII sanitization regex, stateless API routes |
| **Shima** | Person 3: Safety, Guardian & Evidence Engineer | Guardian Layer crisis phrase benchmark (Libyan dialect), output filter medical blacklist, fallback templates, empirical recall metrics |
