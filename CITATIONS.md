# 📚 Tool, Model & Service Citations

> **Requirement Compliance**: Ai4LY National Codathon 2026 — Participation Terms & Requirements §4 [T§4]  
> *"The use of open-source models, APIs, and modern frameworks is permitted, provided that all tools, models, and services used are explicitly cited in the project documentation."*

This document provides complete, transparent attribution for all third-party models, APIs, libraries, and frameworks utilized in the **Jisr (Bridge Note)** project.

---

## 1. Large Language Models & AI Services

### Google Gemini API
* **Provider**: Google DeepMind / Google AI Studio
* **Models Evaluated/Used**:
  * `gemini-1.5-flash` / `gemini-2.0-flash`
* **Purpose**:
  1. Restructuring unstructured free-text into situation, impact, and implicit needs.
  2. Adapting message tone across 3 distinct registers (gentle, direct, formal) for 5 recipient types.
  3. High-recall safety classification in Arabic natural language alongside local keyword filtering.
* **Citation**:
  > Gemini Team, Google. (2024). *Gemini: A Family of Highly Capable Multimodal Models*. arXiv:2312.11805.
* **License & Terms**: Google AI Studio Terms of Service. Data processed in accordance with stateless API policies (no model training on customer API prompts).

### Groq Cloud (Llama 3.3 / Gemma 2 Inference)
* **Provider**: Groq, Inc.
* **Model Used as High-Speed Alternative/Fallback**: `llama-3.3-70b-versatile` (Meta AI)
* **Purpose**: High-throughput Arabic draft generation and dialect processing.
* **Citation**:
  > Meta AI. (2024). *The Llama 3 Herd of Models*. arXiv:2407.21783.
* **License**: Llama 3.3 Community License Agreement.

---

## 2. Mobile Client Frameworks & Build Tooling

### React Native & Expo
* **Provider**: Meta Open Source & 650 Industries, Inc. (Expo)
* **Purpose**: Cross-platform mobile application development targeting standalone Android APK distribution and universal web execution.
* **Citation**:
  > Expo Team. (2024). *Expo: The React Native Framework*. https://expo.dev  
  > Meta Open Source. (2024). *React Native: Learn once, write anywhere*. https://reactnative.dev
* **Key Modules**:
  * `expo` (SDK 51): Managed mobile runtime and native build tooling.
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

---

## 3. Backend & Deployment Infrastructure

### FastAPI
* **Provider**: Sebastián Ramírez (tiangolo)
* **Purpose**: High-performance, modern asynchronous Python web framework providing stateless API endpoints (`/api/check-risk`, `/api/generate-drafts`, `/api/faithfulness`) with strict Pydantic schema validation.
* **Citation**:
  > Ramírez, S. (2018). *FastAPI: High performance, easy to learn, fast to code, ready for production*. https://fastapi.tiangolo.com
* **Key Modules**:
  * `fastapi` (>=0.115): ASGI web framework with strict Pydantic v2 data validation schemas.
  * `httpx` (>=0.27): Asynchronous HTTP client for Gemini and Groq model inferences.
* **License**: MIT License.

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

### Ai4LY Synthetic Crisis Benchmark
* **Curator**: Jisr Team (Libyan Arabic Localization)
* **Description**: A team-maintained dataset of 25 synthetic Arabic, Libyan dialect, Latin-transliterated, and euphemistic expressions designed for measuring recall and false-alarm rates without using real crisis data from vulnerable individuals.
* **Ethical Standard**: In accordance with lecture requirements [L§3], no real personal crisis text was scraped, stored, or exposed.
