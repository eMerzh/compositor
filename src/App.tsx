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

  const [fasePrimaire, setFasePrimaire] = useQueryParam("fasePrim", StringParam);

  const [faseSecondaire, setFaseSecondaire] = useQueryParam("faseSec", StringParam);

  const [locHome, setLocHome] = useQueryParam<NamedLoc | null>("homeloc", JsonParam);

  const [immersion, setImmersion] = useQueryParam("immersion", BooleanParam);

  return {
    fasePrimaire,
    setFasePrimaire: (v: string) => {
      setFasePrimaire(v);
      refresh();
    },
    faseSecondaire,
    setFaseSecondaire: (v: string) => {
      setFaseSecondaire(v);
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
  };
}
function Compute() {
  const {
    fasePrimaire,
    setFasePrimaire,
    faseSecondaire,
    setFaseSecondaire,
    locHome,
    setLocHome,
    immersion,
    setImmersion,
  } = useConfiguration();
  const school_prim = primarySchools.find((school) => school.ndeg_fase_de_l_implantation === fasePrimaire);
  const detailsSecondaire = secondarySchools.find((school) => school.ndeg_fase_de_l_implantation === faseSecondaire);

  const scores = useMemo<ComputeResult[] | null>(() => {
    if (!school_prim || !locHome) return null;

    const results = computeAll(secondarySchools, school_prim, locHome, immersion);
    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school_prim?.ndeg_fase_de_l_implantation, locHome, immersion]);

  const networks = useMemo(() => [...new Set(secondarySchools.map((s) => s.reseau))], []);

  if (!school_prim || !locHome) {
    return (
      <Container>
        <InputConfig
          primarySchools={primarySchools}
          fasePrimaire={fasePrimaire}
          setFasePrimaire={setFasePrimaire}
          locHome={locHome}
          setLocHome={setLocHome}
          immersion={immersion}
          setImmersion={setImmersion}
        />
      </Container>
    );
  }

  let result;
  if (scores && detailsSecondaire) {
    result = scores.find((s) => s.school.ndeg_fase_de_l_implantation == detailsSecondaire.ndeg_fase_de_l_implantation);
  }

  return (
    <Container>
      <InputConfig
        primarySchools={primarySchools}
        fasePrimaire={fasePrimaire}
        setFasePrimaire={setFasePrimaire}
        locHome={locHome}
        setLocHome={setLocHome}
        immersion={immersion}
        setImmersion={setImmersion}
      />

      {detailsSecondaire && result && (
        <SchoolDetail
          result={result}
          locHome={locHome}
          onClose={() => {
            setFaseSecondaire(null);
          }}
        />
      )}
      {scores && (
        <ResultTable
          scores={scores}
          networks={networks}
          selectedFase={faseSecondaire}
          onSelectDetail={setFaseSecondaire}
        />
      )}
    </Container>
  );
}
