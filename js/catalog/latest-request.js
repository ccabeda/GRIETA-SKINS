// Cada elemento conserva sólo su petición más reciente, sin retener nodos eliminados.
const requests = new WeakMap();

export function beginRequest(element) {
    const request = Symbol();
    requests.set(element, request);
    return () => requests.get(element) === request;
}
