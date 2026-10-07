# Person 2: Muatz — AI Core & Backend Engineer

> **Read `00_SHARED_SETUP.md` first.** This document is your individual plan.

---

## Your Role

You own the **AI brain and the API layer**. Rayan's (Person 1) frontend calls your endpoints to check for risk and generate drafts. You are the bridge between the user's words and the LLM. Everything that touches the language model goes through you.

## What You Build

```
┌──────────────────────────────────────────────────────┐
│                   YOUR TERRITORY                      │
│                                                       │
│  POST /api/check-risk                                 │
│  ├── Receives user text + chips                       │
│  ├── Runs Shima's (Person 3) phrase list (matching)   │
│  ├── Runs LLM-based risk classification               │
│  ├── Returns { riskDetected, method }                 │
│  └── High-recall: over-trigger rather than miss       │
│                                                       │
│  POST /api/generate-drafts                            │
│  ├── Receives user text + chips + recipient           │
│  ├── Runs identifier removal (names, phones, emails)  │
│  ├── Calls LLM with drafting system prompt            │
│  ├── Runs Shima's (Person 3) output check             │
│  ├── Returns 3 drafts OR plain template fallback      │
│  └── Stateless: nothing stored, nothing logged        │
│                                                       │
│  POST /api/faithfulness (optional — if time permits)  │
│  ├── Receives original text + one draft               │
│  ├── Asks LLM to align draft phrases to input phrases │
│  └── Returns alignment pairs                          │
│                                                       │
│  Identifier Removal Module                            │
│  ├── Regex: Arabic names, Libyan phone formats, email │
│  ├── Replace with placeholders                        │
│  └── Return what was removed (for outbound preview)   │
│                                                       │
│  LLM Prompts (the quality depends on these)           │
│  ├── Risk-check prompt                                │
│  ├── Drafting system prompt                           │
│  └── Faithfulness prompt (optional)                   │
│                                                       │
│  Deployment                                           │
│  └── API accessible from the internet for the demo    │
└──────────────────────────────────────────────────────┘
```

---

## URGENT: First 30 Minutes

**Test LLM API access from Libya RIGHT NOW.**

```bash
# Example: test Gemini API
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"اكتب جملة واحدة بالعربي عن الامتحانات"}]}]}'
```

If this fails from Libya → **tell the team immediately.** We need a fallback plan.

Things to check:
- Does the API respond?
- Is the API key valid?
- Can you pay for it / are you within free tier limits?
- Does the response contain decent Arabic?

---

## Task List (in priority order)

### Must-Do (Core)

| # | Task | When | Est. |
|---|------|------|------|
| 1 | **Test LLM API access** — Confirm the chosen service works from Libya. Test Arabic quality with a few sample inputs. | Hour 0–0.5 | 30 min |
| 2 | **API scaffold** — Set up API routes (`/api/check-risk`, `/api/generate-drafts`). Deploy a "hello world" endpoint. Confirm it's reachable from the internet. | Hour 0.5–1.5 | 1 hr |
| 3 | **Risk-check prompt** — Write the LLM prompt for crisis classification. Must be high-recall. Test with Arabic and dialect inputs. | Hour 1.5–2.5 | 1 hr |
| 4 | **Risk-check endpoint** — Integrate phrase matching (from Shima's (Person 3) `crisis-phrases.json`) + model-based classification. If EITHER triggers → return `riskDetected: true`. Start with a placeholder phrase list until Shima delivers. | Hour 2.5–3.5 | 1 hr |
| 5 | **Drafting system prompt** — This is the most important piece you write. See the detailed prompt spec below. | Hour 3.5–5 | 1.5 hr |
| 6 | **Identifier removal** — Regex patterns for Arabic names (common Libyan names), phone numbers (+218..., 09...), email addresses. Replace with `[name]`, `[number]`, `[email]`. Return what was removed so the frontend can show it. | Hour 5–6 | 1 hr |
| 7 | **Generate-drafts endpoint** — Full pipeline: receive text → remove identifiers → call LLM → run output check → return 3 drafts. If output check fails, regenerate once, then fall back to plain template. | Hour 5–7 | 2 hr |
| 8 | **Fallback logic** — If LLM is unreachable or times out (>10s), return plain templates (from Shima's (Person 3) `plain-templates.json`). Set `usedFallbackTemplate: true`. | Hour 7–7.5 | 30 min |
| 9 | **Integrate Shima's (Person 3) data** — Load `crisis-phrases.json` and `forbidden-terms.json` for the phrase-matching layer and output check. | Hour 7–8 | 30 min |
| 10 | **Deploy** — Make sure the API is deployed (e.g. Vercel, Railway, or an ngrok tunnel). Give Rayan (Person 1) the base URL. **Crucial**: Rayan is building a **mobile app**, so `localhost` will not work on their phone! The API must have an HTTPS URL or local Wi-Fi IP. | Hour 6 (first deploy), Hour 10 (final) | 30 min |
| 11 | **Arabic/dialect quality testing** — Run 5–10 realistic inputs through the drafting endpoint. Have Mohamed Thabet (Person 4) rate the output. Adjust prompts if needed. | Hour 8–9 | 1 hr |
| 12 | **Statelessness verification** — Confirm nothing is logged, stored, or cached between requests. No database. No session storage. No log files containing user text. | Hour 9–9.5 | 30 min |

### Should-Do (Trust View)

| # | Task | When | Est. |
|---|------|------|------|
| 13 | **Faithfulness endpoint** — An LLM call that takes the original text + one draft, and returns which phrases in the draft map to which phrases in the input. | Hour 9–10.5 | 1.5 hr |

---

## The Drafting System Prompt (Spec)

This prompt goes to the LLM for every drafting request. It must enforce all product rules.

**Key requirements the prompt must encode:**

1. **Three tones**: Generate exactly 3 versions — gentle (لطيف), direct (مباشر), formal (رسمي)
2. **Recipient adaptation**: Adapt language/register based on whether the recipient is a friend, sibling, parent, trusted adult, or counsellor
3. **User's words only**: Base everything on what the user actually wrote. Never invent facts, feelings, or situations the user didn't mention
4. **Arabic output**: Write in Arabic. Match the user's dialect level if possible (if they wrote in Libyan dialect, respond in a similar register)
5. **I-statements**: Use "أنا أحس...", "أنا أحتاج...", never blame ("أنت دائمًا...")
6. **Neutral framing**: Use "stress", "pressure", "exams" — never clinical terms
7. **FORBIDDEN — never generate**: condition names (depression, anxiety, اكتئاب, قلق), diagnostic language, medication names, treatment suggestions, clinical advice, anything that sounds like a diagnosis
8. **Short**: Each draft should be 2–5 sentences. The user can expand.
9. **If chips only (no free text)**: Generate drafts based purely on the chip topics (e.g., "exams" → a short message about exam pressure)

**Example prompt structure:**

```
You are a writing assistant helping a young person in Libya draft a short personal message.

The user has indicated they are dealing with: {chips}
They wrote: "{sanitised_text}"
The message is for: {recipient}

Generate exactly 3 versions of a short message (2-5 sentences each):
1. Gentle tone (لطيف) — warm, soft, hesitant
2. Direct tone (مباشر) — straightforward, clear
3. Formal tone (رسمي) — respectful, structured

Rules:
- Write in Arabic. If the user wrote in Libyan dialect, match their register.
- Use only what the user actually said. Do not invent feelings, situations, or facts.
- Use I-statements ("أنا أحس", "أنا أحتاج").
- NEVER use: condition names, diagnostic terms, medication names, treatment suggestions.
- NEVER imply the user has a condition or needs clinical help.
- Keep each version to 2-5 sentences.
- Adapt the register for the recipient ({recipient}).

Output format (JSON):
{
  "drafts": [
    { "tone": "gentle", "text": "..." },
    { "tone": "direct", "text": "..." },
    { "tone": "formal", "text": "..." }
  ]
}
```

⚠️ **Test this prompt with Arabic and dialect inputs immediately.** Adjust wording based on actual output quality.

---

## The Risk-Check Prompt (Spec)

```
You are a safety classifier for a writing tool used by young people in Libya.

Determine if the following text indicates the person may be in crisis (self-harm, 
suicidal ideation, immediate danger, or severe distress that requires immediate 
human support).

Be cautious: if in doubt, classify as "risk_detected". It is better to over-trigger 
than to miss. Consider Libyan Arabic dialect, mixed Arabic/English, and Latin-letter 
Arabic transliteration.

Text: "{user_text}"

Respond with JSON only:
{ "riskDetected": true/false, "reasoning": "brief explanation" }
```

---

## Identifier Removal Patterns

Start with these regex patterns (expand as needed):

```javascript
// Libyan phone numbers: +218-XX-XXXXXXX, 09XXXXXXXX, 091XXXXXXX
const phoneRegex = /(\+?218[\s-]?\d{2}[\s-]?\d{7}|09\d{8})/g;

// Email
const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/g;

// Common approach: let the user review in the outbound preview
// rather than trying to catch every Arabic name by regex
```

> **Important**: Arabic name detection is hard. The outbound preview (Mohamed Thabet's component) is the safety net — the user can see and correct what the identifier removal missed. Don't over-engineer this; basic patterns + user review is the product's stated approach.

---

## What You Receive from Others

| From | What | When to expect | What to do if late |
|------|------|---------------|-------------------|
| **Shima (Person 3)** | `crisis-phrases.json` (phrase list for risk check) | Hour 3–4 | Use a temporary placeholder list of 10–15 obvious phrases |
| **Shima (Person 3)** | `forbidden-terms.json` (for output check) | Hour 3–4 | Use a temporary placeholder list |
| **Shima (Person 3)** | `plain-templates.json` (fallback when API fails) | Hour 5–6 | Use hardcoded fallback strings |
| **Mohamed Thabet (Person 4)** | Arabic prompt wording review | Hour 4–5 | Ask Mohamed Thabet to glance at your prompts |

---

## What You Deliver to Others

| To | What | When |
|----|------|------|
| **Rayan (Person 1)** | Deployed API base URL + confirmation that endpoints match the contract | Hour 6 |
| **Rayan (Person 1)** | Any changes to the API contract (tell Rayan immediately if you need to modify request/response shapes) | Ongoing |
| **Shima (Person 3)** | Model-based risk check results on their test set (so they can measure combined recall) | Hour 8–9 |
| **Mohamed Thabet (Person 4)** | 3–5 example API call/response pairs for the technical report | Hour 9–10 |

---

## Testing Checklist

- [ ] **LLM access**: API responds from Libya with acceptable latency (<10s)
- [ ] **Risk check — true positives**: send known crisis phrases → `riskDetected: true`
- [ ] **Risk check — true negatives**: send normal text → `riskDetected: false`
- [ ] **Risk check — dialect**: send Libyan dialect crisis text → `riskDetected: true`
- [ ] **Drafting — 3 tones**: verify exactly 3 drafts are returned
- [ ] **Drafting — no clinical language**: verify no condition names, no diagnostic terms in output
- [ ] **Drafting — Arabic quality**: native reviewer rates output as acceptable
- [ ] **Drafting — user words only**: verify drafts don't invent facts the user didn't mention
- [ ] **Drafting — chips only**: verify drafts are generated even with no free text
- [ ] **Identifier removal**: test with a Libyan phone number, an email, and a name → verify removed
- [ ] **Output check**: inject a forbidden term into a mock draft → verify it's caught
- [ ] **Fallback**: simulate API failure → verify plain templates are returned
- [ ] **Stateless**: no data persisted between requests, no log files with user text
- [ ] **Latency**: response time is acceptable for live demo

---

## Definition of Done

✅ The API accepts session data, returns either a risk alert or 3 tone-adapted Arabic drafts, with no clinical language, traceable to user's words, identifiers removed, nothing stored. The API is deployed and accessible from a browser. Rayan (Person 1) can call it and get correct responses. Fallback to plain templates works when the LLM is unreachable.

---

## ⚠️ Critical Reminders

1. **NEVER store user text.** No database, no log files, no analytics. The API is stateless.
2. **NEVER put the API key in the frontend code.** It stays server-side only.
3. **The API key must NOT be committed to the repository.** Use environment variables.
4. **High recall on risk check.** A false alarm = one extra support card. A miss = a person in danger gets nothing. Always err toward triggering.
5. **If the LLM generates clinical language despite your prompt, the output check catches it.** But try to get the prompt right first.
6. **Test Arabic quality early.** If the model writes poor Libyan dialect, tell the team at hour 2 so we can adjust.
