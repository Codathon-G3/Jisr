# 🌉 Jisr (جِسر) — AI-Assisted Writing Companion

> **AI-Assisted Writing Companion for Young People in Libya**  
> *Developed for the Ai4LY National Codathon 2026 (Libya Artificial Intelligence Forum)*  
> **Team**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima |
>  **Submission Date**: October 7, 2026

[![Platform: Android APK](https://img.shields.io/badge/Download-Android_APK-brightgreen.svg)](builds/jisr-v1.0.0.apk)
[![Framework: React Native / Expo](https://img.shields.io/badge/Framework-React_Native_/_Expo_SDK_51-blue.svg)](#)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-Python_FastAPI-009688.svg)](backend/)
[![Safety: 450 Tests Passed](https://img.shields.io/badge/Safety_Tests-450_Passed-success.svg)](safety/)
[![Presentation: Pitch Deck](https://img.shields.io/badge/Presentation-5--Slide_Pitch_Deck-purple.svg)](docs/PITCH_DECK.md)

---

## 📖 Overview

The hardest step in reaching out during times of stress is often writing the very first message. For young people in Libya facing everyday pressures (exams, family expectations, work, relationships, sleep, finances), stigma and emotional overwhelm often lead to silence.

**Jisr** (Bridge Note) is a privacy-first mobile companion designed to break this silence. It helps young users turn their raw thoughts into a short, tone-adapted message addressed to a real human in their existing life (a friend, sibling, parent, trusted adult, or counsellor)—and then gets out of the way.

> **Core Philosophy**: Jisr is not a chatbot, not a virtual therapist, and never holds conversations. Its sole purpose is to connect a human to a human.

---

## ✨ Key Features & The 4 System Layers

```
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
   * Situation chips (exams, family, work, relationships, sleep, money, other) and recipient selection.
   * Usable even with zero text typed.
2. **Layer 2: The Guardian Layer (Safety First)**
   * **Pre-Drafting Risk Check**: Layered Arabic/dialect phrase matching and model-based classification. Crisis inputs immediately divert to human care.
   * **Output Filter**: Deterministic blacklist preventing clinical terms, diagnosis, or medication recommendations.
   * **Persistent Human Route**: Always-present *"تكلم مع حد توا"* (Talk to Someone Now) button on every screen.
3. **Layer 3: Tone-Adapted Drafting Engine**
   * Produces exactly 3 drafts: **Gentle** (لطيف), **Direct** (مباشر), and **Formal** (رسمي).
   * Generates text strictly from the user's input—no hallucinated claims or diagnosis.
4. **Layer 4: Trust, Privacy & Native Sharing**
   * **Zero Data Retention**: Stateless drafting; no personal text is ever stored on external servers.
   * **On-Device Sandboxed History**: Optional local-only memory of chip topics that never leaves the phone.
   * **Native Mobile Handoff**: Hands the final message to WhatsApp, Messenger, Telegram, or SMS via the OS share sheet.

---

## 🛡️ Safety & Ethical Boundaries

* ❌ **Not a Doctor or Therapist**: Jisr does not diagnose, screen, score, or provide therapy.
* ❌ **No Automatic Actions**: Jisr never messages third parties or contacts emergency services automatically.
* ❌ **No Tracking**: No user profiling, no account required, no message logging.
* 🔒 **Identifiers Removed**: Phone numbers, emails, and names are scrubbed before drafting.

---

## 📁 Repository Structure

```text
Jisr/
├── .github/workflows/         # Automated APK build & release CI pipeline (build-apk.yml)
├── assets/                    # Mobile branding assets (icon, splash, adaptive-icon, favicon)
├── backend/                   # Python FastAPI stateless drafting & safety API
│   ├── app/                   # FastAPI routes (/check-risk, /generate-drafts, /faithfulness)
│   ├── data/ / prompts/       # Prompts and safety datasets
│   ├── tests/                 # Backend pytest test suite
│   └── requirements.txt       # Python dependencies (fastapi, uvicorn, pydantic, httpx)
├── builds/                    # Standalone compiled Android APK distribution
│   ├── jisr-v1.0.0.apk        # Standalone Android APK file for direct sideloading
│   └── README.md              # APK specifications, checksums & sideload guide
├── docs/                      # Complete team planning, architecture, and guides
│   ├── team_plan/             # Detailed 4-person workstreams and contracts
│   ├── PITCH_DECK.md          # 5-minute presentation script and 5-slide plan
│   ├── COMMITTEE_QA.md        # Technical defense & FAQ for committee
│   └── codathon_submission_requirements.md
├── safety/                    # Guardian Layer (Libyan dialect crisis lexicon & benchmarks)
│   ├── crisis-phrases.json    # 375 curated Libyan dialect crisis expressions
│   ├── forbidden-terms.json   # 194 diagnostic/clinical blocked terms
│   ├── support-card.json      # Pre-written verified human support contacts
│   ├── plain-templates.json   # Deterministic fallback templates (Libyan Arabic)
│   ├── evaluate.mjs           # Automated benchmark evaluation harness (100% recall)
│   └── selftest.mjs           # Guardian test harness (450 passing tests)
├── src/                       # React Native / Expo mobile app source code
│   ├── components/            # Trust & UI components (Baseline, Faithfulness, Outbound)
│   ├── services/              # Crisis check, PII sanitizer & sandboxed AsyncStorage
│   ├── types/                 # Shared TypeScript interfaces
│   └── i18n/                  # Arabic (Libyan dialect) localization strings
├── tests/                     # Integration and verification test scripts
├── App.tsx                    # Master mobile application entry point & linear flow
├── app.json                   # Expo configuration & Android APK package metadata
├── eas.json                   # EAS Build profile for standalone Android APK generation
├── CITATIONS.md               # Tool, model, and dataset attributions (Codathon §4)
├── REPORT.md                  # Comprehensive Technical Report in Markdown
└── README.md                  # Master project guide, architecture & setup
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
* **Node.js** (v18 or later)
* **Python** (v3.10 or later)
* **Mobile Environment**: Any Android device (direct APK install) OR Expo Go OR any web browser

---

### 1. Direct Android APK Installation (Recommended for Quick Evaluation)
Evaluators can immediately test the standalone app without installing development tools:
1. Download `builds/jisr-v1.0.0.apk` directly from this repository or from [GitHub Releases](https://github.com/Ai4LY/Jisr/releases).
2. Sideload onto any physical Android device (Android 7.0+) and open **Jisr**.

---

### 2. Running the Mobile App from Source (Expo / Web)
```bash
# Clone the repository
git clone git@github.com:Codathon-G3/Jisr.git
cd Jisr

# Install dependencies
npm install

# Option A: Universal Web Preview (Instant browser testing)
npm run web

# Option B: Run on Mobile Device via Expo Go
npx expo start
# Scan the displayed QR code with the Expo Go app on Android or iOS.
```

---

### 3. Running the Backend API Server (FastAPI)
```bash
cd backend

# Install Python requirements
pip install -r requirements.txt

# Start the FastAPI server (runs on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```
> *Note: If the backend server is not running, Jisr automatically and seamlessly switches to its deterministic offline templates (`safety/plain-templates.json`), guaranteeing 100% uptime even under network drops.*

---

### 4. Running the Verification & Safety Test Suite
```bash
# Execute the full automated test suite (Safety unit tests + Crisis Recall + Trust components)
npm test
```
*Expected Result: 450 safety tests passed (0 failed), 100.0% crisis recall on Libyan dialect benchmarks.*

---

## 👥 Team & Workstreams

| Member | Workstream | Primary Deliverables |
|---|---|---|
| **Rayan** (Person 1) | Mobile App & Interaction Engineer | React Native/Expo UI, chip selector, triggers, native share sheet |
| **Muatz** (Person 2) | AI Core & Backend Engineer | LLM prompt engineering, risk check API, PII stripping, stateless routes |
| **Shima** (Person 3) | Safety, Guardian & Evidence Engineer | Crisis phrase list (Libyan dialect), output check, safety recall metrics |
| **Mohamed Thabet** (Team Leader, Person 4) | Trust Views, Arabic Quality, Documentation & Presentation Lead | Arabic linguistic review, technical report, pitch deck & demo video |

---

## 📜 Citations & Acknowledgments
All models, open-source libraries, and frameworks utilized in this project are documented in `CITATIONS.md` per Ai4LY Codathon guidelines.
