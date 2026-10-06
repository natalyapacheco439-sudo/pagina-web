# CRM de clientes de Amara Home

Guarda en una hoja de Google cada mensaje que llega por el formulario de la página y te deja
responderlo, anotar lo que hablaste y saber a quién toca llamar hoy.

- **Clientes y estados:** Nuevo, Contactado, Visita agendada, Negociando, Cerrado, Perdido.
- **Respuestas rápidas:** mensajes listos que se abren en WhatsApp o en el correo con el nombre del cliente.
  Al enviar uno, el cliente pasa a "Contactado", queda anotado en su historial y se le pone seguimiento en 3 días.
- **Recordatorios:** arriba ves los clientes nuevos sin responder, los seguimientos atrasados y los de hoy.
- **Exportar a Excel:** descarga en un archivo `.csv` los clientes que estás viendo.
- **Aviso por correo:** te llega un correo cada vez que alguien escribe desde la página.
- **Clientes de tus anuncios:** los que te escriben por WhatsApp desde una campaña de Instagram, Facebook o TikTok
  los registras con **+ Cliente** y eliges el **Origen** (por ejemplo, "Anuncio TikTok").
  Con el filtro de orígenes ves cuántos clientes trajo cada red.
  La lista de orígenes está al inicio de `crm/crm.js` (`ORIGENES`).

Para mirarlo antes de configurarlo, abre `crm/index.html` y toca **Ver el CRM con clientes de ejemplo**.

## Configurarlo (una sola vez, unos 10 minutos)

### 1. Crear la hoja y pegar el código

1. Entra a [sheets.new](https://sheets.new) con la cuenta de Google de Amara Home y ponle de nombre **CRM Amara Home**.
2. En el menú, ve a **Extensiones > Apps Script**.
3. Borra lo que aparece y pega todo el contenido del archivo `crm/google-apps-script.gs`.
4. Arriba del código, cambia `cambia-esta-clave` por una clave tuya de al menos 8 letras o números.
   Si quieres los avisos en otro correo, cámbialo en `AVISAR_A`.
5. Guarda (ícono del disquete).
6. Arriba, elige la función **configurar** y toca **Ejecutar**. Google te pedirá permisos:
   elige tu cuenta, toca **Configuración avanzada > Ir a CRM Amara Home (no seguro)** y **Permitir**.
   (Dice "no seguro" solo porque el código es tuyo y Google no lo ha revisado.)
   En la hoja aparecerá una pestaña llamada **Clientes**.

### 2. Publicarlo como aplicación web

1. Toca **Implementar > Nueva implementación**.
2. En el engranaje, elige **Aplicación web**.
3. **Ejecutar como:** Yo. **Quién tiene acceso:** Cualquier usuario.
4. Toca **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).

"Cualquier usuario" es necesario para que el formulario de la página pueda guardar los mensajes.
Sin la clave, nadie puede ver ni cambiar tus clientes: solo agregar mensajes nuevos, como hace el formulario.

### 3. Conectar la página y el CRM

1. Abre `script.js` y pega la dirección entre las comillas de `CRM_URL`:
   `const CRM_URL = "https://script.google.com/macros/s/…/exec";`
2. Abre `crm/index.html`, pega la misma dirección, escribe tu clave y toca **Entrar**.
   El navegador la recuerda; toca **Salir** si usas un computador prestado.

Mientras `CRM_URL` esté vacío, el formulario sigue abriendo el correo del visitante como antes.

## Si cambias el código de Apps Script

1. Antes de pegar el código nuevo, copia tu clave (la línea `const CLAVE = "…"`) y vuelve a ponerla después.
2. Guarda y ve a **Implementar > Administrar implementaciones**, toca el lápiz,
   en **Versión** elige **Nueva versión** e **Implementar**. Así la dirección sigue siendo la misma.

La hoja agrega sola las columnas nuevas (por ejemplo `campana`) la próxima vez que se use.

## Para el agente de WhatsApp

El agente guarda a los clientes con la acción `registrar` (necesita la clave):

```json
{ "accion": "registrar", "clave": "…", "cliente": {
  "telefono": "+57 311 222 3344", "nombre": "Ana", "interes": "Vender mi inmueble",
  "origen": "Anuncio TikTok", "campana": "Vende tu casa", "mensaje": "…", "nota": "…" } }
```

Si el teléfono ya existe, no crea otro cliente: le suma la nota arriba del historial y,
si estaba Cerrado o Perdido, lo vuelve a poner como Nuevo. Responde `{ ok, nuevo, cliente }`.

## Editar las respuestas rápidas

Están en `crm/plantillas.js`. Copia un bloque `{ ... }`, cámbiale el título y el texto.
Escribe `{nombre}` donde quieras que aparezca el primer nombre del cliente.

## Archivos

- `index.html`, `crm.css`, `crm.js`: la página del CRM
- `plantillas.js`: respuestas rápidas
- `google-apps-script.gs`: código que va en la hoja de Google

La página del CRM no tiene enlaces desde el sitio ni aparece en buscadores. Tus clientes viven en la hoja
de Google: puedes verlos y editarlos ahí también, sin cambiar los nombres de las columnas.
