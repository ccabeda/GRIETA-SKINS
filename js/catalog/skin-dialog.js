import * as SkinImages from './skin-images.js';
import { showPrice } from './skin-price-view.js';
import { showLore } from './skin-lore-view.js';
function create({ onClose }) {
    const dialog = document.getElementById('detalle-skin');
    let openerId;
    let openerElement;
    function open(skin) {
        openerElement = document.activeElement;
        openerId = skin.id;
        const oldImage = document.getElementById('detalle-imagen');
        const image = oldImage.cloneNode(false);
        SkinImages.attach(image, skin, document.getElementById('detalle-imagen-nota'));
        oldImage.replaceWith(image);
        document.getElementById('detalle-titulo').textContent = skin.name;
        document.getElementById('detalle-universo').textContent = skin.championName;
        showLore(document.getElementById('detalle-descripcion'), skin);
        showPrice(document.getElementById('detalle-precio'), document.getElementById('detalle-precio-nota'), skin);
        dialog.showModal();
        document.body.classList.add('detalle-abierto');
    }
    dialog.querySelector('.cerrar-detalle').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
        document.body.classList.remove('detalle-abierto');
        onClose(openerId);
        if (openerElement?.isConnected) openerElement.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', (event) => {
        const bounds = dialog.getBoundingClientRect();
        if (
            event.target === dialog &&
            (event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom)
        )
            dialog.close();
    });
    return { open, isOpen: () => dialog.open };
}
export { create };
