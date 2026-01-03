import { AutocompleteProps, Button, Checkbox, OptionsFilter, Select, Text } from "@mantine/core"
import { IconCalendar, IconCalendarQuestion, IconEdit, IconMoneybag, IconSchool } from "@tabler/icons-react"
import { Fragment, useCallback, useMemo, useState } from "react"
import AddressesForm from "./AddressesForm"
import { type School } from "./compute"
import { NamedLoc } from "./GeoAutoComplete"

function toLocalCompare(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
}

const SCHOOL_LIMIT = 20
const optionsFilter: OptionsFilter = ({ options, search }) => {
  if (!search) {
    return options.slice(0, SCHOOL_LIMIT)
  }
  const queryWords = search.split(" ").map(toLocalCompare)

  return options
    .filter(
      option =>
        "label" in option &&
        queryWords.every(q =>
          option.label
            .split(" ")
            .map(toLocalCompare)
            .some(i => i.startsWith(q)),
        ),
    )
    .slice(0, SCHOOL_LIMIT)
}

interface Props {
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
  locInscription: NamedLoc
  setLocInscription: (v: NamedLoc) => void
}
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
  locInscription,
  setLocInscription,
}: Props) {
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

  const renderAutocompleteOption: AutocompleteProps["renderOption"] = useCallback(
    ({ option }) => {
      const item = primarySchools.find(p => p.id === option.value)
      return (
        <div>
          <Text size="sm">{item.name}</Text>
          <Text size="xs" opacity={0.65}>
            {item?.address}, {item?.city}
          </Text>
        </div>
      )
    },
    [primarySchools],
  )

  return (
    <>
      <Select
        label="École Primaire"
        searchable
        clearable
        placeholder="Choisir une école primaire"
        value={idPrimaire}
        onChange={setIdPrimaire}
        renderOption={renderAutocompleteOption}
        limit={20}
        data={prim}
        mt={"md"}
        filter={optionsFilter}
        leftSection={<IconSchool size="1rem" color={idPrimaire ? "green" : "#adb5bd"} />}
      />
      <AddressesForm
        valueHome={locHome}
        onSelectHome={setLocHome}
        valueInscription={locInscription}
        onSelectInscription={setLocInscription}
      />

      <Select
        label="Inscription en 1ere primaire"
        data={["2019", "2020", "2021", "2022", "2023", "2024", "2025"]}
        leftSection={<IconCalendar size="1rem" color={isFaultyDate ? "red" : date ? "green" : "#adb5bd"} />}
        value={date}
        onChange={setDate}
        mt={"md"}
      />
      {idPrimaire && !primSchool.ise && (
        <Select
          label="Indice Socio-Économique (1= moins favorisé)"
          data={Array.from({ length: 20 }, (_, i) => i + 1).map(i => ({ label: `${i}`, value: `${i}` }))}
          leftSection={<IconMoneybag size="1rem" color={date ? "green" : "#adb5bd"} />}
          value={`${ise}`}
          onChange={v => setIse(Number.parseInt(v, 10))}
          mt={"md"}
        />
      )}
      {secondaryYear && (
        <Text size={"sm"} c="gray" component="div">
          Pour une entrée en secondaire en août{" "}
          {showMoreDate ? (
            <div>
              <Select
                data={["2026", "2027", "2028", "2029"]}
                leftSection={
                  <IconCalendarQuestion size="1rem" color={isFaultyDate ? "red" : date ? "green" : "#adb5bd"} />
                }
                value={secondaryYear}
                onChange={setSecondaryYear}
                mt={"xs"}
                size="xs"
              />
            </div>
          ) : (
            <Button
              rightSection={<IconEdit size="1rem" />}
              variant="subtle"
              size="compact-md"
              onClick={() => setShowMoreDate(true)}
            >
              <Text td="underline">{secondaryYear}</Text>
            </Button>
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
        label={"Formule à partir de 2026-2027"}
        description="Pour les inscriptions à partir de l'année 2026-2027, l'indice socio-économique de l'école primaire ne sera plus pris en compte dans le
            calcul du score."
        checked={score2026}
        mt="md"
        mb="lg"
        onChange={event => setScore2026(event.currentTarget.checked)}
      />
    </>
  )
}
