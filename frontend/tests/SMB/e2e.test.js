import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080/minimum-interprofessional-wages';

test.describe('Salarios Mínimos Interprofesionales - Frontend', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Cargar datos iniciales', async ({ page }) => {
    await page.click('button:has-text("Cargar Datos Iniciales")');
    await expect(page.locator('p')).toHaveText(/Datos iniciales cargados correctamente|ya estaban cargados/);
  });

  test('Crear un nuevo recurso', async ({ page }) => {
    // Llenar todos los inputs del formulario de creación usando data-testid
    await page.fill('[data-testid="create-country"]', 'TestLand');
    await page.fill('[data-testid="create-date"]', '2026');
    await page.fill('[data-testid="create-NationalWage"]', '500');
    await page.fill('[data-testid="create-USD"]', '100');
    await page.fill('[data-testid="create-%"]', '10');

    // Hacer click en Crear
    await page.click('button:has-text("Crear")');

    // Esperar el mensaje de éxito
    await expect(page.locator('p')).toHaveText(/creado correctamente/);

    // Verificar que el recurso aparece en la tabla
    const row = page.locator('tbody tr', { hasText: 'TestLand' });
    await expect(row).toBeVisible();
  });
  test('Listar todos los recursos', async ({ page }) => {
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('Editar un recurso', async ({ page }) => {
    const editButton = page.locator('tbody tr:has-text("portugal") button:has-text("Editar")');
    await editButton.click();

    await page.fill('input[type="number"]', '1200'); // cambiar salario
    await page.click('button:has-text("Actualizar")');

    await expect(page.locator('p')).toHaveText(/actualizado correctamente/);
  });

  test('Buscar un recurso', async ({ page }) => {
    await page.fill('input[placeholder="País"]', 'portugal');
    await page.click('button:has-text("Buscar")');

    const row = page.locator('tbody tr', { hasText: 'portugal' });
    await expect(row).toBeVisible();
  });

  test('Borrar un recurso concreto', async ({ page }) => {
    const deleteButton = page.locator('tbody tr:has-text("portugal") button:has-text("Borrar")');
    await deleteButton.click();

    await expect(page.locator('p')).toHaveText(/eliminado correctamente/);
  });

  test('Borrar todos los recursos', async ({ page }) => {
    await page.click('button:has-text("Borrar Todos")');
    await expect(page.locator('p')).toHaveText(/Todos los recursos fueron eliminados correctamente/);
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBe(1); // solo la fila de creación queda
  });
});