// Respuestas rápidas del CRM de Amara Home.
//
// Para agregar una: copia un bloque { ... }, pégalo al final y cambia el texto.
// - titulo: nombre corto que ves en el botón.
// - interes: a qué clientes se le sugiere primero ("Vender mi inmueble", "Comprar un inmueble",
//   "Remodelación", "Otra consulta") o "Todos".
// - texto: el mensaje. {nombre} se cambia por el primer nombre del cliente.

const PLANTILLAS = [
  {
    titulo: "Saludo inicial",
    interes: "Todos",
    texto:
      "Hola {nombre}, te saluda Amara Home. Recibimos tu mensaje y con gusto te ayudamos. ¿En qué horario te queda bien que te llamemos?",
  },
  {
    titulo: "Vender: pedir datos del inmueble",
    interes: "Vender mi inmueble",
    texto:
      "Hola {nombre}, gracias por pensar en Amara Home para vender tu inmueble. Para darte una asesoría, ¿nos compartes ciudad y localidad, metros cuadrados, habitaciones, baños, parqueaderos, el valor que tienes en mente y algunas fotos?",
  },
  {
    titulo: "Vender: agendar visita",
    interes: "Vender mi inmueble",
    texto:
      "Hola {nombre}, nos gustaría conocer tu inmueble para hacerte una propuesta de venta. ¿Qué día y hora te queda bien para la visita?",
  },
  {
    titulo: "Comprar: qué busca",
    interes: "Comprar un inmueble",
    texto:
      "Hola {nombre}, con gusto te ayudamos a encontrar tu inmueble. ¿En qué zona lo buscas, cuántas habitaciones necesitas y cuál es tu presupuesto aproximado?",
  },
  {
    titulo: "Comprar: agendar visita",
    interes: "Comprar un inmueble",
    texto:
      "Hola {nombre}, el inmueble que te interesa está disponible para visitarlo. ¿Qué día y hora te queda bien?",
  },
  {
    titulo: "Remodelación: pedir detalles",
    interes: "Remodelación",
    texto:
      "Hola {nombre}, gracias por escribirnos para tu remodelación. ¿Nos cuentas qué espacios quieres remodelar, los metros aproximados y nos envías unas fotos de cómo están hoy?",
  },
  {
    titulo: "Seguimiento",
    interes: "Todos",
    texto:
      "Hola {nombre}, te escribimos de Amara Home para saber cómo vas y si tienes alguna pregunta. Seguimos atentos para ayudarte.",
  },
  {
    titulo: "Gracias",
    interes: "Todos",
    texto: "Hola {nombre}, muchas gracias por confiar en Amara Home. Quedamos atentos a lo que necesites.",
  },
];
