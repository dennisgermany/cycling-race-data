/**
 * Categorised climbs (GPM) read from the stage profile graphics shipped with the app
 * (`apps/web/public/profiles/giro-d-italia-2026/stage-N-profile.jpg`, via cyclingstage.com).
 *
 * Used by `scripts/build-giro-route-features.mjs` as the canonical list of climb names,
 * summit distances (km), and UCI categories for every stage. Stages with no GPM on the
 * profile use an empty array (flat stages / ITT).
 */

/** @typedef {{ name: string, distanceKm: number, category: number }} ProfileClimb */

/** @type {Record<number, ProfileClimb[]>} */
export const giroItalia2026ProfileClimbsByStageNum = {
  1: [{ name: 'BURGAS LAKE', distanceKm: 61.4, category: 4 }],
  2: [
    { name: 'BYALA PASS', distanceKm: 117.4, category: 3 },
    { name: 'VRATNIK PASS', distanceKm: 135.2, category: 3 },
    { name: 'LYASKOVETS MONASTERY PASS', distanceKm: 211.7, category: 3 },
  ],
  3: [{ name: 'BOROVEC PASS', distanceKm: 102.9, category: 2 }],
  4: [{ name: 'COZZO TUNNO', distanceKm: 101.0, category: 2 }],
  5: [
    { name: 'PRESTIERI', distanceKm: 27.3, category: 3 },
    { name: 'MONTAGNA GRANDE DI VIGGIANO', distanceKm: 154.2, category: 2 },
  ],
  6: [{ name: 'FUORIGROTTA', distanceKm: 153.7, category: 4 }],
  7: [
    { name: 'ROCCARASO', distanceKm: 168.3, category: 2 },
    { name: 'BLOCKHAUS', distanceKm: 246.0, category: 1 },
  ],
  8: [
    { name: "MONTEFIORE D'ASO", distanceKm: 108.4, category: 3 },
    { name: 'MONTERUBBIANO', distanceKm: 120.3, category: 4 },
    { name: 'CAPODARCO', distanceKm: 152.0, category: 4 },
    { name: 'FERMO', distanceKm: 159.0, category: 4 },
  ],
  9: [
    { name: 'QUERCIOLA', distanceKm: 167.5, category: 3 },
    { name: 'CORNO ALLE SCALE', distanceKm: 184.0, category: 1 },
  ],
  10: [],
  11: [
    { name: 'PASSO DEL TERMINE', distanceKm: 113.3, category: 3 },
    { name: 'COLLE DI GUAITAROLA', distanceKm: 133.1, category: 2 },
    { name: 'SAN BARTOLOMEO', distanceKm: 169.0, category: 3 },
  ],
  12: [
    { name: 'COLLE GIOVO', distanceKm: 107.8, category: 3 },
    { name: 'BRIC BERTON', distanceKm: 123.2, category: 3 },
  ],
  13: [
    { name: 'BIENO', distanceKm: 164.9, category: 4 },
    { name: 'UNGIASCA', distanceKm: 172.9, category: 3 },
  ],
  14: [
    { name: 'SAINT-BARTHÉLÉMY', distanceKm: 20.3, category: 1 },
    { name: 'DOUES', distanceKm: 61.8, category: 3 },
    { name: 'LIN NOIR', distanceKm: 82.3, category: 1 },
    { name: 'VERRONGNE', distanceKm: 92.1, category: 2 },
    { name: 'PILA', distanceKm: 133.0, category: 1 },
  ],
  15: [],
  16: [
    { name: 'TORRE', distanceKm: 32.2, category: 3 },
    { name: 'LEONTICA', distanceKm: 43.5, category: 2 },
    { name: 'TORRE', distanceKm: 54.2, category: 3 },
    { name: 'LEONTICA', distanceKm: 65.5, category: 2 },
    { name: 'CARÌ', distanceKm: 113.0, category: 1 },
  ],
  17: [
    { name: 'PASSO DEI TRE TERMINI', distanceKm: 62.4, category: 3 },
    { name: 'COCCA DI LODRINO', distanceKm: 86.6, category: 3 },
    { name: 'ANDALO', distanceKm: 200.0, category: 3 },
  ],
  18: [
    { name: 'FASTRO', distanceKm: 83.4, category: 3 },
    { name: "MURO DI CA' DEL POGGIO", distanceKm: 156.7, category: 4 },
  ],
  19: [
    { name: 'PASSO DURAN', distanceKm: 58.7, category: 1 },
    { name: 'COI', distanceKm: 72.9, category: 2 },
    { name: 'FORCELLA STAULANZA', distanceKm: 82.0, category: 2 },
    { name: 'PASSO GIAU', distanceKm: 101.6, category: 1 },
    { name: 'PASSO FALZAREGO', distanceKm: 122.2, category: 2 },
    { name: 'PIANI DI PEZZÈ', distanceKm: 151.0, category: 2 },
  ],
  20: [
    { name: 'CLAUZETTO', distanceKm: 84.9, category: 3 },
    { name: 'PIANCAVALLO', distanceKm: 146.3, category: 1 },
    { name: 'PIANCAVALLO', distanceKm: 199.0, category: 1 },
  ],
  21: [],
};
