<script>
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button, Table } from '@sveltestrap/sveltestrap';

  let API = '/api/v1/minimum-interprofessional-wages';
  if (dev) API = "http://localhost:8080" + API;

  // @ts-ignore
  let wages = $state([]);
  // @ts-ignore
  let resultMensaje = $state("");
  // @ts-ignore
  let mensajeColor = $state("green");

  // Campos para crear un nuevo recurso
  // @ts-ignore
  let newCountry = $state("");
  // @ts-ignore
  let newDate = $state("");
  // @ts-ignore
  let newNationalWage = $state("");
  // @ts-ignore
  let newDollarWage = $state("");
  // @ts-ignore
  let newPercentage = $state("");

  // ---------------- FUNCIONES ----------------

  async function getWages() {
    try {
      const res = await fetch(API, { method: "GET" });
      if (!res.ok) throw res;
      wages = await res.json();
      resultMensaje = "Lista actualizada correctamente.";
      mensajeColor = "green";
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
        await getWages();
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
  // Verificar que todos los campos estén completos
  if (!newCountry || !newDate || !newNationalWage || !newDollarWage || !newPercentage) {
    resultMensaje = "Debe completar todos los campos: país, año, salario nacional, salario USD y % de cambio.";
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
      await getWages();
      // Limpiar campos del formulario
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


  // Load initial data
  async function loadInitialData() {
    try {
      const res = await fetch(`${API}/loadInitialData`);
      if (res.status === 201) {
        resultMensaje = "Datos iniciales cargados correctamente.";
        mensajeColor = "green";
        await getWages();
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

  // Borrar todos los recursos
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

</script>

<h2>Salarios Mínimos Interprofesionales</h2>

{#if resultMensaje}
  <p style="color: {mensajeColor};">{resultMensaje}</p>
{/if}

<div class="mb-3">
  <Button color="info" onclick={loadInitialData}>Cargar Datos Iniciales</Button>
  <Button color="danger" onclick={deleteAll}>Borrar Todos</Button>
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
    <!-- Fila para crear nuevo recurso -->
    <tr>
      <td>
        <label for="newCountry" class="visually-hidden">País</label>
        <input id="newCountry" bind:value={newCountry} placeholder="País"/>
      </td>
      <td>
        <label for="newDate" class="visually-hidden">Año</label>
        <input id="newDate" type="number" bind:value={newDate} placeholder="Año"/>
      </td>
      <td>
        <label for="newNationalWage" class="visually-hidden">Salario nacional</label>
        <input id="newNationalWage" type="number" step="0.01" bind:value={newNationalWage} placeholder="Salario"/>
      </td>
      <td>
        <label for="newDollarWage" class="visually-hidden">Salario USD</label>
        <input id="newDollarWage" type="number" step="0.01" bind:value={newDollarWage} placeholder="USD"/>
      </td>
      <td>
        <label for="newPercentage" class="visually-hidden">% Cambio</label>
        <input id="newPercentage" type="number" step="0.01" bind:value={newPercentage} placeholder="%"/>
      </td>
      <td><Button color="primary" onclick={insertWage}>Crear</Button></td>
    </tr>

    <!-- Fila para cada recurso existente -->
    {#each wages as wage (wage.country + wage.date)}
      <tr>
        <td>{wage.country}</td>
        <td>{wage.date}</td>
        <td>{wage.national_currency_minimum_wage}</td>
        <td>{wage.nmw_on_dollar}</td>
        <td>{wage.percentage_change}</td>
        <td>
          <Button color="danger" onclick={() => deleteWage(wage.country, wage.date)}>Borrar</Button>
        </td>
      </tr>
    {/each}
  </tbody>
</Table>