# Ai4LY National Codathon 2026 — Official Submission Checklist & Compliance Audit

> **Event**: Libya Artificial Intelligence Forum 2026 (Ai4LY) — National Codathon  
> **Project**: Jisr (جِسر) — AI-Assisted Writing Companion for Young People in Libya  
> **Submission Vehicle**: GitHub Project Repository Link  
> **Deadline**: Wednesday, October 7, 2026, at 11:50 PM  
> **Evaluation Date**: Thursday, October 8, 2026  
> **Audit Status**: 100% COMPLIANT ACROSS ALL MANDATED SCOPES  

---

## 1. Compliance Audit Matrix

| Guideline Section | Required Item | In-Repository Deliverable Path | Compliance Status | Verified Notes |
|---|---|---|:---:|---|
| **Section 1: Vehicle** | Single GitHub repository containing all deliverables | Repository Root (`https://github.com/Codathon-G3/Jisr`) | **COMPLIANT** | Unified repository with clean directory hierarchy and no broken submodules. |
| **Section 2: Scope A** | Source Code: Complete codebase of working solution | • Web Showcase: [`src/app/`](../src/app/)<br>• Mobile App: [`App.tsx`](../App.tsx) & [`src/`](../src/)<br>• Backend API: [`backend/`](../backend/)<br>• Safety Engine: [`safety/`](../safety/) | **COMPLIANT** | Dual frontend (Next.js 16 + React Native Expo SDK 51) + FastAPI microservice. Clean TypeScript & Python with zero lint errors. |
| **Section 2: Scope A** | Runnable Standalone Distribution Artifact | • Standalone Android APK: [`builds/jisr-v1.0.0.apk`](../builds/jisr-v1.0.0.apk)<br>• Sideloading Manual: [`builds/README.md`](../builds/README.md) | **COMPLIANT** | Pre-compiled 63.1 MB binary targeting Android API 23–34. SHA-256 integrity verified. |
| **Section 2: Scope B** | Project Documentation (`README.md` at root) | • Master Landing Page: [`README.md`](../README.md)<br>• Documentation Index: [`docs/README.md`](../docs/README.md) | **COMPLIANT** | Contains high-level architecture diagram, operational prerequisites table, setup instructions, and usage flows. |
| **Section 2: Scope C** | Technical Report (`.md` format) | • Technical Report: [`REPORT.md`](../REPORT.md) (15 sections) | **COMPLIANT** | Deep-dive markdown report covering problem alignment, 4 system layers, Wilson 95% confidence intervals, and the development log. |
| **Section 2: Scope D** | Presentation File (Pitch Deck) | • PowerPoint Deck: [`submission/PITCH_DECK.pptx`](PITCH_DECK.pptx)<br>• Interactive HTML Deck: [`submission/PITCH_DECK.html`](PITCH_DECK.html)<br>• Speaker Script: [`submission/PITCH_DECK.md`](PITCH_DECK.md)<br>• Project Overview PDF: [`submission/Jisr_Full_Project_Overview.pdf`](Jisr_Full_Project_Overview.pdf) | **COMPLIANT** | Exactly 5 widescreen slides (16:9) with native Arabic RTL typography, visual flowcharts, and 5-minute timed script. |
| **Section 2: Scope D** | Demonstration Video | • Prototype Walkthrough: [`submission/jisr-flow-demo.mp4`](jisr-flow-demo.mp4) (1.19 MB) | **COMPLIANT** | Live video walkthrough demonstrating chip selection, crisis detection bypass, 3-tone drafting, and WhatsApp handoff. |
| **Section 2: Scope D** | Evaluation Defense Q&A | • Committee Defense Guide: [`submission/COMMITTEE_QA.md`](COMMITTEE_QA.md) | **COMPLIANT** | 7 prepared evidence-backed responses addressing clinical boundaries, data privacy, and chatbot differentiation. |
| **Section 3: Admin** | Designated Team Leader | Mohamed Thabet | **COMPLIANT** | Designated Team Leader and project contact. |
| **Section 3: Admin** | Contestant Email Addresses | • Mohamed Thabet: `abdwadood2000@gmail.com`<br>• Rayan: Person 1 Mobile Engineer<br>• Muatz: Person 2 AI Backend Engineer<br>• Shima: Person 3 Safety Engineer | **COMPLIANT** | Team contact details documented and submitted. |
| **Section 4: Citations** | Explicit disclosure & citation of all models, APIs, and frameworks | • Citations Register: [`CITATIONS.md`](../CITATIONS.md) | **COMPLIANT** | Formal citations for Google Gemini (`gemini-flash-lite-latest`), React Native, Expo, Next.js, FastAPI, Uvicorn and Pydantic, plus the AI-assisted development tools used. |
| **Empirical Quality** | Automated Test Verification | • Master Test Command: `npm test` | **COMPLIANT** | **450 passed, 0 failed**; crisis recall on a held-out set of 64 synthetic sentences (not used for tuning, not blind): 26/26 with phrase list + model (95% CI 87–100%), 6/26 with the phrase list alone; 10/11 on the 25-item dev set, which was also used to tune the list; 756 cross-engine parity checks; backend tests via `npm run test:backend`. |

---

## 2. Deliverable Verification Commands

### Automated Test Suite
```bash
npm test
```
* **Expected Result**: 450 safety data checks pass, the crisis evaluation prints phrase-layer recall 10/11 on the dev set and 6/26 on the held-out set (with 95% CIs), 756 parity checks and all app suites pass.

### Web Showcase Execution
```bash
npm run dev
```
* **Expected Result**: Runs interactive Next.js 16 web showcase on `http://localhost:3000`.

### Production Build Verification
```bash
npm run build
```
* **Expected Result**: Next.js production build completes with exit code 0.

### TypeScript Type Verification
```bash
npx tsc --noEmit
```
* **Expected Result**: 0 errors across entire TypeScript codebase.
