<script>
    import { onMount } from 'svelte';
    import * as echarts from 'echarts';

    onMount(async () => {
        const res = await fetch("https://sos2526-10.onrender.com/api/v2/pandemics");
        if (res.ok) {
            const data = await res.json();
            const chartDom = document.getElementById('chartG10');
            const myChart = echarts.init(chartDom);
            
            // Adaptamos los nombres de los campos si es necesario
            const plotData = data.slice(0, 8).map(d => ({
                value: d.affected || 0,
                name: d.country || "País"
            }));

            myChart.setOption({
                title: { text: 'Distribución de Afectados', left: 'center' },
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'funnel',
                    data: plotData
                }]
            });
        }
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver</a>
    <h3>🦠 Pandemias (G10)</h3>
    <div id="chartG10" style="width: 100%; height: 500px;"></div>
</div>