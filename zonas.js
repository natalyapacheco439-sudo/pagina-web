// =====================================================================
//  UBICACIÓN APROXIMADA DE CADA LOCALIDAD Y MUNICIPIO
//  El mapa ubica cada inmueble en el centro de su localidad (Bogotá) o de
//  su municipio. Así se muestra la zona sin revelar la dirección exacta.
//  Si un inmueble necesita un punto más preciso, agrégale
//  ubicacion: [latitud, longitud] en inmuebles.js (se copia de Google Maps
//  dando clic derecho sobre el lugar).
// =====================================================================

const LOCALIDADES_BOGOTA = {
  "Usaquén": [4.7186, -74.0310],
  "Chapinero": [4.6480, -74.0610],
  "Santa Fe": [4.6080, -74.0640],
  "San Cristóbal": [4.5620, -74.0870],
  "Usme": [4.5020, -74.1140],
  "Tunjuelito": [4.5760, -74.1370],
  "Bosa": [4.6190, -74.1920],
  "Kennedy": [4.6300, -74.1530],
  "Fontibón": [4.6720, -74.1450],
  "Engativá": [4.7070, -74.1110],
  "Suba": [4.7420, -74.0840],
  "Barrios Unidos": [4.6680, -74.0750],
  "Teusaquillo": [4.6400, -74.0880],
  "Los Mártires": [4.6050, -74.0900],
  "Antonio Nariño": [4.5900, -74.1000],
  "Puente Aranda": [4.6150, -74.1150],
  "La Candelaria": [4.5970, -74.0730],
  "Rafael Uribe Uribe": [4.5720, -74.1170],
  "Ciudad Bolívar": [4.5520, -74.1520],
};

const MUNICIPIOS = {
  "Bogotá": [4.6510, -74.0950],
  "Chía": [4.8610, -74.0580],
  "Cajicá": [4.9180, -74.0280],
  "Zipaquirá": [5.0220, -73.9930],
  "Cota": [4.8090, -74.1030],
  "Funza": [4.7160, -74.2110],
  "Mosquera": [4.7060, -74.2300],
  "Madrid": [4.7330, -74.2640],
  "Soacha": [4.5790, -74.2170],
  "Sopó": [4.9080, -73.9400],
  "La Calera": [4.7210, -73.9690],
  "Tocancipá": [4.9650, -73.9130],
  "Tenjo": [4.8720, -74.1440],
  "Tabio": [4.9170, -74.0980],
  "Facatativá": [4.8140, -74.3550],
  "Gachancipá": [4.9910, -73.8730],
  "Sibaté": [4.4910, -74.2600],
};
