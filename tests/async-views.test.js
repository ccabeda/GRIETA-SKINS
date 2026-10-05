import test from 'node:test';
import assert from 'node:assert/strict';
import { showPrice } from '../js/catalog/skin-price-view.js';
import { showLore } from '../js/catalog/skin-lore-view.js';

// DOM mínimo para observar el resultado de las vistas sin red ni temporizadores.
function element() {
    return {
        children: [],
        hidden: false,
        value: '',
        ownerDocument: { createElement: element, createTextNode: (text) => ({ textContent: text }) },
        classList: { toggle() {} },
        set textContent(value) {
            this.value = value;
            this.children = [];
        },
        get textContent() {
            return this.children.length ? this.children.map((child) => child.textContent).join('') : this.value;
        },
        replaceChildren(...children) {
            this.value = '';
            this.children = children;
        },
    };
}
function pending() {
    const resolvers = new Map();
    return {
        load: (skin) => new Promise((resolve) => resolvers.set(skin.id, resolve)),
        resolve: (id, result) => resolvers.get(id)(result),
    };
}

test('un precio anterior que llega tarde no reemplaza al de la última skin abierta', async () => {
    const price = element(),
        note = element(),
        source = pending();
    const first = showPrice(price, note, { id: 'old' }, source.load);
    const last = showPrice(price, note, { id: 'new' }, source.load);
    source.resolve('new', { kind: 'rp', amount: 975, sourceDate: '2025-08-01T00:00:00Z' });
    await last;
    const expected = note.textContent;
    source.resolve('old', { kind: 'special', sourceDate: '2020-01-01T00:00:00Z' });
    await first;
    assert.equal(price.textContent, '975 RP');
    assert.equal(note.textContent, expected);
    assert.match(note.textContent, /1\/8\/25/);
});

test('una respuesta vieja no inventa precio cuando la última skin no tiene datos', async () => {
    const price = element(),
        note = element(),
        source = pending();
    const first = showPrice(price, note, { id: 'old' }, source.load);
    const last = showPrice(price, note, { id: 'new' }, source.load);
    source.resolve('new', { kind: 'unavailable' });
    await last;
    source.resolve('old', { kind: 'rp', amount: 1350 });
    await first;
    assert.equal(price.textContent, 'Precio no disponible');
});

test('una historia tardía no reemplaza la historia actual ni reaparece si la nueva no tiene texto', async () => {
    for (const current of ['Historia actual.', '']) {
        const text = element(),
            source = pending();
        const first = showLore(text, { id: 'old' }, source.load);
        const last = showLore(text, { id: 'new' }, source.load);
        source.resolve('new', current);
        await last;
        source.resolve('old', 'Historia equivocada.');
        await first;
        assert.equal(text.hidden, !current);
        assert.equal(text.textContent, current ? `Historia de la skin${current}` : '');
        if (current) assert.equal(text.children[1].lang, 'es-AR');
    }
});
