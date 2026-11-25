# uncommon: References and Assets

The showcase experiments are original implementations of general interaction principles. No premium Skiper source was copied, no external site's identity was reproduced, and the showcase does not require a paid component license.

## Documentation Inspected

- https://gsap.com/resources/React/ - useGSAP, scoped selectors, lifecycle cleanup, context-safe event handlers.
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/ - native-scroll scrubbing, refresh, responsive setup, and trigger lifecycle.
- https://skiper-ui.com/ - uncommon component direction and public library overview.
- https://skiper-ui.com/components - component directory; the plain-text fetch exposed the command palette rather than component source. No claim is made that premium examples were inspected or copied.
- https://motion.dev/docs/react-drag - axis locking, constraints, elasticity, drag events, image ghost-drag prevention.
- https://animejs.com/documentation/ - Anime.js v4 modules, animate/timeline/stagger, onScroll, scopes, and per-module sizes.
- https://ui.bklit.com/docs/theming - Bklit registry installation, `--chart-*` theming tokens, palettes, and light/dark behavior.
- https://land-book.com/ - curated landing-page and portfolio gallery used for composition research.
- https://tympanus.net/codrops/ - creative-development research and tutorial directory.
- https://www.3dlogolab.io/ - optional 2D-to-3D logo workflow. Public product information was inspected; no account, private logo upload, paid export, or public API was assumed or used.
- https://r3f.docs.pmnd.rs/api/canvas - renderer setup, native Canvas fallback, frame-loop modes, and error boundaries.
- https://r3f.docs.pmnd.rs/advanced/scaling-performance - offscreen/hidden rendering control, on-demand frames, bounded DPR, and resource ownership.
- https://claude.com/docs/skills/how-to - skill frontmatter, progressive disclosure, directory structure, ZIP packaging, and installation guidance.

## Implementation

- GSAP and @gsap/react: hero choreography, parallax, text emphasis, section entrances, scroll-linked tunnel, and cleanup.
- Motion: springs, type response, gesture deck, layout transitions, shape morphing, and dialogs.
- Three.js and React Three Fiber: original procedural clay-like characters with pointer response, timed blinks, a waving arm, and an intentional nudge sequence. Rendering pauses offscreen, in a hidden tab, and in reduced-motion mode. The characters are not a claimed 3D Logo Lab export.
- Lucide: interface icons.
- fflate: client-side creation of a real ZIP containing the complete skill folder.
- Tailwind CSS v4 and custom CSS: layout, responsive art direction, surface treatments, and reduced-motion baselines.

Dependency license notices remain with their respective installed packages. Consult those licenses for redistribution or reuse.

## Images

- `public/images/uncommon-friends.jpg`: custom-generated clay-character illustration, used as an immediate hero image and a fallback where live WebGL cannot render. It is not a 3D Logo Lab export, client project, or third-party character.
- `public/images/pottery-01.jpg`: 3B, Pexels. https://www.pexels.com/photo/sunlit-pottery-collection-in-artistic-studio-33295389/
- `public/images/pottery-02.jpg`: KoolShooters, Pexels. https://www.pexels.com/photo/white-plastic-cups-on-table-9736919/
- `public/images/pottery-03.jpg`: Beyzanur K., Pexels. https://www.pexels.com/photo/clay-cups-and-bowl-on-table-18702612/

Pexels images are used as photographic studies in original interactions, not represented as the developer's ceramic work. Pexels licensing: https://www.pexels.com/license/

## Type

Fraunces, Caveat, DM Sans, and IBM Plex Mono were retrieved through Google Fonts and are locally hosted. Their SIL Open Font License notices are preserved in `public/fonts/licenses/`.

## Skill

The ten-file `uncommon` skill is authored for this application. Its instructions and templates may be freely used, modified, and shared as described in the bundled README. External libraries and components retain their own conditions. Browser tools, third-party accounts, and 3D Logo Lab exports are not included in the download.