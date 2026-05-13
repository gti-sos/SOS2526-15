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

 // 1. G14: MASHUP Meteoritos vs Felicidad (Chart.js - Mixto Barras/Líneas)
    async function loadG14() {
        clearContainers();
        currentIntegration = 'G14';
        try {
            const [resG14, resFelicidad] = await Promise.all([
                fetch('https://meteorite-landings-tvcf.onrender.com/api/v2/meteorite-landings'),
                fetch('https://sos2526-15.onrender.com/api/v2/happiness-indices')
            ]);

            const dataG14 = await resG14.json();
            const dataFelicidad = await resFelicidad.json();
            await tick(); 
            
            const el = document.getElementById('chartG14');
            if (!el) return;

            // Destructor de gráficas fantasmas (el antídoto)
            let chartExistente = Chart.getChart('chartG14'); 
            if (chartExistente != undefined) {
                chartExistente.destroy();
            }

            // Normalizador inteligente que elimina los guiones bajos de tus datos
            const normalize = (str) => (str || "").toLowerCase().replace(/_/g, ' ').trim();
            
            // Elegimos países que sabemos que están en tu DB y en la de ellos
            const targetCountries = ['Spain', 'Germany', 'Japan', 'Brazil', 'United States'];
            const datosCruzados = [];

            targetCountries.forEach(pais => {
                const meteoritosPais = dataG14.filter(m => normalize(m.country) === normalize(pais));
                const felicidadPais = dataFelicidad.find(f => normalize(f.country) === normalize(pais));
                
                datosCruzados.push({
                    pais: pais,
                    meteoritos: meteoritosPais.length, 
                    // Usamos tu campo real de felicidad
                    score: felicidadPais ? felicidadPais.happiness_score : 0
                });
            });

            // Creamos una gráfica mixta con Doble Eje (Dual Axis)
            chartInstance = new Chart(el, {
                type: 'bar', // Tipo principal
                data: {
                    labels: datosCruzados.map(d => d.pais),
                    datasets: [
                        {
                            type: 'bar', // Barras para los meteoritos
                            label: 'Nº Meteoritos',
                            data: datosCruzados.map(d => d.meteoritos),
                            backgroundColor: '#FF99B4',
                            yAxisID: 'y' // Eje izquierdo
                        },
                        {
                            type: 'line', // Línea para la felicidad
                            label: 'Felicidad (Score)',
                            data: datosCruzados.map(d => d.score),
                            borderColor: '#36A2EB',
                            backgroundColor: '#36A2EB',
                            borderWidth: 3,
                            yAxisID: 'y1' // Eje derecho
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Cantidad de Meteoritos' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'Nivel de Felicidad' },
                            grid: { drawOnChartArea: false } // Para que las rayas de fondo no se crucen
                        }
                    }
                }
            });
        } catch(e) { console.error('G14 error', e); }
    }
    // 2. G10: MASHUP Pandemias vs Felicidad (ECharts)
async function loadG10() {
        clearContainers();
        currentIntegration = 'G10';
        try {
            const [resG10, resFelicidad] = await Promise.all([
                fetch('https://sos2526-10.onrender.com/api/v2/pandemics'),
                fetch('https://sos2526-15.onrender.com/api/v2/happiness-indices') 
            ]);

            const dataG10 = await resG10.json();
            const dataFelicidad = await resFelicidad.json();
            await tick();
            
            const container = document.getElementById('chartG10');
            if (!container) return;

            // Mejoramos el normalize para que quite los guiones bajos de tus datos
            const normalize = (str) => (str || "").toLowerCase().replace(/_/g, ' ').trim();
            const datosCruzados = [];
            
            // Elegimos 5 países que SABEMOS que están en tu base de datos
            const targetCountries = ['Spain', 'Germany', 'Brazil', 'Japan', 'Mexico'];

            targetCountries.forEach(pais => {
                const pandemiasPais = dataG10.filter(d => normalize(d.entity) === normalize(pais) || normalize(d.country) === normalize(pais));
                const totalPolio = pandemiasPais.reduce((sum, item) => sum + (item.polio || 0), 0);

                const felicidadPais = dataFelicidad.find(f => normalize(f.country) === normalize(pais));
                
                datosCruzados.push({
                    pais: pais,
                    polio: totalPolio,
                    // Usamos tu campo real: gdp_per_capita
                    gdp: felicidadPais ? felicidadPais.gdp_per_capita : 0
                });
            });

            echarts.init(container).setOption({
                title: { text: 'Casos de Polio vs PIB (G10 + G15)', left: 'center' },
                tooltip: { trigger: 'axis' },
                legend: { data: ['Casos Polio', 'PIB (GDP)'], bottom: 0 },
                xAxis: { type: 'category', data: datosCruzados.map(d => d.pais) },
                yAxis: [{ type: 'value', name: 'Polio' }, { type: 'value', name: 'PIB' }],
                series: [
                    { name: 'Casos Polio', type: 'bar', data: datosCruzados.map(d => d.polio) },
                    { name: 'PIB (GDP)', type: 'line', yAxisIndex: 1, data: datosCruzados.map(d => d.gdp) }
                ]
            });
        } catch(e) { console.error('G10 error', e); }
    }

    // 3. G16: MASHUP EV Sales vs Felicidad (ApexCharts Radar)
    async function loadG16() {
        clearContainers();
        currentIntegration = 'G16';
        try {
            const [resG16, resFelicidad] = await Promise.all([
                fetch('https://sos2526-16.onrender.com/api/v2/global-ev-sales'),
                fetch('https://sos2526-15.onrender.com/api/v2/happiness-indices')
            ]);

            const dataG16 = await resG16.json();
            const dataFelicidad = await resFelicidad.json();
            await tick();
            
            const container = document.getElementById('chartG16');
            if (!container) return;

            const normalize = (str) => (str || "").toLowerCase().replace(/_/g, ' ').trim();
            // Paises que están en tu DB y que suelen vender coches eléctricos
            const targetCountries = ['Norway', 'Denmark', 'Germany', 'United States', 'Japan'];
            const labels = [];
            const serieEV = [];
            const serieFelicidad = [];

            targetCountries.forEach(pais => {
                const evPais = dataG16.find(d => normalize(d.country) === normalize(pais) || normalize(d.region) === normalize(pais));
                const fPais = dataFelicidad.find(f => normalize(f.country) === normalize(pais));

                labels.push(pais);
                serieEV.push(evPais ? parseFloat(evPais.sales_share || evPais.share || 0) : 0);
                // Usamos tu campo real: happiness_score
                serieFelicidad.push(fPais ? (fPais.happiness_score * 10 || 0) : 0); 
            });

            chartInstance = new ApexCharts(container, {
                series: [{ name: 'Cuota Ventas EV (%)', data: serieEV }, { name: 'Felicidad (Score x10)', data: serieFelicidad }],
                chart: { height: 400, type: 'radar' },
                labels: labels,
                stroke: { width: 2 },
                fill: { opacity: 0.2 },
                title: { text: 'Ventas EV vs Felicidad' }
            });
            chartInstance.render();
        } catch(e) { console.error('G16 error', e); }
    }
 
    
 // 4. G18: MASHUP Food Supply vs Felicidad (Tabla HTML)
    async function loadG18() {
        clearContainers();
        currentIntegration = 'G18';
        try {
            const [resG18, resFelicidad] = await Promise.all([
                fetch('https://sos2526-18-mcs-stable.onrender.com/api/v2/food-supply-utilization-accounts'),
                fetch('https://sos2526-15.onrender.com/api/v2/happiness-indices')
            ]);

            const dataG18 = await resG18.json();
            const dataFelicidad = await resFelicidad.json();
            
            const normalize = (str) => (str || "").toLowerCase().replace(/_/g, ' ').trim();
            
            externalData = dataG18.slice(0, 15).map(itemG18 => {
                const nombrePais = itemG18.country || itemG18.entity || itemG18.location || "";
                const felicidadMatch = dataFelicidad.find(f => normalize(f.country) === normalize(nombrePais));
                
                return {
                    pais: nombrePais,
                    ano: itemG18.year || '—',
                    kcal: itemG18.food_supply_kcal || itemG18.kcal || itemG18.utilization_amount || '—',
                    // Vinculamos tus campos reales
                    gdp: felicidadMatch ? felicidadMatch.gdp_per_capita : 'No data',
                    score: felicidadMatch ? felicidadMatch.happiness_score : 'No data'
                };
            });
            
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
        <div class="integration-info">
            <p><strong>🍎 MASHUP: Food Supply (G18) vs Felicidad (G15)</strong></p>
            <p>Fuente: <strong>sos2526-18-mcs-stable.onrender.com</strong> + <strong>Mi API</strong> | Método: <strong>Tabla HTML</strong></p>
        </div>
        {#if externalData && externalData.length > 0}
            <table class="data-table">
                <thead>
                    <tr>
                        <th>País</th>
                        <th>Año (G18)</th>
                        <th>Kcal/Persona (G18)</th>
                        <th>PIB / GDP (Mi API)</th>
                        <th>Puntuación Felicidad (Mi API)</th>
                    </tr>
                </thead>
                <tbody>
                    {#each externalData as row}
                        <tr>
                            <td>{row.pais}</td>
                            <td>{row.ano}</td>
                            <td>{row.kcal}</td>
                            <td>{row.gdp}</td>
                            <td>{row.score}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <p style="text-align: center; margin-top: 2rem;">No hay datos cruzados disponibles o la API G18 está vacía.</p>
        {/if}
 
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