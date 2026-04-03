<script>
  import { page } from '$app/state';
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button, Table } from '@sveltestrap/sveltestrap';

  let country = page.params.country;
  let date = page.params.date;

  let API = '/api/v1/minimum-interprofessional-wages';
  if (dev) API = "http://localhost:8080" + API;

  let resultMensaje = $state("");
  let mensajeColor = $state("green");

  let updatedNationalWage = $state("");
  let updatedDollarWage = $state("");
  let updatedPercentage = $state("");

  // ---------------- GET ----------------
  async function getWage() {
    try {
      const res = await fetch(`${API}/${country}/${date}`);

      if (res.status === 200) {
        const wage = await res.json();
        updatedNationalWage = wage.national_currency_minimum_wage;
        updatedDollarWage = wage.nmw_on_dollar;
        updatedPercentage = wage.percentage_change;
      } else if (res.status === 404) {
        resultMensaje = `No existe un salario para ${country} en el año ${date}.`;
        mensajeColor = "red";
      } else {
        resultMensaje = "Error al obtener el recurso.";
        mensajeColor = "red";
      }
    } catch {
      resultMensaje = "Error al conectar con el servidor.";
      mensajeColor = "red";
    }
  }

  // ---------------- PUT ----------------
  async function updateWage() {
    let updatedWage = {
      country,
      date: parseInt(date),
      national_currency_minimum_wage: parseFloat(updatedNationalWage),
      nmw_on_dollar: parseFloat(updatedDollarWage),
      percentage_change: parseFloat(updatedPercentage)
    };

    try {
      const res = await fetch(`${API}/${country}/${date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedWage)
      });

      if (res.status === 200) {
        resultMensaje = `Salario de ${country} (${date}) actualizado correctamente.`;
        mensajeColor = "green";
        getWage();
      } else if (res.status === 404) {
        resultMensaje = `No existe el recurso a actualizar.`;
        mensajeColor = "red";
      } else if (res.status === 400) {
        resultMensaje = "Datos inválidos. Revise los valores introducidos.";
        mensajeColor = "red";
      } else {
        resultMensaje = "Error al actualizar el recurso.";
        mensajeColor = "red";
      }
    } catch {
      resultMensaje = "Error al conectar con el servidor.";
      mensajeColor = "red";
    }
  }

  onMount(() => {
    getWage();
  });
</script>

<h2>Editar salario: {country} ({date})</h2>

{#if resultMensaje}
  <p style="color:{mensajeColor}">{resultMensaje}</p>
{/if}

<Table>
  <thead>
    <tr>
      <th>Campo</th>
      <th>Valor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Salario (moneda nacional)</td>
      <td><input type="number" bind:value={updatedNationalWage} /></td>
    </tr>
    <tr>
      <td>Salario (USD)</td>
      <td><input type="number" bind:value={updatedDollarWage} /></td>
    </tr>
    <tr>
      <td>% Cambio</td>
      <td><input type="number" bind:value={updatedPercentage} /></td>
    </tr>
    <tr>
      <td colspan="2">
        <Button color="primary" onclick={updateWage}>
          Actualizar
        </Button>
      </td>
    </tr>
  </tbody>
    <a href="/minimum-interprofessional-wages">
    <Button color="secondary">
        Volver a la lista
    </Button>
    </a>
</Table>