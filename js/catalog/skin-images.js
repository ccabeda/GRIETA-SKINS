import config from '../config.js';

export function attach(image, skin, caption) {
    caption.hidden = true;
    image.addEventListener(
        'error',
        () => {
            image.src = config.fallbackImage;
            image.alt = 'Ilustración no disponible en Data Dragon para este aspecto';
            caption.textContent = 'Ilustración no disponible';
            caption.hidden = false;
        },
        { once: true },
    );
    image.alt = `Ilustración de ${skin.name}`;
    image.src = skin.image;
}
