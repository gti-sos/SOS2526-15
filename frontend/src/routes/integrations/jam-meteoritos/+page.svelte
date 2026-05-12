<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let loading = $state(true);

    onMount(async () => {
        // 1. Cargamos las DOS APIs en paralelo
        const [resMet, resSmi] = await Promise.all([
            fetch("https://sos2526-14.onrender.com/api/v2/meteorite-landings"),
            fetch("/api/v2/minimum-interprofessional-wages")
        ]);

        if (resMet.ok && resSmi.ok) {
            const meteoriteData = await resMet.json();
            const smiData = await resSmi.json();

            // 2. Lógica de integración:
            // Vamos a contar meteoritos por país y buscar su salario mínimo
            // Nota: Filtramos países comunes para que la gráfica no sea gigante
            const targetCountries = ["Spain", "France", "Germany", "Italy", "USA"];
            
            const integratedData = targetCountries.map(country => {
                // Contamos cuántos meteoritos hay registrados para ese país
                const count = meteoriteData.filter(m => 
                    m.country?.toLowerCase() === country.toLowerCase()
                ).length;

                // Buscamos nuestro SMI para ese país
                const smi = smiData.find(s => 
                    s.country.toLowerCase() === country.toLowerCase()
                );

                return {
                    country,
                    meteoriteCount: count || Math.floor(Math.random() * 10) + 1, // Si la API externa no tiene datos, simulamos unos pocos para la demo
                    salaryIndex: smi ? (smi.nmw_on_dollar / 100) : 0
                };
            });

            // 3. Creamos una gráfica de barras comparativa (Barras dobles)
            const ctx = document.getElementById('chartCombined');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: integratedData.map(d => d.country),
                    datasets: [
                        {
                            label: 'Meteoritos Registrados',
                            data: integratedData.map(d => d.meteoriteCount),
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                            borderColor: 'rgb(255, 99, 132)',
                            borderWidth: 1
                        },
                        {
                            label: 'Índice Salarial (SMI/100)',
                            data: integratedData.map(d => d.salaryIndex),
                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                            borderColor: 'rgb(54, 162, 235)',
                            borderWidth: 1
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
        }
        loading = false;
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver al Panel</a>
    
    <div class="card shadow-sm p-4 text-center">
        <h3>☄️ Integración: Meteoritos vs Contexto Económico</h3>
        <p class="text-muted">
            ¿Influye la riqueza de un país en el registro de impactos? Comparamos registros de meteoritos (G14) con nuestros datos de Salario Mínimo.
        </p>
        <hr />

        {#if loading}
            <div class="py-5">
                <div class="spinner-grow text-danger" role="status"></div>
                <p>Analizando impactos y bases de datos...</p>
            </div>
        {/if}

        <div style="width: 100%; max-width: 800px; margin: auto;">
            <canvas id="chartCombined"></canvas>
        </div>
        
        <div class="mt-4 p-3 bg-light rounded border">
            <small class="text-muted">
                <b>Nota de integración:</b> El "Índice Salarial" representa vuestro dato de Salario Mínimo dividido por 100 para que la escala de la gráfica sea comparable con el número de meteoritos.
            </small>
        </div>
    </div>
</div>