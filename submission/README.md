# Ai4LY National Codathon 2026 — Official Submission Package

> **Competition**: Libya Artificial Intelligence Forum 2026 (Ai4LY) — National Codathon  
> **Project**: Jisr (جِسر) — AI-Assisted Writing Companion for Young People in Libya  
> **Track**: AI for Mental Health & Youth Well-being  
> **Team Leader**: Mohamed Thabet (`abdwadood2000@gmail.com`)  
> **Team Members**: Rayan (Mobile & UX), Muatz (AI & Backend), Shima (Safety & Guardian)  
> **Evaluation Date**: Thursday, October 8, 2026  

---

## Submission Deliverables Quick Access

This directory contains the consolidated presentation, demonstration, and evaluation artifacts for the Ai4LY National Codathon 2026 jury:

### 1. Presentation Deck (Scope D)
* **PowerPoint Presentation (16:9 Widescreen)**: [`PITCH_DECK.pptx`](PITCH_DECK.pptx) (68 KB)
  * 5 structured slides in native Arabic RTL typography with system diagrams and impact metrics.
* **Interactive Web Pitch Deck**: [`PITCH_DECK.html`](PITCH_DECK.html) (18.7 KB)
  * Browser-renderable slide deck with slide navigation controls.
* **Speaker Script & Delivery Guide**: [`PITCH_DECK.md`](PITCH_DECK.md) (7.5 KB)
  * Timed 5-minute presentation script with minute-by-minute speaking cues.

### 2. Demonstration Video (Scope D)
* **Prototype Walkthrough Video**: [`jisr-flow-demo.mp4`](jisr-flow-demo.mp4) (1.19 MB)
  * Live recording demonstrating the end-to-end user flow: chip selection, optional text entry, Guardian crisis detection bypass, 3-tone draft generation, and native WhatsApp share sheet handoff.

### 3. Comprehensive Project Overview (Scope D / C)
* **Full Project Overview PDF**: [`Jisr_Full_Project_Overview.pdf`](Jisr_Full_Project_Overview.pdf) (319 KB)
  * Formatted complete project dossier including problem statement, architecture, ethical guardrails, and technical evaluation.

### 4. Technical Defense & Evaluation Q&A (Scope D)
* **Committee Defense Playbook**: [`COMMITTEE_QA.md`](COMMITTEE_QA.md) (10.7 KB)
  * 11 prepared answers to key jury questions covering chatbot differentiation, data privacy, clinical boundary protection, how recall was measured, the APK, AI vs template, and minors.

### 5. Requirements Compliance Checklist
* **Official Compliance Audit**: [`SUBMISSION_CHECKLIST.md`](SUBMISSION_CHECKLIST.md)
  * 1-to-1 mapping verifying compliance against every requirement in [`docs/codathon_submission_requirements.md`](../docs/codathon_submission_requirements.md).

---

## Fast-Track Evaluation Guide for the Jury

| What You Want to Evaluate | Fastest Method | Execution Command |
|---|---|---|
| **Evaluate in Web Browser** | Instant Next.js 16 Web Showcase | `npm run dev` -> Open [http://localhost:3000](http://localhost:3000) |
| **Evaluate on Physical Android** | Install Standalone Pre-compiled APK | Sideload [`builds/jisr-v1.0.0.apk`](../builds/jisr-v1.0.0.apk) |
| **Verify All Safety & Unit Tests** | Master Test Harness | `npm test` (**450 passed, 0 failed**) |
| **Inspect Technical Report** | Comprehensive Markdown Report | Read [`REPORT.md`](../REPORT.md) (35 KB) |
| **Inspect Third-Party Citations** | Academic & Library Attributions | Read [`CITATIONS.md`](../CITATIONS.md) |
| **Inspect Live Cloud API** | Interactive Swagger / OpenAPI Docs | Visit [https://jisr-api.onrender.com/docs](https://jisr-api.onrender.com/docs) |

---

## Directory Index
```
submission/
├── README.md                      # This evaluation overview
├── SUBMISSION_CHECKLIST.md        # Official 1-to-1 compliance audit
├── PITCH_DECK.pptx                # Standalone 16:9 widescreen presentation deck
├── PITCH_DECK.html                # Interactive browser slide deck
├── PITCH_DECK.md                  # Timed 5-minute speaker script
├── COMMITTEE_QA.md                # 7 prepared jury defense responses
├── jisr-flow-demo.mp4             # 1.19 MB working prototype walkthrough video
└── Jisr_Full_Project_Overview.pdf # 319 KB complete project dossier
```
