Jisr (جسر, "bridge") helps young people in Libya write the first message to someone they trust. Everything about the brand should feel like a quiet place to sit before crossing: calm, warm, private, and never in a hurry. It is friendly without being playful, and supportive without being clinical.

## Voice

Write Arabic first, in plain, warm Arabic that a Libyan teenager would actually say; English is a secondary layer. Speak to the person as "you" (أنت), and let Jisr speak as itself only in suggestions.

- Do: short sentences, permission instead of instruction ("يمكنك…" "you can…"), name feelings gently, always offer a way out ("ليس الآن" — "not now").
- Don't: exclamation marks, emoji, clinical labels, streaks, guilt, or urgency — except in the safety banner, where clarity beats softness.
- Real copy: primary action "اكتب أول رسالة" (Write the first message); reassurance "محفوظة على جهازك فقط" (Saved on your device only); AI hint "اقتراح من جسر: ابدأ بما تشعر به" (A suggestion from Jisr: start with how you feel).

## Colour

Five families, each with one job. Keep screens mostly `surface` and `surface-raised` (about 70%), then green (about 15%), wood and navy (about 10%), lavender (5% or less).

- **Green** (`green`, `green-soft`, `on-green`): calm and growth. The primary action, selection and progress. At most one green button per screen.
- **Wood** (`wood`, `wood-soft`): the bridge itself — warmth and connection. Use for the person being written to (the "To" strip on a note), secondary emphasis and illustration. Never for a primary button.
- **Navy** (`navy`, `on-navy`, and `ink`): trust and night. `ink` is a deep navy, so all text already carries it; `navy` is a fill for headers, hero bands and the cover. Text on it is `on-navy`.
- **Lavender** (`lavender`, `lavender-soft`): reserved for Jisr's own voice — AI suggestions, rewrites, hints. If lavender appears, the AI said it. Nothing else uses it, so people can always tell their words from the machine's.
- **Urgent** (`urgent`, `urgent-soft`, `on-urgent`): safety only. The "reach out now" banner and the crisis button, always with words and an icon, never colour alone.

Two themes: **Day** and **Night**. Many hard messages are written late, so Night is a first-class theme, not an afterthought; follow the system setting. Every text token's note names the grounds it reads on; all pairs meet WCAG AA in both themes. Text on a coloured fill uses its `on-…` token, never literal white. Keyboard focus is `focus-ring`: a 2px page-colour gap then 2px of solid green.

## Type

- Headlines in **Readex Pro** (`display`, `title`, `heading`); everything else in **IBM Plex Sans Arabic** (`body`, `body-sm`, `label`, `caption`). Both are free on Google Fonts and cover Arabic and Latin.
- Layouts are right-to-left by default (`dir="rtl"`); mirror icons that imply direction.
- Arabic needs room: never set reading text below 15px or line height below 1.6. Message drafts use `body` at 17px.
- Sentence case in English; no all-caps anywhere.

## Shape, space and motion

- The motif is the **arch**. Corners are generous: `radius-md` for buttons and banners, `radius-lg` for cards and sheets, `radius-full` for chips. Nothing is sharp.
- Space is generous: `space-4` side margins on mobile, `space-6` inside cards, `space-8` between sections. One idea per screen.
- Elevation is barely there (`shadow-sm` on cards, `shadow-lg` on sheets); prefer a tint (`surface-sunken`, a `-soft` colour) over a shadow.
- Motion is slow and soft: 200–300ms ease-out fades and rises, no bounce, no confetti. Respect reduced-motion and drop to instant changes.

## Logo

The logo is the team's Arabic wordmark جسر, with a bridge drawn into the word. Set it in `ink` or `green` on `surface`, in `on-navy` on `navy`, and keep clear space of at least the height of the bridge arch around it. It is not yet uploaded to this system — until it is, set the name in Readex Pro and never redraw the mark.

## Iconography

Rounded line icons, 1.75px stroke, 24px grid, drawn in `currentColor` so they take the text colour. The Phosphor "regular" set fits the soft, arched shapes; this is a suggested match, not yet part of the system. No emoji in the interface.


---

## Consuming this system (generated — do not edit)

Every path named below is under `project/` in this design system: read `project/api/tokens.md`, not `api/tokens.md`.

3 components are documented without a runnable `components/bundle.js`: read each component’s card, and its README where it has one (`components/<Comp>/README.md`), and build to those guidelines. Tokens: the values are on `api/tokens.md`; a Slides deck or Design canvas also takes `tokens.json` by file path.

**Read, per thing:** a component’s props, parts and examples: `api/components/<Comp>.md`; token values: `api/tokens.md`. After this README, fetch the cards and fonts you need in ONE message as parallel calls — none depends on another.

**Two rules.** Before you use a thing — a component, a token group, an icon, an asset — read its card from the index below; a value you did not read from a card is a guess. `tokens.json`, `manifest.json` and `design-system.json` are sources for tools: hand them over. `components/<Comp>/README.md` is the long-form second read a card links to; `SKILL.md` and `artifact-type/` beside them are authoring guidance, not needed to consume the system.

## Index (generated — do not edit)

**Tokens**

- `api/tokens.md` — Every token: surface, text, fill, palette, type, spacing, radius, shadow. (6.9k)

**Components** (`api/components/<Comp>.md`, 3)

- **Actions**: `Button` — Calm by default: one green primary per screen for the step the screen is for, everything else plain or quiet
- **Writing**: `NoteCard` — The draft of the first message, shown before the person sends it
- **Safety**: `SafetyBanner` — Shown when Jisr's safety layer detects risk: the one place the brand drops softness for clarity
