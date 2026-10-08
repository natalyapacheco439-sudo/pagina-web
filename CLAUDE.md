# Amara Home: notas del proyecto

Sitio web, CRM y asistente de WhatsApp de **Amara Home**: captación, venta y remodelación de inmuebles
en Bogotá y municipios aledaños. La dueña no es programadora: explicar todo en español, paso a paso,
con calma, una cosa a la vez, y esperar su confirmación antes de seguir.

## Datos del negocio

- WhatsApp: **+57 316 886 9319** (número nuevo, activado en WhatsApp Business el 2026-10-08).
  El número viejo (+57 311 278 5802) quedó atrapado en la plataforma de Newton y no se usa más.
- Correo: amarahome05@gmail.com · Instagram: @home_amara
- Colores: rojo #950606, gris, blanco y negro. Manual en `marca.html`, kit en `kit-marca/`
  (las pautas se regeneran con `img/marca/generar_kit.js`).

## Qué hay en el proyecto

- `index.html`, `styles.css`, `script.js`, `inmuebles.js`, `zonas.js`: la página web (aún no publicada).
- `crm/`: CRM conectado a una hoja de Google ("CRM Amara Home", pestaña Clientes) mediante
  Apps Script (`crm/google-apps-script.gs`). Ya está configurado y probado. Ver `crm/README.md`.
  `CRM_URL` en `script.js` apunta a la aplicación web de Apps Script.
- `agente/guion.md`: guion aprobado de **Ana**, la asistente de WhatsApp.

## Decisiones tomadas

- Ana usará el modelo económico de Claude (`claude-haiku-4-5`), a pedido de la dueña.
- WhatsApp: **Coexistencia** (app WhatsApp Business + API en el mismo número) mediante **YCloud** (plan gratis).
  Meta pide que el número lleve al menos 7 días en la app: conectar desde ~2026-10-15.
- El agente vivirá en Cloudflare Workers (Apps Script no sirve como webhook porque responde con 302).
  Guardará clientes con la acción `registrar` del Apps Script (deduplica por teléfono).
- Ana entrega el cliente a la asesora cuando tiene los datos básicos y deja de responder en ese chat
  (detectar los mensajes que la asesora envía desde la app: evento `whatsapp.smb.message.echoes` de YCloud).
- Inmuebles de **Habi**: la dueña puede descargar el inventario (sin fotos). Plan: hoja de Google
  de inmuebles que usen la página y Ana para ofrecer opciones. Nunca inventar inmuebles.

## Pendiente

1. La dueña: perfil de empresa de WhatsApp Business y número nuevo en redes.
2. Simulador para probar a Ana (sin WhatsApp).
3. Recibir el archivo de Habi y armar la hoja de inmuebles.
4. Desde ~2026-10-15: cuenta YCloud + Coexistencia, cuenta de la API de Claude, Cloudflare, construir y probar a Ana.
5. Publicar la página web (GitHub Pages u otro).
