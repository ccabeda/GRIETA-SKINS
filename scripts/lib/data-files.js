import { mkdir, writeFile, rename, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

export async function readJson(url, { fetcher = fetch } = {}) {
    const response = await fetcher(url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} al descargar ${url}`);
    return { data: await response.json(), modified: response.headers.get('last-modified') };
}

export async function saveSnapshot(destination, data) {
    // Serializar antes de tocar el disco; publicar sólo un archivo completo.
    const content = JSON.stringify({ ...data, downloadedAt: new Date().toISOString() }, null, 2) + '\n';
    const target = fileURLToPath(destination);
    await mkdir(dirname(target), { recursive: true });
    const temporary = `${target}.${randomUUID()}.tmp`;
    try {
        await writeFile(temporary, content, { flag: 'wx' });
        await rename(temporary, target);
    } finally {
        await unlink(temporary).catch((error) => {
            if (error.code !== 'ENOENT') throw error;
        });
    }
}
