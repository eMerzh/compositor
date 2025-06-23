import { Alert, Center, Group, MultiSelect, rem, Table, Text } from "@mantine/core"
import { IconAlertCircle, IconFilter, IconSortAscending, IconSortDescending } from "@tabler/icons-react"
import { ReactNode, useCallback, useMemo, useState } from "react"
import { ComputeResult, distanceSort, fillSort, School, scoreSort } from "./compute"
import FillIcon from "./FillIcon"
import Score from "./Score"
import { round } from "./utils"

type SortColumn = "distance" | "score" | "fill"
type SortOrder = "asc" | "desc"

const getSortFn = (sortColumn: SortColumn) => {
  if (sortColumn === "distance") {
    return distanceSort
  }
  if (sortColumn === "score") {
    return scoreSort
  }
  if (sortColumn === "fill") {
    return fillSort
  }
}

interface Props {
  secondarySchools: School[]
  primarySchool: School
  scores: ComputeResult[]
  selectedFase: string
  withImmersion: boolean
  onSelectDetail: (schoolFase: string) => void
}
export default function ResultTable({
  secondarySchools,
  primarySchool,
  scores,
  onSelectDetail,
  selectedFase,
  withImmersion,
}: Props) {
  const [filterNetwork, setFilterNetwork] = useState<string[]>([])
  const networks = useMemo(() => [...new Set(secondarySchools.map(s => s.network))], [secondarySchools])
  const [filterCity, setFilterCity] = useState<string[]>([])
  const cities = useMemo(() => [...new Set(secondarySchools.map(s => s.city))], [secondarySchools])
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [sortColumn, setSortColumn] = useState<SortColumn>("score")
  const schoolsScores = useMemo(() => {
    return Array.from(scores || [])
      .filter(s => !filterNetwork.length || filterNetwork.includes(s.school.network))
      .filter(s => !withImmersion || s.school.immersion)
      .filter(s => !filterCity.length || filterCity.includes(s.school.city))
      .sort(getSortFn(sortColumn))
      [sortOrder === "desc" ? "reverse" : "slice"]()
  }, [scores, sortColumn, sortOrder, filterNetwork, withImmersion, filterCity])

  let warnMsg: ReactNode
  if (primarySchool.ise === null) {
    warnMsg = (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Attention" color="yellow">
        L'école primaire que vous avez séléctionné n'a pas d'indice socio-économique. Le score (n°8) est donc calculé
        avec un indice moyen de 10/20 qui représente une hypothétique moyenne des élèves de l'école secondaire. Prenez
        donc les scores avec des pincettes.
      </Alert>
    )
  }
  const orderHandler = useCallback(
    (column: SortColumn) => () => {
      setSortColumn(column)
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    },
    [sortOrder],
  )

  return (
    <Group>
      <MultiSelect
        label="Filtrer par réseau"
        searchable
        clearable
        description="Limite les résultats aux écoles de ces réseaux (optionel)"
        placeholder="Réseau"
        value={filterNetwork}
        onChange={v => setFilterNetwork(v)}
        icon={<IconFilter size="1rem" />}
        data={networks}
      />
      <MultiSelect
        label="Filtrer par ville"
        description="Limite les résultats aux écoles de ces villes (optionel)"
        searchable
        clearable
        placeholder="Ville"
        value={filterCity}
        onChange={v => setFilterCity(v)}
        icon={<IconFilter size="1rem" />}
        data={cities}
      />
      {warnMsg}
      <Table striped>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Réseau</th>
            <th onClick={orderHandler("fill")} onKeyDown={orderHandler("fill")}>
              Rempl. 2022
              {sortColumn === "fill" &&
                (sortOrder === "asc" ? <IconSortAscending size={rem(14)} /> : <IconSortDescending size={rem(14)} />)}
            </th>
            <th onClick={orderHandler("distance")} onKeyDown={orderHandler("distance")}>
              <Center>
                Distance{" "}
                {sortColumn === "distance" &&
                  (sortOrder === "asc" ? <IconSortAscending size={rem(14)} /> : <IconSortDescending size={rem(14)} />)}
              </Center>
            </th>
            <th onClick={orderHandler("score")} onKeyDown={orderHandler("score")}>
              <Center>
                Score{" "}
                {sortColumn === "score" &&
                  (sortOrder === "asc" ? <IconSortAscending size={rem(14)} /> : <IconSortDescending size={rem(14)} />)}
              </Center>
            </th>
          </tr>
        </thead>
        <tbody>
          {schoolsScores.map(({ school, score, distance }) => {
            return (
              <tr
                key={school.id}
                style={{
                  backgroundColor: school.id === selectedFase ? "#7AD1DD" : undefined,
                  cursor: "pointer",
                }}
                onClick={() => {
                  onSelectDetail(school.id)
                }}
                onKeyDown={() => {
                  onSelectDetail(school.id)
                }}
              >
                <th style={{ textTransform: "capitalize" }}>
                  {school.name}
                  <Text fz="xs" fw={300} c="dimmed">
                    {school.address}, {school.city}
                  </Text>
                </th>
                <td>{school.network}</td>
                <td>{school.fill && <FillIcon level={school.fill["2022"]} />}</td>
                <td>{round(distance, 2)} km</td>
                <td>
                  <Score score={score.total}>{round(score.total, 3)}</Score>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Group>
  )
}
