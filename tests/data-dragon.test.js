import config from '../js/config.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../js/services/data-dragon.js';
import { createCatalogIndex, pageLinks, normalize } from '../js/catalog/catalog-model.js';
const selectPage = (skins, options) => createCatalogIndex(skins).select(options);
const store = () => {
    const data = new Map();
    return { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) };
};
function fixture({ count = 14, failures = [], version = '16.19.1' } = {}) {
    let active = 0,
        peak = 0,
        calls = [];
    const fetcher = async (url) => {
        calls.push(url);
        if (url.endsWith('versions.json')) return { ok: true, json: async () => [version] };
        if (url.endsWith('/champion.json'))
            return {
                ok: true,
                json: async () => ({
                    data: Object.fromEntries(
                        Array.from({ length: count }, (_, i) => [
                            `C${i}`,
                            { id: `C${i}`, name: `Campeón ${i}`, title: 'el ejemplo' },
                        ]),
                    ),
                }),
            };
        const id = url.match(/(C\d+)\.json$/)[1];
        active++;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 2));
        active--;
        if (failures.includes(id)) return { ok: false, status: 503 };
        return {
            ok: true,
            json: async () => ({
                data: {
                    [id]: {
                        skins: [
                            { num: 0, name: 'default' },
                            { num: 1, name: `${id} Cósmica` },
                            { num: 2, name: `${id} Cósmica (Rubí)` },
                        ],
                    },
                },
            }),
        };
    };
    return {
        fetcher,
        get peak() {
            return peak;
        },
        calls,
    };
}
test('carga todos los campeones, excluye chromas y limita concurrencia a seis', async () => {
    const f = fixture();
    const progress = [];
    const result = await loadCatalog({
        fetcher: f.fetcher,
        storage: store(),
        onProgress: (p) => progress.push(p.loaded),
    });
    assert.equal(result.loaded, 14);
    assert.equal(result.skins.length, 14);
    assert.ok(result.skins.every((s) => !s.name.includes('(Rubí)')));
    assert.ok(f.peak <= 6);
    assert.ok(f.peak > 1);
    assert.ok(progress.includes(1));
    assert.ok(result.skins.every((s) => !s.id.endsWith('_0')));
});
test('la caché evita volver a descargar detalles y sirve sin conexión', async () => {
    const storage = store();
    const f = fixture({ count: 2 });
    await loadCatalog({ fetcher: f.fetcher, storage });
    const second = fixture({ count: 2 });
    const { cacheKey } = config;
    const saved = JSON.parse(storage.getItem(cacheKey));
    assert.ok(saved.entries.C0.some((skin) => skin.name.includes('(Rubí)')));
    const main = saved.entries.C0[0];
    saved.entries.C0.push({
        ...main,
        id: 'C0_3',
        name: 'C0 Cósmica Prestigiosa',
        image: main.image.replace('_1.jpg', '_3.jpg'),
    });
    storage.setItem(cacheKey, JSON.stringify(saved));
    const online = await loadCatalog({ fetcher: second.fetcher, storage });
    assert.equal(second.calls.length, 1);
    assert.equal(online.skins.length, 3);
    assert.ok(online.skins.some((skin) => skin.name.endsWith('Prestigiosa')));
    assert.ok(online.skins.every((skin) => !skin.name.includes('(Rubí)')));
    const offline = await loadCatalog({
        fetcher: async () => {
            throw Error('offline');
        },
        storage,
    });
    assert.equal(offline.offline, true);
    assert.equal(offline.skins.length, 3);
});
test('una falla parcial informa el campeón faltante y el reintento sólo completa ese dato', async () => {
    const storage = store();
    const bad = fixture({ count: 3, failures: ['C1'] });
    const partial = await loadCatalog({ fetcher: bad.fetcher, storage });
    assert.deepEqual(partial.failed, ['C1']);
    assert.equal(partial.loaded, 2);
    const good = fixture({ count: 3 });
    const recovered = await loadCatalog({ fetcher: good.fetcher, storage });
    assert.equal(recovered.loaded, 3);
    assert.equal(good.calls.length, 2);
});
test('almacenamiento bloqueado no impide consultar; falla sin caché se propaga', async () => {
    const storage = {
        getItem() {
            throw Error('blocked');
        },
        setItem() {
            throw Error('quota');
        },
    };
    assert.equal((await loadCatalog({ fetcher: fixture({ count: 1 }).fetcher, storage })).skins.length, 1);
    await assert.rejects(
        loadCatalog({
            fetcher: async () => {
                throw Error('offline');
            },
            storage,
        }),
    );
});
test('búsqueda sin tildes, campeón y páginas de seis sin duplicados', () => {
    const skins = Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        name: `Cósmica ${String(i).padStart(2, '0')}`,
        championName: i < 3 ? 'Katarina' : 'Lux',
        champion: i < 3 ? 'Katarina' : 'Lux',
        search: normalize(`Cósmica ${i} ${i < 3 ? 'Katarina' : 'Lux'}`),
    }));
    const pages = [1, 2, 3, 4].map((page) => selectPage(skins, { page }));
    assert.deepEqual(
        pages.map((p) => p.items.length),
        [6, 6, 6, 2],
    );
    assert.equal(new Set(pages.flatMap((p) => p.items.map((s) => s.id))).size, 20);
    assert.equal(selectPage(skins, { query: 'KATARINA cosmica' }).total, 3);
    assert.equal(selectPage(skins, { champion: 'Lux', query: 'cosmica' }).total, 17);
    assert.equal(selectPage(skins, { query: 'noexiste', page: 20 }).current, 1);
    assert.ok(pageLinks(300, 1000).length <= 7);
    assert.deepEqual(pageLinks(1, 1), [1]);
});

test('un cambio de versión descarta los detalles anteriores y consulta todo el nuevo índice', async () => {
    const storage = store();
    await loadCatalog({ fetcher: fixture({ count: 2 }).fetcher, storage });
    const newer = fixture({ count: 3, version: '16.20.1' });
    const result = await loadCatalog({ fetcher: newer.fetcher, storage });
    assert.equal(result.version, '16.20.1');
    assert.equal(result.total, 3);
    assert.equal(result.skins.length, 3);
    assert.equal(newer.calls.length, 5);
    assert.ok(newer.calls.slice(1).every((url) => url.includes('/16.20.1/')));
});

test('caché con JSON o esquema inválidos se ignora', async () => {
    const { cacheKey } = config;
    for (const broken of [
        '{',
        '{}',
        JSON.stringify({ version: '16.19.1', champions: [{ name: 'X', title: 'Y' }], entries: {} }),
    ]) {
        const storage = store();
        storage.setItem(cacheKey, broken);
        const source = fixture({ count: 1 });
        const result = await loadCatalog({ fetcher: source.fetcher, storage });
        assert.equal(result.loaded, 1);
        assert.equal(source.calls.length, 3);
    }
});

test('una entrada dañada se recupera sin perder campeones válidos de la caché', async () => {
    const { cacheKey } = config;
    const storage = store();
    await loadCatalog({ fetcher: fixture({ count: 3 }).fetcher, storage });
    const data = JSON.parse(storage.getItem(cacheKey));
    data.entries.C1[0].image = 'https://invalid.example/image.jpg';
    storage.setItem(cacheKey, JSON.stringify(data));
    const repaired = fixture({ count: 3 });
    const result = await loadCatalog({ fetcher: repaired.fetcher, storage });
    assert.equal(result.loaded, 3);
    assert.equal(repaired.calls.length, 2);
    assert.ok(repaired.calls[1].endsWith('/C1.json'));
});
