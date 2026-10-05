import GrietaConfig from './config.js';
// Oscuro por defecto; se recupera la elección de la última visita si es posible.
const themeButton = document.getElementById('tema-boton');

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    themeButton.classList.toggle('is-dark', isDark);
    themeButton.setAttribute('aria-pressed', String(isDark));
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
}

let savedTheme = 'dark';
try {
    savedTheme = localStorage.getItem(GrietaConfig.themeKey) || 'dark';
} catch {
    // El botón funciona también cuando el almacenamiento está bloqueado.
}
applyTheme(savedTheme);
themeButton.hidden = false;

themeButton.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try {
        localStorage.setItem(GrietaConfig.themeKey, nextTheme);
    } catch {
        // La elección se mantiene durante esta visita aunque no pueda guardarse.
    }
});
