<script>
    import { onMount } from 'svelte';
    import Message from './Message.svelte';
    let url = "/api/v2/happiness-indices"; 
if (dev) url = 'http://localhost:8080' + url;

    let happinessIndices = [];
    let mensaje = "";
    let mensajeColor = "gray";

    let newCountry = "";
    let newYear = "";
    let newScore = "";
    let newGdp = "";
    let newSocial = "";

    async function getIndices() {
        const res = await fetch(url);
        if (res.ok) happinessIndices = await res.json();
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
</script>

<main>
    <h1>📊 Índices de Felicidad</h1>

    {#if mensaje}
        <div class="alerta" style="background-color: {mensajeColor};">{mensaje}</div>
    {/if}

    <button class="btn-load" on:click={loadInitialData}>Cargar Datos de Prueba</button>

    <section class="formulario">
        <h3>Añadir país</h3>
        <div class="inputs">
            <input type="text" placeholder="País" bind:value={newCountry} />
            <input type="number" placeholder="Año" bind:value={newYear} />
            <input type="number" placeholder="Puntuación" bind:value={newScore} step="0.001"/>
            <input type="number" placeholder="PIB per cápita" bind:value={newGdp} step="0.001"/>
            <input type="number" placeholder="Soporte Social" bind:value={newSocial} step="0.001"/>
            <button class="btn-add" on:click={addIndex}>Añadir</button>
        </div>
    </section>

    <table>
        <thead>
            <tr>
                <th>País</th>
                <th>Año</th>
                <th>Puntuación</th>
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
                        <button class="btn-delete" on:click={() => deleteIndex(item.country, item.year)}>Borrar</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <button class="btn-danger" on:click={deleteAll}>Borrar todos los datos</button>
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