import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";

const baseURL = process.env.BASE_URL || "http://localhost:5173";
await mkdir("artifacts", { recursive: true });
// CHROME_PATH lets the check run against an already-installed Chromium.
const executablePath = process.env.CHROME_PATH || undefined;
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
const failures = [];
const checks = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400 && response.url().startsWith(baseURL))
    failures.push(`${response.status()} ${response.url()}`);
});
const check = (name) => {
  checks.push(name);
  console.log(`PASS ${name}`);
};
// Reads the friends canvas and counts pixels outside the sprite palette.
const PALETTE = [
  "#45313d", "#b6a0d5", "#a891cb", "#725d85", "#f2d377",
  "#e8a780", "#d8936d", "#f5e8d3", "#df947e", "#f8f3e9",
];
const canvasReport = (target) =>
  target.locator(".friends-canvas").evaluate((canvas, palette) => {
    const rgb = palette.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
    const { data } = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    let offPalette = 0;
    let painted = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a === 0) continue;
      painted++;
      const solid = a === 255 && rgb.some(([r, g, b]) => r === data[i] && g === data[i + 1] && b === data[i + 2]);
      // the dithered shadow: outline color at 12% alpha
      const shadow = Math.abs(a - 31) <= 2 && Math.abs(data[i] - 69) <= 6 && Math.abs(data[i + 2] - 61) <= 6;
      if (!solid && !shadow) offPalette++;
    }
    const css = canvas.getBoundingClientRect();
    return {
      width: canvas.width,
      height: canvas.height,
      cssWidth: css.width,
      rendering: getComputedStyle(canvas).imageRendering,
      painted,
      offPalette,
      signature: canvas.toDataURL(),
    };
  }, PALETTE);
// Clicks Daisy's face: art px (18, 28) on the 68 × 50 stage.
const clickDaisy = async (target) => {
  const box = await target.locator(".friends-canvas").boundingBox();
  await target.mouse.click(box.x + (18 / 68) * box.width, box.y + (28 / 50) * box.height);
};
const jump = async (id) => {
  await page.evaluate(
    (target) =>
      document
        .getElementById(target)
        .scrollIntoView({ behavior: "instant", block: "start" }),
    id,
  );
  await page.waitForTimeout(1050);
};

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2200);
  await expect(
    page.getByRole("heading", { level: 1, name: "uncommon" }),
  ).toBeVisible();
  await expect(page.locator(".hero-photo")).toHaveJSProperty("complete", true);
  await expect(page.locator(".hero-friends")).toHaveClass(/is-ready/);
  await expect(page.locator(".friends-canvas")).toBeVisible();
  const idle = await canvasReport(page);
  expect(idle.width % 68).toBe(0);
  expect(idle.height % 50).toBe(0);
  expect(idle.width / 68).toBe(Math.round(idle.width / 68));
  expect(idle.cssWidth).toBe(68 * 8);
  expect(idle.rendering).toBe("pixelated");
  expect(idle.painted).toBeGreaterThan(1000);
  expect(idle.offPalette).toBe(0);
  await expect(page.locator(".hero-scroll")).toHaveCount(0);
  await clickDaisy(page);
  await page.waitForTimeout(150);
  const midBoop = await canvasReport(page);
  expect(midBoop.signature).not.toBe(idle.signature);
  expect(midBoop.offPalette).toBe(0);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "artifacts/desktop-hero.png" });
  check(
    "Pixel friends draw at a whole-number 8× scale in palette colors only, and clicking Daisy boops her",
  );

  await page
    .getByRole("button", { name: "Pause playful motion", exact: true })
    .click();
  await expect(page.locator(".hero-friends")).toHaveAttribute(
    "data-rendering",
    "still",
  );
  await page
    .getByRole("button", { name: "Resume playful motion", exact: true })
    .click();
  await expect(page.locator(".hero-friends")).toHaveAttribute(
    "data-rendering",
    "animated",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".hero-friends")).toHaveAttribute(
    "data-rendering",
    "still",
  );
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".hero-friends")).toHaveAttribute(
    "data-rendering",
    "animated",
  );
  check(
    "Front-page pause control and hidden-tab policy stop and resume the pixel friends",
  );

  await jump("playground");
  await expect(page.locator(".hero-friends")).toHaveAttribute(
    "data-rendering",
    "still",
  );
  await page.screenshot({ path: "artifacts/desktop-playground.png" });
  await expect(page.locator(".experiment-item")).toHaveCount(6);
  await page.getByRole("tab", { name: /^Cursor/ }).click();
  await expect(page.locator(".experiment-item")).toHaveCount(3);
  await page.getByRole("tab", { name: /^Drag/ }).click();
  await expect(page.locator(".experiment-item")).toHaveCount(1);
  await page.waitForTimeout(600);
  await page
    .getByRole("button", { name: "Next photograph", exact: true })
    .click();
  await expect(page.locator(".gallery-controls > span")).toHaveText("02 / 03");
  await page
    .getByRole("button", { name: "Previous photograph", exact: true })
    .click();
  await expect(page.locator(".gallery-controls > span")).toHaveText("01 / 03");
  const deck = await page.locator(".gallery-deck").boundingBox();
  await page.mouse.move(deck.x + deck.width / 2, deck.y + deck.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    deck.x + deck.width / 2 - 75,
    deck.y + deck.height / 2,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect(page.locator(".gallery-controls > span")).toHaveText("02 / 03");
  check(
    "Category filters, actual drag gesture, and gallery buttons change real content",
  );

  await page.getByRole("tab", { name: /^Drag/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /^Type/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(".experiment-item")).toHaveCount(1);
  await page.getByRole("tab", { name: /^Type/ }).press("Home");
  await expect(page.getByRole("tab", { name: /^All/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(".experiment-item")).toHaveCount(6);
  await page.waitForTimeout(700);
  check("Filter tabs support Arrow keys and Home with roving focus");

  await page.locator(".demo-type").click();
  await expect(page.locator(".kinetic-words")).toHaveText(
    "staya littlecurious.",
  );
  await page.locator(".demo-field").focus();
  await page.keyboard.press("ArrowRight");
  const displaced = await page
    .locator(".field-dot")
    .evaluateAll((dots) => dots.some((dot) => dot.style.transform !== ""));
  expect(displaced).toBe(true);
  await page.locator(".demo-lens").click();
  await expect(page.locator(".demo-lens")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator(".demo-shape").click();
  await expect(page.locator(".demo-shape")).toHaveAttribute(
    "aria-label",
    /Shape 2 of 3/,
  );
  await page.locator(".demo-tunnel").click();
  await page.waitForTimeout(1900);
  check(
    "Type remix, keyboard particle field, reveal lens, morph, and tunnel replay work",
  );

  await page
    .getByRole("button", {
      name: "Expand A different perspective experiment",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator(".demo-lens")).toBeVisible();
  expect(await page.evaluate(() => document.getElementById("root").inert)).toBe(
    true,
  );
  await page.getByRole("button", { name: "Copy recipe" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.getElementById("root").inert)).toBe(
    false,
  );
  check(
    "Expanded experiments, recipe copying, Escape, and background inertness work",
  );

  await page
    .getByRole("button", { name: "Get the skill", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(700);
  const installAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(installAxe.violations).toEqual([]);
  await dialog.getByRole("button", { name: "Claude.ai", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: "Add it to your Claude skills." }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Claude Code", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Copy", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "unzip ~/Downloads/uncommon.zip",
  );
  const downloadEvent = page.waitForEvent("download");
  await dialog
    .getByRole("button", { name: "Download uncommon", exact: true })
    .click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("uncommon.zip");
  await download.saveAs("artifacts/uncommon.zip");
  const archive = unzipSync(
    new Uint8Array(await readFile("artifacts/uncommon.zip")),
  );
  expect(Object.keys(archive)).toHaveLength(10);
  expect(
    Object.keys(archive).every((name) => name.startsWith("uncommon/")),
  ).toBe(true);
  expect(strFromU8(archive["uncommon/SKILL.md"])).toMatch(
    /^---\nname: uncommon\ndescription:/,
  );
  const archivedSkill = strFromU8(archive["uncommon/SKILL.md"]);
  const archivedResearch = strFromU8(
    archive["uncommon/references/research-and-sourcing.md"],
  );
  for (const source of ["Land-book", "Bklit UI", "Anime.js", "3D Logo Lab"]) {
    expect(archivedSkill).toContain(source);
    expect(archivedResearch).toContain(source);
  }
  check(
    "Both installation modes work and uncommon ZIP has ten renamed files including 3D Logo Lab guidance",
  );

  await dialog.getByRole("tab", { name: "Read the playbook" }).click();
  await expect(dialog.locator(".skill-reader")).toContainText("name: uncommon");
  await expect(dialog.locator("#skill-file option")).toHaveCount(10);
  await page.waitForTimeout(400);
  const readerAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(readerAxe.violations).toEqual([]);
  await dialog
    .getByLabel("INSIDE THE SKILL")
    .selectOption("references/motion-recipes.md");
  await expect(dialog.locator(".skill-reader")).toContainText(
    "Recipe 1: A Scoped Scroll Chapter",
  );
  await dialog.getByRole("button", { name: "Copy file" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Motion Engineering",
  );
  await page.screenshot({ path: "artifacts/skill-reader.png" });
  await page.getByRole("button", { name: "Close dialog" }).focus();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(
      () => document.activeElement.closest('[role="dialog"]') !== null,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  check(
    "All skill files can be read and copied, with dialog focus containment",
  );

  await jump("the-process");
  await page.getByRole("button", { name: /Have a point of view/ }).click();
  await expect(
    page.getByRole("button", { name: /Have a point of view/ }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("button", { name: /Research, never regurgitate/ }),
  ).toHaveAttribute("aria-expanded", "false");
  check("Process accordion changes its content and accessible expanded state");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page.waitForTimeout(350);
  await expect(page.locator(".hero-friends")).toHaveAttribute(
    "data-rendering",
    "still",
  );
  expect(
    await page
      .locator(".process-title")
      .evaluate((element) => getComputedStyle(element).opacity),
  ).toBe("1");
  expect(
    await page
      .locator(".sources-heading")
      .evaluate((element) => getComputedStyle(element).opacity),
  ).toBe("1");
  await page.screenshot({ path: "artifacts/desktop-full.png", fullPage: true });
  check(
    "Live OS reduced-motion changes cancel choreography and reveal all content",
  );

  const axeResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await writeFile(
    "artifacts/accessibility.json",
    JSON.stringify(axeResults.violations, null, 2),
  );
  console.log(
    "ACCESSIBILITY",
    JSON.stringify(
      axeResults.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
      null,
      2,
    ),
  );
  expect(axeResults.violations).toEqual([]);
  check(
    "Automated accessibility scans find no violations in page, install, or reader states",
  );

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Motion off", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await page.getByRole("button", { name: "Motion on", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  check(
    "Motion switch works in both directions and remembers the choice on reload",
  );

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(400);
  await expect(page.locator(".hero-friends")).toHaveAttribute(
    "data-rendering",
    "still",
  );
  const stillIdle = await canvasReport(page);
  await page.waitForTimeout(1200);
  expect((await canvasReport(page)).signature).toBe(stillIdle.signature);
  await clickDaisy(page);
  await page.waitForTimeout(150);
  const stillHappy = await canvasReport(page);
  expect(stillHappy.signature).not.toBe(stillIdle.signature);
  expect(stillHappy.offPalette).toBe(0);
  await page.screenshot({ path: "artifacts/uncommon-reduced-motion-hero.png" });
  await page.waitForTimeout(700);
  expect((await canvasReport(page)).signature).toBe(stillIdle.signature);
  check(
    "With motion off the friends hold one frame, and a boop shows a still happy face for 0.6 s",
  );

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const mobile = await mobileContext.newPage();
  mobile.on("pageerror", (error) => errors.push(error.message));
  await mobile.goto(baseURL, { waitUntil: "networkidle" });
  await mobile.evaluate(() => document.fonts.ready);
  await mobile.screenshot({ path: "artifacts/mobile-hero.png" });
  for (const width of [320, 390, 768, 1280, 1440]) {
    await mobile.setViewportSize({ width, height: 844 });
    await mobile.waitForTimeout(200);
    expect(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.getByRole("button", { name: "Open menu" }).click();
  await expect(
    mobile.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await mobile
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("button", { name: /Playground/ })
    .click();
  await expect(
    mobile.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
  await mobile.screenshot({ path: "artifacts/mobile-playground.png" });
  await mobile
    .getByRole("button", {
      name: "Expand Type with an attitude experiment",
      exact: true,
    })
    .click();
  await expect(mobile.getByRole("dialog")).toBeVisible();
  await mobile.screenshot({ path: "artifacts/mobile-experiment.png" });
  await mobile.getByRole("button", { name: "Close dialog" }).click();
  await mobile.screenshot({
    path: "artifacts/mobile-full.png",
    fullPage: true,
  });
  check(
    "Mobile menu, mobile dialog, touch layout, and overflow checks pass at five widths",
  );

  const fallbackBrowser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox"],
  });
  try {
    const fallbackContext = await fallbackBrowser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: true,
    });
    const fallbackPage = await fallbackContext.newPage();
    fallbackPage.on("pageerror", (error) => errors.push(error.message));
    await fallbackPage.goto(baseURL, { waitUntil: "networkidle" });
    await fallbackPage.evaluate(() => document.fonts.ready);
    await fallbackPage.waitForTimeout(1200);
    const touchIdle = await canvasReport(fallbackPage);
    expect(touchIdle.cssWidth).toBe(68 * 5);
    expect(touchIdle.width).toBe(68 * 10);
    expect(touchIdle.offPalette).toBe(0);
    const box = await fallbackPage.locator(".friends-canvas").boundingBox();
    // tap Bean's face: art px (50, 35) on a 68 × 50 stage
    await fallbackPage.touchscreen.tap(
      box.x + (50 / 68) * box.width,
      box.y + (35 / 50) * box.height,
    );
    await fallbackPage.waitForTimeout(150);
    const booped = await canvasReport(fallbackPage);
    expect(booped.signature).not.toBe(touchIdle.signature);
    expect(booped.offPalette).toBe(0);
    await expect(
      fallbackPage.getByRole("heading", { level: 1, name: "uncommon" }),
    ).toBeVisible();
    await fallbackPage.screenshot({
      path: "artifacts/uncommon-touch-boop-mobile.png",
    });
    await fallbackPage
      .getByRole("button", { name: "Get the skill", exact: true })
      .first()
      .click();
    await expect(fallbackPage.getByRole("dialog")).toBeVisible();
    check(
      "On a touch phone a tap boops Bean, the friends stay crisp at 5×, and skill installation works",
    );
  } finally {
    await fallbackBrowser.close();
  }

  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  check("No page exceptions or failed local asset requests");
  await writeFile(
    "artifacts/check-results.json",
    JSON.stringify(
      {
        baseURL,
        checks,
        errors,
        failures,
        accessibilityViolations: axeResults.violations.length,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
