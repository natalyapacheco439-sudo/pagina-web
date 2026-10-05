# Amara Home: página web

Sitio web de Amara Home para captación, venta y remodelación de inmuebles en Bogotá y municipios aledaños.
Colores de la marca: rojo #950606 (principal), gris, blanco y negro.

## Cómo verla

Abre `index.html` con doble clic en tu navegador.

## Cómo publicar un inmueble nuevo

1. Sube las fotos a la carpeta `img/inmuebles/`, por ejemplo `ah-007-1.jpg`, `ah-007-2.jpg`.
   Usa fotos horizontales y livianas (menos de 500 KB cada una).
2. Abre `inmuebles.js`, copia un bloque `{ ... }`, pégalo al final de la lista y cambia sus datos.
3. En `fotos`, escribe las rutas: `fotos: ["img/inmuebles/ah-007-1.jpg", "img/inmuebles/ah-007-2.jpg"]`.
4. Para quitar un inmueble vendido, borra su bloque.

Los filtros de tipo, ciudad y operación se actualizan solos con los inmuebles de la lista.
Los inmuebles con `ejemplo: true` son de muestra: bórralos cuando subas los reales.

## Datos de contacto

- **WhatsApp y correo:** al inicio de `script.js` (`WHATSAPP` y `EMAIL_DESTINO`).
- **Teléfono, oficina y horario:** en la sección Contacto de `index.html`.

## Archivos

- `index.html`: contenido de la página
- `inmuebles.js`: lista de inmuebles publicados
- `styles.css`: colores y diseño
- `script.js`: catálogo, filtros, ventana de detalle, menú y formulario
- `img/`: logos y fotos

## Marca

- `marca.html`: manual de marca (logo, colores, tipografía y usos).
- `img/marca/`: todas las versiones del logo en SVG y PNG, y los íconos para el navegador.
- `img/marca/generar_logos.py`: script que dibuja los logos (por si hay que ajustarlos).
- `kit-marca/` y `amara-home-kit-marca.zip`: logos en PNG, SVG y PDF, fotos de perfil, portada y diseños para pautas en redes.
- `img/marca/generar_kit.js`: script que genera el kit.
