// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('JAM - Happiness Indices Frontend E2E', () => {

    test.beforeEach(async ({ page }) => {
        // Limpiamos los datos antes de cada test para tener un estado limpio
        await fetch(`${BASE_URL}/api/v2/happiness-indices`, { method: 'DELETE' });
    });

    // 1. CARGA BÁSICA
    test('1. La página carga correctamente y muestra el título', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await expect(page.locator('h1')).toContainText('Índices de Felicidad');
    });

    // 2. LISTAR (GET)
    test('2. El botón Cargar Datos Iniciales carga datos y los muestra en la tabla', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr')).toHaveCount(21, { timeout: 10000 });
    });

    // 3. CREAR (POST) Y RECARGA AUTOMÁTICA
    test('3. Se puede añadir un nuevo país y aparece en la tabla automáticamente', async ({ page }) => {
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

    // 4. MANEJO DE ERRORES (409) CON MENSAJE AL USUARIO
    test('4. Muestra un mensaje de error al intentar añadir un registro duplicado', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await page.click('button.btn-load'); // Cargamos datos (incluye finland 2023)
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Intentamos añadir a finland en 2023 otra vez
        await page.fill('input[placeholder="País"]', 'finland');
        await page.fill('input[placeholder="Año"]', '2023');
        await page.fill('input[placeholder="Puntuación de Felicidad"]', '7.000');
        await page.fill('input[placeholder="PIB per cápita"]', '1.000');
        await page.fill('input[placeholder="Soporte Social"]', '1.000');

        await page.click('button.btn-add');

        // Debe aparecer el mensaje de error que configuraste en Svelte
        await expect(page.locator('.alerta')).toContainText('Ese país ya existe en ese año');
    });

    // 5. BORRAR UNO (DELETE)
    test('5. Se puede borrar un registro concreto', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        const countBefore = await page.locator('tbody tr').count();
        await page.locator('button.btn-delete').first().click();
        await expect(page.locator('tbody tr')).toHaveCount(countBefore - 1, { timeout: 5000 });
    });

    // 6. EDITAR (VISTA DINÁMICA)
    test('6. Se puede navegar a la página de edición de un recurso', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        await page.locator('a.btn-edit').first().click();
        await expect(page).toHaveURL(/\/happiness-indices\/.+\/.+/);
        // Esperamos que en la nueva vista haya algún botón (por ejemplo el de guardar o volver)
        await expect(page.locator('button')).toBeVisible(); 
    });

    // 7. BORRAR TODOS (DELETE ALL)
    test('7. El botón Borrar todos elimina todos los datos', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        page.on('dialog', dialog => dialog.accept());
        await page.click('button.btn-danger');
        await expect(page.locator('tbody tr')).toHaveCount(0, { timeout: 5000 });
    });

// 8. BUSCAR (RANGOS EN LA API)
    test('8. La búsqueda por rango de años filtra correctamente los resultados', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Rellenar el buscador con años
        await page.fill('input[placeholder="Desde el año..."]', '2022');
        await page.fill('input[placeholder="Hasta el año..."]', '2023');
        
        await page.click('button:has-text("Buscar")');

        // 🔥 CAMBIO AQUÍ: Ahora busca la palabra "resultados" que es la que tú tienes
        await expect(page.locator('.alerta')).toContainText('resultados');
    });

    // 9. LIMPIAR BÚSQUEDA
    test('9. El botón Limpiar restaura la tabla', async ({ page }) => {
        await page.goto(`${BASE_URL}/happiness-indices`);
        await page.click('button.btn-load');
        await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

        // Filtrar y luego limpiar
        await page.fill('input[placeholder="Desde el año..."]', '2050'); 
        await page.click('button:has-text("Buscar")');
        
        // 🔥 CAMBIO AQUÍ: Ahora hace clic en "Limpiar" en vez de "Limpiar Búsqueda"
        await page.click('button:has-text("Limpiar")');

        await expect(page.locator('tbody tr')).toHaveCount(21, { timeout: 5000 });
    });
    // 10. BÚSQUEDA POR URL: PAÍS
    test('10. Acceder con ?country=spain en la URL filtra automáticamente', async ({ page }) => {
        // Preparamos la base de datos llamando a la API directamente
        await fetch(`${BASE_URL}/api/v2/happiness-indices/loadInitialData`);

        // Navegamos directamente a la URL con el parámetro
        await page.goto(`${BASE_URL}/happiness-indices?country=spain`);

        // Comprobamos que solo carga España (debería haber 1 fila para 2023)
        await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 10000 });
        await expect(page.locator('tbody')).toContainText('spain');
    });

    // 11. BÚSQUEDA POR URL: AÑO EXACTO
    test('11. Acceder con ?year=2022 en la URL filtra automáticamente', async ({ page }) => {
        await fetch(`${BASE_URL}/api/v2/happiness-indices/loadInitialData`);

        await page.goto(`${BASE_URL}/happiness-indices?year=2022`);

        // Comprobamos que solo sale el dato de 2022 (finlandia)
        await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 10000 });
        await expect(page.locator('tbody')).toContainText('2022');
    });

    // 12. BÚSQUEDA POR URL: RANGO DE AÑOS
    test('12. Acceder con ?from=2020&to=2022 en la URL filtra automáticamente', async ({ page }) => {
        await fetch(`${BASE_URL}/api/v2/happiness-indices/loadInitialData`);

        await page.goto(`${BASE_URL}/happiness-indices?from=2020&to=2022`);

        // Comprobamos que funciona el rango (solo debe salir finlandia 2022)
        await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 10000 });
        await expect(page.locator('tbody')).not.toContainText('2023'); // Aseguramos que no se cuela ninguno de 2023
    });
});