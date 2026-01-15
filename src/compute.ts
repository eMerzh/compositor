import { bbox, featureCollection, featureEach, isobands, point, pointGrid, distance as turfDistance } from "@turf/turf"
import { primary, secondary } from "./schools.json"
export type GeoLoc = {
  lon: number
  lat: number
}

export type FillLevel = 1 | 2 | 3 | 4
export type FillDetails = Record<
  number, // year
  {
    /** fill indicator (from 1 to 4 - 4 means not filled) */
    fill_number: FillLevel
    /** number of declared places */
    declared: string
    /** number of received inscriptions */
    received: string
  }
>

export interface School {
  /** fase etablissement / fase implantation */
  id: string
  name: string
  address: string
  city: string
  network:
    | "COCOF"
    | "Libre confessionnel"
    | "Libre non confessionnel"
    | "Subventionné communal"
    | "Subventionné officiel (HE)"
    | "Subventionné provincial"
    | "WBE"
  geo: {
    lat: number
    lon: number
  }
  startDate: string
  endDate?: string
  partenaria: null | { id: string; date: string }
  ise: null | number
  immersion: null | string[]
  fill?: FillDetails
}

export const primarySchools = primary as School[]
export const secondarySchools = secondary as School[]

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
}

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
}

const rankCoef1 = [
  1.5, // nearest
  1.4,
  1.3,
  1.2,
  1.1,
  1,
]
const rankCoef2 = [
  1.3, // nearest
  1.23,
  1.17,
  1.11,
  1.05,
  1,
]

const rankCoef3 = [
  1.98, // nearest
  1.79,
  1.59,
  1.39,
  1.19,
  1,
]

const schoolSorter = (origin: GeoLoc) => (a: School, b: School) => {
  if (!a.geo || !b.geo) {
    throw new Error(`Missing geo ${a.name} ${b.name}`)
  }
  const distA = distance(origin, a.geo)
  const distB = distance(origin, b.geo)
  return distA - distB
}

export function findNearestRank(sortedSchools: School[], school: School, origin: GeoLoc) {
  const foundIndex = sortedSchools.findIndex((s: School) => s.id === school.id)
  // if previous school is the same, we take the same rank
  const prevSchool = sortedSchools[foundIndex - 1]
  if (prevSchool) {
    const currentDistance = distance(origin, school.geo)
    const previousDistance = distance(origin, prevSchool.geo)
    if (currentDistance === previousDistance) {
      return Math.min(foundIndex - 1, 5) + 1
    }
  }
  return Math.min(foundIndex, 5) + 1
}

export function hasBothSchoolsNetworkInCity(schools: School[], city: string) {
  const confessional = schools.find(school => school.network === "Libre confessionnel" && school.city === city)
  const other = schools.find(school => school.network !== "Libre confessionnel" && school.city === city)
  return !!confessional && !!other
}

export class UnexistingSchool extends Error {
  constructor(message) {
    super(message)
    this.name = "UnexistingSchool"
  }
}

export function compute(
  // note: for perf reasons, primary schools should already by filtered by network, newest removed, and ordered by distance
  primary: School[],
  secondary: School[],
  school_prim: School,
  school_sec: School,
  locHome: GeoLoc,
  locInscription: GeoLoc,
  immersion: boolean,
  ise?: number,
  score2026?: boolean,
) {
  const coef_1 = rankCoef1[0] // LA PRÉFÉRENCE 1.5 pour 1°

  const rank_2 = findNearestRank(primary, school_prim, locInscription)
  if (rank_2 === 0) {
    throw new UnexistingSchool(`Missing primary school ${school_prim.name}`)
  }
  // const coef_2 = 1.3 // LA PROXIMITÉ ENTRE LE DOMICILE ET L’ÉCOLE PRIMAIRE (meme réseau)
  const coef_2 = rankCoef2[rank_2 - 1]

  // const coef_3 = 1.79 // LA PROXIMITÉ ENTRE LE DOMICILE ET L’ÉCOLE SECONDAIRE (meme réseau)
  const rank_3 = findNearestRank(
    secondary.filter(s => s.network === school_sec.network),
    school_sec,
    locHome,
  )
  const coef_3 = rankCoef3[rank_3 - 1]
  const isBetween4KM = distance(school_prim.geo, school_sec.geo) < 4

  const coef_4 = isBetween4KM ? coef_4Table[coef_2][coef_3] : 1 // LA PROXIMITÉ ENTRE L’ÉCOLE PRIMAIRE ET L’ÉCOLE SECONDAIRE
  const coef_5 = immersion && school_sec.immersion ? 1.18 : 1 // IMMERSION soit 1 (si non) soit 1.18

  // L'OFFRE SCOLAIRE DANS LA COMMUNE DE L'ÉCOLE PRIMAIRE
  const coef_6 = hasBothSchoolsNetworkInCity(secondarySchools, school_prim?.city) ? 1 : 1.51

  const coef_7 = coef_6 === 1.51 || !school_prim.partenaria || school_prim.partenaria.id !== school_sec.id ? 1 : 1.51 // partenaria peda soit 1 soit 1.51
  // LA CLASSE D'ENCADREMENT DE L'ÉCOLE PRIMAIRE (socio-économique)
  const coef_8 = coef_8Table[school_prim.ise || ise || 10] // if not found, it's an average of students /o\

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
    total: score2026
      ? coef_1 * coef_2 * coef_3 * coef_4 * coef_5 * coef_6 * coef_7
      : coef_1 * coef_2 * coef_3 * coef_4 * coef_5 * coef_6 * coef_7 * coef_8,
  }
}

export type ComputeResult = {
  school: School
  score: ReturnType<typeof compute>
  distance: number
  primarySchools: School[]
  secondarySchools: School[]
  primarySchool: School
  home: GeoLoc
}

export function addYears(date: Date, years: number): Date {
  const dateCopy = new Date(date)
  dateCopy.setFullYear(dateCopy.getFullYear() + years)
  return dateCopy
}

function filterNewestAndOrderSchool(
  primarySchools: School[],
  network: School["network"],
  inscriptionDate: Date,
  locHome: GeoLoc,
) {
  return Array.from(primarySchools)
    .filter(s => {
      const schoolCreation = s.startDate ? new Date(Date.parse(s.startDate)) : null
      return s.network === network && (!schoolCreation || schoolCreation < inscriptionDate)
    })
    .sort(schoolSorter(locHome))
}

function filterSecondary(schools: School[], secondaireDate: Date): School[] {
  return schools.filter(s => {
    const schoolEndDate = s.endDate ? new Date(Date.parse(s.endDate)) : null
    return !schoolEndDate || schoolEndDate > secondaireDate
  })
}
export function computeAll(
  secondarySchools: School[],
  primarySchool: School,
  locHome: GeoLoc,
  locInscription: GeoLoc,
  date: string,
  immersion: boolean,
  inscriptionSecondaryYear: string,
  ise?: number,
  score2026?: boolean,
): ComputeResult[] {
  console.time("computeAll")

  const inscriptionDate = new Date(`${date}-09-01`)
  const inscriptionSecondaryDate = new Date(`${inscriptionSecondaryYear}-09-01`)
  const prim = filterNewestAndOrderSchool(primarySchools, primarySchool.network, inscriptionDate, locInscription)
  const sec = filterSecondary(Array.from(secondarySchools), inscriptionSecondaryDate).sort(schoolSorter(locHome))

  const result = secondarySchools.map((school: School) => {
    return {
      school: school,
      primarySchools: prim,
      secondarySchools: sec,
      score: compute(prim, sec, primarySchool, school, locHome, locInscription, immersion, ise, score2026),
      home: locHome,
      distance: distance(school.geo, locHome),
      primarySchool: primarySchool,
    }
  })

  console.timeEnd("computeAll")
  return result
}

export const distanceSort = (a: ComputeResult, b: ComputeResult) => a.distance - b.distance

export const scoreSort = (a: ComputeResult, b: ComputeResult) =>
  (Number.isNaN(a.score.total) ? 0 : a.score.total) - (Number.isNaN(b.score.total) ? 0 : b.score.total)

export const fillSort = (a: ComputeResult, b: ComputeResult) => {
  if ((a.school.fill?.[2025]?.received || "-") !== "-" && (!b.school.fill?.[2025]?.received || "-") !== "-") {
    return (
      Number.parseInt(a.school.fill?.[2025]?.received, 10) / Number.parseInt(a.school.fill?.[2025]?.declared, 10) -
      Number.parseInt(b.school.fill?.[2025]?.received, 10) / Number.parseInt(b.school.fill?.[2025]?.declared, 10)
    )
  }

  return b.school.fill?.[2025]?.fill_number - a.school.fill?.[2025]?.fill_number
}

function getDistanceFromBBoxAndPoint(bbox, numberPoint: number) {
  const distA = turfDistance([bbox[0], bbox[1]], [bbox[0], bbox[3]])
  const distB = turfDistance([bbox[2], bbox[3]], [bbox[0], bbox[3]])
  const area = distA * distB
  const distance = Math.sqrt(area / numberPoint)

  return distance
}

export function getScoreGrid(
  secondarySchool: School,
  primarySchool: School,
  locHome: GeoLoc,
  locInscription: GeoLoc,
  date: string,
  immersion: boolean,
  inscriptionSecondaryYear: string,
  ise?: number,
) {
  console.time("getScoreGrid")

  const box = bbox(
    featureCollection([
      point([locHome.lon, locHome.lat]),
      point([secondarySchool.geo.lon, secondarySchool.geo.lat]),
      point([primarySchool.geo.lon, primarySchool.geo.lat]),
    ]),
  )
  const newbox = [...box] as [number, number, number, number, number, number] // just copy the thing
  newbox[0] = box[0] - (box[2] - box[0]) // / 2;
  newbox[1] = box[1] - (box[3] - box[1]) // / 2;
  newbox[2] = box[2] + (box[2] - box[0]) // / 2;
  newbox[3] = box[3] + (box[3] - box[1]) // / 2;

  const distanceBetween = getDistanceFromBBoxAndPoint(newbox, 200)
  const grid = pointGrid(newbox, distanceBetween /*km*/)

  const inscriptionDate = new Date(`${date}-09-01`)

  let min = 10
  let max = 1
  featureEach(grid, currentFeature => {
    const nLoc = {
      lon: currentFeature.geometry.coordinates[0],
      lat: currentFeature.geometry.coordinates[1],
    }
    const inscriptionSecondaryDate = new Date(`${inscriptionSecondaryYear}-09-01`)
    const prim = filterNewestAndOrderSchool(primarySchools, primarySchool.network, inscriptionDate, nLoc)
    const sec = filterSecondary(Array.from(secondarySchools), inscriptionSecondaryDate).sort(schoolSorter(nLoc))
    const score = compute(prim, sec, primarySchool, secondarySchool, nLoc, locInscription, immersion, ise)
    currentFeature.properties = {
      score: score.total,
    }

    if (score.total > max) max = score.total
    if (score.total < min) min = score.total
  })

  console.timeEnd("getScoreGrid")

  const steps = (max - min) / 10
  const breaks = Array.from({ length: 11 }, (_, i) => min + i * steps)

  const lines: GeoJSON.GeoJSON = isobands(grid, breaks, {
    zProperty: "score",
    commonProperties: {
      "fill-opacity": 0.6,
    },
    breaksProperties: [
      { fill: "#d73027" },
      { fill: "#f46d43" },
      { fill: "#fdae61" },
      { fill: "#fee090" },
      { fill: "#ffffbf" },
      { fill: "#e0f3f8" },
      { fill: "#abd9e9" },
      { fill: "#74add1" },
      { fill: "#4575b4" },
      { fill: "#1e58a4" },
      { fill: "#0a3266" },
      { fill: "#0a3266" },
      { fill: "#0a3266" },
    ],
  })
  return { grid, min, max, lines }
}

function distance(from: GeoLoc, to: GeoLoc) {
  return turfDistance([from.lon, from.lat], [to.lon, to.lat])
}
