import { Center, Group, MultiSelect, Table, Text, rem } from "@mantine/core";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { ComputeResult, School, distanceSort, scoreSort, fillSort } from "./compute";
import { round } from "./utils";
import Score from "./Score";
import FillIcon from "./FillIcon";

type SortColumn = "distance" | "score" | "fill";
type SortOrder = "asc" | "desc";

const getSortFn = (sortColumn: SortColumn) => {
  if (sortColumn == "distance") {
    return distanceSort;
  } else if (sortColumn == "score") {
    return scoreSort;
  } else if (sortColumn == "fill") {
    return fillSort;
  }
};

interface Props {
  secondarySchools: School[];
  scores: ComputeResult[];
  selectedFase: string;
  withImmersion: boolean;
  onSelectDetail: (schoolFase: string) => void;
}
export default function ResultTable({ secondarySchools, scores, onSelectDetail, selectedFase, withImmersion }: Props) {
  const [filterNetwork, setFilterNetwork] = useState<string[]>([]);
  const networks = useMemo(() => [...new Set(secondarySchools.map((s) => s.network))], [secondarySchools]);
  const [filterCity, setFilterCity] = useState<string[]>([]);
  const cities = useMemo(() => [...new Set(secondarySchools.map((s) => s.city))], [secondarySchools]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [sortColumn, setSortColumn] = useState<SortColumn>("score");
  const schoolsScores = useMemo(() => {
    return Array.from(scores || [])
      .filter((s) => !filterNetwork.length || filterNetwork.includes(s.school.network))
      .filter((s) => !withImmersion || s.school.immersion)
      .filter((s) => !filterCity.length || filterCity.includes(s.school.city))
      .sort(getSortFn(sortColumn))
      [sortOrder == "asc" ? "reverse" : "slice"](); // eslint-disable-line no-unexpected-multiline
  }, [scores, sortColumn, sortOrder, filterNetwork, withImmersion, filterCity]);

  return (
    <Group>
      <MultiSelect
        label="Réseau"
        searchable
        clearable
        placeholder="Choisir un réseau"
        value={filterNetwork}
        onChange={(v) => setFilterNetwork(v)}
        data={networks}
      />
      <MultiSelect
        label="Ville"
        searchable
        clearable
        placeholder="Choisir une ville"
        value={filterCity}
        onChange={(v) => setFilterCity(v)}
        data={cities}
      />
      <Table striped>
        <thead>
          <tr>
            <th>Name</th>
            <th>Réseau</th>
            <th
              onClick={() => {
                setSortColumn("fill");
                setSortOrder(sortOrder == "asc" ? "desc" : "asc");
              }}
            >
              Rempl. 2022
              {sortColumn === "fill" &&
                (sortOrder == "asc" ? <IconSortAscending size={rem(14)} /> : <IconSortDescending size={rem(14)} />)}
            </th>
            <th
              onClick={() => {
                setSortColumn("distance");
                setSortOrder(sortOrder == "asc" ? "desc" : "asc");
              }}
            >
              <Center>
                Distance{" "}
                {sortColumn === "distance" &&
                  (sortOrder == "asc" ? <IconSortAscending size={rem(14)} /> : <IconSortDescending size={rem(14)} />)}
              </Center>
            </th>
            <th
              onClick={() => {
                setSortColumn("score");
                setSortOrder(sortOrder == "asc" ? "desc" : "asc");
              }}
            >
              <Center>
                Score{" "}
                {sortColumn === "score" &&
                  (sortOrder == "asc" ? <IconSortAscending size={rem(14)} /> : <IconSortDescending size={rem(14)} />)}
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
                  backgroundColor: school.id == selectedFase ? "#7AD1DD" : undefined,
                  cursor: "pointer",
                }}
                onClick={() => {
                  onSelectDetail(school.id);
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
            );
          })}
        </tbody>
      </Table>
    </Group>
  );
}
