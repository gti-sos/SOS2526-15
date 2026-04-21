<script>
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    // Usamos la ruta de tu API
    let API = '/api/v1/population-densities';
    if (dev) {
        API = 'http://localhost:8080' + API;
    }

    let chartContainer;
    let mensajeError = "";

    async function loadData() {
        try {
            const res = await fetch(API);
            if (!res.ok) {
                throw new Error("Error al obtener los datos de la API.");
            }
            const data = await res.json();

            // Preparamos los datos para Highcharts
            // Eje X: El nombre del país y el año (ej: "España (2020)")
            const categorias = data.map(d => `${d.country} (${d.year})`);
            
            // Eje Y: Los valores numéricos
            const densidades = data.map(d => d.density);
            const poblaciones = data.map(d => d.population);

            renderChart(categorias, densidades, poblaciones);
            
        } catch (error) {
            mensajeError = "No se pudieron cargar los datos. Asegúrate de tener datos en la base de datos.";
            console.error(error);
        }
    }

    function renderChart(categorias, densidades, poblaciones) {
        // Importamos Highcharts de forma dinámica para que no de problemas con SvelteKit
        import('highcharts').then(Highcharts => {
            Highcharts.default.chart(chartContainer, {
                chart: { 
                    type: 'area' // ¡AQUÍ ESTÁ EL TIPO! Cámbialo a 'bar', 'spline' o 'scatter' si otro compañero ya usa 'area'
                },
                title: { 
                    text: 'Análisis Individual: Densidad y Población' 
                },
                subtitle: {
                    text: 'Datos obtenidos de /api/v1/population-densities'
                },
                xAxis: {
                    categories: categorias,
                    crosshair: true
                },
                yAxis: [
                    { // Eje Y principal (Izquierda) para Densidad
                        title: { text: 'Densidad', style: { color: '#8e44ad' } },
                        labels: { style: { color: '#8e44ad' } }
                    },
                    { // Eje Y secundario (Derecha) para Población
                        title: { text: 'Población', style: { color: '#f39c12' } },
                        labels: { style: { color: '#f39c12' } },
                        opposite: true // Lo ponemos a la derecha para que no se pisen
                    }
                ],
                tooltip: { 
                    shared: true 
                },
                series: [
                    { 
                        name: 'Densidad de Población', 
                        data: densidades, 
                        yAxis: 0, 
                        color: '#8e44ad',
                        fillOpacity: 0.3
                    },
                    { 
                        name: 'Población Total', 
                        data: poblaciones, 
                        yAxis: 1, 
                        color: '#f39c12',
                        fillOpacity: 0.3
                    }
                ],
                credits: { enabled: false }
            });
        });
    }

    onMount(() => {
        loadData();
    });
</script>

<main class="container mt-4">
    <h2 class="mb-4">📊 Analítica Individual de YHX</h2>

    {#if mensajeError}
        <div class="alert alert-danger" role="alert">
            {mensajeError}
        </div>
    {/if}

    <div class="card p-3 shadow-sm">
        <div bind:this={chartContainer} style="width: 100%; height: 500px; margin: 0 auto;"></div>
    </div>
</main>