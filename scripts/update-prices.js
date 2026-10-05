import { readJson, saveSnapshot } from './lib/data-files.js';
import { normalizePrices } from '../js/services/skin-prices.js';

const source = 'https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json';
const { data, modified } = await readJson(source);
const champions = {};
for (const champion of Object.values(data)) {
    normalizePrices(champion, champion.key);
    if (!/^[A-Za-z0-9]+$/.test(champion.key)) throw new Error('Identificador inválido');
    champions[champion.key] = {
        id: champion.id,
        key: champion.key,
        skins: champion.skins.map(({ id, cost, isBase }) => ({ id, cost, isBase })),
    };
}
if (!Object.keys(champions).length) throw new Error('El proveedor devolvió un catálogo vacío');
const destination = new URL('../data/skin-prices.json', import.meta.url);
await saveSnapshot(destination, { source, sourceLastModified: modified, champions });
console.log(`Precios actualizados: ${Object.keys(champions).length} campeones. Fuente: ${modified}`);
