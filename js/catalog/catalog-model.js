import config from '../config.js';
/* Operaciones de datos independientes del DOM y de la red. */
const normalize = (text) =>
    String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es')
        .trim();
const collator = new Intl.Collator('es');

function createCatalogIndex(input) {
    const skins = input.map((skin) => ({
        ...skin,
        name: skin.name.trim(),
        search: normalize(`${skin.championName} ${skin.name}`),
    }));
    const byName = [...skins].sort((a, b) => collator.compare(a.name, b.name));
    const byChampion = [...byName].sort((a, b) => collator.compare(a.championName, b.championName));
    let lastKey, lastMatches;

    function select({ query = '', champion = '', order = 'campeon', page = 1, size = config.pageSize } = {}) {
        const terms = normalize(query).split(/\s+/).filter(Boolean);
        const key = JSON.stringify([terms, champion, order]);
        if (key !== lastKey) {
            lastKey = key;
            lastMatches = (order === 'nombre' ? byName : byChampion).filter(
                (skin) =>
                    (!champion || skin.champion === champion) && terms.every((term) => skin.search.includes(term)),
            );
        }
        const pageSize = Number.isInteger(size) && size > 0 ? size : config.pageSize;
        const pages = Math.ceil(lastMatches.length / pageSize);
        const requested = Number.isInteger(page) ? page : 1;
        const current = Math.max(1, Math.min(requested, pages || 1));
        const start = (current - 1) * pageSize;
        return { items: lastMatches.slice(start, start + pageSize), total: lastMatches.length, pages, current, start };
    }

    return { select, size: skins.length };
}

function pageLinks(current, total) {
    const numbers = [...new Set([1, current - 1, current, current + 1, total])]
        .filter((number) => number >= 1 && number <= total)
        .sort((a, b) => a - b);
    return numbers.flatMap((number, index) => (index && number - numbers[index - 1] > 1 ? ['…', number] : [number]));
}
export { normalize, createCatalogIndex, pageLinks };
