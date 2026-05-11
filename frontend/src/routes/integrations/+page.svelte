<script>
    import { onMount } from 'svelte';
    // Librerías necesarias para las integraciones de tus compañeros
    import Chart from 'chart.js/auto';
    import * as echarts from 'echarts';
    import ApexCharts from 'apexcharts';
    import c3 from 'c3';
    import Highcharts from 'highcharts';

    let currentIntegration = $state("MENU");
    let chartInstance = null;       
    let externalData = $state([]);

    // Limpiador para que las gráficas no se solapen
    function clearContainers() {
        if (chartInstance && typeof chartInstance.destroy === 'function') chartInstance.destroy();
        const containers = ['chartG10', 'chartG16', 'chartEXT1', 'chartGITHUB', 
                        'chartG14', 'chartG18', 'chartG27', 'chartEXT1_YHX', 
                        'chartEXT2_YHX', 'chartEXT3_YHX', 'chartHealthyDiet', 'chartSpaceLaunches', 'chartGrowthRates'
                        , 'POKEMON_PROXY', 'chartBreweries', 'chartCatFacts'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
    }

// --- INTEGRACIONES YHX ---    
// --- VARIABLES ---
let g26Data = $state(null); // Empezamos en null para saber si está cargando

// Función auxiliar para cargar datos si el array está vacío
    async function fetchWithAutoLoad(url) {
        let res = await fetch(url);
        let data = await res.json();
        if (Array.isArray(data) && data.length === 0) {
            console.log("Array vacío, cargando datos iniciales...");
            await fetch(url + "/loadInitialData"); // Llamada al recurso de carga
            res = await fetch(url); // Re-intento
            data = await res.json();
        }
        return data;
    }

    // --- 1. SOS G26 | Tabla HTML ---
    async function loadG26() {
        currentIntegration = "YHX_G26";
        g26Data = null;
        clearContainers();
        const data = await fetchWithAutoLoad("https://sos2526-26.onrender.com/api/v2/national-team-rankings-per-years");
        g26Data = data;
    }

    // --- 2. SOS G18 | Highcharts (Columnas) ---
    async function loadG18() {
        currentIntegration = "YHX_G18";
        clearContainers();
        const data = await fetchWithAutoLoad("https://sos2526-18-cereal-productions-stable.onrender.com/api/v2/cereal-productions");
        setTimeout(() => {
            Highcharts.chart('chartG18', {
                chart: { type: 'column' },
                title: { text: 'Producción de Cereales' },
                xAxis: { categories: data.slice(0, 10).map(d => `${d.country} (${d.year})`) },
                series: [{ name: 'Producción', data: data.slice(0, 10).map(d => d.production) }]
            });
        }, 100);
    }

    // --- 3. SOS G27 | ECharts (Scatter) ---
    async function loadG27() {
        currentIntegration = "YHX_G27";
        clearContainers();
        const data = await fetchWithAutoLoad("https://sos2526-27.onrender.com/api/v1/water-dams");
        setTimeout(() => {
            const myChart = echarts.init(document.getElementById('chartG27'));
            myChart.setOption({
                xAxis: { type: 'category', data: data.slice(0, 10).map(d => d.dam) },
                yAxis: { type: 'value' },
                series: [{ data: data.slice(0, 10).map(d => d.capacity), type: 'scatter', symbolSize: 20 }]
            });
        }, 100);
    }

    // --- 4. EXTERNA 1 (FakeStore API) | ApexCharts (Bar) ---
    // API 100% externa. Usamos 'title' y 'price' (estos sí son 100% seguros)
    async function loadExt1() {
        currentIntegration = "YHX_EXT1";
        clearContainers();
        const res = await fetch("https://fakestoreapi.com/products");
        if (res.ok) {
            const data = await res.json();
            setTimeout(() => {
                const options = {
                    chart: { type: 'bar', height: 400 },
                    plotOptions: { bar: { horizontal: true } },
                    series: [{ name: 'Precio ($)', data: data.slice(0, 5).map(d => d.price) }],
                    labels: data.slice(0, 5).map(d => d.title.substring(0, 15) + '...'),
                    colors: ['#f39c12']
                };
                chartInstance = new ApexCharts(document.querySelector("#chartEXT1_YHX"), options);
                chartInstance.render();
            }, 100);
        }
    }

    // --- 5. EXTERNA 2 (Rick & Morty) | Chart.js (Doughnut) ---
    // API 100% externa. Usamos 'name' y contamos cuántos episodios tiene 'episode.length'
    async function loadExt2() {
        currentIntegration = "YHX_EXT2";
        clearContainers();
        const res = await fetch("https://rickandmortyapi.com/api/character");
        if (res.ok) {
            const data = await res.json();
            setTimeout(() => {
                const ctx = document.getElementById('chartEXT2_YHX').getContext('2d');
                chartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: data.results.slice(0, 5).map(d => d.name),
                        datasets: [{ 
                            label: 'Episodios', 
                            data: data.results.slice(0, 5).map(d => d.episode.length),
                            backgroundColor: ['#ff9999','#66b3ff','#99ff99','#ffcc99','#c2c2f0']
                        }]
                    }
                });
            }, 100);
        }
    }

    // --- 6. EXTERNA 3 (REST Countries vía PROXY) | C3.js (Pie) ---
    // API 100% externa a través del proxy. Usamos 'name.common' y 'population'
    async function loadExt3Proxy() {
        currentIntegration = "YHX_EXT3";
        clearContainers();
        const res = await fetch("/api/proxy-countries");
        if (res.ok) {
            const data = await res.json();
            setTimeout(() => {
                const columns = data.slice(0, 5).map(d => [d.name.common, d.population]);
                chartInstance = c3.generate({
                    data: { columns: columns, type: 'pie' },
                    bindto: '#chartEXT3_YHX'
                });
            }, 100);
        }
    }

    // --- INTEGRACIONES SMB ---
    let healthyDietData = $state([]);
    let launchesData = $state([]);
    let growthData = $state([]);
    let breweryData = $state([]);
    let pokemonData = $state([]);
    let catFacts = $state([]);

    async function loadHealthyDiet() {

        clearContainers();

        const res = await fetch(
                "https://sos2526-18.onrender.com/api/v1/cost-of-healthy-diet-by-countries"
            );

            if(res.ok){

                healthyDietData = await res.json();

                currentIntegration = "SMB_G18";

                setTimeout(() => {

                    Highcharts.chart('chartHealthyDiet', {

                        chart: {
                            type: 'area'
                        },

                        title: {
                            text: 'Healthy Diet Cost'
                        },

                        xAxis: {
                            categories: healthyDietData
                                .slice(0,10)
                                .map(d => d.country)
                        },

                        series: [{
                            name: 'Healthy Diet Cost',
                            data: healthyDietData
                                .slice(0,10)
                                .map(d => d.cost_healthy_diet_ppp_usd)
                        }]
                    });

                },100);
            }
        }
    async function loadSpaceLaunches() {

        clearContainers();

        const res = await fetch(
            "https://space-launches-8cix.onrender.com/api/v2/space-launches"
        );

        if(res.ok){

            launchesData = await res.json();

            currentIntegration = "SMB_G14";

            setTimeout(() => {

                const success = launchesData.filter(
                    d => d.mission_status === "Success"
                ).length;

                const failure = launchesData.filter(
                    d => d.mission_status === "Failure"
                ).length;

                const ctx = document
                    .getElementById("chartSpaceLaunches")
                    .getContext("2d");

                chartInstance = new Chart(ctx, {

                    type: "radar",

                    data: {

                        labels: ["Success", "Failure"],

                        datasets: [{
                            label: "Space Launches",
                            data: [success, failure],

                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            pointBackgroundColor: "rgba(255, 99, 132, 1)",
                            pointBorderColor: "#fff",
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "rgba(255, 99, 132, 1)"
                        }]
                    },

                    options: {

                        responsive: true,

                        plugins: {
                            title: {
                                display: true,
                                text: "Success vs Failure Launches"
                            }
                        },

                        scales: {
                            r: {
                                beginAtZero: true
                            }
                        }
                    }
                });

            },100);
        }
    }
    async function loadGrowthRates() {

        clearContainers();

        const res = await fetch(
            "https://sos2526-12.onrender.com/api/v2/birth-death-growth-rates"
        );

        if(res.ok){

            growthData = await res.json();

            currentIntegration = "SMB_G12";

            setTimeout(() => {

                const ctx = document
                    .getElementById("chartGrowthRates")
                    .getContext("2d");

                chartInstance = new Chart(ctx, {

                    type: "bar",

                    data: {

                        labels: growthData
                            .slice(0,8)
                            .map(d => d.country_name),

                        datasets: [

                            {
                                label: "Birth Rate",

                                data: growthData
                                    .slice(0,8)
                                    .map(d => d.crude_birth_rate)
                            },

                            {
                                label: "Death Rate",

                                data: growthData
                                    .slice(0,8)
                                    .map(d => d.crude_death_rate)
                            },

                            {
                                label: "Growth Rate",

                                data: growthData
                                    .slice(0,8)
                                    .map(d => d.growth_rate)
                            }
                        ]
                    },

                    options: {

                        responsive: true,

                        plugins: {
                            title: {
                                display: true,
                                text: "Birth / Death / Growth Rates"
                            }
                        }
                    }
                });

            },100);
        }
    }
    async function loadPokemonProxy() {

        clearContainers();

        const res = await fetch(
            "/api/v2/minimum-interprofessional-wages/proxy-pokemon"
        );

        if(res.ok){

            const data = await res.json();

            externalData = data;

            currentIntegration = "POKEMON_PROXY";
        }
    }


    async function loadBreweries() {

        clearContainers();

        const res = await fetch(
            "https://api.openbrewerydb.org/v1/breweries?per_page=10"
        );

        if(res.ok){

            breweryData = await res.json();

            currentIntegration = "BREWERIES";

            setTimeout(() => {

                Highcharts.chart('chartBreweries', {

                    chart: {
                        type: 'column'
                    },

                    title: {
                        text: 'Breweries by City'
                    },

                    xAxis: {
                        categories: breweryData.map(b => b.city)
                    },

                    series: [{
                        name: 'Breweries',
                        data: breweryData.map(() => 1)
                    }]
                });
            },100);
        }
    }
    async function loadCatFacts() {

        clearContainers();

        const res = await fetch(
            "https://catfact.ninja/facts?limit=10"
        );

        if(res.ok){

            const data = await res.json();

            catFacts = data.data;

            currentIntegration = "CAT_FACTS";

            setTimeout(() => {

                Highcharts.chart('chartCatFacts', {

                    chart: {
                        type: 'scatter',
                        zoomType: 'xy'
                    },

                    title: {
                        text: 'Cat Facts Length'
                    },

                    xAxis: {
                        title: {
                            text: 'Fact Number'
                        }
                    },

                    yAxis: {
                        title: {
                            text: 'Characters'
                        }
                    },

                    series: [{
                        name: 'Fact Length',
                        data: catFacts.map((f, index) => [
                            index + 1,
                            f.length
                        ])
                    }]
                });

            },100);
        }
    }


</script>

<main class="container py-4">
    <h1 class="text-center mb-4">🧩 Mis Integraciones (JAM)</h1>
    <div class="row g-2 justify-content-center mb-5">
        <a class="btn btn-sm btn-outline-primary col-auto m-1" href="/integrations/jam-meteoritos">☄️ Meteoritos (G14)</a>
        <a class="btn btn-sm btn-outline-primary col-auto m-1" href="/integrations/jam-pandemias">🦠 Pandemias (G10)</a>
        <a class="btn btn-sm btn-outline-primary col-auto m-1" href="/integrations/jam-ev-sales">⚡ EV Sales (G16)</a>
        <a class="pointer btn btn-sm btn-outline-primary col-auto m-1" href="/integrations/jam-food">🍎 Food (G18)</a>
        <a class="btn btn-sm btn-outline-success col-auto m-1" href="/integrations/jam-paises">🌍 Países (Proxy)</a>
        <a class="btn btn-sm btn-outline-dark col-auto m-1" href="/integrations/jam-github">🐙 GitHub (OAuth)</a>
        <a class="btn btn-sm btn-outline-danger col-auto m-1" href="/integrations/jam-tv">🎬 TV Series (EXT)</a>
    </div>

    <h1 class="text-center mb-4">🧩 Integraciones YHX</h1>
    <div class="row g-2 justify-content-center mb-5">
        <button class="btn btn-outline-primary m-1" onclick={loadG26}>Grupo 26 (Texto)</button>
        <button class="btn btn-outline-primary m-1" onclick={loadG18}>Grupo 18 (Chart.js)</button>
        <button class="btn btn-outline-primary m-1" onclick={loadG27}>Grupo 27 (ECharts)</button>
        <button class="btn btn-outline-success m-1" onclick={loadExt1}>FakeStore (ApexCharts)</button>
        <button class="btn btn-outline-success m-1" onclick={loadExt2}>Rick&Morty (Doughnut)</button>
        <button class="btn btn-outline-danger m-1" onclick={loadExt3Proxy}>Países PROXY (C3.js)</button>
    </div>

    <h1 class="text-center mb-4">🧩 Integraciones SMB</h1>
    <div class="row g-2 justify-content-center mb-5">
        <button class="btn btn-outline-warning m-1" onclick={loadHealthyDiet}> Healthy Diet (G18) </button>
    </div>

    <div class="row g-2 justify-content-center mb-5">
        <button class="btn btn-outline-warning m-1" onclick={loadHealthyDiet}> Healthy Diet (G18) </button>
        <button class="btn btn-outline-info m-1" onclick={loadSpaceLaunches}> Space Launches (G14) </button>
        <button class="btn btn-outline-success m-1" onclick={loadGrowthRates}> Growth Rates (G12) </button>
        <button class="btn btn-outline-success m-1" onclick={loadPokemonProxy}> Pokémon Proxy </button>
        <button class="btn btn-outline-dark m-1" onclick={loadBreweries}> Breweries API </button>
        <button class="btn btn-outline-secondary m-1" onclick={loadCatFacts}>Cat Facts</button>
    </div>
    <div class="content-area p-4 border rounded bg-white shadow-sm" style="min-height: 500px;">
        {#if currentIntegration === "MENU"}
            <div class="text-center mt-5 py-5">
                <h3 class="text-muted">Panel de Control de Datos</h3>
                <p>Usa el menú superior para cargar las integraciones de YHX y SMB.</p>
                <p class="small">Tus integraciones (JAM) ahora abren en páginas separadas.</p>
            </div>

        {:else if currentIntegration === "YHX_G26"}
            <h3>📝 Grupo 26: Rankings Deportivos</h3>
            <p class="small text-muted">Datos obtenidos de su API v2 (Uso textual HTML)</p>
            
            {#if g26Data === null}
                <div class="alert alert-info">⌛ Conectando con el servidor del Grupo 26... (Puede tardar si el servidor estaba dormido)</div>
            {:else if g26Data.length === 0}
                <div class="alert alert-danger">❌ No se han podido recuperar datos del Grupo 26. Revisa la consola (F12).</div>
            {:else}
                <table class="table table-striped table-bordered mt-3">
                    <thead class="table-dark">
                        <tr>
                            <th>País / Equipo</th>
                            <th>Año</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each g26Data.slice(0, 15) as item}
                            <tr>
                                <td>{item.country || item.team}</td>
                                <td>{item.year}</td>
                                <td>{item.points}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}

        {:else if currentIntegration === "YHX_G18"}
            <h3>🌾 Grupo 18: Producción de Cereales</h3>
            <div id="chartG18" style="width: 100%; height: 450px; margin-top: 20px;"></div>

        {:else if currentIntegration === "YHX_G27"}
            <h3>💧 Grupo 27: Presas</h3>
            <div id="chartG27" style="width: 100%; height: 400px;"></div>

        {:else if currentIntegration === "YHX_EXT1"}
            <h3>🛍️ Fake Store API</h3>
            <div id="chartEXT1_YHX"></div>

        {:else if currentIntegration === "YHX_EXT2"}
            <h3>👽 Rick and Morty API</h3>
            <canvas id="chartEXT2_YHX"></canvas>

        {:else if currentIntegration === "YHX_EXT3"}
            <h3>🌍 REST Countries (Vía Proxy)</h3>
            <div id="chartEXT3_YHX"></div>

        {:else if currentIntegration === "SMB_G18"}
            <h3>Healthy Diet</h3>
            <div id="chartHealthyDiet"
                style="width:100%; height:400px;">
            </div>
        {:else if currentIntegration === "SMB_G14"}
            <h3>Space Launches</h3>

            <div style="max-width:500px; margin:auto;">
                <canvas id="chartSpaceLaunches"></canvas>
            </div>
        {:else if currentIntegration === "SMB_G12"}

            <h3>Birth / Death / Growth Rates</h3>

            <div style="width:100%; max-width:900px; margin:auto;">
                <canvas id="chartGrowthRates"></canvas>
            </div>
        {:else if currentIntegration === "POKEMON_PROXY"}

            <h3>Pokemon API (Proxy)</h3>

            <table class="table">

                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>URL</th>
                    </tr>
                </thead>

                <tbody>

                    {#each externalData as pokemon}

                        <tr>
                            <td>{pokemon.name}</td>
                            <td>{pokemon.url}</td>
                        </tr>

                    {/each}

                </tbody>

            </table>
            {:else if currentIntegration === "BREWERIES"}

                <h3>Breweries API</h3>

                <div id="chartBreweries"
                    style="width:100%; height:400px;">
                </div>
            {:else if currentIntegration === "CAT_FACTS"}

                <h3>Cat Facts API</h3>

                <div id="chartCatFacts"
                    style="width:100%; height:400px;">
                </div>
        {/if}


        
    </div>
</main>

<style>
    :global(body) { background-color: #f8f9fa; }
    .content-area { max-width: 900px; margin: 0 auto; }
    .btn { transition: transform 0.2s; }
    .btn:hover { transform: scale(1.05); }
</style>