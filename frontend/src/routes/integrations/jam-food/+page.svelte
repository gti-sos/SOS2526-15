<script>
    import { onMount } from 'svelte';

    let foodData = $state([]);

    onMount(async () => {
        const res = await fetch("https://sos2526-18.onrender.com/api/v2/food-supply-utilization-accounts");
        if (res.ok) {
            foodData = await res.json();
        }
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver</a>
    <h3>🍎 Food Supply (G18)</h3>
    <table class="table table-striped mt-4">
        <thead class="table-dark">
            <tr>
                <th>País</th>
                <th>Año</th>
                <th>Kcal/Día</th>
            </tr>
        </thead>
        <tbody>
            {#each foodData.slice(0, 15) as item}
                <tr>
                    <td>{item.country}</td>
                    <td>{item.year}</td>
                    <td>{item.food_supply_kcal}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>