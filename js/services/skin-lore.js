import config from '../config.js';

export function createLoreIndex(champions, skins) {
    if (!Array.isArray(champions) || !skins || typeof skins !== 'object') throw new Error('Historias inválidas');
    const aliases = new Map(
        champions.filter((c) => Number.isInteger(c.id) && /^[A-Za-z0-9]+$/.test(c.alias)).map((c) => [c.id, c.alias]),
    );
    const stories = {};
    for (const skin of Object.values(skins)) {
        if (!Number.isInteger(skin.id) || skin.id % 1000 === 0) continue;
        const champion = aliases.get(Math.floor(skin.id / 1000));
        if (!champion || typeof skin.description !== 'string' || !skin.description.trim()) continue;
        stories[`${champion}_${skin.id % 1000}`] = skin.description.trim();
    }
    return stories;
}

export function createLoreService({ fetcher = fetch } = {}) {
    let request;
    return async function getLore(skin) {
        if (!request)
            request = (async () => {
                try {
                    const response = await fetcher(config.loreUrl, {
                        signal: AbortSignal.timeout(config.requestTimeoutMs),
                    });
                    if (!response.ok) return {};
                    const data = await response.json();
                    return data.locale === 'es_AR' && data.stories && typeof data.stories === 'object'
                        ? data.stories
                        : {};
                } catch {
                    return {};
                }
            })();
        const stories = await request;
        return typeof stories[skin.id] === 'string' ? stories[skin.id] : '';
    };
}

export const getLore = createLoreService();
