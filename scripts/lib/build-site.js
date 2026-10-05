import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function listFiles(root, directory) {
    const entries = await readdir(path.join(root, directory), { withFileTypes: true });
    const files = await Promise.all(
        entries.map((entry) => {
            const relative = `${directory}/${entry.name}`;
            return entry.isDirectory() ? listFiles(root, relative) : relative;
        }),
    );
    return files.flat().sort();
}

export async function buildSite(root, output) {
    // Toda la cadena de imports comparte versión, incluidos módulos y hojas importadas.
    const files = ['index.html', 'styles.css', ...(await listFiles(root, 'js')), ...(await listFiles(root, 'css'))];
    const hash = createHash('sha256');
    for (const file of files) {
        hash.update(file);
        hash.update(await readFile(path.join(root, file)));
    }
    const version = hash.digest('hex').slice(0, 16);
    const assets = `assets/${version}`;
    await mkdir(path.join(output, assets), { recursive: true });
    for (const entry of ['js', 'css', 'styles.css']) {
        await cp(path.join(root, entry), path.join(output, assets, entry), { recursive: true });
    }
    for (const entry of ['img', 'favicon.svg', 'data/skin-prices.json', 'data/skin-lore-es.json']) {
        await mkdir(path.dirname(path.join(output, entry)), { recursive: true });
        await cp(path.join(root, entry), path.join(output, entry), { recursive: true });
    }
    const html = (await readFile(path.join(root, 'index.html'), 'utf8'))
        .replace('href="styles.css"', `href="${assets}/styles.css"`)
        .replace('src="js/main.js"', `src="${assets}/js/main.js"`);
    await writeFile(path.join(output, 'index.html'), html);
    await writeFile(path.join(output, '.nojekyll'), '');
    return { version, assets };
}
