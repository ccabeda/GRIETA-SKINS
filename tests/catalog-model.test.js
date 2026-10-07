import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogIndex } from '../js/catalog/catalog-model.js';

test('combina obtención, campeón y búsqueda, pagina y permite limpiar', () => {
    const source = Array.from({ length: 15 }, (_, id) => ({
        id: String(id),
        name: `Cósmica ${id}`,
        champion: 'Lux',
        championName: 'Lux',
        acquisition: id < 8 ? 'mythic' : 'rp',
    }));
    const index = createCatalogIndex(source);
    assert.equal(index.select({ acquisition: 'mythic', query: 'cosmica', champion: 'Lux', page: 2 }).items.length, 2);
    assert.equal(index.select({ acquisition: 'rp' }).total, 7);
    assert.equal(index.select({ acquisition: 'mythic', champion: 'Katarina' }).total, 0);
    assert.equal(index.select({}).total, 15);
});

test('el índice conserva el catálogo original y mantiene búsqueda y orden al navegar', () => {
    const source = Object.freeze(
        Array.from({ length: 15 }, (_, number) =>
            Object.freeze({
                id: String(number),
                name: `  Cósmica ${String(number).padStart(2, '0')}  `,
                champion: number < 7 ? 'Katarina' : 'Lux',
                championName: number < 7 ? 'Katarina' : 'Lux',
            }),
        ),
    );
    const index = createCatalogIndex(source);
    assert.equal(index.select({ query: 'cosmica', champion: 'Katarina' }).total, 7);
    assert.equal(index.select({ query: 'cosmica', champion: 'Katarina', page: 2 }).items[0].name, 'Cósmica 06');
    assert.equal(index.select({ champion: 'Lux', page: 100 }).current, 2);
    assert.equal(index.select({ query: 'noexiste' }).total, 0);
    assert.equal(index.select({}).total, 15);
    assert.equal(index.select({ size: 0 }).items.length, 6);
    assert.ok(source[0].name.startsWith('  '));
});
