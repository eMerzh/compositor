import { getDistanceBetweenTwoPoints } from "calculate-distance-between-coordinates";
import schoolsJSON from "./signaletique-fase.json";

export type GeoLoc = {
  lon: number;
  lat: number;
};

// https://inscription.cfwb.be/lindice-composite/
// https://www.odwb.be/explore/dataset/signaletique-fase/table/
// https://www.gallilex.cfwb.be/document/pdf/48085_000.pdf
export interface School {
  reseau:
    | "COCOF"
    | "Libre confessionnel"
    | "Libre non confessionnel"
    | "Subventionné communal"
    | "Subventionné officiel (HE)"
    | "Subventionné provincial"
    | "WBE";
  ndeg_fase_de_l_implantation: string;
  nom_de_l_etablissement: string;
  type_d_enseignement:
    | "Artistique à horaire réduit"
    | "École supérieure des Arts"
    | "Haute École"
    | "Maternel ordinaire"
    | "Maternel spécialisé"
    | "Primaire ordinaire"
    | "Primaire spécialisé"
    | "Promotion sociale CEFA"
    | "Promotion sociale secondaire"
    | "Promotion sociale supérieur"
    | "Secondaire CEFA"
    | "Secondaire ordinaire"
    | "Secondaire spécialisé"
    | "Université";
  genre: "Ordinaire" | "Spécialisé";
  niveau: "Fondamental" | "Supérieur" | "Secondaire";
  adresse_de_l_implantation: string;
  code_postal_de_l_implantation: string;
  commune_de_l_implantation: string;
  geolocalisation: GeoLoc;
  to_exclude: boolean | undefined; // FIXME: boop
}
export const schools = (schoolsJSON as School[]).filter(
  (school) => !!school.geolocalisation,
);
export const primarySchools = schools.filter(
  (school) => school.type_d_enseignement === "Primaire ordinaire",
);
export const secondarySchools = schools.filter(
  (school) => school.type_d_enseignement === "Secondaire ordinaire",
);

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
  if (!a.geolocalisation || !b.geolocalisation) {
    throw new Error(
      `Missing geolocalisation ${a.nom_de_l_etablissement} ${b.nom_de_l_etablissement}`,
    );
  }
  const distA = getDistanceBetweenTwoPoints(origin, a.geolocalisation);
  const distB = getDistanceBetweenTwoPoints(origin, b.geolocalisation);
  return distA - distB;
};

export function findNearestRank(
  array: School[],
  school: School,
  origin: GeoLoc,
) {
  const sortedSchools = Array.from(array).sort(schoolSorter(origin));
  return (
    Math.min(
      sortedSchools.findIndex(
        (s: School) =>
          s.ndeg_fase_de_l_implantation === school.ndeg_fase_de_l_implantation,
      ),
      5,
    ) + 1
  );
}

export function getNearestSchools(array: School[], home: GeoLoc): School[] {
  const sortedSchools = Array.from(array).sort(schoolSorter(home));
  return sortedSchools;
}

export function hasBothSchoolsNetworkInCity(schools: School[], city: string) {
  const confessional = schools.find(
    (school) =>
      school.reseau === "Libre confessionnel" &&
      school.commune_de_l_implantation === city,
  );
  const other = schools.find(
    (school) =>
      school.reseau !== "Libre confessionnel" &&
      school.commune_de_l_implantation === city,
  );
  return !!confessional && !!other;
}

export function compute(
  school_prim: School,
  school_sec: School,
  locHome: GeoLoc,
  immersion: boolean,
) {
  const coef_1 = rankCoef1[0]; // LA PRÉFÉRENCE 1.5 pour 1°
  const rank_2 = findNearestRank(
    primarySchools.filter(
      (s) =>
        s.reseau === school_prim?.reseau &&
        (!s.to_exclude ||
          s.ndeg_fase_de_l_implantation ==
            school_prim.ndeg_fase_de_l_implantation),
    ),
    school_prim,
    locHome,
  );
  // const coef_2 = 1.3 // LA PROXIMITÉ ENTRE LE DOMICILE ET L’ÉCOLE PRIMAIRE (meme réseau)
  const coef_2 = rankCoef2[rank_2 - 1];

  // const coef_3 = 1.79 // LA PROXIMITÉ ENTRE LE DOMICILE ET L’ÉCOLE SECONDAIRE (meme réseau)
  const rank_3 = findNearestRank(
    secondarySchools.filter((s) => s.reseau === school_sec?.reseau),
    school_sec,
    locHome,
  );
  const coef_3 = rankCoef3[rank_3 - 1];
  const isBetween4KM =
    getDistanceBetweenTwoPoints(
      school_prim.geolocalisation,
      school_sec.geolocalisation,
    ) < 4;

  const coef_4 = isBetween4KM ? coef_4Table[coef_2][coef_3] : 1; // LA PROXIMITÉ ENTRE L’ÉCOLE PRIMAIRE ET L’ÉCOLE SECONDAIRE
  const coef_5 = immersion ? 1.18 : 1; // IMMERSION soit 1 (si non) soit 1.18

  // L'OFFRE SCOLAIRE DANS LA COMMUNE DE L'ÉCOLE PRIMAIRE
  const coef_6 = hasBothSchoolsNetworkInCity(
    secondarySchools,
    school_prim?.commune_de_l_implantation,
  )
    ? 1
    : 1.51;

  const coef_7 = 1; // partenaria peda soit 1 soit 1.51
  const coef_8 = 1; // LA CLASSE D'ENCADREMENT DE L'ÉCOLE PRIMAIRE (socio-économique)

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
    total:
      coef_1 * coef_2 * coef_3 * coef_4 * coef_5 * coef_6 * coef_7 * coef_8,
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
  immersion: boolean,
): ComputeResult[] {
  return schools.map((school: School) => ({
    school: school,
    score: compute(primarySchool, school, locHome, immersion),
    distance: getDistanceBetweenTwoPoints(school.geolocalisation, locHome),
  }));
}

export const distanceSortAsc = (a: ComputeResult, b: ComputeResult) =>
  a.distance - b.distance;
export const distanceSortDesc = (a: ComputeResult, b: ComputeResult) =>
  b.distance - a.distance;
export const scoreSortAsc = (a: ComputeResult, b: ComputeResult) =>
  a.score.total - b.score.total;
export const scoreSortDesc = (a: ComputeResult, b: ComputeResult) =>
  b.score.total - a.score.total;
