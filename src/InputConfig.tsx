import { Checkbox, Select } from "@mantine/core";
import GeoAutoComplete, { NamedLoc } from "./GeoAutoComplete";
import type { School } from "./compute";
import { IconSchool } from "@tabler/icons-react";

export function InputConfig({
  primarySchools,
  fasePrimaire,
  setFasePrimaire,
  locHome,
  setLocHome,
  immersion,
  setImmersion,
}: {
  primarySchools: School[];
  fasePrimaire: string;
  setFasePrimaire: (v: string) => void;
  locHome: NamedLoc;
  setLocHome: (v: NamedLoc) => void;
  immersion: boolean;
  setImmersion: (v: boolean) => void;
}) {
  return (
    <>
      <Select
        label="École Primaire"
        searchable
        clearable
        placeholder="Choisir une école primaire"
        value={fasePrimaire}
        onChange={setFasePrimaire}
        data={primarySchools.map((school) => ({
          value: school.ndeg_fase_de_l_implantation,
          label: school.nom_de_l_etablissement,
        }))}
        icon={<IconSchool size="1rem" />}
      />
      <GeoAutoComplete value={locHome} onSelect={setLocHome} />

      <Checkbox
        label="Immersion"
        checked={immersion}
        mt="sm"
        onChange={(event) => setImmersion(event.currentTarget.checked)}
      />
    </>
  );
}
