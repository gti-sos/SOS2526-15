<script>
    import { onMount } from 'svelte';
    import bb, { gauge } from 'billboard.js';

    onMount(async () => {
        const res = await fetch("/api/v2/happiness-indices/proxy-countries");
        if (res.ok) {
            const data = await res.json();
            bb.generate({
                data: { 
                    columns: [["Total Países", data.length]], 
                    type: gauge() 
                },
                gauge: { label: { format: value => value } },
                bindto: "#chartEXT1"
            });
        }
    });
</script>

<div class="container py-4">
    <a href="/integrations" class="btn btn-outline-secondary mb-3">⬅️ Volver</a>
    <h3>🌍 Rest Countries (Vía Proxy Propio)</h3>
    <p class="small text-muted">Esta gráfica cuenta los países consumidos a través de tu proxy en el backend.</p>
    <div id="chartEXT1"></div>
</div>