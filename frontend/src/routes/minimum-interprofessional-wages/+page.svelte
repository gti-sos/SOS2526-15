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
    getWages(); // sin mensaje automático
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