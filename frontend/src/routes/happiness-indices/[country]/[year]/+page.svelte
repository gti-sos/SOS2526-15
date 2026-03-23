<script>
    import { onMount } from 'svelte';
    import { page } from '$app/state'; 
    import { dev } from '$app/environment';
    const country = page.params.country;
    const year = page.params.year;
    let url = `/api/v2/happiness-indices/${country}/${year}`;
    if (dev) url = `http://localhost:8080/api/v2/happiness-indices/${country}/${year}`;
    
    let updatedScore = "";
    let updatedGdp = "";
    let updatedSocial = "";
    
    let mensaje = "";
    let mensajeColor = "gray";

    async function getIndex() {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            updatedScore = data.happiness_score;
            updatedGdp = data.gdp_per_capita;
            updatedSocial = data.social_support;
        } else {
            mostrarMensaje("❌ Registro no encontrado.", "red");
        }
    }

    async function updateEntry() {
        const res = await fetch(url, {
            method: "PUT",
            body: JSON.stringify({
                country: country,
                year: parseInt(year),
                happiness_score: parseFloat(updatedScore),
                gdp_per_capita: parseFloat(updatedGdp),
                social_support: parseFloat(updatedSocial)
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            mostrarMensaje("✅ ¡Cambios guardados!", "green");
        } else {
            mostrarMensaje("⚠️ Error al actualizar.", "orange");
        }
    }

    function mostrarMensaje(texto, color) {
        mensaje = texto; mensajeColor = color;
    }

    onMount(getIndex);
</script>

<main>
    <a href="/happiness-indices" class="btn-back">← Volver</a>
    <h1>Editar: {country} ({year})</h1>

    {#if mensaje}
        <div class="alerta" style="background-color: {mensajeColor};">{mensaje}</div>
    {/if}

    <section class="edit-form">
        <label>Puntuación: <input type="number" bind:value={updatedScore} step="0.001"/></label>
        <label>PIB per cápita: <input type="number" bind:value={updatedGdp} step="0.001"/></label>
        <label>Soporte Social: <input type="number" bind:value={updatedSocial} step="0.001"/></label>
        <button class="btn-save" on:click={updateEntry}>Guardar cambios</button>
    </section>
</main>

<style>
    /* Mismos estilos de edición */
    main { max-width: 600px; margin: 40px auto; font-family: sans-serif;}
    .edit-form { display: flex; flex-direction: column; gap: 15px; }
    .alerta { color: white; padding: 15px; text-align: center; margin-bottom: 20px;}
    .btn-save { background: #f39c12; padding: 15px; color: white; border: none; cursor: pointer;}
</style>