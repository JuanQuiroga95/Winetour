import { test, expect } from '@playwright/test';
import { minimumDate } from '../../src/lib/quote';
test('Home, carousel, gallery and responsive navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hay lugares');
  await page.getByRole('button', { name: 'Pausar carrusel' }).click();
  await expect(page.getByRole('button', { name: 'Reproducir carrusel' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver foto 2' }).click();
  await expect(page.getByRole('button', { name: 'Ver foto 2' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await page.getByRole('button', { name: 'Ampliar fotografía 1' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('Builder validates dates and daily selections, calculates and reports disconnected DB truthfully', async ({
  page,
}) => {
  await page.goto('/itinerario');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page.locator('.error-message[role=alert]')).toBeVisible();
  await page.locator('input[type=date]').fill(minimumDate());
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page.locator('.winery-map')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page.locator('.error-message[role=alert]')).toContainText('al menos una');
  await page
    .locator('.winery-list')
    .getByRole('button', { name: /Casa Vigil/ })
    .click();
  await expect(page.locator('.summary-total')).toContainText('360');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.locator('.consent input').check();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Nombre y apellido').fill('Test Visitante');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('WhatsApp con código de país').fill('+5492611234567');
  await page.getByRole('button', { name: 'Enviar y abrir WhatsApp' }).click();
  await expect(page.locator('.error-message[role=alert]')).toContainText(
    'todavía no está habilitada',
  );
});
test('Admin is protected and content saves only after server authorization', async ({
  page,
  request,
}) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/admin\/login/);
  const denied = await request.put('/api/admin/content', { data: {} });
  expect(denied.status()).toBe(401);
  await page.getByLabel('Usuario', { exact: true }).fill('dani.v');
  await page.getByLabel('Contraseña', { exact: true }).fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('button', { name: 'Editar página', exact: true }).click();
  await page.getByRole('button', { name: 'Configuración', exact: true }).click();
  await page.getByLabel('Valor del dólar · ARS por 1 USD').fill('1400');
  await expect(page.getByRole('button', { name: 'Publicar cambios' })).toBeDisabled();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Editar página', exact: true }).click();
  await page.getByRole('button', { name: 'Configuración', exact: true }).click();
  await expect(page.getByLabel('Valor del dólar · ARS por 1 USD')).toHaveValue('1400');
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await expect(page).toHaveURL(/admin\/login/);
});
