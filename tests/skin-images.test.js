import test from 'node:test';
import assert from 'node:assert/strict';
import { attach } from '../js/catalog/skin-images.js';
import config from '../js/config.js';

test('una imagen fallida muestra un aviso accesible sin reintentos en bucle', () => {
    const image = new EventTarget();
    const caption = {};
    attach(image, { name: 'Ejemplo', image: 'original.jpg' }, caption);
    assert.equal(image.src, 'original.jpg');
    assert.equal(caption.hidden, true);
    image.dispatchEvent(new Event('error'));
    assert.equal(image.src, config.fallbackImage);
    assert.match(image.alt, /no disponible/);
    assert.equal(caption.hidden, false);
    image.src = 'sentinel';
    image.dispatchEvent(new Event('error'));
    assert.equal(image.src, 'sentinel');
});
