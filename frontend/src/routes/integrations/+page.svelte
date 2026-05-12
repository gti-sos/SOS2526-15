<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Chart from 'chart.js/auto';
    import * as echarts from 'echarts';
    import ApexCharts from 'apexcharts';
    import c3 from 'c3';
    import Highcharts from 'highcharts';

    let currentIntegration = $state("MENU");
    let chartInstance = null;       
    let externalData = $state([]);

    function clearContainers() {
        if (chartInstance && typeof chartInstance.destroy === 'function') chartInstance.destroy();
        const containers = ['chartG10', 'chartG16', 'chartEXT1', 'chartGITHUB', 
                        'chartG14', 'chartG18', 'chartG27', 'chartEXT1_YHX', 
                        'chartEXT2_YHX', 'chartEXT3_YHX', 'chartHealthyDiet', 'chartSpaceLaunches', 'chartGrowthRates'
                        , 'chartBreweries', 'chartPopulation'];
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
                title: { text: 'Producción de Cereales (Grupo 18)' },
                // Usamos d.country y d.year
                xAxis: { categories: data.slice(0, 10).map(d => `${d.country} (${d.year})`) },
                // Usamos el campo correcto: d.cereal_production
                series: [{ name: 'Producción (Toneladas)', data: data.slice(0, 10).map(d => d.cereal_production) }]
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
                title: { text: 'Capacidad de Presas (Grupo 27)' },
                tooltip: { trigger: 'item' },
                // Usamos los campos correctos: d.dam_name y d.cap_mcm
                xAxis: { type: 'category', data: data.slice(0, 10).map(d => d.dam_name) },
                yAxis: { type: 'value', name: 'Capacidad (mcm)' },
                series: [{ data: data.slice(0, 10).map(d => d.cap_mcm), type: 'scatter', symbolSize: 20 }]
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

    // --- Ext 3: Criptomonedas (Proxy) ---
    async function loadCryptoProxy() {
        // Le cambiamos el nombre al estado para que quede claro
        currentIntegration = "CRYPTO_PROXY"; 
        clearContainers();
        externalData = []; // Limpiamos datos anteriores
        try {
            // OJO: Tendrás que crear esta ruta en tu backend (te lo explico abajo)
            const res = await fetch("/api/proxy-crypto"); 
            if (res.ok) {
                const json = await res.json();
                // CoinCap devuelve los datos dentro de un objeto llamado 'data'
                externalData = json.data || json; 
            }
        } catch (error) {
            console.error("Error al cargar el proxy de criptos:", error);
        }
    }

    // --- INTEGRACIONES SMB ---
    let healthyDietData = $state([]);
    let launchesData = $state([]);
    let growthData = $state([]);
    let breweryData = $state([]);
    let educationData = $state([]);
    let catFacts = $state([]);
    let smbData = $state([]);

    async function loadHealthyDiet() {

        clearContainers();

        const res = await fetch(
            "https://sos2526-18.onrender.com/api/v1/cost-of-healthy-diet-by-countries?date=2022"
        );

        const myRes = await fetch(
            "/api/v2/minimum-interprofessional-wages?date=2022"
        );
        if(res.ok && myRes.ok){
            healthyDietData = await res.json();
            smbData = await myRes.json();
            let integratedData = [];
            healthyDietData.forEach(diet => {
                let smb = smbData.find(s =>
                    s.country.toLowerCase() === diet.country.toLowerCase()
                );

                if(smb){

                    integratedData.push({

                        country: diet.country,

                        healthyDiet: diet.cost_healthy_diet_ppp_usd,

                        minimumWage: smb.nmw_on_dollar
                    });
                }
            });

            currentIntegration = "SMB_G18";

            setTimeout(() => {

                Highcharts.chart('chartHealthyDiet', {

                    chart: {
                        type: 'area'
                    },

                    title: {
                        text: 'Healthy Diet vs Minimum Wage'
                    },

                    xAxis: {
                        categories: integratedData
     
                            .map(d => d.country)
                    },

                    series: [

                        {
                            name: 'Healthy Diet Cost',
                            data: integratedData
                           
                                .map(d => d.healthyDiet)
                        },

                        {
                            name: 'Minimum Wage',
                            data: integratedData
                             
                                .map(d => d.minimumWage)
                        }
                    ]
                });

            },100);
        }
    }
    async function loadSpaceLaunches() {
        clearContainers();

        const [resSpace, resSmb] = await Promise.all([
            fetch("https://space-launches-8cix.onrender.com/api/v2/space-launches"),
            fetch("/api/v2/minimum-interprofessional-wages?date=2022") 
        ]);

        if (resSpace.ok && resSmb.ok) {
            const spaceData = await resSpace.json();
            const smbData = await resSmb.json();

            let integratedData = [];

            smbData.forEach(smb => {

                const successCount = spaceData.filter(launch => 
                    launch.country.trim().toLowerCase() === smb.country.trim().toLowerCase() &&
                    launch.mission_status === "Success"
                ).length;

                if (successCount > 0) {
                    integratedData.push({
                        country: smb.country.toUpperCase(),
                        successLaunches: successCount,
                        salaryIndex: smb.nmw_on_dollar / 100 
                    });
                }
            });

            currentIntegration = "SMB_G14";
            setTimeout(() => {
                const ctx = document.getElementById("chartSpaceLaunches").getContext("2d");

                if (window.chartInstanceSpace) {
                    window.chartInstanceSpace.destroy();
                }

                window.chartInstanceSpace = new Chart(ctx, {
                    type: "radar",
                    data: {
                        labels: integratedData.map(d => d.country),
                        datasets: [
                            {
                                label: "Lanzamientos Exitosos (Total)",
                                data: integratedData.map(d => d.successLaunches),
                                fill: true,
                                backgroundColor: "rgba(54, 162, 235, 0.2)",
                                borderColor: "rgb(54, 162, 235)",
                                pointBackgroundColor: "rgb(54, 162, 235)",
                            },
                            {
                                label: "Índice Salarial (Salario/100)",
                                data: integratedData.map(d => d.salaryIndex),
                                fill: true,
                                backgroundColor: "rgba(255, 99, 132, 0.2)",
                                borderColor: "rgb(255, 99, 132)",
                                pointBackgroundColor: "rgb(255, 99, 132)",
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: "Relación Salario Mínimo vs Éxito Espacial por País"
                            }
                        },
                        scales: {
                            r: {
                                angleLines: { display: true },
                                suggestedMin: 0
                            }
                        }
                    }
                });
            }, 100);
        }
    }
   async function loadGrowthRates() {
        clearContainers();

        const [res, myRes] = await Promise.all([
            fetch("https://sos2526-12.onrender.com/api/v2/birth-death-growth-rates?year=2022"),
            fetch("/api/v2/minimum-interprofessional-wages?date=2022")
        ]);

        if (res.ok && myRes.ok) {
            const growthData = await res.json();
            const smbData = await myRes.json();

            const integratedData = growthData
                .map(growth => {

                    const smb = smbData.find(s => 
                        s.country.trim().toLowerCase() === growth.country_name.trim().toLowerCase()
                    );

                    if (smb) {
                        return {
                            country: growth.country_name,
                            birthRate: growth.crude_birth_rate,
                            deathRate: growth.crude_death_rate,
                            growthRate: growth.growth_rate,
                            minimumWage: smb.nmw_on_dollar
                        };
                    }
                    return null;
                })
                .filter(item => item !== null);

            currentIntegration = "SMB_G12";

            setTimeout(() => {
                const ctx = document.getElementById("chartGrowthRates").getContext("2d");
                
                if (window.chartInstance) {
                    window.chartInstance.destroy();
                }

                window.chartInstance = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: integratedData.map(d => d.country),
                        datasets: [
                            {
                                label: "Birth Rate",
                                data: integratedData.map(d => d.birthRate),
                                backgroundColor: 'rgba(54, 162, 235, 0.5)'
                            },
                            {
                                label: "Death Rate",
                                data: integratedData.map(d => d.deathRate),
                                backgroundColor: 'rgba(255, 99, 132, 0.5)'
                            },
                            {
                                label: "Growth Rate",
                                data: integratedData.map(d => d.growthRate),
                                backgroundColor: 'rgba(75, 192, 192, 0.5)'
                            },
                            {
                                label: "Min. Wage ($)",
                                data: integratedData.map(d => d.minimumWage),
                                backgroundColor: 'rgba(255, 206, 86, 0.5)'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `Comparativa: Tasas vs Salario Mínimo)`
                            }
                        }
                    }
                });
            }, 100);
        } else {
            console.error("Error al conectar con las APIs");
        }
    }
    async function loadEducationProxy() {
        clearContainers();
        
        const countriesToCompare = ["Spain", "Germany", "Canada", "France", "Italy"];
        let tempIntegratedData = [];

        const resSmb = await fetch("/api/v2/minimum-interprofessional-wages");
        
        if (resSmb.ok) {
            const smbData = await resSmb.json();

            for (const country of countriesToCompare) {
                const resUni = await fetch(`/api/v2/minimum-interprofessional-wages/proxy-universities?country=${country}`);
                if (resUni.ok) {
                    const unis = await resUni.json();
                    const smb = smbData.find(s => s.country.toLowerCase() === country.toLowerCase());

                    if (smb) {
                        tempIntegratedData.push({
                            country: country,
                            numUniversities: unis.length,
                            salary: smb.nmw_on_dollar
                        });
                    }
                }
            }
            educationData = tempIntegratedData;
            currentIntegration = "EDUCATION_PROXY";
        }
    }


    async function loadBreweries() {
        clearContainers();

        const [resBrew, resSmb] = await Promise.all([
            fetch("https://api.openbrewerydb.org/v1/breweries?by_country=united_states&per_page=200"),
            fetch("/api/v2/minimum-interprofessional-wages?country=united%20states&date=2026")
        ]);

        if (resBrew.ok && resSmb.ok) {
            const brewData = await resBrew.json();
            const smbData = await resSmb.json();
            const salary = smbData[0]?.nmw_on_dollar || 0;

            const cityCounts = brewData.reduce((acc, b) => {
                acc[b.city] = (acc[b.city] || 0) + 1;
                return acc;
            }, {});

            const sortedCities = Object.entries(cityCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            currentIntegration = "BREWERIES";

            setTimeout(() => {
                Highcharts.chart('chartBreweries', {
                    chart: { type: 'bar' },
                    title: { text: 'Cervecerías por Ciudad vs Salario Nacional (USA)' },
                    xAxis: { 
                        categories: sortedCities.map(c => c[0]),
                        title: { text: 'Ciudades' }
                    },
                    yAxis: {
                        min: 0,
                        title: { text: 'Cantidad / Salario ($)', align: 'high' }
                    },
                    plotOptions: {
                        bar: { dataLabels: { enabled: true } }
                    },
                    series: [{
                        name: 'Nº de Cervecerías',
                        data: sortedCities.map(c => c[1]),
                        color: '#f39c12'
                    }, {
                        name: 'Salario Mínimo ($)',
                        type: 'scatter', 
                        data: sortedCities.map((c, i) => [i, salary]),
                        color: '#2c3e50',
                        marker: {
                            symbol: 'diamond',
                            radius: 6
                        }
                    }]
                });
            }, 150);
        }
    }
    async function loadPopulationIntegration() {
        clearContainers();
        
        const countries = ["Spain", "France", "Italy", "Germany"];
        let integratedData = [];

        const resSmb = await fetch("/api/v2/minimum-interprofessional-wages?date=2022");
        
        if (resSmb.ok) {
            const smbData = await resSmb.json();

            for (const cName of countries) {
                const resPop = await fetch("https://countriesnow.space/api/v0.1/countries/population/cities", {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ "city": cName === "Spain" ? "Madrid" : cName === "France" ? "Paris" : "Berlin" })
                });

                if (resPop.ok) {
                    const popJson = await resPop.json();
                    const smb = smbData.find(s => s.country.toLowerCase() === cName.toLowerCase());

                    if (smb && !popJson.error) {
                        const lastPop = popJson.data.populationCounts.at(-1); 
                        integratedData.push({
                            name: `${popJson.data.city} (${cName})`,
                            x: parseInt(lastPop.value),
                            y: smb.nmw_on_dollar     
                        });
                    }
                }
            }

            currentIntegration = "POPULATION_SMI";

            setTimeout(() => {
                Highcharts.chart('chartPopulation', {
                    chart: { type: 'scatter', zoomType: 'xy' },
                    title: { text: 'Relación Población Capital vs Salario Mínimo' },
                    xAxis: {
                        title: { text: 'Población (Habitantes)' },
                        gridLineWidth: 1
                    },
                    yAxis: {
                        title: { text: 'Salario Mínimo (USD)' }
                    },
                    legend: { enabled: false },
                    plotOptions: {
                        scatter: {
                            marker: {
                                radius: 8,
                                states: { hover: { enabled: true, lineDashStyle: 'solid' } }
                            },
                            tooltip: {
                                headerFormat: '<b>{point.key}</b><br>',
                                pointFormat: 'Población: {point.x} hab.<br>SMI: {point.y} $'
                            }
                        }
                    },
                    series: [{
                        name: 'País',
                        color: 'rgba(223, 83, 83, .5)',
                        data: integratedData
                    }]
                });
            }, 100);
        }
    }

</script>

<main class="container py-4">
    <h1 class="text-center mb-4">🧩 Integraciones JAM</h1>
<div class="row g-2 justify-content-center mb-5">
    <button class="btn btn-sm btn-outline-primary col-auto m-1" onclick={() => goto('/integrations/jam-meteoritos')}>☄️ Meteoritos (G14)</button>
    <button class="btn btn-sm btn-outline-primary col-auto m-1" onclick={() => goto('/integrations/jam-pandemias')}>🦠 Pandemias (G10)</button>
    <button class="btn btn-sm btn-outline-primary col-auto m-1" onclick={() => goto('/integrations/jam-ev-sales')}>⚡ EV Sales (G16)</button>
    <button class="pointer btn btn-sm btn-outline-primary col-auto m-1" onclick={() => goto('/integrations/jam-food')}>🍎 Food (G18)</button>
    <button class="btn btn-sm btn-outline-success col-auto m-1" onclick={() => goto('/integrations/jam-paises')}>🌍 Países (Proxy)</button>
    <button class="btn btn-sm btn-outline-dark col-auto m-1" onclick={() => goto('/integrations/jam-github')}>🐙 GitHub (OAuth)</button>
    <button class="btn btn-sm btn-outline-danger col-auto m-1" onclick={() => goto('/integrations/jam-tv')}>🎬 TV Series (EXT)</button>
</div>

    <h1 class="text-center mb-4">🧩 Integraciones YHX</h1>
    <div class="row g-2 justify-content-center mb-5">
        <button class="btn btn-outline-primary m-1" onclick={loadG26}>Grupo 26 (Texto)</button>
        <button class="btn btn-outline-primary m-1" onclick={loadG18}>Grupo 18 (Chart.js)</button>
        <button class="btn btn-outline-primary m-1" onclick={loadG27}>Grupo 27 (ECharts)</button>
        <button class="btn btn-outline-success m-1" onclick={loadExt1}>FakeStore (ApexCharts)</button>
        <button class="btn btn-outline-success m-1" onclick={loadExt2}>Rick&Morty (Doughnut)</button>
        <button class="btn btn-dark col-auto m-1" onclick={loadCryptoProxy}>Ext 3 (Criptos Proxy)</button>
    </div>

    <h1 class="text-center mb-4">🧩 Integraciones SMB</h1>

    <div class="row g-2 justify-content-center mb-5">
        <button class="btn btn-outline-warning m-1" onclick={loadHealthyDiet}> Healthy Diet (G18) </button>
        <button class="btn btn-outline-info m-1" onclick={loadSpaceLaunches}> Space Launches (G14) </button>
        <button class="btn btn-outline-success m-1" onclick={loadGrowthRates}> Growth Rates (G12) </button>
        <button class="btn btn-outline-success m-1" onclick={loadEducationProxy}> Education Proxy </button>
        <button class="btn btn-outline-dark m-1" onclick={loadBreweries}> Breweries API </button>
        <button class="btn btn-outline-secondary m-1" onclick={loadPopulationIntegration}>Population</button>
    </div>
    <div class="content-area p-4 border rounded bg-white shadow-sm" style="min-height: 500px;">
        {#if currentIntegration === "MENU"}
            <div class="text-center mt-5 py-5">
                <h3 class="text-muted">Panel de Control de Datos</h3>
            </div>

        {:else if currentIntegration === "YHX_G26"}
            <h3>📝 Grupo 26: Rankings Deportivos</h3>
            <p class="small text-muted">Datos obtenidos de su API v2 (Uso textual HTML)</p>
            {#if g26Data}
                <table class="table table-striped mt-3">
                    <thead class="table-dark">
                        <tr>
                            <th>País</th>
                            <th>Año</th>
                            <th>Score</th>
                            <th>Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each g26Data.slice(0,10) as item}
                            <tr>
                                <td>{item.country}</td>
                                <td>{item.year}</td>
                                <td>{item.score}</td>
                                <td>{item.rank}</td>
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

        {:else if currentIntegration === "CRYPTO_PROXY"}
            <h3>💰 Top Criptomonedas (vía Proxy)</h3>
            <p class="small text-muted">Datos obtenidos de CoinCap API a través de nuestro backend</p>
            
            {#if externalData.length > 0}
                <table class="table table-hover mt-3 shadow-sm">
                    <thead class="table-dark">
                        <tr>
                            <th>Rank</th>
                            <th>Nombre</th>
                            <th>Símbolo</th>
                            <th>Precio (USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each externalData.slice(0, 10) as coin}
                            <tr>
                                <td>{coin.rank}</td>
                                <td><strong>{coin.name}</strong></td>
                                <td><span class="badge bg-secondary">{coin.symbol}</span></td>
                                <td>${parseFloat(coin.priceUsd).toFixed(2)}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {:else}
                <div class="alert alert-info">Cargando datos del mercado a través del proxy...</div>
            {/if}

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
        {:else if currentIntegration === "EDUCATION_PROXY"}

            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3>🎓 Educación vs Economía</h3>
                <span class="badge bg-info text-dark">Fuente: Hipolabs + API SMI</span>
            </div>

            <p>Comparativa del número de universidades registradas frente al Salario Mínimo Interprofesional (SMI).</p>

            <table class="table table-hover align-middle shadow-sm">
                <thead class="table-dark">
                    <tr>
                        <th>País</th>
                        <th class="text-center">Nº Universidades</th>
                        <th class="text-center">Salario Mínimo (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    {#each educationData as item}
                        <tr>
                            <td class="fw-bold">{item.country}</td>
                            <td class="text-center">
                                <span class="badge rounded-pill bg-primary" style="font-size: 0.9em;">
                                    {item.numUniversities}
                                </span>
                            </td>
                            <td class="text-center text-success fw-bold">
                                {item.salary} $
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            
            <div class="alert alert-light border-start border-4 border-info">
                <small><strong>Nota:</strong> Los datos de universidades provienen de la API de Hipolabs, mientras que los salarios corresponden al SMI de 2022.</small>
            </div>
            {:else if currentIntegration === "BREWERIES"}

                <h3>Breweries API</h3>

                <div id="chartBreweries"
                    style="width:100%; height:400px;">
                </div>
            {:else if currentIntegration === "POPULATION_SMI"}

                <h3>Population API</h3>

                <div id="chartPopulation"
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