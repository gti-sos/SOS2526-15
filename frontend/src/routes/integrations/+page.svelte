<script>
    import { onMount } from 'svelte';
    // Importación de todas las librerías necesarias
    import Chart from 'chart.js/auto';
    import * as echarts from 'echarts';
    import ApexCharts from 'apexcharts';
    import bb, { gauge } from 'billboard.js';
    import c3 from 'c3';

   let currentIntegration = $state("MENU");
   let chartInstance = null;       
    let githubData = $state(null);
    let externalData = $state([]);

    // Limpiador para que las gráficas no se solapen al cambiar de pestaña
    function clearContainers() {
        if (chartInstance) chartInstance.destroy();
        const containers = ['chartG10', 'chartG16', 'chartEXT1', 'chartGITHUB', 
                        'chartG14', 'chartG18', 'chartG27', 'chartEXT1_YHX', 
                        'chartEXT2_YHX', 'chartEXT3_YHX'];
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
        const username = import.meta.env.VITE_GITHUB_USERNAME || "JavierArroyoMarcos"; 
        const token = import.meta.env.VITE_GITHUB_TOKEN;
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

    // --- VARIABLES PARA DATOS YHX ---
    let g26Data = $state([]);

    // --- FUNCIONES DE CARGA Y RENDERIZADO ---

    // 1. SOS - G26 (Solo Texto/HTML)
    async function loadG26() {
    currentIntegration = "YHX_G26";
    clearContainers();
    // usa el endpoint que carga los datos iniciales
    const res = await fetch("https://sos2526-26.onrender.com/api/v2/national-team-rankings-per-years/loadInitialData");
    if (res.ok) g26Data = await res.json();
}

    // 2. SOS - G18 (Chart.js - polarArea)
    async function loadG18_2() {
        currentIntegration = "YHX_G18";
        clearContainers();
        const res = await fetch("https://sos2526-18-cereal-productions-stable.onrender.com/api/v2/cereal-productions/loadInitialData");
        if (res.ok) {
            const data = await res.json();
            setTimeout(() => {
                const ctx = document.getElementById('chartG18').getContext('2d');
                chartInstance = new Chart(ctx, {
                    type: 'polarArea',
                    data: {
                        labels: data.slice(0, 6).map(d => d.country),
                        datasets: [{ label: 'Producción', data: data.slice(0, 6).map(d => d.cereal_production) }]
                    }
                });
            }, 100);
        }
    }

    // 3. SOS - G27 (ECharts - scatter)
    async function loadG27() {
        currentIntegration = "YHX_G27";
        clearContainers();
        const res = await fetch("https://sos2526-27.onrender.com/api/v1/water-dams/loadInitialData");
        if (res.ok) {
            const data = await res.json();
            setTimeout(() => {
                const chartDom = document.getElementById('chartG27');
                chartInstance = echarts.init(chartDom);
                chartInstance.setOption({
                    xAxis: { type: 'category', data: data.slice(0,10).map(d => d.dam) },
                    yAxis: { type: 'value' },
                    series: [{ type: 'scatter', symbolSize: 20, data: data.slice(0,10).map(d => d.capacity) }]
                });
            }, 100);
        }
    }

    // 4. EXT 1 - FakeStore (ApexCharts - radar)
    async function loadExt1() {
        currentIntegration = "YHX_EXT1";
        clearContainers();
        const res = await fetch("https://fakestoreapi.com/products");
        if (res.ok) {
            const data = await res.json();
            setTimeout(() => {
                const options = {
                    chart: { type: 'bar', height: 400 },
                    plotOptions: { bar: { horizontal: true } }, // Barras tumbadas
                    series: [{ name: 'Precio ($)', data: data.slice(0, 5).map(d => d.price) }],
                    labels: data.slice(0, 5).map(d => d.title.substring(0, 15) + '...'),
                    colors: ['#f39c12']
                };
                chartInstance = new ApexCharts(document.querySelector("#chartEXT1_YHX"), options);
                chartInstance.render();
            }, 100);
        }
    }

    // 5. EXT 2 - Rick and Morty (Chart.js - Doughnut)
    async function loadExt2() {
        currentIntegration = "YHX_EXT2";
        clearContainers();
        const res = await fetch("https://rickandmortyapi.com/api/character");
        if (res.ok) {
            const data = await res.json();
            setTimeout(() => {
                const ctx = document.getElementById('chartEXT2_YHX').getContext('2d');
                chartInstance = new Chart(ctx, {
                    type: 'doughnut', // Quesito con agujero
                    data: {
                        labels: data.results.slice(0, 5).map(d => d.name),
                        datasets: [{ 
                            label: 'Episodios en los que aparece', 
                            data: data.results.slice(0, 5).map(d => d.episode.length),
                            backgroundColor: ['#ff9999','#66b3ff','#99ff99','#ffcc99','#c2c2f0']
                        }]
                    }
                });
            }, 100);
        }
    }
    // 6. EXT 3 PROXY - Países con proxy propio (C3.js - Bar)
    async function loadExt3Proxy() {
        clearContainers();
        const res = await fetch("/api/v2/happiness-indices/proxy-countries");
        if (res.ok) {
            const countries = await res.json();
            // Contamos países por región
            const regionCount = {};
            countries.forEach(c => {
                const r = c.region || "Desconocida";
                regionCount[r] = (regionCount[r] || 0) + 1;
            });
            const columns = Object.entries(regionCount).map(([region, count]) => [region, count]);

            currentIntegration = "YHX_EXT3";
            setTimeout(() => {
                c3.generate({
                    bindto: '#chartEXT3_YHX',
                    data: {
                        columns: columns,
                        type: 'bar'  // Gráfico de barras (no choca con el donut de GitHub)
                    },
                    bar: {
                        width: { ratio: 0.5 } // barras más estrechas para que quepan etiquetas
                    }
                });
            }, 100);
        }
    }
</script>

<main class="container py-4">
    <h1 class="text-center mb-4">🧩 Centro de Integraciones (JAM)</h1>

    <div class="row g-2 justify-content-center mb-5">
        <button class="btn btn-sm btn-outline-primary col-auto m-1" onclick={loadG14}>☄️ Meteoritos (G14)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1" onclick={loadG10}>🦠 Pandemias (G10)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1" onclick={loadG16}>⚡ EV Sales (G16)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1" onclick={loadG18}>🍎 Food (G18)</button>
        <button class="btn btn-sm btn-outline-success col-auto m-1" onclick={loadProxy}>🌍 Países (Proxy)</button>
        <button class="btn btn-sm btn-outline-dark col-auto m-1" onclick={loadGitHub}>🐙 GitHub (OAuth)</button>
        <button class="btn btn-sm btn-outline-danger col-auto m-1" onclick={loadTV}>🎬 TV Series (EXT)</button>
    </div>

    <h1 class="text-center mb-4">🧩 Centro de Integraciones (YHX)</h1>

    <div class="row g-2 justify-content-center mb-5">
        <button class="btn btn-outline-primary m-1" onclick={loadG26}>Grupo 26 (Texto)</button>
        <button class="btn btn-outline-primary m-1" onclick={loadG18_2}>Grupo 18 (Chart.js)</button>
        <button class="btn btn-outline-primary m-1" onclick={loadG27}>Grupo 27 (ECharts)</button>
        <button class="btn btn-outline-success m-1" onclick={loadExt1}>FakeStore (ApexCharts)</button>
        <button class="btn btn-outline-success m-1" onclick={loadExt2}>Rick&Morty (Billboard)</button>
        <button class="btn btn-outline-danger m-1" onclick={loadExt3Proxy}>Países PROXY (C3.js)</button>
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
        {:else if currentIntegration === "YHX_G26"}
            <h3>📝 Grupo 26: Rankings Deportivos</h3>
            <p class="small text-muted">Requisito: Uso textual en HTML puro</p>
            <Table striped bordered>
                <thead><tr><th>País</th><th>Año</th><th>Puntos</th></tr></thead>
                <tbody>
                    {#each g26Data.slice(0, 10) as item}
                        <tr><td>{item.country}</td>
                        <td>{item.year}</td>
                        <td>{item.score}</td></tr>
                    {/each}
                </tbody>
            </Table>

        {:else if currentIntegration === "YHX_G18"}
            <h3>🌾 Grupo 18: Cereales</h3>
            <div style="width: 100%; max-width: 600px; margin: auto;"><canvas id="chartG18"></canvas></div>

        {:else if currentIntegration === "YHX_G27"}
            <h3>💧 Grupo 27: Presas</h3>
            <div id="chartG27" style="width: 100%; height: 400px;"></div>

        {:else if currentIntegration === "YHX_EXT1"}
            <h3>🛍️ Fake Store API</h3>
            <div id="chartEXT1_YHX"></div>

        {:else if currentIntegration === "YHX_EXT2"}
            <h3>👽 Rick and Morty API</h3>
            <div id="chartEXT2_YHX"></div>

        {:else if currentIntegration === "YHX_EXT3"}
            <h3>🌍 REST Countries (Vía Proxy)</h3>
            <div id="chartEXT3_YHX"></div>
        {/if}
    </div>
</main>

<style>
    :global(body) { background-color: #f8f9fa; }
    .content-area { max-width: 900px; margin: 0 auto; }
    .btn { transition: transform 0.2s; }
    .btn:hover { transform: scale(1.05); }
</style>