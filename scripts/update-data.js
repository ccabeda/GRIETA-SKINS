// Un fallo no impide intentar actualizar la otra fuente.
const results = await Promise.allSettled([import('./update-prices.js'), import('./update-lore.js')]);
for (const [index, result] of results.entries()) {
    if (result.status === 'rejected') {
        console.error(`${index === 0 ? 'Precios' : 'Historias'}: ${result.reason.message}`);
        process.exitCode = 1;
    }
}
if (!process.exitCode) console.log('Precios e historias actualizados.');
