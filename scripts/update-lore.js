import { readJson, saveSnapshot } from './lib/data-files.js';
import { createLoreIndex } from '../js/services/skin-lore.js';

const source = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/es_ar/v1';
const [champions, skins] = await Promise.all([
    readJson(`${source}/champion-summary.json`),
    readJson(`${source}/skins.json`),
]);
const stories = createLoreIndex(champions.data, skins.data);
if (!Object.keys(stories).length) throw new Error('La fuente no devolvió historias en español');
const destination = new URL('../data/skin-lore-es.json', import.meta.url);
await saveSnapshot(destination, { source, locale: 'es_AR', sourceLastModified: skins.modified, stories });
console.log(`Historias en español: ${Object.keys(stories).length}. Fuente: ${skins.modified}`);
