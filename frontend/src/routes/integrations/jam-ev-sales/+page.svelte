<script>
    import { onMount } from 'svelte';
    import ApexCharts from 'apexcharts';

    onMount(async () => {
        const res = await fetch("https://sos2526-16.onrender.com/api/v1/global-ev-sales");
        if (res.ok) {
            const data = await res.json();
            const options = {
                series: [data[0]?.sales_share || 0],
                chart: { height: 350, type: 'radialBar' },
                labels: [data[0]?.country || 'Ventas EV'],
                colors: ['#20E647']
            };
            const chart = new ApexCharts(document.querySelector("#chartG16"), options);
            chart.render();
        }
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver</a>
    <h3>⚡ Global EV Sales (G16)</h3>
    <div id="chartG16"></div>
</div>