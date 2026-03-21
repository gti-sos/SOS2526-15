<script>
    import { onMount } from 'svelte';

    // 1. CONFIGURACIÓN: URL de tu API (Usamos la v2 como pide la rúbrica)
    let url = "/api/v2/happiness-indices"; 

    // 2. ESTADO: Variables para guardar datos y mensajes
    let happinessIndices = [];
    let mensaje = "";
    let mensajeColor = "gray"; // Para que el mensaje sea verde o rojo

    // Campos del formulario para añadir un nuevo país
    let newCountry = "";
    let newYear = "";
    let newIndex = "";
    let newRank = "";
    let newScore = "";

    // 3. FUNCIONES: Hablar con el Backend
    
    // Función para obtener todos los datos (GET)
    async function getIndices() {
        const res = await fetch(url);
        if (res.ok) {
            happinessIndices = await res.json();
        } else {
            mostrarMensaje("❌ Error al cargar los datos del servidor", "red");
        }
    }

    // Función para añadir un dato (POST)
    async function addIndex() {
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                country: newCountry,
                year: parseInt(newYear),
                "happiness-index": parseFloat(newIndex),
                "happiness-rank": parseInt(newRank),
                "happiness-score": parseFloat(newScore)
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (res.status === 201) {
            mostrarMensaje("✅ ¡Añadido con éxito!", "green");
            getIndices(); // Recargamos la tabla
        } else if (res.status === 409) {
            mostrarMensaje("⚠️ Error: Este país y año ya existen.", "orange");
        } else {
            mostrarMensaje("❌ Error: Revisa que todos los campos sean correctos (400)", "red");
        }
    }

    // Función para borrar un dato concreto (DELETE)
    async function deleteIndex(country, year) {
        const res = await fetch(`${url}/${country}/${year}`, { method: "DELETE" });
        if (res.ok) {
            mostrarMensaje(`🗑️ Se ha eliminado el dato de ${country}`, "green");
            getIndices();
        }
    }

    // Función para borrar TODO (DELETE global)
    async function deleteAll() {
        if (confirm("¿Seguro que quieres borrar TODOS los datos?")) {
            const res = await fetch(url, { method: "DELETE" });
            if (res.ok) {
                mostrarMensaje("💥 Todos los datos han sido eliminados", "red");
                getIndices();
            }
        }
    }

    // Utilidad para mostrar mensajes temporales
    function mostrarMensaje(texto, color) {
        mensaje = texto;
        mensajeColor = color;
        setTimeout(() => mensaje = "", 5000); // El mensaje desaparece a los 5 segundos
    }

    // Al cargar la página, pedimos los datos
    onMount(getIndices);
</script>

<main>
    <h1>📊 Gestión de Índices de Felicidad</h1>

    {#if mensaje}
        <div class="alerta" style="background-color: {mensajeColor};">
            {mensaje}
        </div>
    {/if}

    <section class="formulario">
        <h3>Añadir nuevo registro</h3>
        <div class="inputs">
            <input type="text" placeholder="País (ej: Spain)" bind:value={newCountry} />
            <input type="number" placeholder="Año (ej: 2024)" bind:value={newYear} />
            <input type="number" placeholder="Índice" bind:value={newIndex} />
            <input type="number" placeholder="Rango" bind:value={newRank} />
            <input type="number" placeholder="Puntuación" bind:value={newScore} />
            <button class="btn-add" on:click={addIndex}>Añadir Registro</button>
        </div>
    </section>

    <hr />

    <table>
        <thead>
            <tr>
                <th>País</th>
                <th>Año</th>
                <th>Índice</th>
                <th>Rango</th>
                <th>Puntuación</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each happinessIndices as item}
                <tr>
                    <td>{item.country}</td>
                    <td>{item.year}</td>
                    <td>{item['happiness-index']}</td>
                    <td>{item['happiness-rank']}</td>
                    <td>{item['happiness-score']}</td>
                    <td>
                        <a href="/happiness-indices/{item.country}/{item.year}" class="btn-edit">Editar</a>
                        <button class="btn-delete" on:click={() => deleteIndex(item.country, item.year)}>Eliminar</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="footer-actions">
        <button class="btn-danger" on:click={deleteAll}>Borrar todos los datos</button>
    </div>
</main>

<style>
    main { font-family: sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; text-align: center; }
    
    .alerta { color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; font-weight: bold; text-align: center; }
    
    .formulario { background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .inputs { display: flex; gap: 10px; flex-wrap: wrap; }
    input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #3498db; color: white; }
    tr:nth-child(even) { background-color: #f9f9f9; }

    .btn-add { background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .btn-delete { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px;}
    .btn-edit { background: #f39c12; color: white; text-decoration: none; padding: 5px 10px; border-radius: 4px; display: inline-block;}
    .btn-danger { background: #c0392b; color: white; border: none; padding: 15px; width: 100%; margin-top: 30px; border-radius: 5px; cursor: pointer; font-weight: bold;}
</style>