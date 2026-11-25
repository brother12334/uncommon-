# The Last 10%: A Shipping Standard

Quality is observable. A successful build is necessary but does not prove the site works, is fast, or is accessible. Report exactly what was checked.

## 1. Project Integrity

- Use the project's real package manager and scripts.
- Run its production build and type checks.
- Check new dependencies against the lockfile and avoid unnecessary engines.
- Inspect console errors and failed network requests in a browser.
- Test direct page loading and route navigation if routes exist.
- Do not leave placeholder titles, broken favicons, demo links, or unused scaffolding.
- Do not ship secrets, private source, or unlicensed assets.

If a test tool is unavailable, say so. Do not translate "I read the source" into "I tested this in the browser."

## 2. Primary Task and Honest States

Complete the site's main user task yourself. Can a visitor explore the work, choose a variant, download the file, or contact the owner?

Exercise every visible control, including low-emphasis ones. Filters must change actual results and show a useful empty state where needed. Carousels must change real items. Downloads must contain the promised files. A copy control must copy the correct current text and show a failure alternative when clipboard access is blocked.

Forms need labels, validation, submission state, and genuine success/error behavior. If there is no backend, use an honest contact link or clearly explain the local-only action. Never show "message sent" without sending it.

**Charts and data surfaces:** select the chart by the question it answers, and check it with real, empty, loading, and error data. Confirm units, scales, and time ranges are labeled and honest. Give every chart a text or table equivalent of its values, keyboard-reachable tooltips or data points, and a redundant cue beyond color for any series or good/bad distinction. Theme data colors through the project's CSS variables so light and dark modes both stay legible. If a chart library such as Bklit UI is used, verify the installed component's documented props and current license, and confirm the registry command matched what the docs said.

## 3. Responsive Composition

Inspect at least a wide desktop, ordinary laptop, tablet, and a narrow phone. Useful starting widths are 1440, 1280, 768, 390, and 320 px, but actual content determines breakpoints.

Check headline wrapping, body measure, gutters, image crop, menu behavior, sticky elements, dialogs, viewport-height sections, and long words. Test a short screen as well as a narrow one. Fullscreen sections often fail on mobile browser chrome or landscape phones; prefer `svh`/`dvh` thoughtfully over an unqualified `100vh`.

Do not hide overflow globally to conceal an underlying layout bug. Deliberate clipped visual surfaces are fine; the document should not have accidental horizontal scrolling. Test at 200% zoom and check that meaningful content remains available.

## 4. Motion Correctness

- Refresh while scrolled to the middle; content must not get stuck invisible.
- Scroll quickly, slowly, backward, and by keyboard.
- Interrupt entrance sequences and click controls repeatedly.
- Resize after setup and check measured positions.
- Open/close overlays repeatedly and check focus restoration.
- Change filters and ensure removed surfaces clean up their animations.
- Remount components in development Strict Mode without duplicate listeners or orphan triggers.
- Load fonts and images slowly and check layout stability.
- Switch motion off while a sequence is active; the final composition must remain coherent.
- Confirm only one system owns each animated property.

Check page visibility and intersection behavior for continuous loops. A hidden gallery should not consume a full rendering budget. Do not assume reduced-motion settings automatically stop manually driven springs, clip paths, or SVG morphs.

## 5. Keyboard and Assistive Technology

Use the keyboard from the top of the page. Every meaningful action should be reachable in logical order. Focus indicators must be visible against the actual surface, and focused content must not be clipped beneath sticky navigation.

Use anchors for navigation and buttons for state changes. Give icon buttons accessible names. Keep headings ordered and landmarks clear. Do not nest interactive controls. Use `aria-expanded` and controls relationships for disclosure UI. Either implement the expected arrow-key behavior for ARIA tabs or use an ordinary labeled button group instead.

Dialogs need an accessible name, initial focus, Tab/Shift+Tab containment, Escape, a visible close button, background inertness, scroll locking, and focus restoration. Test what happens if the invoking control disappears.

Meaningful image alt text should describe content, not say "image" or repeat nearby copy. Decorative duplicate images and visual letters should not be announced. Avoid live regions on pointer-driven values; announce completed user actions, not every animation frame.

## 6. Reduced Motion and Touch

Emulate `prefers-reduced-motion: reduce`, reload, and inspect the full page. Do not simply turn every animation duration to zero and assume success. Scroll-pinned sequences may still reserve huge empty areas; reveal code may leave content hidden; continuous canvas loops may continue running.

The alternative should preserve meaning and document order. Use still images, instant state changes, a visible list of steps, or minimal opacity transitions when appropriate.

On touch, confirm the page still scrolls normally. Hover must not be the only source of a project's title, price, description, or action. Give dragging a button alternative. Aim for comfortable touch targets around 44 px where practical and satisfy applicable target-size requirements. Do not confuse a tiny visible icon with a sufficiently large interactive area.

## 7. Contrast and Legibility

Verify text against its actual backdrop, including photography and animated states. Aim for WCAG AA contrast: 4.5:1 for normal text and 3:1 for qualifying large text; also check controls and focus indicators. Do not claim full compliance based on color calculations alone.

Small technical labels need to remain readable. Aesthetics do not justify disappearing low-contrast navigation, body text at 10 px, or essential content rendered as thin outlines.

Automated checks can catch missing names, contrast problems, landmark errors, and invalid relationships, but require manual follow-up. Test with axe or an equivalent tool when available; report unresolved issues honestly.

For dimensional marks and characters, confirm the static image or flat logo remains available without WebGL, rendering stops offscreen and in a hidden tab, reduced motion produces a complete still scene, and a native named control exposes any important scene interaction. Verify asset rights and consent for third-party logo uploads. Never claim that a local procedural model was exported by 3D Logo Lab.

## 8. Performance Budget

Measure the actual site and target devices. Do not publish a Lighthouse or frame-rate claim without running it.

Prefer transform and opacity, but recognize that a huge composited layer can still be expensive. Avoid animating layout properties across many elements, full-screen blur, excessive backdrop filters, and hundreds of permanent layers. `will-change` is a temporary hint, not a global optimization switch.

Keep hero assets appropriately sized, reserve dimensions, preload only genuinely critical resources, and lazy-load below-fold media. Do not send a desktop 4K video to a narrow mobile screen without a good reason. Provide a still fallback for expensive or unavailable media.

Use performance recordings to find forced reflows and long tasks. Record pointer coordinates cheaply and batch visual writes. Do not read layout repeatedly after transform writes. Pause offscreen simulations, dispose WebGL resources, and degrade gracefully if rendering support is unavailable.

Core Web Vitals targets such as LCP around 2.5 seconds or better, INP around 200 ms or better, and CLS around 0.1 or less are useful goals under defined test conditions, not guaranteed outcomes. A local test is not a substitute for real-user measurements.

## 9. Example Browser Checks

Adapt selectors to real accessible names in the project. Do not add tests that only check implementation class names if the user behavior can be tested directly.

```ts
import { test, expect } from '@playwright/test';

test('the skill can actually be downloaded', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Get the skill', exact: true })
    .first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download uncommon' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('uncommon.zip');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('reduced motion keeps content available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  );
  expect(overflow).toBe(false);
});
```

Also inspect a saved ZIP to verify the top-level folder, frontmatter, and actual reference files. A correct filename does not prove a correct archive.

## 10. Final Review and Handoff

Take screenshots of the hero, a dense middle section, and the closing action. Inspect, do not merely generate them. Check the hierarchy at a glance and the typography at full size.

Deliver a short summary of what was built and why the key interaction belongs. Name the actual build and tests run. List unresolved external access, missing assets, backend limitations, or unverified devices. Keep source attributions available in the project. Do not claim installation in a user's Claude account or deployment unless it actually happened.