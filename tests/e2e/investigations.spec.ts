import { expect, test } from '@playwright/test';
import { cases } from '../../src/cases/registry';
import { startCase, reviewEvidence, solveBoard, useMatrix } from './helpers';

for (const investigation of cases) {
  test(`partida completa: ${investigation.id} ${investigation.title}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await startCase(page, investigation);
    if (investigation.hotspots.length > 0) {
      await page.getByRole('button', { name: `Inspeccionar: ${investigation.hotspots[0].label}`, exact: true }).click();
      await expect(page.getByText(investigation.hotspots[0].detail, { exact: true })).toBeVisible();
    }
    await reviewEvidence(page, investigation);
    await solveBoard(page, investigation, true);
    await page.getByRole('button', { name: 'Emitir veredicto', exact: true }).click();
    const verdict = investigation.verdict.options.find(option => option.id === investigation.verdict.correctId)!;
    await page.getByRole('radio', { name: verdict.text }).check();
    await page.getByRole('button', { name: 'Confirmar veredicto', exact: true }).click();
    await expect(page.getByText(investigation.resolution.conclusion, { exact: true })).toBeVisible();
    for (const source of investigation.sourceLinks) {
      await expect(page.getByRole('link', { name: source.label, exact: true })).toHaveAttribute('href', source.url);
    }
    const stored = await page.evaluate(caseId => {
      const data = JSON.parse(localStorage.getItem('osintdoku_progress_v5') ?? '{}');
      return data.cases?.[caseId];
    }, investigation.id);
    expect(stored.solved).toBe(true);
    expect(stored.revealed).toBe(false);
    expect(stored.examined).toEqual(expect.arrayContaining(investigation.visualEvidence.map(evidence => evidence.id)));
    await page.reload();
    await expect(page.getByText(investigation.resolution.conclusion, { exact: true })).toBeVisible();
    if (investigation.id === '001') {
      await page.getByRole('button', { name: 'Revisar deducciones', exact: true }).click();
      await page.getByRole('button', { name: 'Ver resolución', exact: true }).click();
      await expect(page.getByText(investigation.resolution.conclusion, { exact: true })).toBeVisible();
      await expect(page.getByRole('dialog')).not.toBeVisible();
      const revisited = await page.evaluate(caseId => JSON.parse(localStorage.getItem('osintdoku_progress_v5')!).cases[caseId], investigation.id);
      expect(revisited.solved).toBe(true);
      expect(revisited.revealed).toBe(false);
    }
    await page.getByRole('link', { name: 'Mis expedientes', exact: true }).click();
    const row = page.getByRole('article').filter({ has: page.getByRole('heading', { name: investigation.title, exact: true }) });
    await expect(row.getByText('Caso resuelto', { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('descarta, deshace, pide pistas y recupera la investigación sin otorgar una victoria', async ({ page }) => {
  const investigation = cases[0];
  await startCase(page, investigation);
  await reviewEvidence(page, investigation);
  await useMatrix(page);
  const wrongCategory = (investigation.solution[0] + 1) % investigation.categories.length;
  const cell = page.getByTestId(`cell-0-${wrongCategory}`);
  await cell.click();
  await page.getByRole('button', { name: /Confirmar relación$/ }).click();
  await page.getByRole('button', { name: 'Comprobar progreso', exact: true }).click();
  await expect(page.getByText(/relación incompatible con las pruebas/)).toBeVisible();
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await cell.click();
  await page.getByRole('button', { name: /Descartar relación$/ }).click();
  await expect(cell).toHaveAttribute('aria-label', /Descartada/i);
  await page.getByRole('button', { name: 'Solicitar pista', exact: true }).click();
  await expect(page.getByText(investigation.hintLevels[0].text, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Comprobar progreso', exact: true })).toBeVisible();
  const stored = await page.evaluate(caseId => JSON.parse(localStorage.getItem('osintdoku_progress_v5')!).cases[caseId], investigation.id);
  expect(stored.hintsUsed).toBe(1);
  expect(stored.grid[0][wrongCategory]).toBe('excluded');
  expect(stored.solved).toBe(false);
});

test('revelar la solución exige confirmación y nunca cuenta como victoria', async ({ page }) => {
  const investigation = cases[1];
  await startCase(page, investigation);
  await page.getByRole('button', { name: 'Ver resolución', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(/Esta acción revelará la solución y no contará como caso resuelto/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Revelar solución', exact: true }).click();
  await expect(page.getByText(investigation.resolution.conclusion, { exact: true })).toBeVisible();
  await page.reload();
  const stored = await page.evaluate(caseId => JSON.parse(localStorage.getItem('osintdoku_progress_v5')!).cases[caseId], investigation.id);
  expect(stored.revealed).toBe(true);
  expect(stored.solved).toBe(false);
  await page.getByRole('link', { name: 'Mis expedientes', exact: true }).click();
  await expect(page.getByText('Solución consultada · sin victoria', { exact: true })).toBeVisible();
});


test('amplía las pruebas con teclado y mantiene el veredicto sujeto a evidencias examinadas', async ({ page }) => {
  const investigation = cases[2];
  await startCase(page, investigation);
  await page.getByRole('button', { name: 'Ampliar escena', exact: true }).click();
  await expect(page.getByText('150 %', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restablecer vista', exact: true }).click();
  await page.getByRole('button', { name: 'Ver evidencias', exact: true }).click();
  const evidence = investigation.visualEvidence[0];
  const opener = page.getByRole('button').filter({ has: page.getByRole('heading', { name: evidence.title, exact: true }) });
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Cerrar ventana', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.locator('[tabindex="0"]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Cerrar ventana', exact: true })).toBeFocused();
  await dialog.getByRole('button', { name: 'Ampliar evidencia', exact: true }).click();
  await expect(dialog.getByText('150 %', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('img', { name: evidence.observation, exact: true })).toHaveAttribute('style', /width: 150%/);
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await page.getByRole('button', { name: 'Abrir tablero', exact: true }).click();
  await solveBoard(page, investigation);
  await expect(page.getByRole('button', { name: 'Emitir veredicto', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Consultar evidencias', exact: true }).click();
  await reviewEvidence(page, investigation, false);
  await expect(page.getByRole('button', { name: 'Emitir veredicto', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Emitir veredicto', exact: true }).click();
  const wrongVerdict = investigation.verdict.options.find(option => option.id !== investigation.verdict.correctId)!;
  await page.getByRole('radio', { name: wrongVerdict.text }).check();
  await page.getByRole('button', { name: 'Confirmar veredicto', exact: true }).click();
  await expect(page.getByText(wrongVerdict.explanation, { exact: true })).toBeVisible();
  expect(await page.evaluate(caseId => JSON.parse(localStorage.getItem('osintdoku_progress_v5')!).cases[caseId].solved, investigation.id)).toBe(false);
});
