/* Configuración pública del proyecto. No colocar credenciales en este archivo. */
const config = Object.freeze({
    pageSize: 6,
    pricesUrl: 'data/skin-prices.json',
    loreUrl: 'data/skin-lore-es.json',
    pricesCacheKey: 'grieta-meraki-prices-v4',
    pricesCacheTtlMs: 86400000,
    locale: 'es_AR',
    cdn: 'https://ddragon.leagueoflegends.com',
    requestTimeoutMs: 12000,
    contactTimeoutMs: 15000,
    concurrency: 6,
    renderIntervalMs: 300,
    cacheKey: 'grieta-ddragon-es_AR-v2',
    themeKey: 'grieta-theme',
    fallbackImage: 'img/skin-unavailable.svg',
    formspreeEndpoint: 'https://formspree.io/f/mjygbqoj',
});
export default config;
