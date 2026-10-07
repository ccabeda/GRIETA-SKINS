import { getPrice } from '../services/skin-prices.js';
import { describeAcquisition } from '../services/skin-acquisition.js';
import { beginRequest } from './latest-request.js';

export async function showAcquisition(element, skin, loadPrice = getPrice) {
    const isCurrent = beginRequest(element);
    element.hidden = true;
    element.textContent = '';
    const price = await loadPrice(skin);
    if (!isCurrent() || price.kind !== 'special') return;
    const title = element.ownerDocument.createElement('strong');
    title.textContent = 'Método de obtención registrado';
    const description = element.ownerDocument.createElement('p');
    description.textContent = describeAcquisition(price.distribution);
    const note = element.ownerDocument.createElement('p');
    note.className = 'detalle-aviso';
    const timestamp = Date.parse(price.sourceDate);
    const date = Number.isFinite(timestamp)
        ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeZone: 'UTC' }).format(timestamp)
        : 'no informada';
    note.textContent = `Fuente: Meraki · ${date}. Referencia histórica; no confirma disponibilidad, coste ni probabilidades actuales.`;
    element.replaceChildren(title, description, note);
    element.hidden = false;
}
