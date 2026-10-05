import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../js/config.js';
import { createPriceService, normalizePrices } from '../js/services/skin-prices.js';

const data = {
    key: 'Aatrox',
    id: 266,
    skins: [
        { id: 266000, isBase: true, cost: 0 },
        { id: 266030, cost: 1350 },
        { id: 266031, cost: 'Special' },
        { id: 266033, cost: 1820 },
        { id: 266099, cost: null },
        { id: 990001, cost: 975 },
    ],
};
const skin = (num) => ({ id: `Aatrox_${num}`, champion: 'Aatrox' });
const store = () => {
    const values = new Map();
    return { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
};

test('relaciona identificadores, diferencia RP y obtención especial, no inventa precios', () => {
    const prices = normalizePrices(data, 'Aatrox');
    assert.deepEqual(prices.Aatrox_30, { kind: 'rp', amount: 1350 });
    assert.deepEqual(prices.Aatrox_31, { kind: 'special' });
    assert.deepEqual(Object.keys(prices), ['Aatrox_30', 'Aatrox_31', 'Aatrox_33']);
    assert.throws(() => normalizePrices(data, 'Lux'));
});

test('comparte consultas simultáneas y reutiliza la caché entre visitas', async () => {
    const storage = store();
    let calls = 0;
    const fetcher = async () => {
        calls++;
        return { ok: true, json: async () => ({ champions: { Aatrox: data } }) };
    };
    const service = createPriceService({ fetcher, storage, now: () => 100 });
    const results = await Promise.all([
        service.getPrice(skin(30)),
        service.getPrice(skin(31)),
        service.getPrice(skin(99)),
    ]);
    assert.equal(calls, 1);
    assert.deepEqual(
        results.map((p) => p.kind),
        ['rp', 'special', 'unavailable'],
    );
    await createPriceService({ fetcher, storage, now: () => 101 }).getPrice(skin(30));
    assert.equal(calls, 1);
});

test('actualiza caché vencida y conserva la referencia si la red falla', async () => {
    const storage = store();
    const fetcher = async () => ({ ok: true, json: async () => ({ champions: { Aatrox: data } }) });
    await createPriceService({ storage, fetcher, now: () => 1 }).getPrice(skin(30));
    let calls = 0;
    const failing = async () => {
        calls++;
        throw new Error('offline');
    };
    const service = createPriceService({ storage, fetcher: failing, now: () => config.pricesCacheTtlMs + 2 });
    assert.equal((await service.getPrice(skin(30))).amount, 1350);
    assert.equal(calls, 1);
    const updated = createPriceService({
        storage,
        now: () => config.pricesCacheTtlMs + 3,
        fetcher: async () => ({
            ok: true,
            json: async () => ({ champions: { Aatrox: { ...data, skins: [{ id: 266030, cost: 975 }] } } }),
        }),
    });
    assert.equal((await updated.getPrice(skin(30))).amount, 975);
});

test('caché corrupta, almacenamiento bloqueado y fallas del proveedor no rompen el catálogo', async () => {
    for (const storage of [
        {
            getItem: () => '{',
            setItem: () => {
                throw new Error('quota');
            },
        },
        {
            getItem: () => {
                throw new Error('blocked');
            },
        },
    ]) {
        const good = createPriceService({
            storage,
            fetcher: async () => ({ ok: true, json: async () => ({ champions: { Aatrox: data } }) }),
        });
        assert.equal((await good.getPrice(skin(30))).amount, 1350);
        const bad = createPriceService({ storage, fetcher: async () => ({ ok: false }) });
        assert.equal((await bad.getPrice(skin(30))).kind, 'unavailable');
    }
});
