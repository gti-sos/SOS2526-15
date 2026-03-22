<script>
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button, Table } from '@sveltestrap/sveltestrap';

  // Ruta de tu API
  let API = '/api/v1/population-densities';
  if (dev) API = "http://localhost:8080" + API;

  // Variables de estado
  // @ts-ignore
  let densities = $state([]);
  // @ts-ignore
  let resultMensaje = $state("");
  // @ts-ignore
  let mensajeColor = $state("green");

  // Campos para crear un nuevo recurso
  // @ts-ignore
  let newCountry = $state("");
  // @ts-ignore
  let newYear = $state("");
  // @ts-ignore
  let newDensity = $state("");
  // @ts-ignore
  let newPopulation = $state("");
  // @ts-ignore
  let newPercentageChange = $state("");

  // ---------------- FUNCIONES ----------------

  // ii) Listar todos los recursos
  async function getDensities() {
    try {
      const res = await fetch(API, { method: "GET" });
      if (!res.ok) throw res;
      densities = await res.json();
      resultMensaje = "Lista actualizada correctamente.";
      mensajeColor = "green";
    } catch (err) {
      resultMensaje = "Error al obtener los datos.";
      mensajeColor = "red";
    }
  }

  // v) Cargar datos iniciales
  async function loadInitialData() {
    try {
      const res = await fetch(`${API}/loadInitialData`, { method: "GET" });
      if (res.ok) {
        resultMensaje = "Datos iniciales cargados con éxito.";
        mensajeColor = "green";
        getDensities(); // Recargamos la tabla para ver los datos nuevos
      } else {
        resultMensaje = "Error al cargar los datos iniciales.";
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión al cargar datos.";
      mensajeColor = "red";
    }
  }

  // i) Crear recurso
  async function insertDensity() {
    const newEntry = {
      country: newCountry,
      year: parseInt(newYear),
      density: parseFloat(newDensity),
      population: parseInt(newPopulation),
      percentage_change: parseFloat(newPercentageChange)
    };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry)
      });

      if (res.ok) {
        resultMensaje = "Recurso creado con éxito.";
        mensajeColor = "green";
        // Limpiamos los campos
        newCountry = ""; newYear = ""; newDensity = ""; newPopulation = ""; newPercentageChange = "";
        getDensities(); // Recargamos la tabla
      } else {
        resultMensaje = "Error al crear (¿Quizás ya existe o faltan campos?).";
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión con la API.";
      mensajeColor = "red";
    }
  }

  // iv) Borrar un recurso concreto
  async function deleteDensity(country, year) {
    try {
      const res = await fetch(`${API}/${country}/${year}`, { method: "DELETE" });
      if (res.ok) {
        resultMensaje = `Recurso ${country} - ${year} borrado.`;
        mensajeColor = "green";
        getDensities(); // Recargamos la tabla
      } else {
        resultMensaje = "Error al borrar el recurso.";
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión.";
      mensajeColor = "red";
    }
  }

  // iii) Borrar todos los recursos
  async function deleteAll() {
    if (confirm("¿Estás seguro de que quieres borrar todos los datos?")) {
      try {
        const res = await fetch(API, { method: "DELETE" });
        if (res.ok) {
          resultMensaje = "Todos los recursos han sido borrados.";
          mensajeColor = "green";
          getDensities(); // Recargamos la tabla (quedará vacía)
        } else {
          resultMensaje = "Error al borrar todo.";
          mensajeColor = "red";
        }
      } catch (err) {
        resultMensaje = "Error de conexión.";
        mensajeColor = "red";
      }
    }
  }

  // Cargar datos al entrar a la página
  onMount(() => {
    getDensities();
  });
</script>

<main class="container mt-4">
  <h2>Gestión de Densidad de Población</h2>

  {#if resultMensaje !== ""}
    <p style="color: {mensajeColor}; font-weight: bold;">{resultMensaje}</p>
  {/if}

  <div class="mb-3 d-flex gap-2">
    <Button color="primary" onclick={loadInitialData}>Cargar Datos Iniciales</Button>
    <Button color="danger" onclick={deleteAll}>Borrar Todos</Button>
  </div>

  <Table striped bordered responsive>
    <thead>
      <tr>
        <th>País</th>
        <th>Año</th>
        <th>Densidad</th>
        <th>Población</th>
        <th>% Cambio</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <input bind:value={newCountry} placeholder="País" class="form-control"/>
        </td>
        <td>
          <input type="number" bind:value={newYear} placeholder="Año" class="form-control"/>
        </td>
        <td>
          <input type="number" step="0.1" bind:value={newDensity} placeholder="Densidad" class="form-control"/>
        </td>
        <td>
          <input type="number" bind:value={newPopulation} placeholder="Población" class="form-control"/>
        </td>
        <td>
          <input type="number" step="0.01" bind:value={newPercentageChange} placeholder="% Cambio" class="form-control"/>
        </td>
        <td>
          <Button color="success" onclick={insertDensity}>Crear</Button>
        </td>
      </tr>

      {#each densities as density (density.country + density.year)}
        <tr>
          <td>{density.country}</td>
          <td>{density.year}</td>
          <td>{density.density}</td>
          <td>{density.population}</td>
          <td>{density.percentage_change}</td>
          <td>
            <Button color="danger" onclick={() => deleteDensity(density.country, density.year)}>Borrar</Button>
          </td>
        </tr>
      {/each}
    </tbody>
  </Table>
</main>