// Servidor de desarrollo local. No requiere instalar paquetes.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
function publicFiles(directory) {
    return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
        const relative = `${directory}/${entry.name}`;
        return entry.isDirectory()
            ? publicFiles(relative)
            : /\.(css|js|jpg|png|webp|svg)$/.test(entry.name)
              ? [relative]
              : [];
    });
}
const files = [
    'index.html',
    'styles.css',
    'favicon.svg',
    'data/skin-prices.json',
    'data/skin-lore-es.json',
    ...['css', 'js', 'img'].flatMap(publicFiles),
];
const routes = new Map(files.map((file) => [`/${file}`, file]));
routes.set('/', 'index.html');
const types = {
    '.json': 'application/json',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.svg': 'image/svg+xml',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
};
const server = http.createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405);
        response.end();
        return;
    }
    const file = routes.get(request.url.split('?')[0]);
    if (!file) {
        response.writeHead(404);
        response.end('No encontrado');
        return;
    }
    response.setHeader('Content-Type', `${types[path.extname(file)]}; charset=utf-8`);
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.method === 'HEAD') {
        response.end();
        return;
    }
    const stream = fs.createReadStream(path.join(root, file));
    stream.on('error', () => {
        response.statusCode = 500;
        response.end('No se pudo leer el archivo');
    });
    stream.pipe(response);
});
server.on('error', (error) => {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exitCode = 1;
});
server.listen(4173, '127.0.0.1', () => console.log('Grieta Skins: http://127.0.0.1:4173'));
