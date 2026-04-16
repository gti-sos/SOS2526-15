<script>
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    let url = "/api/v2/happiness-indices";
    if (dev) url = 'http://localhost:8080' + url;

    let chartContainer;
    let mensajeError = "";

    async function loadData() {
        try {
            // Pillamos TODOS los datos de tu API
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error al cargar los datos");
            const data = await res.json();

            // Formateamos los datos para un Scatter Plot (Dispersión)
            const seriesData = data.map(item => ({
                name: item.country + ' (' + item.year + ')',
                x: item.gdp_per_capita,    // Eje X: Dinero
                y: item.happiness_score,   // Eje Y: Felicidad
                social: item.social_support // Lo guardamos para el mensajito al pasar el ratón
            }));

            renderChart(seriesData);
        } catch (error) {
            mensajeError = "No se pudieron cargar los datos de la API.";
            console.error(error);
        }
    }

    function renderChart(dataPoints) {
        import('highcharts').then(Highcharts => {
            Highcharts.default.chart(chartContainer, {
                chart: {
                    type: 'scatter', // 🌟 TIPO SCATTER: Distinto a line y distinto a column
                    zoomType: 'xy'   // Permite al usuario hacer zoom seleccionando un área
                },
                title: {
                    text: 'Relación entre Riqueza y Felicidad Mundial'
                },
                subtitle: {
                    text: 'Análisis individual de la API de Índices de Felicidad'
                },
                xAxis: {
                    title: {
                        text: 'PIB per cápita (Riqueza)',
                        style: { fontWeight: 'bold' }
                    },
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: true
                },
                yAxis: {
                    title: {
                        text: 'Puntuación de Felicidad',
                        style: { fontWeight: 'bold' }
                    }
                },
                tooltip: {
                    useHTML: true,
                    headerFormat: '<div style="padding: 5px; text-align: center;">',
                    // Este es el cuadrito chulo que sale al pasar el ratón
                    pointFormat: '<b><span style="font-size: 14px; color: #8e44ad;">{point.name}</span></b><br/>' +
                                 '<b>PIB per cápita:</b> {point.x}<br/>' +
                                 '<b>Felicidad:</b> {point.y}<br/>' +
                                 '<b>Soporte Social:</b> {point.social}',
                    footerFormat: '</div>',
                    followPointer: true
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 7, // Tamaño de las bolitas
                            symbol: 'circle',
                            states: {
                                hover: { enabled: true, lineColor: '#333333' }
                            }
                        }
                    }
                },
                series: [{
                    name: 'Países',
                    color: 'rgba(142, 68, 173, 0.6)', // Color morado con algo de transparencia
                    data: dataPoints
                }],
                credits: {
                    enabled: false
                }
            });
        });
    }

    onMount(() => {
        loadData();
    });
</script>

<main>
    <h1>📈 Mi Analítica Individual</h1>
    <p>
        Este gráfico de dispersión (<strong>Scatter Plot</strong>) demuestra cómo afecta el 
        PIB per cápita a la Puntuación de Felicidad. Cada punto representa a un país en un año concreto. 
        <em>¡Puedes hacer clic y arrastrar para hacer zoom!</em>
    </p>

    {#if mensajeError}
        <p class="error">{mensajeError}</p>
    {/if}

    <div bind:this={chartContainer} class="chart-box"></div>
    
    <div class="volver">
        <a href="/happiness-indices" class="btn">Volver a los datos</a>
    </div>
</main>

<style>
    main {
        font-family: sans-serif;
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
    }
    .chart-box {
        width: 100%;
        height: 500px;
        margin: 30px auto;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        border-radius: 10px;
    }
    .error {
        color: #e74c3c;
        font-weight: bold;
        background-color: #fadbd8;
        padding: 10px;
        border-radius: 5px;
    }
    .volver {
        margin-top: 20px;
    }
    .btn {
        background-color: #34495e;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
    }
    .btn:hover {
        background-color: #2c3e50;
    }
</style>