import test from 'node:test';
import assert from 'node:assert/strict';
import { primarySkins } from '../js/services/skin-filter.js';

test('excluye chromas y conserva prestigiosas y nombres independientes con paréntesis', () => {
    const skins = [
        { name: 'Reina Cósmica' },
        { name: 'Reina cosmica (Rubí)' },
        { name: 'Reina Cósmica (Élite)' },
        { name: 'Reina Cósmica Prestigiosa' },
        { name: 'Exploradora (2026)' },
    ];
    assert.deepEqual(primarySkins(skins), [skins[0], skins[3], skins[4]]);
    assert.equal(skins.length, 5);
    assert.deepEqual(primarySkins([]), []);
});

test('una skin con paréntesis se conserva si no existe su principal en ese campeón', () => {
    const skins = [{ name: 'Reina Cósmica (Rubí)' }];
    assert.deepEqual(primarySkins(skins), skins);
});
