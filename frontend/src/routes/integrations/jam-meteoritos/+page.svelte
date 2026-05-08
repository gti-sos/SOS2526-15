<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let data = $state([]);

    onMount(async () => {
        const res = await fetch("https://sos2526-14.onrender.com/api/v2/meteorite-landings");
        if (res.ok) {
            data = await res.json();
            const fell = data.filter(m => m.fall === "Fell").length;
            const found = data.filter(m => m.fall === "Found").length;

            new Chart(document.getElementById('chart'), {
                type: 'pie',
                data: {
                    labels: ['Caídos', 'Encontrados'],
                    datasets: [{ data: [fell, found], backgroundColor: ['#FF6384', '#36A2EB'] }]
                }
            });
        }
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-secondary mb-3">⬅️ Volver al menú</a>
    <h3>☄️ Meteoritos (G14)</h3>
    <div style="max-width: 500px; margin: auto;">
        <canvas id="chart"></canvas>
    </div>
</div>