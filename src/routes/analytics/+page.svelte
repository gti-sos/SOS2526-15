<script>
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    // 1. Rutas
    let API_JAM = "/api/v2/happiness-indices";
    // Debo asegurarme que las v2 de ellos la he puesto bien
    let API_YHX = "/api/v2/population-densities"; 
    let API_SMB = "/api/v2/minimum-wages"; 

    if (dev) {
        API_JAM = 'http://localhost:8080' + API_JAM;
        API_YHX = 'http://localhost:8080' + API_YHX;
        API_SMB = 'http://localhost:8080' + API_SMB;
    }

    let chartContainer;
    let mensajeError = "";

    async function loadData() {
        try {
            const [resJAM, resYHX, resSMB] = await Promise.all([
                fetch(API_JAM),
                fetch(API_YHX),
                fetch(API_SMB)
            ]);

            const dataJAM = await resJAM.json();
            const dataYHX = await resYHX.json();
            const dataSMB = await resSMB.json();

            // Comparo un año concreto
            const yearTarget = 2023;

            // Debo asegurarme que estos países estén en los 3
            const countries = ["spain", "finland", "germany", "brazil", "japan"]; 

            let happinessData = [];
            let densityData = [];
            let wageData = [];

            // Extraemos los datos para esos países en ese año
            countries.forEach(country => {
                let jam = dataJAM.find(d => d.country === country && d.year === yearTarget);
                let yhx = dataYHX.find(d => d.country === country && d.year === yearTarget);
                let smb = dataSMB.find(d => d.country === country && d.year === yearTarget);

                happinessData.push(jam ? jam.happiness_score : 0);
                
                // Debo asegurarme que esas son las propiedades como de Adri y Samanta
                densityData.push(yhx ? yhx.density : 0); 
                wageData.push(smb ? smb.minimum_wage : 0); 
            });
            renderChart(countries, happinessData, densityData, wageData);
        } catch (error) {
            mensajeError = "Error al cargar los datos de las APIs grupales.";
            console.error(error);
        }
    }

    function renderChart(countries, happiness, density, wage) {
        import('highcharts').then(Highcharts => {
            Highcharts.default.chart(chartContainer, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Análisis Integrado 2023: Felicidad, Densidad y Salarios'
                },
                xAxis: {
                    categories: countries,
                    crosshair: true
                },
                yAxis: [
                    { // Eje Y Primario (Izquierda) - Para Felicidad(yo)
                        title: { text: 'Puntuación de Felicidad', style: { color: '#2ecc71' } },
                        labels: { style: { color: '#2ecc71' } }
                    }, 
                    { // Eje Y Secundario (Derecha) - Para Densidad(Adri)
                        title: { text: 'Densidad Poblacional', style: { color: '#3498db' } },
                        labels: { style: { color: '#3498db' } },
                        opposite: true
                    }, 
                    { // Eje Y Terciario (Derecha más alejado) - Para Salarios(Samanta)
                        title: { text: 'Salario Mínimo', style: { color: '#e74c3c' } },
                        labels: { style: { color: '#e74c3c' } },
                        opposite: true
                    }
                ],
                tooltip: {
                    shared: true
                },
                series: [
                    { name: 'Felicidad (JAM)', data: happiness, yAxis: 0, color: '#2ecc71' },
                    { name: 'Densidad (YHX)', data: density, yAxis: 1, color: '#3498db' },
                    { name: 'Salario (SMB)', data: wage, yAxis: 2, color: '#e74c3c' }
                ]
            });
        });
    }

    onMount(() => {
        loadData();
    });
</script>

<main>
    <h1>📈 Analíticas Integradas del Grupo</h1>
    <p>Comparativa de nuestros 3 recursos para una selección de países en 2023.</p>

    {#if mensajeError}
        <p style="color: red;">{mensajeError}</p>
    {/if}

    <div bind:this={chartContainer} style="width: 100%; height: 500px; margin: 0 auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px;"></div>
</main>

<style>
    main {
        font-family: sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
    }
</style>