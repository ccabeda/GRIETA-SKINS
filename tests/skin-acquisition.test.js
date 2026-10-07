import test from 'node:test';
import assert from 'node:assert/strict';
import { describeAcquisition } from '../js/services/skin-acquisition.js';
import { normalizePrices, createPriceService } from '../js/services/skin-prices.js';

test('traduce métodos de obtención conservando requisitos y cantidades', () => {
    assert.match(describeAcquisition('150 Mythic Essence'), /150 esencias míticas/);
    assert.equal(describeAcquisition('Facebook Distribution'), 'Promoción de Facebook.');
    assert.match(describeAcquisition('Reward for finishing the ranked season in Gold or higher.'), /Oro o superior/);
    assert.match(
        describeAcquisition('2025, S1 Act 2 Premium Battle Pass reward (Level 50)'),
        /prémium.*2025.*temporada 1.*acto 2.*nivel 50/,
    );
    assert.match(
        describeAcquisition('0.5% drop rate from the Sanctum or opening 80 Ancient Sparks'),
        /0,5 %.*80 chispas/,
    );
    assert.match(
        describeAcquisition('1% drop rate from Cosmic 2023 Capsules or opening 30 Cosmic 2023 Capsules'),
        /1 %.*Cósmicas 2023.*30/,
    );
    for (const unknown of [null, '', 'New unknown method', '<script>alert(1)</script>']) {
        assert.equal(describeAcquisition(unknown), 'Sin información confirmada.');
    }
});

test('conserva obtención y fecha al descargar y recuperar de caché', async () => {
    const champion = {
        key: 'Aatrox',
        id: 266,
        skins: [{ id: 266031, cost: 'Special', distribution: '150 Mythic Essence' }],
    };
    assert.equal(normalizePrices(champion, 'Aatrox').Aatrox_31.distribution, '150 Mythic Essence');
    let saved;
    const storage = {
        getItem: () => saved,
        setItem: (_, value) => {
            saved = value;
        },
    };
    const fetcher = async () => ({
        ok: true,
        json: async () => ({ champions: { Aatrox: champion }, sourceLastModified: '2025-08-01' }),
    });
    const skin = { champion: 'Aatrox', id: 'Aatrox_31' };
    const first = await createPriceService({ fetcher, storage, now: () => 10 }).getPrice(skin);
    const second = await createPriceService({
        storage,
        now: () => 11,
        fetcher: () => {
            throw Error('No debería descargar');
        },
    }).getPrice(skin);
    assert.deepEqual(second, first);
    assert.equal(second.distribution, '150 Mythic Essence');
    assert.equal(second.sourceDate, '2025-08-01T00:00:00.000Z');
});
