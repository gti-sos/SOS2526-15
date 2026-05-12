<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let loading = $state(true);
    let canvasElement = $state();

    onMount(async () => {
        try {
            const [resMet, resHap] = await Promise.all([
                fetch("https://sos2526-14.onrender.com/api/v2/meteorite-landings"),
                fetch("https://sos2526-15.onrender.com/api/v2/happiness-indices") // TU URL
            ]);

            if (resMet.ok && resHap.ok) {
                const meteoriteData = await resMet.json();
                const happinessData = await resHap.json();

                const targetCountries = ["Spain", "France", "Germany", "Italy", "USA"];
                
                const integratedData = targetCountries.map(country => {
                    // Contamos meteoritos
                    const count = meteoriteData.filter(m => 
                        m.country?.toLowerCase() === country.toLowerCase()
                    ).length;

                    // Buscamos en tus datos de Felicidad
                    const hapEntry = happinessData.find(h => 
                        h.country.toLowerCase() === country.toLowerCase()
                    );

                    return {
                        country,
                        meteoriteCount: count,
                        // CAMBIO AQUÍ: Usamos gdp_per_capita que sí existe en tu API
                        // Lo multiplicamos por 5 para que la barra se vea grande comparada con los meteoritos
                        wealthIndex: hapEntry ? (hapEntry.gdp_per_capita * 5) : 0 
                    };
                });

                new Chart(canvasElement, {
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
                                label: 'Índice de Riqueza (GDP x 5)',
                                data: integratedData.map(d => d.wealthIndex),
                                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                                borderColor: 'rgb(54, 162, 235)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            loading = false;
        }
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver al Panel</a>
    
    <div class="card shadow-sm p-4 text-center">
        <h3>☄️ Integración: Meteoritos vs Riqueza (Happiness API)</h3>
        <p class="text-muted">
            Usando los datos de <b>PIB per cápita</b> de nuestra propia API de Felicidad.
        </p>
        <hr />

        {#if loading}
            <div class="py-5">
                <div class="spinner-grow text-primary" role="status"></div>
                <p>Cargando datos de felicidad y meteoritos...</p>
            </div>
        {/if}

        <div style="width: 100%; max-width: 800px; margin: auto;" class={loading ? 'd-none' : ''}>
            <canvas bind:this={canvasElement}></canvas>
        </div>
    </div>
</div>