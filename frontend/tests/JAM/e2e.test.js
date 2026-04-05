// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('JAM - Happiness Indices Frontend E2E', () => {

    test.beforeEach(async ({ page }) => {
        // Limpiamos los datos antes de cada test para tener un estado limpio
        await fetch(`${BASE_URL}/api/v2/happiness-indices`, { method: 'DELETE' });
    });

    test('La página carga correctamente y muestra el título', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await expect(page.locator('h1')).toContainText('Índices de Felicidad');
    });

    test('El botón Cargar Datos Iniciales carga datos y los muestra en la tabla', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        // Click en cargar datos iniciales
        await page.click('button.btn-load');

        // Esperar a que aparezcan filas en la tabla
        await expect(page.locator('tbody tr')).toHaveCount(21, { timeout: 10000 });
    });

    test('Se puede añadir un nuevo país y aparece en la tabla', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        // Rellenar el formulario
        await page.fill('input[placeholder="País"]', 'testcountry');
        await page.fill('input[placeholder="Año"]', '2024');
        await page.fill('input[placeholder="Puntuación de Felicidad"]', '6.500');
        await page.fill('input[placeholder="PIB per cápita"]', '1.500');
        await page.fill('input[placeholder="Soporte Social"]', '1.200');

        await page.click('button.btn-add');

        // El nuevo país debe aparecer en la tabla
        await expect(page.locator('tbody')).toContainText('testcountry');
        await expect(page.locator('tbody')).toContainText('2024');
    });

    test('Se puede borrar un registro', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        // Primero cargamos datos
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Contar filas antes de borrar
        const countBefore = await page.locator('tbody tr').count();

        // Borrar primera fila
        await page.locator('button.btn-delete').first().click();

        // Debe haber una fila menos
        await expect(page.locator('tbody tr')).toHaveCount(countBefore - 1, { timeout: 5000 });
    });

    test('Se puede navegar a la página de edición de un recurso', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        // Cargar datos
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Click en el botón Editar de la primera fila
        await page.locator('a.btn-edit').first().click();

        // La URL debe contener /happiness-indices/
        await expect(page).toHaveURL(/\/happiness-indices\/.+\/.+/);

        // Debe aparecer el botón de guardar
        await expect(page.locator('button.btn-save')).toBeVisible();
    });

    test('El botón Borrar todos elimina todos los datos', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        // Cargamos datos
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Confirmar el dialog automáticamente
        page.on('dialog', dialog => dialog.accept());

        // Click en borrar todos
        await page.click('button.btn-danger');

        // La tabla debe quedar vacía
        await expect(page.locator('tbody tr')).toHaveCount(0, { timeout: 5000 });
    });
});
