# uncommon

A warm, playful, motion-rich showcase and a downloadable Claude skill for creating distinctive interactive websites. The product, skill name, install directory, and download are all `uncommon`.

## Run

```sh
npm install
npm run dev
```

## Verify

```sh
npm run build
npx tsc --noEmit
npx playwright install --with-deps chromium
node scripts/check-site.mjs
```

Set `CHROME_PATH` to use an already-installed Chromium instead of Playwright's download.

The browser check expects the development server at `http://localhost:5173`. Set `BASE_URL` to check a different preview or deployment. Screenshots, the actual downloaded skill ZIP, and check results are saved in `artifacts/`.

## What's Included

- A full-bleed warm cream hero with generous Fraunces typography and two original pixel-art friends, Daisy and Bean. They glance toward the pointer, blink, breathe, react to a named nudge control (Daisy spins and hops, Bean waves), and squeeze their eyes when tapped. A matching still PNG covers initial loading.
- Six original live experiments: kinetic text, a repelling particle field, an elastic photographic deck, a reveal lens, a scroll-linked tunnel, and an SVG shape morph.
- Working filters, keyboard-operated tabs, expandable live experiments, and copyable motion recipes.
- A ten-file Claude skill of over 10,000 words, a built-in file reader, a real `uncommon.zip` download, and installation instructions for Claude Code and Claude.ai.
- A sourced research workflow covering Skiper UI, GSAP, Motion, Anime.js, Bklit UI, Land-book, Codrops, and optional 3D Logo Lab, with licensing and attribution rules for each. The 3D-branding guide covers consent, approved source marks, export verification, safe fallbacks, and scene performance.
- Responsive layouts, focus-managed dialogs, a persistent motion preference, live OS reduced-motion support, and offscreen animation pausing.

## Important Files

- `src/App.tsx`: showcase, navigation, motion choreography, reader, and installation flow.
- `src/components/Experiments.tsx`: original interactive experiments and their explanations.
- `src/components/HeroFriends.tsx`: the pixel-friend canvas, whole-pixel scaling, frame-loop policy, and input handling.
- `src/components/pixel-friends/sprites.ts`: palette-indexed sprites and the deterministic pose timeline (`poseAt`).
- `src/components/pixel-friends/draw.ts`: frame pre-rendering and `drawFriends(ctx, t, input, S, bank)`.
- `scripts/export-still.mjs`: regenerates `public/images/pixel-friends.png` from the idle frame (`node scripts/export-still.mjs`).
- `src/cozy.css`: warm art direction, responsive composition, and reduced-motion styling.
- `src/components/Dialog.tsx`: accessible portal dialog and focus management.
- `src/skill/uncommon/SKILL.md`: Claude skill entry point.
- `src/skill/uncommon/references/`: in-depth art direction, sourcing, interaction, motion, and QA references.
- `src/skill/uncommon/references/3d-branding.md`: optional 3D Logo Lab and dimensional identity workflow.
- `src/skill.ts`: browser-side packaging with the correct `uncommon/` ZIP structure.
- `scripts/check-site.mjs`: actual browser interaction, download, accessibility, and viewport checks.
- `docs/references.md`: source notes, asset credits, and licensing information.

Fonts and images are hosted locally. The application requires no API keys, account, or backend. External documentation links require internet access. Claude's ability to browse depends on the tools available in the environment where the skill is installed; the skill does not grant browser access or third-party component licenses.

The supplied evaluation prompts have not been run as a model-to-model benchmark. The browser suite verifies the showcase and skill archive, not installation in a user's Claude account or the artistic quality of every future generated website.