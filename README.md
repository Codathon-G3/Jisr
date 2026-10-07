# Jisr (جِسر) — AI-Assisted Writing Companion

> **AI-Assisted Writing Companion for Young People in Libya**  
> *Developed for the Ai4LY National Codathon 2026 (Libya Artificial Intelligence Forum)*  
> **Team**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima  
> **Submission Date**: October 7, 2026  
> **Active Branch**: `main`

[![Live Web Showcase](https://img.shields.io/badge/Web%20Showcase-Next.js%2016-000000?logo=next.js&style=for-the-badge)](#showcase-1-web-showcase-nextjs-16--instant-browser-evaluation)
[![Android APK](https://img.shields.io/badge/Android%20APK-Download%20v1.0.0-brightgreen?logo=android&style=for-the-badge)](https://github.com/Codathon-G3/Jisr/releases/download/v1.0.0/jisr-v1.0.0.apk)
[![Expo Go](https://img.shields.io/badge/Expo%20Go-Mobile%20Preview-blue?logo=expo&style=for-the-badge)](#showcase-2-mobile-showcase-react-native--expo--android-apk)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn-009688?logo=fastapi&style=for-the-badge)](backend/)
[![Safety Tests](https://img.shields.io/badge/Safety%20Tests-450%2F450%20Pass%20(100%25%20Recall)-success?style=for-the-badge)](#automated-verification-suite-npm-test)
[![Presentation: Pitch Deck](https://img.shields.io/badge/Presentation-16%3A9%20Pitch%20Deck-purple?style=for-the-badge)](docs/PITCH_DECK.pptx)

---

## Official Submission Deliverables & Requirements Matrix

This repository fulfills all required submission deliverables for the **Ai4LY National Codathon 2026** prior to the 11:50 PM deadline:

| Codathon Deliverable | Specification Scope | In-Repository Artifact / Location | Evaluation Status |
|---|---|---|:---:|
| **Scope A: Source Code & App** | Complete working application code across permitted modern frameworks and APIs | • **Web Showcase**: [`src/app/`](src/app/) (Next.js 16 interactive showcase)<br>• **Mobile Client**: [`App.tsx`](App.tsx) & [`src/`](src/) (React Native 0.74 / Expo SDK 51)<br>• **Stateless AI Backend**: [`backend/`](backend/) (FastAPI / Gemini 1.5 Flash / Groq Llama 3.3) | **VERIFIED** |
| **Demo Artifact: Android APK** | Standalone installable mobile prototype ready for instant sideloading | • **Standalone APK**: [`builds/jisr-v1.0.0.apk`](builds/jisr-v1.0.0.apk) (63.1 MB, SHA-256 verified)<br>• **Verification & Install Guide**: [`builds/README.md`](builds/README.md) | **VERIFIED** |
| **Scope B: Documentation** | Root architectural, operational, setup and usage guide | • **Master Guide**: [`README.md`](README.md) (This landing page)<br>• **Documentation Hub**: [`docs/README.md`](docs/README.md) | **VERIFIED** |
| **Scope C: Technical Report** | In-depth Markdown report detailing problem alignment, architecture, citations & evaluation | • **Technical Report**: [`REPORT.md`](REPORT.md) (35 KB comprehensive report with Wilson 95% CIs and 12-hour progress log) | **VERIFIED** |
| **Scope D: Presentation** | 5-minute presentation file / pitch deck with problem, solution & impact | • **PowerPoint Deck**: [`docs/PITCH_DECK.pptx`](docs/PITCH_DECK.pptx) (16:9 widescreen with Arabic RTL)<br>• **Interactive HTML Deck**: [`docs/PITCH_DECK.html`](docs/PITCH_DECK.html)<br>• **Speaker Script**: [`docs/PITCH_DECK.md`](docs/PITCH_DECK.md)<br>• **Committee Defense**: [`docs/COMMITTEE_QA.md`](docs/COMMITTEE_QA.md) | **VERIFIED** |
| **Section 4: Tool Citations** | Explicit disclosure and academic attribution of all models, APIs, and libraries | • **Attribution Register**: [`CITATIONS.md`](CITATIONS.md) (Gemini, Llama 3.3, Expo, FastAPI, Uvicorn) | **VERIFIED** |
| **Safety & Empirical Quality** | Measured recall benchmarks, unit tests & cross-engine parity | • **Master Test Command**: `npm test` (**450 passed, 0 failed**)<br>• **Crisis Recall**: **100.0%** (10/10 caught, 95% CI 72.2%–100.0%)<br>• **Crisis Check Parity**: **756 checks passed** | **VERIFIED** |
| **Administrative Attribution** | Designated Team Lead and contestant emails | • **Team Leader**: Mohamed Thabet (`abdwadood2000@gmail.com`)<br>• **Team Members**: Rayan, Muatz, Shima | **VERIFIED** |

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
 (Strips Libyan phone numbers +218,               (Matches 60 Libyan dialect markers
  emails & personal kinship names)                 across 360+ orthographic variants)
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
               ├── ONLINE PATH (Network Available, Timeout: 2.5s)
               │      │
               │      ▼
               │   FastAPI Service (uvicorn app.main:app)
               │      ├── POST /api/check-risk (Zero-shot classification)
               │      ├── POST /api/generate-drafts (Gemini 1.5 Flash / Groq Llama 3.3)
               │      └── Deterministic Output Filter (55 clinical/diagnostic terms blocked)
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
   * Powered by Google Gemini 1.5 Flash (sub-800ms latency, native Arabic tokenization) with Groq LPU (Llama 3.3 70B) high-speed fallback.
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
│   ├── backend/app/services/          # Multi-LLM client (Gemini 1.5 Flash, Groq Llama 3.3), PII sanitizer
│   └── backend/prompts/               # System prompt definitions for 3-tone drafting and grounding
│
├── 3. GUARDIAN SAFETY ENGINE (Linguistic Datasets & Safety Gates)
│   ├── safety/crisis-phrases.json     # 60 Libyan dialect distress phrases (verified on 360+ spellings)
│   ├── safety/forbidden-terms.json    # 55 blocked clinical, diagnostic, and medication terms
│   ├── safety/plain-templates.json    # 35 deterministic offline fallback & baseline templates
│   ├── safety/support-card.json       # Static emergency support card with approved fallback message
│   ├── safety/dev-set.json            # 25-item gold-standard benchmark for recall evaluation
│   └── safety/lib/                    # Text normalization and zero-latency matching algorithms
│
├── 4. DISTRIBUTION & COMPETITION ARTIFACTS
│   ├── builds/jisr-v1.0.0.apk         # Sideloadable standalone Android APK (63.1 MB, SHA-256 verified)
│   ├── builds/README.md               # APK package specs, architecture, signing & sideloading guide
│   ├── docs/PITCH_DECK.pptx           # Standalone 16:9 widescreen PowerPoint presentation deck
│   ├── docs/PITCH_DECK.md & .html     # 5-minute timed presentation script & interactive visual deck
│   ├── docs/COMMITTEE_QA.md           # 7 prepared technical defense responses for evaluation jury
│   ├── docs/scripts/                  # Pitch deck programmatic generation tools
│   ├── REPORT.md                      # Comprehensive 35 KB Markdown Technical Report
│   └── CITATIONS.md                   # Complete third-party tools, models & frameworks citations
│
└── 5. QA & AUTOMATED VERIFICATION SUITE
    ├── safety/selftest.mjs            # Deterministic Guardian unit test runner (450 passing tests)
    ├── safety/evaluate.mjs            # Crisis benchmark recall evaluation runner (100.0% recall)
    ├── tests/verify-crisis-parity.mjs # 756 parity checks between mobile TypeScript & Node Guardian engine
    ├── tests/verify-trust-components.mjs # Validates trust views & Arabic localization dictionary
    ├── tests/test-offline-fallback.mjs# Validates all 35 offline fallback templates & permutations
    └── tests/test-pii-sanitizer.mjs   # Validates Libyan phone (+218), email & kinship scrubbing
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
| `GEMINI_API_KEY` | Google AI Studio API key for Gemini 1.5 Flash | Optional* | `""` (Empty string) |
| `GEMINI_MODEL` | Foundation model identifier | Optional | `gemini-flash-lite-latest` |
| `LLM_TIMEOUT_SECONDS` | Gateway timeout before falling back | Optional | `10` |
| `CORS_ORIGINS` | Permitted origins for frontend CORS | Optional | `*` |

> **Zero-Key Offline Guarantee**: An API key is **NOT required** to evaluate the application. If `GEMINI_API_KEY` is not provided or the backend is offline, both the Web Showcase and Mobile Client automatically fall back to the local deterministic template engine (`safety/plain-templates.json`), maintaining 100% functionality with zero network or cloud dependency.

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
  4. Notice immediate crisis screening and 3-tone drafting.
  5. Inspect the live Baseline Comparison and Outbound PII preview.

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
   * File path: [`builds/jisr-v1.0.0.apk`](builds/jisr-v1.0.0.apk) (63,074,501 bytes / 63.1 MB)
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

#### Option B: Running Mobile App from Source (Expo SDK 51)
```bash
# Option 1: Mobile preview via Expo Go (scan terminal QR code)
npx expo start

# Option 2: Mobile Web preview (React Native Web)
npx expo start --web
```

---

### Running the Optional Backend Service (FastAPI)

```bash
cd backend
# With virtual environment activated:
uvicorn app.main:app --reload --port 8000
```
* **Live API**: [https://jisr-api.onrender.com](https://jisr-api.onrender.com) — interactive docs at [/docs](https://jisr-api.onrender.com/docs). The web showcase and the phone client call this address. A local server on port 8000 is only for backend development.

---

## Automated Verification Suite (`npm test`)

The complete verification harness executes deterministic unit tests, benchmark recall evaluations, trust component integrity checks, and crisis parity validations in a single command:

```bash
npm test
```

### What `npm test` Executes:
1. **Guardian Layer Unit Tests (`safety/selftest.mjs`)**:
   * Executes **450 safety test cases** with **0 failures**.
   * Validates regex normalization, phrase detection, boundary conditions, and output screening across 55 forbidden clinical terms.
2. **Synthetic Crisis Benchmark Recall (`safety/evaluate.mjs safety/dev-set.json`)**:
   * Evaluates gold-standard benchmark dev set (25 dialect test vectors across 60 crisis phrases).
   * Verifies **100.0% recall** (10/10 crisis cases caught, 95% CI 72.2%–100.0%).
   * Verifies **0.0% false-alarm rate** (0/11 non-crisis inputs flagged).
3. **Trust & Arabic Localization Verification (`tests/verify-trust-components.mjs`)**:
   * Validates `src/i18n/ar.json` structure and completeness.
   * Validates all 4 trust UI components: `BaselineComparison.tsx`, `FaithfulnessView.tsx`, `OutboundPreview.tsx`, and component barrel export.
4. **Mobile vs Backend Crisis Check Parity (`tests/verify-crisis-parity.mjs`)**:
   * Executes **756 cross-layer parity checks**.
   * Verifies all 60 crisis phrases caught on-device across 360 spelling variations.
   * Matches `safety/lib/crisis-check.mjs` on 385 inputs.
   * Verifies that 7 benign everyday idioms remain unflagged.

### Specialized Auxiliary Test Runners:
```bash
node tests/test-offline-fallback.mjs    # Validates all 35 offline fallback templates & permutations
node tests/test-pii-sanitizer.mjs       # Validates Libyan phone (+218), email & kinship scrubbing
node tests/verify-m2-integration.mjs    # Validates complete Milestone 2 mobile integration flow
```

---

## Core Safety Guardrails & Ethical Boundaries

* **Not a Doctor or Therapist**: Jisr does not diagnose, screen, score, or provide therapy.
* **No Automatic Actions**: Jisr never messages third parties or contacts emergency services automatically.
* **No Tracking**: No user profiling, no account required, no message logging.
* **Identifiers Removed**: Libyan phone numbers (+218, 091, 092), emails, and kinship mentions are scrubbed on-device before drafting.
* **Persistent Human Route**: The *"تكلم مع حد توا"* button is unblocked and reachable on every screen.
* **Emergency Contact Ethics**: In active crisis, displaying unresponsive phone numbers introduces severe hazard. Jisr maintains `contacts: []` with an unalterable direct statement guiding users to a trusted person or the nearest emergency department.

---

## Team & Workstreams

| Member | Workstream | Primary Deliverables |
|---|---|---|
| **Mohamed Thabet** (Team Leader, Person 4) | Trust Views, Arabic Quality, Documentation & Presentation Lead | Arabic linguistic review, technical report (`REPORT.md`), pitch deck (`docs/PITCH_DECK.pptx`), committee defense (`docs/COMMITTEE_QA.md`), trust views (`BaselineComparison.tsx`, `FaithfulnessView.tsx`, `OutboundPreview.tsx`), citations & benchmarks. |
| **Rayan** (Person 1) | Mobile App & Interaction Engineer | React Native/Expo UI, 7 RTL stress chips, recipient selectors, persistent human route button, native share sheet, standalone Android APK packaging. |
| **Muatz** (Person 2) | AI Core & Backend Engineer | FastAPI service (`uvicorn app.main:app`), LLM system prompts (Gemini 1.5 Flash & Groq Llama 3.3 70B), risk check API router, PII stripping. |
| **Shima** (Person 3) | Safety, Guardian & Evidence Engineer | Crisis phrase list (60 phrases, 360+ Libyan dialect spellings), clinical blacklist (55 terms), output check, safety recall metrics (100% recall). |

---

## Citations & Acknowledgments

All foundation models, open-source libraries, and frameworks utilized in this project are documented in [`CITATIONS.md`](CITATIONS.md) in strict compliance with Section 4 of the Ai4LY Codathon guidelines.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
