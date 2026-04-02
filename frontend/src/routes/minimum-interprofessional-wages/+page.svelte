<script>
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button, Table } from '@sveltestrap/sveltestrap';

  let API = '/api/v1/minimum-interprofessional-wages';
  if (dev) API = "http://localhost:8080" + API;

  let wages = $state([]);
  let resultMensaje = $state("");
  let mensajeColor = $state("green");

  let newCountry = $state("");
  let newDate = $state("");
  let newNationalWage = $state("");
  let newDollarWage = $state("");
  let newPercentage = $state("");
  let searchCountry = $state("");
  let searchDate = $state("");
  let searchNationalWage = $state("");
  let searchDollarWage = $state("");
  let searchPercentage = $state("");
  let searchLimit = $state("");
  let searchOffset = $state("");

  // ---------------- FUNCIONES ----------------

  async function getWages() {
    try {
      const res = await fetch(API, { method: "GET" });
      if (!res.ok) throw res;

      wages = await res.json();
    } catch (err) {
      resultMensaje = "Error al obtener los datos.";
      mensajeColor = "red";
    }
  }

  async function deleteWage(country, date) {
    try {
      const res = await fetch(`${API}/${country}/${date}`, { method: "DELETE" });

      if (res.status === 204) {
        resultMensaje = `Recurso de ${country} (${date}) eliminado correctamente.`;
        mensajeColor = "green";

        getWages(); 
      } else if (res.status === 404) {
        resultMensaje = `No existe un recurso de ${country} para el año ${date}.`;
        mensajeColor = "red";
      } else {
        resultMensaje = "Error al eliminar el recurso.";
        mensajeColor = "red";
      }
    } catch {
      resultMensaje = "Error al conectar con el servidor.";
      mensajeColor = "red";
    }
  }

  async function insertWage() {
    if (!newCountry || !newDate || !newNationalWage || !newDollarWage || !newPercentage) {
      resultMensaje = "Debe completar todos los campos.";
      mensajeColor = "red";
      return;
    }

    let newWage = {
      country: newCountry,
      date: parseInt(newDate),
      national_currency_minimum_wage: parseFloat(newNationalWage),
      nmw_on_dollar: parseFloat(newDollarWage),
      percentage_change: parseFloat(newPercentage)
    };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWage)
      });

      if (res.status === 201) {
        resultMensaje = `Recurso de ${newCountry} (${newDate}) creado correctamente.`;
        mensajeColor = "green";

        getWages(); 

        newCountry = newDate = newNationalWage = newDollarWage = newPercentage = "";
      } else if (res.status === 409) {
        resultMensaje = `El recurso de ${newCountry} para el año ${newDate} ya existe.`;
        mensajeColor = "red";
      } else {
        resultMensaje = "Error desconocido al crear el recurso.";
        mensajeColor = "red";
      }
    } catch {
      resultMensaje = "Error al conectar con el servidor.";
      mensajeColor = "red";
    }
  }

  async function loadInitialData() {
    try {
      const res = await fetch(`${API}/loadInitialData`);

      if (res.status === 201) {
        resultMensaje = "Datos iniciales cargados correctamente.";
        mensajeColor = "green";

        getWages(); 
      } else if (res.status === 409) {
        resultMensaje = "Los datos iniciales ya estaban cargados.";
        mensajeColor = "orange";
      } else {
        resultMensaje = "Error al cargar los datos iniciales.";
        mensajeColor = "red";
      }
    } catch {
      resultMensaje = "Error al conectar con el servidor.";
      mensajeColor = "red";
    }
  }

  async function deleteAll() {
    try {
      const res = await fetch(API, { method: "DELETE" });

      if (res.status === 204) {
        resultMensaje = "Todos los recursos fueron eliminados correctamente.";
        mensajeColor = "green";

        wages = [];
      } else {
        resultMensaje = "Error al eliminar todos los recursos.";
        mensajeColor = "red";
      }
    } catch {
      resultMensaje = "Error al conectar con el servidor.";
      mensajeColor = "red";
    }
  }

  onMount(() => {
    getWages(); 
  });
  async function searchWages() {
  try {
    let query = [];

    if (searchCountry) query.push(`country=${searchCountry}`);
    if (searchDate) query.push(`date=${searchDate}`);
    if (searchNationalWage) query.push(`national_currency_minimum_wage=${searchNationalWage}`);
    if (searchDollarWage) query.push(`nmw_on_dollar=${searchDollarWage}`);
    if (searchPercentage) query.push(`percentage_change=${searchPercentage}`);
    if (searchLimit) query.push(`limit=${searchLimit}`);
    if (searchOffset) query.push(`offset=${searchOffset}`);

    let url = API;
    if (query.length > 0) {
      url += "?" + query.join("&");
    }

    const res = await fetch(url);

    if (res.status === 200) {
      wages = await res.json();

      if (wages.length === 0) {
        resultMensaje = "No se encontraron resultados con esos filtros.";
        mensajeColor = "orange";
      } else {
        resultMensaje = "Búsqueda realizada correctamente.";
        mensajeColor = "green";
      }

    } else if (res.status === 400) {
      resultMensaje = "Parámetros de búsqueda inválidos.";
      mensajeColor = "red";
    } else {
      resultMensaje = "Error al realizar la búsqueda.";
      mensajeColor = "red";
    }

  } catch {
    resultMensaje = "Error al conectar con el servidor.";
    mensajeColor = "red";
  }
}

function clearSearch() {
  searchCountry = "";
  searchDate = "";
  searchNationalWage = "";
  searchDollarWage = "";
  searchPercentage = "";
  searchLimit = "";
  searchOffset = "";

  getWages();
}
</script>

<h2>Salarios Mínimos Interprofesionales</h2>

{#if resultMensaje}
  <p style="color: {mensajeColor};">{resultMensaje}</p>
{/if}

<div class="mb-3">
  <Button color="info" onclick={loadInitialData}>Cargar Datos Iniciales</Button>
  <Button color="danger" onclick={deleteAll}>Borrar Todos</Button>
</div>
<h3>Búsqueda</h3>

<div class="mb-3">
  <input placeholder="País" bind:value={searchCountry} />
  <input type="number" placeholder="Año" bind:value={searchDate} />
  <input type="number" placeholder="Salario nacional" bind:value={searchNationalWage} />
  <input type="number" placeholder="USD" bind:value={searchDollarWage} />
  <input type="number" placeholder="% Cambio" bind:value={searchPercentage} />
  <input type="number" placeholder="Limit" bind:value={searchLimit} />
  <input type="number" placeholder="Offset" bind:value={searchOffset} />

  <br /><br />

  <Button color="primary" onclick={searchWages}>
    Buscar
  </Button>

  <Button color="secondary" onclick={clearSearch}>
    Limpiar
  </Button>
</div>

<Table>
  <thead>
    <tr>
      <th>País</th>
      <th>Año</th>
      <th>Salario (moneda nacional)</th>
      <th>Salario (USD)</th>
      <th>% Cambio</th>
      <th>Acción</th>
    </tr>
  </thead>
  <tbody>

    <!-- Crear -->
    <tr>
      <td><input bind:value={newCountry} placeholder="País"/></td>
      <td><input type="number" bind:value={newDate} placeholder="Año"/></td>
      <td><input type="number" step="0.01" bind:value={newNationalWage} placeholder="Salario"/></td>
      <td><input type="number" step="0.01" bind:value={newDollarWage} placeholder="USD"/></td>
      <td><input type="number" step="0.01" bind:value={newPercentage} placeholder="%"/></td>
      <td><Button color="primary" onclick={insertWage}>Crear</Button></td>
    </tr>

    <!-- Lista -->
    {#each wages as wage (wage.country + wage.date)}
      <tr>
        <td>{wage.country}</td>
        <td>{wage.date}</td>
        <td>{wage.national_currency_minimum_wage}</td>
        <td>{wage.nmw_on_dollar}</td>
        <td>{wage.percentage_change}</td>
        <td>
        <a href={`/minimum-interprofessional-wages/${wage.country}/${wage.date}`}>
          <Button color="warning">
            Editar
          </Button>
        </a>

        <Button color="danger" onclick={() => deleteWage(wage.country, wage.date)}>
          Borrar
        </Button>
      </td>
      </tr>
    {/each}

  </tbody>
</Table>