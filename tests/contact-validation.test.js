import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldError } from '../js/contact-validation.js';

test('rechaza campos vacíos y espacios en blanco', () => {
    for (const name of ['name', 'email', 'message']) {
        assert.ok(fieldError(name, ''));
        assert.ok(fieldError(name, '   '));
    }
});
test('valida el correo y los límites de cada campo', () => {
    assert.ok(fieldError('email', 'correo-invalido'));
    assert.ok(fieldError('email', 'a@@ejemplo.com'));
    assert.equal(fieldError('email', ' persona+consulta@ejemplo.com '), '');
    assert.equal(fieldError('name', 'a'.repeat(80)), '');
    assert.ok(fieldError('name', 'a'.repeat(81)));
    assert.ok(fieldError('email', 'a'.repeat(250) + '@ejemplo.com'));
    assert.ok(fieldError('message', 'a'.repeat(9)));
    assert.equal(fieldError('message', 'a'.repeat(10)), '');
    assert.equal(fieldError('message', 'a'.repeat(2000)), '');
    assert.ok(fieldError('message', 'a'.repeat(2001)));
});
