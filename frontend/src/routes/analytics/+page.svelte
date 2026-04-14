<script>
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    // Rutas de las 3 APIs
    let API_JAM = "/api/v2/happiness-indices";
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
            // Peticiones a prueba de fallos
            const fetchSafe = async (url) => {
                try {
                    const res = await fetch(url);
                    if (res.ok) return await res.json();
                    return [];
                } catch (e) {
                    return [];
                }
            };

            const dataJAM = await fetchSafe(API_JAM);
            const dataYHX = await fetchSafe(API_YHX);
            const dataSMB = await fetchSafe(API_SMB);

            // 🌟 EL DICCIONARIO MÁGICO 🌟
            // Mapeamos los países que tienen datos en al menos 2 o 3 de vuestras APIs
            const countriesMap = [
                { label: "España", jam: "spain", yhx: "españa", smb: "spain" },
                { label: "Alemania", jam: "germany", yhx: "alemania", smb: null },
                { label: "Estados Unidos", jam: "united_states", yhx: null, smb: "united states" }
            ];

            const labels = [];
            let happinessData = [];
            let densityData = [];
            let wageData = [];

            countriesMap.forEach(c => {
                labels.push(c.label);

                // Buscamos el país en cada API (sin importar el año, cogemos el primero que haya)
                let jam = c.jam ? dataJAM.find(d => d.country === c.jam) : null;
                let yhx = c.yhx ? dataYHX.find(d => d.country === c.yhx) : null;
                let smb = c.smb ? dataSMB.find(d => d.country === c.smb) : null;

                happinessData.push(jam ? jam.happiness_score : 0);
                
                // Debéis mirar que he puesto el nombre de vuestro dato bien:
                densityData.push(yhx ? (yhx.density || yhx.densidad || yhx.population_density || 0) : 0); 
                wageData.push(smb ? (smb.salario || smb.minimum_wage || smb.salario_usd || 0) : 0); 
            });

            renderChart(labels, happinessData, densityData, wageData);
            
        } catch (error) {
            mensajeError = "Error inesperado al procesar los datos.";
            console.error(error);
        }
    }

    function renderChart(labels, happiness, density, wage) {
        import('highcharts').then(Highcharts => {
            Highcharts.default.chart(chartContainer, {
                chart: { type: 'column' },
                title: { text: 'Análisis Integrado: Felicidad, Densidad y Salarios' },
                subtitle: { text: 'Datos combinados de las 3 APIs (Años más recientes)' },
                xAxis: {
                    categories: labels,
                    crosshair: true
                },
                yAxis: [
                    { // Primario(yo)
                        title: { text: 'Felicidad', style: { color: '#2ecc71' } },
                        labels: { style: { color: '#2ecc71' } }
                    }, 
                    { // Secundario(Adri)
                        title: { text: 'Densidad', style: { color: '#3498db' } },
                        labels: { style: { color: '#3498db' } },
                        opposite: true
                    }, 
                    { // Terciario(Samanta)
                        title: { text: 'Salario', style: { color: '#e74c3c' } },
                        labels: { style: { color: '#e74c3c' } },
                        opposite: true
                    }
                ],
                tooltip: { shared: true },
                series: [
                    { name: 'Felicidad (JAM)', data: happiness, yAxis: 0, color: '#2ecc71' },
                    { name: 'Densidad (YHX)', data: density, yAxis: 1, color: '#3498db' },
                    { name: 'Salario (SMB)', data: wage, yAxis: 2, color: '#e74c3c' }
                ],
                credits: { enabled: false }
            });
        });
    }

    onMount(() => {
        loadData();
    });
</script>

<main>
    <h1>📈 Analíticas Integradas del Grupo</h1>
    <p>Comparativa de nuestros recursos adaptando los datos de cada API.</p>

    {#if mensajeError}
        <p style="color: red; font-weight: bold;">{mensajeError}</p>
    {/if}

    <div bind:this={chartContainer} style="width: 100%; height: 500px; margin: 0 auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px;"></div>
</main>

<style>
    main { font-family: sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; text-align: center; }
</style>