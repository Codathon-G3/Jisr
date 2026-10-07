# Jisr (جِسر) — Shared Setup (Everyone Reads This First)

> **Product**: Jisr (Bridge Note) — AI-assisted writing companion that helps a young person in Libya write the first message to a real person.
> **Event**: Ai4LY National Codathon 2026
> **Deadline**: Wednesday 7 October 2026, 11:50 PM
> **Presentation**: Thursday 8 October 2026, after noon prayer, online (~5 min + ~5 min Q&A)

---

## ⏰ Time Reality Check

We have **less than one day**. A production product is NOT required. A **working prototype** that demonstrates the core chain is what we need:

```
Chips → (optional record) → trigger invitation → writing → risk check → drafts → edit → share
```

---

## 🏗️ Team Roles

| Person | Member | Role | Owns |
|---|---|---|---|
| **Person 1** | **Rayan** | Frontend & Capture | The entire mobile UI, chip capture, trigger logic, sharing, on-device record |
| **Person 2** | **Muatz** | AI / Backend | LLM integration, drafting API, risk check API, identifier removal |
| **Person 3** | **Shima** | Safety & Evidence | Crisis phrase list, output check, support card, plain templates, test set, safety figures |
| **Person 4** | **Mohamed Thabet** (Lead) | Trust Views, Arabic, Docs & Presentation | Trust UI components, all Arabic text, README, technical report, pitch deck, citations (`abdwadood2000@gmail.com`) |

**Rule**: Each person owns their area. Do NOT edit another person's files without coordinating.

---

## 🔧 Decisions to Agree on RIGHT NOW (first 30 minutes)

### 1. Tech Stack (Mobile App Workflow)

| Decision | Recommended Choice | Why |
|----------|-------------------|-----|
| **App form** | **Mobile App (Android / iOS)** | Official project decision; fits phone usage in Libya, native sharing & secure sandboxed storage |
| **Mobile Tech** | **React Native (Expo)** OR **Flutter** | **React Native (Expo)** is recommended for <24h: instant QR testing via Expo Go without waiting for Gradle builds; or **Flutter** if team is proficient |
| **Backend / API** | Next.js / Node.js (Vercel / Railway / ngrok) | Central API for LLM drafting, risk check & PII removal |
| **Mobile Storage** | `AsyncStorage` or `expo-secure-store` | Private on-device sandboxed record (never sent over network) |
| **Sharing** | Native Mobile Share Sheet (`Share.share()`) | Directly hands off message to WhatsApp, Messenger, Telegram, or SMS |
| **LLM Service** | Gemini API or Groq (Llama 3.3) | Fast, free tier, strong Arabic — **test NOW** |
| **Language** | TypeScript / JavaScript (or Dart for Flutter) | Team preference |

> ⚠️ **CRITICAL MOBILE NETWORKING RULE**: When testing from a physical phone or Expo Go, **never use `http://localhost:3000`** (the phone considers "localhost" to be itself!). Person 2 must deploy the API to Vercel/Railway, or use an `ngrok` tunnel / local Wi-Fi IP (`http://192.168.x.x:3000`).

### 2. Immediate Actions

- [ ] **Create the GitHub repo** — add all 4 members
- [ ] **Assign Team Lead** — notify organisers, send contestant emails
- [ ] **Person 2: Test LLM API access from Libya RIGHT NOW** — if it fails, we need a fallback immediately
- [ ] **Person 1: Set up the mobile project scaffold (e.g. `npx create-expo-app`)** and confirm it runs on a real phone via Expo Go or Android emulator
- [ ] **Assign support-contact verification** — who will try to verify a Libyan support contact? Deadline: hour 8. If no one can verify, we use the fallback card ("we cannot display an unconfirmed contact").
- [ ] **Confirm the native Arabic reviewer** — is it Person 4, or someone external?

### 3. Default Decisions (unless the team overrides)

| Question | Default | Reason |
|----------|---------|--------|
| Product delivery form? | **Mobile Application** | Official decision (DOCX IC1) |
| Private record on/off by default? | **Off** until user turns it on | Privacy-first (DOCX Q6) |
| Retention window? | **7 days** | Short enough for privacy, long enough for pattern |
| Pattern trigger threshold? | **3 occurrences** of same chip in window | Simple, predictable |
| Interface language? | **Arabic only** (RTL) for prototype | Matches target user in Libya (R21) |
| Minor/consent position? | State: "No data collected, no account. Under-18s are encouraged to use with a trusted adult's knowledge." | Minimal but stated (Q5) |
| Which trust views to build? | **Baseline comparison first** (highest demo value), then faithfulness view if time permits | Cut order from DOCX |

---

## 📂 Repository Structure

```
jisr/
├── src/
│   ├── app/                    # Rayan (Person 1): Pages & navigation
│   ├── components/             # Rayan (P1) + Mohamed Thabet (P4): UI components
│   │   ├── ChipSelector.*      # Rayan (Person 1)
│   │   ├── TextInput.*         # Rayan (Person 1)
│   │   ├── RecipientSelector.* # Rayan (Person 1)
│   │   ├── TriggerPrompt.*     # Rayan (Person 1)
│   │   ├── DraftDisplay.*      # Rayan (Person 1)
│   │   ├── SupportCard.*       # Rayan (P1, content from Shima P3)
│   │   ├── HumanRouteButton.*  # Rayan (Person 1)
│   │   ├── ShareButton.*       # Rayan (Person 1)
│   │   ├── FaithfulnessView.*  # Mohamed Thabet (Person 4)
│   │   ├── BaselineComparison.*# Mohamed Thabet (Person 4)
│   │   └── OutboundPreview.*   # Mohamed Thabet (Person 4)
│   ├── lib/
│   │   ├── record.ts           # Rayan (Person 1): On-device record
│   │   ├── share.ts            # Rayan (Person 1): Sharing logic
│   │   ├── identifier-removal.ts # Muatz (Person 2)
│   │   └── output-check.ts     # Shima (Person 3)
│   └── i18n/
│       └── ar.json             # Mohamed Thabet (Person 4): All Arabic strings
├── api/                        # Muatz (Person 2): Backend endpoints
│   ├── check-risk.ts
│   ├── generate-drafts.ts
│   └── faithfulness.ts
├── prompts/                    # Muatz (Person 2): LLM prompt files
│   ├── risk-check.md
│   └── drafting.md
├── safety/                     # Shima (Person 3): Safety data
│   ├── crisis-phrases.json
│   ├── forbidden-terms.json
│   ├── support-card.json
│   ├── plain-templates.json
│   ├── test-set.json
│   └── evidence.md
├── README.md                   # Mohamed Thabet (Person 4)
├── REPORT.md                   # Mohamed Thabet (Person 4)
├── CITATIONS.md                # Mohamed Thabet (Person 4)
├── pitch-deck.*                # Mohamed Thabet (Person 4)
└── package.json
```

**Ownership rule**: If a file has "Person X" next to it, only Person X edits it. If you need something changed in someone else's file, message them.

---

## 🔌 API Contract (Person 1 ↔ Person 2)

This is the **single most important interface** in the project. Both Person 1 and Person 2 must follow this exactly.

### `POST /api/check-risk`

**Request:**
```json
{
  "text": "ما نقدرش نكمل مع الامتحانات",
  "chips": ["exams"],
  "language": "ar"
}
```

**Response:**
```json
{
  "riskDetected": false,
  "method": "none"
}
```
Or if risk detected:
```json
{
  "riskDetected": true,
  "method": "phrase"
}
```

### `POST /api/generate-drafts`

**Request:**
```json
{
  "text": "ما نقدرش نكمل مع الامتحانات وبابا يضغط عليا",
  "chips": ["exams", "family"],
  "recipient": "friend",
  "language": "ar"
}
```

**Response:**
```json
{
  "sanitisedText": "ما نقدرش نكمل مع الامتحانات و[name] يضغط عليا",
  "identifiersRemoved": [
    { "original": "بابا", "placeholder": "[name]" }
  ],
  "drafts": [
    { "tone": "gentle", "text": "مرحبا، حبيت نقولك إني..." },
    { "tone": "direct", "text": "سلام، عندي موضوع..." },
    { "tone": "formal", "text": "أردت أن أتحدث معك بخصوص..." }
  ],
  "outputCheckPassed": true,
  "usedFallbackTemplate": false
}
```

### `POST /api/faithfulness` (optional — only if time permits)

**Request:**
```json
{
  "originalText": "ما نقدرش نكمل مع الامتحانات",
  "draft": "مرحبا، حبيت نقولك إني عندي ضغط من ناحية الامتحانات..."
}
```

**Response:**
```json
{
  "alignments": [
    { "draftPhrase": "ضغط من ناحية الامتحانات", "inputPhrase": "نكمل مع الامتحانات" }
  ]
}
```

### Rules
- **Person 1 can assume**: The API handles identifier removal internally. If the API is unreachable, Person 1 shows the plain templates from Person 3 instead.
- **Person 2 must guarantee**: Always returns exactly 3 drafts (or template fallback). No clinical language. Nothing stored. Response within 10 seconds.

---

## 📋 Data Files Contract (Person 3 → Person 1 & Person 2)

### `safety/support-card.json`

```json
{
  "title_ar": "تحتاج تتكلم مع حد؟",
  "message_ar": "...",
  "contacts": [
    { "name": "...", "number": "...", "verified": true, "verifiedBy": "Shima" }
  ],
  "fallbackMessage_ar": "لا نستطيع عرض رقم لم نتحقق منه. تحدث مع شخص تثق فيه."
}
```

### `safety/plain-templates.json`

```json
{
  "gentle": {
    "friend": "مرحبا، حبيت نقولك إني مريت بوقت صعب من ناحية [topic]. ما كنت عارف/ة كيف نبدأ نحكي، بس حسيت إنك الشخص اللي نقدر نتكلم معاه/ا.",
    "sibling": "...",
    "parent": "...",
    "trusted_adult": "...",
    "counsellor": "..."
  },
  "direct": { "friend": "...", "...": "..." },
  "formal": { "friend": "...", "...": "..." }
}
```

### `safety/crisis-phrases.json`

```json
{
  "phrases": [
    { "text": "نبي نموت", "script": "arabic", "category": "self-harm" },
    { "text": "nabi nmot", "script": "latin", "category": "self-harm" },
    { "text": "مش قادر نكمل", "script": "arabic", "category": "crisis" }
  ]
}
```

### `safety/forbidden-terms.json`

```json
{
  "terms": [
    { "text": "اكتئاب", "category": "condition_name" },
    { "text": "depression", "category": "condition_name" },
    { "text": "medication", "category": "treatment" },
    { "text": "دواء", "category": "treatment" }
  ]
}
```

---

## 📋 Arabic Strings Contract (Person 4 → Person 1)

### `src/i18n/ar.json`

```json
{
  "app_name": "جِسر",
  "chips": {
    "exams": "الامتحانات",
    "family": "العائلة",
    "work": "العمل",
    "relationships": "العلاقات",
    "sleep": "النوم",
    "money": "المال",
    "other": "حاجة ثانية"
  },
  "recipients": {
    "friend": "صديق/ة",
    "sibling": "أخ/أخت",
    "parent": "أحد الوالدين",
    "trusted_adult": "شخص كبير تثق فيه",
    "counsellor": "مرشد/ة أو معلم/ة"
  },
  "triggers": {
    "same_session_template": "اخترت {chip}. تحب مساعدة في كتابة رسالة قصيرة لحد عنها؟",
    "pattern_template": "لاحظنا إنك ذكرت {chip} أكثر من مرة. تحب تكتب رسالة قصيرة لحد عنها؟"
  },
  "buttons": {
    "yes_help_me": "أيه، ساعدني",
    "not_now": "مش هلا",
    "share": "شارك",
    "copy": "انسخ",
    "edit": "عدّل",
    "delete_record": "امسح كل شي",
    "talk_to_someone": "تكلم مع حد هلا"
  },
  "tones": {
    "gentle": "لطيف",
    "direct": "مباشر",
    "formal": "رسمي"
  },
  "disclosure": "هذا النص ساعد الذكاء الاصطناعي في صياغته. أنت تقرر إذا تبي تعدّل أو ترسل.",
  "limits": "جِسر مش دكتور، مش أداة تشخيص، مش بديل للمختصين، مش خدمة أزمات. هو طريقك للوصول لحد.",
  "text_placeholder": "اكتب شنو تحس بيه... (اختياري)",
  "encouraged_out": "رسالتك جاهزة. الخطوة الجاية بينك وبين الشخص اللي اخترته."
}
```

Rayan (Person 1) uses these strings directly. Mohamed Thabet (Person 4) may update them — Rayan should always read from this file, not hardcode Arabic.

---

## ⏱️ Timeline

| Time Block | What Happens |
|------------|-------------|
| **Hour 0–0.5** | 🤝 Shared setup: repo, tech stack, API key test, role confirmation |
| **Hour 0.5–3** | 🧱 Foundations: each person builds their core independently |
| **Hour 3–8** | 🔨 Parallel development: everyone building their piece |
| **Hour 6** | 🔍 **Checkpoint**: P1 has working UI with mocks? P2 has deployed API? P3 has phrase list + test set? P4 has Arabic strings? |
| **Hour 8–10** | 🔗 Integration: connect frontend to real API, plug in safety data, add Arabic strings |
| **Hour 10** | 🔍 **Checkpoint**: full end-to-end flow works on a phone? |
| **Hour 10–12** | 🧪 Testing, safety evaluation, bug fixes |
| **Hour 12** | 🛑 **Feature freeze** — no new features after this |
| **Hour 12–13.5** | 📝 Final docs, pitch deck, demo video backup |
| **Hour 13.5** | 🚀 **Final push to GitHub, submit repo link** |

---

## 🚫 Things That Are NEVER Cut

From the DOCX §20.2:

1. **Guardian Layer** (risk check before drafting + support card)
2. **Persistent human route** ("Talk to Someone Now" button on every screen)
3. **Privacy of the drafting path** (nothing stored, identifiers removed)

If we're behind schedule, we cut in this order:
1. Optional items (extra tones, extra languages, private written notes)
2. Pattern record (keep same-session trigger)
3. Baseline comparison view
4. Faithfulness view

---

## 📦 What Must Be in the Repository at Submission

- [ ] Complete source code
- [ ] `README.md` — architecture, requirements, setup, usage
- [ ] `REPORT.md` — detailed technical report
- [ ] Pitch deck file OR demo video
- [ ] `CITATIONS.md` — every tool, model, service cited
- [ ] **NOT in the repo**: API keys, real user data, unverified contacts, unlicensed resources

---

## 🗣️ Communication

- Use the team group chat for quick questions
- If you're blocked by someone else's work, **say so immediately** — don't wait
- If your piece is ready for integration, **announce it** with what endpoint/file is ready
- If something is taking longer than expected, **say so by the hour 6 checkpoint** so we can adjust

---

*Now read your individual plan (Person 1/2/3/4) and start building.*
