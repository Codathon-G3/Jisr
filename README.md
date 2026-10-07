# 🌉 Jisr (جِسر) — AI-Assisted Writing Companion

> **AI-Assisted Writing Companion for Young People in Libya**  
> *Developed for the Ai4LY National Codathon 2026 (Libya Artificial Intelligence Forum)*  
> **Team**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima  
> **Submission Date**: October 7, 2026  
> **Branch**: `feat/apk-mobile-sync`

[![Live Web Showcase](https://img.shields.io/badge/Web%20Showcase-Next.js%2016-000000?logo=next.js&style=for-the-badge)](#-showcase-1-web-showcase-nextjs-16--instant-browser-evaluation)
[![Android APK](https://img.shields.io/badge/Android%20APK-Download%20v1.0.0-brightgreen?logo=android&style=for-the-badge)](builds/jisr-v1.0.0.apk)
[![Expo Go](https://img.shields.io/badge/Expo%20Go-Mobile%20Preview-blue?logo=expo&style=for-the-badge)](#option-b-running-mobile-app-from-source-expo-sdk-51)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn-009688?logo=fastapi&style=for-the-badge)](backend/)
[![Safety Tests](https://img.shields.io/badge/Safety%20Tests-450%2F450%20Pass%20(100%25%20Recall)-success?style=for-the-badge)](#-automated-test-suite-verification-npm-test)
[![Presentation: Pitch Deck](https://img.shields.io/badge/Presentation-5--Slide%20Pitch%20Deck-purple?style=for-the-badge)](docs/PITCH_DECK.md)

---

## 📖 Overview

The hardest step in reaching out during times of stress is often writing the very first message. For young people in Libya facing everyday pressures (exams, family expectations, work, relationships, sleep, finances), stigma and emotional overwhelm often lead to silence.

**Jisr** (Bridge Note) is a privacy-first companion designed to break this silence. It helps young users turn their raw thoughts into a short, tone-adapted message addressed to a real human in their existing life (a friend, sibling, parent, trusted adult, or counsellor)—and then gets out of the way.

> **Core Philosophy**: Jisr is not a chatbot, not a virtual therapist, and never holds conversations. Its sole purpose is to connect a human to a human.

---

## ✨ Key Features & The 4 System Layers

```text
User (Taps Chips / Writes 1-3 Lines)
  │
  ├── [Layer 1: Capture Layer] Deterministic situation chips & recipient selector
  │
  ├── [Layer 2: Guardian Layer] High-recall risk classifier & deterministic safety filters
  │     ├── Crisis Detected  ──► Static Verified Support Card (never AI-generated)
  │     └── Safe Input       ──► Proceeds to Drafting Engine
  │
  ├── [Layer 3: Drafting Engine] 3 tone drafts (Gentle, Direct, Formal) from user words only
  │
  └── [Layer 4: Trust & Control] Baseline Comparison, Faithfulness checks & Native Messaging Share
```

1. **Layer 1: Capture Layer (Zero-Typing Friendly)**
   * 7 everyday stress chips (exams, family, work, relationships, sleep, money, other) in RTL layout and 5 recipient selectors.
   * Usable even with zero text typed.
2. **Layer 2: The Guardian Layer (Safety First)**
   * **Pre-Drafting Risk Check**: Layered Arabic/dialect phrase matching and model-based classification. Crisis inputs immediately divert to human care.
   * **Output Filter**: Deterministic blacklist preventing clinical terms, diagnosis, or medication recommendations.
   * **Persistent Human Route**: Always-present *"تكلم مع حد توا"* (Talk to Someone Now) button on every screen opening the verified Support Card modal.
3. **Layer 3: Tone-Adapted Drafting Engine**
   * Produces exactly 3 drafts: **Gentle** (لطيف), **Direct** (مباشر), and **Formal** (رسمي) with live in-place editing.
   * Generates text strictly from the user's input—no hallucinated claims or diagnosis.
4. **Layer 4: Trust, Privacy & Native Sharing**
   * **Zero Data Retention**: Stateless drafting; no personal text is ever stored on external servers.
   * **On-Device Sandboxed History**: Optional local-only memory of chip topics via `AsyncStorage` with one-tap history wipe.
   * **Native Mobile Handoff**: Hands the final message to WhatsApp, Messenger, or SMS via the OS share sheet with zero telemetry.

---

## 🛡️ Safety & Ethical Boundaries

* ❌ **Not a Doctor or Therapist**: Jisr does not diagnose, screen, score, or provide therapy.
* ❌ **No Automatic Actions**: Jisr never messages third parties or contacts emergency services automatically.
* ❌ **No Tracking**: No user profiling, no account required, no message logging.
* 🔒 **Identifiers Removed**: Libyan phone numbers (+218), emails, and kinship mentions are scrubbed before drafting.

---

## 📁 Repository Structure

```text
Jisr/
├── .github/
│   └── workflows/
│       └── build-apk.yml              # Automated APK compilation & release packaging CI workflow
├── assets/                            # Mobile branding assets (icons, splash screen)
│   ├── adaptive-icon.png              # Android adaptive launcher icon
│   ├── favicon.png                    # Web favicon
│   ├── icon.png                       # Standard app launcher icon
│   └── splash.png                     # Mobile launch splash screen
├── backend/                           # Stateless Python FastAPI AI drafting & safety service
│   ├── app/                           # FastAPI application core
│   │   ├── main.py                    # Entry point, CORS middleware & route registration
│   │   ├── config.py                  # Environment settings & model parameters
│   │   ├── schemas.py                 # Pydantic validation schemas
│   │   ├── routers/                   # Endpoints (/check-risk, /generate-drafts, /faithfulness)
│   │   └── services/                  # LLM client, PII sanitizer, fallback & safety checks
│   ├── data/                          # Safety reference datasets and placeholders
│   ├── prompts/                       # Markdown system prompts (drafting, risk check, faithfulness)
│   ├── scripts/                       # Risk evaluation offline test scripts
│   ├── tests/                         # Pytest test suite for backend routes and services
│   ├── .env.example                   # Template for environment variables (API keys)
│   ├── requirements.txt               # Python package dependencies (fastapi, uvicorn, pydantic)
│   └── README.md                      # Backend service documentation
├── builds/                            # Compiled Android APK distribution directory
│   ├── jisr-v1.0.0.apk                # Standalone Android APK ready for direct sideloading (63.1 MB)
│   └── README.md                      # APK installation, verification & SHA-256 checksum guide
├── docs/                              # Codathon documentation, presentation & architecture
│   ├── team_plan/                     # Detailed 4-person workstreams and integration protocols
│   ├── PITCH_DECK.md                  # 5-minute presentation script & slide plan
│   ├── PITCH_DECK.html                # Visual interactive presentation deck
│   ├── PITCH_DECK.pptx                # Standalone 16:9 widescreen PowerPoint presentation deck
│   ├── COMMITTEE_QA.md                # Technical defense & evaluation committee Q&A
│   ├── codathon_submission_requirements.md # Ai4LY competition compliance checklist
│   ├── master_implementation_plan.md  # Comprehensive project implementation blueprint
│   └── README.md                      # Documentation index
├── public/                            # Web and shared public visual assets
│   └── brand/                         # High-resolution brand artwork
│       └── jisr-intro-mobile.png      # Intro companion illustration used across Web and Mobile
├── safety/                            # Guardian Layer datasets, crisis lexicon & evaluation
│   ├── crisis-phrases.json            # 60 curated Libyan Arabic dialect crisis phrases (tested across 360+ spelling variants)
│   ├── forbidden-terms.json           # 55 diagnostic/clinical terms blocked from generated drafts
│   ├── dev-set.json                   # 25-item gold-standard benchmark for recall evaluation
│   ├── plain-templates.json           # Deterministic offline fallback & baseline templates
│   ├── support-card.json              # Static emergency support card with approved fallback message
│   ├── contact-verification.md        # Audit verification of crisis helpline numbers
│   ├── evidence.md                    # Guardian layer safety benchmarks and evidence chain
│   ├── stated-limits.json             # Explicit system operational and ethical boundaries
│   ├── evaluate.mjs                   # Crisis recall evaluation runner (100.0% recall verified)
│   ├── selftest.mjs                   # Deterministic Guardian unit test runner (450 passing tests)
│   └── lib/                           # Guardian matching and normalization algorithms
├── scripts/                           # Standalone presentation & deck generation scripts
│   └── generate_pitch_deck.py         # Programmatic 16:9 widescreen PowerPoint pitch deck generator
├── src/                               # Dual frontend source code (Web Showcase & React Native Mobile)
│   ├── app/                           # Next.js 16 interactive Web Showcase
│   │   ├── globals.css                # Custom RTL styling in Rayan's dark/navy/cream palette
│   │   ├── layout.js                  # Root Next.js layout (Arabic RTL metadata)
│   │   └── page.js                    # Full interactive Web Showcase application
│   ├── components/                    # Modular mobile UI & trust inspection components
│   │   ├── BaselineComparison.tsx     # Toggle: AI personalized draft vs static baseline template
│   │   ├── FaithfulnessView.tsx       # Word-level attribution inspector for draft grounding
│   │   ├── OutboundPreview.tsx        # Outbound privacy inspector showing PII redaction
│   │   ├── SupportCardModal.tsx       # Persistent human route emergency support modal
│   │   ├── TriggerModal.tsx           # Same-session writing trigger modal dialog
│   │   └── index.ts                   # UI component barrel export
│   ├── screens/                       # Mobile application screens
│   │   └── CaptureScreen.tsx          # 7 RTL stress chips, 5 recipient selectors, text input
│   ├── services/                      # Mobile services & data access
│   │   ├── api.ts                     # Backend REST client with deterministic offline fallback
│   │   ├── crisisCheck.ts             # Zero-latency on-device regex crisis screening
│   │   ├── piiSanitizer.ts            # Client-side Libyan phone, email & kinship scrubber
│   │   └── storage.ts                 # Sandboxed on-device AsyncStorage history & wipe
│   ├── types/                         # Shared TypeScript interfaces & data contracts
│   │   └── index.ts                   # Core data models (Chips, Drafts, Recipient, History)
│   ├── i18n/                          # Internationalization & Arabic localization
│   │   └── ar.json                    # Complete Libyan Arabic UI dictionary & chip labels
│   └── theme.ts                       # Shared color palette and design tokens
├── tests/                             # Quality assurance and verification test suites
│   ├── test-offline-fallback.mjs      # Test: 35 offline topic/recipient fallback permutations
│   ├── test-pii-sanitizer.mjs         # Test: Libyan phone, email & kinship scrubber patterns
│   ├── verify-crisis-parity.mjs       # Test: 756 parity checks between mobile regex & backend safety logic
│   ├── verify-m2-integration.mjs      # Test: End-to-end mobile user flow integration verification
│   └── verify-trust-components.mjs    # Test: Trust components & Arabic localization keys
├── App.tsx                            # Root React Native / Expo application entry point
├── app.json                           # Expo mobile configuration & Android APK package metadata
├── babel.config.js                    # Babel compiler configuration for React Native / Expo
├── CITATIONS.md                       # Open-source tools, models & frameworks citations
├── eas.json                           # EAS Build profiles (preview APK & production release)
├── LICENSE                            # Standard open-source MIT License terms
├── package.json                       # Next.js 16 web dependencies, scripts & root test harness
├── package.mobile.json                # Dedicated React Native / Expo SDK 51 mobile dependencies
├── README.md                          # Master project documentation, layout & execution guide
├── REPORT.md                          # Final comprehensive technical report for Ai4LY submission
└── tsconfig.json                      # TypeScript compiler configuration extending Expo base
```

---

## 🚀 Setup & Execution Guide

### 🌟 Dual-Showcase Evaluation Guide for Judges

Jisr provides two complete, synchronized evaluation avenues tailored for the Ai4LY Codathon evaluation committee:
1. **Showcase 1 (Web)**: Instant, zero-friction browser experience running Next.js 16 (`npm run dev` on port 3000). Ideal for rapid live demonstration and projection.
2. **Showcase 2 (Mobile)**: Standalone compiled Android APK (`builds/jisr-v1.0.0.apk`) ready for immediate sideloading onto physical Android devices or emulators, plus source execution via Expo SDK 51.

Both showcases are backed by the same linguistic assets, Guardian safety datasets (`safety/`), offline fallback templates (`safety/plain-templates.json`), and the optional Python FastAPI backend (`backend/`).

---

### Prerequisites
* **Node.js** (v18 or later recommended; v20+ supported)
* **Python** (v3.10 or later, for backend service)
* **Mobile Evaluation**: Physical Android device (Android 6.0+ / API 23+) OR Android Emulator (x86_64 / ARM) OR Expo Go app

---

### 🌐 Showcase 1: Web Showcase (Next.js 16 — Instant Browser Evaluation)

The Web Showcase provides the fastest way to evaluate Jisr's full user experience, interactive chips, crisis screening, 3-tone drafting, and support modal directly in your web browser.

```bash
# 1. Install dependencies (from repository root)
npm install

# 2. Launch the Next.js development server
npm run dev
```

- **URL**: Open [http://localhost:3000](http://localhost:3000) in any modern browser.
- **Port**: Default port `3000` (runs locally).
- **Features Active**:
  - Full RTL Libyan Arabic interface styled in Rayan's dark/cream/navy palette.
  - Interactive selection of 7 stress topics and 5 recipient types.
  - Guardian Layer pre-drafting crisis detection & safety interception.
  - 3-tone drafting engine (Gentle, Direct, Formal) with live offline fallback.
  - Persistent *"تكلم مع حد توا"* emergency support card modal.
  - Trust inspection tools and baseline comparison.

To create a production-optimized build of the Web Showcase:
```bash
npm run build
npm run start
```

---

### 📱 Showcase 2: Mobile Showcase (React Native / Expo & Android APK)

#### Option A: Direct APK Sideloading (Fastest Mobile Evaluation)
Evaluators can install and run the standalone, pre-compiled Android binary without setting up mobile development environments or compilers:

1. **Locate or Download APK**:
   - File path: `builds/jisr-v1.0.0.apk` (63,074,501 bytes / 63.1 MB)
   - SHA-256 Checksum: `e2da042e2b8a85da55517fc1ea9552c879e3950b1df7bb152c3c66a0628dbe5b`
2. **Verify Integrity**:
   - On Windows (PowerShell):
     ```powershell
     Get-FileHash builds/jisr-v1.0.0.apk -Algorithm SHA256
     ```
   - On Linux / macOS:
     ```bash
     sha256sum builds/jisr-v1.0.0.apk
     ```
3. **Install on Physical Android Device (Sideloading Guide)**:
   - Transfer `jisr-v1.0.0.apk` to your Android device via USB, direct download, or cloud drive.
   - Open the file using **Files** or **Downloads**.
   - If prompted with *"Install unknown apps"*, navigate to **Settings** and toggle permission for that source.
   - Tap **Install**, then tap **Open**.
   - Package ID: `com.ai4ly.jisr` (targets Android API 23+ / Android 6.0+).
4. **Install via Android Debug Bridge (ADB)**:
   ```bash
   adb install -r builds/jisr-v1.0.0.apk
   adb shell am start -n com.ai4ly.jisr/.MainActivity
   ```
*(Detailed APK specifications, signing information, and architecture notes are documented in [`builds/README.md`](builds/README.md).)*

#### Option B: Running Mobile App from Source (Expo SDK 51)
To run or inspect the mobile application from source code:

```bash
# Option 1: Mobile preview via Expo Go (QR Code)
npx expo start
# Scan the displayed QR code with Expo Go on your Android device.

# Option 2: Mobile Web preview (React Native Web)
npx expo start --web
```
*(Mobile dependencies are specified in `package.mobile.json` and root `package.json`.)*

---

### ⚙️ Optional Backend API Server (FastAPI & Uvicorn)

The backend provides LLM-driven drafting, risk checking, and PII anonymization endpoints:

```bash
cd backend

# Create and activate Python virtual environment
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Linux/macOS: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI service (runs on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```

> **🛡️ Offline Resilience Guarantee**: If the FastAPI backend is not running, both the Web and Mobile applications automatically fallback to the local deterministic engine (`safety/plain-templates.json`). The application is 100% operational offline without any external network dependency.

---

### 🧪 Automated Test Suite Verification (`npm test`)

The complete verification harness runs deterministic unit tests, benchmark recall evaluations, trust component integrity checks, and crisis parity validations in a single command:

```bash
npm test
```

#### What `npm test` Executes:
1. **Guardian Layer Unit Tests (`safety/selftest.mjs`)**:
   - Executes **450 safety test cases** with **0 failures**.
   - Validates regex normalization, phrase detection, boundary conditions, and output screening.
2. **Synthetic Crisis Benchmark Recall (`safety/evaluate.mjs safety/dev-set.json`)**:
   - Evaluates gold-standard benchmark dev set (25 dialect test vectors across 60 crisis phrases).
   - Verifies **100.0% recall** (10/10 crisis cases caught, 95% CI 72.2%–100.0%).
   - Verifies **0.0% false-alarm rate** (0/11 non-crisis inputs flagged).
3. **Trust & Arabic Localization Verification (`tests/verify-trust-components.mjs`)**:
   - Validates `src/i18n/ar.json` structure and completeness.
   - Validates all 4 Person 4 trust UI components: `BaselineComparison.tsx`, `FaithfulnessView.tsx`, `OutboundPreview.tsx`, and component index.
4. **Mobile vs Backend Crisis Check Parity (`tests/verify-crisis-parity.mjs`)**:
   - Executes **756 cross-layer parity checks**.
   - Verifies all 60 crisis phrases caught on-device across 360 spelling variations.
   - Matches `safety/lib/crisis-check.mjs` on 385 inputs.
   - Verifies that 7 benign everyday idioms remain unflagged.

#### Specialized Auxiliary Test Runners:
```bash
node tests/test-offline-fallback.mjs    # Validates all 35 offline fallback templates & permutations
node tests/test-pii-sanitizer.mjs       # Validates Libyan phone (+218), email & kinship scrubbing
node tests/verify-m2-integration.mjs    # Validates complete Milestone 2 mobile integration flow
```

---

## 👥 Team & Workstreams

| Member | Workstream | Primary Deliverables |
|---|---|---|
| **Rayan** (Person 1) | Mobile App & Interaction Engineer | React Native/Expo UI, chip selector, triggers, native share sheet, APK build |
| **Muatz** (Person 2) | AI Core & Backend Engineer | FastAPI service (`uvicorn app.main:app`), LLM prompts, risk check API, PII stripping |
| **Shima** (Person 3) | Safety, Guardian & Evidence Engineer | Crisis phrase list (Libyan dialect), output check, safety recall metrics |
| **Mohamed Thabet** (Team Leader, Person 4) | Trust Views, Arabic Quality, Documentation & Presentation Lead | Arabic linguistic review, technical report, pitch deck, README & citations |

---

## 📜 Citations & Acknowledgments

All models, open-source libraries, and frameworks utilized in this project are documented in [`CITATIONS.md`](CITATIONS.md) per Ai4LY Codathon guidelines.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
