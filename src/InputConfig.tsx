import { Checkbox, Group, Select, Text } from "@mantine/core"
import { IconCalendar, IconCalendarQuestion, IconMoneybag, IconSchool } from "@tabler/icons-react"
import { Fragment, forwardRef, useMemo, useState } from "react"
import { addYears, type School } from "./compute"
import GeoAutoComplete, { NamedLoc } from "./GeoAutoComplete"

function toLocalCompare(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
}

/**
 * Match a query against an item using a multi word fuzzy search algorithm.
 */
function fuzzyMatch(query: string, item: string): boolean {
  const queryWords = query.split(" ").map(toLocalCompare)
  const itemWords = item.split(" ").map(toLocalCompare)

  return queryWords.every(q => itemWords.some(i => i.startsWith(q)))
}

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  city: string
  label: string
  address: string
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
))

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
  ise,
  setIse,
  isFaultyDate,
  score2026,
  setScore2026,
  secondaryYear,
  setSecondaryYear,
}: {
  primarySchools: School[]
  idPrimaire: string
  setIdPrimaire: (v: string) => void
  locHome: NamedLoc
  setLocHome: (v: NamedLoc) => void
  immersion: boolean
  setImmersion: (v: boolean) => void
  date: string
  setDate: (v: string) => void
  ise: number
  setIse: (v: number) => void
  isFaultyDate: boolean
  score2026: boolean
  setScore2026: (v: boolean) => void
  secondaryYear?: string
  setSecondaryYear?: (v: string) => void
}) {
  const [showMoreDate, setShowMoreDate] = useState(false)
  const prim = primarySchools.map(school => ({
    value: school.id,
    label: school.name,
    address: school.address,
    city: school.city,
  }))
  const primSchool = useMemo(() => {
    return idPrimaire ? primarySchools.find(p => p.id === idPrimaire) : null
  }, [idPrimaire, primarySchools])

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
        filter={(query, item) => fuzzyMatch(query, item.label)}
        icon={<IconSchool size="1rem" color={idPrimaire ? "green" : "#adb5bd"} />}
      />
      <GeoAutoComplete value={locHome} onSelect={setLocHome} />
      <Select
        label="Inscription en 1ere primaire"
        data={["2019", "2020", "2021", "2022", "2023", "2024", "2025"]}
        icon={<IconCalendar size="1rem" color={isFaultyDate ? "red" : date ? "green" : "#adb5bd"} />}
        value={date}
        onChange={setDate}
        mt={"md"}
      />
      {idPrimaire && !primSchool.ise && (
        <Select
          label="Indice Socio-Économique (1= moins favorisé)"
          data={Array.from({ length: 20 }, (_, i) => i + 1).map(i => ({ label: `${i}`, value: `${i}` }))}
          icon={<IconMoneybag size="1rem" color={date ? "green" : "#adb5bd"} />}
          value={`${ise}`}
          onChange={v => setIse(Number.parseInt(v, 10))}
          mt={"md"}
        />
      )}
      {secondaryYear && (
        <Text size={"sm"} color="gray">
          Pour une entrée en secondaire en août{" "}
          {showMoreDate ? (
            <div>
              <Select
                data={["2025", "2026", "2027", "2028", "2029"]}
                icon={<IconCalendarQuestion size="1rem" color={isFaultyDate ? "red" : date ? "green" : "#adb5bd"} />}
                value={secondaryYear}
                onChange={setSecondaryYear}
                mt={"xs"}
              />
            </div>
          ) : (
            <Text td="underline" span onClick={() => setShowMoreDate(true)}>
              {secondaryYear}
            </Text>
          )}
        </Text>
      )}
      <Checkbox
        label={"Immersion"}
        description={
          <Fragment>
            Si votre enfant suit l’immersion linguistique depuis la 3e année primaire au moins et vous souhaitez
            <br />
            qu’il poursuive dans cette filière dans la même langue en secondaire.
          </Fragment>
        }
        checked={immersion}
        mt="md"
        mb="lg"
        onChange={event => setImmersion(event.currentTarget.checked)}
      />
      <Checkbox
        label={"Formule 2026-2027"}
        description="Pour les inscriptions de l'année 2026-2027, l'indice socio-économique de l'école primaire ne sera plus pris en compte dans le
            calcul du score."
        checked={score2026}
        mt="md"
        mb="lg"
        onChange={event => setScore2026(event.currentTarget.checked)}
      />
    </>
  )
}
