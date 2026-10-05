import { getLore } from '../services/skin-lore.js';
import { beginRequest } from './latest-request.js';

export async function showLore(element, skin, loadLore = getLore) {
    const isCurrent = beginRequest(element);
    element.replaceChildren();
    element.hidden = true;
    const lore = await loadLore(skin);
    if (!isCurrent() || !lore) return;
    const label = element.ownerDocument.createElement('span');
    label.className = 'skin-lore-label';
    label.textContent = 'Historia de la skin';
    const text = element.ownerDocument.createElement('span');
    text.className = 'skin-lore-text';
    text.lang = 'es-AR';
    text.textContent = lore;
    element.replaceChildren(label, text);
    element.hidden = false;
}
