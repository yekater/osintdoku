import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { cases } from '../../src/cases/registry';
import { reviewEvidence, solveBoard, startCase } from './helpers';

async function capture(page: Page, testInfo: TestInfo, name: string) {
  await page.evaluate(() => document.fonts.ready);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewport = page.viewportSize()?.height ?? 900;
  for (let position = 0; position < height; position += viewport) {
    await page.evaluate(top => new Promise<void>(resolve => {
      window.scrollTo({ top, behavior: 'instant' });
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }), position);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.locator('main img').evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
  test(`QA visual ${viewport.width}×${viewport.height}`, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    await capture(page, testInfo, 'home');
    const investigation = cases[0];
    await startCase(page, investigation);
    await capture(page, testInfo, 'scene');
    await page.getByRole('button', { name: 'Ver evidencias', exact: true }).click();
    await page.getByRole('button').filter({ has: page.getByRole('heading', { name: investigation.visualEvidence[0].title, exact: true }) }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await capture(page, testInfo, 'evidence-modal');
    await page.keyboard.press('Escape');
    await reviewEvidence(page, investigation, false);
    await capture(page, testInfo, 'board');
    await solveBoard(page, investigation);
    await page.getByRole('button', { name: 'Emitir veredicto', exact: true }).click();
    const option = investigation.verdict.options.find(item => item.id === investigation.verdict.correctId)!;
    await page.getByRole('radio', { name: option.text }).check();
    await page.getByRole('button', { name: 'Confirmar veredicto', exact: true }).click();
    await capture(page, testInfo, 'resolution');
    for (const image of await page.locator('main img').all()) {
      await expect(image).toHaveJSProperty('complete', true);
      expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    }
  });
}
