# Jisr (جِسر) — AI-Assisted Writing Companion

> **AI-Assisted Writing Companion for Young People in Libya**  
> *Developed for the Ai4LY National Codathon 2026 (Libya Artificial Intelligence Forum)*  
> **Team**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima  
> **Submission Date**: October 7, 2026  
> **Active Branch**: `main`

[![Live Web Showcase](https://img.shields.io/badge/Web%20Showcase-Next.js%2016-000000?logo=next.js&style=for-the-badge)](#-showcase-1-web-showcase-nextjs-16--instant-browser-evaluation)
[![Android APK](https://img.shields.io/badge/Android%20APK-Download%20v1.0.0-brightgreen?logo=android&style=for-the-badge)](builds/jisr-v1.0.0.apk)
[![Expo Go](https://img.shields.io/badge/Expo%20Go-Mobile%20Preview-blue?logo=expo&style=for-the-badge)](#-showcase-2-mobile-showcase-react-native--expo--android-apk)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn-009688?logo=fastapi&style=for-the-badge)](backend/)
[![Safety Tests](https://img.shields.io/badge/Safety%20Tests-450%2F450%20Pass%20(100%25%20Recall)-success?style=for-the-badge)](#-automated-verification-suite-npm-test)
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
* It immediately checks for acute crisis indicators using a high-recall Guardian Layer.
* It produces three tone-adapted, editable message drafts (**Gentle**, **Direct**, **Formal**) tailored to a real person in the user's personal circle (friend, sibling, parent, trusted adult, or counsellor).
* It hands the message directly to WhatsApp, Messenger, or SMS via the native system share sheet, and immediately encourages the user to close the app.

> **Core Philosophy**: Jisr is **not a chatbot**, **not a virtual therapist**, and **never holds open-ended conversations**. Its sole purpose is to connect a human to a human early and exit.

---

## The 4 System Layers

```text
User (Taps Situation Chips / Writes 1–3 Lines)
  │
  ├── [Layer 1: Capture Layer] Deterministic situation chips & recipient selector (Zero-typing friendly)
  │
  ├── [Layer 2: Guardian Layer] High-recall dialect risk classifier & clinical blacklist
  │     ├── Crisis Detected  ──► Static Verified Support Card (never AI-generated)
  │     └── Safe Input       ──► Proceeds to Drafting Engine
  │
  ├── [Layer 3: Drafting Engine] 3 tone drafts (Gentle, Direct, Formal) from user words only
  │
  └── [Layer 4: Trust & Control] Baseline Comparison, Faithfulness inspect & Native Share Sheet
```

1. **Layer 1: Capture Layer (Zero-Typing Friendly)**
   * 7 everyday stress chips (`الامتحانات`, `العائلة`, `العمل`, `العلاقات`, `النوم`, `المال`, `أخرى`) in authentic RTL layout.
   * 5 relationship categories (`صديق`, `أخ/أخت`, `أحد الوالدين`, `شخص كبير تثق فيه`, `مرشد/أستاذ`).
   * Usable even with zero text typed.
2. **Layer 2: The Guardian Layer (Safety Non-Negotiables)**
   * **Pre-Drafting Risk Check**: Zero-latency local regex matching across 60 Libyan dialect crisis phrases (tested on 360+ spelling variants) plus model-based classification. Crisis inputs immediately divert to human care.
   * **Clinical Blacklist**: Deterministic filter blocking 55 psychiatric conditions, diagnosis labels, and medication terms.
   * **Persistent Human Route**: Pinned *"تكلم مع حد توا"* (Talk to Someone Now) button on every screen opening the verified Support Card modal.
   * **Ethical Contact Policy**: Enacts strict safety rule (`contacts: []` empty array) with an unalterable emergency room statement rather than displaying unmonitored Libyan hotline numbers.
3. **Layer 3: Tone-Adapted Drafting Engine**
   * Generates exactly 3 drafts: **Gentle** (لطيف), **Direct** (مباشر), and **Formal** (رسمي) with live in-place editing.
   * Generates strictly from user words—zero invented facts, zero clinical labels.
   * Powered by Google Gemini 1.5 Flash (primary) and Groq Llama 3.3 70B (fallback).
4. **Layer 4: Trust, Privacy & Native Sharing**
   * **Live Baseline Comparison**: Live toggle comparing the AI draft against a generic template to prove real AI utility.
   * **Faithfulness Alignment**: Visual word-level attribution tracing draft words directly back to the user's input.
   * **Outbound Preview**: Client-side PII sanitizer displays scrubbed personal phone numbers (+218), emails, and kinship names before transmission.
   * **Zero Cloud Data Retention**: Stateless drafting; no personal notes are ever stored on servers or databases.
   * **Sandboxed On-Device History**: Optional local-only memory via `AsyncStorage` with one-tap instant wipe.
   * **Native Mobile Handoff**: Dispatches to WhatsApp, Messenger, or SMS via the OS share sheet with zero telemetry.

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

## Setup & Execution Guide for Judges

### Dual-Showcase Evaluation Avenues
Evaluators can review Jisr through two distinct, synchronized avenues:
1. **Showcase 1 (Web)**: Instant, zero-friction browser experience running Next.js 16 (`npm run dev` on port 3000). Ideal for rapid live demonstration and projection.
2. **Showcase 2 (Mobile)**: Standalone compiled Android APK (`builds/jisr-v1.0.0.apk`) ready for immediate sideloading onto physical Android devices or emulators, plus source execution via Expo SDK 51.

Both showcases are backed by the same Guardian safety datasets (`safety/`), offline fallback templates (`safety/plain-templates.json`), and the optional Python FastAPI backend (`backend/`).

---

### Prerequisites
* **Node.js** (v18 or later recommended; v20+ supported)
* **Python** (v3.10 or later, for backend service)
* **Mobile Evaluation**: Physical Android device (Android 6.0+ / API 23+) OR Android Emulator (x86_64 / ARM) OR Expo Go app

---

### Showcase 1: Web Showcase (Next.js 16 — Instant Browser Evaluation)

The Web Showcase provides the fastest way to evaluate Jisr's full user experience directly in your browser:

```bash
# 1. Install dependencies (from repository root)
npm install

# 2. Launch the Next.js development server
npm run dev
```

* **URL**: Open [http://localhost:3000](http://localhost:3000) in any modern browser.
* **Active Features**:
  * Full RTL Libyan Arabic interface styled in dark/cream/navy palette.
  * Interactive selection of 7 stress topics and 5 recipient types.
  * Guardian Layer pre-drafting crisis detection & safety interception.
  * 3-tone drafting engine (Gentle, Direct, Formal) with live offline fallback.
  * Persistent *"تكلم مع حد توا"* emergency support card modal.
  * Trust inspection tools and baseline comparison.

To create a production-optimized build:
```bash
npm run build && npm run start
```

---

### Showcase 2: Mobile Showcase (React Native / Expo & Android APK)

#### Option A: Direct APK Sideloading (Fastest Mobile Evaluation)
Evaluators can install and run the standalone, pre-compiled Android binary without setting up mobile build environments:

1. **Locate APK**:
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
# Option 1: Mobile preview via Expo Go (QR Code)
npx expo start

# Option 2: Mobile Web preview (React Native Web)
npx expo start --web
```

---

### Optional Backend API Server (FastAPI & Uvicorn)

The backend provides LLM-driven drafting, risk checking, and PII anonymization endpoints:

```bash
cd backend

# Create and activate Python virtual environment
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate

# Install dependencies & run service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

> **Offline Resilience Guarantee**: If the FastAPI backend is not running, both the Web and Mobile applications automatically fallback to the local deterministic engine (`safety/plain-templates.json`). The application is 100% operational offline without any external network dependency.

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
