import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildSite } from '../scripts/lib/build-site.js';

test('versiona también dependencias anidadas y publica sólo archivos del sitio', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'grieta-build-'));
    const source = path.join(root, 'source');
    const output = path.join(root, 'dist');
    const files = {
        'index.html': '<link href="styles.css"><script src="js/main.js"></script>',
        'styles.css': '@import url("css/base.css");',
        'css/base.css': 'body { color: red; }',
        'js/main.js': 'import "./nested/feature.js";',
        'js/nested/feature.js': 'export const value = 1;',
        'img/fallback.svg': '<svg/>',
        'favicon.svg': '<svg/>',
        'data/skin-prices.json': '{}',
        'data/skin-lore-es.json': '{}',
        '.env': 'PRIVATE=example',
        'server.cjs': '// desarrollo',
    };
    for (const [file, text] of Object.entries(files)) {
        await mkdir(path.dirname(path.join(source, file)), { recursive: true });
        await writeFile(path.join(source, file), text);
    }
    const first = await buildSite(source, output);
    assert.equal((await buildSite(source, output)).version, first.version);
    const html = await readFile(path.join(output, 'index.html'), 'utf8');
    assert.ok(html.includes(`src="${first.assets}/js/main.js"`));
    assert.ok(html.includes(`href="${first.assets}/styles.css"`));
    await access(path.join(output, first.assets, 'js/nested/feature.js'));
    await access(path.join(output, first.assets, 'css/base.css'));
    await access(path.join(output, 'data/skin-lore-es.json'));
    await assert.rejects(access(path.join(output, '.env')));
    await assert.rejects(access(path.join(output, 'server.cjs')));
    await writeFile(path.join(source, 'js/nested/feature.js'), 'export const value = 2;');
    const second = await buildSite(source, output);
    assert.notEqual(second.version, first.version);
    await writeFile(path.join(source, 'css/base.css'), 'body { color: blue; }');
    assert.notEqual((await buildSite(source, output)).version, second.version);
});
