# Interaction Patterns: Choose by Purpose

The same effect can be distinctive in one context and gratuitous in another. Start with what the interaction should communicate.

## 1. Kinetic Display Type

Purpose: establish a brand's character and directional energy.

Use one short phrase, intentional line breaks, and a controlled movement range. Pointer-driven skew or weight should settle back cleanly. A reveal should land in a readable state quickly.

Use semantic text, an intact accessible name, and hidden visual duplicates if necessary. Do not make paragraphs scramble or move away from people trying to read. On touch, use a tap-to-remix behavior or simply a strong static display.

## 2. Editorial Image Follow

Purpose: preview work without a repetitive thumbnail grid.

A selected list row can drive a single adjacent image, which enters from a consistent direction and reacts subtly to movement. The preview must not cover row text or the link target. Selection should follow keyboard focus as well as pointer hover. On small screens use in-flow previews or explicit selection, not a floating cursor image.

## 3. Elastic Photo Deck

Purpose: make a small collection feel physical and invite exploration.

Limit rotation, maintain a visible active item, and use a spring with real settling. A swipe changes the index only after a clear threshold. Provide previous and next buttons, an item count, and meaningful alt text. Use `touch-action: pan-y` for horizontal dragging. Do not trap the full page in a horizontal interaction.

## 4. Magnetic Controls

Purpose: reward intent and give an important action physical presence.

Keep displacement small, usually around 4-12 px for a normal button, and reset on leave. The visual can move inside a stable hit area. Use a fine-pointer query. Do not move the target so far that the user chases it or cannot click. Never use magnetism for destructive actions or dense forms.

## 5. Circular Reveal Lens

Purpose: reveal material, alternate treatment, before/after, or detail.

Align two image layers exactly and animate only the mask or clip path. A meaningful reveal needs a meaningful alternate layer. If it is simply aesthetic, keep it decorative. Add a tap/click reveal or slider for essential comparisons. Give the base image one meaningful alternative description rather than duplicate announcements.

## 6. Scroll-Driven Chapter

Purpose: connect a short narrative to physical progress.

Use a stable wrapper and animate children. Keep scroll natural. Pin only when holding the visual is necessary for understanding. Use a bounded, signposted range; long scroll distances are not cinematic by themselves. Remove or simplify pinning on short mobile screens. The reduced-motion version should show the chapters in document order.

## 7. Perspective Field

Purpose: suggest depth around a product, object, or spatial brand.

Use two or three layers, a consistent vanishing point, and low-amplitude rotation. Nested wrappers let scroll depth and pointer tilt have separate owners. Do not make text tilt enough to hurt reading. On mobile, default to a clean frontal view rather than reading device sensors without consent.

## 8. Shape Morph as a Brand Signature

Purpose: give a small graphic identity a set of related states.

Use compatible SVG paths or a tested morphing tool. Design the silhouettes as a family; a random blob is not an identity. Use a state counter or descriptive label if the morph is user-controlled. Reduced motion changes shape instantly. Decorative looping morphs need a pause mechanism and should stop offscreen.

## 9. Cursor-Reactive Particle Surface

Purpose: create a small moment of material resistance or discovery.

Bound the simulation to one surface and cap the particle count. Compute local coordinates once per event or frame. Use distance falloff and stable return positions. Pause offscreen. Avoid a full-screen trail following the reader across body text. If it conveys no content, mark the graphics decorative and do not make it the only route to an action.

## 10. Directional Page Transition

Purpose: make a real route or major state change feel connected.

Keep the transition shorter than the user's patience. Navigation must remain cancellable, URL and focus must update correctly, and the new heading should receive appropriate focus. Do not animate a fake loading screen for assets that are already ready. Do not delay the first page view for a dramatic counter.

## 11. Interactive Audio or Video

Purpose: demonstrate a creative product through its actual medium.

Require intentional playback for sound. Provide play/pause, useful labeling, captions or transcripts where needed, and a quiet default. Use real authorized files. A waveform without audio may be an illustration, but must not masquerade as a working player. Respect data usage, reduced motion, and background-tab behavior.

## 12. Data That Reads Like the Brand

Purpose: make metrics, flows, or change over time legible without turning the page into an admin dashboard.

Choose the chart by the reader's question, not by which component is most decorative. Trends over time use a line or area; category comparison uses bars; part-to-whole uses a pie or ring only when the slices genuinely sum to a meaningful whole; distributions and flows use scatter, heatmap, funnel, or Sankey. If a table communicates more precisely than a chart, ship the table.

For a project with Bklit UI available, compose from its axes, grids, tooltips, legends, markers, and loading states rather than forking a monolithic component. Theme series through `--chart-*` CSS variables so data colors follow the brand in both light and dark modes, and keep semantic positive/negative tokens for gains and losses. Verify the current registry command and component docs before installing.

Motion here means emphasis: an entrance on first render, a highlight when a series is selected, a crosshair that tracks focus. Never animate data continuously to look alive. Animate only transform, opacity, or path drawing, and settle quickly.

Accessibility is not optional: every chart needs a readable title, units, axis labels, and a text or table equivalent of the values. Do not rely on color alone to identify a series or a good/bad result. Provide loading, empty, and error states, keyboard-reachable tooltips or data points, and a static reduced-motion rendering of the final values.

Never fabricate numbers to fill the design. Label illustrative data as illustrative, and cite real data where claims matter.

## Choosing an Engine

| Need | Start with | Escalate only if |
| --- | --- | --- |
| Hover, focus, simple reveal | CSS | Timing or interruption becomes complex |
| React state transition or drag | Motion | A coordinated external timeline is essential |
| Multi-stage scroll narrative | GSAP and ScrollTrigger | The concept needs genuine 3D rendering |
| Compact timeline, stagger, or SVG drawing | Anime.js | A larger ecosystem tool is already in the project |
| Charts and data surfaces | Bklit UI over shadcn/ui | A bespoke visualization is genuinely required |
| Small graphic deformation | SVG | Mesh, lighting, or depth is central |
| Many particles | Canvas | A GPU simulation materially improves the idea |
| Real object/material scene | Three.js or R3F | Never add an engine just for a rotating box |

## The Motion-Heavy Brief

Make depth, not clutter. A strong sequence can combine staggered type, an image mask, and a perspective change because they share a single timeline and idea. Elsewhere, hold still long enough for the sequence to matter.

Use contrast between motion and rest. Repeat a small set of easing and directional rules so the site has a physical language. Keep simultaneous focal movements to a minimum. Remove any effect whose absence improves the composition or task.