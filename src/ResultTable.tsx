import { ActionIcon, Center, Group, Select, Table, Text, rem } from "@mantine/core";
import { IconInfoHexagonFilled, IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { ComputeResult, distanceSortAsc, distanceSortDesc, scoreSortAsc, scoreSortDesc } from "./compute";
import { round } from "./utils";
import Score from "./Score";

type SortColumn = "distance" | "score";
type SortOrder = "asc" | "desc";

const getSortFn = (sortColumn: SortColumn, sortOrder: SortOrder) => {
  if (sortColumn == "distance") {
    return sortOrder == "asc" ? distanceSortAsc : distanceSortDesc;
  } else {
    return sortOrder == "asc" ? scoreSortAsc : scoreSortDesc;
  }
};

interface Props {
  networks: string[];
  scores: ComputeResult[];
  selectedFase: string;
  onSelectDetail: (schoolFase: string) => void;
}
export default function ResultTable({ networks, scores, onSelectDetail, selectedFase }: Props) {
  const [filterNetwork, setFilterNetwork] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [sortColumn, setSortColumn] = useState<SortColumn>("score");
  const schoolsScores = useMemo(() => {
    return Array.from(scores || [])
      .filter((s) => !filterNetwork || s.school.reseau === filterNetwork)
      .sort(getSortFn(sortColumn, sortOrder));
  }, [scores, sortColumn, sortOrder, filterNetwork]);

  return (
    <Group>
      <Select
        label="Réseau"
        searchable
        clearable
        placeholder="Choisir un réseau"
        value={filterNetwork}
        onChange={(v) => setFilterNetwork(v)}
        data={networks}
      />
      <Table striped>
        <thead>
          <tr>
            <th>Name</th>
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
                key={`${school.ndeg_fase_de_l_implantation} ${school.adresse_de_l_implantation}`}
                style={{
                  backgroundColor: school.ndeg_fase_de_l_implantation == selectedFase ? "#7AD1DD" : undefined,
                }}
              >
                <th style={{ textTransform: "capitalize" }}>
                  <ActionIcon
                    onClick={() => {
                      onSelectDetail(school.ndeg_fase_de_l_implantation);
                    }}
                    display="inline"
                  >
                    <IconInfoHexagonFilled size={rem(14)} />
                  </ActionIcon>
                  {school.nom_de_l_etablissement.toLowerCase()}
                  <Text fz="xs" fw={300} c="dimmed">
                    {school.adresse_de_l_implantation}, {school.commune_de_l_implantation}
                  </Text>
                </th>
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
