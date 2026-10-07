# 🌉 Jisr (جِسر) — Team Execution Kit (Ai4LY Codathon 2026)

> **Submission Deadline**: Wednesday, October 7, 2026 at 11:50 PM  
> **Presentation / Evaluation**: Thursday, October 8, 2026 after noon prayer (Online, ~5 min presentation + ~5 min Q&A)  
> **Team**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima | **Contact**: abdwadood2000@gmail.com

---

## 📌 Welcome Team! Start Here

This folder contains the complete, battle-ready implementation roadmap for our project **Jisr** (Bridge Note). Everything has been structured to prevent blocking, eliminate confusion, and ensure that all four of us can work simultaneously from minute one.

---

## 🗺️ How to Use This Kit

1. **Everyone reads [00_SHARED_SETUP.md](./00_SHARED_SETUP.md) together** (first 15–20 minutes).
   - This sets our tech stack, API contracts, repository layout, and mutual guarantees.
2. **Every member takes their dedicated individual plan**:
   - **Rayan (Person 1 — Mobile App & Interaction Engineer)**: [01_PERSON_1_FRONTEND.md](./01_PERSON_1_FRONTEND.md)
   - **Muatz (Person 2 — AI Core & Backend Engineer)**: [02_PERSON_2_AI_BACKEND.md](./02_PERSON_2_AI_BACKEND.md)
   - **Shima (Person 3 — Safety, Guardian & Evidence Engineer)**: [03_PERSON_3_SAFETY.md](./03_PERSON_3_SAFETY.md)
   - **Mohamed Thabet (Team Leader, Person 4 — Trust Views, Arabic Quality & Presentation Lead)**: [04_PERSON_4_DOCS_ARABIC.md](./04_PERSON_4_DOCS_ARABIC.md)
3. **During integration checkpoints**, consult [05_INTEGRATION_AND_TESTING_PROTOCOL.md](./05_INTEGRATION_AND_TESTING_PROTOCOL.md).
4. **Starter data files** are ready to import in the `starter_data/` folder so nobody has to write boilerplate JSON from scratch!

---

## 👥 Roles & Responsibilities at a Glance

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                 TEAM RESPONSIBILITIES                             │
├─────────────────────┬───────────────────┬───────────────────┬─────────────────────┤
│  Rayan (Person 1)   │  Muatz (Person 2) │  Shima (Person 3) │ Mohamed Thabet (P4) │
│ Mobile App & Capture│   AI / Backend    │ Safety & Evidence │ Trust, Arabic, Docs │
├─────────────────────┼───────────────────┼───────────────────┼─────────────────────┤
│ • React Native /    │ • LLM Integration │ • Crisis Phrases  │ • Arabic UI (i18n)  │
│   Flutter Mobile App│ • /api/check-risk │ • Forbidden Words │ • Arabic Review     │
│ • Chip selection    │ • /api/drafts     │ • Support Card    │ • Trust Components  │
│ • Free-text input   │ • PII Stripping   │ • Plain Templates │ • README & Report   │
│ • Triggers UI       │ • Stateless API   │ • Safety Test Set │ • Pitch Deck/Video  │
│ • Human Route Button│ • Vercel Deploy   │ • Recall & Figures│ • Citations Table   │
│ • Native Mobile     │ • Model Prompts   │ • Output Check    │ • Committee Q&A     │
│   Share Sheet       │                   │                   │                     │
│ • AsyncStorage Rec  │                   │                   │                     │
└─────────────────────┴───────────────────┴───────────────────┴─────────────────────┘
```

---

## ⏱️ Master Timeline & Checkpoints

| Time Window | Milestone | Goal / Hand-off |
|---|---|---|
| **00:00 – 00:30** | **Phase 0: Kickoff** | Agree tech stack, verify LLM API from Libya, create GitHub repo, appoint Team Lead. |
| **00:30 – 03:00** | **Phase 1: Foundations** | • P1 builds UI shell with mocks.<br>• P2 tests LLM and builds API endpoints.<br>• P3 expands crisis phrase & forbidden term lists.<br>• P4 writes `ar.json` & starts README. |
| **03:00 – 06:00** | **Phase 2: Core Development** | • P1 implements draft screens & triggers.<br>• P2 perfects system prompts & PII removal.<br>• P3 finalizes plain templates & test set.<br>• P4 builds Baseline Comparison component & reviews prompts. |
| **06:00 Checkpoint** | **Midpoint Sync** | **Demo Check**: P1 has interactive UI; P2 has live API; P3 has safety files; P4 has Arabic copy. |
| **06:00 – 08:30** | **Phase 3: Integration** | Connect P1 frontend to live P2 API. Wire up P3 safety guards and P4 Arabic copy. |
| **08:30 – 10:30** | **Phase 4: Evaluation & Hardening** | Full end-to-end tests on real phones. P3 measures recall numbers. P4 records backup demo video. |
| **10:30 – 12:00** | **Phase 5: Freeze & Final Polish** | Code freeze. Finalize `REPORT.md`, `README.md`, pitch deck, and citations. |
| **11:00 PM** | **Final Submission Buffer** | Verify GitHub repository, links, video, and submit on Discord/portal **before 11:50 PM**. |

---

## 🚨 Emergency Cut Order (If Falling Behind)

If any component is delayed, we strictly follow the official product cut hierarchy:

1. **Cut Tier 4**: Extra languages, extra recipients, private written notes (never built).
2. **Cut Tier 3**: Pattern recurrence record & persistence (rely 100% on same-session trigger).
3. **Cut Tier 2**: Faithfulness highlight view (keep Baseline Comparison).
4. **Cut Tier 1**: Baseline Comparison view.
5. **NEVER CUT**:
   - 🛡️ **The Guardian Layer** (Risk check + Fixed support card)
   - 🆘 **The Persistent Human Route** ("Talk to Someone Now" button on every screen)
   - 🔒 **Zero Data Retention** (Stateless drafting, no tracking)

---

## 📞 Critical Success Factors

- **Fast handoffs**: Do not wait for others to be 100% finished. Use mocks and agreed JSON contracts.
- **Libyan Context**: Evaluators care about real applicability in Libya (Arabic RTL, Libyan dialect, low bandwidth, stigma-free framing, family-respecting recipients).
- **Measure Safety**: Evaluators want measured numbers, not vague claims. Person 3's recall test gives us that advantage.

Let's do this! Open your designated plan and begin. 🚀
