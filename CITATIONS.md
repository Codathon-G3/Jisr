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

## 2. Mobile Client Frameworks & Libraries

### React Native & Expo
* **Provider**: Meta Open Source & 650 Industries, Inc. (Expo)
* **Purpose**: Cross-platform mobile application development targeting Android and iOS with native performance.
* **Key Modules**:
  * `expo`: Managed runtime and build tooling.
  * `react-native`: Core mobile UI primitives.
  * `@react-native-async-storage/async-storage`: Sandboxed, local on-device persistence for optional private chip history.
  * `expo-sharing` / React Native `Share`: Native operating system share sheet integration for WhatsApp, Messenger, and Telegram.
* **License**: MIT License.

---

## 3. Backend & Deployment Infrastructure

### Next.js / Node.js
* **Provider**: Vercel, Inc. & OpenJS Foundation
* **Purpose**: Serverless API routes (`/api/check-risk`, `/api/generate-drafts`) providing a secure boundary between client devices and model provider keys.
* **License**: MIT License.

### Vercel Serverless Platform
* **Provider**: Vercel, Inc.
* **Purpose**: Cloud hosting and edge deployment for backend API endpoints.
* **Terms**: Free Hobby / Developer Tier.

---

## 4. Safety & Linguistic Datasets

### Ai4LY Synthetic Crisis Benchmark
* **Curator**: Jisr Team (Libyan Arabic Localization)
* **Description**: A team-maintained dataset of 25 synthetic Arabic, Libyan dialect, Latin-transliterated, and euphemistic expressions designed for measuring recall and false-alarm rates without using real crisis data from vulnerable individuals.
* **Ethical Standard**: In accordance with lecture requirements [L§3], no real personal crisis text was scraped, stored, or exposed.
