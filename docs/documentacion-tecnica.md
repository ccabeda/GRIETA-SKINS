# Documentación técnica de Grieta Skins

## 1. Objetivo y alcance

Grieta Skins es un catálogo educativo de aspectos de League of Legends. Permite explorar skins, buscar por nombre, combinar filtros y consultar ilustraciones, historias y datos de obtención. No realiza ventas, procesa pagos ni requiere una cuenta de Riot.

El proyecto utiliza HTML, CSS y JavaScript sin frameworks de interfaz. La página se ejecuta en el navegador y se publica como sitio estático en [GitHub Pages](https://ccabeda.github.io/GRIETA-SKINS/). Node.js se utiliza para las herramientas de desarrollo, la actualización de datos y la generación del sitio; no hay un servidor propio en producción. El formulario utiliza el servicio externo Formspree.

## 2. Requisitos de la entrega

- **HTML semántico:** Estructura con `header`, `nav`, `main`, `section` y `footer`; navegación interna y formulario con etiquetas. Se encuentra en `index.html`.
- **CSS con Flexbox:** Tarjetas de productos que se distribuyen y pasan a otra fila. Se encuentra en `css/catalog.css`.
- **CSS con Grid:** Reseñas y organización de los controles del catálogo. Se encuentra en `css/catalog.css` y `css/collection.css`.
- **Diseño responsivo:** Media queries para tablet y móvil, incluyendo la sección de contacto. Se encuentra en `css/responsive.css`.
- **Interactividad con JavaScript:** Búsqueda, filtros, paginación, diálogo, tema y validación del formulario. Se encuentra en `js/catalog/`, `js/theme.js`, `js/contact.js`.
- **Consumo de APIs:** Consultas con `fetch` a Data Dragon y envío del formulario a Formspree. Se encuentra en `js/services/data-dragon.js`, `js/contact.js`.
- **Manipulación del DOM:** Creación de tarjetas, actualización de resultados y opciones, mensajes y contenido del diálogo. Se encuentra en `js/catalog/catalog-view.js`, `js/catalog/catalog-ui.js`.

## 3. Organización del proyecto

Las rutas de esta sección son relativas a la raíz del repositorio.

```text
index.html                 Estructura, plantilla de tarjeta y diálogo
styles.css                 Entrada de estilos e importación de archivos CSS
css/                       Estilos por sección y reglas responsivas
js/main.js                 Entrada de los módulos de la aplicación
js/config.js               Configuración pública y límites de las consultas
js/catalog/                Estado, filtros, vistas y diálogo del catálogo
js/services/               Acceso, validación y transformación de datos
js/contact*.js             Envío y validación del formulario
js/theme.js                Cambio de tema y persistencia de la preferencia
data/                      Copias JSON de precios e historias
img/                       Recursos locales e imagen alternativa
scripts/                   Actualización de datos, verificaciones y build
tests/                     Pruebas automatizadas con node:test
docs/                      Documentación y capturas del desarrollo
.github/workflows/         Validación y despliegue automatizado
dist/                      Sitio generado para publicación; no versionado en Git
```

Se separan las responsabilidades para facilitar el mantenimiento. `catalog-model.js` filtra y pagina datos sin depender del DOM; `catalog-view.js` construye las tarjetas; `catalog-ui.js` coordina eventos y estado; los servicios consultan y normalizan las fuentes. Las vistas de precio, historia y obtención se reutilizan en el catálogo y el detalle según corresponda.

## 4. HTML, estilos y adaptación a pantallas

El documento utiliza secciones identificadas para la navegación interna. Las tarjetas se generan a partir de un elemento `template`, evitando mantener una lista de skins escrita a mano en el HTML. El detalle utiliza un `dialog` nativo.

Las tarjetas usan Flexbox con ajuste de línea: se muestran tres columnas en pantallas amplias, dos en tablet y una en móvil. Grid organiza las reseñas y los controles. Las media queries de 900 y 540 píxeles ajustan la navegación, las tarjetas, los filtros y el contacto.

Los colores se definen mediante variables CSS para compartir el diseño entre los modos claro y oscuro. El diálogo recorta el contenido con bordes redondeados y tiene un contenedor interior desplazable; el botón de cierre permanece visible durante el desplazamiento.

## 5. Fuentes de datos y consultas

- **Riot Data Dragon:** Versión, campeones, nombres e ilustraciones de skins. Desde el navegador al cargar el catálogo.
- **Meraki Analytics:** Precios de referencia y métodos de obtención. Mediante un script de actualización; el navegador lee `data/skin-prices.json`.
- **CommunityDragon:** Historias de skins en español de Argentina (`es_AR`). Mediante un script de actualización; el navegador lee `data/skin-lore-es.json`.
- **Formspree:** Recepción del formulario de contacto. Al enviar un formulario válido.

### Carga del catálogo

1. Se consulta `https://ddragon.leagueoflegends.com/api/versions.json` para obtener la versión disponible.
2. Se carga el índice de campeones en `es_AR`, o se reutiliza si la caché corresponde a esa versión.
3. Se consulta el detalle de los campeones pendientes, con un máximo de seis tareas concurrentes.
4. Se normalizan los identificadores como `Campeon_numero`, se excluyen aspectos predeterminados y variantes, y se presentan resultados progresivos.
5. Al terminar, se incorporan las categorías de obtención a partir de los precios y se elige una skin destacada aleatoria.

El filtro de variantes utiliza `parentSkin` cuando está presente. Además, existe una comprobación complementaria de nombres con sufijos entre paréntesis cuando se encuentra el aspecto principal correspondiente. El resultado depende de la calidad de los metadatos de la fuente.

Las consultas de datos tienen un límite de 12 segundos. Cuando algunos campeones fallan, el sitio muestra una colección parcial y permite reintentar. Si no se puede consultar la versión y existe una copia válida, se muestra el catálogo guardado con una aclaración.

### Precios, historias y métodos de obtención

Los precios se clasifican como valor en RP, obtención especial o dato no disponible. No se asigna un precio inventado a las skins que no tienen información. La interfaz aclara que un precio ausente no significa que la skin sea gratuita.

Para las skins especiales, el campo `distribution` de Meraki se traduce mediante reglas conocidas. Las categorías del filtro son una clasificación propia: esencias míticas, recompensas, promociones y otros métodos especiales. La compra con RP y los registros sin información completan las opciones. Los métodos desconocidos muestran una aclaración en lugar de una traducción supuesta.

El detalle incluye la fecha de la fuente y un enlace a los datos de Meraki. Los métodos describen un registro histórico: no garantizan disponibilidad, coste ni probabilidades actuales. Si no hay una historia en español para una skin, su bloque de historia se oculta.

## 6. Copias locales y caché

Se utilizan mecanismos diferentes, con propósitos distintos:

- **Archivos JSON del proyecto:** Precios, métodos e historias. Se publican con el sitio y cambian al actualizar los archivos.
- **`localStorage`:** Tema elegido, catálogo y precios consultados. Entre visitas, si el navegador permite almacenamiento.
- **Memoria de la página:** Consulta compartida de historias y solicitudes de precios. Durante la visita; se pierde al recargar.

El catálogo se reutiliza según la versión de Data Dragon. La caché de precios tiene una vigencia de 24 horas; si la actualización falla, puede conservar la referencia anterior. Ese vencimiento provoca una nueva lectura del JSON publicado, no una consulta directa a Meraki ni una actualización automática del archivo del repositorio.

Las operaciones de almacenamiento están protegidas con manejo de errores: una caché dañada o bloqueada no debe impedir el funcionamiento básico. Las historias no se guardan en `localStorage`; su servicio comparte una consulta en memoria.

El proyecto no implementa un service worker ni funcionamiento completo sin conexión. Guardar datos no lo convierte en una PWA, y las ilustraciones externas pueden necesitar acceso a internet.

## 7. Interactividad y manipulación del DOM

El buscador normaliza mayúsculas y acentos, y exige que los términos ingresados aparezcan en el nombre de la skin o del campeón. Los filtros de campeón y obtención se combinan con esa búsqueda. Al modificar un filtro se vuelve a la primera página; cada página contiene hasta seis skins. “Limpiar filtros” restablece todos los controles.

Las tarjetas se construyen clonando la plantilla HTML, completando textos y registrando eventos. Se agrupan en un `DocumentFragment` y se incorporan con `replaceChildren`. Los nombres y descripciones provenientes de datos se insertan con `textContent`, evitando interpretarlos como HTML.

Al abrir una skin, el diálogo actualiza imagen, título, historia, precio y obtención. El módulo `latest-request.js` identifica la solicitud vigente de cada vista: una respuesta tardía de una skin anterior no puede sobrescribir la actual. Al cerrar el diálogo, se restaura el foco al control que lo abrió cuando sigue disponible.

## 8. Formulario de contacto

El formulario recibe nombre, correo y mensaje. La validación personalizada reemplaza los avisos emergentes del navegador, muestra errores junto a cada campo y lleva el foco al primer campo inválido.

- Nombre obligatorio, con un máximo de 80 caracteres.
- Correo obligatorio, con comprobación básica de formato y un máximo de 254 caracteres.
- Mensaje obligatorio, entre 10 y 2000 caracteres, después de quitar espacios en los extremos para la validación.

El envío utiliza `fetch`, método `POST` y `FormData` hacia Formspree. Mientras se procesa, el botón se deshabilita para evitar envíos repetidos. El límite de espera es de 15 segundos. Si el servicio confirma el éxito, se limpia el formulario; si falla, se conserva el mensaje para permitir un nuevo intento.

La validación del navegador mejora la experiencia, pero no sustituye los controles del servicio receptor. El proyecto no incluye una base de datos propia ni guarda los mensajes en `localStorage`. El formulario informa que utiliza Formspree y pide no incluir credenciales de Riot.

## 9. Buenas prácticas aplicadas

- **Modularidad:** separación de lógica de datos, acceso a fuentes y presentación mediante módulos ES.
- **Mantenimiento:** configuración centralizada, CSS dividido por áreas y control de un máximo de 400 líneas por archivo HTML, CSS o JavaScript revisado por el script.
- **Accesibilidad:** etiquetas de formulario, enlace para saltar al contenido, estados con `aria-live`, errores con `aria-invalid`, nombres accesibles de controles y manejo del foco del diálogo.
- **Movimiento reducido:** se respeta `prefers-reduced-motion` para reducir transiciones y desplazamientos animados.
- **Contenido externo:** inserción de textos mediante `textContent`, validación de estructuras e identificadores y enlaces externos con `noopener noreferrer` cuando abren una pestaña.
- **Robustez:** tiempos máximos de espera, estados de carga y error, reintento del catálogo e imagen local alternativa si falla una ilustración.
- **Rendimiento:** consultas concurrentes limitadas, carga progresiva, solicitudes compartidas, caché y renderizado de solo una página de tarjetas.
- **Transparencia:** precios identificados como referencias, datos de obtención históricos, reseñas ficticias y aviso de proyecto educativo no afiliado a Riot.

Estas medidas describen decisiones implementadas; no equivalen a una certificación de accesibilidad ni a una auditoría integral de seguridad.

## 10. Ejecución, actualización y verificaciones

Se requiere Node.js 22 o superior. Desde la carpeta del repositorio:

```sh
npm ci
npm run dev
```

El servidor local se abre en `http://127.0.0.1:4173`. Se utiliza HTTP local para cargar los módulos y JSON; no se debe abrir `index.html` directamente como archivo. En PowerShell puede ser necesario escribir `npm.cmd` en lugar de `npm`.

- `npm test`: Ejecutar las pruebas de lógica, servicios, caché, vistas asíncronas, validación y generación del sitio.
- `npm run lint`: Revisar reglas de JavaScript con ESLint.
- `npm run format:check`: Comprobar el formato con Prettier.
- `npm run check`: Comprobar sintaxis, referencias locales y límite de líneas.
- `npm run prices:update`: Actualizar la copia de precios y métodos de Meraki.
- `npm run lore:update`: Actualizar la copia de historias en español.
- `npm run data:update`: Ejecutar ambas actualizaciones.
- `npm run build`: Generar los archivos publicables en `dist/`.
- `npm run preview`: Revisar el sitio generado en `http://127.0.0.1:4174`.

Las pruebas utilizan `node:test` y datos controlados para comprobar casos como respuestas tardías, errores de red, caché dañada, filtrado de variantes y combinación de filtros. No dependen de enviar mensajes reales a Formspree.

Los scripts de actualización validan los datos antes de guardar y utilizan un archivo temporal para reemplazar cada copia. Si una actualización falla, se conserva el archivo anterior correspondiente. Tras actualizar, se revisan los cambios y se publican los JSON con el resto del proyecto; no hay una actualización programada automática.

La verificación manual complementa las pruebas: revisar filtros y paginación, abrir y cerrar detalles con teclado, comprobar el scroll, alternar los temas, revisar tamaños de pantalla y validar campos incorrectos sin enviar mensajes de prueba a terceros.

## 11. Despliegue

El flujo `.github/workflows/pages.yml` se ejecuta al subir cambios a `main` o al iniciarlo manualmente. Instala las dependencias con `npm ci`, ejecuta lint, formato, verificaciones y pruebas, y genera el sitio. Solo después de completar esas etapas publica el artefacto de `dist/` mediante GitHub Pages.

El build calcula una huella del contenido y coloca JavaScript y CSS bajo una carpeta versionada. Al cambiar esos archivos, cambian sus direcciones, reduciendo la mezcla de versiones causada por la caché. Una pestaña que mantiene HTML antiguo puede requerir recarga para obtener la publicación nueva.

No se publican herramientas de desarrollo, pruebas ni dependencias de Node como parte del sitio. `dist/` se genera y no se guarda en Git. Un push exitoso no basta para confirmar una publicación: se debe comprobar que el flujo de despliegue termine correctamente.

## 12. Limitaciones conocidas

Data Dragon y las copias de precios e historias pueden tener fechas distintas. Una skin nueva puede aparecer en el catálogo antes de tener precio o historia disponible. La ausencia de información no permite deducir el método de obtención.

Los precios no reflejan necesariamente ofertas ni disponibilidad actual. Las categorías de obtención resumen los metadatos registrados y no cubren todos los cambios que Riot pueda introducir. El usuario debe confirmar las condiciones vigentes dentro del cliente de League of Legends.

El sitio depende de servicios externos para actualizar el catálogo, cargar ilustraciones y enviar mensajes. No ofrece compras, autenticación, una base de datos propia ni disponibilidad completamente offline.

## 13. Referencias del proyecto

- [Repositorio en GitHub](https://github.com/ccabeda/GRIETA-SKINS)
- [Sitio publicado](https://ccabeda.github.io/GRIETA-SKINS/)
- [Documentación de Riot: Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)
- [Meraki Analytics: datos de League of Legends](https://github.com/meraki-analytics/lolstaticdata)
- [CommunityDragon: recursos en español utilizados](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/es_ar/v1/)
- [Formspree](https://formspree.io/)
