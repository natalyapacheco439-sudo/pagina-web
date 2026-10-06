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
  "origen", "estado", "seguimiento", "notas", "actualizado", "campana",
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
      case "registrar": return json_(Object.assign({ ok: true }, registrar_(datos.cliente || {})));
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
      COLUMNAS.forEach((col, i) => (c[col] = f[i] instanceof Date ? fecha_(f[i]) : String(f[i] == null ? "" : f[i])));
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
    const cliente = Object.assign(leerFila_(hoja, n), datos);
    hoja.getRange(n, 1, 1, COLUMNAS.length).setValues([fila_(cliente)]);
    return cliente;
  }

  const cliente = Object.assign({ id: Utilities.getUuid().slice(0, 8), fecha: ahora_() }, datos);
  hoja.appendRow(fila_(cliente));
  return cliente;
}

// Para el agente de WhatsApp: si el teléfono ya está, actualiza al cliente y le suma la nota;
// si no, lo crea como "Nuevo" para contactar hoy.
function registrar_(c) {
  const telefono = texto_(c.telefono, 40);
  if (!telefono) throw new Error("Falta el teléfono.");
  const hoja = hoja_();
  const nota = texto_(c.nota, 3000);
  const n = filaDeTelefono_(telefono);

  if (n) {
    const cliente = leerFila_(hoja, n);
    if (texto_(c.nombre) && !cliente.nombre) cliente.nombre = texto_(c.nombre, 120);
    if (texto_(c.correo) && !cliente.correo) cliente.correo = texto_(c.correo, 120);
    if (INTERESES.indexOf(c.interes) >= 0) cliente.interes = c.interes;
    if (texto_(c.campana)) cliente.campana = texto_(c.campana, 200);
    if (["Cerrado", "Perdido"].indexOf(cliente.estado) >= 0) cliente.estado = "Nuevo";
    if (!cliente.seguimiento) cliente.seguimiento = hoy_();
    if (nota) cliente.notas = `[${ahora_()}] ${nota}` + (cliente.notas ? "\n" + cliente.notas : "");
    cliente.actualizado = ahora_();
    hoja.getRange(n, 1, 1, COLUMNAS.length).setValues([fila_(cliente)]);
    return { nuevo: false, cliente: cliente };
  }

  const cliente = {
    id: Utilities.getUuid().slice(0, 8),
    fecha: ahora_(),
    nombre: texto_(c.nombre, 120) || "Sin nombre",
    correo: texto_(c.correo, 120),
    telefono: telefono,
    interes: opcion_(c.interes, INTERESES, "Otra consulta"),
    mensaje: texto_(c.mensaje, 3000),
    origen: texto_(c.origen, 40) || "WhatsApp directo",
    estado: "Nuevo",
    seguimiento: hoy_(),
    notas: nota ? `[${ahora_()}] ${nota}` : "",
    actualizado: ahora_(),
    campana: texto_(c.campana, 200),
  };
  hoja.appendRow(fila_(cliente));
  avisar_(cliente);
  return { nuevo: true, cliente: cliente };
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
    hoja.setFrozenRows(1);
  }
  // Crea los títulos, y agrega los de columnas nuevas si el código se actualizó.
  const titulos = hoja.getRange(1, 1, 1, COLUMNAS.length);
  if (titulos.getValues()[0].join() !== COLUMNAS.join()) {
    // Todo como texto, para que Sheets no cambie teléfonos ni fechas.
    hoja.getRange(1, 1, hoja.getMaxRows(), COLUMNAS.length).setNumberFormat("@");
    titulos.setValues([COLUMNAS]).setFontWeight("bold");
  }
  return hoja;
}

function leerFila_(hoja, n) {
  const valores = hoja.getRange(n, 1, 1, COLUMNAS.length).getValues()[0];
  const c = {};
  COLUMNAS.forEach((col, i) => (c[col] = valores[i] instanceof Date ? fecha_(valores[i]) : String(valores[i])));
  return c;
}

// Compara los últimos 10 dígitos, para que "+57 311…" y "311…" sean el mismo número.
function filaDeTelefono_(telefono) {
  const buscado = String(telefono).replace(/\D/g, "").slice(-10);
  if (buscado.length < 7) return 0;
  const col = COLUMNAS.indexOf("telefono") + 1;
  const hoja = hoja_();
  const tels = hoja.getRange(1, col, hoja.getLastRow(), 1).getValues();
  for (let i = 1; i < tels.length; i++) {
    if (String(tels[i][0]).replace(/\D/g, "").slice(-10) === buscado) return i + 1;
  }
  return 0;
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
      subject: `Nuevo cliente (${c.origen}): ${c.nombre} - ${c.interes}`,
      body:
        `${c.nombre} llegó por ${c.origen}${c.campana ? " (" + c.campana + ")" : ""}.\n\n` +
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
