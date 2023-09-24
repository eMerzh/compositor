import { Checkbox, Group, Select, Text } from "@mantine/core";
import GeoAutoComplete, { NamedLoc } from "./GeoAutoComplete";
import type { School } from "./compute";
import { IconCalendar, IconSchool } from "@tabler/icons-react";
import { forwardRef } from "react";

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  city: string;
  label: string;
  address: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ label, address, city, ...others }: ItemProps, ref) => (
  <div ref={ref} {...others}>
    <Group noWrap>
      <div>
        <Text size="sm">{label}</Text>
        <Text size="xs" opacity={0.65}>
          {address}, {city}
        </Text>
      </div>
    </Group>
  </div>
));
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
  const prim = primarySchools.map((school) => ({
    value: school.id,
    label: school.name,
    address: school.address,
    city: school.city,
  }));

  return (
    <>
      <Select
        label="École Primaire"
        searchable
        clearable
        placeholder="Choisir une école primaire"
        value={idPrimaire}
        onChange={setIdPrimaire}
        itemComponent={SelectItem}
        limit={20}
        data={prim}
        mt={"md"}
        icon={<IconSchool size="1rem" color={idPrimaire ? "green" : "#adb5bd"} />}
      />
      <GeoAutoComplete value={locHome} onSelect={setLocHome} />

      <Select
        label="Inscription en 1ere primaire"
        data={["2018", "2019", "2020", "2021", "2022"]}
        icon={<IconCalendar size="1rem" color={date ? "green" : "#adb5bd"} />}
        value={date}
        onChange={setDate}
        mt={"md"}
      />
      <Checkbox
        label="Immersion"
        checked={immersion}
        mt="md"
        mb="lg"
        onChange={(event) => setImmersion(event.currentTarget.checked)}
      />
    </>
  );
}
