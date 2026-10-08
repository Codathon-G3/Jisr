# Person 1: Rayan Khalid Aljabo — Mobile App & Interaction Engineer

> **Read `00_SHARED_SETUP.md` first.** This document is your individual plan.

---

## Your Role

You own the **mobile application (Android / iOS)**. Everything the user sees and touches on their phone goes through your code. The other three people build data, safety guardrails, and backend endpoints that plug into your mobile application.

## What You Build

```
┌─────────────────────────────────────────────────────┐
│               YOUR MOBILE APP TERRITORY             │
│                                                     │
│  Mobile Chip Selection Screen                       │
│  ├── Chip buttons (7 categories, RTL layout)        │
│  ├── Free-text input (1-3 lines, native TextInput)  │
│  ├── Recipient selector (5 types)                   │
│  └── Same-session trigger invitation banner/modal   │
│                                                     │
│  Mobile Drafting Screen                             │
│  ├── Calls Muatz's (Person 2) API (deployed/LAN IP) │
│  ├── Shows risk result → support card modal OR draft│
│  ├── Draft cards (3 tones: gentle, direct, formal)  │
│  ├── In-place draft editing                         │
│  ├── AI disclosure notice (from Mohamed Thabet / P4)│
│  └── Native Share button (WhatsApp/Messenger sheet) │
│                                                     │
│  Fixed Support Card Modal (from Shima / Person 3)   │
│  "Talk to Someone Now" button (on every screen)     │
│                                                     │
│  On-Device Sandboxed Record (AsyncStorage)          │
│  Pattern Trigger Counter Logic                      │
│                                                     │
│  Trust view slots (Baseline Comparison component)   │
│  Encouraged-Out Screen ("Your message is ready!")   │
└─────────────────────────────────────────────────────┘
```

---

## Task List (in priority order)

### Must-Do (Core — never cut)

| # | Task | When | Est. |
|---|------|------|------|
| 1 | **Mobile project scaffold** — Create mobile app (e.g. `npx create-expo-app jisr --template blank-typescript` or Flutter). Run it on a physical phone via Expo Go or Android emulator. | Hour 0.5–1 | 30 min |
| 2 | **Chip selection UI** — 7 chip buttons (exams, family, work, relationships, sleep, money, other). Multi-select toggle state. Arabic labels from Mohamed Thabet's (Person 4) `ar.json`. RTL flexbox layout. | Hour 1–2 | 1 hr |
| 3 | **Free-text input** — Native `TextInput` for 1–3 lines. RTL text alignment. Arabic placeholder from Mohamed Thabet (Person 4). Optional for the user. | Hour 2–2.5 | 30 min |
| 4 | **Recipient selector** — 5 options (friend, sibling, parent, trusted adult, counsellor/teacher). Arabic labels from Mohamed Thabet (Person 4). | Hour 2–2.5 | 30 min |
| 5 | **Same-session trigger** — After chips tapped: show gentle invitation prompt: "اخترت الامتحانات. تحب مساعدة في كتابة رسالة قصيرة لحد عنها؟" with "أيه، ساعدني" and "مش توا" buttons. Dismissal prevents re-triggering for same chips. | Hour 2.5–3 | 30 min |
| 6 | **Mobile navigation flow** — Set up screen navigation (React Navigation / Expo Router): Chips → Trigger → Writing → Drafts → Edit → Share → Encouraged-Out. | Hour 3–4.5 | 1.5 hr |
| 7 | **"Talk to Someone Now" persistent button** — Visible on every screen (e.g., sticky top/bottom app bar). Tapping immediately opens the Fixed Support Card modal without network latency. | Hour 3–3.5 | 30 min |
| 8 | **API integration (with mock data first)** — Fetch `/api/check-risk` and `/api/generate-drafts`. Start with hardcoded mock responses so you are never blocked by Muatz (Person 2). **Rule**: use Muatz's deployed Vercel URL or local LAN IP (e.g. `http://192.168.1.X:3000`), never `localhost`. | Hour 4–5 | 1 hr |
| 9 | **Support card modal** — Render the fixed support card from Shima's (Person 3) `support-card.json`. Shown when risk is detected OR when user taps persistent support button. Includes option to resume note. | Hour 5–5.5 | 30 min |
| 10 | **Draft display + editing** — Show 3 drafts (gentle / direct / formal) in swipeable cards or tabs. Selected draft is editable in a text box. Display AI disclosure banner. | Hour 5–6.5 | 1 hr |
| 11 | **Native mobile sharing** — Native share button using `Share.share({ message: finalDraft })` (in React Native) or `share_plus` (Flutter). Opens system share sheet directly into WhatsApp, Messenger, Telegram, or SMS. Zero tracking. | Hour 6.5–7 | 30 min |
| 12 | **Connect live API** — Replace mock API calls with Muatz's (Person 2) live deployed endpoints. Test full flow on physical phone. | Hour 8–9 | 1 hr |
| 13 | **Integrate Shima's (Person 3) safety fallbacks** — Import `support-card.json` and `plain-templates.json`. If network is unreachable or API times out, automatically load the 3 plain templates. | Hour 9–9.5 | 30 min |
| 14 | **Integrate Mohamed Thabet's (Person 4) Arabic strings** — Load `ar.json` for all labels, placeholders, and buttons. | Hour 9–9.5 | 30 min |
| 15 | **Mobile testing & polish** — Test on real Android/iOS phone. Verify RTL rendering, touch targets, keyboard avoiding views, and font legibility. | Hour 10–11 | 1 hr |

### Should-Do (Core Extension — built if core is stable)

| # | Task | When | Est. |
|---|------|------|------|
| 16 | **On-device sandboxed record** — Store chip selections + timestamp in `AsyncStorage` or `expo-secure-store`. User toggle: on/off (default: off). One-action delete. 7-day auto-expiry. **Verify zero network calls leave the device for this.** | Hour 7–8 | 1 hr |
| 17 | **Pattern trigger** — If same chip theme exists ≥3 times in recent history, show pattern-specific prompt: "لاحظنا إنك ذكرت الامتحانات أكثر من مرة. تحب تكتب رسالة قصيرة لحد عنها؟" | Hour 8–8.5 | 30 min |

### Nice-to-Have (Trust Views — Mohamed Thabet provides component logic, you integrate)

| # | Task | When | Est. |
|---|------|------|------|
| 18 | **Baseline comparison toggle** — Toggle button on draft screen showing AI draft side-by-side (or tabbed) against Shima's (Person 3) plain template. | Hour 9.5–10 | 30 min |

---

## Your Mock Data (use until Muatz's (Person 2) API is ready)

```javascript
// Mock /api/check-risk response
const mockRiskResponse = {
  riskDetected: false,
  method: "none"
};

// Mock /api/generate-drafts response
const mockDraftsResponse = {
  sanitisedText: "ما نقدرش نكمل مع الامتحانات",
  identifiersRemoved: [],
  drafts: [
    { tone: "gentle", text: "مرحبا، حبيت نقولك إني مريت بوقت صعب من ناحية الامتحانات. ما كنت عارف كيف نبدأ نحكي، بس حسيت إنك الشخص اللي نقدر نتكلم معاه." },
    { tone: "direct", text: "سلام، عندي موضوع حبيت نحكيلك عليه. الامتحانات ضاغطة عليا بزاف ونحتاج حد يسمعني." },
    { tone: "formal", text: "أردت أن أتحدث معك بخصوص ضغوط الامتحانات التي أمر بها. أقدر رأيك وأحتاج لمن يستمع." }
  ],
  outputCheckPassed: true,
  usedFallbackTemplate: false
};
```

Use these from hour 1 so you can build the full UI without waiting.

---

## What You Receive from Others

| From | What | When to expect | What to do if late |
|------|------|---------------|-------------------|
| **Muatz (Person 2)** | Live API endpoints (`/api/check-risk`, `/api/generate-drafts`) | Hour 6 | Keep using mocks; escalate at checkpoint |
| **Shima (Person 3)** | `support-card.json`, `plain-templates.json` | Hour 4–5 | Use placeholder card text; ask Shima |
| **Mohamed Thabet (Person 4)** | `ar.json` (Arabic strings) | Hour 2–3 | Use temporary English labels, swap later |
| **Mohamed Thabet (Person 4)** | Trust view components (`FaithfulnessView`, `BaselineComparison`) | Hour 8–9 | Skip trust views — they're cuttable |

---

## What You Deliver to Others

| To | What | When |
|----|------|------|
| **Muatz (Person 2)** | Confirmation that you're using the agreed API contract (JSON shapes) | Hour 0.5 |
| **Mohamed Thabet (Person 4)** | An Expo QR link / runnable mobile build / video screen capture for the pitch deck | Hour 8 |
| **Everyone** | The full list of UI strings that need Arabic text | Hour 1 |

---

## Testing Checklist

- [ ] **Chips**: all 7 chips render, are tappable, multi-select works
- [ ] **Text input**: native mobile RTL text entry works, Arabic text displays correctly
- [ ] **Recipient selector**: all 5 options selectable
- [ ] **Trigger**: appears after chip selection, dismissed on "not now", doesn't re-appear
- [ ] **Risk flow**: when API returns `riskDetected: true`, support card modal shows, "continue" button works
- [ ] **Drafts**: 3 drafts display correctly in Arabic RTL
- [ ] **Editing**: user can modify a draft directly on mobile
- [ ] **Sharing**: native mobile share sheet (`Share.share`) pops up with options for WhatsApp, Messenger, etc.
- [ ] **Human route**: "Talk to Someone Now" button visible and functional on EVERY screen
- [ ] **API failure fallback**: if network is disabled or API times out, plain templates display automatically
- [ ] **On-device record**: data persists locally in `AsyncStorage` / `SecureStore`, no network requests initiated
- [ ] **Mobile usability**: responsive on different phone screen sizes, keyboard does not obscure inputs
- [ ] **Privacy**: zero analytics, zero crash telemetry, zero external network calls except drafting API

---

## Definition of Done

A user can open the mobile app on a phone, see Arabic chips, tap them, optionally write text, pick a recipient, see a trigger invitation, accept it, see 3 drafts (or support card if risk detected), edit a draft, and share it via WhatsApp/Messenger through the native share sheet — all in Arabic, RTL, with the "Talk to Someone Now" button visible on every screen, and a working offline template fallback.

---

## Critical Reminders

1. **The "Talk to Someone Now" button is NEVER hidden, disabled, or moved.** It's on every mobile screen.
2. **Nothing is sent automatically.** The native share sheet hands the text to the user's messaging app only when the user explicitly taps Share.
3. **Never hardcode `localhost` in mobile fetch calls.** Use Muatz's (Person 2) deployed backend or local Wi-Fi IP address.
4. **The on-device record NEVER makes a network request.** It stays 100% inside sandboxed `AsyncStorage`.
5. **If the API fails, show plain templates.** The mobile app must gracefully deliver value even without network connection.
