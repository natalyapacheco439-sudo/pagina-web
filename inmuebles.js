// =====================================================================
//  INMUEBLES EN VENTA DE AMARA HOME
//  Para publicar un inmueble nuevo, copia uno de los bloques { ... },
//  pégalo al final de la lista y cambia sus datos.
//
//  - ciudad:        "Bogotá", "Chía", "Cajicá", "Mosquera", "Funza"...
//  - localidad:     localidad de Bogotá (ej. "Usaquén", "Suba") o sector del municipio
//  - area:          metros cuadrados (solo el número)
//  - habitaciones, banos, parqueaderos: números (0 si no tiene)
//  - descripcion:   descripción corta
//  - valor:         solo números, sin puntos ni signos (ej. 420000000)
//  - fotos:         rutas de las fotos, ej. ["img/inmuebles/usaquen-1.jpg", "img/inmuebles/usaquen-2.jpg"]
//                   la primera foto es la que se ve en la tarjeta
//  - destacado:     true para mostrarlo primero (opcional)
//  - ejemplo:       true SOLO en los inmuebles de muestra (bórralos al subir los reales)
//
//  El código de cada inmueble (AH-001, AH-002…) se asigna solo, según el orden de la lista.
// =====================================================================

const INMUEBLES = [
  {
    ciudad: "Bogotá",
    localidad: "Usaquén",
    area: 72,
    habitaciones: 3,
    banos: 2,
    parqueaderos: 1,
    descripcion: "Apartamento remodelado con balcón y cocina abierta. Conjunto con portería 24 horas, gimnasio y zona BBQ.",
    valor: 420000000,
    fotos: [],
    destacado: true,
    ejemplo: true,
  },
  {
    ciudad: "Chía",
    localidad: "Vereda Fagua",
    area: 210,
    habitaciones: 4,
    banos: 3,
    parqueaderos: 2,
    descripcion: "Casa en conjunto cerrado con jardín amplio, chimenea, estudio y cuarto de servicio.",
    valor: 890000000,
    fotos: [],
    destacado: true,
    ejemplo: true,
  },
  {
    ciudad: "Bogotá",
    localidad: "Chapinero",
    area: 38,
    habitaciones: 1,
    banos: 1,
    parqueaderos: 0,
    descripcion: "Apartaestudio en edificio nuevo, cerca a universidades, TransMilenio y zona comercial. Ideal para inversión.",
    valor: 265000000,
    fotos: [],
    ejemplo: true,
  },
  {
    ciudad: "Bogotá",
    localidad: "Suba",
    area: 95,
    habitaciones: 3,
    banos: 2,
    parqueaderos: 1,
    descripcion: "Apartamento exterior de 3 habitaciones con estudio, piso 6, conjunto con piscina y parque infantil.",
    valor: 480000000,
    fotos: [],
    ejemplo: true,
  },
  {
    ciudad: "Bogotá",
    localidad: "Kennedy",
    area: 160,
    habitaciones: 5,
    banos: 3,
    parqueaderos: 1,
    descripcion: "Casa esquinera de dos pisos con local comercial en el primer piso. Buena opción para vivir y rentar.",
    valor: 610000000,
    fotos: [],
    ejemplo: true,
  },
  {
    ciudad: "Mosquera",
    localidad: "Centro",
    area: 58,
    habitaciones: 2,
    banos: 2,
    parqueaderos: 1,
    descripcion: "Apartamento para estrenar en conjunto con zonas verdes, salón comunal y parqueadero cubierto.",
    valor: 235000000,
    fotos: [],
    ejemplo: true,
  },
];

// Código automático según el orden de la lista
INMUEBLES.forEach((inmueble, n) => {
  inmueble.codigo = "AH-" + String(n + 1).padStart(3, "0");
});
