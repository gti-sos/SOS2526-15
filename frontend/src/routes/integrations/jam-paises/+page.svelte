<script>
    import { onMount } from 'svelte';
    import bb, { bar } from 'billboard.js';

    let loading = $state(true);

    onMount(async () => {
        // 1. Cargamos el Proxy externo y vuestra API de salarios
        const [resProxy, resSmi] = await Promise.all([
            fetch("/api/v2/happiness-indices/proxy-countries"),
            fetch("/api/v2/minimum-interprofessional-wages")
        ]);

        if (resProxy.ok && resSmi.ok) {
            const proxyData = await resProxy.json();
            const smiData = await resSmi.json();

            // 2. Lógica de integración: Agrupamos por REGIONES
            const regions = ["Europe", "Americas", "Asia", "Africa"];
            
            const stats = regions.map(region => {
                // Contamos países de esa región en el Proxy
                const countryCount = proxyData.filter(c => c.region === region).length;
                
                // Calculamos salario medio de esa región en nuestros datos
                const regionalSmi = smiData.filter(s => {
                    // Nota: Aquí podrías tener una lógica para saber a qué región pertenece cada país de tu DB
                    // Para la demo, filtramos países típicos si no tienes el campo 'region' en tu tabla
                    if (region === "Europe") return ["Spain", "France", "Germany", "Italy"].includes(s.country);
                    if (region === "Americas") return ["USA", "Canada", "Mexico", "Brazil"].includes(s.country);
                    return false;
                });

                const avgSalary = regionalSmi.length > 0 
                    ? regionalSmi.reduce((acc, curr) => acc + curr.nmw_on_dollar, 0) / regionalSmi.length 
                    : 0;

                return { region, countryCount, avgSalary };
            });

            // 3. Generamos la gráfica de Billboard (Cambiamos de Gauge a Bar para integrar mejor)
            bb.generate({
                data: {
                    x: "x",
                    columns: [
                        ["x", ...regions],
                        ["Países en Proxy", ...stats.map(s => s.countryCount)],
                        ["SMI Medio (Dividido por 100)", ...stats.map(s => s.avgSalary / 100)]
                    ],
                    type: bar(),
                    colors: {
                        "Países en Proxy": "#1f77b4",
                        "SMI Medio (Dividido por 100)": "#ff7f0e"
                    }
                },
                axis: {
                    x: { type: "category" }
                },
                bindto: "#chartEXT1"
            });
        }
        loading = false;
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver al Panel</a>
    
    <div class="card shadow-sm p-4">
        <h3>🌍 Integración: Proxy de Países vs Riqueza Regional</h3>
        <p class="text-muted">
            Analizamos la cantidad de países obtenidos vía <b>Proxy</b> y los comparamos con el Salario Mínimo medio registrado en nuestra base de datos.
        </p>
        <hr />

        {#if loading}
            <div class="text-center py-5">
                <div class="spinner-border text-success" role="status"></div>
                <p>Consultando Proxy y calculando medias...</p>
            </div>
        {/if}

        <div id="chartEXT1"></div>
        
        <div class="alert alert-info mt-4">
            <small>
                <b>¿Qué estamos viendo?</b> La barra azul indica cuántos países de esa región devuelve el proxy externo. La barra naranja es el salario medio de los países que tenemos en nuestra base de datos para esa misma región.
            </small>
        </div>
    </div>
</div>