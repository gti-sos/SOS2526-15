<script>
    const API = "https://sos2526-15.onrender.com/api/v1/minimum-interprofessional-wages";

    let wages = [];
    let message = "";
    let error = "";

    // Formulario
    let country = "";
    let date = "";
    let national_currency_minimum_wage = "";
    let nmw_on_dollar = "";
    let percentage_change = "";

    // ----------------------------
    // LISTAR TODOS
    async function loadData() {
        message = "";
        error = "";

        try {
            const res = await fetch(API);
            if (!res.ok) throw res;

            wages = await res.json();
            message = "Datos cargados correctamente";
        } catch (err) {
            handleError(err, "No se pudieron cargar los datos");
        }
    }

    // ----------------------------
    // CREAR
    async function createWage() {
        message = "";
        error = "";

        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    country,
                    date: Number(date),
                    national_currency_minimum_wage: Number(national_currency_minimum_wage),
                    nmw_on_dollar: Number(nmw_on_dollar),
                    percentage_change: Number(percentage_change)
                })
            });

            if (!res.ok) throw res;

            message = `Se ha creado correctamente el registro de ${country} (${date})`;
            clearForm();
            loadData();
        } catch (err) {
            handleError(err, "No se pudo crear el registro");
        }
    }

    // ----------------------------
    // BORRAR TODOS
    async function deleteAll() {
        if (!confirm("¿Seguro que quieres borrar todos los datos?")) return;

        message = "";
        error = "";

        try {
            const res = await fetch(API, { method: "DELETE" });
            if (!res.ok) throw res;

            message = "Todos los datos han sido eliminados";
            wages = [];
        } catch (err) {
            handleError(err, "No se pudieron borrar los datos");
        }
    }

    // ----------------------------
    // BORRAR UNO
    async function deleteOne(c, d) {
        if (!confirm(`¿Eliminar ${c} (${d})?`)) return;

        message = "";
        error = "";

        try {
            const res = await fetch(`${API}/${c}/${d}`, {
                method: "DELETE"
            });

            if (!res.ok) throw res;

            message = `Se eliminó el registro de ${c} (${d})`;
            loadData();
        } catch (err) {
            if (err.status === 404) {
                error = `No existe un registro para ${c} en el año ${d}`;
            } else {
                handleError(err, "No se pudo eliminar el registro");
            }
        }
    }

    // ----------------------------
    function clearForm() {
        country = "";
        date = "";
        national_currency_minimum_wage = "";
        nmw_on_dollar = "";
        percentage_change = "";
    }

    // ----------------------------
    async function handleError(res, defaultMsg) {
        if (res.status === 400) {
            error = "Faltan datos obligatorios";
        } else if (res.status === 409) {
            error = "Ese registro ya existe";
        } else if (res.status === 404) {
            error = "El recurso no existe";
        } else {
            error = defaultMsg;
        }
    }
</script>

<style>
    body {
        font-family: Arial;
    }
    .container {
        max-width: 900px;
        margin: auto;
    }
    input {
        margin: 5px;
        padding: 5px;
    }
    button {
        margin: 5px;
        padding: 8px;
        cursor: pointer;
    }
    .msg {
        color: green;
    }
    .err {
        color: red;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    td, th {
        border: 1px solid #ccc;
        padding: 8px;
    }
</style>

<div class="container">
    <h1>Salario Mínimo Interprofesional</h1>

    <!-- MENSAJES -->
    {#if message}
        <p class="msg">{message}</p>
    {/if}
    {#if error}
        <p class="err">{error}</p>
    {/if}

    <!-- FORMULARIO -->
    <h2>Crear nuevo registro</h2>
    <input placeholder="País" bind:value={country} />
    <input placeholder="Año" bind:value={date} type="number" />
    <input placeholder="Salario (moneda local)" bind:value={national_currency_minimum_wage} type="number" />
    <input placeholder="Salario en dólares" bind:value={nmw_on_dollar} type="number" />
    <input placeholder="% cambio" bind:value={percentage_change} type="number" />

    <br />
    <button on:click={createWage}>Crear registro</button>

    <!-- ACCIONES -->
    <h2>Acciones</h2>
    <button on:click={loadData}>Cargar datos</button>
    <button on:click={deleteAll}>Borrar todos</button>

    <!-- TABLA -->
    <h2>Listado</h2>
    <table>
        <thead>
            <tr>
                <th>País</th>
                <th>Año</th>
                <th>Salario</th>
                <th>$</th>
                <th>%</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
            {#each wages as w}
                <tr>
                    <td>{w.country}</td>
                    <td>{w.date}</td>
                    <td>{w.national_currency_minimum_wage}</td>
                    <td>{w.nmw_on_dollar}</td>
                    <td>{w.percentage_change}</td>
                    <td>
                        <button on:click={() => deleteOne(w.country, w.date)}>
                            Eliminar
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>