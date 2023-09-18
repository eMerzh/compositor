import { Container } from "@mantine/core";
import { MantineProvider } from "@mantine/core";

import { useMemo, useState } from "react";

import { BooleanParam, JsonParam, QueryParamProvider } from "use-query-params";
import { WindowHistoryAdapter } from "use-query-params/adapters/window";
import { useQueryParam, StringParam } from "use-query-params";
import { ComputeResult, computeAll, primarySchools, secondarySchools } from "./compute";

import { NamedLoc } from "./GeoAutoComplete";
import { InputConfig } from "./InputConfig";
import ResultTable from "./ResultTable";
import SchoolDetail from "./SchoolDetail";

export default function Home() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <QueryParamProvider adapter={WindowHistoryAdapter}>
        <Compute />
      </QueryParamProvider>
    </MantineProvider>
  );
}

function useConfiguration() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setRefresher] = useState(0);
  const refresh = () => setRefresher(Math.random());

  const [idPrimaire, setIdPrimaire] = useQueryParam("idPrim", StringParam);

  const [idSecondaire, setIdSecondaire] = useQueryParam("idSec", StringParam);

  const [locHome, setLocHome] = useQueryParam<NamedLoc | null>("homeloc", JsonParam);

  const [immersion, setImmersion] = useQueryParam("immersion", BooleanParam);
  const [date, setDate] = useQueryParam("date", StringParam);

  return {
    idPrimaire,
    setIdPrimaire: (v: string) => {
      setIdPrimaire(v);
      refresh();
    },
    idSecondaire,
    setIdSecondaire: (v: string) => {
      setIdSecondaire(v);
      refresh();
    },
    locHome,
    setLocHome: (v: NamedLoc) => {
      setLocHome(v);
      refresh();
    },
    immersion,
    setImmersion: (v: boolean) => {
      setImmersion(v);
      refresh();
    },
    date,
    setDate: (v: string) => {
      setDate(v);
      refresh();
    },
  };
}
function Compute() {
  const {
    idPrimaire,
    setIdPrimaire,
    idSecondaire,
    setIdSecondaire,
    locHome,
    setLocHome,
    immersion,
    setImmersion,
    date,
    setDate,
  } = useConfiguration();
  const school_prim = primarySchools.find((school) => school.id === idPrimaire);
  const detailsSecondaire = secondarySchools.find((school) => school.id === idSecondaire);

  const scores = useMemo<ComputeResult[] | null>(() => {
    if (!school_prim || !locHome) return null;

    const results = computeAll(secondarySchools, school_prim, locHome, date, immersion);
    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school_prim?.id, locHome, immersion, date]);

  const networks = useMemo(() => [...new Set(secondarySchools.map((s) => s.network))], []);

  if (!school_prim || !locHome || !date) {
    return (
      <Container>
        <InputConfig
          primarySchools={primarySchools}
          idPrimaire={idPrimaire}
          setIdPrimaire={setIdPrimaire}
          locHome={locHome}
          setLocHome={setLocHome}
          immersion={immersion}
          setImmersion={setImmersion}
          date={date}
          setDate={setDate}
        />
      </Container>
    );
  }

  let result;
  if (scores && detailsSecondaire) {
    result = scores.find((s) => s.school.id == detailsSecondaire.id);
  }

  return (
    <Container>
      <InputConfig
        primarySchools={primarySchools}
        idPrimaire={idPrimaire}
        setIdPrimaire={setIdPrimaire}
        locHome={locHome}
        setLocHome={setLocHome}
        immersion={immersion}
        setImmersion={setImmersion}
        date={date}
        setDate={setDate}
      />
      <hr />
      {detailsSecondaire && result && (
        <SchoolDetail
          result={result}
          locHome={locHome}
          onClose={() => {
            setIdSecondaire(null);
          }}
        />
      )}
      {scores && (
        <ResultTable scores={scores} networks={networks} selectedFase={idSecondaire} onSelectDetail={setIdSecondaire} />
      )}
    </Container>
  );
}
