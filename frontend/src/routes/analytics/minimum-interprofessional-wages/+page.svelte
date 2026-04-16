<script>
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    let API = "/api/v2/minimum-interprofessional-wages";
    if (dev) API = "http://localhost:8080" + API;

    let chartContainer;
    let mensajeError = "";

    async function loadData() {
        try {
            const res = await fetch(API);
            if (!res.ok) throw new Error("Error cargando datos");

            const data = await res.json();

            // Nos quedamos con UN dato por país (por ejemplo el más reciente)
            const latestByCountry = {};

            data.forEach(d => {
                if (!latestByCountry[d.country] || d.date > latestByCountry[d.country].date) {
                    latestByCountry[d.country] = d;
                }
            });

            // Formato para PIE
            const pieData = Object.values(latestByCountry).map(d => ({
                name: d.country + " (" + d.date + ")",
                y: d.nmw_on_dollar
            }));

            renderChart(pieData);

        } catch (e) {
            mensajeError = "No se pudieron cargar los datos.";
            console.error(e);
        }
    }

    function renderChart(dataPoints) {
        import('highcharts').then(Highcharts => {
            Highcharts.default.chart(chartContainer, {
                chart: {
                    type: 'pie' // ✅ DISTINTO a todos
                },
                title: {
                    text: 'Distribución del Salario Mínimo por País'
                },
                subtitle: {
                    text: 'Datos de tu API SMB (último año disponible)'
                },
                tooltip: {
                    pointFormat: '<b>{point.y} USD</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br/>{point.percentage:.1f} %'
                        }
                    }
                },
                series: [{
                    name: 'Salario mínimo',
                    colorByPoint: true,
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
    <h1>💰 Analítica de Salarios Mínimos</h1>
    <p>
        Este gráfico muestra la <strong>distribución del salario mínimo</strong> entre países
        según el último año disponible en la API.
    </p>

    {#if mensajeError}
        <p style="color:red; font-weight:bold;">{mensajeError}</p>
    {/if}

    <div bind:this={chartContainer} style="width:100%; height:500px;"></div>

    <a href="/minimum-interprofessional-wages">Volver a la API</a>
</main>