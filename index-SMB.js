let datos = [
    { country: "iran", date: 2024, national_currency_minimum_wage: 53073300.00, nmw_on_dollar: 1263.70, percentage_change: -6.04 },
    { country: "united states", date: 2026, national_currency_minimum_wage: 1257.00, nmw_on_dollar: 1257.00, percentage_change: -3.48 },
    { country: "united states", date: 2025, national_currency_minimum_wage: 1257.00, nmw_on_dollar: 1257.00, percentage_change: -8.38 },
    { country: "united states", date: 2024, national_currency_minimum_wage: 1257.00, nmw_on_dollar: 1257.00, percentage_change: 1.85 },
    { country: "iran", date: 2022, national_currency_minimum_wage: 26554950.00, nmw_on_dollar: 632.30, percentage_change: 126.70 },
    { country: "spain", date: 2026, national_currency_minimum_wage: 1381.00, nmw_on_dollar: 1622.70, percentage_change: 0 },
    { country: "spain", date: 2025, national_currency_minimum_wage: 1381.00, nmw_on_dollar: 1435.00, percentage_change: -0.02 },
    { country: "spain", date: 2024, national_currency_minimum_wage: 1381.00, nmw_on_dollar: 1461.90, percentage_change: 0 },
    { country: "canada", date: 2025, national_currency_minimum_wage: 2872.10, nmw_on_dollar: 1994.50, percentage_change: 0.81 },
    { country: "portugal", date: 2026, national_currency_minimum_wage: 1073.00, nmw_on_dollar: 1260.80, percentage_change: 5.71 }
];
function media(pais){
    let subconjunto = datos.filter(d => d.country === pais);
    let valores = subconjunto.map(d => d.nmw_on_dollar);
    let suma = 0;
    valores.forEach(valor => {
        suma += valor;
    });
    let media = valores.length > 0 ? suma / valores.length : 0;
    console.log(`Media de sueldo minimo en dolar en ${pais}: ${media}`);
}

media("spain");