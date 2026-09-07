export const regions = [
  {
    id: 'maipu',
    name: 'Maipú',
    subtitle: 'Donde comenzó nuestra historia',
    description: 'Olivos centenarios, bodegas históricas y el sabor de nuestras raíces.',
    image: 'photo-1504279577054-acfeccf8fc52',
  },
  {
    id: 'lujan',
    name: 'Luján de Cuyo',
    subtitle: 'La tierra del Malbec',
    description: 'Grandes etiquetas, arquitectura singular y viñedos al pie de los Andes.',
    image: 'photo-1510812431401-41d2bd2722f3',
  },
  {
    id: 'uco',
    name: 'Valle de Uco',
    subtitle: 'Vinos que tocan el cielo',
    description: 'La inmensidad de la montaña y la expresión más pura del vino de altura.',
    image: 'photo-1464822759023-fed622ff2c3b',
  },
];
export const wineriesSeed = [
  {
    name: 'Casa Vigil (El Enemigo)',
    region: 'Maipú',
    lat: -32.9904,
    lng: -68.7845,
    tier: 'icon',
    experience: 'lunch_5_steps',
    price: 120,
  },
  {
    name: 'Bodega Trapiche',
    region: 'Maipú',
    lat: -32.9734,
    lng: -68.7909,
    tier: 'premium',
    experience: 'tasting',
    price: 45,
  },
  {
    name: 'Familia Zuccardi (Santa Julia)',
    region: 'Maipú',
    lat: -33.0238,
    lng: -68.6186,
    tier: 'standard',
    experience: 'lunch_3_steps',
    price: 65,
  },
  {
    name: 'Catena Zapata',
    region: 'Luján de Cuyo',
    lat: -33.1258,
    lng: -68.9328,
    tier: 'icon',
    experience: 'tasting',
    price: 150,
  },
  {
    name: 'Susana Balbo Wines',
    region: 'Luján de Cuyo',
    lat: -33.1091,
    lng: -68.9315,
    tier: 'premium',
    experience: 'lunch_5_steps',
    price: 110,
  },
  {
    name: 'Bodega Norton',
    region: 'Luján de Cuyo',
    lat: -33.0903,
    lng: -68.9042,
    tier: 'standard',
    experience: 'tasting',
    price: 40,
  },
  {
    name: 'Zuccardi Valle de Uco (Piedra Infinita)',
    region: 'Valle de Uco',
    lat: -33.6841,
    lng: -69.2458,
    tier: 'icon',
    experience: 'lunch_5_steps',
    price: 180,
  },
  {
    name: 'Bodegas Salentein',
    region: 'Valle de Uco',
    lat: -33.5042,
    lng: -69.2155,
    tier: 'premium',
    experience: 'tasting',
    price: 60,
  },
  {
    name: 'Domaine Bousquet',
    region: 'Valle de Uco',
    lat: -33.4356,
    lng: -69.2078,
    tier: 'standard',
    experience: 'lunch_3_steps',
    price: 75,
  },
];
export const wineries = wineriesSeed.map((w, i) => ({ ...w, id: i + 1 }));
export type Winery = (typeof wineries)[number];
export const experienceLabels: Record<string, string> = {
  tasting: 'Visita y degustación',
  lunch_3_steps: 'Almuerzo de 3 pasos',
  lunch_5_steps: 'Almuerzo de 5 pasos',
};
export const combos = [
  {
    id: 'esencia',
    name: 'Esencia de Mendoza',
    days: 1,
    region: 'Luján de Cuyo',
    tagline: 'Un primer encuentro inolvidable.',
    image: 'photo-1510812431401-41d2bd2722f3',
    items: [
      { day: 1, wineryId: 4 },
      { day: 1, wineryId: 5 },
    ],
    label: 'EL FAVORITO',
    description: 'Catena Zapata y Susana Balbo. Degustación y almuerzo de 5 pasos con maridaje.',
  },
  {
    id: 'origen',
    name: 'Entre viñas y sabores',
    days: 2,
    region: 'Maipú · Luján de Cuyo',
    tagline: 'Dos días para saborear el origen.',
    image: 'photo-1414235077428-338989a2e8c0',
    items: [
      { day: 1, wineryId: 1 },
      { day: 1, wineryId: 2 },
      { day: 2, wineryId: 4 },
      { day: 2, wineryId: 5 },
    ],
    label: 'VINO & GASTRONOMÍA',
    description:
      'Casa Vigil, Trapiche, Catena Zapata y Susana Balbo. Dos almuerzos de 5 pasos con maridaje.',
  },
  {
    id: 'andes',
    name: 'La trilogía del terroir',
    days: 3,
    region: 'Las tres regiones',
    tagline: 'Mendoza, en toda su expresión.',
    image: 'photo-1464822759023-fed622ff2c3b',
    items: [
      { day: 1, wineryId: 1 },
      { day: 1, wineryId: 2 },
      { day: 2, wineryId: 4 },
      { day: 2, wineryId: 5 },
      { day: 3, wineryId: 7 },
      { day: 3, wineryId: 8 },
    ],
    label: 'LA EXPERIENCIA COMPLETA',
    description:
      'Las cuatro bodegas del recorrido de 2 días, más Piedra Infinita y Salentein. Tres almuerzos de 5 pasos.',
  },
];
export const policy =
  'Confirmación final sujeta a disponibilidad real. En caso de falta de cupo, se ofrecerá reemplazo de igual/superior categoría en la zona';
const bundledImages = new Set([
  'photo-1504279577054-acfeccf8fc52',
  'photo-1510812431401-41d2bd2722f3',
  'photo-1464822759023-fed622ff2c3b',
  'photo-1414235077428-338989a2e8c0',
]);
export const photo = (id: string, width = 1400) =>
  id.startsWith('https://')
    ? id
    : bundledImages.has(id)
      ? `/images/${id}.jpg`
      : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
