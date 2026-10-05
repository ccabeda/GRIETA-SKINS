const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
function collect(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (entry.name.startsWith('.') || ['node_modules', 'dist'].includes(entry.name)) return [];
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? collect(file) : [file];
    });
}
const allFiles = collect(root);
for (const file of allFiles.filter((file) => /\.(js|cjs|css|html)$/.test(file))) {
    const source = fs.readFileSync(file, 'utf8');
    if (source.trimEnd().split(/\r?\n/).length > 400) throw new Error(`Máximo de 400 líneas excedido: ${file}`);
    const references = file.endsWith('.html')
        ? [...source.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1])
        : file.endsWith('.css')
          ? [...source.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map((match) => match[1])
          : file.endsWith('.js')
            ? [...source.matchAll(/^\s*import\s+(?:[^;]*?\s+from\s+)?['"](\.[^'"]+)['"]/gm)].map((match) => match[1])
            : [];
    for (const reference of references.filter((value) => !/^(https?:|#|data:)/.test(value))) {
        if (!fs.existsSync(path.resolve(path.dirname(file), reference))) {
            throw new Error(`Referencia inexistente en ${file}: ${reference}`);
        }
    }
}
const files = allFiles.filter((file) => /\.(js|cjs)$/.test(file));
for (const file of files) {
    const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (check.status !== 0) {
        process.stderr.write(check.stderr);
        process.exit(1);
    }
}
console.log(`Sintaxis correcta en ${files.length} scripts; rutas y límite de 400 líneas verificados.`);
