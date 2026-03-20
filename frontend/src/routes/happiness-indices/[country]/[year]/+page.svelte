<script>
    import { onMount } from 'svelte';
    import { page } from '$app/state'; // Para leer el país y año de la URL

    // 1. OBTENER PARÁMETROS DE LA URL
    const country = page.params.country;
    const year = page.params.year;

    // 2. CONFIGURACIÓN
    let url = `http://localhost:8080/api/v2/happiness-indices/${country}/${year}`;
    
    let updatedIndex = "";
    let updatedRank = "";
    let updatedScore = "";
    
    let mensaje = "";
    let mensajeColor = "gray";

    // 3. FUNCIONES
    
    // Cargar los datos actuales del recurso al entrar
    async function getIndex() {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            updatedIndex = data['happiness-index'];
            updatedRank = data['happiness-rank'];
            updatedScore = data['happiness-score'];
        } else {
            mostrarMensaje("❌ No se ha encontrado el registro solicitado.", "red");
        }
    }

    // Guardar los cambios (PUT)
    async function updateEntry() {
        const res = await fetch(url, {
            method: "PUT",
            body: JSON.stringify({
                country: country,
                year: parseInt(year),
                "happiness-index": parseFloat(updatedIndex),
                "happiness-rank": parseInt(updatedRank),
                "happiness-score": parseFloat(updatedScore)
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            mostrarMensaje("✅ ¡Cambios guardados correctamente!", "green");
        } else {
            mostrarMensaje("⚠️ Error al actualizar. Comprueba los datos (400/404).", "orange");
        }
    }

    function mostrarMensaje(texto, color) {
        mensaje = texto;
        mensajeColor = color;
    }

    onMount(getIndex);
</script>

<main>
    <a href="/happiness-indices" class="btn-back">← Volver al listado</a>

    <h1>Editar Registro: {country} ({year})</h1>

    {#if mensaje}
        <div class="alerta" style="background-color: {mensajeColor};">
            {mensaje}
        </div>
    {/if}

    <section class="edit-form">
        <div class="campo">
            <label>Índice de felicidad:</label>
            <input type="number" bind:value={updatedIndex} />
        </div>
        <div class="campo">
            <label>Rango de felicidad:</label>
            <input type="number" bind:value={updatedRank} />
        </div>
        <div class="campo">
            <label>Puntuación (Score):</label>
            <input type="number" bind:value={updatedScore} />
        </div>

        <button class="btn-save" on:click={updateEntry}>Guardar cambios realizados</button>
    </section>
</main>

<style>
    main { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    
    .btn-back { display: inline-block; margin-bottom: 20px; color: #3498db; text-decoration: none; font-weight: bold; }
    .btn-back:hover { text-decoration: underline; }

    .alerta { color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center; font-weight: bold; }

    .edit-form { display: flex; flex-direction: column; gap: 20px; }
    .campo { display: flex; flex-direction: column; gap: 5px; }
    label { font-weight: bold; color: #555; }
    input { padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; }

    .btn-save { background-color: #f39c12; color: white; border: none; padding: 15px; border-radius: 5px; cursor: pointer; font-size: 18px; font-weight: bold; transition: background 0.3s; }
    .btn-save:hover { background-color: #d35400; }
</style>