/**
 * CRM de Amara Home: código para Google Apps Script.
 *
 * Este archivo se pega en la hoja de Google (Extensiones > Apps Script).
 * Guarda los mensajes del formulario de la página web y le da los datos al CRM.
 * Los pasos completos están en crm/README.md.
 */

// 1. Cambia esta clave por una tuya (solo letras y números, mínimo 8).
//    Es la que vas a escribir en el CRM para entrar. No la compartas.
const CLAVE = "cambia-esta-clave";

// 2. Correo que recibe un aviso cada vez que llega un cliente nuevo desde la página.
//    Déjalo vacío ("") si no quieres avisos.
const AVISAR_A = "amarahome05@gmail.com";

const HOJA = "Clientes";
const COLUMNAS = [
  "id", "fecha", "nombre", "correo", "telefono", "interes", "mensaje",
  "origen", "estado", "seguimiento", "notas", "actualizado",
];
const ESTADOS = ["Nuevo", "Contactado", "Visita agendada", "Negociando", "Cerrado", "Perdido"];
const INTERESES = ["Vender mi inmueble", "Comprar un inmueble", "Remodelación", "Otra consulta"];

/** Ejecútala una vez desde el editor para crear la hoja "Clientes". */
function configurar() {
  hoja_();
  Logger.log("Listo. La hoja \"%s\" está creada.", HOJA);
}

function doGet() {
  return json_({ ok: true, mensaje: "CRM de Amara Home funcionando." });
}

function doPost(e) {
  let datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "Datos inválidos." });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (datos.accion === "nuevo") return json_(nuevoDesdeWeb_(datos.cliente || {}));

    if (CLAVE === "cambia-esta-clave" || CLAVE.length < 8) {
      return json_({ ok: false, error: "Primero cambia la CLAVE en el código de Apps Script." });
    }
    if (datos.clave !== CLAVE) return json_({ ok: false, error: "Clave incorrecta." });

    switch (datos.accion) {
      case "listar": return json_({ ok: true, clientes: listar_() });
      case "guardar": return json_({ ok: true, cliente: guardar_(datos.cliente || {}) });
      case "eliminar": return json_({ ok: true, eliminado: eliminar_(datos.id) });
      default: return json_({ ok: false, error: "Acción desconocida." });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

// ===== Acciones =====

function nuevoDesdeWeb_(c) {
  // Campo trampa: los robots lo llenan, las personas no lo ven.
  if (c.sitio_web) return { ok: true };
  if (!texto_(c.nombre) || (!texto_(c.correo) && !texto_(c.telefono))) {
    return { ok: false, error: "Faltan el nombre y un correo o teléfono." };
  }

  const cliente = {
    id: Utilities.getUuid().slice(0, 8),
    fecha: ahora_(),
    nombre: texto_(c.nombre, 120),
    correo: texto_(c.correo, 120),
    telefono: texto_(c.telefono, 40),
    interes: opcion_(c.interes, INTERESES, "Otra consulta"),
    mensaje: texto_(c.mensaje, 3000),
    origen: "Página web",
    estado: "Nuevo",
    seguimiento: hoy_(),
    notas: "",
    actualizado: ahora_(),
  };
  hoja_().appendRow(fila_(cliente));
  avisar_(cliente);
  return { ok: true };
}

function listar_() {
  const valores = hoja_().getDataRange().getValues();
  return valores.slice(1)
    .filter((f) => f[0] !== "")
    .map((f) => {
      const c = {};
      COLUMNAS.forEach((col, i) => (c[col] = f[i] instanceof Date ? fecha_(f[i]) : String(f[i])));
      return c;
    });
}

function guardar_(c) {
  const hoja = hoja_();
  const datos = {
    nombre: texto_(c.nombre, 120),
    correo: texto_(c.correo, 120),
    telefono: texto_(c.telefono, 40),
    interes: opcion_(c.interes, INTERESES, "Otra consulta"),
    mensaje: texto_(c.mensaje, 3000),
    origen: texto_(c.origen, 40) || "Otro",
    estado: opcion_(c.estado, ESTADOS, "Nuevo"),
    seguimiento: /^\d{4}-\d{2}-\d{2}$/.test(c.seguimiento) ? c.seguimiento : "",
    notas: texto_(c.notas, 20000),
    actualizado: ahora_(),
  };
  if (!datos.nombre) throw new Error("El cliente necesita un nombre.");

  const n = filaDe_(c.id);
  if (n) {
    const actual = {};
    const valores = hoja.getRange(n, 1, 1, COLUMNAS.length).getValues()[0];
    COLUMNAS.forEach((col, i) => (actual[col] = valores[i] instanceof Date ? fecha_(valores[i]) : String(valores[i])));
    const cliente = Object.assign(actual, datos);
    hoja.getRange(n, 1, 1, COLUMNAS.length).setValues([fila_(cliente)]);
    return cliente;
  }

  const cliente = Object.assign({ id: Utilities.getUuid().slice(0, 8), fecha: ahora_() }, datos);
  hoja.appendRow(fila_(cliente));
  return cliente;
}

function eliminar_(id) {
  const n = filaDe_(id);
  if (!n) return false;
  hoja_().deleteRow(n);
  return true;
}

// ===== Ayudantes =====

function hoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA);
    // Todo como texto, para que Sheets no cambie teléfonos ni fechas.
    hoja.getRange(1, 1, hoja.getMaxRows(), COLUMNAS.length).setNumberFormat("@");
    hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]).setFontWeight("bold");
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function filaDe_(id) {
  if (!id) return 0;
  const ids = hoja_().getRange("A:A").getValues();
  for (let i = 1; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 1;
  return 0;
}

// Convierte un cliente en fila. El apóstrofo evita que un texto que empieza con
// = + - @ se ejecute como fórmula (y que "+57..." se vuelva número).
function fila_(c) {
  return COLUMNAS.map((col) => {
    const v = c[col] == null ? "" : String(c[col]);
    return /^[=+\-@]/.test(v) ? "'" + v : v;
  });
}

function texto_(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max || 200);
}

function opcion_(v, lista, porDefecto) {
  return lista.indexOf(v) >= 0 ? v : porDefecto;
}

function ahora_() {
  return Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm");
}

function hoy_() {
  return Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd");
}

function fecha_(d) {
  return Utilities.formatDate(d, "America/Bogota", "yyyy-MM-dd");
}

function avisar_(c) {
  if (!AVISAR_A) return;
  try {
    const correo = {
      to: AVISAR_A,
      subject: `Nuevo cliente en la página: ${c.nombre} (${c.interes})`,
      body:
        `${c.nombre} escribió desde la página web.\n\n` +
        `Interés: ${c.interes}\nCorreo: ${c.correo || "-"}\nTeléfono: ${c.telefono || "-"}\n\n` +
        `Mensaje:\n${c.mensaje || "-"}\n\nRespóndele desde el CRM.`,
    };
    if (c.correo) correo.replyTo = c.correo;
    MailApp.sendEmail(correo);
  } catch (err) {
    // Si el correo falla, el cliente igual queda guardado.
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
