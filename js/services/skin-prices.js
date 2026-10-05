import config from '../config.js';

const unavailable = Object.freeze({ kind: 'unavailable' });
const validPrice = (price) =>
    price &&
    (price.kind === 'unavailable' ||
        price.kind === 'special' ||
        (price.kind === 'rp' && Number.isInteger(price.amount) && price.amount > 0));

export function normalizePrices(data, champion) {
    if (data?.key !== champion || !Number.isInteger(data.id) || !Array.isArray(data.skins)) {
        throw new Error('Datos de precios inválidos');
    }
    const prices = {};
    for (const skin of data.skins) {
        if (skin.isBase || !Number.isInteger(skin.id) || Math.floor(skin.id / 1000) !== data.id) continue;
        const id = `${champion}_${skin.id % 1000}`;
        if (Number.isInteger(skin.cost) && skin.cost > 0) prices[id] = { kind: 'rp', amount: skin.cost };
        else if (skin.cost === 'Special') prices[id] = { kind: 'special' };
    }
    return prices;
}

export function createPriceService({ fetcher = fetch, storage, now = Date.now } = {}) {
    const cached = {};
    const requests = new Map();
    let sourceRequest;
    try {
        const saved = JSON.parse(storage?.getItem(config.pricesCacheKey) || '{}');
        for (const [champion, entry] of Object.entries(saved)) {
            if (
                !/^[A-Za-z0-9]+$/.test(champion) ||
                !Number.isFinite(entry?.fetchedAt) ||
                entry.fetchedAt > now() ||
                !entry.prices ||
                typeof entry.prices !== 'object'
            )
                continue;
            if (
                Object.entries(entry.prices).every(
                    ([id, price]) => new RegExp(`^${champion}_[0-9]+$`).test(id) && validPrice(price),
                )
            )
                cached[champion] = entry;
        }
    } catch {
        /* Una caché dañada o bloqueada no impide consultar. */
    }

    async function load(champion) {
        const previous = cached[champion];
        if (previous && now() - previous.fetchedAt < config.pricesCacheTtlMs) return previous.prices;
        try {
            if (!sourceRequest)
                sourceRequest = (async () => {
                    const response = await fetcher(config.pricesUrl, {
                        signal: AbortSignal.timeout(config.requestTimeoutMs),
                    });
                    if (!response.ok) throw new Error('Precios no disponibles');
                    return response.json();
                })();
            const source = await sourceRequest;
            const prices = normalizePrices(source.champions?.[champion], champion);
            const modified = Date.parse(source.sourceLastModified);
            if (Number.isFinite(modified)) {
                for (const price of Object.values(prices)) price.sourceDate = new Date(modified).toISOString();
            }
            cached[champion] = { fetchedAt: now(), prices };
            try {
                storage?.setItem(config.pricesCacheKey, JSON.stringify(cached));
            } catch {
                /* Los precios siguen disponibles durante esta visita. */
            }
            return prices;
        } catch {
            return previous?.prices || {};
        }
    }

    async function getPrice(skin) {
        if (!/^[A-Za-z0-9]+$/.test(skin.champion)) return unavailable;
        if (!requests.has(skin.champion)) requests.set(skin.champion, load(skin.champion));
        const prices = await requests.get(skin.champion);
        return prices[skin.id] || unavailable;
    }
    return { getPrice };
}

let service;
export function getPrice(skin) {
    if (!service) {
        let storage;
        try {
            storage = localStorage;
        } catch {
            /* Sin caché persistente. */
        }
        service = createPriceService({ storage });
    }
    return service.getPrice(skin);
}
