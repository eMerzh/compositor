import { Alert, Center, Group, MultiSelect, rem, ScrollArea, Stack, Table, Text } from "@mantine/core"
import { IconAlertCircle, IconFilter, IconSortAscending, IconSortDescending } from "@tabler/icons-react"
import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ComputeResult, distanceSort, fillSort, School, scoreSort } from "./compute"
import FillIcon from "./FillIcon"
import MinIndiceDisplay from "./MinIndiceDisplay"
import Score from "./Score"
import { round } from "./utils"

type SortColumn = "distance" | "score" | "fill"
type SortOrder = "asc" | "desc"

const THIS_YEAR = 2025 // last year available in the fill data
const INITIAL_DISPLAY = 50 // Initial number of rows to display

// Memoized row component to prevent unnecessary re-renders
const TableRow = memo(
  ({
    school,
    score,
    distance,
    isSelected,
    onSelect,
  }: {
    school: School
    score: ComputeResult["score"]
    distance: number
    isSelected: boolean
    onSelect: (id: string) => void
  }) => (
    <Table.Tr
      key={school.id}
      style={{
        backgroundColor: isSelected ? "#7AD1DD" : undefined,
        cursor: "pointer",
      }}
      onClick={() => onSelect(school.id)}
      onKeyDown={() => onSelect(school.id)}
    >
      <Table.Th style={{ textTransform: "capitalize" }}>
        {school.name}
        <Text fz="xs" fw={300} c="dimmed">
          {school.address}, {school.city}
        </Text>
      </Table.Th>
      <Table.Td>{school.network}</Table.Td>
      <Table.Td>{school.fill && <FillIcon level={school.fill[THIS_YEAR]?.fill_number} />}</Table.Td>
      <Table.Td>{round(distance, 2)} km</Table.Td>
      <Table.Td>
        <Stack>
          <Score score={score.total}>{round(score.total, 3)}</Score>
          <MinIndiceDisplay school={school} currentScore={score.total} withYear />
        </Stack>
      </Table.Td>
    </Table.Tr>
  ),
)

const getSortFn = (sortColumn: SortColumn): ((a: ComputeResult, b: ComputeResult) => number) => {
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
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY)
  const viewportRef = useRef<HTMLDivElement>(null)

  const schoolsScores = useMemo(() => {
    setDisplayCount(INITIAL_DISPLAY) // Reset when data changes
    return Array.from(scores || [])
      .filter(s => !filterNetwork.length || filterNetwork.includes(s.school.network))
      .filter(s => !withImmersion || s.school.immersion)
      .filter(s => !filterCity.length || filterCity.includes(s.school.city))
      .filter(s => !Number.isNaN(s.score.total))
      .sort(getSortFn(sortColumn))
      [sortOrder === "desc" ? "reverse" : "slice"]()
  }, [scores, sortColumn, sortOrder, filterNetwork, withImmersion, filterCity])

  const displayedScores = useMemo(() => schoolsScores.slice(0, displayCount), [schoolsScores, displayCount])

  // Infinite scroll effect
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport
      const bottom = scrollHeight - scrollTop <= clientHeight + 200
      if (bottom && displayCount < schoolsScores.length) {
        setDisplayCount(prev => Math.min(prev + 50, schoolsScores.length))
      }
    }

    viewport.addEventListener("scroll", handleScroll)
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [displayCount, schoolsScores.length])

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
        leftSection={<IconFilter size="1rem" />}
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
        leftSection={<IconFilter size="1rem" />}
        data={cities}
      />
      {warnMsg}
      <Text size="sm" c="dimmed" mb="xs">
        Affichage {displayedScores.length} sur {schoolsScores.length} écoles
      </Text>
      <ScrollArea h={600} viewportRef={viewportRef}>
        <Table>
          <Table.Thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>
            <Table.Tr>
              <Table.Th>Nom</Table.Th>
              <Table.Th>Réseau</Table.Th>
              <Table.Th onClick={orderHandler("fill")} onKeyDown={orderHandler("fill")}>
                Rempl. 2025
                {sortColumn === "fill" &&
                  (sortOrder === "asc" ? <IconSortAscending size={rem(14)} /> : <IconSortDescending size={rem(14)} />)}
              </Table.Th>
              <Table.Th onClick={orderHandler("distance")} onKeyDown={orderHandler("distance")}>
                <Center>
                  Distance{" "}
                  {sortColumn === "distance" &&
                    (sortOrder === "asc" ? (
                      <IconSortAscending size={rem(14)} />
                    ) : (
                      <IconSortDescending size={rem(14)} />
                    ))}
                </Center>
              </Table.Th>
              <Table.Th onClick={orderHandler("score")} onKeyDown={orderHandler("score")}>
                <Center>
                  Score{" "}
                  {sortColumn === "score" &&
                    (sortOrder === "asc" ? (
                      <IconSortAscending size={rem(14)} />
                    ) : (
                      <IconSortDescending size={rem(14)} />
                    ))}
                </Center>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {displayedScores.map(({ school, score, distance }) => (
              <TableRow
                key={school.id}
                school={school}
                score={score}
                distance={distance}
                isSelected={school.id === selectedFase}
                onSelect={onSelectDetail}
              />
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Group>
  )
}
