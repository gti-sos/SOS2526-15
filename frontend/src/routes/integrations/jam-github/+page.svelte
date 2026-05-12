<script>
    import { onMount } from 'svelte';
    import c3 from 'c3';

    let githubData = $state(null);
    let loading = $state(true);

    onMount(async () => {
        const username = import.meta.env.VITE_GITHUB_USERNAME || "JavierArroyoMarcos"; 
        const token = import.meta.env.VITE_GITHUB_TOKEN;
        
        // 1. Cargamos GitHub y nuestra API de Salarios
        const [resGit, resSmi] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, {
                headers: { "Authorization": `token ${token}` }
            }),
            fetch("/api/v2/minimum-interprofessional-wages")
        ]);

        if (resGit.ok && resSmi.ok) {
            githubData = await resGit.json();
            const smiData = await resSmi.json();

            // 2. Seleccionamos unos cuantos países para comparar
            const countriesToCompare = ["Spain", "France", "Germany", "USA"];
            const filteredSmi = smiData.filter(s => 
                countriesToCompare.includes(s.country) && s.date === "2022"
            );

            // 3. Generamos una gráfica de barras cruzada
            // Comparamos el nº de Repositorios con el Salario Mínimo (dividido por 10 para que la escala cuadre)
            c3.generate({
                bindto: '#chartGITHUB',
                data: {
                    columns: [
                        ['Mis Repositorios Públicos', githubData.public_repos],
                        ...filteredSmi.map(s => [`SMI ${s.country} (índice)`, s.nmw_on_dollar / 50])
                    ],
                    type: 'bar'
                },
                bar: { width: { ratio: 0.5 } },
                axis: {
                    x: { type: 'category', categories: ['Comparativa de Actividad vs Economía'] }
                }
            });
        }
        loading = false;
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver al Panel</a>
    
    <div class="card shadow-sm p-4">
        <h3>🐙 Integración: GitHub Stats vs Economía Real</h3>
        <p class="text-muted">
            Relacionamos el número de repositorios públicos de <b>{githubData?.login || 'usuario'}</b> con el Salario Mínimo Interprofesional (normalizado).
        </p>
        <hr />

        {#if loading}
            <div class="text-center py-5">
                <div class="spinner-border text-dark" role="status"></div>
                <p>Conectando con GitHub y base de datos local...</p>
            </div>
        {:else if githubData}
            <div class="row align-items-center">
                <div class="col-md-4 text-center border-end">
                    <img src={githubData.avatar_url} class="rounded-circle img-fluid border mb-3 shadow-sm" alt="Avatar" style="width: 120px;" />
                    <h4 class="mb-0">{githubData.name || githubData.login}</h4>
                    <p class="text-muted">@{githubData.login}</p>
                    <div class="d-flex justify-content-around mt-3">
                        <div class="text-center">
                            <span class="d-block fw-bold">{githubData.public_repos}</span>
                            <small class="text-uppercase text-muted">Repos</small>
                        </div>
                        <div class="text-center">
                            <span class="d-block fw-bold">{githubData.followers}</span>
                            <small class="text-uppercase text-muted">Followers</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div id="chartGITHUB"></div>
                </div>
            </div>
        {:else}
            <div class="alert alert-danger">Error al cargar los datos. Verifica el Token de GitHub en Render.</div>
        {/if}
    </div>
</div>