# 🌉 Jisr (جِسر) — AI-Assisted Writing Companion

> **AI-Assisted Writing Companion for Young People in Libya**  
> *Developed for the Ai4LY National Codathon 2026 (Libya Artificial Intelligence Forum)*  
> **Team**: Mohamed Thabet (Team Leader), Rayan, Muatz, Shima |
>  **Submission Date**: October 7, 2026

[![Status: In-Development](https://img.shields.io/badge/Status-Prototype%20Development-orange.svg)](#)

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
├── docs/                      # Complete team planning, architecture, and guides
│   ├── team_plan/             # Detailed 4-person workstreams and contracts
│   │   ├── 00_SHARED_SETUP.md # Tech choices & API schemas
│   │   ├── 01_PERSON_1_FRONTEND.md
│   │   ├── 02_PERSON_2_AI_BACKEND.md
│   │   ├── 03_PERSON_3_SAFETY.md
│   │   ├── 04_PERSON_4_DOCS_ARABIC.md
│   │   ├── 05_INTEGRATION_AND_TESTING_PROTOCOL.md
│   │   └── starter_data/      # Pre-built Arabic strings, templates & safety datasets
│   └── codathon_submission_requirements.md
├── src/ / app/                # Mobile application source code (In progress)
├── api/                       # Stateless backend endpoints for AI drafting & safety
├── safety/                    # Guardian Layer crisis phrases and evaluation benchmarks
└── README.md
```

---

## 🚀 Setup & Execution Guide

> ⚠️ *Note: The core components are currently being built and integrated by the four workstreams. Below is the preliminary execution structure.*

### Prerequisites
* **Node.js** (v18 or later)
* **Mobile Environment**: Expo Go installed on an Android/iOS device (or Android Studio emulator)
* **API Key**: Google Gemini API key or Groq API key

### 1. Backend API Setup
```bash
# Clone the repository
git clone git@github.com:Codathon-G3/Jisr.git
cd Jisr

# Install dependencies (once backend dependencies are committed)
npm install

# Configure environment variables
# Copy .env.example to .env.local and add your API keys:
# GEMINI_API_KEY=your_key_here

# Start the local backend API server
npm run dev
```

### 2. Mobile App Setup
```bash
# Start the Expo development server
npx expo start

# Scan the QR code using the Expo Go app on your physical phone,
# or press 'a' to open on Android Emulator.
```

*(Exact package scripts and live deployed URLs will be finalized upon Phase 3 integration freeze).*

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
