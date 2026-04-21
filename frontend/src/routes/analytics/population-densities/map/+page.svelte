<script>
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    let API = '/api/v1/population-densities';
    if (dev) {
        API = 'http://localhost:8080' + API;
    }

    let mapElement;
    let mensajeError = "";

    // Diccionario de coordenadas para los países (Añade más si tu base de datos tiene otros distintos)
    const coordenadasPaises = {
        "españa": [40.4637, -3.7492],
        "alemania": [51.1657, 10.4515],
        "francia": [46.2276, 2.2137],
        "italia": [41.8719, 12.5674],
        "portugal": [39.3999, -8.2245],
        "reino unido": [55.3781, -3.4360],
        "estados unidos": [37.0902, -95.7129],
        "china": [35.8617, 104.1954],
        "japon": [36.2048, 138.2529],
        "testlandia": [0, 0] // Para que tus tests E2E no den problemas si pasan por aquí
    };

    async function loadMap() {
        try {
            // 1. Obtenemos los datos de tu API
            const res = await fetch(API);
            if (!res.ok) throw new Error("Error al obtener datos");
            const data = await res.json();

            // 2. Filtramos para quedarnos solo con el año más reciente de cada país
            // (para no pintar 5 puntos superpuestos en España si tienes datos de 5 años distintos)
            const datosRecientes = {};
            data.forEach(d => {
                const pais = d.country.toLowerCase();
                if (!datosRecientes[pais] || datosRecientes[pais].year < d.year) {
                    datosRecientes[pais] = d;
                }
            });

            // 3. Esperamos un poquito a que Leaflet se cargue desde el <svelte:head>
            let checkLeaflet = setInterval(() => {
                if (window.L) {
                    clearInterval(checkLeaflet);
                    dibujarMapa(Object.values(datosRecientes));
                }
            }, 100);

        } catch (error) {
            mensajeError = "No se pudieron cargar los datos para el mapa.";
            console.error(error);
        }
    }

    function dibujarMapa(datos) {
        // Inicializamos el mapa centrado en Europa
        const map = window.L.map(mapElement).setView([40, 0], 2);

        // Añadimos la capa visual del mapa (OpenStreetMap)
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Colocamos un círculo por cada país
        datos.forEach(d => {
            const pais = d.country.toLowerCase();
            const coords = coordenadasPaises[pais];

            if (coords) {
                // Hacemos que el tamaño del círculo dependa de la densidad
                // Limitamos el radio entre 5 y 30 para que no tape todo el mapa ni sea invisible
                const radioCirculo = Math.max(5, Math.min(d.density / 5, 30)); 

                const marker = window.L.circleMarker(coords, {
                    radius: radioCirculo,
                    color: '#e74c3c', // Borde rojo
                    fillColor: '#f39c12', // Relleno naranja
                    fillOpacity: 0.6,
                    weight: 2
                }).addTo(map);

                // Al hacer clic en el punto, mostramos los datos del país
                marker.bindPopup(`
                    <div style="text-align: center;">
                        <h6 style="margin-bottom: 5px; color: #333;"><b>${d.country.toUpperCase()} (${d.year})</b></h6>
                        <hr style="margin: 5px 0;">
                        <b>Densidad:</b> ${d.density} hab/km²<br>
                        <b>Población:</b> ${d.population.toLocaleString()} hab.<br>
                        <b>Variación:</b> ${d.percentage_change}%
                    </div>
                `);
            }
        });
    }

    onMount(() => {
        loadMap();
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</svelte:head>

<main class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>🌍 Mapa de Densidad de Población</h2>
        
        <div class="d-flex gap-2">
            <a href="/analytics/population-densities" class="btn btn-outline-secondary">
                📊 Ver Gráfica Individual
            </a>
            <a href="/population-densities" class="btn btn-outline-primary">
                ⚙️ Gestionar Datos
            </a>
        </div>
    </div>

    <p class="text-muted">El tamaño de los círculos es proporcional a la densidad de población registrada en el año más reciente de cada país.</p>

    {#if mensajeError}
        <div class="alert alert-danger" role="alert">
            {mensajeError}
        </div>
    {/if}

    <div class="card p-2 shadow-sm">
        <div bind:this={mapElement} style="width: 100%; height: 600px; border-radius: 6px; z-index: 1;"></div>
    </div>
</main>
