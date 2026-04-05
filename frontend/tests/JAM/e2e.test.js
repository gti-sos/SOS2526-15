// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const API = `${BASE_URL}/api/v2/happiness-indices`;

test.describe('JAM - Happiness Indices Frontend E2E', () => {

    test.beforeEach(async ({ page }) => {
        // Limpiamos los datos antes de cada test para tener un estado limpio
        await fetch(API, { method: 'DELETE' });
    });

    // ─────────────────────────────────────────────
    // 1. Listar todos los recursos
    // ─────────────────────────────────────────────
    test('La página carga correctamente y muestra el título', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await expect(page.locator('h1')).toContainText('Índices de Felicidad');
    });

    test('El botón "Cargar Datos de Prueba" carga datos y los muestra en la tabla', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');

        // Deben aparecer las 21 filas de datos iniciales
        await expect(page.locator('tbody tr')).toHaveCount(21, { timeout: 10000 });
    });

    // ─────────────────────────────────────────────
    // 2. Crear un recurso
    // ─────────────────────────────────────────────
    test('Se puede añadir un nuevo país y aparece en la tabla', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.fill('input[placeholder="País"]', 'testcountry');
        await page.fill('input[placeholder="Año"]', '2024');
        await page.fill('input[placeholder="Puntuación de Felicidad"]', '6.500');
        await page.fill('input[placeholder="PIB per cápita"]', '1.500');
        await page.fill('input[placeholder="Soporte Social"]', '1.200');

        await page.click('button.btn-add');

        await expect(page.locator('tbody')).toContainText('testcountry');
        await expect(page.locator('tbody')).toContainText('2024');
    });

    // ─────────────────────────────────────────────
    // 3. Borrar un recurso concreto
    // ─────────────────────────────────────────────
    test('Se puede borrar un registro concreto', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        // Cargamos datos
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        const countBefore = await page.locator('tbody tr').count();

        // Borramos la primera fila
        await page.locator('button.btn-delete').first().click();

        await expect(page.locator('tbody tr')).toHaveCount(countBefore - 1, { timeout: 5000 });
    });

    // ─────────────────────────────────────────────
    // 4. Borrar todos los recursos
    // ─────────────────────────────────────────────
    test('El botón "Borrar todos los datos" elimina toda la colección', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Aceptar el confirm() del navegador automáticamente
        page.on('dialog', dialog => dialog.accept());

        await page.click('button.btn-danger');

        await expect(page.locator('tbody tr')).toHaveCount(0, { timeout: 5000 });
    });

    // ─────────────────────────────────────────────
    // 5. Editar un recurso en vista separada dinámica
    // ─────────────────────────────────────────────
    test('Se puede navegar a la vista de edición de un recurso', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Click en el primer enlace de edición
        await page.locator('a.btn-edit').first().click();

        // La URL debe seguir el patrón /happiness-indices/<country>/<year>
        await expect(page).toHaveURL(/\/happiness-indices\/.+\/.+/);

        // La vista de edición debe mostrar el formulario con el botón de guardar
        await expect(page.locator('button.btn-save')).toBeVisible();
    });

    test('Se puede editar y guardar los cambios de un recurso', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Ir a la vista de edición del primer recurso
        await page.locator('a.btn-edit').first().click();
        await expect(page).toHaveURL(/\/happiness-indices\/.+\/.+/);

        // Modificar el campo Puntuación
        const inputScore = page.locator('input[type="number"]').first();
        await inputScore.fill('9.999');

        await page.click('button.btn-save');

        // El mensaje de confirmación debe aparecer
        await expect(page.locator('.alerta')).toContainText('✅');
    });

    test('El botón "← Volver" de la vista de edición regresa al listado', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        await page.locator('a.btn-edit').first().click();
        await expect(page).toHaveURL(/\/happiness-indices\/.+\/.+/);

        // Clic en volver
        await page.locator('a.btn-back').click();

        await expect(page).toHaveURL(/\/happiness-indices$/);
    });

    // ─────────────────────────────────────────────
    // 6. Buscar recursos usando la búsqueda de la API
    //    (filtros: country, year, from/to, happiness_score,
    //     gdp_per_capita, social_support, limit, offset)
    // ─────────────────────────────────────────────
    test('La búsqueda por país filtra correctamente los resultados', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Buscar sólo "finland" (hay 2 entradas: 2022 y 2023)
        await page.fill('input[placeholder="País"]', 'finland');
        await page.locator('section >> button', { hasText: 'Buscar' }).click();

        await expect(page.locator('tbody tr')).toHaveCount(2, { timeout: 5000 });
        await expect(page.locator('tbody')).toContainText('finland');
    });

    test('La búsqueda por año exacto filtra correctamente', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Buscar año 2022 (sólo hay 1 entrada: finland 2022)
        await page.fill('input[placeholder="Año"]', '2022');
        await page.locator('section >> button', { hasText: 'Buscar' }).click();

        await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 5000 });
        await expect(page.locator('tbody')).toContainText('2022');
    });

    test('La búsqueda con limit y offset pagina los resultados correctamente', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Pedir sólo 5 resultados
        await page.fill('input[placeholder="Límite"]', '5');
        await page.locator('section >> button', { hasText: 'Buscar' }).click();

        await expect(page.locator('tbody tr')).toHaveCount(5, { timeout: 5000 });
    });

    test('El botón "Limpiar" restaura todos los resultados', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr')).toHaveCount(21, { timeout: 10000 });

        // Filtrar primero
        await page.fill('input[placeholder="País"]', 'finland');
        await page.locator('section >> button', { hasText: 'Buscar' }).click();
        await expect(page.locator('tbody tr')).toHaveCount(2, { timeout: 5000 });

        // Limpiar
        await page.locator('section >> button', { hasText: 'Limpiar' }).click();

        // Deben volver las 21 filas
        await expect(page.locator('tbody tr')).toHaveCount(21, { timeout: 5000 });
    });

    test('La búsqueda combinada (país + año) devuelve el recurso exacto', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        await page.fill('input[placeholder="País"]', 'spain');
        await page.fill('input[placeholder="Año"]', '2023');
        await page.locator('section >> button', { hasText: 'Buscar' }).click();

        await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 5000 });
        await expect(page.locator('tbody')).toContainText('spain');
        await expect(page.locator('tbody')).toContainText('2023');
    });

    test('Una búsqueda sin resultados muestra la tabla vacía', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);

        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        await page.fill('input[placeholder="País"]', 'paisinexistente');
        await page.locator('section >> button', { hasText: 'Buscar' }).click();

        await expect(page.locator('tbody tr')).toHaveCount(0, { timeout: 5000 });
    });

});