# Jisr (جِسر) — Pitch Deck & 5-Minute Presentation Script

> **Event**: Ai4LY National Codathon 2026 Evaluation  
> **Team**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima  
> **Presentation Date**: Thursday, October 8, 2026 (Online)  
> **Format**: ~5 minutes presentation + ~5 minutes committee Q&A (10 minutes total)  
> **Slide Target**: Exactly 5 slides [L§9, L§10, L§12]

---

## 5-Slide Structure Summary

```
Slide 1: The Problem  ──► The Silence at the First Sentence (Stigma, Overwhelm)
Slide 2: The Solution ──► Jisr: Human-to-Human Writing Companion
Slide 3: What AI Does ──► The 4 Concrete AI Functions (Not a Chatbot!)
Slide 4: Safety & Privacy ──► Guardian Layer, Measured Recall, Zero Data Retention
Slide 5: Live Demo & Libya Fit ──► Walkthrough, Libyan Dialect, Honest Boundaries
```

---

## Slide-by-Slide Script & Visual Guide

### Slide 1: The Problem — The Silence at the First Sentence (Minute 0:00 – 1:00)

* **Slide Title**: "The Hardest Step in Seeking Help is the First Sentence"
* **Visual Elements**:
  * A phone screen showing an empty messaging text box with a blinking cursor.
  * Three compounded friction points:
    1. **Stigma**: Fear of labelling oneself or exposing private matters.
    2. **Overwhelm**: Emotional paralysis when trying to structure thoughts.
    3. **Articulation Cost**: Translating deep stress into actionable words.
  * Key statistic / insight: In Libya, specialist care is scarce, but friends and family are already there—if the young person can reach them early.
* **Speaker Script (Mohamed Thabet, Team Leader / Presenter)**:
  > *"Peace be upon you, honorable committee members.  
  > In mental health struggles among Libyan youth, the fatal failure mode is silence. When a student is overwhelmed by exams, family pressure, or work, the hardest step is not wanting help—it is staring at a blank screen, trying to write that first sentence to a friend, parent, or teacher.  
  > In our society, stigma and emotional overwhelm freeze people into silence until early stress turns into an unmanageable crisis. Today, we present **Jisr**—an AI writing companion built with one singular mission: to end the silence early and connect a human to a human."*

---

### Slide 2: The Solution — Human-to-Human Writing Companion (Minute 1:00 – 2:00)

* **Slide Title**: "Jisr (جِسر): Breaking the Silence, Then Getting Out of the Way"
* **Visual Elements**:
  * The Linear Product Flow:  
    `Taps Chips` `Gentle Trigger` `1-3 Lines` `Guardian Layer Check` `3 Tone Drafts` `Native Messaging Share`.
  * Highlight box: *"Not a Chatbot. Not a Therapist. We never hold the conversation."*
* **Speaker Script**:
  > *"Jisr is fundamentally different from generic AI health apps. We did not build a conversational chatbot, and we do not pretend to be an artificial therapist.  
  > The user simply taps everyday situation chips—like exams or family pressure—and can optionally write one or two sentences in their own words. Jisr runs an immediate safety check, produces three editable, tone-adapted drafts tailored to their recipient, and lets them share it directly through WhatsApp or Messenger.  
  > The moment the user closes our app to talk to their friend or sister, Jisr has succeeded."*

---

### Slide 3: What AI Actually Does — Concrete Utility (Minute 2:00 – 3:00)

* **Slide Title**: "Real AI Utility vs. Decorative AI"
* **Visual Elements**:
  * 4 Pillars diagram:
    1. **Structuring Messy Free-Text**: Extracts situation, impact, and implicit need from chaotic input.
    2. **Tone Adaptation**: Crafts Gentle, Direct, and Formal registers adapted to recipient social norms.
    3. **Faithfulness Alignment**: Traces generated words directly back to the user's input.
    4. **Risk Classification**: Detects dialect crisis expressions before drafting.
  * Side-by-side visual of the **Live Baseline Toggle** (AI Draft vs. Static Template).
* **Speaker Script**:
  > *"As emphasized in the Codathon guidelines, simply labeling a project 'AI-based' is not enough. In Jisr, AI performs four precise tasks that forms and rules cannot do:  
  > It restructures chaotic thoughts into clear messages; it adapts tone between talking to a close friend versus a school counsellor; it verifies faithfulness to prevent invented feelings; and it classifies natural language risk.  
  > We even built a Baseline Comparison toggle into the app, so anyone—and any evaluator—can see the exact difference between our AI draft and a generic template, and judge for themselves. If the template is better, the app lets you use it."*

---

### Slide 4: Safety & Privacy — The Guardian Layer (Minute 3:00 – 4:00)

* **Slide Title**: "The Guardian Layer: Safe Before Helpful"
* **Visual Elements**:
  * Diagram of the multi-stage Guardian Layer:
    * Pre-drafting Risk Filter (Keyword list on the phone + keyword list and LLM classifier on the server, before any drafting).
    * Fixed Support Card (never generated; shows no unverified numbers).
    * Deterministic Output Check (Clinical terms blocked).
    * Persistent Human Route Button.
  * Safety Metric Callout Box: **On 64 sentences we never tuned on: 26/26 crisis sentences caught by the phrase list + AI model (95% CI 87–100%), 3/30 false alarms. The phrase list alone caught 6/26: the AI does the detecting on new wording. Blind test with native reviewers next.**
  * Privacy Guarantee: **No account, nothing stored on our server, identifiers removed and shown to the user before sending, private record off by default**.
* **Speaker Script**:
  > *"Safety in this space cannot be an afterthought. Before any text ever reaches drafting, our Guardian Layer screens for crisis indicators across Libyan dialect, Arabic, and Latin script, on the phone and again on the server. If crisis is detected, drafting stops and a static support card is presented. On 64 sentences we never tuned on, the combined check caught all 26 crisis sentences; the keyword list alone caught only 6. That is why the AI sits in the safety path, not just the writing. We could not verify a Libyan helpline in time, so the card shows no number rather than an unchecked one: it points to a trusted person and the nearest emergency department.  
  > Our output filter blocks clinical diagnoses and medication terms, and the 'talk to someone now' button works on every screen whatever the classifier says. On privacy: Jisr requires no accounts and our server keeps nothing. Names and numbers are removed on the phone, and the user sees exactly what will be sent before it leaves."*

---

### Slide 5: Live Demonstration & Applicability in Libya (Minute 4:00 – 5:00)

* **Slide Title**: "Built for Libyan Reality"
* **Visual Elements**:
  * Standalone Downloadable Android APK badge & QR Code (`builds/jisr-v1.0.0.apk`).
  * Live Mobile App Screen / Video Demonstration:
    * Inputting Libyan dialect: *"مضغوط هلبا من الامتحانات ومش قادر نركز"*.
    * Generating the 3 drafts (live, with the backend running; a few seconds).
    * Tapping Native Share Sheet to WhatsApp / Messenger.
    * Seamless offline fallback demonstration (`safety/plain-templates.json`, labelled "قالب جاهز").
  * Stated Honest Limitations banner (Non-clinical, human-in-the-loop).
* **Speaker Script**:
  > *"Jisr was built for Libyan reality: it is packaged as a downloadable Android APK that works on ordinary smartphones, keeps working offline with plain templates and the on-device safety check, is written for Libyan dialect, respects family structures in its recipient options, and connects directly to WhatsApp and Messenger, the apps young Libyans already use.  
  > We are honest about our limits: Jisr is not a doctor, not a therapist, not an emergency service, does not replace specialists, and never sends a message without user approval.  
  > By removing the friction of the first sentence, Jisr helps young Libyans turn silence into early, life-changing human conversations. Thank you, and we welcome your questions."*

---

## Emergency Timing Checklist
* **At 4:00**: Wrap up Slide 4 and transition immediately to Slide 5 / live demo.
* **If API connection lags**: Immediately switch to the pre-recorded demo video or showcase the pre-computed baseline comparison without pausing.
