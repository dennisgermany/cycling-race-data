/**
 * Categorised climbs from official stage pages (letour.fr stage profiles, July 2026 research).
 * Profile graphics: https://www.cyclingstage.com/tour-de-france-2026-route/route-tdf-2026
 */

/** @typedef {{ name: string, distanceKm: number, category: number }} ProfileClimb */

/** @type {Record<number, ProfileClimb[]>} */
export const tourDeFrance2026ProfileClimbsByStageNum = {
  1: [
    { name: 'CÔTE DU STADE OLYMPIQUE DE MONTJUÏC', distanceKm: 19.6, category: 4 },
  ],
  2: [
    { name: 'CÔTE DE BEGUES (399 M)', distanceKm: 94.2, category: 2 },
    { name: 'CÔTE DU CHÂTEAU DE MONTJUÏC', distanceKm: 166.0, category: 3 },
  ],
  3: [
    { name: 'CÔTE DE SAINT FELIU DE CODINES', distanceKm: 17.2, category: 3 },
    { name: 'COL DE TOSES (1778 M) (VC-GI-400)', distanceKm: 127.7, category: 1 },
    { name: 'COL DU CALVAIRE', distanceKm: 172.3, category: 3 },
    { name: 'LES ANGLES', distanceKm: 195.9, category: 3 },
  ],
  4: [
    { name: 'COL DE BEDOS', distanceKm: 48.2, category: 4 },
    { name: 'COL DU PARADIS', distanceKm: 64.9, category: 3 },
    { name: 'COL DE COUDONS (883 M)', distanceKm: 104.9, category: 2 },
    { name: 'COL DE MONTSÉGUR (1059 M)', distanceKm: 146.7, category: 2 },
  ],
  5: [
    { name: 'CÔTE DE BALEIX', distanceKm: 132.7, category: 3 },
  ],
  6: [
    { name: 'CÔTE DE LOUCRUP', distanceKm: 50.9, category: 4 },
    { name: 'CÔTE DE MAUVEZIN', distanceKm: 77.3, category: 3 },
    { name: 'COL D\'ASPIN (1 489 M)', distanceKm: 118.1, category: 1 },
    { name: 'COL DU TOURMALET (2 115 M) SOUVENIR JACQUES GODDET', distanceKm: 147.8, category: 1 },
    { name: 'GAVARNIE-GÈDRE (1 380 M)', distanceKm: 186.2, category: 2 },
  ],
  7: [
    { name: 'CÔTE DE BÉGUEY', distanceKm: 137.3, category: 4 },
  ],
  8: [
    { name: 'CÔTE DE DOMME', distanceKm: 102.6, category: 4 },
    { name: 'CÔTE DU BUISSON-DE-CADOUIN', distanceKm: 140.4, category: 4 },
  ],
  9: [
    { name: 'CÔTE DE NAVES', distanceKm: 77.0, category: 3 },
    { name: 'SUC AU MAY (903 M)', distanceKm: 105.0, category: 2 },
    { name: 'CÔTE DE LA CROIX DU PEY', distanceKm: 129.4, category: 3 },
    { name: 'MONT BESSOU', distanceKm: 161.0, category: 4 },
  ],
  10: [
    { name: 'CÔTE DE PAILHEROLS (1043 M)', distanceKm: 68.0, category: 3 },
    { name: 'COL DE LA GRIFFOUL (1336 M)', distanceKm: 97.3, category: 2 },
    { name: 'COL DE PRAT DE BOUC', distanceKm: 103.8, category: 3 },
    { name: 'CÔTE DE MURAT', distanceKm: 118.8, category: 3 },
    { name: 'PUY MARY - PAS DE PEYROL (1589 M) (D680-D17)', distanceKm: 135.7, category: 1 },
    { name: 'COL DE PERTUS (1309 M)', distanceKm: 152.1, category: 1 },
    { name: 'COL DE FONT DE CÈRE', distanceKm: 163.9, category: 3 },
  ],
  11: [
    { name: 'CÔTE DE BILLONNIÈRE', distanceKm: 32.9, category: 4 },
    { name: 'CÔTE DE BILLY-CHEVANNES', distanceKm: 123.4, category: 4 },
  ],
  12: [
    { name: 'CÔTE DE LANTY', distanceKm: 76.5, category: 4 },
    { name: 'CÔTE DE CUZY', distanceKm: 97.8, category: 4 },
    { name: 'CÔTE DE MONTAGNY-LÈS-BUXY', distanceKm: 159.4, category: 4 },
  ],
  13: [
    { name: 'COL DES CROIX', distanceKm: 157.4, category: 3 },
    { name: 'BALLON D\'ALSACE (1 173 M)', distanceKm: 175.9, category: 1 },
  ],
  14: [
    { name: 'GRAND BALLON (1336 M)', distanceKm: 36.6, category: 1 },
    { name: 'COL DU PAGE (959 M)', distanceKm: 71.3, category: 2 },
    { name: 'BALLON D\'ALSACE (1 173 M)', distanceKm: 94.4, category: 1 },
    { name: 'COL DU HAAG (1233 M) (VC-D431)', distanceKm: 149.4, category: 1 },
  ],
  15: [
    { name: 'CÔTE DES ROUSSES', distanceKm: 36.8, category: 3 },
    { name: 'LE SALÈVE - COL DE LA CROISETTE (1 175 M)', distanceKm: 136.0, category: 1 },
    { name: 'CÔTE DU MONT', distanceKm: 146.0, category: 3 },
    { name: 'PLATEAU DE SOLAISON', distanceKm: 183.9, category: 1 },
  ],
  16: [
    { name: 'POINT CHRONO INTERMÉDIAIRE N°2 / CÔTE DE LARRINGES (799 M)', distanceKm: 9.7, category: 2 },
  ],
  17: [
    { name: 'CÔTE DE BASSA', distanceKm: 19.2, category: 4 },
    { name: 'CÔTE DE ROSSILLON', distanceKm: 35.5, category: 4 },
    { name: 'COL DES PRÈS', distanceKm: 49.6, category: 3 },
    { name: 'CÔTE DE SAINT-JEAN D\'ARVEY', distanceKm: 59.5, category: 4 },
  ],
  18: [
    { name: 'CÔTE D\'ENGINS (854 M)', distanceKm: 36.7, category: 1 },
    { name: 'CÔTE DE MONTEYNARD', distanceKm: 92.2, category: 2 },
    { name: 'CÔTE DES TERRASSES', distanceKm: 112.8, category: 3 },
    { name: 'CÔTE DE SAINT-LÉGER-LES-MÉLÈZES', distanceKm: 166.2, category: 3 },
    { name: 'ORCIÈRES-MERLETTE (1 825 M)', distanceKm: 185.2, category: 1 },
  ],
  19: [
    { name: 'COL BAYARD (1 246 M)', distanceKm: 4.8, category: 2 },
    { name: 'COL DU NOYER (1664 M)', distanceKm: 25.2, category: 1 },
    { name: 'COL D\'ORNON', distanceKm: 99.2, category: 2 },
    { name: 'ALPE D\'HUEZ (1 850 M)', distanceKm: 127.9, category: 1 },
  ],
  20: [
    { name: 'COL DE LA CROIX DE FER (2 067 M)', distanceKm: 33.7, category: 1 },
    { name: 'COL DU TÉLÉGRAPHE (1 566 M)', distanceKm: 87.6, category: 1 },
    { name: 'COL DU GALIBIER (2 642 M) SOUVENIR HENRI DESGRANGE', distanceKm: 110.5, category: 1 },
    { name: 'COL DE SARENNE (1 999 M)', distanceKm: 156.5, category: 1 },
  ],
  21: [
    { name: 'CÔTE DU PAVÉ DES GARDES', distanceKm: 43.1, category: 4 },
    { name: 'CÔTE DE LA BUTTE MONTMARTRE', distanceKm: 122.7, category: 4 },
  ],
};
