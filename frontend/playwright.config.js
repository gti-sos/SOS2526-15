// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    testMatch: '**/e2e.test.js',
    
    // Timeout global por test
    timeout: 30000,

    // Reintentos en CI para evitar flakiness
    retries: process.env.CI ? 2 : 0,

    // Ejecutar los tests en paralelo por archivo, secuencial dentro de cada describe
    fullyParallel: false,
    workers: 1,

    // Reporter
    reporter: process.env.CI ? 'github' : 'list',

    use: {
        // La URL base se inyecta via variable de entorno en CI
        baseURL: process.env.BASE_URL || 'http://localhost:8080',

        // Capturar trazas en fallo
        trace: 'on-first-retry',

        // Screenshot en fallo
        screenshot: 'only-on-failure',

        // Sin cabecera (headless)
        headless: true,
    },

    projects: [
        {
            name: 'chromium',
            use: {
                browserName: 'chromium',
            },
        },
    ],
});
