# Tool, Model & Service Citations

> **Requirement Compliance**: Ai4LY National Codathon 2026 — Participation Terms & Requirements §4 [T§4]  
> *"The use of open-source models, APIs, and modern frameworks is permitted, provided that all tools, models, and services used are explicitly cited in the project documentation."*

This document provides complete, transparent attribution for all third-party models, APIs, libraries, and frameworks utilized in the **Jisr (Bridge Note)** project.

---

## 1. Large Language Models & AI Services

### Google Gemini API
* **Provider**: Google DeepMind / Google AI Studio
* **Model Used**: `gemini-flash-lite-latest` (default of `GEMINI_MODEL` in `backend/app/config.py`; the only model the backend calls).
* **Purpose**:
  1. Restructuring unstructured free-text into situation, impact, and implicit needs.
  2. Adapting message tone across 3 distinct registers (gentle, direct, formal) for 5 recipient types.
  3. High-recall safety classification in Arabic natural language alongside local keyword filtering (the Guardian gate inside `/api/generate-drafts`, and `/api/check-risk`).
  4. Faithfulness alignment between the draft and the user's words (`/api/faithfulness`).
* **Citation**:
  > Gemini Team, Google. (2024). *Gemini: A Family of Highly Capable Multimodal Models*. arXiv:2312.11805.
* **License & Terms**: Gemini API Additional Terms of Service. On the paid tier, Google does not use prompts or responses to improve its products; on the free (unpaid) tier it may, and human reviewers may read them. Jisr sends only identifier-free text; a deployment for real users must use a paid-tier key.

> **Not used**: no Groq, Llama or other second model provider is called anywhere in the code. Earlier drafts of the documentation listed Groq / Llama 3.3 as a fallback; that was never implemented.

---

## 2. Mobile Client Frameworks & Build Tooling

### React Native & Expo
* **Provider**: Meta Open Source & 650 Industries, Inc. (Expo)
* **Purpose**: Cross-platform mobile application development targeting standalone Android APK distribution and universal web execution.
* **Citation**:
  > Expo Team. (2024). *Expo: The React Native Framework*. https://expo.dev  
  > Meta Open Source. (2024). *React Native: Learn once, write anywhere*. https://reactnative.dev
* **Key Modules**:
  * `expo` (the committed APK was built with SDK 51): Managed mobile runtime and native build tooling.
  * `react-native`: Core mobile UI primitives and RTL layout engine.
  * `@react-native-async-storage/async-storage`: Sandboxed, local on-device persistence for optional private chip history.
  * `expo-sharing` / React Native `Share`: Native operating system share sheet integration for WhatsApp, Messenger, and Telegram.
* **License**: MIT License.

### EAS Build (Expo Application Services)
* **Provider**: 650 Industries, Inc. (Expo)
* **Purpose**: Cloud and local build infrastructure for compiling and packaging the standalone Android APK (`builds/jisr-v1.0.0.apk`) with optimized package metadata (`com.ai4ly.jisr`).
* **Citation**:
  > Expo Team. (2024). *EAS Build: Compile native apps in the cloud or locally*. https://docs.expo.dev/build/introduction/
* **License / Terms**: Apache 2.0 / Expo Terms of Service.

### Next.js & React (Web Showcase)
* **Provider**: Vercel, Inc. & Meta Open Source
* **Purpose**: The browser version of Jisr in `src/app/` (`next`, `react`, `react-dom`).
* **Citation**:
  > Vercel. (2024). *Next.js: The React Framework*. https://nextjs.org  
  > Meta Open Source. (2024). *React*. https://react.dev
* **License**: MIT License.

### TypeScript
* **Provider**: Microsoft
* **Purpose**: Typed mobile source; also used by the test runners to transpile and test the shipped `.ts` modules.
* **Citation**: > Microsoft. *TypeScript*. https://www.typescriptlang.org
* **License**: Apache 2.0.

---

## 3. Backend & Deployment Infrastructure

### FastAPI
* **Provider**: Sebastián Ramírez (tiangolo)
* **Purpose**: High-performance, modern asynchronous Python web framework providing stateless API endpoints (`/api/check-risk`, `/api/generate-drafts`, `/api/faithfulness`) with strict Pydantic schema validation.
* **Citation**:
  > Ramírez, S. (2018). *FastAPI: High performance, easy to learn, fast to code, ready for production*. https://fastapi.tiangolo.com
* **Key Modules**:
  * `fastapi` (>=0.115): ASGI web framework with strict Pydantic v2 data validation schemas.
  * `httpx` (>=0.27): HTTP client for the Gemini API calls.
  * `pydantic` / `pydantic-settings` (>=2.0): request/response schemas and environment settings.
  * `python-dotenv` (>=1.0): loads `backend/.env` in development.
  * `pytest` (>=8.0): backend test suite.
* **License**: MIT License.

### Render (deployment configuration)
* **Provider**: Render Services, Inc.
* **Purpose**: Hosts the backend at `https://jisr-api.onrender.com` (free instance; configured in `backend/render.yaml`).
* **Terms**: Render Terms of Service.

### Uvicorn
* **Provider**: Encode OSS / Tom Christie
* **Purpose**: Lightning-fast ASGI web server implementation hosting the FastAPI application.
* **Citation**:
  > Christie, T. et al. (2017). *Uvicorn: The lightning-fast ASGI server*. https://www.uvicorn.org
* **License**: BSD-3-Clause License.

### GitHub Actions CI
* **Provider**: GitHub, Inc.
* **Purpose**: Automated CI workflow (`.github/workflows/build-apk.yml`) for automated testing, Android APK compilation, and release asset generation.
* **Terms**: Free Open-Source / Developer Tier.

---

## 4. Safety & Linguistic Datasets

### Jisr Team Dev Set (`safety/dev-set.json`)
* **Curator**: Jisr Team (Libyan Arabic Localization). This is the team's own data, not an official Ai4LY benchmark.
* **Description**: A team-maintained dataset of 25 synthetic Arabic, Libyan dialect, Latin-transliterated, and euphemistic expressions for measuring recall and false-alarm rates without using real crisis data from vulnerable individuals. It was also used to tune the phrase list.
* **Ethical Standard**: In accordance with lecture requirements [L§3], no real personal crisis text was scraped, stored, or exposed.

### Team-Written Safety Lists
* `safety/crisis-phrases.json` (60 phrases), `safety/forbidden-terms.json` (55 terms), `safety/plain-templates.json`, `safety/identifiers.json` (common Arabic and Latin-script given names used for identifier removal). All written by the team; no external dataset was copied.

---

## 5. AI-Assisted Development Tools

* **Cursor** (Anysphere, Inc.): AI coding assistant used during backend development (credited as co-author in the commit history).
* **Claude Code** (Anthropic): used on 8 October 2026 for a repository review, for the fixes listed in `docs/REVIEW_REPORT.md`, and to write the held-out evaluation sentences in `safety/heldout-set.json` (labelled as such in the file).
* Team: please add any other assistants used for code, text, translation or images (for example, the source of `public/brand/jisr-intro-mobile.png` and the pitch-deck visuals).
