import test from 'node:test';
import assert from 'node:assert/strict';
import { readJson, saveSnapshot } from '../scripts/lib/data-files.js';
import { mkdtemp, readFile, unlink, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

test('la descarga conserva la fecha de la fuente y rechaza HTTP o JSON inválidos', async () => {
    const result = await readJson('https://example.test/data.json', {
        fetcher: async () => ({
            ok: true,
            headers: new Headers({ 'last-modified': 'Fri, 01 Aug 2025 08:37:37 GMT' }),
            json: async () => ({ value: 1 }),
        }),
    });
    assert.equal(result.modified, 'Fri, 01 Aug 2025 08:37:37 GMT');
    for (const response of [
        { ok: false, status: 503 },
        {
            ok: true,
            json: async () => {
                throw new Error('JSON inválido');
            },
        },
    ]) {
        await assert.rejects(readJson('https://example.test/data.json', { fetcher: async () => response }));
    }
});

test('un fallo de serialización conserva intacto el archivo anterior', async () => {
    const directory = await mkdtemp(new URL('./snapshot-test-', import.meta.url));
    const file = join(directory, 'data.json');
    try {
        await saveSnapshot(pathToFileURL(file), { value: 1 });
        const before = await readFile(file, 'utf8');
        const circular = {};
        circular.self = circular;
        await assert.rejects(saveSnapshot(pathToFileURL(file), circular));
        assert.equal(await readFile(file, 'utf8'), before);
        await saveSnapshot(pathToFileURL(file), { value: 2 });
        assert.equal(JSON.parse(await readFile(file, 'utf8')).value, 2);
    } finally {
        await unlink(file);
        await rmdir(directory);
    }
});
