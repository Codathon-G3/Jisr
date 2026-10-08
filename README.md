# Jisr (جِسر) — AI-Assisted Writing Companion

> **AI-Assisted Writing Companion for Young People in Libya**  
> *Developed for the Ai4LY National Codathon 2026 (Libya Artificial Intelligence Forum)*  
> **Team**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima  
> **Submission Date**: October 7, 2026  
> **Active Branch**: `main`

[![Live Web Showcase](https://img.shields.io/badge/Web%20Showcase-Next.js%2016-000000?logo=next.js&style=for-the-badge)](#showcase-1-web-showcase-nextjs-16--instant-browser-evaluation)
[![Android APK](https://img.shields.io/badge/Android%20APK-Download%20v1.0.0-brightgreen?logo=android&style=for-the-badge)](https://github.com/Codathon-G3/Jisr/raw/main/builds/jisr-v1.0.0.apk)
[![Pitch Deck](https://img.shields.io/badge/Presentation-16%3A9%20Pitch%20Deck-purple?style=for-the-badge)](submission/PITCH_DECK.pptx)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-Prototype%20Walkthrough-red?logo=youtube&style=for-the-badge)](submission/jisr-flow-demo.mp4)
[![Project Overview](https://img.shields.io/badge/Project%20Overview-PDF%20Dossier-orange?logo=adobe-acrobat-reader&style=for-the-badge)](submission/Jisr_Full_Project_Overview.pdf)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn-009688?logo=fastapi&style=for-the-badge)](backend/)
[![Safety Tests](https://img.shields.io/badge/Safety%20Tests-npm%20test%20passing%20%7C%20Recall%2010%2F11%20(dev%20set)-success?style=for-the-badge)](#automated-verification-suite-npm-test)
[![Compliance](https://img.shields.io/badge/Ai4LY%202026-100%25%20Compliant-blue?style=for-the-badge)](submission/SUBMISSION_CHECKLIST.md)

---

## Ai4LY National Codathon 2026 — Official Submission Portal

This repository serves as the official submission for the **Ai4LY National Codathon 2026** (Libya Artificial Intelligence Forum), fulfilling all mandated deliverables prior to the October 7, 2026, 11:50 PM deadline:

### Official Submission Deliverables Matrix

| Codathon Deliverable | Specification Scope | In-Repository Artifact / Location | Evaluation Status |
|---|---|---|:---:|
| **Scope A: Source Code & App** | Complete working application code across permitted modern frameworks and APIs | • **Web Showcase**: [`src/app/`](src/app/) (Next.js 16 interactive showcase)<br>• **Mobile Client**: [`App.tsx`](App.tsx) & [`src/`](src/) (React Native 0.74 / Expo SDK 51)<br>• **Stateless AI Backend**: [`backend/`](backend/) (FastAPI / Google Gemini `gemini-flash-lite-latest`)<br>• **Live Cloud Backend API**: [`https://jisr-api.onrender.com`](https://jisr-api.onrender.com) (Interactive docs: [/docs](https://jisr-api.onrender.com/docs)) | **VERIFIED** |
| **Demo Artifact: Android APK** | Standalone installable mobile prototype ready for instant sideloading | • **Standalone APK**: [`builds/jisr-v1.0.0.apk`](builds/jisr-v1.0.0.apk) (63.1 MB, SHA-256 verified)<br>• **Direct Raw Download**: [jisr-v1.0.0.apk](https://github.com/Codathon-G3/Jisr/raw/main/builds/jisr-v1.0.0.apk)<br>• **Verification & Install Guide**: [`builds/README.md`](builds/README.md) | **VERIFIED** |
| **Scope B: Documentation** | Root architectural, operational, setup and usage guide | • **Master Guide**: [`README.md`](README.md) (This landing page)<br>• **Submission Hub**: [`submission/README.md`](submission/README.md)<br>• **Documentation Hub**: [`docs/README.md`](docs/README.md) | **VERIFIED** |
| **Scope C: Technical Report** | In-depth Markdown report detailing problem alignment, architecture, citations & evaluation | • **Technical Report**: [`REPORT.md`](REPORT.md) (35 KB comprehensive report with Wilson 95% CIs and 12-hour progress log) | **VERIFIED** |
| **Scope D: Presentation & Deck** | 5-minute presentation file / pitch deck with problem, solution & impact | • **PowerPoint Deck**: [`submission/PITCH_DECK.pptx`](submission/PITCH_DECK.pptx) (16:9 widescreen, Arabic RTL)<br>• **Interactive HTML Deck**: [`submission/PITCH_DECK.html`](submission/PITCH_DECK.html)<br>• **Speaker Script**: [`submission/PITCH_DECK.md`](submission/PITCH_DECK.md)<br>• **Full Project Overview PDF**: [`submission/Jisr_Full_Project_Overview.pdf`](submission/Jisr_Full_Project_Overview.pdf)<br>• **Committee Defense Playbook**: [`submission/COMMITTEE_QA.md`](submission/COMMITTEE_QA.md) | **VERIFIED** |
| **Scope D: Demo Video** | Demonstration video demonstrating working prototype and AI flows in real time | • **Prototype Walkthrough Video**: [`submission/jisr-flow-demo.mp4`](submission/jisr-flow-demo.mp4) (1.19 MB recording of full mobile & Guardian flow) | **VERIFIED** |
| **Section 4: Tool Citations** | Explicit disclosure and academic attribution of all models, APIs, and libraries | • **Attribution Register**: [`CITATIONS.md`](CITATIONS.md) (Gemini, Expo, React Native, Next.js, FastAPI, Uvicorn, Pydantic) | **VERIFIED** |
| **Official Audit Checklist** | Item-by-item verification against official Codathon requirements | • **Compliance Audit**: [`submission/SUBMISSION_CHECKLIST.md`](submission/SUBMISSION_CHECKLIST.md) (100% compliant across all scopes) | **VERIFIED** |
| **Safety & Empirical Quality** | Measured recall benchmarks, unit tests & cross-engine parity | • **Master Test Command**: `npm test` (selftest 450 passed, 0 failed, plus 9 app/privacy/parity suites) and `npm run test:backend` (89 passed)<br>• **Crisis Recall (phrase layer)**: **10/11 = 90.9%** (95% CI 62.3%–98.4%) on the 25-item dev set, which was also used to tune the list. A blind test set and the model layer's recall are not measured yet.<br>• **Crisis Check Parity**: **756 checks passed** | **VERIFIED** |
| **Administrative Attribution** | Designated Team Lead and contestant emails | • **Team Leader**: Mohamed Thabet (`abdwadood2000@gmail.com`)<br>• **Team Members**: Rayan (Mobile), Muatz (Backend), Shima (Safety) | **VERIFIED** |

---

### Jury Fast-Track Evaluation Pathways (60-Second Quickstart)

Evaluators can choose their preferred evaluation method:

1. **Pathway 1: Instant Browser Evaluation (Zero Install)**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to interact with the full Arabic RTL interface, stress chips, Guardian crisis screening, the privacy preview and the 3 tone drafts (from the live API).

2. **Pathway 2: Physical Android Device Sideload (Mobile Binary)**
   * Transfer [`builds/jisr-v1.0.0.apk`](builds/jisr-v1.0.0.apk) (or download [jisr-v1.0.0.apk](https://github.com/Codathon-G3/Jisr/raw/main/builds/jisr-v1.0.0.apk)) to an Android phone (API 23+ / Android 6.0+).
   * Install and launch `com.ai4ly.jisr` to experience native on-device share sheet export to WhatsApp / Messenger. This build predates the live API, so it drafts from the offline templates (see the APK note below).

3. **Pathway 3: Automated Verification Harness (Single Command)**
   ```bash
   npm test
   ```
   Runs the 450 safety data checks, the crisis evaluation (phrase-layer recall 10/11 on the dev set, with 95% CIs), the 756 cross-engine parity checks and the app, privacy and API-client suites. `npm run test:backend` runs the backend tests.

4. **Pathway 4: Presentation & Video Walkthrough**
   * Download and view the 5-slide deck: [`submission/PITCH_DECK.pptx`](submission/PITCH_DECK.pptx)
   * Watch the working prototype demo: [`submission/jisr-flow-demo.mp4`](submission/jisr-flow-demo.mp4)
   * Read the comprehensive dossier: [`submission/Jisr_Full_Project_Overview.pdf`](submission/Jisr_Full_Project_Overview.pdf)

5. **Pathway 5: Live Cloud Microservice & Interactive Swagger Docs**
   * Live backend URL: [https://jisr-api.onrender.com](https://jisr-api.onrender.com)
   * Interactive API documentation: [https://jisr-api.onrender.com/docs](https://jisr-api.onrender.com/docs)


---

## Problem & Solution in 30 Seconds

The hardest step in reaching out during times of emotional distress is often writing the very first sentence. For young people in Libya facing everyday pressures (exams, family expectations, employment, relationships, sleep, finances), cultural stigma and emotional overwhelm frequently lead to silence.

**Jisr** (Bridge Note) is a privacy-first, Arabic-native writing companion engineered to break this silence:
* It takes minimal user inputs (one-tap stress chips and an optional 1–3 lines of messy thoughts).
* It immediately checks for acute crisis indicators using a high-recall Guardian Layer before drafting.
* It produces three tone-adapted, editable message drafts (**Gentle**, **Direct**, **Formal**) tailored to a real person in the user's personal circle (friend, sibling, parent, trusted adult, or counsellor).
* It hands the message directly to WhatsApp, Messenger, or SMS via the native system share sheet, and immediately encourages the user to close the app.

> **Core Philosophy**: Jisr is **not a chatbot**, **not a virtual therapist**, and **never holds open-ended conversations**. Its sole purpose is to connect a human to a human early and exit.

---

## Project Architecture & Data Flow

### System Interaction Diagram

```text
                                [ USER INTERACTION ]
                                          │
                 Taps Situation Chips (1-7) & Writes 1-3 Lines (Optional)
                                          │
                                          ▼
                         [ CLIENT-SIDE PRE-PROCESSING ]
               ┌──────────────────────────┴──────────────────────────┐
               │                                                     │
               ▼                                                     ▼
     Local PII Sanitizer                               Zero-Latency Crisis Screener
 (Replaces phone numbers, emails,                 (Matches 60 Libyan dialect markers
  @handles & names; shown to the user              across 360+ orthographic variants)
  in the Outbound Preview before sending)
               │                                                     │
               ▼                                                     ▼
    Sanitized Text & Chips                            [ Acute Crisis Detected? ]
               │                                             ├── YES ──► Halts drafting & opens static
               │                                             │           SupportCardModal (Ethical ER Notice)
               │                                             │
               │                                             └── NO ──► Continues to Drafting Engine
               │
               ▼
   [ DRAFTING ENGINE (ONLINE OR OFFLINE) ]
               │
               ├── ONLINE PATH (Network Available, Timeout: 60 s)
               │      │
               │      ▼
               │   FastAPI Service (uvicorn app.main:app)
               │      ├── POST /api/generate-drafts
               │      │      ├── 1. Guardian gate: phrase list + Gemini risk check
               │      │      │      (risk → no drafts, support card; model down → templates)
               │      │      ├── 2. Gemini drafting (gemini-flash-lite-latest)
               │      │      └── 3. Deterministic Output Filter (55 terms; retry once, then template)
               │      ├── POST /api/check-risk (called by the clients first, scrubbed text)
               │      └── POST /api/faithfulness (phrase alignment, checked against both texts)
               │
               └── OFFLINE PATH (Network Down / Electrical Blackout / Timeout Exceeded)
                      │
                      ▼
                   Local Deterministic Engine (safety/plain-templates.json)
                   (35 Pre-vetted topic & recipient template permutations)
                                          │
                                          ▼
                             [ 3 TONE-ADAPTED DRAFTS ]
                       (Gentle: لطيف | Direct: مباشر | Formal: رسمي)
                                          │
                                          ▼
                         [ LAYER 4: TRUST & USER CONTROL ]
               ┌──────────────────────────┼──────────────────────────┐
               │                          │                          │
               ▼                          ▼                          ▼
     Baseline Comparison          Faithfulness View           Outbound Preview
   (AI Draft vs. Static)       (Attribution to user input)   (Inspects scrubbed PII)
                                          │
                                          ▼
                               In-Place Text Editing
                                          │
                                          ▼
                               Native OS Share Sheet
                      (Direct hand-off to WhatsApp / Messenger)
                                          │
                                          ▼
                         [ ENCOURAGED-OUT EXIT SCREEN ]
                       (Session ends with zero retained data)
```

### Component Breakdown & Responsibilities
1. **Frontend Showcases**:
   * **Web Showcase (`src/app/`)**: Built on Next.js 16 with customized RTL Arabic typography and instant browser accessibility.
   * **Mobile Client (`App.tsx`, `src/`)**: Built on React Native 0.74 / Expo SDK 51, providing native mobile sharing (`Share.share()`), sandboxed on-device recurrence memory (`AsyncStorage`), and APK distribution.
2. **AI Microservice (`backend/app/`)**:
   * Stateless FastAPI backend with asynchronous endpoints (`/api/check-risk`, `/api/generate-drafts`, `/api/faithfulness`).
   * Powered by Google Gemini (`gemini-flash-lite-latest`, set with `GEMINI_MODEL`). There is no second model provider: if Gemini is unreachable, the backend returns the plain templates instead of drafting unchecked text.
3. **Guardian Safety Engine (`safety/`)**:
   * Pre-generation lexicon of 60 dialect crisis phrases (tested across 360+ spelling variants) with 7 whitelisted colloquial idioms.
   * Deterministic post-generation blacklist intercepting 55 diagnostic and pharmaceutical terms.
   * Static emergency Support Card with unalterable emergency room guidance.

---

## Clustered Repository Architecture

The repository is organized into **5 clean functional clusters**, separating client interfaces, AI microservices, safety datasets, distribution artifacts, and verification suites:

```text
Jisr/
│
├── 1. CLIENT SHOWCASES (Web & Mobile Frontends)
│   ├── App.tsx                        # Root React Native / Expo mobile application
│   ├── src/app/                       # Next.js 16 Web Showcase (instant browser evaluation)
│   ├── src/screens/CaptureScreen.tsx  # RTL chips, recipient picker & text input screen
│   ├── src/components/                # Trust components (Baseline, Faithfulness, Outbound, Support Modal)
│   ├── src/services/                  # Crisis screening, PII scrubbing, storage & API client
│   └── src/i18n/ar.json               # Complete Libyan Arabic UI dictionary & chip labels
│
├── 2. AI CORE & MICROSERVICE (Stateless FastAPI Backend)
│   ├── backend/app/main.py            # FastAPI service entry point & CORS configuration
│   ├── backend/app/routers/           # Endpoints (/api/check-risk, /api/generate-drafts, /api/faithfulness)
│   ├── backend/app/services/          # Gemini client, Guardian gate, identifier removal, output check
│   └── backend/prompts/               # System prompt definitions for 3-tone drafting and grounding
│
├── 3. GUARDIAN SAFETY ENGINE (Linguistic Datasets & Safety Gates)
│   ├── safety/crisis-phrases.json     # 60 Libyan dialect distress phrases (verified on 360+ spellings)
│   ├── safety/forbidden-terms.json    # 55 blocked clinical, diagnostic, and medication terms
│   ├── safety/plain-templates.json    # 35 deterministic offline fallback & baseline templates
│   ├── safety/support-card.json       # Static emergency support card with approved fallback message
│   ├── safety/identifiers.json        # Name lists shared by the app's and the backend's identifier removal
│   ├── safety/stated-limits.json      # What Jisr is not (shown on the app and the web page)
│   ├── safety/dev-set.json            # 25-item dev set (also used to tune the phrase list)
│   └── safety/lib/                    # Text normalization and zero-latency matching algorithms
│
├── 4. OFFICIAL SUBMISSION & COMPETITION ARTIFACTS
│   ├── submission/                    # Consolidated competition deliverables package
│   │   ├── README.md                  # Evaluator submission portal & fast-track pathways
│   │   ├── SUBMISSION_CHECKLIST.md    # Official 1-to-1 compliance audit against Codathon requirements
│   │   ├── PITCH_DECK.pptx            # Standalone 16:9 widescreen PowerPoint presentation deck
│   │   ├── jisr-flow-demo.mp4         # Working prototype walkthrough video (1.19 MB)
│   │   ├── Jisr_Full_Project_Overview.pdf # Comprehensive formatted project overview dossier (319 KB)
│   │   ├── PITCH_DECK.html & .md      # Interactive web deck & 5-minute timed speaker script
│   │   └── COMMITTEE_QA.md            # 7 prepared technical defense responses for evaluation jury
│   ├── builds/jisr-v1.0.0.apk         # Sideloadable standalone Android APK (63.1 MB, SHA-256 verified)
│   ├── builds/README.md               # APK package specs, architecture, signing & sideloading guide
│   ├── REPORT.md                      # Comprehensive 35 KB Markdown Technical Report (Scope C)
│   ├── CITATIONS.md                   # Complete third-party tools, models & frameworks citations (§4)
│   └── docs/                          # Extended engineering documentation, team plan & pitch scripts
│
└── 5. QA & AUTOMATED VERIFICATION SUITE
    ├── safety/selftest.mjs            # 450 generated checks over the safety data files
    ├── safety/evaluate.mjs            # Crisis recall & false-alarm rates with Wilson 95% CIs
    ├── tests/verify-crisis-parity.mjs # 756 parity checks between mobile TypeScript & Node Guardian engine
    ├── tests/verify-trust-components.mjs # Validates trust views & Arabic localization dictionary
    ├── tests/test-offline-fallback.mjs# Validates all 35 offline fallback templates & permutations
    ├── tests/test-pii-sanitizer.mjs   # Runs the shipped sanitizer on tests/fixtures/pii-cases.json
    ├── tests/test-api-client.mjs      # Only identifier-free text leaves the app; risk flag; offline fallback
    ├── tests/test-private-record.mjs  # Record off by default, chips only, expiry, erase on disable
    ├── tests/verify-honest-ui.mjs     # Stated limits, continue-after-card, honest trust wording
    └── backend/tests/                 # 89 pytest tests (same identifier cases as the app)
```

---

## Operational Requirements & System Prerequisites

### Runtime & Dependency Versions

| Component | Technology | Minimum Version | Tested Version |
|---|---|---|---|
| **Node.js Runtime** | Node.js (V8) | `>= 18.0.0` | `v20.x` / `v22.x` |
| **Package Manager** | npm | `>= 9.0.0` | `v10.8.x` |
| **Web Framework** | Next.js | `^16.4.0` | `16.4.0` |
| **Mobile Runtime** | React Native / Expo | Expo SDK 51 | React Native `0.74.5` |
| **Target Mobile OS** | Android | API 23 (Android 6.0+) | API 34 (Android 14) |
| **Backend Runtime** | Python (CPython) | `>= 3.10` | `3.10.x` / `3.13.x` |
| **ASGI Web Server** | Uvicorn / FastAPI | FastAPI `>= 0.115` | Uvicorn `0.32` |

### Environment Variables & API Keys

Environment variables are configured in `backend/.env` (template provided in `backend/.env.example`):

| Variable | Description | Required? | Default Value |
|---|---|:---:|---|
| `GEMINI_API_KEY` | Google AI Studio API key for the Gemini API. Use a paid-tier key for real users: on the free tier Google may use prompts to improve its products | Optional* | `""` (Empty string) |
| `GEMINI_MODEL` | Foundation model identifier | Optional | `gemini-flash-lite-latest` |
| `LLM_TIMEOUT_SECONDS` | Gateway timeout before falling back | Optional | `10` |
| `CORS_ORIGINS` | Permitted origins for frontend CORS | Optional | `*` |
| `MODEL_CALLS_PER_MINUTE` | Process-wide cap on model calls per minute (`0` = off). When reached, the risk check fails closed and drafting uses templates | Optional | `60` |
| `MODEL_CALLS_PER_DAY` | Process-wide cap on model calls per 24 hours (`0` = off) | Optional | `2000` |

Both clients call the live API (`https://jisr-api.onrender.com`) by default. To point them at another backend (for example a local one), set one variable each in your shell or a root `.env` file before starting or building:

| Variable | Used by | Example | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Web Showcase (`src/app/`) | `http://localhost:8000` | Default: the live API |
| `EXPO_PUBLIC_API_URL` | Mobile app (`App.tsx`) | `http://localhost:8000` | Default: the live API. Baked in at build time; a release APK needs an `https` URL (Android blocks plain `http` in release builds) |

> **Works without a key, but without AI**: If `GEMINI_API_KEY` is not set or the backend is unreachable, both clients fall back to the plain templates (`safety/plain-templates.json`) and say so on screen ("قالب جاهز"). The on-device crisis check, the support card and sharing keep working. The four AI functions (structuring, tone adaptation, faithfulness, model risk check) need the backend and a key.

---

## Step-by-Step Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Codathon-G3/Jisr.git
cd Jisr
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. (Optional) Setup Backend Python Environment
```bash
cd backend
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\activate
# On Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
cd ..
```

---

## Usage Instructions & Workflows

### Showcase 1: Web Showcase (Next.js 16 — Instant Browser Evaluation)

The Web Showcase provides the fastest way to evaluate Jisr's full user experience directly in your web browser:

```bash
# From repository root:
npm run dev
```

* **Access**: Open [http://localhost:3000](http://localhost:3000) in any modern browser.
* **Evaluation Workflow**:
  1. Select 1 or more situation chips (`الامتحانات`, `العائلة`, etc.).
  2. Choose a recipient (`صديق`, `أخ/أخت`, etc.).
  3. Optionally type 1–2 lines of stressful thoughts.
  4. Before anything is sent, check the preview under your text: it shows exactly what will leave the device.
  5. Notice the crisis screening and the 3 tone drafts (labelled "قالب جاهز" if the backend is not running).

To create a production-optimized build:
```bash
npm run build && npm run start
```

---

### Showcase 2: Mobile Showcase (React Native / Expo & Android APK)

#### Option A: Direct APK Sideloading (Fastest Mobile Evaluation)
Evaluators can install and run the standalone, pre-compiled Android binary without setting up mobile build environments:

1. **Locate APK**:
   * Release download: [jisr-v1.0.0.apk](https://github.com/Codathon-G3/Jisr/releases/download/v1.0.0/jisr-v1.0.0.apk)
   * Direct GitHub raw download: [jisr-v1.0.0.apk](https://github.com/Codathon-G3/Jisr/raw/main/builds/jisr-v1.0.0.apk)
   * Local file path: [`builds/jisr-v1.0.0.apk`](builds/jisr-v1.0.0.apk) (63,074,501 bytes / 63.1 MB)
   * SHA-256 Checksum: `e2da042e2b8a85da55517fc1ea9552c879e3950b1df7bb152c3c66a0628dbe5b`
2. **Verify Integrity**:
   ```powershell
   # Windows (PowerShell)
   Get-FileHash builds/jisr-v1.0.0.apk -Algorithm SHA256
   ```
   ```bash
   # Linux / macOS
   sha256sum builds/jisr-v1.0.0.apk
   ```
3. **Install on Physical Android Device**:
   * Transfer `jisr-v1.0.0.apk` to your Android device via USB, direct download, or cloud drive.
   * Open the file in **Downloads**, allow *"Install unknown apps"* if prompted, and tap **Install**.
   * Package ID: `com.ai4ly.jisr` (targets Android API 23+ / Android 6.0+).
4. **Install via Android Debug Bridge (ADB)**:
   ```bash
   adb install -r builds/jisr-v1.0.0.apk
   adb shell am start -n com.ai4ly.jisr/.MainActivity
   ```
*(Detailed APK specifications, signing information, and architecture notes are documented in [`builds/README.md`](builds/README.md).)*

> **Note**: `builds/jisr-v1.0.0.apk` was built before the backend was deployed, so it has no backend address. It runs the on-device crisis check and the plain templates only. A rebuild from the current source calls the live API by default and gets AI drafts on a phone.

#### Option B: Running Mobile App from Source
```bash
# Optional: use a local backend instead of the live API
export EXPO_PUBLIC_API_URL=http://localhost:8000      # PowerShell: $env:EXPO_PUBLIC_API_URL="http://localhost:8000"

# Option 1: Mobile preview via Expo Go (scan terminal QR code)
npx expo start

# Option 2: Mobile Web preview (React Native Web)
npx expo start --web
```
Expo Go only runs projects on the SDK version it supports. If it reports an incompatible SDK, use the APK, an emulator (`npx expo run:android`), or the web preview.

---

### Running the Optional Backend Service (FastAPI)

```bash
cd backend
# With virtual environment activated:
uvicorn app.main:app --reload --port 8000
```
* **Live API**: [https://jisr-api.onrender.com](https://jisr-api.onrender.com) — interactive docs at [/docs](https://jisr-api.onrender.com/docs). The web showcase and the phone client call this address. A local server on port 8000 is only for backend development. The free instance sleeps when idle, so the first request can take about a minute.
* **Backend tests**: `npm run test:backend` (or `cd backend && python -m pytest -q`).

---

## Automated Verification Suite (`npm test`)

The complete verification harness executes deterministic unit tests, benchmark recall evaluations, trust component integrity checks, and crisis parity validations in a single command:

```bash
npm test
```

### What `npm test` Executes:
1. **Guardian Layer Data Checks (`safety/selftest.mjs`)**:
   * Runs **450 generated checks** (one per phrase, term and template) with **0 failures**.
   * Validates regex normalization, phrase detection, boundary conditions, and output screening across 55 forbidden clinical terms.
2. **Crisis Recall on the Dev Set (`safety/evaluate.mjs safety/dev-set.json`)**:
   * Runs the phrase layer on the 25-item dev set. This set was also used to tune the phrase list, so these are not blind figures.
   * Main items: 10/10 crisis caught, 0/11 false alarms. **All labelled items, including the 4 marked ambiguous: recall 10/11 = 90.9% (95% CI 62.3%–98.4%)**, false alarms 0/14. The miss is item #22, *"الدنيا سوداء في عيني الفترة هادي"*.
   * The model layer is not included; run it with `RISK_API_URL=... node safety/evaluate.mjs <set>` once a blind set exists.
3. **Trust & Arabic Localization Verification (`tests/verify-trust-components.mjs`)**:
   * Validates `src/i18n/ar.json` structure and completeness.
   * Validates all 4 trust UI components: `BaselineComparison.tsx`, `FaithfulnessView.tsx`, `OutboundPreview.tsx`, and component barrel export.
4. **Mobile vs Backend Crisis Check Parity (`tests/verify-crisis-parity.mjs`)**:
   * Executes **756 cross-layer parity checks**.
   * Verifies all 60 crisis phrases caught on-device across 360 spelling variations.
   * Matches `safety/lib/crisis-check.mjs` on 385 inputs.
   * Verifies that 7 benign everyday idioms remain unflagged.
5. **Identifier Removal (`tests/test-pii-sanitizer.mjs`)**: runs the shipped `piiSanitizer.ts` on the 18 shared cases in `tests/fixtures/pii-cases.json`; the backend tests run the same file, so phone and server stay identical.
6. **API Client (`tests/test-api-client.mjs`)**: every request carries identifier-free text, a server risk flag returns no drafts, network errors fall back to templates.
7. **Private Record (`tests/test-private-record.mjs`)**: off by default, chips and time only, expiry, erase on disable.
8. **Honest UI (`tests/verify-honest-ui.mjs`)**: stated limits, continue-after-card, neutral trust-view wording, Android backup off.
9. Offline templates (`tests/test-offline-fallback.mjs`) and integration wiring (`tests/verify-m2-integration.mjs`).

```bash
npm run test:backend   # 89 FastAPI tests (Guardian gate, identifier removal, schemas, statelessness)
npm run test:all       # everything
```

---

## Core Safety Guardrails & Ethical Boundaries

* **Not a Doctor or Therapist**: Jisr does not diagnose, screen, score, or provide therapy.
* **No Automatic Actions**: Jisr never messages third parties or contacts emergency services automatically.
* **No Tracking**: No user profiling, no account required, no message logging.
* **Identifiers Removed, and Shown First**: phone numbers (Latin or Arabic-Indic digits), emails, @handles and names (after "اسمي" / "my name is", or from a list of common names) are replaced on-device. The user sees exactly what will leave the phone before anything is sent. Family words (بابا، أمي، خوي) are kept, because the drafts need them. A name outside the list can still slip through, so the preview is the user's final check.
* **Guardian Before Drafting, on the Server Too**: `/api/generate-drafts` runs the phrase list and the Gemini risk check before any drafting. On risk, no drafts are made and the support card is shown; the user may then continue with plain templates (their text is not sent to the model).
* **Private Record Off by Default**: the on-device memory of chip topics is off until the user turns it on. It keeps chips and time only, expires after 1, 7 or 30 days, is erased in one tap or when turned off, and is excluded from Android backup.
* **Persistent Human Route**: The *"تكلم مع حد توا"* button is unblocked and reachable on every screen.
* **Minors**: no account, no data kept, nobody contacted, and the user chooses who receives the note. We recommend that under-18s use Jisr with a trusted adult's knowledge.
* **Emergency Contact Ethics**: In active crisis, displaying unresponsive phone numbers introduces severe hazard. Jisr maintains `contacts: []` with an unalterable direct statement guiding users to a trusted person or the nearest emergency department.

---

## Team & Workstreams

| Member | Workstream | Primary Deliverables |
|---|---|---|
| **Mohamed Thabet** (Team Leader, Person 4) | Trust Views, Arabic Quality, Documentation & Presentation Lead | Arabic linguistic review, technical report (`REPORT.md`), pitch deck ([`submission/PITCH_DECK.pptx`](submission/PITCH_DECK.pptx)), committee defense ([`submission/COMMITTEE_QA.md`](submission/COMMITTEE_QA.md)), trust views (`BaselineComparison.tsx`, `FaithfulnessView.tsx`, `OutboundPreview.tsx`), citations & benchmarks. |
| **Rayan** (Person 1) | Mobile App & Interaction Engineer | React Native/Expo UI, 7 RTL stress chips, recipient selectors, persistent human route button, native share sheet, standalone Android APK packaging. |
| **Muatz** (Person 2) | AI Core & Backend Engineer | FastAPI service (`uvicorn app.main:app`), LLM system prompts (Google Gemini), risk check API router, PII stripping. |
| **Shima** (Person 3) | Safety, Guardian & Evidence Engineer | Crisis phrase list (60 phrases, 360+ Libyan dialect spellings), clinical blacklist (55 terms), output check, safety recall metrics (10/11 on the dev set). |

---

## Citations & Acknowledgments

All foundation models, open-source libraries, and frameworks utilized in this project are documented in [`CITATIONS.md`](CITATIONS.md) in strict compliance with Section 4 of the Ai4LY Codathon guidelines.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
