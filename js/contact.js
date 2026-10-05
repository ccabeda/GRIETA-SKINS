import GrietaConfig from './config.js';
import { setupValidation } from './contact-validation.js';
const formspreeEndpoint = GrietaConfig.formspreeEndpoint;

const form = document.getElementById('formulario-contacto');
const submit = form.querySelector('[type="submit"]');
const status = document.getElementById('estado-contacto');
const validation = setupValidation(form);
const configured = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(formspreeEndpoint);
if (configured) {
    form.action = formspreeEndpoint;
    submit.disabled = false;
    status.textContent = 'Tu mensaje se enviará a través de Formspree.';
}
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!configured || submit.disabled) return;
    if (!validation.validate()) {
        status.textContent = 'Revisá los campos marcados antes de enviar.';
        return;
    }
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Enviando tu mensaje…';
    try {
        const response = await fetch(formspreeEndpoint, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(GrietaConfig.contactTimeoutMs),
        });
        if (!response.ok) throw new Error('El servicio no confirmó el envío.');
        form.reset();
        validation.reset();
        status.textContent = '¡Mensaje enviado! Gracias por compartir tu idea.';
    } catch {
        status.textContent =
            'No pudimos confirmar el envío. Tu mensaje sigue acá; revisá tu conexión e intentá de nuevo.';
    } finally {
        submit.disabled = false;
        form.removeAttribute('aria-busy');
    }
});
