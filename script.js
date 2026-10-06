// ===== Datos de contacto (cámbialos aquí) =====
const WHATSAPP = "573112785802"; // número con indicativo 57, sin + ni espacios
const EMAIL_DESTINO = "amarahome05@gmail.com";
// Dirección de la aplicación web de Google Apps Script (ver crm/README.md).
// Mientras esté vacía, el formulario abre el correo del visitante como antes.
const CRM_URL = "";

// Menú para celulares
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});

nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Año actual en el pie de página
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Utilidades =====
const formatoPrecio = (n) => "$" + n.toLocaleString("es-CO");
const escapar = (t) =>
  String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const enlaceWhatsApp = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
const ubicacion = (i) => `${i.localidad}, ${i.ciudad}`;
const mensajeInteres = (i) =>
  `Hola Amara Home, me interesa el inmueble ${i.codigo} en ${ubicacion(i)} (${formatoPrecio(i.valor)}). ¿Me pueden dar más información?`;

const ICONO_CASA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z"/></svg>';

document.querySelectorAll("[data-whatsapp]").forEach(
  (a) => (a.href = enlaceWhatsApp("Hola Amara Home, quisiera más información."))
);

// ===== Catálogo de inmuebles =====
const listings = document.getElementById("listings");
const filters = document.getElementById("filters");
const resultsCount = document.getElementById("results-count");

// Llena los selectores de ciudad y localidad con los valores de la lista
const valoresUnicos = (lista, campo) => [...new Set(lista.map((i) => i[campo]))].sort((a, b) => a.localeCompare(b, "es"));
const opciones = (valores) => valores.map((v) => `<option value="${escapar(v)}">${escapar(v)}</option>`).join("");

function llenarCiudades(select) {
  select.insertAdjacentHTML("beforeend", opciones(valoresUnicos(INMUEBLES, "ciudad")));
}
function llenarLocalidades(select, ciudad) {
  const actual = select.value;
  const lista = ciudad ? INMUEBLES.filter((i) => i.ciudad === ciudad) : INMUEBLES;
  select.innerHTML = '<option value="">Todas</option>' + opciones(valoresUnicos(lista, "localidad"));
  select.value = [...select.options].some((o) => o.value === actual) ? actual : "";
}
document.querySelectorAll('select[name="ciudad"]').forEach(llenarCiudades);
document.querySelectorAll("form").forEach((form) => {
  if (!form.elements.localidad) return;
  llenarLocalidades(form.elements.localidad, "");
  form.elements.ciudad.addEventListener("change", () => llenarLocalidades(form.elements.localidad, form.elements.ciudad.value));
});

function caracteristicas(i) {
  const datos = [`${i.area} m²`];
  if (i.habitaciones) datos.push(`${i.habitaciones} hab.`);
  if (i.banos) datos.push(`${i.banos} baño${i.banos > 1 ? "s" : ""}`);
  if (i.parqueaderos) datos.push(`${i.parqueaderos} parq.`);
  return datos;
}

function foto(i, indice = 0) {
  return i.fotos && i.fotos[indice]
    ? `<img src="${escapar(i.fotos[indice])}" alt="Inmueble en ${escapar(ubicacion(i))}" loading="lazy">`
    : `<div class="photo-placeholder">${ICONO_CASA}<span>Foto próximamente</span></div>`;
}

const precioHTML = (i) => `<p class="listing__price">${formatoPrecio(i.valor)}</p>`;
const caracteristicasHTML = (i) =>
  `<ul class="listing__features">${caracteristicas(i).map((c) => `<li>${c}</li>`).join("")}</ul>`;

function tarjeta(i) {
  return `
    <article class="listing">
      <button class="listing__open" data-codigo="${escapar(i.codigo)}" aria-label="Ver detalles del inmueble en ${escapar(ubicacion(i))}">
        <div class="listing__photo">
          ${foto(i)}
          <span class="badge">En venta</span>
          <span class="listing__price-tag">${formatoPrecio(i.valor)}</span>
          ${i.ejemplo ? '<span class="badge badge--sample">Ejemplo</span>' : ""}
        </div>
        <div class="listing__body">
          <h3>${escapar(ubicacion(i))}</h3>
          ${caracteristicasHTML(i)}
          <p class="listing__desc">${escapar(i.descripcion)}</p>
        </div>
      </button>
      <a class="listing__whatsapp" href="${enlaceWhatsApp(mensajeInteres(i))}" target="_blank" rel="noopener">Me interesa · ${escapar(i.codigo)}</a>
    </article>`;
}

function mostrarInmuebles() {
  const f = Object.fromEntries(new FormData(filters));
  const texto = (f.texto || "").trim().toLowerCase();
  const lista = INMUEBLES.filter(
    (i) =>
      (!f.ciudad || i.ciudad === f.ciudad) &&
      (!f.localidad || i.localidad === f.localidad) &&
      (!f.habitaciones || i.habitaciones >= Number(f.habitaciones)) &&
      (!f.precioMax || i.valor <= Number(f.precioMax)) &&
      (!texto || [i.codigo, i.localidad, i.ciudad, i.descripcion].join(" ").toLowerCase().includes(texto))
  ).sort((a, b) => Boolean(b.destacado) - Boolean(a.destacado));

  resultsCount.textContent = `${lista.length} inmueble${lista.length === 1 ? "" : "s"} en venta`;
  actualizarMapa(lista);
  listings.innerHTML = lista.length
    ? lista.map(tarjeta).join("")
    : `<p class="listings__empty">No encontramos inmuebles con esos filtros. <a href="${enlaceWhatsApp("Hola Amara Home, estoy buscando un inmueble y quisiera asesoría.")}" target="_blank" rel="noopener">Escríbenos</a> y te ayudamos a buscar.</p>`;
}

// ===== Mapa de inmuebles =====
const mapWrap = document.getElementById("map-wrap");
const botonLista = document.getElementById("ver-lista");
const botonMapa = document.getElementById("ver-mapa");
let mapa = null;
let capaMarcadores = null;
let ultimaLista = [];

// Punto del inmueble: el exacto si lo tiene; si no, el centro de su localidad o municipio
function coordenadas(i) {
  if (Array.isArray(i.ubicacion)) return i.ubicacion;
  if (i.ciudad === "Bogotá" && LOCALIDADES_BOGOTA[i.localidad]) return LOCALIDADES_BOGOTA[i.localidad];
  return MUNICIPIOS[i.ciudad] || null;
}

// Separa un poco los inmuebles que caen en el mismo punto para que no se tapen
function puntosSeparados(lista) {
  const usados = {};
  return lista
    .map((i) => {
      const base = coordenadas(i);
      if (!base) return null;
      if (Array.isArray(i.ubicacion)) return [i, base];
      const clave = base.join(",");
      const n = (usados[clave] = (usados[clave] || 0) + 1) - 1;
      if (n === 0) return [i, base];
      const angulo = n * 2.4;
      const radio = 0.0045 * Math.sqrt(n);
      return [i, [base[0] + radio * Math.sin(angulo), base[1] + radio * Math.cos(angulo)]];
    })
    .filter(Boolean);
}

const precioCorto = (v) =>
  v >= 1e9 ? `$${(v / 1e9).toLocaleString("es-CO", { maximumFractionDigits: 2 })} mil M` : `$${Math.round(v / 1e6)} M`;

function crearMapa() {
  if (mapa || !window.L) return;
  mapa = L.map("mapa", { scrollWheelZoom: false }).setView([4.68, -74.09], 11);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 18,
    subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(mapa);
  capaMarcadores = L.layerGroup().addTo(mapa);
  mapa.getContainer().addEventListener("click", (e) => {
    const boton = e.target.closest("[data-detalle]");
    if (boton) abrirDetalle(boton.dataset.detalle);
  });
}

function actualizarMapa(lista) {
  ultimaLista = lista;
  if (!mapa) return;
  capaMarcadores.clearLayers();
  const puntos = puntosSeparados(lista);
  puntos.forEach(([i, punto]) => {
    const icono = L.divIcon({
      className: "map-pin",
      html: `<span>${precioCorto(i.valor)}</span>`,
      iconSize: null,
    });
    L.marker(punto, { icon: icono, title: `${ubicacion(i)} · ${formatoPrecio(i.valor)}` })
      .bindPopup(
        `<div class="map-popup">
          <div class="map-popup__photo">${foto(i)}</div>
          <p class="listing__price">${formatoPrecio(i.valor)}</p>
          <h3>${escapar(ubicacion(i))}</h3>
          <p class="map-popup__features">${caracteristicas(i).join(" · ")}</p>
          <button type="button" class="btn btn--small" data-detalle="${escapar(i.codigo)}">Ver detalles</button>
        </div>`,
        { maxWidth: 240, minWidth: 220 }
      )
      .addTo(capaMarcadores);
  });
  if (puntos.length) mapa.fitBounds(L.latLngBounds(puntos.map((p) => p[1])), { padding: [50, 50], maxZoom: 13 });
}

function cambiarVista(verMapa) {
  mapWrap.hidden = !verMapa;
  listings.hidden = verMapa;
  botonMapa.setAttribute("aria-pressed", verMapa);
  botonLista.setAttribute("aria-pressed", !verMapa);
  if (verMapa) {
    crearMapa();
    if (mapa) {
      mapa.invalidateSize();
      actualizarMapa(ultimaLista);
    }
  }
}
botonLista.addEventListener("click", () => cambiarVista(false));
botonMapa.addEventListener("click", () => cambiarVista(true));

filters.addEventListener("input", mostrarInmuebles);
filters.addEventListener("submit", (e) => e.preventDefault());
mostrarInmuebles();

// Buscador de la portada: copia los filtros al catálogo y baja a los resultados
document.getElementById("hero-search").addEventListener("submit", (e) => {
  e.preventDefault();
  const datos = new FormData(e.target);
  filters.reset();
  filters.elements.ciudad.value = datos.get("ciudad");
  llenarLocalidades(filters.elements.localidad, datos.get("ciudad"));
  filters.elements.localidad.value = datos.get("localidad");
  filters.elements.habitaciones.value = datos.get("habitaciones");
  mostrarInmuebles();
  document.getElementById("inmuebles").scrollIntoView({ behavior: "smooth" });
});

// ===== Detalle del inmueble (ventana emergente) =====
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");

function abrirDetalle(codigo) {
  const i = INMUEBLES.find((x) => x.codigo === codigo);
  if (!i) return;
  const fotos = i.fotos || [];
  modalBody.innerHTML = `
    <div class="modal__gallery">
      <div class="modal__main">${foto(i)}</div>
      ${fotos.length > 1 ? `<div class="modal__thumbs">${fotos.map((src, n) => `<button data-n="${n}"><img src="${escapar(src)}" alt="Foto ${n + 1}"></button>`).join("")}</div>` : ""}
    </div>
    <div class="modal__info">
      <p class="eyebrow">En venta · Código ${escapar(i.codigo)}</p>
      <h2 id="modal-title">${escapar(ubicacion(i))}</h2>
      ${precioHTML(i)}
      ${caracteristicasHTML(i)}
      <p>${escapar(i.descripcion)}</p>
      <a class="btn btn--whatsapp" href="${enlaceWhatsApp(mensajeInteres(i))}" target="_blank" rel="noopener">Preguntar por WhatsApp</a>
    </div>`;
  modalBody.querySelectorAll(".modal__thumbs button").forEach((b) =>
    b.addEventListener("click", () => {
      modalBody.querySelector(".modal__main").innerHTML = foto(i, Number(b.dataset.n));
    })
  );
  if (mapa) mapa.closePopup();
  modal.showModal();
}

listings.addEventListener("click", (e) => {
  const boton = e.target.closest(".listing__open");
  if (boton) abrirDetalle(boton.dataset.codigo);
});
document.getElementById("modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});

// Botones que llevan al formulario con una opción ya elegida
document.querySelectorAll("[data-interes]").forEach((a) =>
  a.addEventListener("click", () => {
    document.querySelector('#contact-form [name="interes"]').value = a.dataset.interes;
  })
);

// Aparición suave de las secciones al hacer scroll
const revealables = document.querySelectorAll(".section__head, .card, .quote, .split > *, .cta__inner");
revealables.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }),
  { threshold: 0.15 }
);
revealables.forEach((el) => observer.observe(el));

// Formulario: guarda el mensaje en el CRM; si no se puede, abre el correo del visitante
const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");

const abrirCorreo = (data) => {
  const asunto = encodeURIComponent(`${data.get("interes")} - ${data.get("nombre")}`);
  const cuerpo = encodeURIComponent(
    `${data.get("mensaje")}\n\nNombre: ${data.get("nombre")}\nCorreo: ${data.get("correo")}\nTeléfono: ${data.get("telefono") || "-"}`
  );
  window.location.href = `mailto:${EMAIL_DESTINO}?subject=${asunto}&body=${cuerpo}`;
  note.textContent = "¡Gracias! Se abrirá tu aplicación de correo para enviar el mensaje.";
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  if (!CRM_URL) {
    abrirCorreo(data);
    form.reset();
    return;
  }

  const boton = form.querySelector('button[type="submit"]');
  boton.disabled = true;
  note.textContent = "Enviando…";
  try {
    const res = await fetch(CRM_URL, {
      method: "POST",
      body: JSON.stringify({ accion: "nuevo", cliente: Object.fromEntries(data) }),
    });
    const r = await res.json();
    if (!r.ok) throw new Error(r.error);
    note.textContent = "¡Gracias! Recibimos tu mensaje y te contactaremos muy pronto.";
    form.reset();
  } catch (err) {
    abrirCorreo(data);
    form.reset();
  } finally {
    boton.disabled = false;
  }
});
