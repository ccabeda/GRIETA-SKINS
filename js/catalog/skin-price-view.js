import { getPrice } from '../services/skin-prices.js';
import { beginRequest } from './latest-request.js';

export async function showPrice(element, note, skin, loadPrice = getPrice) {
    const isCurrent = beginRequest(element);
    element.textContent = 'Consultando precio…';
    note.textContent = '';
    const price = await loadPrice(skin);
    // Un diálogo puede abrir otra skin antes de que termine la consulta anterior.
    if (!isCurrent()) return;
    element.classList.toggle('precio-sin-rp', price.kind !== 'rp');
    if (price.kind === 'rp') {
        const currency = element.ownerDocument.createElement('span');
        currency.className = 'precio-rp';
        currency.textContent = 'RP';
        element.replaceChildren(element.ownerDocument.createTextNode(`${price.amount} `), currency);
        note.textContent = 'Precio de referencia · Meraki';
    } else if (price.kind === 'special') {
        element.textContent = 'Obtención especial';
        note.textContent = 'Sin precio directo en RP · Meraki';
    } else {
        element.textContent = 'Precio no disponible';
        note.textContent = 'Sin un precio de referencia confirmado';
    }
    if (price.kind !== 'unavailable') {
        const timestamp = Date.parse(price.sourceDate);
        const date = Number.isFinite(timestamp)
            ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeZone: 'UTC' }).format(timestamp)
            : 'no informada';
        note.textContent += ` · Fecha de la fuente: ${date}`;
    }
}
