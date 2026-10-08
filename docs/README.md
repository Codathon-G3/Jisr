# Jisr Project Documentation Index

> **Purpose**: Master index for all markdown files, engineering specifications, safety datasets, and competition materials in the `Jisr` repository.

---

## Documentation Map

```
Jisr/
├── README.md                      # [Root] Main project & architecture overview (Submission Portal)
├── REPORT.md                      # [Root] Comprehensive Technical Report (Submission Deliverable 3)
├── CITATIONS.md                   # [Root] Tool, model & framework citations (Submission Requirement)
├── submission/                    # [Root] Official Codathon 2026 Submission Deliverables Package
│   ├── README.md                  # Evaluator submission portal & fast-track pathways
│   ├── SUBMISSION_CHECKLIST.md    # Official 1-to-1 compliance audit against Codathon requirements
│   ├── PITCH_DECK.pptx            # 16:9 widescreen PowerPoint presentation deck
│   ├── jisr-flow-demo.mp4         # Working prototype walkthrough video (1.19 MB)
│   ├── Jisr_Full_Project_Overview.pdf # Formatted complete project dossier (319 KB)
│   ├── PITCH_DECK.html & .md      # Interactive web deck & timed speaker script
│   └── COMMITTEE_QA.md            # 7 prepared technical defense responses
└── docs/                          # Dedicated project engineering documentation folder
    ├── README.md                  # This document (Documentation Table of Contents)
    ├── PITCH_DECK.md              # 5-Slide presentation script for Thursday's evaluation
    ├── COMMITTEE_QA.md            # Committee defense playbook & expected Q&A answers
    ├── master_implementation_plan.md # 10-Stage full pipeline from product definition DOCX
    ├── codathon_submission_requirements.md # Ai4LY official requirements checklist
    ├── scripts/                       # Presentation tools (generate_pitch_deck.py)
    └── team_plan/                 # The 4-Person implementation workstreams
        ├── README.md              # Team sprint dashboard & 24h timeline
        ├── 00_SHARED_SETUP.md     # Shared decisions, Git rules, & API data contracts
        ├── 01_PERSON_1_FRONTEND.md# Mobile App & UI engineer roadmap
        ├── 02_PERSON_2_AI_BACKEND.md# AI Core & Backend API engineer roadmap
        ├── 03_PERSON_3_SAFETY.md  # Safety, Guardian Layer & benchmark roadmap
        ├── 04_PERSON_4_DOCS_ARABIC.md# Trust views, Arabic review & presentation roadmap
        ├── 05_INTEGRATION_AND_TESTING_PROTOCOL.md # Joint testing & curl verification guide
        └── starter_data/          # Drop-in JSON assets
            ├── ar.json            # Complete Arabic localization dictionary
            ├── plain-templates.json# 15 Offline fallback & baseline templates
            ├── support-card.json  # Fixed support card & ethical disclaimer
            ├── crisis-phrases.json# Libyan dialect crisis keyword database
            ├── forbidden-terms.json# Output filter medical blacklist
            └── test-set.json      # 25 Synthetic benchmark evaluation cases
```

---

## How These Documents Lead to Completion

1. **For Team Execution (Right Now)**:
   * Each teammate opens their numbered guide in `docs/team_plan/` and builds their components independently without blocking each other.
   * Integration happens at Hour 8 using `docs/team_plan/05_INTEGRATION_AND_TESTING_PROTOCOL.md`.
2. **For Submission (Wednesday 11:50 PM)**:
   * Source code lives in `App.tsx` and `src/` (mobile app, with the Next.js web showcase in `src/app/`), `backend/` (FastAPI) and `safety/` (Guardian Layer data and checks).
   * The product definition every requirement traces back to is [`Bridge_Note_Product_Definition.pdf`](Bridge_Note_Product_Definition.pdf); the code review against it is [`REVIEW_REPORT.md`](REVIEW_REPORT.md).
   * `README.md` at the root serves as the repository entry point.
   * `REPORT.md` at the root satisfies the detailed technical report requirement.
   * `CITATIONS.md` satisfies the third-party models and tools disclosure rule [T§4].
   * The repository URL is submitted on the Discord/portal.
3. **For Presentation & Defense (Thursday)**:
   * `docs/PITCH_DECK.md` provides the exact 5-slide slides and 5-minute script.
   * `docs/COMMITTEE_QA.md` equips the team to answer all tough evaluator questions with confidence.
