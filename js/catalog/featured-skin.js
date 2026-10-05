/* El destacado usa el mismo catálogo que las tarjetas, sin datos de skins fijos. */
function create({ openDetail }) {
    const button = document.getElementById('hero-ficha');
    const image = document.getElementById('hero-imagen');
    let featured;
    button.addEventListener('click', () => {
        if (featured) openDetail(featured);
    });
    image.addEventListener('error', () => {
        image.hidden = true;
    });
    image.addEventListener('load', () => {
        image.hidden = false;
    });

    function update(skins) {
        // Mantener el destacado durante la visita, incluso al reintentar la carga.
        if (featured && skins.some((skin) => skin.id === featured.id)) return;
        featured = skins[Math.floor(Math.random() * skins.length)];
        button.hidden = !featured;
        image.hidden = true;
        if (!featured) {
            image.removeAttribute('src');
            return;
        }
        document.getElementById('hero-nombre').textContent = featured.name;
        document.getElementById('hero-campeon').textContent = featured.championName;
        button.setAttribute('aria-label', `Ver ${featured.name}`);
        image.src = featured.image;
    }
    return { update };
}
export { create };
