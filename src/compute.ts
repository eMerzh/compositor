import { getDistanceBetweenTwoPoints } from "calculate-distance-between-coordinates";
import { primary, secondary } from "./schools.json";

export type GeoLoc = {
  lon: number;
  lat: number;
};

export interface School {
  // fase etablissement / fase implantation
  id: string;
  name: string;
  address: string;
  city: string;
  network:
    | "COCOF"
    | "Libre confessionnel"
    | "Libre non confessionnel"
    | "Subventionné communal"
    | "Subventionné officiel (HE)"
    | "Subventionné provincial"
    | "WBE";
  geo: {
    lat: number;
    lon: number;
  };
  date: string;
  partenaria: null | { id: string; date: string };
  ise: null | number;
  immersion: null | string[];
}

export const primarySchools = (primary as School[]).filter((school: School) => !!school.geo);
export const secondarySchools = (secondary as School[]).filter((school: School) => !!school.geo);

const coef_4Table: Record<number, Record<number, number>> = {
  1.3: {
    1.98: 1,
    1.79: 1.054,
    1.59: 1.108,
    1.39: 1.162,
    1.19: 1.216,
    1: 1.27,
  },
  1.23: {
    1.98: 1.054,
    1.79: 1.108,
    1.59: 1.162,
    1.39: 1.216,
    1.19: 1.27,
    1: 1.324,
  },
  1.17: {
    1.98: 1.108,
    1.79: 1.162,
    1.59: 1.216,
    1.39: 1.27,
    1.19: 1.324,
    1: 1.378,
  },
  1.11: {
    1.98: 1.162,
    1.79: 1.216,
    1.59: 1.27,
    1.39: 1.324,
    1.19: 1.378,
    1: 1.432,
  },
  1.05: {
    1.98: 1.216,
    1.79: 1.27,
    1.59: 1.324,
    1.39: 1.378,
    1.19: 1.432,
    1: 1.486,
  },
  1: {
    1.98: 1.27,
    1.79: 1.324,
    1.59: 1.378,
    1.39: 1.432,
    1.19: 1.486,
    1: 1.54,
  },
};

const coef_8Table = {
  1: 1.1,
  2: 1.095,
  3: 1.089,
  4: 1.084,
  5: 1.079,
  6: 1.074,
  7: 1.068,
  8: 1.063,
  9: 1.058,
  10: 1.053,
  11: 1.048,
  12: 1.042,
  13: 1.037,
  14: 1.032,
  15: 1.027,
  16: 1.022,
  17: 1.016,
  18: 1.011,
  19: 1.006,
  20: 1,
};

const rankCoef1 = [
  1.5, // nearest
  1.4,
  1.3,
  1.2,
  1.1,
  1,
];
const rankCoef2 = [
  1.3, // nearest
  1.23,
  1.17,
  1.11,
  1.05,
  1,
];

const rankCoef3 = [
  1.98, // nearest
  1.79,
  1.59,
  1.39,
  1.19,
  1,
];

const schoolSorter = (origin: GeoLoc) => (a: School, b: School) => {
  if (!a.geo || !b.geo) {
    throw new Error(`Missing geo ${a.name} ${b.name}`);
  }
  const distA = getDistanceBetweenTwoPoints(origin, a.geo);
  const distB = getDistanceBetweenTwoPoints(origin, b.geo);
  return distA - distB;
};

export function findNearestRank(array: School[], school: School, origin: GeoLoc) {
  const sortedSchools = Array.from(array).sort(schoolSorter(origin));
  return (
    Math.min(
      sortedSchools.findIndex((s: School) => s.id === school.id),
      5,
    ) + 1
  );
}

export function getNearestSchools(array: School[], home: GeoLoc): School[] {
  const sortedSchools = Array.from(array).sort(schoolSorter(home));
  return sortedSchools;
}

export function hasBothSchoolsNetworkInCity(schools: School[], city: string) {
  const confessional = schools.find((school) => school.network === "Libre confessionnel" && school.city === city);
  const other = schools.find((school) => school.network !== "Libre confessionnel" && school.city === city);
  return !!confessional && !!other;
}

export function compute(school_prim: School, school_sec: School, locHome: GeoLoc, date: string, immersion: boolean) {
  const coef_1 = rankCoef1[0]; // LA PRÉFÉRENCE 1.5 pour 1°
  const inscriptionDate = new Date(date + "-09-01");

  const rank_2 = findNearestRank(
    primarySchools.filter((s) => {
      const schoolCreation = s.date ? new Date(Date.parse(s.date)) : null;

      return s.network === school_prim?.network && (!schoolCreation || schoolCreation < inscriptionDate);
    }),
    school_prim,
    locHome,
  );
  // const coef_2 = 1.3 // LA PROXIMITÉ ENTRE LE DOMICILE ET L’ÉCOLE PRIMAIRE (meme réseau)
  const coef_2 = rankCoef2[rank_2 - 1];

  // const coef_3 = 1.79 // LA PROXIMITÉ ENTRE LE DOMICILE ET L’ÉCOLE SECONDAIRE (meme réseau)
  const rank_3 = findNearestRank(
    secondarySchools.filter((s) => s.network === school_sec?.network),
    school_sec,
    locHome,
  );
  const coef_3 = rankCoef3[rank_3 - 1];
  const isBetween4KM = getDistanceBetweenTwoPoints(school_prim.geo, school_sec.geo) < 4;

  const coef_4 = isBetween4KM ? coef_4Table[coef_2][coef_3] : 1; // LA PROXIMITÉ ENTRE L’ÉCOLE PRIMAIRE ET L’ÉCOLE SECONDAIRE
  const coef_5 = immersion && school_sec.immersion ? 1.18 : 1; // IMMERSION soit 1 (si non) soit 1.18

  // L'OFFRE SCOLAIRE DANS LA COMMUNE DE L'ÉCOLE PRIMAIRE
  const coef_6 = hasBothSchoolsNetworkInCity(secondarySchools, school_prim?.city) ? 1 : 1.51;

  const coef_7 = coef_6 == 1.51 || (school_prim.partenaria && school_prim.partenaria.id === school_sec.id) ? 1 : 1.51; // partenaria peda soit 1 soit 1.51
  // LA CLASSE D'ENCADREMENT DE L'ÉCOLE PRIMAIRE (socio-économique)
  const coef_8 = coef_8Table[school_prim.ise || 10]; // if not found, it's an average of students /o\

  return {
    coef_1,
    coef_2,
    coef_3,
    coef_4,
    coef_5,
    coef_6,
    coef_7,
    coef_8,
    rank_2,
    rank_3,
    total: coef_1 * coef_2 * coef_3 * coef_4 * coef_5 * coef_6 * coef_7 * coef_8,
  };
}

export type ComputeResult = {
  school: School;
  score: ReturnType<typeof compute>;
  distance: number;
};

export function computeAll(
  schools: School[],
  primarySchool: School,
  locHome: GeoLoc,
  date: string,
  immersion: boolean,
): ComputeResult[] {
  console.time("computeAll");
  const result = schools.map((school: School) => ({
    school: school,
    score: compute(primarySchool, school, locHome, date, immersion),
    distance: getDistanceBetweenTwoPoints(school.geo, locHome),
  }));

  console.timeEnd("computeAll");
  return result;
}

export const distanceSortAsc = (a: ComputeResult, b: ComputeResult) => a.distance - b.distance;
export const distanceSortDesc = (a: ComputeResult, b: ComputeResult) => b.distance - a.distance;
export const scoreSortAsc = (a: ComputeResult, b: ComputeResult) => a.score.total - b.score.total;
export const scoreSortDesc = (a: ComputeResult, b: ComputeResult) => b.score.total - a.score.total;
