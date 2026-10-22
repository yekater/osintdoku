import { expect, test } from '@playwright/test';
import { cases } from '../../src/cases/registry';

test('navega por el catálogo, filtra e inspecciona las fuentes', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /LA VERDAD.*DEJA RASTROS/ })).toBeVisible();
  await page.getByRole('link', { name: 'Expedientes', exact: true }).click();
  await expect(page).toHaveURL(/\/casos$/);
  await expect(page.getByRole('article')).toHaveCount(5);
  await page.getByRole('button', { name: cases[2].category, exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: cases[2].title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await page.getByRole('textbox', { name: 'Buscar expedientes', exact: true }).fill('imposible');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('textbox', { name: 'Buscar expedientes', exact: true }).fill('sin coincidencias');
  await expect(page.getByText('No hay expedientes con esos criterios. Prueba otra búsqueda.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Laboratorio', exact: true }).click();
  for (const investigation of cases) for (const source of investigation.sourceLinks) {
    await expect(page.getByRole('link', { name: source.label, exact: true })).toHaveAttribute('href', source.url);
  }
  await page.getByRole('link', { name: 'Mis expedientes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tu primera pista te espera.', exact: true })).toBeVisible();
  await page.goto('/casos/expediente-inexistente');
  await expect(page.getByRole('heading', { name: 'Este rastro termina aquí.', exact: true })).toBeVisible();
});
