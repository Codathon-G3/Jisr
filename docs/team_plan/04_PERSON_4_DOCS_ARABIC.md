# Person 4: Mohamed Thabet (Team Leader) — Trust Views, Arabic Review, Documentation & Presentation

> **Read `00_SHARED_SETUP.md` first.** This document is your individual plan.

---

## Your Role

You own **three critical areas**:
1. **Trust & control UI components** — the views that prove the AI is honest and useful
2. **All Arabic language quality** — every word the user reads goes through you
3. **All documentation and presentation** — README, technical report, pitch deck, citations, and Q&A prep

You are the team's interface with the evaluators. What you write in the report and the deck is what they judge.

## What You Build

```
┌──────────────────────────────────────────────────────┐
│                   YOUR TERRITORY                      │
│                                                       │
│  Trust View Components                                │
│  ├── BaselineComparison — AI draft vs. plain template │
│  ├── FaithfulnessView — highlights source phrases     │
│  └── OutboundPreview — shows what leaves the device   │
│                                                       │
│  Arabic Language (all user-facing text)                │
│  ├── src/i18n/ar.json — all UI strings                │
│  ├── Review Shima's (Person 3) crisis phrases & templates │
│  ├── Review Muatz's (Person 2) AI prompt wording      │
│  └── Review AI-generated draft quality                │
│                                                       │
│  Documentation                                        │
│  ├── README.md — architecture, setup, usage           │
│  ├── REPORT.md — detailed technical report            │
│  ├── CITATIONS.md — every tool/model/service          │
│  └── AI disclosure text for the UI                    │
│                                                       │
│  Presentation                                         │
│  ├── Pitch deck (~5 slides) OR demo video             │
│  └── Committee Q&A preparation                        │
└──────────────────────────────────────────────────────┘
```

---

## Task List (in priority order)

### Must-Do (Core — produce early, others depend on you)

| # | Task | When | Est. |
|---|------|------|------|
| 1 | **Arabic UI strings** — Write `src/i18n/ar.json`. Rayan (Person 1) needs this to build the UI. Covers: chip labels, recipient labels, button text, trigger invitation wording, tone labels, disclosure text, limits text, placeholder text, encouraged-out text. See the template in `00_SHARED_SETUP.md`. | Hour 0.5–1.5 | 1 hr |
| 2 | **Review Person 3's crisis phrase list** — Review Shima's (Person 3) crisis phrase list. Check for dialect accuracy, missing phrases, and false positives. Are these how young Libyans actually write? Add missing phrases. | Hour 3–4 | 1 hr |
| 3 | **Review Person 2's AI prompts** — Review Muatz's (Person 2) drafting system prompt and risk-check prompt. Is the Arabic instruction clear? Will the LLM understand what "Libyan dialect" means? Suggest improvements. | Hour 4–5 | 30 min |
| 4 | **Review AI draft quality** — When Muatz (Person 2) has the drafting endpoint working (~hour 5–6), run 5–10 test inputs and evaluate: Is the Arabic natural? Is it appropriate Libyan dialect? Is it non-clinical? Would a young person actually send this? | Hour 6–7 | 1 hr |
| 5 | **Review Person 3's plain templates** — Review Shima's (Person 3) plain templates. Are these natural? Would a real person send them? Do they sound right for each recipient type? | Hour 5–6 | 30 min |
| 6 | **AI disclosure text** — Write the text shown at every drafting step: "هذا النص ساعد الذكاء الاصطناعي في صياغته. أنت تقرر إذا تبي تعدّل أو ترسل." Give to Rayan (Person 1). | Hour 1.5–2 | 15 min |

### Must-Do (Core — your own deliverables)

| # | Task | When | Est. |
|---|------|------|------|
| 7 | **README.md** — Project architecture, what the product does, operational requirements, setup steps (how to clone, install, run), usage instructions (how to use the product), team members. | Hour 8–10 | 1.5 hr |
| 8 | **REPORT.md** — Detailed technical report. See the structure below. This is a **separate deliverable** from the README. | Hour 8–12 | 2.5 hr |
| 9 | **Pitch deck** — ~5 slides: (1) The problem, (2) The solution, (3) What the AI does, (4) Safety & privacy, (5) Demo + honest limits. OR record a demo video instead. | Hour 10–12 | 1.5 hr |
| 10 | **CITATIONS.md** — List every tool, model, API, framework, and library used, with version and URL. Update as the team makes choices. | Hour 10–11 | 30 min |
| 11 | **Committee Q&A prep** — Write short answers to: "How is this not just a chatbot?", "Where does the user's data go?", "What if the AI writes something harmful?", "Does this diagnose anyone?", "Why is this feasible in Libya?" | Hour 11–12 | 30 min |

### Should-Do (Trust Views — high demo value, but cuttable)

| # | Task | When | Est. |
|---|------|------|------|
| 12 | **Baseline comparison component** — Shows the AI draft next to Shima's (Person 3) plain template. Two panels or a toggle. This is the **highest-value trust view** for the demo — it proves the AI adds real value. Build this first. | Hour 5–6.5 | 1.5 hr |
| 13 | **Faithfulness view component** — Highlights which phrases in the AI draft came from the user's input. Consumes Muatz's (Person 2) `/api/faithfulness` response (alignment pairs). Color-highlight matching phrases. | Hour 7–8.5 | 1.5 hr |
| 14 | **Outbound preview component** — Shows the user exactly what text would be sent to the LLM for drafting (the sanitised text after identifier removal). Simple: just display the `sanitisedText` field from Muatz's (Person 2) API response. | Hour 6.5–7 | 30 min |

---

## REPORT.md Structure

This is the detailed technical report. It draws heavily on the product definition document but must reflect what was **actually built**, not just what was planned.

```markdown
# Jisr (جِسر) — Technical Report

## 1. Problem Statement
- The silence problem among young people in Libya
- Stigma, emotional overwhelm, articulation cost
- Why early intervention matters

## 2. Solution Overview
- What Jisr does (one paragraph)
- The chain: chips → record → trigger → writing → drafts → sharing
- What Jisr is NOT (stated limits)

## 3. How the AI Works
- The 4 AI functions:
  1. Structures messy free text
  2. Adapts tone for the audience
  3. Verifies faithfulness
  4. Classifies risk
- What is NOT AI (chips, record, trigger, support card)
- How the AI is demonstrated (baseline comparison, faithfulness view)

## 4. Architecture
- Mobile Client: [React Native (Expo) / Flutter mobile app, RTL layout, local sandboxed storage]
- Backend API: [endpoints for risk check and drafting, stateless, deployed on Vercel/Railway]
- LLM integration: [which model/service, how it's called]
- On-device record: [AsyncStorage/SecureStore, 7-day retention, zero network transmission]
- Diagram of the data flow

## 5. Safety and Privacy
- Guardian Layer: risk check (phrase list + model), support card, output check
- Risk check results: recall = X%, false-alarm rate = Y%, sample size = N
  [From Shima's (Person 3) evidence.md]
- What data leaves the device, what doesn't
- Identifier removal
- No account, no tracking, nothing stored
- Stated limits

## 6. Applicability in Libya
- Mobile-first experience (tested on Android phones)
- Arabic and RTL support
- Libyan dialect handling
- Low-bandwidth tolerance (short payloads)
- Native mobile sharing to messaging apps used in Libya (WhatsApp, Messenger)
- Respect for family and community values

## 7. Evaluation Evidence
- Safety figures (from Shima / Person 3)
- Arabic quality assessment
- Demo walkthrough results
- What we tested, what we didn't

## 8. Limitations and Future Work
- What we would improve with more time
- Known weaknesses (dialect coverage, identifier removal, etc.)
- What the product cannot do

## 9. Tools and Technologies
- [Reference CITATIONS.md]

## 10. Team
- **Mohamed Thabet** (Team Leader / Person 4): Trust Views, Arabic Quality, Documentation & Presentation Lead
- **Rayan** (Person 1): Mobile App & Interaction Engineer
- **Muatz** (Person 2): AI Core & Backend Engineer
- **Shima** (Person 3): Safety, Guardian & Evidence Engineer
```

---

## Pitch Deck Structure (~5 slides)

| Slide | Content | Time |
|-------|---------|------|
| 1 | **The Problem** — Young people in Libya stay silent because writing the first sentence is too hard. Stigma, overwhelm, articulation cost. | 1 min |
| 2 | **The Solution** — Jisr (Bridge Note): tap chips → write 1–3 lines → get 3 tone-adapted drafts → edit → share with a real person. Short demo screenshot or flow diagram. | 1 min |
| 3 | **What the AI Actually Does** — 4 functions: structures text, adapts tone, checks faithfulness, classifies risk. Show the baseline comparison (AI vs. template). | 1 min |
| 4 | **Safety & Privacy** — Guardian Layer: risk check before drafting, support card, output check. Nothing stored. On-device only. No diagnosis. Show the recall figure. | 1 min |
| 5 | **Demo + Honest Limits** — Live demo OR recorded video. Then: what it's not (not a doctor, not a chatbot, not a therapist). Why it works in Libya. | 1 min |

---

## Committee Q&A — Prepared Answers

**"How is this not just a chatbot?"**
> Jisr is not a chatbot. There is no conversation with the AI. The user writes 1–3 lines, the AI produces 3 draft versions, the user edits and sends to a real person. The AI's job is to end the silence, not to hold a conversation. The product actively pushes the user out and toward a human.

**"Where does the user's data go?"**
> The text goes to [LLM service name] only for the current drafting request, with personal identifiers removed first. Nothing is stored — not on our server, not on the device (except the optional chip record, which the user controls). No account, no tracking, no analytics.

**"What if the AI writes something harmful?"**
> Three layers prevent this: (1) the risk check runs BEFORE drafting — crisis text never reaches the AI; (2) the drafting prompt forbids clinical language; (3) the output check scans every draft for forbidden terms and replaces violations with a safe template. If all three fail, the user can still edit the text, and the AI never sends anything.

**"Does this diagnose anyone?"**
> No. The product never names a condition, never scores the user, never screens for symptoms. It uses "exams", "pressure", "stress" — the user's own words. The risk check looks for crisis language, not conditions. The stated limits say plainly: this is not a diagnosis tool.

**"Why is this feasible in Libya?"**
> Arabic and RTL interface. Tested on Libyan dialect. No account or sign-up. Works on ordinary phones. Shares through messaging apps Libyans already use (WhatsApp, Messenger). Low bandwidth — just one short API call. Respects family values — the recipient set includes family. No data leaves Libya except the short drafting call.

---

## What You Receive from Others

| From | What | When to expect | What to do if late |
|------|------|---------------|-------------------|
| **Rayan (Person 1)** | List of all UI strings needing Arabic | Hour 1 | Use the template in `00_SHARED_SETUP.md` as the starting list |
| **Rayan (Person 1)** | Running URL for screenshots / demo recording | Hour 8 | Use mockups or the flow diagram from the DOCX |
| **Muatz (Person 2)** | Faithfulness API endpoint + example responses | Hour 8–9 | Build faithfulness view with mock data first |
| **Muatz (Person 2)** | 3–5 example API call/response pairs for the report | Hour 9–10 | Ask Muatz to send you curl examples |
| **Shima (Person 3)** | Crisis phrase list for review | Hour 3 | Prioritise this review |
| **Shima (Person 3)** | Plain templates for review | Hour 5 | Prioritise this review |
| **Shima (Person 3)** | Safety evidence (recall/false-alarm figures) | Hour 9–10 | Leave placeholder in report, fill in when received |

---

## What You Deliver to Others

| To | What | When |
|----|------|------|
| **Rayan (Person 1)** | `src/i18n/ar.json` — all Arabic UI strings | Hour 1.5 (first version), update as needed |
| **Rayan (Person 1)** | AI disclosure text | Hour 2 |
| **Rayan (Person 1)** | Trust view components (BaselineComparison, FaithfulnessView, OutboundPreview) | Hour 6–9 |
| **Muatz (Person 2)** | Reviewed/corrected Arabic prompt wording | Hour 5 |
| **Shima (Person 3)** | Reviewed/corrected crisis phrase list | Hour 4 |
| **Shima (Person 3)** | Reviewed/corrected plain templates | Hour 6 |

---

## Testing Checklist

- [ ] **Arabic strings**: all UI text is natural, non-clinical, and culturally appropriate
- [ ] **Crisis phrase list**: reviewed for dialect accuracy and completeness
- [ ] **AI drafts**: reviewed for Arabic quality, non-clinical language, and naturalness
- [ ] **Plain templates**: reviewed for usability and naturalness
- [ ] **Baseline comparison**: renders correctly — AI draft on one side, template on the other
- [ ] **Faithfulness view**: highlights correct phrases (when API data is available)
- [ ] **Outbound preview**: shows the sanitised text correctly
- [ ] **README**: someone can follow the instructions to run the product
- [ ] **REPORT**: accurately reflects what was built, includes safety figures
- [ ] **Pitch deck**: 5 slides, ~5 minutes, covers problem → solution → AI → safety → demo
- [ ] **Citations**: complete, includes every tool/model/service

---

## Definition of Done

All Arabic text has been reviewed and is natural, non-clinical, and culturally appropriate. Trust view components render correctly. README instructions work. Technical report accurately reflects what was built and includes measured safety figures. Pitch deck is ready for the 5-minute presentation. Citations file is complete. Committee Q&A answers are prepared.

---

## Critical Reminders

1. **Arabic strings are a blocking dependency for Rayan (Person 1).** Deliver `ar.json` by hour 1.5.
2. **The crisis phrase list review is a safety-critical task.** If phrases are wrong, the risk check misses real crisis text.
3. **The technical report must be honest.** State what works, what doesn't, what the limitations are. Never overstate safety.
4. **The pitch deck should follow the chain**: problem → solution → AI → safety → demo. Don't try to cover everything — focus on what impresses: the 4 AI functions, the safety layer, and the Libya-specific design.
5. **The baseline comparison is the single most valuable trust view for evaluators.** It visually proves the AI adds value. Build this before the faithfulness view.
6. **Record a backup demo video** in case the live demo fails during the presentation. Do this as soon as the app is working (~hour 10).
