import { expect, test } from '@playwright/test';
import { cases } from '../../src/cases/registry';
import { reviewEvidence, startCase } from './helpers';

test('compara la parcela con teclado y deshace el orden cronológico', async ({ page }) => {
  const investigation = cases.find(item => item.mechanic === 'timeline')!;
  await startCase(page, investigation);
  const comparison = page.getByRole('slider', { name: 'Comparar imágenes de la parcela', exact: true });
  await expect(comparison).toHaveValue('50');
  await comparison.focus();
  await page.keyboard.press('ArrowRight');
  await expect(comparison).toHaveValue('51');
  await expect(comparison).toHaveAttribute('aria-valuetext', '51 % de la imagen de febrero visible');
  for (const image of await page.getByRole('img', { name: /^(Antes|Después),/ }).all()) {
    await expect(image).toHaveJSProperty('complete', true);
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  }
  await reviewEvidence(page, investigation);
  const headings = page.getByTestId('phase-board').getByRole('heading', { level: 3 });
  await expect(headings).toHaveText(investigation.entities);
  await page.getByRole('button', { name: `Retrasar ${investigation.entities[0]}`, exact: true }).click();
  await expect(headings).toHaveText([investigation.entities[1], investigation.entities[0], ...investigation.entities.slice(2)]);
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(headings).toHaveText(investigation.entities);
  const progress = await page.evaluate(caseId => JSON.parse(localStorage.getItem('osintdoku_progress_v5')!).cases[caseId], investigation.id);
  expect(progress.grid.flat().every((cell: string) => cell === 'unknown')).toBe(true);
});

test('cambiar una localización sustituye su relación y permite deshacerla', async ({ page }) => {
  const investigation = cases.find(item => item.mechanic === 'geolocation')!;
  await startCase(page, investigation);
  await reviewEvidence(page, investigation);
  const firstMatch = page.locator('#match-0');
  await firstMatch.selectOption('0');
  await firstMatch.selectOption('1');
  await expect(firstMatch).toHaveValue('1');
  let row = await page.evaluate(caseId => JSON.parse(localStorage.getItem('osintdoku_progress_v5')!).cases[caseId].grid[0], investigation.id);
  expect(row.filter((cell: string) => cell === 'confirmed')).toHaveLength(1);
  expect(row[1]).toBe('confirmed');
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(firstMatch).toHaveValue('0');
  row = await page.evaluate(caseId => JSON.parse(localStorage.getItem('osintdoku_progress_v5')!).cases[caseId].grid[0], investigation.id);
  expect(row.filter((cell: string) => cell === 'confirmed')).toHaveLength(1);
  expect(row[0]).toBe('confirmed');
});
