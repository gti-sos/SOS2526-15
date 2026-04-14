<script>
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    let url = "/api/v2/happiness-indices";
    if (dev) url = 'http://localhost:8080' + url;

    let mapElement;
    let mensajeError = "";

    // Diccionario mágico para traducir tus países a Coordenadas en el mapa (Latitud, Longitud)
    const coordenadas = {
        "finland": [61.9241, 25.7482],
        "denmark": [56.2639, 9.5018],
        "iceland": [64.9631, -19.0208],
        "israel": [31.0461, 34.8516],
        "netherlands": [52.1326, 5.2913],
        "sweden": [60.1282, 18.6435],
        "norway": [60.472, 8.4689],
        "switzerland": [46.8182, 8.2275],
        "luxembourg": [49.8153, 6.1296],
        "new_zealand": [-40.9006, 174.886],
        "austria": [47.5162, 14.5501],
        "australia": [-25.2744, 133.7751],
        "germany": [51.1657, 10.4515],
        "united_states": [37.0902, -95.7129],
        "spain": [40.4637, -3.7492],
        "mexico": [23.6345, -102.5528],
        "brazil": [-14.235, -51.9253],
        "argentina": [-38.4161, -63.6167],
        "japan": [36.2048, 138.2529],
        "south_africa": [-30.5595, 22.9375]
    };

    async function loadMap() {
        try {
            // 1. Cargamos los datos de tu API
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error al cargar los datos");
            const data = await res.json();

            // Vamos a coger solo los datos de 2023 para que no haya chinchetas duplicadas en el mismo sitio
            const data2023 = data.filter(d => d.year === 2023);

            // 2. Nos aseguramos de que la librería del mapa (L) ha cargado
            if (!window.L) {
                setTimeout(loadMap, 100);
                return;
            }

            // 3. Creamos el mapa centrado en el medio del mundo con zoom alejado
            const map = window.L.map(mapElement).setView([20, 0], 2);

            // 4. Le ponemos la "piel" al mapa (usamos el estilo estándar de OpenStreetMap)
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // 5. Recorremos tus datos y ponemos las chinchetas
            data2023.forEach(item => {
                const coords = coordenadas[item.country];
                if (coords) {
                    const marker = window.L.marker(coords).addTo(map);
                    
                    // Diseñamos el recuadrito que sale al hacer clic
                    const popupContent = `
                        <div style="text-align:center; min-width: 150px;">
                            <h3 style="margin: 0; color: #2c3e50; text-transform: uppercase;">${item.country.replace('_', ' ')}</h3>
                            <hr style="margin: 5px 0;">
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Felicidad:</strong> ${item.happiness_score} ⭐</p>
                            <p style="margin: 5px 0; color: #7f8c8d;"><strong>PIB:</strong> ${item.gdp_per_capita}</p>
                            <p style="margin: 5px 0; color: #7f8c8d;"><strong>Apoyo Social:</strong> ${item.social_support}</p>
                        </div>
                    `;
                    marker.bindPopup(popupContent);
                }
            });

        } catch (error) {
            mensajeError = "No se pudieron cargar los datos o el mapa.";
            console.error(error);
        }
    }

    onMount(() => {
        loadMap();
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</svelte:head>

<main>
    <h1>🌍 Mapa Mundial de la Felicidad</h1>
    <p>Visualización geoespacial interactiva. Explora el mapa y <strong>haz clic en las chinchetas azules</strong> para ver los detalles de cada país de tu API.</p>

    {#if mensajeError}
        <p class="error">{mensajeError}</p>
    {/if}

    <div bind:this={mapElement} class="mapa-container"></div>
    
    <div class="volver">
        <a href="/happiness-indices" class="btn">Volver a los datos</a>
        <a href="/analytics/happiness-indices" class="btn btn-alt">Ver gráfico Scatter</a>
    </div>
</main>

<style>
    main {
        font-family: sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
    }
    .mapa-container {
        width: 100%;
        height: 550px;
        margin: 20px auto;
        border-radius: 12px;
        box-shadow: 0 6px 15px rgba(0,0,0,0.15);
        z-index: 1; /* Importante para que el mapa no se ponga por encima de otros menús */
        border: 2px solid #ecf0f1;
    }
    .error {
        color: #e74c3c;
        font-weight: bold;
    }
    .volver {
        margin-top: 30px;
        display: flex;
        justify-content: center;
        gap: 15px;
    }
    .btn {
        background-color: #34495e;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        transition: background-color 0.3s;
    }
    .btn:hover {
        background-color: #2c3e50;
    }
    .btn-alt {
        background-color: #8e44ad;
    }
    .btn-alt:hover {
        background-color: #732d91;
    }
</style>