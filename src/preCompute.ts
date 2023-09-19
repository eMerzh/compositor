import fs from "fs";
import * as csv from "csv";
import { finished } from "stream/promises";

function getFile(path: string) {
  const r = fs.readFileSync(path, { encoding: "utf8", flag: "r" });
  return JSON.parse(r);
}

const schools = getFile("./data/signaletique-fase.json");
const partenariaList = getFile("./data/partenaria.json");
const fillMap = getFile("./data/fill.json");

const processFile = async (path) => {
  const csvParser = csv.parse(fs.readFileSync(path), {
    skip_empty_lines: true,
  });
  const records = [];
  csvParser.on("readable", function () {
    let record;
    while ((record = csvParser.read()) !== null) {
      // Work with each record
      records.push(record);
    }
  });
  await finished(csvParser);
  return records;
};

// Parse the CSV content
const dt = await processFile("./data/bce-et-dates.csv");
const BCEDates = new Map(dt);
const inlist = await processFile("./data/ecole_secondaires.csv");

const InListSchools = new Set(inlist.map((school) => school[0]));
const compositeList = await processFile("./data/ise.csv");
const immersionList = await processFile("./data/immersion.csv");

const compositeIndex = new Map(compositeList.map((r) => [`${r[0]}/${r[1]}`, parseInt(r[2], 10)]));
const immersionIndex = new Map(immersionList.map((r) => [r[0], r[1].split("/")]));
const newSchools = schools.map((school) => {
  return { ...school, creationDate: BCEDates.get(school.numero_bce_de_l_etablissement) };
});

const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());

function parseFillStr(path) {
  const regex = /statutInscr(\d)\.png/;
  const extract = regex.exec(path);
  if (extract) {
    return parseInt(extract[1], 10);
  }
}
function getFilledIndex(imagePaths) {
  return {
    2018: parseFillStr(imagePaths[0]),
    2019: parseFillStr(imagePaths[1]),
    2020: parseFillStr(imagePaths[2]),
    2021: parseFillStr(imagePaths[3]),
    2022: parseFillStr(imagePaths[4]),
  };
}
function schoolExtract(school) {
  const id = `${school.ndeg_fase_de_l_etablissement}/${school.ndeg_fase_de_l_implantation}`;
  const partenaria = partenariaList.find((p) => p.prim === id);
  return {
    id,
    name: capitalize(school.nom_de_l_etablissement, true),
    address: school.adresse_de_l_implantation,
    city: school.commune_de_l_implantation,
    network: school.reseau,
    geo: {
      lat: school.latitude,
      lon: school.longitude,
    },
    // date are in DD-MM-YYYY format
    date: school.creationDate
      ? `${school.creationDate.split("-")[2]}-${school.creationDate.split("-")[1]}-${school.creationDate.split("-")[0]}`
      : "",
    partenaria: partenaria ? { id: partenaria.sec, date: partenaria.date } : null,
    ise: compositeIndex.get(id) ? compositeIndex.get(id) : null,
    immersion: immersionIndex.get(id) ? immersionIndex.get(id) : null,
    fill: fillMap[id] ? getFilledIndex(fillMap[id]) : null,
  };
}

const file = {
  primary: newSchools
    .filter((school) => school.type_d_enseignement === "Primaire ordinaire")
    .map(schoolExtract)
    .filter((school) => !!school.geo),

  secondary: newSchools
    .filter((school) => school.type_d_enseignement === "Secondaire ordinaire")
    // is in the official List
    .filter((school) =>
      InListSchools.has(`${school.ndeg_fase_de_l_etablissement}/${school.ndeg_fase_de_l_implantation}`),
    )
    .map(schoolExtract)
    .filter((school) => !!school.geo),
};

fs.writeFileSync("src/schools.json", JSON.stringify(file, null, 0), "utf8");

console.log(`\n\ndone 🎉\n\nprimaire: ${file.primary.length} secondaire: ${file.secondary.length}`);
