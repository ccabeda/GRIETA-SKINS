# Grieta Skins

[Ver el sitio en GitHub Pages](https://ccabeda.github.io/GRIETA-SKINS/).

Catálogo de League of Legends, realizado con HTML, CSS y JavaScript.
Consulta Data Dragon directamente desde el navegador, sin claves ni backend de aplicación.
No vende skins ni procesa pagos. Los precios son referencias comunitarias; las reseñas son ficticias.
No está afiliado a Riot Games.

## Ejecutar

`npm.cmd run data:update` actualiza precios e historias con un solo comando.
Cada fuente se valida antes de reemplazar su archivo; si una falla, se conserva su copia
anterior y se intenta actualizar la otra. El comando termina con error si alguna actualización falla.
Los scripts comparten descarga y guardado seguro en `scripts/lib/data-files.js`.
La fecha visible junto a los precios corresponde a la fuente de Meraki, no a la descarga local.

Ejecutar `node server.cjs` desde esta carpeta y visitar
http://127.0.0.1:4173. El servidor local se detiene con Ctrl+C.
También funciona `npm.cmd run dev` en PowerShell o `npm run dev` en otras terminales.
El sitio usa módulos nativos: debe abrirse mediante el servidor, no con doble clic en el HTML.
El servidor no requiere dependencias. Para las herramientas de desarrollo, ejecutar `npm.cmd ci`
con Node.js 22 o superior. ESLint y Prettier sólo se usan durante el desarrollo.

## Catálogo conectado a Riot

- Obtiene la versión actual desde `https://ddragon.leagueoflegends.com/api/versions.json`.
- Incluye búsqueda sin distinción de tildes, selector de campeón y orden alfabético.
- Renderiza sólo 6 tarjetas por página y usa paginación compacta con puntos suspensivos.
- Guarda datos por versión en localStorage cuando hay espacio y permisos. Si no puede guardar,
  el catálogo funciona durante esa visita. La primera consulta necesita Internet.
- Si falla la actualización, puede mostrar la copia guardada.

[Fuente de precios y condiciones de uso](https://github.com/meraki-analytics/lolstaticdata).

Meraki no proporciona el encabezado CORS necesario para consultar su CDN desde este sitio.
`npm.cmd run prices:update` descarga su archivo público y genera `data/skin-prices.json` con los
campos necesarios. No modifica la copia existente si la descarga o la validación falla.
El archivo generado registra la fuente, su fecha de modificación y la fecha de descarga.
La copia incluida contiene 171 campeones; las skins sin coincidencia muestran «Precio no disponible».
Al actualizarla, los visitantes pueden conservar referencias anteriores hasta vencer la caché de 24 horas.

La prueba real consultó la versión 16.19.1: 173 campeones y 2027 skins tras filtrar los chromas.
Estas cantidades cambian con las actualizaciones de Riot.

[Documentación oficial de Data Dragon](https://support-developer.riotgames.com/hc/en-us/articles/22698698001939-League-of-Legends).

## Archivos

`npm.cmd run lore:update` actualiza `data/skin-lore-es.json` desde CommunityDragon (`es_ar`).
La copia incluye 1807 historias; la fuente está fechada el 29 de septiembre de 2026.
El archivo registra la fuente y las fechas. Si una descarga falla, conserva la copia anterior.
Las historias se relacionan por identificador, sin traducirlas automáticamente ni usar el inglés como reemplazo.

[Fuente de historias en español](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/es_ar/v1/skins.json).

- `index.html`: estructura semántica, plantilla de tarjeta, diálogo y formulario.
- `styles.css`: entrada que importa las hojas de estilo en orden.
- `css/`: base, estructura, tarjetas, controles de colección, formularios y diseño adaptable.
- `js/config.js`: configuración pública central: APIs, idioma, paginación, cachés y contacto.
- `js/main.js`: entrada única del navegador; cada módulo declara sus dependencias con `import`.
- `js/theme.js`: interruptor claro/oscuro basado en CajaGo, con preferencia persistente.
- `js/contact.js`: validación y envío del formulario de contacto.
- `js/services/`: Data Dragon, filtro de chromas, precios de Meraki y cachés.
- `data/skin-prices.json`: copia reducida de Meraki para servir desde el mismo origen que el sitio.
- `scripts/update-prices.js`: actualización reproducible de la copia de precios.
- `js/catalog/`: modelo de búsqueda y orden, controlador, tarjetas, paginación, diálogo e imágenes.
- `server.cjs`: servidor local de desarrollo; no interviene en las consultas a Riot.
- `tests/`: pruebas de API, caché, modelo e imágenes sin acceso a la red.
- `scripts/check.cjs`: verificación de sintaxis, rutas locales y máximo de 400 líneas por archivo.
- `img/`: imagen de aviso; las ilustraciones, incluida la portada, vienen de Riot.

## Contacto

El formulario «Grieta Skins» está conectado a Formspree mediante
`formspreeEndpoint` en `js/config.js`. El endpoint es público y no es una contraseña.
Si se elimina esa URL, el envío queda deshabilitado.

League of Legends, sus personajes e ilustraciones pertenecen a Riot Games.
