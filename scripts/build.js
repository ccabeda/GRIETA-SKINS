import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildSite } from './lib/build-site.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const { version } = await buildSite(root, path.join(root, 'dist'));
console.log(`Sitio generado en dist/ · Versión de archivos: ${version}`);
