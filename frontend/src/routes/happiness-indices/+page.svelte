<script>
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import Message from './Message.svelte';
    let url = "/api/v2/happiness-indices"; 
if (dev) url = 'http://localhost:8080' + url;

    let happinessIndices = $state([]);
    let mensaje = $state("");
    let mensajeColor = $state("gray");

    let newCountry = $state("");
    let newYear = $state("");
    let newScore = $state("");
    let newGdp = $state("");
    let newSocial = $state("");

    let searchCountry = $state("");
    let searchYear = $state("");
    let searchScore = $state("");
    let searchGdp = $state("");
    let searchSocial = $state("");
    let searchLimit = $state("");
    let searchOffset = $state("");

    async function getIndices() {
            let parametrosURL = window.location.search; 
            const res = await fetch(url + parametrosURL);
            
            if (res.ok) {
                happinessIndices = await res.json();
            }
        }
    async function loadInitialData() {
        const res = await fetch(`${url}/loadInitialData`);
        if (res.status === 201) {
            mostrarMensaje("✅ Datos iniciales cargados.", "green");
            getIndices();
        } else if (res.status === 409) {
            mostrarMensaje("⚠️ Los datos ya están cargados.", "orange");
        }
    }

    async function addIndex() {
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                country: newCountry,
                year: parseInt(newYear),
                happiness_score: parseFloat(newScore),
                gdp_per_capita: parseFloat(newGdp),
                social_support: parseFloat(newSocial)
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (res.status === 201) {
            mostrarMensaje("✅ ¡Añadido con éxito!", "green");
            getIndices();
        } else if (res.status === 409) {
            mostrarMensaje("⚠️ Error: Ese país ya existe en ese año.", "orange");
        } else {
            mostrarMensaje("❌ Error: Revisa los datos.", "red");
        }
    }

    async function deleteIndex(country, year) {
        const res = await fetch(`${url}/${country}/${year}`, { method: "DELETE" });
        if (res.ok) {
            mostrarMensaje(`🗑️ ${country} eliminado.`, "green");
            getIndices();
        }
    }

    async function deleteAll() {
        if (confirm("¿Borrar TODO?")) {
            const res = await fetch(url, { method: "DELETE" });
            if (res.ok) {
                mostrarMensaje("💥 Todo eliminado.", "red");
                getIndices();
            }
        }
    }

    function mostrarMensaje(texto, color) {
        mensaje = texto; mensajeColor = color;
        setTimeout(() => mensaje = "", 4000);
    }

    onMount(getIndices);
async function buscarDatos() {
    let params = new URLSearchParams();
    if (searchCountry) params.append('country', searchCountry);
    if (searchYear)    params.append('year', searchYear);
    if (searchScore)   params.append('happiness_score', searchScore);
    if (searchGdp)     params.append('gdp_per_capita', searchGdp);
    if (searchSocial)  params.append('social_support', searchSocial);
    if (searchLimit)   params.append('limit', searchLimit);
    if (searchOffset)  params.append('offset', searchOffset);

    const query = params.toString() ? "?" + params.toString() : "";
    const res = await fetch(url + query);

    if (res.ok) {
        happinessIndices = await res.json();
        mostrarMensaje(`✅ ${happinessIndices.length} resultados encontrados.`, "green");
    } else {
        happinessIndices = [];
        mostrarMensaje("⚠️ No se encontraron datos.", "orange");
    }
}

    // Esta función va FUERA de buscarDatos()
    function limpiarBusqueda() {
            searchFrom = "";
            searchTo = "";
            
            // Borramos el ?country=... de la barra de direcciones del navegador
            window.history.pushState({}, '', window.location.pathname); 
            
            getIndices();
            mostrarMensaje("🧹 Búsqueda limpiada. Mostrando todos los datos.", "gray");
        }
</script>


<main>
    <h1>📊 Índices de Felicidad</h1>

    {#if mensaje}
        <div class="alerta" style="background-color: {mensajeColor};">{mensaje}</div>
    {/if}

    <button class="btn-load" onclick={loadInitialData}>Cargar Datos de Prueba</button>

    <section class="formulario">
        <h3>Añadir país</h3>
        <div class="inputs">
            <input type="text" placeholder="País" bind:value={newCountry} />
            <input type="number" placeholder="Año" bind:value={newYear} />
            <input type="number" placeholder="Puntuación de Felicidad" bind:value={newScore} step="0.001"/>
            <input type="number" placeholder="PIB per cápita" bind:value={newGdp} step="0.001"/>
            <input type="number" placeholder="Soporte Social" bind:value={newSocial} step="0.001"/>
            <button class="btn-add" onclick={addIndex}>Añadir</button>
        </div>
    </section>
<section style="margin-bottom: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 8px;">
    <h3>🔍 Buscar datos</h3>
    <div class="inputs">
        <input type="text"   placeholder="País"             bind:value={searchCountry} />
        <input type="number" placeholder="Año"              bind:value={searchYear} />
        <input type="number" placeholder="Puntuación"       bind:value={searchScore}  step="0.001"/>
        <input type="number" placeholder="PIB per cápita"   bind:value={searchGdp}    step="0.001"/>
        <input type="number" placeholder="Soporte Social"   bind:value={searchSocial} step="0.001"/>
        <input type="number" placeholder="Limit."           bind:value={searchLimit} />
        <input type="number" placeholder="Offset"           bind:value={searchOffset} />
        <button onclick={buscarDatos}>Buscar</button>
        <button onclick={limpiarBusqueda}>Limpiar</button>
    </div>
    <div style="margin-bottom: 10px;">
            <input type="number" placeholder="Desde el año..." bind:value={searchFrom} />
            <input type="number" placeholder="Hasta el año..." bind:value={searchTo} />
    </div>
</section>
    <table>
        <thead>
            <tr>
                <th>País</th>
                <th>Año</th>
                <th>Puntuación de Felicidad</th>
                <th>PIB per cápita</th>
                <th>Soporte Social</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each happinessIndices as item}
                <tr>
                    <td>{item.country}</td>
                    <td>{item.year}</td>
                    <td>{item.happiness_score}</td>
                    <td>{item.gdp_per_capita}</td>
                    <td>{item.social_support}</td>
                    <td>
                        <a href="/happiness-indices/{item.country}/{item.year}" class="btn-edit">Editar</a>
                        <button class="btn-delete" onclick={() => deleteIndex(item.country, item.year)}>Borrar</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <button class="btn-danger" onclick={deleteAll}>Borrar todos los datos</button>
</main>

<style>
    /* Mismos estilos que tenías antes */
    main { font-family: sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
    h1 { text-align: center; }
    .alerta { color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
    .formulario { background: #f4f4f4; padding: 20px; margin-bottom: 20px; border-radius: 8px;}
    .inputs { display: flex; gap: 10px; flex-wrap: wrap; }
    input { padding: 8px; border: 1px solid #ccc; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; }
    th { background: #3498db; color: white; }
    .btn-add { background: #27ae60; color: white; cursor: pointer; padding: 8px; border:none;}
    .btn-edit { background: #f39c12; color: white; padding: 5px; text-decoration: none; border-radius:3px;}
    .btn-delete { background: #e74c3c; color: white; padding: 5px; cursor: pointer; border:none; border-radius:3px;}
    .btn-danger { background: #c0392b; color: white; padding: 15px; width: 100%; margin-top: 20px; cursor: pointer; border:none;}
    .btn-load { background: #2980b9; color: white; padding: 10px; margin-bottom: 15px; border:none; cursor: pointer;}
</style>