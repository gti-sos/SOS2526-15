<script>
    import { onMount } from 'svelte';
    import ApexCharts from 'apexcharts';

    onMount(async () => {
        // 1. Cargamos las DOS APIs a la vez
        const [resEV, resSmi] = await Promise.all([
            fetch("https://sos2526-16.onrender.com/api/v1/global-ev-sales"),
            fetch("/api/v2/minimum-interprofessional-wages")
        ]);

        if (resEV.ok && resSmi.ok) {
            const evData = await resEV.json();
            const smiData = await resSmi.json();

            // 2. Buscamos el país de la API EV dentro de vuestra propia API de salarios
            const countryToCompare = evData[0]?.country; 
            const mySmiData = smiData.find(s => s.country.toLowerCase() === countryToCompare?.toLowerCase());

            // 3. Configuramos la gráfica con ambos datos
            const options = {
                // Mostramos dos valores: el % de ventas de coches eléctricos y un "índice" de vuestro salario
                series: [
                    evData[0]?.sales_share || 0, 
                    (mySmiData?.nmw_on_dollar / 20) || 0 // Ejemplo: dividimos el salario para que quepa en el gráfico radial
                ],
                chart: { height: 350, type: 'radialBar' },
                labels: ['% Ventas EV', 'Índice Salarial'],
                colors: ['#20E647', '#36A2EB']
            };

            const chart = new ApexCharts(document.querySelector("#chartG16"), options);
            chart.render();
        }
    });
</script>