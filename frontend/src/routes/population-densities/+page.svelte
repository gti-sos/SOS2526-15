<script>
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button, Table } from '@sveltestrap/sveltestrap';
  // Importamos las herramientas de navegación de SvelteKit
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let API = '/api/v1/population-densities';
  if (dev) API = "http://localhost:8080" + API;

  // Variables de estado generales
  // @ts-ignore
  let densities = $state([]);
  // @ts-ignore
  let resultMensaje = $state("");
  // @ts-ignore
  let mensajeColor = $state("green");

  // Variables para crear recurso
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

  // Variables para la BÚSQUEDA AVANZADA
  // @ts-ignore
  let searchCountry = $state("");
  // @ts-ignore
  let searchYear = $state("");
  // @ts-ignore
  let searchFrom = $state("");
  // @ts-ignore
  let searchTo = $state("");
  // @ts-ignore
  let searchDensity = $state("");
  // @ts-ignore
  let searchPopulation = $state("");
  // @ts-ignore
  let searchPercentageChange = $state("");
  // @ts-ignore
  let searchLimit = $state("");
  // @ts-ignore
  let searchOffset = $state("");

  // ---------------- FUNCIONES ----------------

  // Búsqueda y Listado
  async function getDensities() {
    let query = new URLSearchParams();
    
    if (searchCountry) query.append("country", searchCountry);
    if (searchYear) query.append("year", searchYear);
    if (searchFrom) query.append("from", searchFrom);
    if (searchTo) query.append("to", searchTo);
    if (searchDensity) query.append("density", searchDensity);
    if (searchPopulation) query.append("population", searchPopulation);
    if (searchPercentageChange) query.append("percentage_change", searchPercentageChange);
    if (searchLimit) query.append("limit", searchLimit);
    if (searchOffset) query.append("offset", searchOffset);

    // === AQUÍ ESTÁ LA MAGIA ===
    // Actualizamos la URL visible del navegador sin recargar la página
    goto(`?${query.toString()}`, { replaceState: true, keepFocus: true });

    let fetchUrl = API;
    if (query.toString()) {
      fetchUrl += `?${query.toString()}`;
    }

    try {
      const res = await fetch(fetchUrl, { method: "GET" });
      if (res.ok) {
        densities = await res.json();
        // Si no es un array (por ejemplo, al buscar un recurso único que devuelve un objeto), lo metemos en un array
        if (!Array.isArray(densities)) {
            densities = [densities];
        }
      } else if (res.status === 404) {
        densities = []; 
        resultMensaje = "No se encontraron resultados para esta búsqueda.";
        mensajeColor = "orange";
      } else {
        resultMensaje = "Error al obtener los datos. Código: " + res.status;
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión con la API.";
      mensajeColor = "red";
    }
  }

  function limpiarBusqueda() {
    searchCountry = ""; searchYear = ""; searchFrom = ""; searchTo = "";
    searchDensity = ""; searchPopulation = ""; searchPercentageChange = "";
    searchLimit = ""; searchOffset = "";
    getDensities(); // Al llamar a getDensities con todo vacío, la URL también se limpiará
  }

  // Cargar datos iniciales
  async function loadInitialData() {
    try {
      const res = await fetch(`${API}/loadInitialData`, { method: "GET" });
      if (res.status === 201 || res.ok) {
        resultMensaje = "Datos iniciales cargados con éxito.";
        mensajeColor = "green";
        limpiarBusqueda(); // Limpiamos los filtros para que se vean todos los datos recién cargados
      } else {
        resultMensaje = "Error al cargar los datos iniciales.";
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión.";
      mensajeColor = "red";
    }
  }

  // Crear recurso
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
        resultMensaje = `Registro de ${newCountry} creado.`;
        mensajeColor = "green";
        newCountry = ""; newYear = ""; newDensity = ""; newPopulation = ""; newPercentageChange = "";
        getDensities();
      } else if (res.status === 409) {
        resultMensaje = "Conflicto: Ya existe un registro para ese país y año.";
        mensajeColor = "orange";
      } else {
        resultMensaje = "Error al crear: Faltan datos o formato incorrecto.";
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión.";
      mensajeColor = "red";
    }
  }

  // Borrar recurso concreto
  async function deleteDensity(country, year) {
    try {
      const res = await fetch(`${API}/${country}/${year}`, { method: "DELETE" });
      if (res.status === 200 || res.status === 204) {
        resultMensaje = `Registro de ${country} (${year}) borrado.`;
        mensajeColor = "green";
        getDensities();
      } else {
        resultMensaje = "Error al borrar el recurso.";
        mensajeColor = "red";
      }
    } catch (err) {
      resultMensaje = "Error de conexión.";
      mensajeColor = "red";
    }
  }

  // Borrar todos
  async function deleteAll() {
    if (confirm("¿Seguro que quieres borrar TODOS los datos?")) {
      try {
        const res = await fetch(API, { method: "DELETE" });
        if (res.status === 200 || res.status === 204) {
          resultMensaje = "Todos los registros han sido borrados.";
          mensajeColor = "green";
          densities = [];
        }
      } catch (err) {
        resultMensaje = "Error de conexión.";
        mensajeColor = "red";
      }
    }
  }

  onMount(() => {
    // Al cargar la página, comprobamos si la URL ya tiene algún filtro escrito (ej. ?country=españa)
    // y lo ponemos en las cajas de texto automáticamente.
    const params = $page.url.searchParams;
    searchCountry = params.get("country") || "";
    searchYear = params.get("year") || "";
    searchFrom = params.get("from") || "";
    searchTo = params.get("to") || "";
    searchDensity = params.get("density") || "";
    searchPopulation = params.get("population") || "";
    searchPercentageChange = params.get("percentage_change") || "";
    searchLimit = params.get("limit") || "";
    searchOffset = params.get("offset") || "";

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

  <div class="card mb-4 p-3 bg-light shadow-sm">
    <h5 class="mb-3">🔍 Búsqueda Avanzada y Paginación</h5>
    <div class="row g-2 mb-2">
      <div class="col-md-3">
        <input bind:value={searchCountry} placeholder="País" class="form-control form-control-sm" />
      </div>
      <div class="col-md-3">
        <input type="number" bind:value={searchYear} placeholder="Año exacto" class="form-control form-control-sm" />
      </div>
      <div class="col-md-3">
        <input type="number" bind:value={searchFrom} placeholder="Desde año (from)" class="form-control form-control-sm" />
      </div>
      <div class="col-md-3">
        <input type="number" bind:value={searchTo} placeholder="Hasta año (to)" class="form-control form-control-sm" />
      </div>
    </div>
    
    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <input type="number" step="0.1" bind:value={searchDensity} placeholder="Densidad" class="form-control form-control-sm" />
      </div>
      <div class="col-md-3">
        <input type="number" bind:value={searchPopulation} placeholder="Población" class="form-control form-control-sm" />
      </div>
      <div class="col-md-3">
        <input type="number" step="0.01" bind:value={searchPercentageChange} placeholder="% Cambio" class="form-control form-control-sm" />
      </div>
    </div>

    <div class="row g-2 align-items-center border-top pt-2">
      <div class="col-md-2">
        <input type="number" bind:value={searchLimit} placeholder="Límite (limit)" class="form-control form-control-sm" />
      </div>
      <div class="col-md-2">
        <input type="number" bind:value={searchOffset} placeholder="Salto (offset)" class="form-control form-control-sm" />
      </div>
      <div class="col-md-8 d-flex justify-content-end gap-2">
        <Button color="outline-secondary" size="sm" onclick={limpiarBusqueda}>Limpiar Filtros</Button>
        <Button color="primary" size="sm" onclick={getDensities}>Buscar</Button>
      </div>
    </div>
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
        <td><input bind:value={newCountry} placeholder="País" class="form-control"/></td>
        <td><input type="number" bind:value={newYear} placeholder="Año" class="form-control"/></td>
        <td><input type="number" step="0.1" bind:value={newDensity} placeholder="Densidad" class="form-control"/></td>
        <td><input type="number" bind:value={newPopulation} placeholder="Población" class="form-control"/></td>
        <td><input type="number" step="0.01" bind:value={newPercentageChange} placeholder="% Cambio" class="form-control"/></td>
        <td><Button color="success" onclick={insertDensity}>Crear</Button></td>
      </tr>

      {#each densities as density (density.country + density.year)}
        <tr>
          <td>{density.country}</td>
          <td>{density.year}</td>
          <td>{density.density}</td>
          <td>{density.population}</td>
          <td>{density.percentage_change}</td>
          <td>
            <div class="d-flex gap-2">
              <a href="/population-densities/{density.country}/{density.year}" class="btn btn-warning btn-sm">Editar</a>
              <Button color="danger" size="sm" onclick={() => deleteDensity(density.country, density.year)}>Borrar</Button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </Table>
</main>