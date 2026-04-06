import { test, expect } from '@playwright/test';

// La URL base ya está configurada en playwright.config.js, así que usamos rutas relativas
const ROUTE = '/population-densities';

test.describe('E2E Tests - Population Densities (YHX)', () => {

    test('1. Debería cargar la página y cargar los datos iniciales', async ({ page }) => {
        // Navegamos a la página
        await page.goto(ROUTE);

        // Verificamos que el título esté visible
        await expect(page.locator('h2', { hasText: 'Gestión de Densidad de Población' })).toBeVisible();

        // Pulsamos el botón de cargar datos iniciales
        await page.click('button:has-text("Cargar Datos Iniciales")');

        // Esperamos a que aparezca el mensaje de éxito o que la tabla se llene con "españa"
        await expect(page.locator('text=españa').first()).toBeVisible();
    });

    test('2. Debería crear un nuevo registro', async ({ page }) => {
        await page.goto(ROUTE);

        // Rellenamos los inputs usando los placeholders que pusimos en el HTML
        await page.fill('input[placeholder="País"]', 'TestLandia');
        await page.fill('input[placeholder="Año"]', '2099');
        await page.fill('input[placeholder="Densidad"]', '150.5');
        await page.fill('input[placeholder="Población"]', '500000');
        await page.fill('input[placeholder="% Cambio"]', '2.5');

        // Hacemos clic en Crear
        await page.click('button:has-text("Crear")');

        // Verificamos que el nuevo país aparece en la tabla
        await expect(page.locator('td', { hasText: 'TestLandia' })).toBeVisible();
    });

    test('3. Debería editar un registro existente', async ({ page }) => {
        await page.goto(ROUTE);

        // Buscamos la fila de TestLandia y hacemos clic en su botón Editar
        // (Playwright buscará la fila que contiene "TestLandia" y luego hará clic en el enlace "Editar" de esa fila)
        const row = page.locator('tr', { hasText: 'TestLandia' });
        await row.locator('text=Editar').click();

        // Verificamos que hemos navegado a la página de edición dinámica
        await expect(page).toHaveURL(/\/population-densities\/TestLandia\/2099/);

        // Cambiamos la población
        await page.fill('text=Población Total >> xpath=following-sibling::input', '600000');
        await page.click('button:has-text("Guardar Cambios")');

        // Comprobamos el mensaje de éxito
        await expect(page.locator('text=Recurso actualizado con éxito')).toBeVisible();
    });

    test('4. Debería borrar un recurso concreto', async ({ page }) => {
        await page.goto(ROUTE);

        // Buscamos la fila de TestLandia y hacemos clic en Borrar
        const row = page.locator('tr', { hasText: 'TestLandia' });
        await row.locator('button:has-text("Borrar")').click();

        // Verificamos que la fila ya no existe en la tabla
        await expect(page.locator('td', { hasText: 'TestLandia' })).not.toBeVisible();
    });

    test('5. Debería buscar y filtrar recursos', async ({ page }) => {
        await page.goto(ROUTE);

        // 1. Cargamos datos para asegurarnos de que tenemos qué buscar
        await page.click('button:has-text("Cargar Datos Iniciales")');
        await expect(page.locator('text=españa').first()).toBeVisible();

        // 2. Buscamos 'alemania' rellenando el input del buscador
        await page.fill('input[placeholder="Filtrar por país..."]', 'alemania');
        await page.click('button:has-text("Buscar")');

        // 3. Comprobamos que alemania está en la tabla y que españa ha desaparecido
        await expect(page.locator('td', { hasText: 'alemania' }).first()).toBeVisible();
        await expect(page.locator('td', { hasText: 'españa' }).first()).not.toBeVisible();

        // 4. Limpiamos la búsqueda
        await page.click('button:has-text("Limpiar Filtros")');

        // 5. Comprobamos que españa vuelve a aparecer al estar la tabla sin filtros
        await expect(page.locator('td', { hasText: 'españa' }).first()).toBeVisible();
    });

    test('6. Debería borrar todos los recursos', async ({ page }) => {
        await page.goto(ROUTE);

        // En Playwright, las alertas/confirms nativos del navegador se aceptan automáticamente por defecto,
        // pero por si acaso, le decimos que cuando salga el confirm() de tu código, le dé a "Aceptar"
        page.on('dialog', dialog => dialog.accept());

        await page.click('button:has-text("Borrar Todos")');

        // Verificamos que sale el mensaje verde de borrado
        await expect(page.locator('text=Todos los registros han sido borrados')).toBeVisible();
    });
});