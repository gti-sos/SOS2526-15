<script>
    import { onMount, tick } from 'svelte';
    import Chart from 'chart.js/auto';
    import * as echarts from 'echarts';
    import ApexCharts from 'apexcharts';
 
    let currentIntegration = $state("MENU");
    let chartInstance = null;
    let externalData = $state([]);
    let githubData = $state(null);
    
    let loadingMerge = $state(false);
    let errorMerge = $state("");
 
    // Función centralizada para limpiar la pantalla antes de cargar otra gráfica
    function clearContainers() {
        if (chartInstance && typeof chartInstance.destroy === 'function') {
            chartInstance.destroy();
            chartInstance = null;
        }
        ['chartG14', 'chartG10', 'chartG16', 'chartJAM_PROXY', 'chartJAM_GITHUB'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
        externalData = [];
        githubData = null;
        errorMerge = "";
        loadingMerge = false;
    }

    // --- 1. G14: MASHUP Meteoritos vs Felicidad ---
    async function loadG14() {
        clearContainers();
        currentIntegration = 'G14';
        loadingMerge = true;
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

            let chartExistente = Chart.getChart('chartG14'); 
            if (chartExistente != undefined) chartExistente.destroy();

            const normalize = (str) => (str || "").toLowerCase().replace(/_/g, ' ').trim();
            const targetCountries = ['Spain', 'Germany', 'Japan', 'Brazil', 'United States'];
            const datosCruzados = [];

            targetCountries.forEach(pais => {
                const meteoritosPais = dataG14.filter(m => normalize(m.country) === normalize(pais));
                const felicidadPais = dataFelicidad.find(f => normalize(f.country) === normalize(pais));
                
                datosCruzados.push({
                    pais: pais,
                    meteoritos: meteoritosPais.length, 
                    score: felicidadPais ? felicidadPais.happiness_score : 0
                });
            });

            chartInstance = new Chart(el, {
                type: 'bar',
                data: {
                    labels: datosCruzados.map(d => d.pais),
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Nº Meteoritos',
                            data: datosCruzados.map(d => d.meteoritos),
                            backgroundColor: '#FF99B4',
                            yAxisID: 'y'
                        },
                        {
                            type: 'line',
                            label: 'Felicidad (Score)',
                            data: datosCruzados.map(d => d.score),
                            borderColor: '#36A2EB',
                            backgroundColor: '#36A2EB',
                            borderWidth: 3,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Meteoritos' } },
                        y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Felicidad' }, grid: { drawOnChartArea: false } }
                    }
                }
            });
        } catch(e) { 
            console.error('G14 error', e); 
            errorMerge = "Error al cargar los datos del cruce.";
        } finally {
            loadingMerge = false;
        }
    }
 
    // --- 2. G10: MASHUP Pandemias vs Felicidad ---
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

            const normalize = (str) => (str || "").toLowerCase().replace(/_/g, ' ').trim();
            const datosCruzados = [];
            const targetCountries = ['Spain', 'Germany', 'Brazil', 'Japan', 'Mexico'];

            targetCountries.forEach(pais => {
                const pandemiasPais = dataG10.filter(d => normalize(d.entity) === normalize(pais) || normalize(d.country) === normalize(pais));
                const totalPolio = pandemiasPais.reduce((sum, item) => sum + (item.polio || 0), 0);
                const felicidadPais = dataFelicidad.find(f => normalize(f.country) === normalize(pais));
                
                datosCruzados.push({
                    pais: pais,
                    polio: totalPolio,
                    gdp: felicidadPais ? felicidadPais.gdp_per_capita : 0
                });
            });

            echarts.init(container).setOption({
                title: { text: 'Casos de Polio vs PIB', left: 'center' },
                tooltip: { trigger: 'axis' },
                legend: { data: ['Casos Polio', 'PIB (GDP)'], bottom: 0 },
                xAxis: { type: 'category', data: datosCruzados.map(d => d.pais) },
                yAxis: [{ type: 'value', name: 'Polio' }, { type: 'value', name: 'PIB' }],
                series: [
                    { name: 'Casos Polio', type: 'bar', data: datosCruzados.map(d => d.polio), itemStyle: { color: '#ef4444' } },
                    { name: 'PIB (GDP)', type: 'line', yAxisIndex: 1, data: datosCruzados.map(d => d.gdp), itemStyle: { color: '#3b82f6' }, lineStyle: { width: 3 } }
                ]
            });
        } catch(e) { console.error('G10 error', e); }
    }

// ==========================================
    // 3. G16: EV SALES VS FELICIDAD
    // ==========================================
    async function cargarDatosEnergia() {
        try {
            await fetch('https://sos2526-16.onrender.com/api/v1/global-ev-sales/loadInitialData');
            await fetch('https://sos2526-15.onrender.com/api/v2/happiness-indices/loadInitialData');
            alert("✅ Datos de Energía y Felicidad despertados.");
            loadG16(); 
        } catch(e) { alert("❌ Hubo un error al cargar datos iniciales."); }
    }

    async function loadG16() {
        clearContainers();
        currentIntegration = 'G16';
        try {
            const [resG16, resFelicidad] = await Promise.all([
                fetch('https://sos2526-16.onrender.com/api/v1/global-ev-sales'),
                fetch('https://sos2526-15.onrender.com/api/v2/happiness-indices')
            ]);

            const dataG16 = await resG16.json();
            const dataFelicidad = await resFelicidad.json();
            await tick();
            
            const container = document.getElementById('chartG16');
            if (!container) return;

            const normalize = (str) => (str || "").toLowerCase().replace(/_/g, ' ').trim();
            const targetCountries = ['Norway', 'Denmark', 'Germany', 'United States', 'Japan'];
            const labels = [];
            const serieEV = [];
            const serieFelicidad = [];

            targetCountries.forEach(pais => {
                const searchRegion = pais === 'United States' ? 'USA' : pais;
                const evPais = dataG16.find(d => normalize(d.region) === normalize(searchRegion));
                const fPais = dataFelicidad.find(f => normalize(f.country) === normalize(pais));

                labels.push(pais);
                serieEV.push(evPais ? parseFloat(evPais.value || 0) : 0);
                serieFelicidad.push(fPais ? (fPais.happiness_score * 10 || 0) : 0); 
            });

            chartInstance = new ApexCharts(container, {
                series: [{ name: 'Ventas EV (Vehículos)', data: serieEV }, { name: 'Felicidad (Score x10)', data: serieFelicidad }],
                chart: { height: 400, type: 'radar' },
                labels: labels,
                stroke: { width: 2 },
                fill: { opacity: 0.2 },
                title: { text: 'Ventas EV vs Felicidad' }
            });
            chartInstance.render();
        } catch(e) { console.error('G16 error', e); }
    }

    // ==========================================
    // 4. G18: ALIMENTACIÓN VS FELICIDAD
    // ==========================================
    async function cargarDatosFood() {
        try {
            await fetch('https://sos2526-18-mcs-stable.onrender.com/api/v2/food-supply-utilization-accounts/loadInitialData');
            await fetch('https://sos2526-15.onrender.com/api/v2/happiness-indices/loadInitialData');
            alert("✅ Datos de Alimentación y Felicidad despertados.");
            loadG18();
        } catch(e) { alert("❌ Hubo un error al cargar datos iniciales."); }
    }

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
            
            const normalize = (str) => (str || "").toString().toLowerCase().replace(/_/g, ' ').trim();
            
            const datosConCruce = dataG18.filter(itemG18 => {
                let nombre = itemG18.country_name_en || itemG18.country || "";
                if(nombre.includes("China")) nombre = "China"; 
                return dataFelicidad.some(f => normalize(f.country) === normalize(nombre));
            });

            externalData = datosConCruce.slice(0, 15).map(itemG18 => {
                let nombrePais = itemG18.country_name_en || itemG18.country || "Desconocido";
                if(nombrePais.includes("China")) nombrePais = "China";

                const ano = itemG18.year || "—";
                const produccion = itemG18.production_tonnes === "" ? "0" : itemG18.production_tonnes;
                const producto = itemG18.item || "—";

                const felicidadMatch = dataFelicidad.find(f => normalize(f.country) === normalize(nombrePais));
                
                return {
                    pais: nombrePais,
                    ano: ano,
                    producto: producto,
                    produccion: produccion,
                    gdp: felicidadMatch ? felicidadMatch.gdp_per_capita : 'No data',
                    score: felicidadMatch ? felicidadMatch.happiness_score : 'No data'
                };
            });
        } catch(e) { console.error('G18 error', e); }
    }
 
    // --- 5. Proxy Países ---
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
 
    // --- 6. GitHub Proxy ---
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
 
    // --- 7. TV Maze ---
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
        <button class="btn btn-sm btn-outline-primary col-auto m-1 fw-bold" onclick={loadG14}>☄️ Meteoritos (G14)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1 fw-bold" onclick={loadG10}>🦠 Pandemias (G10)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1 fw-bold" onclick={loadG16}>⚡ EV Sales (G16)</button>
        <button class="btn btn-sm btn-outline-primary col-auto m-1 fw-bold" onclick={loadG18}>🍎 Food (G18)</button>
        <button class="btn btn-sm btn-outline-success col-auto m-1 fw-bold" onclick={loadProxy}>🌍 Países (Proxy)</button>
        <button class="btn btn-sm btn-outline-dark col-auto m-1 fw-bold"    onclick={loadGitHub}>🐙 GitHub (Proxy)</button>
        <button class="btn btn-sm btn-outline-danger col-auto m-1 fw-bold"  onclick={loadTV}>🎬 TV Series</button>
    </div>
 
    <div class="content-area p-4 border rounded bg-white shadow-sm" style="min-height:480px;">
 
        {#if currentIntegration === 'MENU'}
            <div class="text-center mt-5 py-5">
                <h3 class="text-muted">Panel de Integraciones JAM</h3>
                <p>Selecciona una fuente de datos del menú superior.</p>
            </div>
            
 {:else if currentIntegration === 'G14'}
            <div class="integration-info mb-3">
                <h3>🔥 Cruce: Meteoritos vs Índice de Riqueza (G14)</h3>
                <p class="small text-muted">Integración combinada | Librería: <b>Chart.js</b></p>
                <button class="btn btn-outline-secondary shadow-sm" onclick={() => {
                    fetch('https://sos2526-14.onrender.com/api/v2/meteorite-landings/loadInitialData');
                    fetch('https://sos2526-15.onrender.com/api/v2/happiness-indices/loadInitialData');
                    alert("✅ Petición para despertar APIs enviada. Haz clic de nuevo en el botón de Meteoritos.");
                }}>
                    Cargar Datos API Meteoritos
                </button>
            </div>
            
            {#if errorMerge}
                <div class="alert alert-danger mt-3 shadow-sm">{errorMerge}</div>
            {/if}

            <div style="position: relative; max-width:700px; margin:0 auto;">
                {#if loadingMerge}
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10;">
                        <span class="spinner-border text-warning me-2"></span> Cruzando datos...
                    </div>
                {/if}
                <canvas id="chartG14"></canvas>
            </div>
            {/if}
 
        {:else if currentIntegration === 'G10'}
            <h3>🦠 MASHUP: Pandemias vs Felicidad (G10)</h3>
            <p class="small text-muted">Fuente: <b>sos2526-10.onrender.com</b> | Librería: <b>ECharts</b> | Tipo: <b>Gráfico Mixto</b></p>
            <div id="chartG10" style="width:100%;height:420px;"></div>
 
        {:else if currentIntegration === 'G16'}
            <div class="integration-info mb-3">
                <h3>⚡ MASHUP: EV Sales vs Felicidad (G16)</h3>
                <p class="text-muted">Fuente: <b>sos2526-16.onrender.com</b> | Librería: <b>ApexCharts</b></p>
                <button class="btn btn-outline-secondary shadow-sm" onclick={cargarDatosEnergia}>
                    Cargar Datos API Energía
                </button>
            </div>
            <div id="chartG16"></div>

        {:else if currentIntegration === 'G18'}
            <div class="integration-info mb-3">
                <h3>🍎 MASHUP: Producción Agrícola (G18) vs Felicidad (G15)</h3>
                <p class="text-muted">Fuente: <strong>sos2526-18-mcs-stable.onrender.com</strong> + <strong>Mi API</strong> | Método: <strong>Tabla HTML</strong></p>
                <button class="btn btn-outline-secondary shadow-sm" onclick={cargarDatosFood}>
                    Cargar Datos API Alimentación
                </button>
            </div>

            {#if externalData && externalData.length > 0}
                <table class="table table-hover table-bordered mt-3 shadow-sm">
                    <thead class="table-dark">
                        <tr>
                            <th>País</th>
                            <th>Año</th>
                            <th>Producto</th>
                            <th>Producción (Toneladas)</th>
                            <th class="table-primary text-dark">PIB / GDP (Mi API)</th>
                            <th class="table-primary text-dark">Felicidad (Mi API)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each externalData as row}
                            <tr>
                                <td class="fw-bold">{row.pais}</td>
                                <td>{row.ano}</td>
                                <td>{row.producto}</td>
                                <td>{row.produccion} t</td>
                                <td>{row.gdp !== 'No data' ? `${row.gdp} $` : '—'}</td>
                                <td>{row.score !== 'No data' ? `⭐ ${row.score}` : '—'}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {:else}
                <div class="text-center mt-5 py-5 border rounded bg-light">
                    <p class="text-muted mb-0">No hay datos cargados en la API del G18.</p>
                    <p class="small text-muted">Haz clic en "Cargar Datos API Alimentación" para iniciar.</p>
                </div>
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
                        <img src={githubData.avatar_url} class="rounded-circle border shadow-sm" alt="avatar" style="width:100px;"/>
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
            <ul class="list-group list-group-flush mt-3 shadow-sm">
                {#each externalData.slice(0,8) as show}
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <b class="text-primary">{show.name}</b>
                            <span class="badge bg-light text-dark ms-2 border">{show.language ?? '—'}</span>
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
    .btn:hover { transform: scale(1.03); }
</style>