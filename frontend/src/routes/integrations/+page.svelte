<script>
    import { onMount } from 'svelte';
    // Importación de todas las librerías necesarias
    import Chart from 'chart.js/auto';
    import * as echarts from 'echarts';
    import ApexCharts from 'apexcharts';
    import bb, { gauge } from 'billboard.js';
    import c3 from 'c3';

    let currentIntegration = "MENU";
    let chartInstance = null; 
    let githubData = null;
    let externalData = []; 

    // Limpiador para que las gráficas no se solapen al cambiar de pestaña
    function clearContainers() {
        if (chartInstance) chartInstance.destroy();
        const containers = ['chartG10', 'chartG16', 'chartEXT1', 'chartGITHUB'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
    }

    // --- 1. G14: Meteoritos (Chart.js - Pie) ---
    async function loadG14() {
        clearContainers();
        const res = await fetch("https://sos2526-14.onrender.com/api/v2/meteorite-landings");
        if (res.ok) {
            const data = await res.json();
            currentIntegration = "G14";
            setTimeout(() => {
                const fell = data.filter(m => m.fall === "Fell").length;
                const found = data.filter(m => m.fall === "Found").length;
                const ctx = document.getElementById('chartG14');
                chartInstance = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Caídos', 'Encontrados'],
                        datasets: [{ data: [fell, found], backgroundColor: ['#FF6384', '#36A2EB'] }]
                    }
                });
            }, 100);
        }
    }

    // --- 2. G10: Pandemias (ECharts - Funnel) ---
    async function loadG10() {
        clearContainers();
        const res = await fetch("https://sos2526-10.onrender.com/api/v2/pandemics");
        if (res.ok) {
            const data = await res.json();
            currentIntegration = "G10";
            setTimeout(() => {
                const myChart = echarts.init(document.getElementById('chartG10'));
                const plotData = data.slice(0, 5).map(d => ({ value: d.affected, name: d.country }));
                myChart.setOption({
                    title: { text: 'Afectados por Pandemia', left: 'center' },
                    series: [{ type: 'funnel', data: plotData }]
                });
            }, 100);
        }
    }

    // --- 3. G16: EV Sales (ApexCharts - RadialBar) ---
    async function loadG16() {
        clearContainers();
        const res = await fetch("https://sos2526-16.onrender.com/api/v1/global-ev-sales");
        if (res.ok) {
            const data = await res.json();
            currentIntegration = "G16";
            setTimeout(() => {
                const options = {
                    series: [data[0]?.sales_share || 70],
                    chart: { height: 350, type: 'radialBar' },
                    labels: [data[0]?.country || 'Ventas EV']
                };
                const chart = new ApexCharts(document.getElementById("chartG16"), options);
                chart.render();
            }, 100);
        }
    }

    // --- 4. G18: Food Supply (Tabla HTML) ---
    async function loadG18() {
        clearContainers();
        const res = await fetch("https://sos2526-18.onrender.com/api/v2/food-supply-utilization-accounts");
        if (res.ok) {
            externalData = await res.json();
            currentIntegration = "G18";
        }
    }

    // --- 5. EXT 1: Países (Proxy + Billboard.js - Gauge) ---
    async function loadProxy() {
        clearContainers();
        const res = await fetch("/api/v2/happiness-indices/proxy-countries");
        if (res.ok) {
            const data = await res.json();
            currentIntegration = "EXT_PROXY";
            setTimeout(() => {
                bb.generate({
                    data: { columns: [["Total Países", data.length]], type: gauge() },
                    gauge: { label: { format: value => value } },
                    bindto: "#chartEXT1"
                });
            }, 100);
        }
    }

    // --- 6. EXT 2: GitHub (OAuth + C3.js - Donut) ---
    async function loadGitHub() {
        clearContainers();
        const username = "tu_usuario"; // <--- PON TU USUARIO REAL
        const token = "ghp_TU_TOKEN";  // <--- PON TU TOKEN REAL
        const res = await fetch(`https://api.github.com/users/${username}`, {
            headers: { "Authorization": `token ${token}` }
        });
        if (res.ok) {
            githubData = await res.json();
            currentIntegration = "GITHUB";
            setTimeout(() => {
                c3.generate({
                    bindto: '#chartGITHUB',
                    data: {
                        columns: [['Seguidores', githubData.followers], ['Siguiendo', githubData.following]],
                        type: 'donut'
                    }
                });
            }, 100);
        }
    }

    // --- 7. EXT 3: TV Maze (Lista HTML) ---
    async function loadTV() {
        clearContainers();
        const res = await fetch("https://api.tvmaze.com/search/shows?q=happiness");
        if (res.ok) {
            const data = await res.json();
            externalData = data.map(d => d.show);
            currentIntegration = "EXT_3";
        }
    }
</script>

<main class="container py-4">
    <h1 class="text-center mb-4">🧩 Centro de Integraciones (JAM)</h1>

    <div class="row g-2 justify-content-center mb-5">
        <button class="btn btn-sm btn-outline-primary col-auto m-1" on:click={loadG14}>☄️ Meteoritos (G14)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1" on:click={loadG10}>🦠 Pandemias (G10)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1" on:click={loadG16}>⚡ EV Sales (G16)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1" on:click={loadG18}>🍎 Food (G18)</button>
        <button class="btn btn-sm btn-outline-success col-auto m-1" on:click={loadProxy}>🌍 Países (Proxy)</button>
        <button class="btn btn-sm btn-outline-dark col-auto m-1" on:click={loadGitHub}>🐙 GitHub (OAuth)</button>
        <button class="btn btn-sm btn-outline-danger col-auto m-1" on:click={loadTV}>🎬 TV Series (EXT)</button>
    </div>

    <div class="content-area p-4 border rounded bg-white shadow-sm" style="min-height: 500px;">
        {#if currentIntegration === "MENU"}
            <div class="text-center mt-5 py-5">
                <h3 class="text-muted">Panel de Control de Datos</h3>
                <p>Usa el menú superior para cargar las diferentes fuentes de datos.</p>
            </div>

        {:else if currentIntegration === "G14"}
            <h3>☄️ Meteoritos (G14)</h3>
            <p class="small text-muted">Librería: <b>Chart.js</b> | Tipo: <b>Pie Chart</b></p>
            <div style="max-width: 450px; margin: 0 auto;">
                <canvas id="chartG14"></canvas>
            </div>

        {:else if currentIntegration === "G10"}
            <h3>🦠 Pandemias (G10)</h3>
            <p class="small text-muted">Librería: <b>ECharts</b> | Tipo: <b>Funnel</b></p>
            <div id="chartG10" style="width: 100%; height: 400px;"></div>

        {:else if currentIntegration === "G16"}
            <h3>⚡ Global EV Sales (G16)</h3>
            <p class="small text-muted">Librería: <b>ApexCharts</b> | Tipo: <b>Radial Bar</b></p>
            <div id="chartG16"></div>

           {:else if currentIntegration === "G18"}
        <h3>🍎 Food Supply (G18)</h3>
        <p class="small text-muted">Método: <b>HTML Table</b> (RESTful Fetch)</p>
        <table class="table table-hover mt-3">
            <thead class="table-dark">
                <tr><th>País</th><th>Año</th><th>Kcal/Persona/Día</th></tr>
            </thead>
            <tbody>
                {#each externalData.slice(0, 10) as item}
                    <tr>
                        <td>{item.country}</td>
                        <td>{item.year}</td>
                        <td>{item.food_supply_kcal}</td>
                    </tr>
                {/each} 
            </tbody>
        </table>

        {:else if currentIntegration === "EXT_PROXY"}
            <h3>🌍 Rest Countries (Proxy)</h3>
            <p class="small text-muted">Librería: <b>Billboard.js</b> | Tipo: <b>Gauge</b></p>
            <div id="chartEXT1"></div>

        {:else if currentIntegration === "GITHUB"}
            <h3>🐙 GitHub Profile (OAuth)</h3>
            <p class="small text-muted">Librería: <b>C3.js</b> | Tipo: <b>Donut Chart</b></p>
            <div class="row align-items-center">
                <div class="col-md-4 text-center">
                    <img src={githubData.avatar_url} class="rounded-circle img-fluid border mb-2" alt="Avatar" style="width: 120px;" />
                    <h5>{githubData.login}</h5>
                </div>
                <div class="col-md-8"><div id="chartGITHUB"></div></div>
            </div>

        {:else if currentIntegration === "EXT_3"}
            <h3>🎬 TV Shows (TV Maze API)</h3>
            <p class="small text-muted">Método: <b>HTML List</b> (RESTful Fetch)</p>
            <ul class="list-group list-group-flush mt-3">
                {#each externalData.slice(0, 8) as show}
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div><b>{show.name}</b> <span class="badge bg-secondary ms-2">{show.language}</span></div>
                        <span class="text-muted small">{show.type}</span>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</main>

<style>
    :global(body) { background-color: #f8f9fa; }
    .content-area { max-width: 900px; margin: 0 auto; }
    .btn { transition: transform 0.2s; }
    .btn:hover { transform: scale(1.05); }
</style>