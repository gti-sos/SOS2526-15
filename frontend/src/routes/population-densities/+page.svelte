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
      if (res.ok) {
        densities = await res.json();
        // Ocultamos el mensaje de éxito al simplemente recargar la lista para no ser pesados
      } else {
        resultMensaje = "Error al obtener los datos del servidor.";
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión con la API.";
      mensajeColor = "red";
    }
  }

  // v) Cargar datos iniciales
  async function loadInitialData() {
    try {
      const res = await fetch(`${API}/loadInitialData`, { method: "GET" });
      if (res.status === 201 || res.ok) {
        resultMensaje = "Datos iniciales cargados con éxito.";
        mensajeColor = "green";
        getDensities();
      } else {
        resultMensaje = "Ocurrió un error al intentar cargar los datos iniciales.";
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión al cargar datos.";
      mensajeColor = "red";
    }
  }

  // i) Crear recurso (Añadido control de errores 400 y 409)
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

      if (res.status === 201) {
        resultMensaje = `El registro de ${newCountry} (${newYear}) se ha creado con éxito.`;
        mensajeColor = "green";
        newCountry = ""; newYear = ""; newDensity = ""; newPopulation = ""; newPercentageChange = "";
        getDensities();
      } else if (res.status === 409) {
        resultMensaje = `Conflicto: Ya existe un registro para ${newCountry} en el año ${newYear}.`;
        mensajeColor = "orange";
      } else if (res.status === 400) {
        resultMensaje = "Error: Faltan campos por rellenar o los datos no son válidos.";
        mensajeColor = "red";
      } else {
        resultMensaje = "Error inesperado al crear el recurso.";
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión con la API.";
      mensajeColor = "red";
    }
  }

  // iv) Borrar un recurso concreto (Añadido control de error 404)
  async function deleteDensity(country, year) {
    try {
      const res = await fetch(`${API}/${country}/${year}`, { method: "DELETE" });
      if (res.status === 200 || res.status === 204) {
        resultMensaje = `El registro de ${country} en ${year} ha sido borrado correctamente.`;
        mensajeColor = "green";
        getDensities();
      } else if (res.status === 404) {
        resultMensaje = `No existe ningún registro de ${country} en el año ${year} para borrar.`;
        mensajeColor = "orange";
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
        if (res.status === 200 || res.status === 204) {
          resultMensaje = "Todos los registros han sido borrados de la base de datos.";
          mensajeColor = "green";
          densities = []; // Vaciamos la tabla directamente
        } else {
          resultMensaje = "Error al intentar borrar todos los datos.";
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