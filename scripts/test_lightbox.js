const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('file:///c:/Users/Home/Desktop/sajt%20reklama/index.html');
  await page.waitForLoadState('domcontentloaded');

  const lightbox = page.locator('[data-lightbox-modal]');
  const lightboxHandle = await lightbox.elementHandle();
  const trigger = page.locator('[data-lightbox]').first();
  const closeButton = page.locator('.lightbox-close');

  const results = [];
  for (let i = 0; i < 10; i += 1) {
    const iteration = i + 1;
    await trigger.click();
    await page.waitForFunction((el) => !el.hasAttribute('hidden'), lightboxHandle, { timeout: 3000 });
    await page.waitForTimeout(50);
    const openState = await lightbox.evaluate((el, iterationIndex) => ({
      iteration: iterationIndex,
      hidden: el.hasAttribute('hidden'),
      display: getComputedStyle(el).display,
      pointerEvents: getComputedStyle(el).pointerEvents
    }), iteration);

    await closeButton.click();
    await page.waitForFunction((el) => el.hasAttribute('hidden'), lightboxHandle, { timeout: 3000 });
    await page.waitForTimeout(50);
    const closedState = await lightbox.evaluate((el, iterationIndex) => ({
      iteration: iterationIndex,
      hidden: el.hasAttribute('hidden'),
      display: getComputedStyle(el).display,
      pointerEvents: getComputedStyle(el).pointerEvents
    }), iteration);

    results.push({ openState, closedState });
  }

  console.log(JSON.stringify(results, null, 2));

  await browser.close();
})();
