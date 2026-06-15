# Wuduh (وضوح) — Design System

> **Wuduh** means *clarity* in Arabic. It's a card-based web tool that guides first-time founders in Saudi Arabia and the GCC through building a professional feasibility study — one question at a time. Founders answer cards, complete them, and export an investor-ready document at the end.

**The one feeling this brand must give:** a founder looks at Wuduh and thinks — *"this will make me look serious."*

This system was created from a brand brief. There was **no existing codebase or Figma file** — everything here (logo, palette, type, motif, components, UI kit) is original to this project.

---

## Brand personality

Trustworthy, structured, empowering. **Not** corporate, **not** playful. The feeling of a seasoned mentor sitting next to a nervous founder saying *"let's figure this out together."* Calm confidence. Professional without being cold. At home in Saudi Arabia and the GCC, while internationally credible.

**Audience:** first-time founders in KSA & the GCC — young, ambitious, digitally native, Arabic- and English-speaking. Arabic is treated as a first-class language, never an afterthought translation.

**Deliberately avoided:** generic SaaS blue, rocket ships / lightbulbs / startup clichés, anything Western-first.

---

## CONTENT FUNDAMENTALS — how Wuduh writes

The voice is the mentor: warm, direct, never patronising, never hype.

- **Person:** "we" + "you" — *"Let's figure this out, together."* / *"When you're done, **we'll** assemble your answers."* Wuduh is a companion in the room, not a faceless platform.
- **Tone:** calm and reassuring, with quiet authority. Reduces anxiety (*"There are no wrong answers here, only clearer ones."*) while holding a high bar (*"a feasibility study you'll be proud to send"*).
- **Casing:** Sentence case for everything — headlines, buttons, labels. No Title Case, no ALL-CAPS prose. The only uppercase is the **mono eyebrow/label** style (e.g. `MARKET · QUESTION 04`), used as a structural signpost, set in IBM Plex Mono with wide tracking.
- **Length:** short. One idea per card. Questions are a single sentence; helper text is one supportive line (*"One clear segment beats three vague ones — we'll size it next."*).
- **Numbers & specificity:** encourage defensible specifics over vague claims. Money is shown as `SAR 1,250,000`; counts as mono (`04 / 12`).
- **Imperatives are gentle:** "Start your study", "Done — next card", "Skip for now", "Finish & assemble". Buttons describe the *outcome*, not the mechanism.
- **No emoji.** Ever. Warmth comes from words and typography, not decoration.
- **Bilingual parity:** Arabic copy carries the same calm-mentor register — e.g. *«وضوح في كل خطوة»* / *«أجب عن سؤال واحد في كل بطاقة»*. Never machine-literal.

---

## VISUAL FOUNDATIONS

The whole system is built around **clarity emerging from structure**.

### Color
- **Navy `#0D1B2A` is dominant** — the canvas for hero moments, the export document header, marketing. It carries depth and trust. (`tokens/colors.css`, ramp `--navy-50…950`.)
- **Gold `#C9A84C` is the accent, used sparingly** — it marks *the* moment of clarity: the single key CTA on a screen, progress completion, the focal point of the logo. Never a background fill, never two golds competing on one view.
- **Teal `#0D9488` supports** — progress, completion checks, the affirming "you did it" second voice.
- **Slate neutrals lean navy** (cool greys), plus a warm **paper `#FAF7F0`** surface reserved for the *exported feasibility document*, which should feel like a printed report.
- Semantic colors are **warm-fit** (danger is a brick `#C0492F`, not a fire-engine red) so nothing breaks the composed palette.

### Typography — the IBM Plex superfamily
A single superfamily designed to work in Arabic and Latin together; modern, precise, intentional.
- **IBM Plex Serif** — display & headlines. Editorial gravitas; this is what makes the product *feel like a serious document*.
- **IBM Plex Sans** — UI and body. The steady working voice.
- **IBM Plex Sans Arabic** — Arabic, at full parity with Latin.
- **IBM Plex Mono** — eyebrows, step counts (`04 / 12`), money, metadata. The "structured signpost" voice.

See `tokens/typography.css`. Scale runs 11 → 84px; display sizes use the serif, text uses the sans.

### The motif — the octagon-and-star net
A precise geometric line lattice (a rounded square crossed with a rotated square = an 8-point star), rooted in Islamic geometric tradition — so it feels native to the GCC and internationally credible at once. It appears as:
- a quiet gold net on navy (hero / marketing surfaces),
- a faint navy watermark on paper (export documents),
- the construction logic of the **logo mark** itself.
Source: `assets/wuduh-pattern.svg`; live examples in the *Geometric motif* and *Mobile card UI* brand cards.

### Logo
A precise **architectural arch** — a clean doorway with a gold pillar of light beyond it — the *threshold* a founder crosses on the way to investors. It speaks to clarity and structure with no startup cliché, and holds as an app icon down to 32px (stroke weight 7.8). The **wordmark leads**: *Wuduh* set in IBM Plex Serif SemiBold, owning its space; the mark is its compact companion. Files in `assets/`: `wuduh-mark.svg`, `wuduh-mark-ondark.svg`. Three explored directions (Convergence, Threshold, Waw) are preserved in `assets/logo-options.html`. Wordmark lockups (English *Wuduh* in Plex Serif, Arabic *وضوح* in Plex Sans Arabic) live in the brand cards.

### Surfaces, depth & shape
- **Cards** are the atomic unit: white, `--radius-lg` (16px) for general cards, `--radius-xl` (22px) for the elevated **swipe cards** in the flow. 1px slate border on resting cards; borderless + soft shadow when raised.
- **Shadows** are navy-tinted, soft, low-spread — *trust, not flash*. Six steps (`--shadow-xs…xl` + `--shadow-gold`). No harsh black drop shadows.
- **Radii** are calm and precise; only controls/pills go fully round. Nothing is bubbly.
- **Borders:** 1px hairlines for structure; 1.5px on interactive controls. On navy, borders are a low-opacity light tint.

### Motion
Calm confidence — **no bounce.** Standard ease-out `cubic-bezier(0.22,0.61,0.36,1)`; durations 140 / 220 / 360ms. Progress fills glide; cards lift 2px on hover. Respect `prefers-reduced-motion`.

### Interaction states
- **Hover:** primary buttons darken one navy step; accent gold lightens + gains a soft gold shadow; ghost/secondary pick up a faint slate/navy-50 wash. Cards lift 2px with a deeper shadow.
- **Press/active:** translateY(1px). Quiet, physical, not shrinky.
- **Focus:** 3px gold focus ring (`--focus-ring`, gold @ 45%) — the accent does double duty as the focus signal.
- **Disabled:** reduced opacity, no pointer.

### Imagery
Photography (when used) should be warm, human, and grounded — real founders, real workspaces in the region — never cool stock-tech. Most surfaces lean on the geometric net + typography rather than photography.

---

## ICONOGRAPHY

- **Icon set: [Lucide](https://lucide.dev)** — 2px stroke, rounded joins/caps. Its calm, even, precise line quality matches the brand; it pairs naturally with IBM Plex. Load from CDN (`https://unpkg.com/lucide@latest`) or inline the SVGs (as the components and UI kit do). **This is a substitution flag:** no brand icon set existed, so Lucide was chosen as the closest fit — swap it if you adopt a house set.
- **Stroke weight:** 2px standard; 2.2–2.4px for small glyphs inside dense controls (checkmarks, chevrons) so they stay legible.
- **The brand mark** is the only custom-drawn vector; everything else is Lucide.
- **No emoji**, and no Unicode characters pressed into service as icons.
- **Sizing:** icons inherit `1em`/`1.15em` of the control they sit in; standalone icons 16 / 18 / 22px to match button sizes.

---

## INDEX — what's in this system

**Root**
- `styles.css` — the single entry point consumers link. Imports only.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css` (spacing, radii, shadows, motion, layout).
- `assets/` — logo mark (light/dark), geometric pattern, and the **Brand** specimen cards (logo on light/dark, mark, Arabic wordmark, motif, mobile card UI).
- `guidelines/` — foundation specimen cards: **Colors** (navy/gold/teal/neutral/semantic), **Type** (display/body/arabic/mono/scale), **Spacing** (scale/radii/elevation).
- `SKILL.md` — packaging so this system works as a downloadable Claude Skill.

**Components** (`components/`) — namespace `window.WuduhDesignSystem_971755`
- `buttons/` — `Button` (primary · accent · secondary · ghost · danger), `IconButton`
- `forms/` — `Input`, `Textarea` (with counter), `Checkbox` (+ radio-style)
- `display/` — `Card`, `Badge`, `Avatar`
- `progress/` — `ProgressBar`, `ProgressStepper`
Each directory has a `.d.ts` contract, a `.prompt.md` usage note, and a `*.card.html` specimen.

**UI kits** (`ui_kits/`)
- `wuduh-app/` — clickable click-through of the product: **Start → answer cards → export**. `index.html` assembles `screens.jsx`, which composes the component primitives.

> **Note on fonts:** IBM Plex is loaded from Google Fonts (`tokens/fonts.css`). No binaries are shipped for offline use — see CAVEATS in the handoff if you need self-hosted `.woff2` files.
