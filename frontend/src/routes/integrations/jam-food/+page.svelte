<script>
    import { onMount } from 'svelte';

    let mergedData = $state([]);
    let loading = $state(true);

    onMount(async () => {
        // 1. Cargamos las DOS APIs a la vez
        const [resFood, resSmi] = await Promise.all([
            fetch("https://sos2526-18.onrender.com/api/v2/food-supply-utilization-accounts"),
            fetch("/api/v2/minimum-interprofessional-wages")
        ]);

        if (resFood.ok && resSmi.ok) {
            const foodData = await resFood.json();
            const smiData = await resSmi.json();

            // 2. Cruzamos los datos: por cada dato de comida, buscamos el salario de ese país
            mergedData = foodData.slice(0, 20).map(food => {
                const smi = smiData.find(s => 
                    s.country.toLowerCase() === food.country.toLowerCase()
                );
                
                return {
                    country: food.country,
                    year: food.year,
                    kcal: food.food_supply_kcal,
                    // Si encontramos el salario lo ponemos, si no, ponemos "N/A"
                    salary: smi ? `${smi.nmw_on_dollar} $` : "No disponible"
                };
            });
        }
        loading = false;
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver al Panel</a>
    
    <div class="card shadow-sm p-4">
        <h3>🍎 Integración: Suministro Alimentario vs Salario Mínimo</h3>
        <p class="text-muted">
            En esta tabla cruzamos el suministro de Kcal (Datos Grupo 18) con nuestros datos de Salario Mínimo Interprofesional.
        </p>

        {#if loading}
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p>Cruzando bases de datos...</p>
            </div>
        {:else}
            <table class="table table-hover mt-4">
                <thead class="table-dark">
                    <tr>
                        <th>País</th>
                        <th>Año</th>
                        <th>Suministro (Kcal/Día)</th>
                        <th class="table-primary text-dark">Nuestro SMI (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    {#each mergedData as item}
                        <tr>
                            <td>{item.country}</td>
                            <td>{item.year}</td>
                            <td>{item.kcal}</td>
                            <td class="fw-bold">{item.salary}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>

<style>
    .table-primary {
        background-color: #cfe2ff !important;
    }
</style>