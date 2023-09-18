import { ActionIcon, Center, Group, MultiSelect, Table, Text, rem } from "@mantine/core";
import { IconInfoHexagonFilled, IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { ComputeResult, School, distanceSortAsc, distanceSortDesc, scoreSortAsc, scoreSortDesc } from "./compute";
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
  secondarySchools: School[];
  scores: ComputeResult[];
  selectedFase: string;
  onSelectDetail: (schoolFase: string) => void;
}
export default function ResultTable({ secondarySchools, scores, onSelectDetail, selectedFase }: Props) {
  const [filterNetwork, setFilterNetwork] = useState<string[]>([]);
  const networks = useMemo(() => [...new Set(secondarySchools.map((s) => s.network))], [secondarySchools]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [sortColumn, setSortColumn] = useState<SortColumn>("score");
  const schoolsScores = useMemo(() => {
    return Array.from(scores || [])
      .filter((s) => !filterNetwork.length || filterNetwork.includes(s.school.network))
      .sort(getSortFn(sortColumn, sortOrder));
  }, [scores, sortColumn, sortOrder, filterNetwork]);

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
      <Table striped>
        <thead>
          <tr>
            <th>Name</th>
            <th>Réseau</th>
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
                }}
              >
                <th style={{ textTransform: "capitalize" }}>
                  <ActionIcon
                    onClick={() => {
                      onSelectDetail(school.id);
                    }}
                    display="inline"
                  >
                    <IconInfoHexagonFilled size={rem(14)} />
                  </ActionIcon>
                  {school.name}
                  <Text fz="xs" fw={300} c="dimmed">
                    {school.address}, {school.city}
                  </Text>
                </th>
                <td>{school.network}</td>
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
