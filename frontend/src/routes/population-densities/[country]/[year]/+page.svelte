<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import { Button } from '@sveltestrap/sveltestrap';

    let API = '/api/v1/population-densities';
    if (dev) API = "http://localhost:8080" + API;

    // Extraemos el país y el año de la URL dinámica
    let country = $page.params.country;
    let year = $page.params.year;

    // @ts-ignore
    let density = $state("");
    // @ts-ignore
    let population = $state("");
    // @ts-ignore
    let percentage_change = $state("");
    
    // @ts-ignore
    let resultMensaje = $state("");
    // @ts-ignore
    let mensajeColor = $state("");

    onMount(async () => {
        try {
            const res = await fetch(`${API}/${country}/${year}`, { method: "GET" });
            if (res.ok) {
                const data = await res.json();
                density = data.density;
                population = data.population;
                percentage_change = data.percentage_change;
            } else if (res.status === 404) {
                resultMensaje = `No se encontró el registro para ${country} en ${year}.`;
                mensajeColor = "red";
            } else {
                resultMensaje = "Error al cargar los datos del servidor.";
                mensajeColor = "red";
            }
        } catch (err) {
            resultMensaje = "Error de conexión con la API.";
            mensajeColor = "red";
        }
    });

    async function updateResource() {
        const updatedEntry = {
            country: country, // No dejamos que cambie la clave primaria
            year: parseInt(year), // No dejamos que cambie la clave primaria
            density: parseFloat(density),
            population: parseInt(population),
            percentage_change: parseFloat(percentage_change)
        };

        try {
            const res = await fetch(`${API}/${country}/${year}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedEntry)
            });

            if (res.ok) {
                resultMensaje = "Recurso actualizado con éxito.";
                mensajeColor = "green";
            } else if (res.status === 400) {
                resultMensaje = "Error: Faltan campos o el formato es incorrecto.";
                mensajeColor = "red";
            } else {
                resultMensaje = `Error al actualizar. Código: ${res.status}`;
                mensajeColor = "red";
            }
        } catch (err) {
            resultMensaje = "Error de conexión al actualizar.";
            mensajeColor = "red";
        }
    }
</script>

<main class="container mt-5">
    <h2>Editar Registro: <span class="text-primary">{country} ({year})</span></h2>

    {#if resultMensaje !== ""}
        <div class="alert mt-3" style="background-color: {mensajeColor === 'green' ? '#d4edda' : '#f8d7da'}; color: {mensajeColor === 'green' ? '#155724' : '#721c24'}; border: 1px solid {mensajeColor};">
            {resultMensaje}
        </div>
    {/if}

    <div class="card mt-4 p-4 shadow-sm">
        <form onsubmit={(e) => { e.preventDefault(); updateResource(); }}>
            <div class="mb-3">
                <label class="form-label fw-bold">País (No editable)</label>
                <input type="text" class="form-control" value={country} disabled />
            </div>
            
            <div class="mb-3">
                <label class="form-label fw-bold">Año (No editable)</label>
                <input type="text" class="form-control" value={year} disabled />
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Densidad de Población</label>
                <input type="number" step="0.1" class="form-control" bind:value={density} required />
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Población Total</label>
                <input type="number" class="form-control" bind:value={population} required />
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">% de Cambio</label>
                <input type="number" step="0.01" class="form-control" bind:value={percentage_change} required />
            </div>

            <div class="d-flex justify-content-between mt-4">
                <a href="/population-densities" class="btn btn-secondary">Volver a la lista</a>
                <Button color="primary" type="submit">Guardar Cambios</Button>
            </div>
        </form>
    </div>
</main>