<script>
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import { Button } from '@sveltestrap/sveltestrap';

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
            let data = await res.json();

            // 1. ORDENAR DATOS POR AÑO (Ascendente)
            data.sort((a, b) => a.year - b.year);

            // Preparamos los datos para Highcharts
            const categorias = data.map(d => `${d.country} (${d.year})`);
            const densidades = data.map(d => d.density);
            const poblaciones = data.map(d => d.population);

            renderChart(categorias, densidades, poblaciones);
            
        } catch (error) {
            mensajeError = "No se pudieron cargar los datos. Asegúrate de tener datos en la base de datos.";
            console.error(error);
        }
    }

    function renderChart(categorias, densidades, poblaciones) {
        import('highcharts').then(Highcharts => {
            Highcharts.default.chart(chartContainer, {
                chart: { type: 'area' },
                title: { text: 'Análisis Individual: Densidad y Población' },
                subtitle: { text: 'Datos ordenados cronológicamente' },
                xAxis: {
                    categories: categorias,
                    crosshair: true
                },
                yAxis: [
                    { 
                        title: { text: 'Densidad', style: { color: '#8e44ad' } },
                        labels: { style: { color: '#8e44ad' } }
                    },
                    { 
                        title: { text: 'Población', style: { color: '#f39c12' } },
                        labels: { style: { color: '#f39c12' } },
                        opposite: true 
                    }
                ],
                tooltip: { shared: true },
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
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>📊 Analítica Individual de YHX</h2>
        
        <a href="/population-densities" class="btn btn-outline-primary">
            ⚙️ Gestionar Datos (Añadir/Quitar)
        </a>
    </div>

    {#if mensajeError}
        <div class="alert alert-danger" role="alert">
            {mensajeError}
        </div>
    {/if}

    <div class="card p-3 shadow-sm">
        <div bind:this={chartContainer} style="width: 100%; height: 500px; margin: 0 auto;"></div>
    </div>
</main>