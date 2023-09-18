import { Checkbox, Select } from "@mantine/core";
import GeoAutoComplete, { NamedLoc } from "./GeoAutoComplete";
import type { School } from "./compute";
import { IconCalendar, IconSchool } from "@tabler/icons-react";

export function InputConfig({
  primarySchools,
  idPrimaire,
  setIdPrimaire,
  locHome,
  setLocHome,
  immersion,
  setImmersion,
  date,
  setDate,
}: {
  primarySchools: School[];
  idPrimaire: string;
  setIdPrimaire: (v: string) => void;
  locHome: NamedLoc;
  setLocHome: (v: NamedLoc) => void;
  immersion: boolean;
  setImmersion: (v: boolean) => void;
  date: string;
  setDate: (v: string) => void;
}) {
  return (
    <>
      <Select
        label="École Primaire"
        searchable
        clearable
        placeholder="Choisir une école primaire"
        value={idPrimaire}
        onChange={setIdPrimaire}
        data={primarySchools.map((school) => ({
          value: school.id,
          label: school.name,
        }))}
        icon={<IconSchool size="1rem" color={idPrimaire ? "green" : "#adb5bd"} />}
      />
      <GeoAutoComplete value={locHome} onSelect={setLocHome} />

      <Select
        label="Année inscription"
        data={["2018", "2019", "2020", "2021", "2022"]}
        icon={<IconCalendar size="1rem" color={date ? "green" : "#adb5bd"} />}
        value={date}
        onChange={setDate}
      />
      <Checkbox
        label="Immersion"
        checked={immersion}
        mt="sm"
        onChange={(event) => setImmersion(event.currentTarget.checked)}
      />
    </>
  );
}
