import * as SkinImages from './skin-images.js';
import * as CatalogModel from './catalog-model.js';
import { showPrice } from './skin-price-view.js';
import { showLore } from './skin-lore-view.js';
function create({ openDetail, changePage }) {
    const catalog = document.querySelector('.productos-flex');
    const template = document.getElementById('tarjeta-skin');
    const numbers = document.getElementById('numeros-pagina');
    const previous = document.getElementById('pagina-anterior');
    const next = document.getElementById('pagina-siguiente');
    let currentPage = 1;
    previous.addEventListener('click', () => changePage(currentPage - 1));
    next.addEventListener('click', () => changePage(currentPage + 1));

    function renderCards(items) {
        const fragment = document.createDocumentFragment();
        for (const skin of items) {
            const card = template.content.firstElementChild.cloneNode(true);
            SkinImages.attach(card.querySelector('img'), skin, card.querySelector('.imagen-nota'));
            card.querySelector('.producto-universo').textContent = skin.championName;
            card.querySelector('h3').textContent = skin.name;
            showLore(card.querySelector('.producto-descripcion'), skin);
            showPrice(card.querySelector('[data-skin-price]'), card.querySelector('[data-price-note]'), skin);
            const button = card.querySelector('.ver-skin');
            button.dataset.skinId = skin.id;
            button.setAttribute('aria-label', `Ver ${skin.name}`);
            button.addEventListener('click', () => openDetail(skin));
            fragment.append(card);
        }
        catalog.replaceChildren(fragment);
    }
    function renderPagination(page) {
        currentPage = page.current;
        document.querySelector('.paginacion').hidden = page.pages <= 1;
        previous.disabled = currentPage === 1;
        next.disabled = currentPage >= page.pages;
        numbers.replaceChildren();
        for (const number of CatalogModel.pageLinks(currentPage, page.pages)) {
            const element = document.createElement(number === '…' ? 'span' : 'button');
            element.textContent = number;
            if (number === '…') element.setAttribute('aria-hidden', 'true');
            else {
                element.type = 'button';
                element.setAttribute('aria-label', `Página ${number}`);
                if (number === currentPage) element.setAttribute('aria-current', 'page');
                element.addEventListener('click', () => changePage(number));
            }
            numbers.append(element);
        }
    }
    function render(page, loading) {
        renderCards(page.items);
        renderPagination(page);
        const unit = page.total === 1 ? 'skin' : 'skins';
        const loaded = loading ? (page.total === 1 ? ' cargada' : ' cargadas') : '';
        document.getElementById('resultado-catalogo').textContent = page.total
            ? `Mostrando ${page.start + 1}–${page.start + page.items.length} de ${page.total} ${unit}${loaded}`
            : loading
              ? 'Buscando en los campeones que se están cargando…'
              : 'No hay skins para esta búsqueda.';
        document.querySelector('.catalogo-vacio').hidden = page.total !== 0 || loading;
    }
    function restoreFocus(id) {
        const button = [...catalog.querySelectorAll('.ver-skin')].find((element) => element.dataset.skinId === id);
        (button || document.getElementById('titulo-productos')).focus({ preventScroll: true });
    }
    return { render, restoreFocus };
}
export { create };
