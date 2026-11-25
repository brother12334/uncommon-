# Art Direction: Specific, Not Just Different

## Establish the World Before the Components

An interface is a composition across time. The first question is not which component library to use. It is what someone should recognize, understand, and feel before reading the details.

Translate brand qualities into observable decisions:

| Quality | Useful translation | Lazy shortcut |
| --- | --- | --- |
| Precise | Tabular numbers, measured intervals, aligned edges, controlled timing | Tiny gray text everywhere |
| Tactile | Material photography, weight, spring resistance, imperfect print texture | Random noise over a gradient |
| Experimental | One unusual navigational or spatial idea with clear affordances | Obscure controls and unreadable type |
| Quiet | Sparse composition, long held states, small motion amplitudes | Empty page with no hierarchy |
| Energetic | Sharp contrasts, tight crops, directional sequences, short attacks | Everything bouncing forever |
| Archival | Meaningful metadata, document structure, relevant scans | Fake dates and meaningless coordinates |
| Luxurious | Excellent image direction, optical typography, unhurried pacing | Gold text, serif font, and blur |

Choose two qualities, then design a tension between them. Specificity beats a list of fashionable adjectives.

## Three Directions Before One Design

Internally sketch three genuinely different directions. They should differ in composition and interaction, not just accent color. Spend a few minutes, not half the task.

For an independent ceramics studio:

- Field notes: warm paper, numbered objects, macro material images, drag-to-explore contact sheets.
- Kiln study: near-black, radiant clay-red photography, a restrained scroll-driven reveal from raw material to finished form.
- Domestic objects: bright daylight, generous serif type, intimate copy, tactile product rotation on explicit interaction.

Select the direction that serves the products, content, budget, and audience. Do not blend all three until the concept becomes incoherent.

## Typography Is Structure

Choose one display voice and one highly readable supporting voice. A third monospace is useful only for real technical, editorial, or archival information.

Display decisions should include case, width, weight, tracking, leading, line breaks, and maximum measure. Use large type because the words deserve that scale, not because the page needs filling. Optical spacing matters more than mathematically equal gaps.

Use fluid scales with bounds, for example:

```css
:root {
  --display-size: clamp(4.5rem, 11vw, 12rem);
  --body-size: clamp(1rem, 1.1vw, 1.125rem);
  --gutter: clamp(1.25rem, 4vw, 5rem);
}

.display {
  font-size: var(--display-size);
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-wrap: balance;
}
```

Treat these as an example, not universal design tokens. Check actual glyphs at the smallest width. Never make important body copy tiny merely to look editorial. Maintain readable paragraph measure, usually around 45-75 characters.

When splitting display text into spans for motion, keep an intact accessible name and mark the visual duplicate `aria-hidden="true"`. Do not give every letter its own spoken announcement. Preserve selection and document semantics where possible.

## Composition and Rhythm

Design a hierarchy, not a collage. Each viewport needs a clear visual center and a directional relationship between major elements.

Use a small underlying grid, then choose where to follow it and where to break it. A deliberate exception is legible only when there is a rule to break. Vary scale before adding decoration.

For the hero, favor one dominant image plane and one type idea. Do not put a screenshot in a rounded card merely because it is a default pattern. A product UI screenshot may be the correct visual anchor for a real software product; frame it according to that product's existing visual language.

For the rest of the page, assign one job per section: establish desire, demonstrate the work, explain a mechanism, resolve uncertainty, or invite action. Avoid sections that simultaneously sell, list features, show stats, embed a schedule, and demand a signup.

A useful rhythm might be immersive, concise, exploratory, quiet, decisive. It is not always hero, logos, three cards, testimonial, pricing, FAQ.

## Imagery With a Reason

Use real product, place, process, or atmosphere. Search for the actual subject and a consistent photographic language. Art direction includes lighting, crop, angle, material, color temperature, grain, and how subjects relate to the layout.

Do not use unrelated abstract 3D shapes as a substitute for a concept. Custom generative imagery can support a world, but must not misrepresent real products, people, or evidence. Do not fabricate client work.

Reserve dimensions and choose `object-position` per breakpoint. A desktop crop may remove the subject on mobile. Use art-directed sources if needed. Check meaningful alternative text; decorative duplicates get empty alt text.

Use texture lightly. Real scans and photography often already have enough material character. A noise overlay is not a visual identity and must not reduce contrast or overwhelm text.

## Color and Material

Choose a dominant field, a text color, and a deliberate accent. More colors need a role. A palette should connect to the subject, not automatically become black, white, and electric green.

Check contrast at actual font size and weight. An expressive orange may work for a large heading but fail as 11px text on cream. Create a darker text variant rather than sacrificing legibility.

Use gradients when they describe light, material, depth, or an established brand. Do not use them to fill an empty art direction. Shadows should describe elevation or interaction, not decorate every container.

## The Anti-Generic Review

Run these tests before polishing:

- Substitution: would this fit a different industry after changing the name?
- Silhouette: viewed blurred, is there a strong composition or just repeated rectangles?
- Removal: if a border, icon, shadow, or label is removed, is anything lost?
- Stillness: is the layout convincing with animation disabled?
- Restraint: what can be removed to make the strongest idea more obvious?
- Authorship: which three decisions feel inseparable from this exact brief?

Do not confuse originality with arbitrary weirdness. Unconventional interaction must remain discoverable, reversible, and useful.