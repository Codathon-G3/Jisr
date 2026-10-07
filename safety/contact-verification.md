# Support contact verification log

Rule: a contact appears on the support card only after a named team member has confirmed it directly.
If none is verified by the hour-8 checkpoint, the card shows `fallbackMessage_ar` only.

| Organisation | Contact checked | Method (call / official page / email) | Result | Checked by | Date and time |
|---|---|---|---|---|---|
| Libyan Red Crescent, psychosocial support | | | pending | | |

## Decision at hour 8

- [ ] At least one contact verified → moved to `contacts` in `support-card.json` with `verifiedBy`, `verifiedOn`, `method`
- [ ] None verified → fallback text only (no number shown)
