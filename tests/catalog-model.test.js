import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogIndex } from '../js/catalog/catalog-model.js';

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
