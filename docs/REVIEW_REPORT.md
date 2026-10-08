# Jisr (جِسر) — Code & Documentation Review

> **Date**: 8 October 2026 (the submission deadline, 7 October 23:50, has passed; the presentation is today)  
> **Branch**: `feat/apk-mobile-sync`, fast-forwarded to `origin/main` at `4e6388d` (includes Muatz's live-API commit `d876b22`, merged with these fixes); all changes below are **uncommitted** and wait for team review  
> **Reviewed against**: the product definition (`docs/Bridge_Note_Product_Definition.pdf`), `docs/master_implementation_plan.md`, `docs/team_plan/`, and the challenge criteria from the lecture  
> **Reviewer**: Claude Code (Anthropic), at the team's request

> **Update, 8 October, later the same day.** Everything below is now committed on `feat/apk-mobile-sync` (pushed) and merged into `visual-identity`. Since the first version of this report:
> - **Held-out safety evaluation done** (`safety/heldout-set.json`, 64 synthetic sentences not used for tuning, written by the reviewer, so not blind). Live service, phrase + model: **26/26 crisis caught (95% CI 87–100%), 3/30 false alarms**; model alone 26/26 and 0/30; phrase list alone 6/26. Details in `safety/evidence.md` §3b and `REPORT.md` §8.4.
> - **Main's final `REPORT.md` (PR #9) kept, with factual corrections:** family words are kept (not replaced) by identifier scrubbing; the client timeout is 60 s, not 2.5 s; the 11/11 figure is labelled as the dev set; the server-side gate, continue-after-card, private record and minors notice are described.
> - **`submission/Jisr_Full_Project_Overview.pdf` regenerated from `REPORT.md`** (`docs/scripts/build_overview_pdf.py`). The previous version still described a Groq/Llama 3.3 failover and "Gemini 1.5 Flash (sub-800ms)", none of which exist, a 2.5 s timeout, "safety is 100% deterministic", and "100.0% crisis recall" from the dev set.
> - **Minors notice in the app** (product definition Q5) and **unused Android permissions blocked**.
> - **Backend hardening:** key in the `x-goog-api-key` header, uvicorn's IP access log off, a process-wide model-call cap, a 4,000-character text limit. Backend tests: **102 passed**.
> - **Still for the team:** redeploy the backend on Render (the live service still runs the old code; set the start command in the dashboard if it does not use `render.yaml`), native review of the new Arabic strings, a blind test set, verifying a helpline, and the personal-email decision. The pitch deck numbers are updated in `submission/`; check slide 4 if you present from another file.

---

## 1. Summary

- **The idea is the right kind of answer to a shared brief.** Most teams will build AI that talks to the user. Jisr uses AI to get the user to a real person and then gets out of the way. The product definition is strong and most of it was built.
- **Before the fixes, a judge would probably see no AI.** The APK could only reach an emulator-only address. The web page never called the backend. The docs described a Groq/Llama fallback that does not exist. "Real use of AI" is one of the two most important criteria.
- **Before the fixes, privacy and safety claims went further than the code.** Raw text went to two endpoints. Names were not removed. The privacy preview came after sending. The private record was on by default and never expired. Recall was reported as 100% on the set used for tuning.
- **Fixed now (uncommitted):** C1, C2, C5, C6, R5, R10, R18 and R23 in the code, plus the documentation and the pitch files. The tests grew from 41 backend tests and 4 shallow JS checks to **89 backend tests and 12 JS suites, all passing**.
- **Still open and most urgent:**
  1. redeploy the backend with these changes (the live API at `https://jisr-api.onrender.com` still runs the old code without the server-side gate) and rebuild the APK, which now calls the live API by default;
  2. repair `package.json` on main, which has Expo 57 and no `react-native`, so the mobile app cannot install from a fresh clone;
  3. native review of the new Arabic strings;
  4. a blind safety test set.

---

## 2. Weak points by criterion

"Fixed" means changed in this branch and covered by a test or a doc edit. "Open" means it still needs the team.

### Real use of AI (one of the two most important)

| # | Weak point | Where | Status |
|---|---|---|---|
| A1 | APK hard-wired to `http://10.0.2.2:8000` (emulator only); release builds block plain `http`; the URL override used bracket notation, which Expo never inlines. On a phone, every "AI draft" was a template | `src/services/api.ts` (old lines 35–47) | **Fixed** in code (defaults to the live https API; dot-notation `EXPO_PUBLIC_API_URL` override). **Open**: APK rebuild (P1) |
| A2 | Backend never deployed ("URL will be written here after the service is live") | `backend/README.md:43` | **Fixed** by Muatz: live at `https://jisr-api.onrender.com`. **Open**: redeploy with this branch's backend changes (P2) |
| A3 | Web showcase used templates only: no backend call, no crisis check | `src/app/page.js` | **Fixed** (backend drafting, on-device Guardian, continue-after-card) |
| A4 | Docs claimed Gemini 1.5 Flash plus a Groq / Llama 3.3 70B fallback; the code calls only `gemini-flash-lite-latest` | README, REPORT §3.1, CITATIONS, QA Q6, PPTX slide 5 | **Fixed** |
| A5 | 3 s client timeout cut off real Gemini answers (the backend allows 10 s per call, up to 3 calls) | `src/services/api.ts` | **Fixed** (60 s risk and drafts, which covers the Render free-tier wake-up; 15 s faithfulness) |
| A6 | Comparison view always said the AI was better, and compared the user's edited text instead of the AI draft | `src/components/BaselineComparison.tsx` | **Fixed** (neutral labels, "AI unavailable" notice, compares the AI draft) |
| A7 | Faithfulness view claimed "no fabrication or hallucination" | `src/components/FaithfulnessView.tsx` | **Fixed** (says which parts came from the user and which the AI wrote) |
| A8 | No measured evidence that the AI draft beats the template | REPORT §6 | **Open** (P4: blind native rating) |

### Applicability in Libya (one of the two most important)

| # | Weak point | Where | Status |
|---|---|---|---|
| L1 | `package.json` on main has `expo ^57` but no `react-native` (a required peer). The lockfile does not contain it either, so `npm ci` cannot run the mobile app from a fresh clone. The docs still say Expo SDK 51 / RN 0.74 | `package.json:35-40`, `package-lock.json` | **Open** (P1) |
| L2 | Arabic-Indic digits (٠٩١…) not caught as phone numbers | identifier removal | **Fixed** |
| L3 | Draft quality on Libyan dialect and Arabizi never rated by native speakers | — | **Open** (P4) |
| L4 | APK is 63 MB, with x86_64 libraries | `builds/` | **Open** (P1: ARM-only rebuild) |
| L5 | Unmeasured numbers: "<2 KB / <1.5 KB payload", "90%+ use WhatsApp/Messenger", "sub-second drafts" | README, REPORT, deck | **Fixed** |
| L6 | Expo Go only runs one SDK version; the docs promised it works | README, REPORT §3.2 | **Fixed** (caveat added) |

### Innovation

See section 3. The weak points are: the difference was not visible in a demo (A1, A3), and the trust views oversold (A6, A7). Both are fixed in code.

### Social impact

| # | Weak point | Where | Status |
|---|---|---|---|
| S1 | "Behavioural telemetry" and "time-to-outreach >30 min → <60 s" presented as results; nothing was measured, and telemetry contradicts the privacy design | REPORT §6.3 | **Fixed** (rewritten as planned targets for consented sessions) |
| S2 | No consented demonstration sessions yet (product definition §11.4, Q15) | — | **Open** (all) |

### Ease of use

| # | Weak point | Where | Status |
|---|---|---|---|
| E1 | The crisis check ran on every keystroke and opened the card mid-phrase (e.g. at "نبي نموت" before "من الضحك") | `App.tsx` | **Fixed** (700 ms pause before checking) |
| E2 | After the support card the user could not continue to their note, although the card says "تقدر ترجع وتكمل كتابة رسالتك" (R10) | `App.tsx`, `SupportCardModal.tsx` | **Fixed** |
| E3 | Sharing was blocked whenever crisis words appeared, which blocks the human route itself | `App.tsx` | **Fixed** (sharing never blocked) |

### Privacy & safety

| # | Weak point | Where | Status |
|---|---|---|---|
| P1 | Raw, unscrubbed text sent to `/api/check-risk` and to `/api/faithfulness` (on every keystroke) | `src/services/api.ts`, `App.tsx` | **Fixed** |
| P2 | Privacy preview shown after the text was sent (R16 requires before) | `App.tsx` | **Fixed** (live preview under the text box, mobile and web) |
| P3 | Names not removed ("اسمي أحمد" left as is); family words (بابا، أمي) replaced with `[name]`, which damages the drafts | `piiSanitizer.ts`, `identifier_removal.py` | **Fixed** (names after "اسمي"/"my name is", common-name list, @handles; family words kept) |
| P4 | Private record on by default, never expired, stored the recipient, included in Android backup (§8.2, Q6, Q9, IC5) | `src/services/storage.ts`, `app.json` | **Fixed** |
| P5 | App fails open: a slow `/check-risk` meant "safe", and `/generate-drafts` did not re-check, so crisis text could reach the drafting model | `api.ts`, `backend/app/services/drafting.py` | **Fixed** (server-side gate before any drafting) |
| P6 | With the model down, every input was flagged as a crisis (server failed closed) | `risk_check.py` | **Fixed** for drafting (templates instead). `/check-risk` still fails closed, by design |
| P7 | 100% recall reported on the tuning set; crisis item #22 dropped as "ambiguous"; no blind set; model layer unmeasured | REPORT §6, README, deck | **Fixed** in reporting (10/11 = 90.9%, CI 62.3–98.4%; `evaluate.mjs` now prints it). **Open**: blind set (P3) |
| P8 | Phrase list generalises poorly: 8 of 16 unseen phrasings caught in a review spot check | `safety/crisis-phrases.json` | **Open** (P3) |
| P9 | Stated limits omitted "not a therapist" and "not a crisis service" (R23) | `ar.json`, `stated-limits.json` | **Fixed** (all five, on capture and drafting screens, mobile and web) |
| P10 | No stated position on minors (Q5) | — | **Fixed** in README, REPORT, QA. **Open** in the app UI (P1 + P4) |
| P11 | Gemini API tier not disclosed; on the free tier Google may use prompts | docs | **Fixed** in docs. **Open**: confirm a paid-tier key (P2) |
| P12 | No support line verified; `contacts: []`, verification log blank | `safety/support-card.json:7`, `safety/contact-verification.md:8` | Correct behaviour (fallback statement). **Open**: fill the log (P3) |
| P13 | Team lead's personal email published | `README.md:31`, `REPORT.md:301` | **Open** (team decision; an earlier commit removed it) |
| P14 | Open CORS `*`, no rate limit, API key sent as a URL query parameter | `backend/app/config.py:13`, `llm_client.py:35` | **Open** (P2, before real users) |
| P15 | APK declares unused storage and overlay permissions | `app.json` | **Open** (P1: `android.blockedPermissions`) |

---

## 3. Innovation assessment

**What makes Jisr different from a typical mental-health chatbot:**

1. **Direction.** The AI helps the help-seeker reach a person and then leaves; there is no chat surface (product definition §2.3, §15.2).
2. **Safety order.** The risk check runs before any generation, and the "تكلم مع حد توا" button never depends on the classifier. After this review the gate also runs on the server, so crisis text never reaches the drafting model.
3. **AI checking AI, in the interface.** The faithfulness map uses alignments the server has verified, and the comparison view is allowed to show the AI losing (§4.4).
4. **Early support without surveillance.** On-device chip memory leads to a neutral invitation to write. Nothing is inferred about the person (§7.3).
5. **Libyan dialect and Arabizi throughout:** crisis list, prompts and UI.

**Where the difference was weak, missing or badly explained:**

- **Invisible in a demo.** The APK and the web page never reached the AI (A1, A3), so a judge could only see templates. Fixed in code; it needs the deploy and rebuild to show.
- **Oversold trust views.** "AI is better" and "no hallucination" turned the most original features into marketing. They are now neutral and honest, which makes the innovation claim stronger, because the spec says the toggle exists to show the truth.
- **The second innovation is under-explained.** The pitch barely explains the connected loop (taps, then private memory, then a quiet invitation; §15.2). With the record off by default, say in the demo that it is turned on for the demo.
- **No numbers behind "real AI".** One blind AI-vs-template rating would answer the committee's main question.
- **Bridge Note+ ideas.** Mood check-ins, the diary, habits and rehearsal conflict with "short sessions, no open-ended chat" (§2.3, §9.3, R19). Only "how to listen" tips for the recipient fit the spec.

**Cheap upgrades that fit the spec:**
- highlight what the AI *added* (amber) in the faithfulness view;
- a recipient-side "how to listen" page (static, based on WHO Psychological First Aid);
- the blind rating above.

---

## 4. Consistency mismatches

Checked README, REPORT, `docs/PITCH_DECK.md` (and `.html`/`.pptx`) and `docs/COMMITTEE_QA.md` against the product definition and the master plan.

| Topic | Product definition / plan | What docs or code said | Status |
|---|---|---|---|
| Four AI functions | Structure, tone, faithfulness, risk (§4.4) | Docs consistent; the code could not reach functions 1–4 from the APK or the web page | Code fixed |
| Guardian Layer | "No drafting happens until it has run" (§10.4) | App drafted when the risk call timed out | Fixed |
| Support card | Continue to the note afterwards (R10) | Not possible | Fixed |
| Outbound preview | Seen and correctable *before* sending (R16) | Shown after sending | Fixed |
| Private record | Off by default (Q6), 7-day window (Q9), chips only (§8.2.3), no backup (IC5) | On, no expiry, stored recipient, backed up | Fixed |
| Pattern trigger | 3 times within the window (Q8) | 3 times ever | Fixed |
| Stated limits | Not doctor, diagnosis tool, specialist replacement, therapist, crisis service (R23) | Three of five | Fixed |
| Minors | State a position in UI and report (Q5) | Missing | Docs fixed; UI open |
| AI disclosure | State AI involvement at every drafting step (R18) | Templates were labelled as AI | Fixed ("قالب جاهز") |
| Measured figures | Recall and false alarms with sample sizes, blind (R22, IC9) | 100% on the tuning set | Reporting fixed; blind set open |
| Numbers not backed by a test | — | 100% recall, sub-800ms, <1.5/2 KB, <60 s, 90%+, 2.5 s, "expert-verified", "WHO/IOM", Groq | Fixed everywhere, including the PPTX |
| Verified contacts | Named verifier, or the fallback statement (R20) | REPORT §8 said "verified humanitarian contacts" | Fixed |
| Cut order | Core never cut; record and trust views if time | Core, record and trust views all built in the mobile app; the web page has neither the record nor the trust views | OK (mobile is the full product) |
| App name | جِسر / Jisr (Bridge Note) | Consistent; the logo mark shows unvowelled "جسر" | OK (visual design, left as is) |
| Tech stack | — | Docs: Expo 51 / RN 0.74; `package.json`: Expo 57, no RN | Open (P1) |
| Team plans | — | `docs/team_plan/` still prescribes Next.js / Vercel / localStorage | Open (label as the original plan, P4) |
| REPORT progress log | — | Claimed a deployed staging backend, Groq failover, latency benchmarks, `sanitizer.py` | Corrected to what the repo shows; **team to confirm** (P4) |

---

## 5. Fixes applied

After each fix: `node safety/selftest.mjs` passed (450/450) and the backend tests passed. The final run of every check is below.

| Fix | Requirement | Main files |
|---|---|---|
| 1. Server-side Guardian gate in `/api/generate-drafts`; model down returns templates; new schema fields `riskDetected` and `riskMethod` | C6, R9, §10.4 | `backend/app/services/risk_check.py`, `drafting.py`, `schemas.py` |
| 2. Identifier removal rewritten the same way in Python and TypeScript: names, @handles, Arabic-Indic digits; family words kept; shared case file | C5, R16 | `identifier_removal.py`, `src/services/piiSanitizer.ts`, `safety/identifiers.json`, `tests/fixtures/pii-cases.json` |
| 3. App: live API by default with a dot-notation override, longer timeouts, scrubbed text on all endpoints, `/check-risk` before drafting plus the server risk flag | C2, C5, C6 | `src/services/api.ts`, `src/types/index.ts`, `App.tsx` |
| 4. App: privacy preview before sending; private record opt-in with 1/7/30-day expiry, chips only, summary, erase on disable; `allowBackup: false` | R16, R5 | `src/screens/CaptureScreen.tsx`, `src/services/storage.ts`, `src/services/historyLogic.ts`, `app.json` |
| 5. App: continue after the support card (templates only); sharing never blocked; crisis check waits for a pause in typing | R10, C6 | `App.tsx`, `src/components/SupportCardModal.tsx` |
| 6. Honest UI: neutral comparison, honest faithfulness and privacy wording, "قالب جاهز" label, five stated limits | R18, R23 | `BaselineComparison.tsx`, `FaithfulnessView.tsx`, `OutboundPreview.tsx`, `src/i18n/ar.json`, `safety/stated-limits.json` |
| 7. Web page: on-device crisis check, backend drafting with template fallback, privacy preview, continue-after-card, stated limits | C1 | `src/app/page.js`, `src/services/crisisCheck.ts` |
| 8. Evaluation prints recall over all labelled items (10/11) | R22 | `safety/evaluate.mjs` |
| 9. Tests: shipped-code tests for the scrubber, API client, private record and honest UI; backend gate tests; `npm test` runs all; CI runs pytest | — | `tests/*.mjs`, `backend/tests/*`, `package.json`, `.github/workflows/build-apk.yml` |
| 10. Docs and pitch: every claim in section 4 corrected; product definition added; evidence report filled with measured numbers | — | README, REPORT, CITATIONS, `docs/*`, `safety/evidence.md`, `builds/README.md`, `backend/README.md` |
| 11. Merged with Muatz's live-API commit (`d876b22`): kept the live default URL, the 60 s timeout and the web page's "this can take about a minute" loading screen; added identifier removal to its requests; restored `/check-risk` before drafting, because the live backend does not have the server-side gate yet | C1, C2, C5, C6 | `src/services/api.ts`, `src/app/page.js`, `App.tsx`, `README.md` |

**Final test results**

| Check | Result |
|---|---|
| `node safety/selftest.mjs` | 450 passed, 0 failed |
| `node safety/evaluate.mjs safety/dev-set.json` | Main items 10/10, 0/11 false alarms; **all labelled items 10/11 = 90.9% (95% CI 62.3–98.4%)**, 0/14 false alarms |
| `npm test` | Exit 0; all 8 app suites pass (trust, parity 756 checks, scrubber 18 shared cases, API client, private record, offline templates, integration, honest UI) |
| Backend `pytest` (with `REQUIRE_SAFETY_DIR=1`) | **89 passed** (was 41) |
| TypeScript check of `App.tsx` + `src/` | Clean |
| `src/app/page.js` syntax | Clean |

**Not verified in this review:**
- the app was not run on a device or emulator;
- `next build` was not run (`next` is not installed in this checkout);
- the PPTX was edited in place (text only) but not rendered. Check slide 4 for overflow.

**Files changed** (all uncommitted):
- Modified:
  - `.github/workflows/build-apk.yml`, `App.tsx`, `app.json`, `package.json`
  - `backend/README.md`, `backend/app/schemas.py`, `backend/app/services/{drafting,identifier_removal,risk_check}.py`, `backend/tests/{test_drafting,test_identifier_removal,test_schemas}.py`
  - `builds/README.md`, `CITATIONS.md`, `README.md`, `REPORT.md`
  - `docs/{COMMITTEE_QA.md,PITCH_DECK.md,PITCH_DECK.html,PITCH_DECK.pptx,README.md,master_implementation_plan.md}`, `docs/scripts/generate_pitch_deck.py`
  - `safety/{evaluate.mjs,evidence.md,stated-limits.json}`
  - `src/app/page.js`, `src/components/{BaselineComparison,FaithfulnessView,OutboundPreview,SupportCardModal}.tsx`, `src/i18n/ar.json`, `src/screens/CaptureScreen.tsx`, `src/services/{api,crisisCheck,piiSanitizer,storage}.ts`, `src/types/index.ts`
  - `tests/test-pii-sanitizer.mjs`
- Added:
  - `docs/Bridge_Note_Product_Definition.pdf`, `docs/REVIEW_REPORT.md`
  - `safety/identifiers.json`, `src/services/historyLogic.ts`
  - `tests/fixtures/pii-cases.json`, `tests/test-api-client.mjs`, `tests/test-private-record.mjs`, `tests/verify-honest-ui.mjs`
- Not touched: `.env` files, keys, icons, colours, layout styles (one spacing rule each for the new controls).

---

## 6. Remaining changes, most urgent first

Owners: **P1** Rayan (frontend), **P2** Muatz (backend), **P3** Shima (safety), **P4** Mohamed Thabet (docs, lead).

### Before the presentation today

| # | What | Where | Owner |
|---|---|---|---|
| 1 | Decide whether to commit and push these fixes after the deadline; ask the coordinator first. If not pushed, correct the claims out loud using `COMMITTEE_QA.md` Q8–Q11 | — | P4 |
| 2 | Redeploy the live backend with this branch's backend changes (server-side gate, new identifier removal) and confirm it uses a **paid-tier** Gemini key. Until then the clients still run `/check-risk` first, so safety does not depend on the redeploy | `backend/`, Render | P2 |
| 3 | Live-demo setup: web page (`npm run dev`, calls the live API) or emulator debug build (`npx expo run:android`); call the API once beforehand so the free server is awake; record a backup video | README "Usage" | P1, P4 |
| 4 | Native Arabic review of the new strings: record controls, trust views, disclosure, "كمّل رسالتي…", stated limits | `src/i18n/ar.json`, `safety/stated-limits.json` | P4 |
| 5 | Open `docs/PITCH_DECK.pptx` and check slide 4 (the recall line is longer now) | `docs/PITCH_DECK.pptx` | P4 |
| 6 | Turn the private record on before the demo if you want to show the pattern invitation (it is off by default now) | App capture screen | P1 |

### Next (days)

| # | What | Where | Owner |
|---|---|---|---|
| 7 | Repair dependencies: add `react-native` and align versions (`npx expo install --fix`, or return to the SDK 51 set). Prove `npm ci && npx expo start` and `npm run dev` from a clean clone | `package.json`, `package-lock.json` | P1 |
| 8 | Rebuild the APK from the current source (it calls the live API by default), ARM-only; update size and SHA-256 | `builds/` | P1 |
| 9 | Blind test set (30–50 items by someone who has not seen the list); run phrase-only and combined; fill `safety/evidence.md` §3b | `safety/test-set.json` | P3, P2 |
| 10 | Review the 8 missed spot-check phrasings and add the good ones to the list | `safety/crisis-phrases.json` | P3 |
| 11 | Blind AI-vs-template rating with 2–3 native raters; add the result to REPORT §6.3 | REPORT | P4 |
| 12 | Show the minors position in the app (one line on the capture screen or support card) | `ar.json`, `CaptureScreen.tsx` | P1, P4 |
| 13 | Try to verify one support line; fill `contact-verification.md` either way | `safety/` | P3 |
| 14 | Decide about the published personal email | `README.md:31`, `REPORT.md:301` | P4 |
| 15 | Confirm or correct the REPORT §11 progress-log edits | `REPORT.md` §11 | P4 |
| 16 | Add any other tools used (image source for the intro art, other AI assistants) | `CITATIONS.md` §5 | P4 |

### Before real users

| # | What | Where | Owner |
|---|---|---|---|
| 17 | Rate limiting; restrict `CORS_ORIGINS`; send the key in the `x-goog-api-key` header | `backend/app/` | P2 |
| 18 | Block unused Android permissions | `app.json` (`android.blockedPermissions`) | P1 |
| 19 | Label `docs/team_plan/` as the original plan | `docs/team_plan/README.md` | P4 |
