<script>
    import { onMount } from 'svelte';
    import c3 from 'c3';

    let githubData = $state(null);

    onMount(async () => {
        const username = import.meta.env.VITE_GITHUB_USERNAME || "JavierArroyoMarcos"; 
        const token = import.meta.env.VITE_GITHUB_TOKEN;
        
        const res = await fetch(`https://api.github.com/users/${username}`, {
            headers: { "Authorization": `token ${token}` }
        });

        if (res.ok) {
            githubData = await res.json();
            c3.generate({
                bindto: '#chartGITHUB',
                data: {
                    columns: [
                        ['Seguidores', githubData.followers], 
                        ['Siguiendo', githubData.following]
                    ],
                    type: 'donut'
                }
            });
        }
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver</a>
    <h3>🐙 Perfil de GitHub (OAuth)</h3>
    
    {#if githubData}
        <div class="row align-items-center mt-4">
            <div class="col-md-4 text-center">
                <img src={githubData.avatar_url} class="rounded-circle img-fluid border mb-2" alt="Avatar" style="width: 150px;" />
                <h5>{githubData.login}</h5>
            </div>
            <div class="col-md-8">
                <div id="chartGITHUB"></div>
            </div>
        </div>
    {:else}
        <p>Cargando datos de GitHub...</p>
    {/if}
</div>