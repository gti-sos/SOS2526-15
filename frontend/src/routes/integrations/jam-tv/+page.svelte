<script>
    import { onMount } from 'svelte';

    let mergedShows = $state([]);
    let loading = $state(true);

    onMount(async () => {
        // 1. Cargamos TV Maze y vuestra API de Salarios
        const [resTV, resSmi] = await Promise.all([
            fetch("https://api.tvmaze.com/search/shows?q=happiness"),
            fetch("/api/v2/minimum-interprofessional-wages")
        ]);

        if (resTV.ok && resSmi.ok) {
            const tvData = await resTV.json();
            const smiData = await resSmi.json();

            // 2. Lógica de integración: Cruzamos por país de origen
            mergedShows = tvData.map(d => {
                const show = d.show;
                // TV Maze guarda el país en network.country o webChannel.country
                const countryName = show.network?.country?.name || show.webChannel?.country?.name;
                
                // Buscamos el SMI de ese país en vuestra API
                const smi = countryName 
                    ? smiData.find(s => s.country.toLowerCase() === countryName.toLowerCase())
                    : null;

                return {
                    name: show.name,
                    language: show.language,
                    type: show.type,
                    country: countryName || "Internacional",
                    salary: smi ? `${smi.nmw_on_dollar} $` : "N/D",
                    genres: show.genres?.join(", ") || "Varios"
                };
            });
        }
        loading = false;
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver al Panel</a>
    
    <div class="card shadow-sm p-4">
        <h3>🎬 Integración: Producción Audiovisual vs SMI</h3>
        <p class="text-muted">
            Relacionamos series de televisión con el contexto económico (Salario Mínimo) del país donde se producen.
        </p>
        <hr />

        {#if loading}
            <div class="text-center py-5">
                <div class="spinner-border text-danger" role="status"></div>
                <p>Sincronizando cartelera y datos económicos...</p>
            </div>
        {:else}
            <div class="list-group shadow-sm">
                {#each mergedShows.slice(0, 12) as item}
                    <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center">
                                <h5 class="mb-1 text-primary me-2">{item.name}</h5>
                                <span class="badge bg-info text-dark small">{item.language}</span>
                            </div>
                            <small class="d-block text-muted">Géneros: {item.genres}</small>
                            <small class="badge bg-light text-dark border mt-1">Origen: {item.country}</small>
                        </div>
                        
                        <div class="text-end" style="min-width: 150px;">
                            <span class="d-block small text-muted text-uppercase">SMI Origen</span>
                            <span class="badge {item.salary === 'N/D' ? 'bg-secondary' : 'bg-success'} fs-6">
                                {item.salary}
                            </span>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

        <div class="mt-4 p-3 bg-light rounded border">
            <p class="mb-0 small text-muted">
                <b>Nota técnica:</b> Esta lista utiliza datos en tiempo real de <i>TV Maze API</i> integrados mediante una búsqueda de coincidencia por país con nuestra base de datos local de salarios mínimos interprofesionales.
            </p>
        </div>
    </div>
</div>

<style>
    .list-group-item {
        transition: background-color 0.2s;
    }
    .list-group-item:hover {
        background-color: #f8f9fa;
    }
</style>