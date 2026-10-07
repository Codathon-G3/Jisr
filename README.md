# 🌉 Jisr (جِسر) — AI-Assisted Writing Companion

> **AI-Assisted Writing Companion for Young People in Libya**  
> *Developed for the Ai4LY National Codathon 2026 (Libya Artificial Intelligence Forum)*  
> **Team**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima  
> **Submission Date**: October 7, 2026  
> **Branch**: `feat/apk-mobile-sync`

[![Android APK](https://img.shields.io/badge/Android%20APK-Download%20v1.0.0-brightgreen?logo=android&style=for-the-badge)](builds/jisr-v1.0.0.apk)
[![Expo Go](https://img.shields.io/badge/Expo%20Go-Mobile%20Preview-blue?logo=expo&style=for-the-badge)](#2-running-the-mobile-app-from-source-expo--web)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn-009688?logo=fastapi&style=for-the-badge)](backend/)
[![Safety Tests](https://img.shields.io/badge/Safety%20Tests-450%2F450%20Pass%20(100%25%20Recall)-success?style=for-the-badge)](#4-running-the-verification--safety-test-suite)
[![Presentation: Pitch Deck](https://img.shields.io/badge/Presentation-5--Slide%20Pitch%20Deck-purple?style=for-the-badge)](docs/PITCH_DECK.md)

---

## 📖 Overview

The hardest step in reaching out during times of stress is often writing the very first message. For young people in Libya facing everyday pressures (exams, family expectations, work, relationships, sleep, finances), stigma and emotional overwhelm often lead to silence.

**Jisr** (Bridge Note) is a privacy-first mobile companion designed to break this silence. It helps young users turn their raw thoughts into a short, tone-adapted message addressed to a real human in their existing life (a friend, sibling, parent, trusted adult, or counsellor)—and then gets out of the way.

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
│   ├── jisr-v1.0.0.apk                # Standalone Android APK ready for direct sideloading
│   └── README.md                      # APK installation, verification & SHA-256 checksum guide
├── docs/                              # Codathon documentation, presentation & architecture
│   ├── team_plan/                     # Detailed 4-person workstreams and integration protocols
│   ├── PITCH_DECK.md                  # 5-minute presentation script & slide plan
│   ├── PITCH_DECK.html                # Visual interactive presentation deck
│   ├── COMMITTEE_QA.md                # Technical defense & evaluation committee Q&A
│   ├── codathon_submission_requirements.md # Ai4LY competition compliance checklist
│   ├── master_implementation_plan.md  # Comprehensive project implementation blueprint
│   └── README.md                      # Documentation index
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
├── src/                               # React Native / Expo mobile application source code
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
│   └── i18n/                          # Internationalization & Arabic localization
│       └── ar.json                    # Complete Libyan Arabic UI dictionary & chip labels
├── tests/                             # Quality assurance and verification test suites
│   ├── test-offline-fallback.mjs      # Test: 35 offline topic/recipient fallback permutations
│   ├── test-pii-sanitizer.mjs         # Test: Libyan phone, email & kinship scrubber patterns
│   ├── verify-m2-integration.mjs      # Test: End-to-end mobile user flow integration verification
│   └── verify-trust-components.mjs    # Test: Trust components & Arabic localization keys
├── App.tsx                            # Root React Native / Expo application entry point
├── app.json                           # Expo mobile configuration & Android APK package metadata
├── babel.config.js                    # Babel compiler configuration for React Native / Expo
├── CITATIONS.md                       # Open-source tools, models & frameworks citations
├── eas.json                           # EAS Build profiles (preview APK & production release)
├── package.json                       # Mobile app dependencies, scripts & test runners
├── README.md                          # Master project documentation, layout & execution guide
├── REPORT.md                          # Final comprehensive technical report for Ai4LY submission
└── tsconfig.json                      # TypeScript compiler configuration extending Expo base
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
* **Node.js** (v18 or later)
* **Python** (v3.10 or later)
* **Mobile Environment**: Any physical Android device (direct APK install) OR Expo Go OR any modern web browser

---

### 1. Direct Android APK Installation (Recommended for Quick Evaluation)
Evaluators can immediately test the standalone app without installing development tools:
1. Download `builds/jisr-v1.0.0.apk` directly from this repository or from [GitHub Releases](https://github.com/Ai4LY/Jisr/releases).
2. Sideload onto any physical Android device (Android 7.0+) or Android emulator and open **Jisr**.

---

### 2. Running the Mobile App from Source (Expo / Web)
```bash
# Clone the repository
git clone git@github.com:Codathon-G3/Jisr.git
cd Jisr

# Install mobile dependencies
npm install

# Option A: Run on Mobile Device via Expo Go
npx expo start
# Scan the displayed QR code with the Expo Go app on Android or iOS.

# Option B: Universal Web Preview (Instant browser testing)
npx expo start --web
```

---

### 3. Running the Backend API Server (FastAPI)
```bash
cd backend

# Create and activate Python virtual environment (recommended)
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Linux/macOS: source .venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Start the FastAPI server (runs on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```
> *Note: If the backend server is not running, Jisr automatically and seamlessly falls back to its deterministic offline templates (`safety/plain-templates.json`), guaranteeing 100% uptime even under network drops or offline evaluation.*

---

### 4. Running the Verification & Safety Test Suite
```bash
# Execute the full automated test suite (Safety unit tests + Crisis Recall + Trust components)
npm test

# Specialized test runners:
node tests/test-offline-fallback.mjs    # Tests all 35 offline fallback templates
node tests/test-pii-sanitizer.mjs       # Tests Libyan phone, email & kinship scrubbing
node tests/verify-m2-integration.mjs    # Tests end-to-end mobile user flow integration
```
*Expected Result: 450 safety tests passed (0 failed), 100.0% crisis recall on Libyan dialect benchmarks.*

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
All models, open-source libraries, and frameworks utilized in this project are documented in `CITATIONS.md` per Ai4LY Codathon guidelines.
