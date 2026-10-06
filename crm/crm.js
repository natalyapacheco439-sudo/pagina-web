// CRM de Amara Home: lee y guarda los clientes en la hoja de Google (ver crm/README.md).

const ESTADOS = ["Nuevo", "Contactado", "Visita agendada", "Negociando", "Cerrado", "Perdido"];
const INTERESES = ["Vender mi inmueble", "Comprar un inmueble", "Remodelación", "Otra consulta"];
// De dónde llegó el cliente. Puedes agregar más; la hoja de Google acepta cualquiera.
const ORIGENES = [
  "Anuncio Instagram", "Anuncio Facebook", "Anuncio TikTok",
  "WhatsApp directo", "Instagram", "Facebook", "TikTok",
  "Página web", "Llamada", "Referido", "Otro",
];
const FINALES = ["Cerrado", "Perdido"];
const GUARDADO = "amara-crm";

const $ = (s) => document.querySelector(s);
const esc = (t) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// ===== Fechas (en la hora del equipo) =====
const dosDigitos = (n) => String(n).padStart(2, "0");
const diaISO = (d) => `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
const hoy = () => diaISO(new Date());
const enDias = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return diaISO(d);
};
const ahora = () => `${hoy()} ${dosDigitos(new Date().getHours())}:${dosDigitos(new Date().getMinutes())}`;
const fechaBonita = (iso) => {
  if (!iso) return "";
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
};

// ===== Estado de la app =====
let config = leerConfig();
let clientes = [];
let ejemplo = false;
let abierto = null; // cliente que se está viendo en la ficha

function leerConfig() {
  try {
    return JSON.parse(localStorage.getItem(GUARDADO)) || null;
  } catch {
    return null;
  }
}
function guardarConfig(c) {
  try {
    if (c) localStorage.setItem(GUARDADO, JSON.stringify(c));
    else localStorage.removeItem(GUARDADO);
  } catch {
    // Sin almacenamiento: toca escribir la clave cada vez.
  }
}

// ===== Conexión con la hoja de Google =====
async function api(accion, extra = {}) {
  if (ejemplo) return apiEjemplo(accion, extra);
  const res = await fetch(config.url, {
    method: "POST",
    body: JSON.stringify({ accion, clave: config.clave, ...extra }),
  });
  let r;
  try {
    r = await res.json();
  } catch {
    throw new Error("La dirección no responde como el CRM. Revisa que sea la de la aplicación web (termina en /exec).");
  }
  if (!r.ok) throw new Error(r.error || "Algo salió mal.");
  return r;
}

async function cargar() {
  aviso("Cargando clientes…");
  try {
    clientes = (await api("listar")).clientes;
    aviso("");
    pintar();
    return true;
  } catch (err) {
    aviso(err.message, true);
    return false;
  }
}

function aviso(texto, error = false, el = $("#aviso")) {
  el.textContent = texto;
  el.classList.toggle("aviso--error", error);
}

// ===== Entrada =====
const entradaForm = $("#entrada-form");

entradaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = new FormData(entradaForm);
  config = { url: datos.get("url").trim(), clave: datos.get("clave") };
  ejemplo = false;
  const boton = entradaForm.querySelector("button[type=submit]");
  boton.disabled = true;
  aviso("Conectando…", false, $("#entrada-aviso"));
  mostrarApp();
  if (await cargar()) {
    guardarConfig(config);
  } else {
    const error = $("#aviso").textContent;
    mostrarEntrada();
    aviso(error, true, $("#entrada-aviso"));
  }
  boton.disabled = false;
});

$("#ver-ejemplo").addEventListener("click", () => {
  ejemplo = true;
  clientes = clientesEjemplo();
  mostrarApp();
  pintar();
});

$("#salir").addEventListener("click", () => {
  if (!ejemplo) guardarConfig(null);
  config = null;
  ejemplo = false;
  clientes = [];
  entradaForm.reset();
  aviso("", false, $("#entrada-aviso"));
  mostrarEntrada();
});

function mostrarApp() {
  $("#entrada").hidden = true;
  $("#app").hidden = false;
  $("#modo-ejemplo").hidden = !ejemplo;
}
function mostrarEntrada() {
  $("#app").hidden = true;
  $("#entrada").hidden = false;
}

// ===== Lista =====
const filtros = $("#filtros");
const opciones = (lista) => lista.map((v) => `<option>${esc(v)}</option>`).join("");
filtros.estado.insertAdjacentHTML("beforeend", opciones(ESTADOS));
filtros.interes.insertAdjacentHTML("beforeend", opciones(INTERESES));
filtros.origen.insertAdjacentHTML("beforeend", opciones(ORIGENES));
filtros.addEventListener("input", pintar);
filtros.addEventListener("submit", (e) => e.preventDefault());

document.querySelectorAll(".cifra").forEach((b) =>
  b.addEventListener("click", () => {
    filtros.reset();
    filtros.vista.value = b.dataset.vista;
    pintar();
  })
);

const activo = (c) => !FINALES.includes(c.estado);
const atrasado = (c) => activo(c) && c.seguimiento && c.seguimiento < hoy();
const paraHoy = (c) => activo(c) && c.seguimiento === hoy();

const VISTAS = {
  activos: activo,
  nuevos: (c) => c.estado === "Nuevo",
  atrasados: atrasado,
  hoy: (c) => atrasado(c) || paraHoy(c),
  semana: (c) => activo(c) && c.seguimiento && c.seguimiento <= enDias(7),
  todos: () => true,
};

// Primero los que toca contactar antes; los que no tienen fecha y los cerrados al final.
const orden = (a, b) =>
  activo(b) - activo(a) ||
  (a.seguimiento || "9999").localeCompare(b.seguimiento || "9999") ||
  b.fecha.localeCompare(a.fecha);

function visibles() {
  const f = Object.fromEntries(new FormData(filtros));
  const texto = f.buscar.trim().toLowerCase();
  return clientes
    .filter(VISTAS[f.vista])
    .filter((c) => !f.estado || c.estado === f.estado)
    .filter((c) => !f.interes || c.interes === f.interes)
    .filter((c) => !f.origen || c.origen === f.origen)
    .filter((c) => !texto || [c.nombre, c.telefono, c.correo, c.mensaje, c.notas, c.campana].join(" ").toLowerCase().includes(texto))
    .sort(orden);
}

function etiquetaSeguimiento(c) {
  if (!activo(c) || !c.seguimiento) return "";
  if (atrasado(c)) return `<span class="etiqueta etiqueta--alerta">Atrasado · ${fechaBonita(c.seguimiento)}</span>`;
  if (paraHoy(c)) return `<span class="etiqueta etiqueta--hoy">Hoy</span>`;
  return `<span class="etiqueta">Contactar ${fechaBonita(c.seguimiento)}</span>`;
}

function pintar() {
  $("#n-nuevos").textContent = clientes.filter(VISTAS.nuevos).length;
  $("#n-atrasados").textContent = clientes.filter(atrasado).length;
  $("#n-hoy").textContent = clientes.filter(paraHoy).length;
  $("#n-activos").textContent = clientes.filter(activo).length;
  document.querySelectorAll(".cifra").forEach((b) => b.classList.toggle("cifra--activa", b.dataset.vista === filtros.vista.value));

  const lista = visibles();
  $("#conteo").textContent = lista.length ? `${lista.length} ${lista.length === 1 ? "cliente" : "clientes"}` : "";
  $("#vacio").hidden = lista.length > 0;
  $("#lista").innerHTML = lista
    .map(
      (c) => `
      <button class="tarjeta${activo(c) ? "" : " tarjeta--final"}" data-id="${esc(c.id)}">
        <span class="tarjeta__cabeza">
          <strong>${esc(c.nombre)}</strong>
          <span class="estado estado--${esc(c.estado.toLowerCase().replace(/\s+/g, "-"))}">${esc(c.estado)}</span>
        </span>
        <span class="tarjeta__etiquetas">
          <span class="etiqueta">${esc(c.interes)}</span>
          ${etiquetaSeguimiento(c)}
        </span>
        <span class="tarjeta__mensaje">${esc(c.mensaje || "Sin mensaje")}</span>
        <span class="tarjeta__pie tenue">${esc([c.telefono, c.correo].filter(Boolean).join(" · "))}<span>${esc(c.origen)} · ${fechaBonita(c.fecha)}</span></span>
      </button>`
    )
    .join("");
}

$("#lista").addEventListener("click", (e) => {
  const t = e.target.closest(".tarjeta");
  if (t) abrirFicha(clientes.find((c) => c.id === t.dataset.id));
});

$("#recargar").addEventListener("click", () => (ejemplo ? pintar() : cargar()));

// ===== Ficha del cliente =====
const ficha = $("#ficha");
const fichaForm = $("#ficha-form");
fichaForm.interes.innerHTML = opciones(INTERESES);
fichaForm.estado.innerHTML = opciones(ESTADOS);
const pintarOrigenes = () => (fichaForm.origen.innerHTML = opciones(ORIGENES));

$("#nuevo-cliente").addEventListener("click", () =>
  abrirFicha({ nombre: "", telefono: "", correo: "", interes: INTERESES[0], estado: "Nuevo", origen: ORIGENES[0], seguimiento: hoy(), mensaje: "", notas: "" })
);

function abrirFicha(c) {
  abierto = c;
  fichaForm.reset();
  pintarOrigenes();
  // Un origen que ya no está en la lista se conserva para no cambiarlo al guardar.
  if (c.origen && !ORIGENES.includes(c.origen)) fichaForm.origen.insertAdjacentHTML("beforeend", opciones([c.origen]));
  for (const campo of ["nombre", "telefono", "correo", "interes", "estado", "origen", "seguimiento", "mensaje"]) {
    fichaForm[campo].value = c[campo] || "";
  }
  $("#ficha-titulo").textContent = c.id ? c.nombre : "Nuevo cliente";
  $("#ficha-sub").textContent = c.id ? `Llegó por ${c.origen}${c.campana ? ` (${c.campana})` : ""} el ${fechaBonita(c.fecha)}` : "Regístralo para hacerle seguimiento";
  $("#eliminar").hidden = !c.id;
  pintarHistorial(c.notas);
  pintarPlantillas(c);
  $("#respuesta").value = "";
  aviso("", false, $("#ficha-aviso"));
  ficha.showModal();
}

function pintarHistorial(notas) {
  $("#historial").innerHTML = notas
    ? `<h4>Historial</h4>${notas
        .split("\n")
        .filter(Boolean)
        .map((n) => `<p>${esc(n)}</p>`)
        .join("")}`
    : "";
}

ficha.querySelectorAll("[data-dias]").forEach((b) =>
  b.addEventListener("click", () => {
    fichaForm.seguimiento.value = b.dataset.dias ? enDias(Number(b.dataset.dias)) : "";
  })
);

fichaForm.addEventListener("submit", async (e) => {
  if (e.submitter?.value !== "guardar") return; // la X cierra sin guardar
  e.preventDefault();
  if (await guardar()) ficha.close();
});

// Junta lo escrito en la ficha; la nota nueva va arriba del historial con su fecha.
function datosFicha(notaExtra = "") {
  const f = Object.fromEntries(new FormData(fichaForm));
  const nuevas = [notaExtra, f.nota.trim()].filter(Boolean).map((n) => `[${ahora()}] ${n.replace(/\s*\n\s*/g, " ")}`);
  return {
    ...abierto,
    nombre: f.nombre.trim(),
    telefono: f.telefono.trim(),
    correo: f.correo.trim(),
    interes: f.interes,
    estado: f.estado,
    origen: f.origen,
    seguimiento: f.seguimiento,
    mensaje: f.mensaje,
    notas: [...nuevas, abierto.notas].filter(Boolean).join("\n"),
  };
}

async function guardar(notaExtra) {
  if (!fichaForm.nombre.value.trim()) {
    aviso("Escribe el nombre del cliente.", true, $("#ficha-aviso"));
    fichaForm.nombre.focus();
    return false;
  }
  const boton = $("#guardar");
  boton.disabled = true;
  aviso("Guardando…", false, $("#ficha-aviso"));
  try {
    const { cliente } = await api("guardar", { cliente: datosFicha(notaExtra) });
    const i = clientes.findIndex((c) => c.id === cliente.id);
    if (i >= 0) clientes[i] = cliente;
    else clientes.push(cliente);
    abierto = cliente;
    fichaForm.nota.value = "";
    pintarHistorial(cliente.notas);
    $("#ficha-titulo").textContent = cliente.nombre;
    $("#eliminar").hidden = false;
    aviso("Guardado.", false, $("#ficha-aviso"));
    pintar();
    return true;
  } catch (err) {
    aviso(err.message, true, $("#ficha-aviso"));
    return false;
  } finally {
    boton.disabled = false;
  }
}

$("#eliminar").addEventListener("click", async () => {
  if (!confirm(`¿Eliminar a ${abierto.nombre} del CRM? Esto no se puede deshacer.`)) return;
  try {
    await api("eliminar", { id: abierto.id });
    clientes = clientes.filter((c) => c.id !== abierto.id);
    ficha.close();
    pintar();
  } catch (err) {
    aviso(err.message, true, $("#ficha-aviso"));
  }
});

// ===== Respuestas rápidas =====
const primerNombre = () => fichaForm.nombre.value.trim().split(/\s+/)[0] || "";

function pintarPlantillas(c) {
  const sugeridas = [...PLANTILLAS].sort(
    (a, b) => (b.interes === c.interes) - (a.interes === c.interes)
  );
  $("#plantillas").innerHTML = sugeridas
    .map((p) => `<button type="button" class="chip${p.interes === c.interes ? " chip--sugerida" : ""}" data-titulo="${esc(p.titulo)}">${esc(p.titulo)}</button>`)
    .join("");
}

let plantillaUsada = "";
$("#plantillas").addEventListener("click", (e) => {
  const b = e.target.closest("[data-titulo]");
  if (!b) return;
  const p = PLANTILLAS.find((x) => x.titulo === b.dataset.titulo);
  plantillaUsada = p.titulo;
  $("#respuesta").value = p.texto.replaceAll("{nombre}", primerNombre()).replace(/ ,/g, ",");
});
$("#respuesta").addEventListener("input", () => (plantillaUsada = ""));

// Número para wa.me: solo dígitos y con indicativo 57 si es un celular colombiano.
function numeroWhatsApp(tel) {
  const d = tel.replace(/\D/g, "");
  return d.length === 10 && d.startsWith("3") ? `57${d}` : d;
}

async function registrarRespuesta(medio) {
  if (fichaForm.estado.value === "Nuevo") fichaForm.estado.value = "Contactado";
  if (!fichaForm.seguimiento.value || fichaForm.seguimiento.value <= hoy()) fichaForm.seguimiento.value = enDias(3);
  await guardar(`Respuesta por ${medio}${plantillaUsada ? `: ${plantillaUsada}` : ""}`);
}

$("#enviar-wa").addEventListener("click", () => {
  const texto = $("#respuesta").value.trim();
  const numero = numeroWhatsApp(fichaForm.telefono.value);
  if (!numero) return aviso("Este cliente no tiene teléfono.", true, $("#ficha-aviso"));
  if (!texto) return aviso("Escribe o elige una respuesta.", true, $("#ficha-aviso"));
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  registrarRespuesta("WhatsApp");
});

$("#enviar-correo").addEventListener("click", () => {
  const texto = $("#respuesta").value.trim();
  const correo = fichaForm.correo.value.trim();
  if (!correo) return aviso("Este cliente no tiene correo.", true, $("#ficha-aviso"));
  if (!texto) return aviso("Escribe o elige una respuesta.", true, $("#ficha-aviso"));
  const asunto = `Amara Home - ${fichaForm.interes.value}`;
  window.location.href = `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`;
  registrarRespuesta("correo");
});

$("#copiar").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#respuesta").value);
    aviso("Copiado.", false, $("#ficha-aviso"));
  } catch {
    $("#respuesta").select();
    aviso("Selecciónalo y cópialo con Ctrl+C.", false, $("#ficha-aviso"));
  }
});

// ===== Exportar a Excel (CSV) =====
$("#exportar").addEventListener("click", () => {
  const columnas = [
    ["fecha", "Fecha"], ["nombre", "Nombre"], ["telefono", "Teléfono"], ["correo", "Correo"],
    ["interes", "Interés"], ["estado", "Estado"], ["seguimiento", "Próximo seguimiento"],
    ["origen", "Origen"], ["campana", "Campaña"], ["mensaje", "Mensaje"], ["notas", "Notas"],
  ];
  const celda = (v) => {
    let t = String(v ?? "");
    if (/^[=+\-@]/.test(t) && !/^\+?[\d\s()-]+$/.test(t)) t = `'${t}`; // evita fórmulas, deja teléfonos
    return `"${t.replace(/"/g, '""')}"`;
  };
  const filas = [columnas.map(([, t]) => celda(t)).join(";")].concat(
    visibles().map((c) => columnas.map(([k]) => celda(c[k])).join(";"))
  );
  const archivo = new Blob(["﻿" + filas.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(archivo);
  a.download = `clientes-amara-home-${hoy()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// ===== Modo de ejemplo (sin hoja de Google) =====
function apiEjemplo(accion, extra) {
  if (accion === "listar") return { ok: true, clientes };
  if (accion === "eliminar") return { ok: true, eliminado: true };
  const c = { ...extra.cliente, actualizado: ahora() };
  if (!c.id) Object.assign(c, { id: Math.random().toString(36).slice(2, 10), fecha: ahora() });
  return { ok: true, cliente: c };
}

function clientesEjemplo() {
  const base = { correo: "", notas: "", actualizado: ahora() };
  return [
    { ...base, id: "e1", fecha: `${enDias(0)} 09:12`, nombre: "Laura Gómez", telefono: "3001234567", correo: "laura@ejemplo.com", interes: "Vender mi inmueble", mensaje: "Tengo un apartamento de 72 m² en Suba, 3 habitaciones. Quiero venderlo.", origen: "Página web", estado: "Nuevo", seguimiento: enDias(0) },
    { ...base, id: "e2", fecha: `${enDias(-6)} 16:40`, nombre: "Andrés Rojas", telefono: "3157654321", interes: "Comprar un inmueble", mensaje: "Busco casa en Chía, presupuesto 500 millones.", origen: "Anuncio Instagram", estado: "Contactado", seguimiento: enDias(-2), notas: `[${enDias(-5)} 10:05] Le envié 3 opciones por WhatsApp` },
    { ...base, id: "e3", fecha: `${enDias(-10)} 11:20`, nombre: "Marcela Pinzón", telefono: "3209876543", interes: "Remodelación", mensaje: "Quiero remodelar cocina y dos baños.", origen: "Anuncio TikTok", campana: "Remodela tu cocina", estado: "Visita agendada", seguimiento: enDias(2), notas: `[${enDias(-3)} 15:30] Visita el sábado 10 a. m.` },
    { ...base, id: "e4", fecha: `${enDias(-30)} 08:00`, nombre: "Jorge Medina", telefono: "3112223344", interes: "Vender mi inmueble", mensaje: "Casa en Usaquén.", origen: "Referido", estado: "Cerrado", seguimiento: "", notas: `[${enDias(-2)} 12:00] Firmó contrato de exclusividad` },
  ];
}

// ===== Arranque =====
if (config) {
  mostrarApp();
  cargar().then((ok) => {
    if (!ok) {
      mostrarEntrada();
      entradaForm.url.value = config.url;
      aviso($("#aviso").textContent, true, $("#entrada-aviso"));
    }
  });
} else {
  mostrarEntrada();
}
