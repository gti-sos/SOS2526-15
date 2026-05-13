<script>
    import { onMount, tick } from 'svelte';
    import Chart from 'chart.js/auto';
    import * as echarts from 'echarts';
    import ApexCharts from 'apexcharts';
    import Highcharts from 'highcharts';
 
    let currentIntegration = $state("MENU");
    let chartInstance = null;
    let externalData = $state([]);
    let githubData = $state(null);
    
    // Estados añadidos inspirados en tu ejemplo robusto
    let loadingMerge = $state(false);
    let errorMerge = $state("");
 
    function clearContainers() {
        if (chartInstance && typeof chartInstance.destroy === 'function') {
            chartInstance.destroy();
            chartInstance = null;
        }
        // Añadido 'chartJAM_CRUCE' a la lista de limpieza
        ['chartG14','chartG10','chartG16','chartJAM_PROXY','chartJAM_GITHUB', 'chartJAM_CRUCE'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
        externalData = [];
        githubData = null;
        errorMerge = "";
        loadingMerge = false;
    }
 
    // --------------------------------------------------------
    // NUEVA INTEGRACIÓN: Cruce robusto Meteoritos vs Riqueza
    // --------------------------------------------------------
    async function loadCruceMeteoritos() {
        clearContainers();
        currentIntegration = 'CRUCE_METEORITOS';
        loadingMerge = true;
        errorMerge = "";

        try {
            // 1. Cargamos ambas APIs a la vez de forma segura
            // IMPORTANTE: Cambia la ruta local de felicidad si tu API se llama distinto
            const [resMeteoritos, resFelicidad] = await Promise.all([
                fetch('https://meteorite-landings-tvcf.onrender.com/api/v2/meteorite-landings'),
                fetch('https://sos2526-15.onrender.com/api/v2/happiness-indices')
            ]);

            if (!resMeteoritos.ok || !resFelicidad.ok) {
                throw new Error("No se pudieron obtener los datos para el cruce.");
            }

            const dataMeteoritos = await resMeteoritos.json();
            const dataFelicidad = await resFelicidad.json();

            // 2. Definimos los países que queremos mostrar en el eje X
            const targetCountries = ['Spain', 'France', 'Germany', 'Italy', 'USA'];
            const datosCruzados = [];

            // 3. Hacemos el cruce seguro (como en el ejemplo que me mandaste)
            targetCountries.forEach(pais => {
                // Buscamos ignorando mayúsculas/minúsculas para evitar fallos tontos
                const normalize = (str) => (str || "").toLowerCase().trim();

                // Contamos cuántos meteoritos tiene este país (o sumamos su valor)
                const meteoritosDelPais = dataMeteoritos.filter(m => normalize(m.country) === normalize(pais));
                const totalMeteoritos = meteoritosDelPais.length; 

                // Buscamos el PIB en tu API
                const felicidadDelPais = dataFelicidad.find(f => normalize(f.country) === normalize(pais));
                
                // Si la API de felicidad no tiene a "France", fallback a 0
                const riquezaCalculada = (felicidadDelPais && felicidadDelPais.gdp) ? (felicidadDelPais.gdp * 5) : 0;

                datosCruzados.push({
                    pais: pais,
                    meteoritos: totalMeteoritos === 0 ? 0 : totalMeteoritos,
                    riqueza: riquezaCalculada
                });
            });

            await tick(); // Esperamos a que Svelte pinte el <canvas>

            // 4. Renderizamos la gráfica si todo ha ido bien
            chartInstance = new Chart(document.getElementById('chartJAM_CRUCE'), {
                type: 'bar',
                data: {
                    labels: datosCruzados.map(d => d.pais),
                    datasets: [
                        {
                            label: 'Meteoritos Registrados',
                            data: datosCruzados.map(d => d.meteoritos),
                            backgroundColor: '#FF99B4' // Rosa
                        },
                        {
                            label: 'Índice de Riqueza (GDP x 5)',
                            data: datosCruzados.map(d => d.riqueza),
                            backgroundColor: '#63B3ED' // Azul celeste
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });

            loadingMerge = false;

        } catch (error) {
            console.error("Error en el cruce:", error);
            errorMerge = "Error crítico al intentar realizar el cruce de datos.";
            loadingMerge = false;
        }
    }
    // --------------------------------------------------------

    // 1. G14: Meteoritos — Chart.js Pie
    async function loadG14() {
        clearContainers();
        currentIntegration = 'G14';
        try {
            const res = await fetch('https://meteorite-landings-tvcf.onrender.com/api/v2/meteorite-landings');
            const data = await res.json();
            await tick();
            const fell  = data.filter(m => m.fall === 'Fell').length;
            const found = data.filter(m => m.fall === 'Found').length;
            chartInstance = new Chart(document.getElementById('chartG14'), {
                type: 'pie',
                data: {
                    labels: ['Caídos (Fell)', 'Encontrados (Found)'],
                    datasets: [{ data: [fell, found], backgroundColor: ['#FF6384','#36A2EB'] }]
                },
                options: { plugins: { legend: { position: 'bottom' } } }
            });
        } catch(e) { console.error('G14 error', e); }
    }
 
    // 2. G10: Pandemias — ECharts Funnel (CORREGIDO)
    async function loadG10() {
        clearContainers();
        currentIntegration = 'G10';
        try {
            const res = await fetch('https://sos2526-10.onrender.com/api/v2/pandemics');
            const data = await res.json();
            await tick();
            
            const container = document.getElementById('chartG10');
            if (!container) return;

            // Filtramos para que no salgan solo ceros. 
            // Cogemos los 6 primeros que tengan algo de Polio, por ejemplo.
            const dataConDatos = data.filter(d => d.polio > 0).slice(0, 6);

            echarts.init(container).setOption({
                title: { text: 'Casos de Polio (Top 6 con registros)', left: 'center' },
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'funnel', 
                    left: '10%', 
                    width: '80%',
                    data: dataConDatos.map(d => ({
                        value: d.polio,        // <--- Usamos el campo real
                        name: `${d.entity} (${d.year})` // <--- 'entity' en vez de 'country'
                    }))
                }]
            });
        } catch(e) { console.error('G10 error', e); }
    }
 
    // 3. G16: EV Sales — ApexCharts RadialBar
    async function loadG16() {
        clearContainers();
        currentIntegration = 'G16';
        try {
            const res = await fetch('https://sos2526-16.onrender.com/api/v1/global-ev-sales');
            const data = await res.json();
            await tick();
            const item = data[0] ?? {};
            chartInstance = new ApexCharts(document.getElementById('chartG16'), {
                series: [parseFloat(item.sales_share ?? item.share ?? 50)],
                chart: { height: 380, type: 'radialBar' },
                labels: [item.country ?? item.region ?? 'EV Sales'],
                plotOptions: { radialBar: { dataLabels: { value: { formatter: v => v + '%' } } } }
            });
            chartInstance.render();
        } catch(e) { console.error('G16 error', e); }
    }
 
    // 4. G18: Food Supply — Tabla HTML
    async function loadG18() {
        clearContainers();
        try {
            const res = await fetch('https://sos2526-18-mcs-stable.onrender.com/api/v2/food-supply-utilization-accounts');
            externalData = await res.json();
            currentIntegration = 'G18';
        } catch(e) { console.error('G18 error', e); }
    }
 
    // 5. Rest Countries vía Proxy propio — Chart.js PolarArea
    async function loadProxy() {
        clearContainers();
        currentIntegration = 'PROXY';
        try {
            const res = await fetch('/api/v2/happiness-indices/proxy-countries');
            const data = await res.json();
            const regions = {};
            data.forEach(c => { const r = c.region ?? 'Other'; regions[r] = (regions[r] ?? 0) + 1; });
            await tick();
            chartInstance = new Chart(document.getElementById('chartJAM_PROXY'), {
                type: 'polarArea',
                data: {
                    labels: Object.keys(regions),
                    datasets: [{ data: Object.values(regions), backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#C9CBCF'] }]
                },
                options: { plugins: { legend: { position: 'right' } } }
            });
        } catch(e) { console.error('Proxy error', e); }
    }
 
    // 6. GitHub vía Proxy propio — ECharts Bar
    async function loadGitHub() {
        clearContainers();
        currentIntegration = 'GITHUB';
        try {
            const res = await fetch('/api/v2/happiness-indices/proxy-github');
            const data = await res.json();
            githubData = data;
            await tick();
            echarts.init(document.getElementById('chartJAM_GITHUB')).setOption({
                title: { text: `GitHub: ${data.login}`, left: 'center' },
                tooltip: {},
                xAxis: { type: 'category', data: ['Repos públicos','Seguidores','Siguiendo','Gists públicos'] },
                yAxis: { type: 'value' },
                series: [{ type: 'bar', data: [data.public_repos, data.followers, data.following, data.public_gists], itemStyle: { color: '#24292e' } }]
            });
        } catch(e) { console.error('GitHub error', e); }
    }
 
    // 7. TV Maze — Lista HTML
    async function loadTV() {
        clearContainers();
        try {
            const res = await fetch('https://api.tvmaze.com/search/shows?q=happiness');
            const data = await res.json();
            externalData = data.map(d => d.show);
            currentIntegration = 'TV';
        } catch(e) { console.error('TV error', e); }
    }
</script>
 
<main class="container py-4">
    <a href="/integrations" class="btn btn-sm btn-outline-secondary mb-3">← Volver al Panel</a>
 
    <h1 class="text-center mb-3">🧩 Integraciones <span class="text-primary">JAM</span></h1>
 
    <div class="row g-2 justify-content-center mb-4">
        <button class="btn btn-sm btn-warning col-auto m-1 fw-bold" onclick={loadCruceMeteoritos}>🔥 Meteoritos vs Felicidad</button>
        
        <button class="btn btn-sm btn-outline-primary col-auto m-1"  onclick={loadG14}>☄️ Meteoritos (G14)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1"  onclick={loadG10}>🦠 Pandemias (G10)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1"  onclick={loadG16}>⚡ EV Sales (G16)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1"  onclick={loadG18}>🍎 Food (G18)</button>
        <button class="btn btn-sm btn-outline-success col-auto m-1"  onclick={loadProxy}>🌍 Países (Proxy)</button>
        <button class="btn btn-sm btn-outline-dark col-auto m-1"     onclick={loadGitHub}>🐙 GitHub (Proxy)</button>
        <button class="btn btn-sm btn-outline-danger col-auto m-1"   onclick={loadTV}>🎬 TV Series</button>
    </div>
 
    <div class="content-area p-4 border rounded bg-white shadow-sm" style="min-height:480px;">
 
        {#if currentIntegration === 'MENU'}
            <div class="text-center mt-5 py-5">
                <h3 class="text-muted">Panel de Integraciones JAM</h3>
                <p>Selecciona una fuente de datos del menú superior.</p>
            </div>
            
        {:else if currentIntegration === 'CRUCE_METEORITOS'}
            <h3>🔥 Cruce: Meteoritos vs Índice de Riqueza</h3>
            <p class="small text-muted">Integración combinada | Librería: <b>Chart.js</b></p>
            
            {#if loadingMerge}
                <div class="text-center mt-5">
                    <p>Cruzando datos de ambas APIs...</p>
                </div>
            {:else if errorMerge}
                <div class="alert alert-danger mt-3">{errorMerge}</div>
            {:else}
                <div style="max-width:700px;margin:0 auto;">
                    <canvas id="chartJAM_CRUCE"></canvas>
                </div>
            {/if}
 
        {:else if currentIntegration === 'G14'}
            <h3>☄️ Meteoritos — G14</h3>
            <p class="small text-muted">Fuente: <b>sos2526-14.onrender.com</b> | Librería: <b>Chart.js</b> | Tipo: <b>Pie</b></p>
            <div style="max-width:420px;margin:0 auto;"><canvas id="chartG14"></canvas></div>
 
        {:else if currentIntegration === 'G10'}
            <h3>🦠 Pandemias — G10</h3>
            <p class="small text-muted">Fuente: <b>sos2526-10.onrender.com</b> | Librería: <b>ECharts</b> | Tipo: <b>Funnel</b></p>
            <div id="chartG10" style="width:100%;height:420px;"></div>
 
        {:else if currentIntegration === 'G16'}
            <h3>⚡ Global EV Sales — G16</h3>
            <p class="small text-muted">Fuente: <b>sos2526-16.onrender.com</b> | Librería: <b>ApexCharts</b> | Tipo: <b>Radial Bar</b></p>
            <div id="chartG16"></div>
 
        {:else if currentIntegration === 'G18'}
            <h3>🍎 Food Supply — G18</h3>
            <p class="small text-muted">Fuente: <b>sos2526-18.onrender.com</b> | Método: <b>Tabla HTML</b></p>
            <table class="table table-hover table-bordered mt-3">
                <thead class="table-dark">
                    <tr><th>País</th><th>Año</th><th>Kcal/Persona/Día</th></tr>
                </thead>
                <tbody>
                    {#each externalData.slice(0,12) as item}
                        <tr>
                            <td>{item.country ?? '—'}</td>
                            <td>{item.year ?? '—'}</td>
                            <td>{item.food_supply_kcal ?? '—'}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
 
        {:else if currentIntegration === 'PROXY'}
            <h3>🌍 Rest Countries — Proxy propio</h3>
            <p class="small text-muted">
                Fuente: <b>restcountries.com</b> via
                <code>/api/v2/happiness-indices/proxy-countries</code> |
                Librería: <b>Chart.js</b> | Tipo: <b>Polar Area</b>
            </p>
            <div style="max-width:500px;margin:0 auto;"><canvas id="chartJAM_PROXY"></canvas></div>
 
        {:else if currentIntegration === 'GITHUB'}
            <h3>🐙 GitHub — Proxy propio</h3>
            <p class="small text-muted">
                Fuente: <b>api.github.com</b> via
                <code>/api/v2/happiness-indices/proxy-github</code> |
                Librería: <b>ECharts</b> | Tipo: <b>Bar</b>
            </p>
            {#if githubData}
                <div class="row align-items-center">
                    <div class="col-md-3 text-center mb-3">
                        <img src={githubData.avatar_url} class="rounded-circle border" alt="avatar" style="width:100px;"/>
                        <h6 class="mt-2">{githubData.login}</h6>
                    </div>
                    <div class="col-md-9">
                        <div id="chartJAM_GITHUB" style="height:320px;"></div>
                    </div>
                </div>
            {/if}
 
        {:else if currentIntegration === 'TV'}
            <h3>🎬 TV Shows — TV Maze API</h3>
            <p class="small text-muted">Fuente: <b>api.tvmaze.com</b> | Método: <b>Lista HTML</b></p>
            <ul class="list-group list-group-flush mt-3">
                {#each externalData.slice(0,8) as show}
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <b>{show.name}</b>
                            <span class="badge bg-secondary ms-2">{show.language ?? '—'}</span>
                        </div>
                        <span class="text-muted small">{show.type ?? '—'} · {show.status ?? ''}</span>
                    </li>
                {/each}
            </ul>
        {/if}
 
    </div>
</main>
 
<style>
    :global(body) { background-color: #f8f9fa; }
    .content-area { max-width: 900px; margin: 0 auto; }
    .btn { transition: transform 0.15s; }
    .btn:hover { transform: scale(1.05); }
</style>