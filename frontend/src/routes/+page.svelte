<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>


<script>
// lo nuevo //
    const repoUrl = "https://github.com/gti-sos/SOS2526-15"; 
</script>

<svelte:head>
    <title>SOS2526-15 - Inicio</title>
</svelte:head>

<main>
    <h1>Proyecto SOS2526 - Grupo 15</h1>
    <p class="subtitle">Bienvenido a la página principal de nuestro proyecto de la asignatura.</p>

    <div class="enlaces-globales">
        <a href={repoUrl} target="_blank" rel="noopener noreferrer" class="btn-github">
            📁 Repositorio de GitHub del Equipo
        </a>
    </div>

    <h2>Componentes del Equipo y APIs</h2>

    <div class="equipo">
        <section class="tarjeta">
            <h3>Javier Arroyo</h3>
            <p><strong>Fuente de datos:</strong> Índices de Felicidad (<em>happiness-indices</em>)</p>
            <ul>
                <li>🖥️ <a href="/happiness-indices">Interfaz Visual (Front-end)</a></li>
                <li>⚙️ <a href="/api/v1/happiness-indices">URL Base API (v1)</a></li>
                <li>⚙️ <a href="/api/v2/happiness-indices">URL Base API (v2)</a></li>
                <li>📚 <a href="https://documenter.getpostman.com/view/52395798/2sBXigMtLE" target="_blank">Documentación Postman</a></li>
            </ul>
        </section>

        <section class="tarjeta">
            <h3>Adrián López Gamboa</h3>
            <p><strong>Fuente de datos:</strong> Densidades de Población (<em>population-densities</em>)</p>
            <ul>
                <li>🖥️ <a href="/population-densities">Interfaz Visual (Front-end)</a></li>
                <li>⚙️ <a href="/api/v1/population-densities">URL Base API (v1)</a></li>
                <li>📚 <a href="/api/v1/population-densities/docs" target="_blank">Documentación Postman</a></li>
            </ul>
        </section>

        <section class="tarjeta">
            <h3>Samanta Montoya Baena</h3>
            <p><strong>Fuente de datos:</strong> Salarios Mínimos (<em>minimum-interprofessional-wages</em>)</p>
            <ul>
                <li>🖥️ <a href="/minimum-interprofessional-wages">Interfaz Visual (Front-end)</a></li>
                <li>⚙️ <a href="/api/v1/minimum-interprofessional-wages">URL Base API (v1)</a></li>
                <li>📚 <a href="/api/v1/minimum-interprofessional-wages/docs" target="_blank">Documentación Postman</a></li>
            </ul>
        </section>
    </div>
</main>

<style>
    /* Estilos limpios y profesionales para cumplir la rúbrica con buena nota */
    main {
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
        color: #333;
    }
    h1, h2 {
        text-align: center;
        color: #1a365d;
    }
    .subtitle {
        text-align: center;
        color: #666;
        margin-bottom: 2rem;
    }
    .enlaces-globales {
        text-align: center;
        margin-bottom: 3rem;
    }
    .btn-github {
        display: inline-block;
        background-color: #24292e;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        transition: background-color 0.2s;
    }
    .btn-github:hover {
        background-color: #000;
    }
    .equipo {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    .tarjeta {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
        background-color: #f8fafc;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .tarjeta h3 {
        margin-top: 0;
        color: #2b6cb0;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 0.5rem;
    }
    ul {
        list-style-type: none;
        padding: 0;
        margin-top: 1rem;
    }
    li {
        margin-bottom: 0.75rem;
    }
    a {
        color: #3182ce;
        text-decoration: none;
        font-weight: 500;
    }
    a:hover {
        text-decoration: underline;
        color: #2c5282;
    }
</style>