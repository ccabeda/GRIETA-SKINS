import { primarySkins } from './skin-filter.js';
import config from '../config.js';
import * as cache from './catalog-cache.js';
/* Transporte y carga progresiva; las consultas al catálogo viven en catalog-model.js. */

async function requestJson(fetcher, url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
    try {
        const response = await fetcher(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

function snapshot(version, champions, entries, failed = [], offline = false) {
    return {
        version,
        champions,
        skins: champions.flatMap((champion) => primarySkins(entries[champion.id] || [])),
        loaded: champions.filter((champion) => Array.isArray(entries[champion.id])).length,
        total: champions.length,
        failed: [...failed],
        offline,
    };
}

function parseSkins(champion, data) {
    if (!Array.isArray(data?.skins)) throw new Error('Lista de skins inválida');
    return (
        data.skins
            // parentSkin identifica variantes incluso cuando su traducción difiere de la skin base.
            .filter((skin) => !Number.isInteger(skin.parentSkin))
            .filter((skin) => Number.isInteger(skin.num) && skin.num > 0 && typeof skin.name === 'string')
            .map((skin) => ({
                id: `${champion.id}_${skin.num}`,
                champion: champion.id,
                championName: champion.name,
                name: skin.name.trim(),
                description: `${champion.name}, ${champion.title}. Aspecto disponible en el catálogo de Data Dragon.`,
                image: `${config.cdn}/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`,
            }))
    );
}

async function loadCatalog({ fetcher = fetch, storage, onProgress = () => {} } = {}) {
    const cached = cache.read(storage);
    const json = (url) => requestJson(fetcher, url);
    let version, champions;
    try {
        const versions = await json(`${config.cdn}/api/versions.json`);
        version = versions[0];
        if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Versión inválida');
        if (cached?.version === version) champions = cached.champions;
        else {
            const index = await json(`${config.cdn}/cdn/${version}/data/${config.locale}/champion.json`);
            champions = Object.values(index.data || {}).map(({ id, name, title }) => ({ id, name, title }));
            if (!champions.length || !champions.every(cache.validChampion))
                throw new Error('Índice de campeones inválido');
        }
    } catch (error) {
        if (!cached) throw error;
        const missing = cached.champions.filter((c) => !Array.isArray(cached.entries[c.id])).map((c) => c.id);
        return snapshot(cached.version, cached.champions, cached.entries, missing, true);
    }

    const entries = cached?.version === version ? { ...cached.entries } : {};
    const pending = champions.filter((c) => !Array.isArray(entries[c.id]));
    const failed = [];
    onProgress(snapshot(version, champions, entries));
    let cursor = 0;
    async function worker() {
        while (cursor < pending.length) {
            const champion = pending[cursor++];
            try {
                const response = await json(
                    `${config.cdn}/cdn/${version}/data/${config.locale}/champion/${champion.id}.json`,
                );
                entries[champion.id] = parseSkins(champion, response.data?.[champion.id]);
            } catch {
                failed.push(champion.id);
            }
            onProgress(snapshot(version, champions, entries, failed));
        }
    }
    await Promise.all(Array.from({ length: Math.min(config.concurrency, pending.length) }, worker));
    cache.write(storage, { version, champions, entries });
    return snapshot(version, champions, entries, failed);
}
export { loadCatalog };
