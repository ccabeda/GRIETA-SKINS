import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoreIndex, createLoreService } from '../js/services/skin-lore.js';

test('relaciona cada historia con su skin y omite el aspecto predeterminado y textos ausentes', () => {
    const stories = createLoreIndex([{ id: 266, alias: 'Aatrox' }], {
        266000: { id: 266000, description: 'Historia del campeón' },
        266030: { id: 266030, description: '  Historia de DRX.  ' },
        266031: { id: 266031, description: 'Historia de DRX Prestigioso.' },
        266033: { id: 266033, description: null },
        990001: { id: 990001, description: 'Otro campeón' },
    });
    assert.deepEqual(stories, { Aatrox_30: 'Historia de DRX.', Aatrox_31: 'Historia de DRX Prestigioso.' });
});

test('comparte la descarga y devuelve vacío para skins sin historia', async () => {
    let calls = 0;
    const getLore = createLoreService({
        fetcher: async () => {
            calls++;
            return { ok: true, json: async () => ({ locale: 'es_AR', stories: { Aatrox_30: 'En español.' } }) };
        },
    });
    assert.deepEqual(await Promise.all([getLore({ id: 'Aatrox_30' }), getLore({ id: 'Aatrox_31' })]), [
        'En español.',
        '',
    ]);
    assert.equal(calls, 1);
});

test('fallas y archivos con otro idioma no muestran historias equivocadas', async () => {
    for (const fetcher of [
        async () => {
            throw new Error('offline');
        },
        async () => ({ ok: false }),
        async () => ({ ok: true, json: async () => ({ locale: 'en_US', stories: { Aatrox_30: 'English.' } }) }),
    ])
        assert.equal(await createLoreService({ fetcher })({ id: 'Aatrox_30' }), '');
});
