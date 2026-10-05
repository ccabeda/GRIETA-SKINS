# Grieta Skins

Catálogo de skins de League of Legends desarrollado con HTML, CSS y JavaScript.

🌐 [Ver sitio](https://ccabeda.github.io/GRIETA-SKINS/)

## Funcionalidades

- Catálogo actualizado desde Data Dragon, sin chromas.
- Búsqueda por nombre, filtro por campeón y paginación de 6 skins.
- Detalle de cada skin con ilustración, historia en español y precio de referencia.
- Skin destacada aleatoria en la portada.
- Modo claro y oscuro con preferencia guardada.
- Diseño adaptable a celulares y computadoras.
- Formulario de contacto con validación personalizada y Formspree.

## Ejecutar localmente

Requiere Node.js 22 o superior.

1. Clonar el repositorio y abrir su carpeta.
2. Ejecutar `npm install`.
3. Ejecutar `npm run dev`.
4. Abrir http://127.0.0.1:4173.

En PowerShell, usar `npm.cmd` si la terminal bloquea `npm`.
El sitio debe abrirse mediante el servidor, no directamente desde el HTML.

## Fuentes de datos

- **Riot Data Dragon:** campeones, nombres de skins e ilustraciones.
- **Meraki Analytics:** precios de referencia.
- **CommunityDragon:** historias oficiales en español.
- **Formspree:** recepción de mensajes del formulario.

Los precios y las historias se incluyen en archivos JSON dentro de `data/`.
Para actualizar ambas copias, ejecutar `npm run data:update`.

## Comandos de desarrollo

| Comando                | Función                                       |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Iniciar el servidor local                     |
| `npm test`             | Ejecutar las pruebas                          |
| `npm run lint`         | Revisar el código con ESLint                  |
| `npm run format:check` | Comprobar el formato                          |
| `npm run check`        | Verificar sintaxis, rutas y límites de líneas |
| `npm run data:update`  | Actualizar precios e historias                |

## Aclaraciones

Proyecto educativo, sin afiliación con Riot Games.
No realiza ventas ni procesa pagos. Las reseñas son ficticias.
Los precios pueden estar desactualizados: confirmar su valor y disponibilidad
en el cliente de League of Legends.

League of Legends, sus personajes e ilustraciones pertenecen a Riot Games.
