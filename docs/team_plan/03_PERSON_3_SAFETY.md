# Person 3: Shaima Abdulsalam Aljelali — Safety, Guardian & Evidence Engineer

> **Read `00_SHARED_SETUP.md` first.** This document is your individual plan.

---

## Your Role

You own **everything that keeps the user safe**. The Guardian Layer — the crisis phrase list, the risk check's deterministic layer, the output check, the support card, the plain templates, and the measured evidence that our safety claims are real. You also produce the safety test set and the measured recall/false-alarm figures that go into the technical report.

If Muatz (Person 2) is the brain, you are the guardrails.

## What You Build

```
┌──────────────────────────────────────────────────────┐
│                   YOUR TERRITORY                      │
│                                                       │
│  Crisis Phrase List (safety/crisis-phrases.json)      │
│  ├── Arabic crisis phrases                            │
│  ├── Libyan dialect crisis phrases                    │
│  ├── Mixed Arabic/English crisis phrases              │
│  ├── Latin-letter Arabic crisis phrases               │
│  └── Euphemistic crisis expressions                   │
│                                                       │
│  Forbidden Terms List (safety/forbidden-terms.json)   │
│  ├── Condition names (Arabic + English)               │
│  ├── Diagnostic language                              │
│  ├── Medication / treatment terms                     │
│  └── Clinical advice phrases                          │
│                                                       │
│  Output Check Module (src/lib/output-check.ts)        │
│  ├── Scans AI drafts for forbidden terms              │
│  ├── Returns pass/fail per draft                      │
│  └── If fail: regenerate once, then use template      │
│                                                       │
│  Support Card (safety/support-card.json)              │
│  ├── Fixed, pre-written Arabic text                   │
│  ├── Verified contacts (or fallback statement)        │
│  └── Never generated, never personalised              │
│                                                       │
│  Plain Template Fallback (safety/plain-templates.json)│
│  ├── 3 tones × 5 recipient types = 15 templates      │
│  └── Used when AI drafting fails or is blocked        │
│                                                       │
│  Safety Test Set (safety/test-set.json)               │
│  ├── Synthetic crisis inputs (NEVER real data)        │
│  ├── Non-crisis inputs                                │
│  ├── Ambiguous inputs                                 │
│  └── Dialect + mixed-script inputs                    │
│                                                       │
│  Safety Evidence Report (safety/evidence.md)          │
│  ├── Recall and false-alarm rates                     │
│  ├── Sample sizes                                     │
│  └── What was tested, what was not                    │
│                                                       │
│  Stated Limits Text                                   │
│  └── "Jisr is not a doctor..." (for the UI)           │
│                                                       │
│  Contact Verification                                 │
│  └── Who verified each contact, when                  │
└──────────────────────────────────────────────────────┘
```

---

## Task List (in priority order)

### Must-Do (Core — never cut)

| # | Task | When | Est. |
|---|------|------|------|
| 1 | **Crisis phrase list** — Build `crisis-phrases.json`. This is the phrase-matching layer of the risk check. Must cover: self-harm, suicidal ideation, severe distress, cries for help. Include Libyan dialect, mixed Arabic/English, and Latin-letter Arabic. **Be comprehensive.** See the starter list below. | Hour 0.5–2.5 | 2 hr |
| 2 | **Support card content** — Write `support-card.json`. Static Arabic text. Try to verify at least one Libyan support contact. If you cannot verify any by hour 8, use the fallback: "لا نستطيع عرض رقم لم نتحقق منه. تحدث مع شخص تثق فيه." | Hour 1–2 | 1 hr |
| 3 | **Forbidden terms list** — Build `forbidden-terms.json`. Condition names (اكتئاب, depression, قلق, anxiety, PTSD, اضطراب, etc.), medication terms (دواء, medication, pills, حبوب, etc.), diagnostic language, treatment terms. Arabic + English. | Hour 2.5–3 | 30 min |
| 4 | **Output check module** — Write `output-check.ts` (or `.js`). Takes a draft string, scans it against `forbidden-terms.json`, returns `{ passed: boolean, flaggedTerms: string[] }`. Muatz (Person 2) will call this function in the drafting pipeline. | Hour 3–4 | 1 hr |
| 5 | **Plain template fallback** — Write `plain-templates.json`. 3 tones (gentle / direct / formal) × 5 recipient types (friend / sibling / parent / trusted_adult / counsellor) = 15 templates. These must be safe, neutral, non-clinical, and actually usable. They use `[topic]` as a placeholder for the chip theme. | Hour 3–4.5 | 1.5 hr |
| 6 | **Safety test set** — Build `test-set.json`. 30–50 synthetic text inputs labelled as `crisis`, `not_crisis`, or `ambiguous`. Include Libyan dialect, mixed-script, euphemistic phrases. **NEVER use real crisis text from a real person.** | Hour 4.5–6.5 | 2 hr |
| 7 | **Run combined evaluation** — When Muatz's (Person 2) risk-check endpoint is ready (~hour 6–8), run the test set through the combined check (your phrase list + Muatz's model). Record recall and false-alarm rates. | Hour 8–9 | 1 hr |
| 8 | **Stated limits text** — Write the text shown in the UI: "جِسر مش دكتور، مش أداة تشخيص..." Provide to Rayan (Person 1) and Mohamed Thabet (Person 4). | Hour 2–2.5 | 30 min |
| 9 | **Safety evidence report** — Write `evidence.md`. Report: what was tested, how many inputs, recall, false-alarm rate, sample size, what was NOT tested, honest limitations. This goes into the technical report. | Hour 9–10 | 1 hr |
| 10 | **Contact verification** — If any support contact is found, verify it personally (call, check website, confirm it's active). Document who verified, when, how. If none verified → use fallback card text. | Hour 1–8 (ongoing) | - |

---

## Starter Crisis Phrase List

> This is a **starting point only**. You must expand it significantly, especially with Libyan dialect and euphemistic forms. Have Mohamed Thabet (Person 4) review it.

```json
{
  "phrases": [
    // Direct - Arabic
    { "text": "نبي نموت", "script": "arabic", "category": "self-harm" },
    { "text": "أبي أموت", "script": "arabic", "category": "self-harm" },
    { "text": "نبي نقتل روحي", "script": "arabic", "category": "self-harm" },
    { "text": "أفكر في الانتحار", "script": "arabic", "category": "self-harm" },
    { "text": "ما عندي سبب نعيش", "script": "arabic", "category": "self-harm" },
    { "text": "نبي نأذي روحي", "script": "arabic", "category": "self-harm" },
    { "text": "الحياة ما تستاهل", "script": "arabic", "category": "self-harm" },
    { "text": "خلاص ما نقدر نكمل", "script": "arabic", "category": "crisis" },
    { "text": "حاسس إني بنجنن", "script": "arabic", "category": "crisis" },
    { "text": "محد يحبني", "script": "arabic", "category": "crisis" },
    { "text": "ما عندي حد", "script": "arabic", "category": "crisis" },
    { "text": "مش قادر نتحمل", "script": "arabic", "category": "crisis" },
    { "text": "كل شي خلاص", "script": "arabic", "category": "crisis" },

    // Direct - Latin-letter Arabic
    { "text": "nabi nmot", "script": "latin", "category": "self-harm" },
    { "text": "nabi no2tol ro7i", "script": "latin", "category": "self-harm" },
    { "text": "msh gader nkamel", "script": "latin", "category": "crisis" },
    { "text": "5alas ma nagder nkamel", "script": "latin", "category": "crisis" },
    { "text": "7ases ini banjnen", "script": "latin", "category": "crisis" },

    // Mixed Arabic/English
    { "text": "I want to die", "script": "english", "category": "self-harm" },
    { "text": "I want to kill myself", "script": "english", "category": "self-harm" },
    { "text": "I can't do this anymore", "script": "english", "category": "crisis" },
    { "text": "مش قادر I can't anymore", "script": "mixed", "category": "crisis" },
    { "text": "نبي أخلص من كل شي end it all", "script": "mixed", "category": "self-harm" },

    // Euphemistic / indirect
    { "text": "نبي نرتاح للأبد", "script": "arabic", "category": "self-harm" },
    { "text": "لو نرقد ونما نقومش", "script": "arabic", "category": "self-harm" },
    { "text": "العالم أحسن بدوني", "script": "arabic", "category": "self-harm" },
    { "text": "نبي نختفي", "script": "arabic", "category": "crisis" },
    { "text": "ياريت ما كنت موجود", "script": "arabic", "category": "self-harm" }
  ]
}
```

**You must add more.** Especially:
- More Libyan dialect forms
- More euphemistic expressions
- More Latin-letter transliterations
- Consider how young Libyans actually express these things in text messages

**Have Mohamed Thabet (Person 4) review the list for dialect accuracy and completeness.**

---

## Starter Forbidden Terms List

```json
{
  "terms": [
    // Condition names
    { "text": "اكتئاب", "category": "condition" },
    { "text": "depression", "category": "condition" },
    { "text": "قلق", "category": "condition" },
    { "text": "anxiety", "category": "condition" },
    { "text": "اضطراب", "category": "condition" },
    { "text": "disorder", "category": "condition" },
    { "text": "PTSD", "category": "condition" },
    { "text": "OCD", "category": "condition" },
    { "text": "bipolar", "category": "condition" },
    { "text": "schizophrenia", "category": "condition" },
    { "text": "فصام", "category": "condition" },
    { "text": "ذهان", "category": "condition" },

    // Medication
    { "text": "دواء", "category": "medication" },
    { "text": "medication", "category": "medication" },
    { "text": "حبوب", "category": "medication" },
    { "text": "pills", "category": "medication" },
    { "text": "antidepressant", "category": "medication" },
    { "text": "مضاد", "category": "medication" },
    { "text": "جرعة", "category": "medication" },
    { "text": "dosage", "category": "medication" },

    // Diagnostic / clinical
    { "text": "تشخيص", "category": "diagnostic" },
    { "text": "diagnosis", "category": "diagnostic" },
    { "text": "أعراض", "category": "diagnostic" },
    { "text": "symptoms", "category": "diagnostic" },
    { "text": "علاج", "category": "treatment" },
    { "text": "treatment", "category": "treatment" },
    { "text": "therapy", "category": "treatment" },
    { "text": "therapist", "category": "treatment" }
  ]
}
```

---

## Output Check Module (Spec)

```typescript
// src/lib/output-check.ts

interface OutputCheckResult {
  passed: boolean;
  flaggedTerms: string[];
}

function checkDraft(draft: string, forbiddenTerms: ForbiddenTerm[]): OutputCheckResult {
  const flagged: string[] = [];
  const lowerDraft = draft.toLowerCase();

  for (const term of forbiddenTerms) {
    if (lowerDraft.includes(term.text.toLowerCase())) {
      flagged.push(term.text);
    }
  }

  return {
    passed: flagged.length === 0,
    flaggedTerms: flagged
  };
}
```

Muatz (Person 2) calls this function after receiving LLM output. If it fails:
1. Regenerate once (Muatz re-calls the LLM)
2. If still fails → use the plain template for that tone

---

## Plain Template Examples

These are used when:
- The AI fails or is unreachable
- The AI output contains forbidden terms even after retry
- As the "baseline" in the baseline comparison trust view

**Example — gentle tone, friend recipient:**
```
مرحبا، حبيت نقولك إني مريت بوقت صعب من ناحية [topic]. ما كنت عارف/ة كيف نبدأ نحكي، بس حسيت إنك الشخص اللي نقدر نتكلم معاه/ا. ما نبي شي كبير، بس حبيت تعرف/ي.
```

**Example — direct tone, friend recipient:**
```
سلام، عندي موضوع حبيت نحكيلك عليه. [topic] ضاغط/ة عليا بزاف ونحتاج حد يسمعني. لو عندك وقت نحكو.
```

**Example — formal tone, counsellor recipient:**
```
أستاذ/ة، أردت أن أتحدث معك بخصوص ضغوط [topic] التي أمر بها مؤخرًا. أقدّر وقتك وأحتاج لتوجيه.
```

You need to write all 15 combinations. Make sure they are:
- Non-clinical (no condition names)
- Natural in Libyan Arabic
- Actually usable — a real person should be willing to send these
- Reviewed by Mohamed Thabet (Person 4)

---

## What You Receive from Others

| From | What | When to expect | What to do if late |
|------|------|---------------|-------------------|
| **Muatz (Person 2)** | Risk-check API endpoint (to run combined evaluation) | Hour 6–8 | Run your phrase list evaluation independently first; combine when API is ready |
| **Mohamed Thabet (Person 4)** | Native Arabic review of your phrase list and templates | Hour 4–6 | Ask Mohamed Thabet to prioritise this review |

---

## What You Deliver to Others

| To | What | When |
|----|------|------|
| **Muatz (Person 2)** | `crisis-phrases.json` (phrase list for risk check integration) | Hour 3–4 |
| **Muatz (Person 2)** | `forbidden-terms.json` (for output check) | Hour 3–4 |
| **Muatz (Person 2)** | `output-check.ts` module (or Muatz can implement it based on your term list) | Hour 4 |
| **Rayan (Person 1)** | `support-card.json` (support card content) | Hour 2–3 |
| **Rayan (Person 1)** | `plain-templates.json` (fallback templates) | Hour 5–6 |
| **Rayan (Person 1)** | Stated-limits text (for the UI) | Hour 2–3 |
| **Mohamed Thabet (Person 4)** | Safety evidence report (`evidence.md`) with recall/false-alarm figures | Hour 9–10 |

---

## Testing Checklist

- [ ] **Phrase list coverage**: every phrase in your list is in the correct category
- [ ] **Phrase list catches known crisis text**: run 10+ crisis inputs → all detected
- [ ] **Phrase list doesn't over-trigger on normal text**: run 10+ normal inputs → most pass (some false alarms are acceptable)
- [ ] **Dialect coverage**: Libyan dialect crisis phrases are included and detected
- [ ] **Latin-letter coverage**: Latin-letter Arabic crisis phrases are included and detected
- [ ] **Output check catches forbidden terms**: inject each forbidden term into a draft → all caught
- [ ] **Plain templates are usable**: read each template aloud — would a real person send this?
- [ ] **Support card is correct**: text is clear, contacts are verified or fallback is used
- [ ] **Evidence report is honest**: figures are real, sample sizes stated, limitations acknowledged

---

## Definition of Done

The crisis phrase list, forbidden-terms list, output check module, support card, plain templates, and safety test set exist in `/safety/`. The combined risk check (phrase + model) has been run on the test set. Recall and false-alarm rates are measured with sample sizes and documented in `evidence.md`. Every contact on the support card is verified, or the fallback text is used instead.

---

## Critical Reminders

1. **The phrase list is the most important safety artifact in this project.** Take it seriously. Over-trigger rather than miss.
2. **NEVER use real crisis text from a real person** in the test set. All inputs must be synthetic (team-written).
3. **The support card text is NEVER generated by AI.** It is static, pre-written, and verified.
4. **If you cannot verify any support contact, use the fallback.** Showing an unverified number is worse than showing none.
5. **Your safety figures go in the technical report.** If you say "high recall", you must have a number to back it up. A safety claim without a measurement is just an assertion.
6. **Mohamed Thabet (Person 4) must review your phrase list and templates for dialect accuracy.** Coordinate with them early.
