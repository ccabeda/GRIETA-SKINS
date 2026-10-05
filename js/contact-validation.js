export function fieldError(name, input) {
    const value = input.trim();
    if (name === 'name') {
        if (!value) return 'Escribí tu nombre.';
        if (value.length > 80) return 'Tu nombre no puede superar los 80 caracteres.';
    }
    if (name === 'email') {
        if (!value) return 'Escribí tu correo electrónico.';
        if (value.length > 254) return 'El correo no puede superar los 254 caracteres.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresá un correo válido, por ejemplo: vos@ejemplo.com.';
    }
    if (name === 'message') {
        if (!value) return 'Escribí el mensaje que querés enviarnos.';
        if (value.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
        if (value.length > 2000) return 'El mensaje no puede superar los 2000 caracteres.';
    }
    return '';
}

export function setupValidation(form) {
    const fields = [...form.querySelectorAll('input, textarea')];
    const touched = new Set();
    function validate(field) {
        const message = fieldError(field.name, field.value);
        const error = form.querySelector(`#error-${field.id}`);
        error.textContent = message;
        error.hidden = !message;
        field.setAttribute('aria-invalid', String(Boolean(message)));
        return !message;
    }
    for (const field of fields) {
        field.addEventListener('blur', () => {
            touched.add(field);
            validate(field);
        });
        field.addEventListener('input', () => {
            if (touched.has(field)) validate(field);
        });
    }
    return {
        validate() {
            let firstInvalid;
            for (const field of fields) {
                touched.add(field);
                if (!validate(field) && !firstInvalid) firstInvalid = field;
            }
            firstInvalid?.focus();
            return !firstInvalid;
        },
        reset() {
            touched.clear();
            for (const field of fields) {
                field.removeAttribute('aria-invalid');
                const error = form.querySelector(`#error-${field.id}`);
                error.hidden = true;
                error.textContent = '';
            }
        },
    };
}
