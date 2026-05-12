<script>
    import { onMount } from 'svelte';
    import * as echarts from 'echarts';

    let loading = $state(true);

    onMount(async () => {
        // 1. Cargamos la API de Pandemias y vuestra API de Salarios en paralelo
        const [resPan, resSmi] = await Promise.all([
            fetch("https://sos2526-10.onrender.com/api/v2/pandemics"),
            fetch("/api/v2/minimum-interprofessional-wages")
        ]);

        if (resPan.ok && resSmi.ok) {
            const pandemicData = await resPan.json();
            const smiData = await resSmi.json();

            // 2. Lógica de integración: Buscamos países comunes
            // Filtramos para que la gráfica no sea un caos de países
            const targetCountries = ["Spain", "Italy", "Germany", "France", "USA", "China", "Brazil"];

            const integratedData = targetCountries.map(country => {
                const pandemic = pandemicData.find(p => p.country.toLowerCase() === country.toLowerCase());
                const smi = smiData.find(s => s.country.toLowerCase() === country.toLowerCase());

                return {
                    name: country,
                    affected: pandemic ? pandemic.affected : 0,
                    // Normalizamos el SMI para que quepa en la escala del gráfico
                    smi: smi ? smi.nmw_on_dollar : 0
                };
            }).filter(d => d.affected > 0 || d.smi > 0);

            // 3. Configuramos ECharts con un gráfico de barras doble (Comparativo)
            const chartDom = document.getElementById('chartG10');
            const myChart = echarts.init(chartDom);

            myChart.setOption({
                title: { text: 'Pandemia vs Capacidad Económica', left: 'center' },
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { data: ['Afectados', 'SMI (USD)'], top: '10%' },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'value', boundaryGap: [0, 0.01] },
                yAxis: { type: 'category', data: integratedData.map(d => d.name) },
                series: [
                    {
                        name: 'Afectados',
                        type: 'bar',
                        data: integratedData.map(d => d.affected),
                        itemStyle: { color: '#c23531' }
                    },
                    {
                        name: 'SMI (USD)',
                        type: 'bar',
                        data: integratedData.map(d => d.smi),
                        itemStyle: { color: '#2f4554' }
                    }
                ]
            });
        }
        loading = false;
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver al Panel</a>
    
    <div class="card shadow-sm p-4">
        <h3>🦠 Integración: Impacto de Pandemias vs Salario Mínimo</h3>
        <p class="text-muted">
            ¿Existe relación entre el salario mínimo de un país y el número de afectados por pandemias? Cruzamos datos del Grupo 10 con nuestra propia API.
        </p>
        <hr />

        {#if loading}
            <div class="text-center py-5">
                <div class="spinner-border text-danger" role="status"></div>
                <p>Cruzando datos sanitarios y económicos...</p>
            </div>
        {/if}

        <div id="chartG10" style="width: 100%; height: 500px;"></div>
        
        <div class="alert alert-secondary mt-3">
            <small>
                <b>Análisis:</b> Las barras rojas representan el volumen de población afectada, mientras que las oscuras representan el SMI. Esta comparativa permite analizar visualmente la resiliencia económica de cada país frente a crisis sanitarias.
            </small>
        </div>
    </div>
</div>