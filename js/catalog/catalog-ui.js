import GrietaConfig from '../config.js';
import * as CatalogModel from './catalog-model.js';
import * as SkinDialog from './skin-dialog.js';
import * as CatalogView from './catalog-view.js';
import * as FeaturedSkin from './featured-skin.js';
import * as DataDragon from '../services/data-dragon.js';
/* Coordina el estado del catálogo; no construye tarjetas ni consulta la API directamente. */
const search = document.getElementById('buscar-skin');
const championSelect = document.getElementById('campeon-skins');
const loadStatus = document.getElementById('estado-catalogo');
const retry = document.getElementById('reintentar-catalogo');
const loadingRegion = document.getElementById('carga-catalogo');
const state = {
    index: CatalogModel.createCatalogIndex([]),
    page: 1,
    loading: false,
    pendingSnapshot: null,
    renderTimer: null,
    championSignature: '',
};
const dialog = SkinDialog.create({
    onClose: (id) => {
        render();
        view.restoreFocus(id);
    },
});
const view = CatalogView.create({
    openDetail: (skin) => dialog.open(skin),
    changePage,
});
const featured = FeaturedSkin.create({ openDetail: (skin) => dialog.open(skin) });

function render() {
    if (dialog.isOpen()) return;
    const page = state.index.select({
        query: search.value,
        champion: championSelect.value,
        page: state.page,
    });
    state.page = page.current;
    view.render(page, state.loading);
}

function changePage(page) {
    state.page = page;
    render();
    document.getElementById('titulo-productos').focus({ preventScroll: true });
    document.getElementById('productos').scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
}

function updateChampions(champions) {
    const signature = JSON.stringify(champions.map((c) => [c.id, c.name]));
    if (signature === state.championSignature) return;
    state.championSignature = signature;
    const selected = championSelect.value;
    championSelect.replaceChildren(new Option('Todos los campeones', ''));
    [...champions]
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))
        .forEach((champion) => championSelect.add(new Option(champion.name, champion.id)));
    championSelect.value = champions.some((c) => c.id === selected) ? selected : '';
}

function applyPendingSnapshot({ final = false } = {}) {
    if (!state.pendingSnapshot) return;
    const snapshot = state.pendingSnapshot;
    state.pendingSnapshot = null;
    state.index = CatalogModel.createCatalogIndex(snapshot.skins);
    // Esperar el resultado evita favorecer a los primeros campeones descargados.
    if (final) featured.update(snapshot.skins);
    updateChampions(snapshot.champions);
    document.getElementById('total-skins').textContent = state.index.size.toLocaleString('es-AR');
}

function receiveProgress(snapshot) {
    state.pendingSnapshot = snapshot;
    loadStatus.textContent = `Cargando colección: ${snapshot.loaded} de ${snapshot.total} campeones.`;
    if (state.renderTimer) return;
    state.renderTimer = setTimeout(() => {
        state.renderTimer = null;
        applyPendingSnapshot();
        render();
    }, GrietaConfig.renderIntervalMs);
}

function describeResult(snapshot) {
    if (snapshot.offline)
        return `No pudimos actualizar la colección. Mostramos la copia guardada: ${snapshot.loaded} de ${snapshot.total} campeones (versión ${snapshot.version}).`;
    if (snapshot.failed.length)
        return `Colección parcial: faltan ${snapshot.failed.length} de ${snapshot.total} campeones. Podés reintentar para completarla.`;
    return `Colección completa · ${snapshot.total} campeones · Versión ${snapshot.version}.`;
}

async function load() {
    if (state.loading) return;
    state.loading = true;
    retry.hidden = true;
    loadStatus.textContent = 'Conectando con Data Dragon…';
    loadingRegion.setAttribute('aria-busy', 'true');
    let storage;
    try {
        storage = localStorage;
    } catch {
        /* El catálogo no requiere almacenamiento. */
    }
    try {
        const snapshot = await DataDragon.loadCatalog({ storage, onProgress: receiveProgress });
        state.pendingSnapshot = snapshot;
        loadStatus.textContent = describeResult(snapshot);
        retry.hidden = !snapshot.offline && snapshot.failed.length === 0;
    } catch {
        loadStatus.textContent = 'No pudimos cargar la colección. Revisá tu conexión y volvé a intentarlo.';
        retry.hidden = false;
    } finally {
        clearTimeout(state.renderTimer);
        state.renderTimer = null;
        applyPendingSnapshot({ final: true });
        state.loading = false;
        loadingRegion.removeAttribute('aria-busy');
        render();
    }
}

[search, championSelect].forEach((control) => {
    control.addEventListener(control === search ? 'input' : 'change', () => {
        state.page = 1;
        render();
    });
});
function clearFilters() {
    search.value = '';
    championSelect.value = '';
    state.page = 1;
    render();
    search.focus();
}
document.querySelectorAll('[data-limpiar-filtros]').forEach((button) => {
    button.addEventListener('click', clearFilters);
});
retry.addEventListener('click', load);
document.querySelector('.catalogo-controles').hidden = false;
load();
