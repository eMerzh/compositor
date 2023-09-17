import { ActionIcon, Select, Table } from "@mantine/core";
import {
  IconInfoHexagonFilled,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import {
  ComputeResult,
  distanceSortAsc,
  distanceSortDesc,
  scoreSortAsc,
  scoreSortDesc,
} from "./compute";
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
export default function ResultTable({
  networks,
  scores,
  onSelectDetail,
  selectedFase,
}: Props) {
  const [filterNetwork, setFilterNetwork] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [sortColumn, setSortColumn] = useState<SortColumn>("score");
  const schoolsScores = useMemo(() => {
    return Array.from(scores || []).sort(getSortFn(sortColumn, sortOrder));
  }, [scores, sortColumn, sortOrder]);

  return (
    <>
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
            <th>Commune</th>
            <th
              onClick={() => {
                setSortColumn("distance");
                setSortOrder(sortOrder == "asc" ? "desc" : "asc");
              }}
            >
              <span style={{ display: "flex" }}>
                Distance{" "}
                {sortColumn === "distance" &&
                  (sortOrder == "asc" ? (
                    <IconSortAscending />
                  ) : (
                    <IconSortDescending />
                  ))}
              </span>
            </th>
            <th
              onClick={() => {
                setSortColumn("score");
                setSortOrder(sortOrder == "asc" ? "desc" : "asc");
              }}
            >
              <span style={{ display: "flex" }}>
                Score{" "}
                {sortColumn === "score" &&
                  (sortOrder == "asc" ? (
                    <IconSortAscending />
                  ) : (
                    <IconSortDescending />
                  ))}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {schoolsScores.map(({ school, score, distance }) => {
            return (
              <tr
                key={`${school.ndeg_fase_de_l_implantation} ${school.adresse_de_l_implantation}`}
                style={{
                  backgroundColor:
                    school.ndeg_fase_de_l_implantation == selectedFase
                      ? "#7AD1DD"
                      : undefined,
                }}
              >
                <th style={{ textTransform: "capitalize" }}>
                  <ActionIcon
                    onClick={() => {
                      onSelectDetail(school.ndeg_fase_de_l_implantation);
                    }}
                    style={{ display: "inline" }}
                  >
                    <IconInfoHexagonFilled />
                  </ActionIcon>
                  {school.nom_de_l_etablissement.toLowerCase()}
                </th>
                <td>{school.commune_de_l_implantation}</td>
                <td>{round(distance, 2)} km</td>
                <td>
                  <Score score={score.total}>{round(score.total, 3)}</Score>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
