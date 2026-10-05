// =====================================================================
//  LISTA DE INMUEBLES DE AMARA HOME
//  Para publicar un inmueble nuevo, copia uno de los bloques { ... },
//  pégalo al final de la lista y cambia sus datos.
//
//  - codigo:        identificador único (ej. "AH-004")
//  - operacion:     "Venta" o "Arriendo"
//  - tipo:          "Apartamento", "Casa", "Lote", "Local", "Oficina", "Bodega"...
//  - ciudad:        "Bogotá", "Chía", "Cajicá", "Mosquera", "Funza"...
//  - sector:        barrio o sector
//  - precio:        solo números, sin puntos (ej. 350000000)
//  - area:          metros cuadrados
//  - habitaciones, banos, parqueaderos: números (0 si no aplica)
//  - fotos:         lista de rutas, ej. ["img/inmuebles/ah-004-1.jpg", "img/inmuebles/ah-004-2.jpg"]
//  - destacado:     true para mostrarlo primero
//  - ejemplo:       true SOLO en los inmuebles de muestra (bórralos al subir los reales)
// =====================================================================

const INMUEBLES = [
  {
    codigo: "AH-001",
    titulo: "Apartamento iluminado con balcón",
    operacion: "Venta",
    tipo: "Apartamento",
    ciudad: "Bogotá",
    sector: "Cedritos",
    precio: 420000000,
    area: 72,
    habitaciones: 3,
    banos: 2,
    parqueaderos: 1,
    descripcion: "Apartamento remodelado, cocina abierta, balcón con vista exterior, conjunto con portería 24 horas, gimnasio y zona BBQ.",
    fotos: [],
    destacado: true,
    ejemplo: true,
  },
  {
    codigo: "AH-002",
    titulo: "Casa campestre con jardín",
    operacion: "Venta",
    tipo: "Casa",
    ciudad: "Chía",
    sector: "Vereda Bojacá",
    precio: 890000000,
    area: 210,
    habitaciones: 4,
    banos: 3,
    parqueaderos: 2,
    descripcion: "Casa en conjunto cerrado, amplio jardín, chimenea, estudio y cuarto de servicio. A 10 minutos del centro de Chía.",
    fotos: [],
    destacado: true,
    ejemplo: true,
  },
  {
    codigo: "AH-003",
    titulo: "Apartaestudio cerca a universidades",
    operacion: "Venta",
    tipo: "Apartamento",
    ciudad: "Bogotá",
    sector: "Chapinero",
    precio: 265000000,
    area: 38,
    habitaciones: 1,
    banos: 1,
    parqueaderos: 0,
    descripcion: "Ideal para inversión o vivienda. Edificio nuevo, cerca a TransMilenio, universidades y zona comercial.",
    fotos: [],
    destacado: false,
    ejemplo: true,
  },
  {
    codigo: "AH-004",
    titulo: "Casa para remodelar con gran potencial",
    operacion: "Venta",
    tipo: "Casa",
    ciudad: "Bogotá",
    sector: "Modelia",
    precio: 610000000,
    area: 160,
    habitaciones: 5,
    banos: 3,
    parqueaderos: 1,
    descripcion: "Casa esquinera de dos pisos, excelente ubicación cerca al aeropuerto. Ofrecemos presupuesto de remodelación.",
    fotos: [],
    destacado: false,
    ejemplo: true,
  },
  {
    codigo: "AH-005",
    titulo: "Lote residencial en conjunto",
    operacion: "Venta",
    tipo: "Lote",
    ciudad: "Cajicá",
    sector: "Capellanía",
    precio: 380000000,
    area: 500,
    habitaciones: 0,
    banos: 0,
    parqueaderos: 0,
    descripcion: "Lote plano con servicios públicos, dentro de conjunto con vías internas y vigilancia.",
    fotos: [],
    destacado: false,
    ejemplo: true,
  },
  {
    codigo: "AH-006",
    titulo: "Local comercial sobre vía principal",
    operacion: "Arriendo",
    tipo: "Local",
    ciudad: "Mosquera",
    sector: "Centro",
    precio: 3500000,
    area: 65,
    habitaciones: 0,
    banos: 1,
    parqueaderos: 0,
    descripcion: "Local en primer piso con alto flujo peatonal y vehicular, vitrina amplia y mezzanine.",
    fotos: [],
    destacado: false,
    ejemplo: true,
  },
];
