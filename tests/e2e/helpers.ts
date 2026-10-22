import { expect, type Page } from '@playwright/test';
import type { Investigation } from '../../src/cases/schema';

export async function startCase(page: Page, investigation: Investigation) {
  await page.goto(`/casos/${investigation.slug}`);
  await expect(page.getByRole('heading', { name: investigation.title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Comenzar investigación', exact: true }).click();
  await page.getByRole('button', { name: 'Examinar la escena', exact: true }).click();
}

export async function reviewEvidence(page: Page, investigation: Investigation, fromScene = true) {
  if (fromScene) await page.getByRole('button', { name: 'Ver evidencias', exact: true }).click();
  for (const evidence of investigation.visualEvidence) {
    await page.getByRole('button').filter({ has: page.getByRole('heading', { name: evidence.title, exact: true }) }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: evidence.title, exact: true })).toBeVisible();
    await expect(dialog.getByText(evidence.provenance, { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  }
  await page.getByRole('button', { name: 'Abrir tablero', exact: true }).click();
}

export async function useMatrix(page: Page) {
  const toggle = page.getByRole('button', { name: 'Matriz deductiva', exact: true });
  if (await toggle.isVisible()) await toggle.click();
}

export async function solveBoard(page: Page, investigation: Investigation, useNativeMechanic = false) {
  if (useNativeMechanic && investigation.mechanic === 'timeline') {
    const order = investigation.entities.map((_, index) => index);
    const desired = [...order].sort((a, b) => investigation.solution[a] - investigation.solution[b]);
    for (const [targetIndex, entity] of desired.entries()) {
      let currentIndex = order.indexOf(entity);
      while (currentIndex > targetIndex) {
        await page.getByRole('button', { name: `Adelantar ${investigation.entities[entity]}`, exact: true }).click();
        [order[currentIndex - 1], order[currentIndex]] = [order[currentIndex], order[currentIndex - 1]];
        currentIndex -= 1;
      }
    }
    await page.getByRole('button', { name: 'Confirmar orden actual', exact: true }).click();
  } else if (useNativeMechanic && investigation.mechanic !== 'claims') {
    for (const [entity, category] of investigation.solution.entries()) {
      await page.locator(`#match-${entity}`).selectOption(String(category));
    }
  } else {
    await useMatrix(page);
    for (const [entity, category] of investigation.solution.entries()) {
      await page.getByTestId(`cell-${entity}-${category}`).click();
      await page.getByRole('button', { name: /Confirmar relación$/ }).click();
    }
  }
  await page.getByRole('button', { name: 'Comprobar progreso', exact: true }).click();
  await expect(page.getByText('Todas las relaciones están respaldadas. Puedes emitir tu veredicto.', { exact: true })).toBeVisible();
}
