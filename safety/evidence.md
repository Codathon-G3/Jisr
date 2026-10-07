# Safety evidence report (Guardian Layer)

> Status: TEMPLATE. Fill in after running the blind test set. Every number below must come from `evaluate.mjs` output.

## 1. What was tested

- **Risk check, phrase layer:** `safety/lib/crisis-check.mjs` with `crisis-phrases.json` (N phrases, version X)
- **Risk check, combined:** phrase layer OR the LLM judge (`/api/check-risk`, model: ____)
- **Output check:** `safety/lib/output-check.mjs` with `forbidden-terms.json` (N terms)
- **Plain templates:** all 15 templates × 7 topics

## 2. Test data

- **Blind test set** (`test-set.json`): __ items written by ____, who had not seen the phrase list. __ crisis, __ not crisis, __ ambiguous. Includes Libyan dialect, MSA, Latin-letter Arabic, mixed Arabic/English, euphemisms.
- **Dev set** (`dev-set.json`): 25 items used to tune the phrase list. **Not used for reported figures.**
- All inputs are synthetic and team-written. No real person's text was used.

## 3. Results (blind test set)

| Check | Recall (crisis caught) | False-alarm rate | Sample sizes |
|---|---|---|---|
| Phrase layer only | __% (95% CI __–__%) | __% (95% CI __–__%) | __ crisis / __ not crisis |
| Combined (phrase OR model) | __% (95% CI __–__%) | __% (95% CI __–__%) | __ crisis / __ not crisis |

Ambiguous items (reported separately): __ of __ flagged.

Missed crisis messages (for transparency): list them here.

## 4. Output check and templates

- Every forbidden term injected into a draft was caught: __/__ (from `selftest.mjs`)
- Everyday words (قلقان، ضغط، المرشد النفسي) pass as intended
- All 105 filled templates pass both checks

## 5. Design choices

- **High recall over low false alarms.** A false alarm shows a harmless support card; a miss risks a life.
- **Two layers.** The phrase list catches known wording instantly and offline; the model catches indirect wording the list misses.
- **Normalisation** (diacritics, tatweel, alef forms, ة/ه, ى/ي, case, punctuation, emojis) is shared by both checks.
- **Deliberate exclusions** from the forbidden list: قلق, علاج, مضاد in their everyday meanings (see `forbidden-terms.json` notes).
- **Support card** shows only verified contacts; see `contact-verification.md`.

## 6. What was NOT tested and limitations

- Small sample: the confidence ranges above are wide.
- Synthetic sentences written by a few people may not cover how all young Libyans write.
- Dialects other than the team's own, heavy slang and spelling mistakes are only partly covered.
- No clinical expert reviewed the phrase list.
- The model layer depends on an external service and its behaviour may change.
- The human route button never depends on these checks.
