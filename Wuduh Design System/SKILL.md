---
name: wuduh-design
description: Use this skill to generate well-branded interfaces and assets for Wuduh (وضوح) — a card-based feasibility-study tool for first-time founders in Saudi Arabia and the GCC — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation
- **Brand feeling:** calm-mentor clarity. Trustworthy, structured, empowering. Never corporate, never playful. The test: *"this will make me look serious."*
- **Tokens:** `styles.css` → `tokens/*.css`. Navy `#0D1B2A` dominant, gold `#C9A84C` accent (sparingly), teal `#0D9488` support; IBM Plex superfamily (Serif display, Sans UI, Sans Arabic, Mono labels).
- **Motif:** octagon-and-star geometric net (`assets/wuduh-pattern.svg`) — gold on navy, faint navy on paper.
- **Logo:** `assets/wuduh-mark.svg` (light bg), `assets/wuduh-mark-ondark.svg` (dark bg).
- **Components:** `components/<group>/` — bundle exposed at `window.WuduhDesignSystem_971755`. Link `styles.css`, load `_ds_bundle.js`, then `const { Button, Card, ProgressStepper, ... } = window.WuduhDesignSystem_971755`.
- **UI kit:** `ui_kits/wuduh-app/` — the start → cards → export flow.
- **Voice:** sentence case, "we + you", one idea per card, no emoji, Arabic at full parity.
