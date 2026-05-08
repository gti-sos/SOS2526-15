<script>
    import { onMount } from 'svelte';

    let shows = $state([]);

    onMount(async () => {
        const res = await fetch("https://api.tvmaze.com/search/shows?q=happiness");
        if (res.ok) {
            const data = await res.json();
            shows = data.map(d => d.show);
        }
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver</a>
    <h3>🎬 TV Shows (TV Maze API)</h3>
    <ul class="list-group list-group-flush mt-4 shadow-sm">
        {#each shows.slice(0, 10) as show}
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong class="text-primary">{show.name}</strong> 
                    <span class="badge bg-light text-dark ms-2 border">{show.language}</span>
                </div>
                <span class="text-muted small italic">{show.type}</span>
            </li>
        {/each}
    </ul>
</div>