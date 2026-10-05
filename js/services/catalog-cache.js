import config from '../config.js';
/* Sólo acepta entradas completas y del formato esperado; una entrada dañada se vuelve a pedir. */
const validChampion = (value) =>
    value &&
    typeof value.id === 'string' &&
    /^[A-Za-z0-9]+$/.test(value.id) &&
    typeof value.name === 'string' &&
    typeof value.title === 'string';
function read(storage) {
    try {
        const data = JSON.parse(storage?.getItem(config.cacheKey) || 'null');
        if (
            !data ||
            !/^\d+\.\d+\.\d+$/.test(data.version) ||
            !Array.isArray(data.champions) ||
            !data.champions.length ||
            !data.champions.every(validChampion) ||
            new Set(data.champions.map((c) => c.id)).size !== data.champions.length ||
            !data.entries ||
            typeof data.entries !== 'object'
        )
            return null;
        const entries = {};
        for (const champion of data.champions) {
            const skins = data.entries[champion.id];
            if (!Array.isArray(skins)) continue;
            const valid = skins.every(
                (skin) =>
                    skin &&
                    typeof skin.name === 'string' &&
                    skin.champion === champion.id &&
                    typeof skin.championName === 'string' &&
                    typeof skin.description === 'string' &&
                    new RegExp(`^${champion.id}_[1-9][0-9]*$`).test(skin.id) &&
                    skin.image === `${config.cdn}/cdn/img/champion/splash/${skin.id}.jpg`,
            );
            if (valid && new Set(skins.map((s) => s.id)).size === skins.length) entries[champion.id] = skins;
        }
        return { version: data.version, champions: data.champions, entries };
    } catch {
        return null;
    }
}
function write(storage, value) {
    try {
        storage?.setItem(config.cacheKey, JSON.stringify(value));
    } catch {
        /* Sin almacenamiento, funciona en memoria. */
    }
}
export { read, write, validChampion };
