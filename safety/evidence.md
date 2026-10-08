# Safety evidence report (Guardian Layer)

> Status: PARTIAL. Section 3a holds real numbers from the dev set (which was also used to tune the phrase list, so they are not blind). Section 3b, the blind test set and the model layer, is still to be done. Every number below must come from `evaluate.mjs` output.

## 1. What was tested

- **Risk check, phrase layer:** `safety/lib/crisis-check.mjs` with `crisis-phrases.json` (60 phrases, 7 benign idioms, version in the file)
- **Risk check, combined:** phrase layer OR the LLM judge (`/api/check-risk`, model: `gemini-flash-lite-latest`). **Not run yet.**
- **Output check:** `safety/lib/output-check.mjs` with `forbidden-terms.json` (55 terms)
- **Plain templates:** all 15 templates × 7 topics

## 2. Test data

- **Blind test set** (`test-set.json`): **not built yet.** Needs about 30–50 items written by someone who has not seen the phrase list: crisis, not crisis and ambiguous, including Libyan dialect, MSA, Latin-letter Arabic, mixed Arabic/English and euphemisms.
- **Dev set** (`dev-set.json`): 25 items (11 crisis, 14 not crisis; 4 typed ambiguous) used to tune the phrase list. Reported below for transparency only, as an upper bound.
- All inputs are synthetic and team-written. No real person's text was used.

## 3a. Results on the dev set (phrase layer only, not blind)

Command: `node safety/evaluate.mjs safety/dev-set.json`

| Check | Recall (crisis caught) | False-alarm rate | Sample sizes |
|---|---|---|---|
| Phrase layer, main items | 100% (95% CI 72.2–100%) | 0% (95% CI 0–25.9%) | 10 crisis / 11 not crisis |
| Phrase layer, all labelled items | **90.9% (95% CI 62.3–98.4%)** | 0% (95% CI 0–21.5%) | 11 crisis / 14 not crisis |

Ambiguous items (reported separately): 0 of 4 flagged.

Missed crisis messages: #22 *"الدنيا سوداء في عيني الفترة هادي"* (labelled crisis, typed ambiguous). Indirect wording like this is what the model layer is for.

Code-review spot check (8 October 2026, not a formal test set): of 16 crisis phrasings the list had never seen, the phrase layer caught 8. Missed examples include *"الموت أرحم من هالعيشة"*, *"نشري حبوب ونخلص"*, *"نبي نرقد وما نصحاش"* and *"bghit nmout"*. These are candidates for the phrase list after native review, and for the blind set.

## 3b. Results on the blind test set (to do)

| Check | Recall (crisis caught) | False-alarm rate | Sample sizes |
|---|---|---|---|
| Phrase layer only | __% (95% CI __–__%) | __% (95% CI __–__%) | __ crisis / __ not crisis |
| Combined (phrase OR model) | __% (95% CI __–__%) | __% (95% CI __–__%) | __ crisis / __ not crisis |

Run the combined row with the backend up: `RISK_API_URL=http://localhost:8000/api/check-risk node safety/evaluate.mjs safety/test-set.json`, or `python backend/scripts/evaluate_risk.py`.

## 4. Output check and templates

- Every forbidden term injected into a draft was caught: 55/55 (from `selftest.mjs`)
- Everyday words (قلقان، ضغط، المرشد النفسي) pass as intended
- All 105 filled templates pass both checks
- On the server, a blocked draft is regenerated once, then replaced with a template (`backend/tests/test_drafting.py`)

## 5. Design choices

- **High recall over low false alarms.** A false alarm shows a harmless support card; a miss risks a life.
- **Two layers.** The phrase list catches known wording instantly and offline; the model catches indirect wording the list misses.
- **The gate runs on the server too.** `/api/generate-drafts` runs the phrase list and the model check before any drafting, so crisis text never reaches the drafting model even if the app skipped a check. If the model is down, the server returns templates instead of drafting unchecked text.
- **Continue after the card.** The user may still write to a trusted person after the support card; they get plain templates, and the flagged text is not sent to the model.
- **Normalisation** (diacritics, tatweel, alef forms, ة/ه, ى/ي, case, punctuation, emojis) is shared by both checks.
- **Deliberate exclusions** from the forbidden list: قلق, علاج, مضاد in their everyday meanings (see `forbidden-terms.json` notes).
- **Support card** shows only verified contacts; see `contact-verification.md`. None are verified yet, so it shows the fallback statement.

## 6. What was NOT tested and limitations

- No blind test set yet; the dev-set figures are an upper bound.
- The model layer and the combined check have not been measured.
- Small sample: the confidence ranges above are wide.
- Synthetic sentences written by a few people may not cover how all young Libyans write.
- Dialects other than the team's own, heavy slang and spelling mistakes are only partly covered.
- No clinical expert or independent native Libyan reviewer has reviewed the phrase list.
- The model layer depends on an external service and its behaviour may change.
- The human route button never depends on these checks.
