import { Container, Drawer, Text } from "@mantine/core";
import { useMemo, useState } from "react";
import { BooleanParam, JsonParam } from "use-query-params";
import { useQueryParam, StringParam } from "use-query-params";
import { useDisclosure } from "@mantine/hooks";

import { ComputeResult, computeAll, primarySchools, secondarySchools } from "./compute";
import { NamedLoc } from "./GeoAutoComplete";
import { InputConfig } from "./InputConfig";
import ResultTable from "./ResultTable";
import SchoolDetail from "./SchoolDetail";
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
function AppContainer() {
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
  const [opened, { open, close }] = useDisclosure(false);
  const school_prim = primarySchools.find((school) => school.id === idPrimaire);
  const detailsSecondaire = secondarySchools.find((school) => school.id === idSecondaire);

  const scores = useMemo<ComputeResult[] | null>(() => {
    if (!school_prim || !locHome || !date) return null;

    const results = computeAll(secondarySchools, school_prim, locHome, date, immersion);
    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school_prim?.id, locHome?.lat, locHome?.lon, immersion, date]);

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
      <Drawer
        opened={opened}
        onClose={() => {
          close();
          setIdSecondaire(null);
        }}
        title={<Text fw="bolder">{detailsSecondaire?.name}</Text>}
        position="right"
      >
        {detailsSecondaire && <SchoolDetail school={detailsSecondaire} scores={scores} locHome={locHome} />}
      </Drawer>
      {scores && (
        <ResultTable
          scores={scores}
          secondarySchools={secondarySchools}
          selectedFase={idSecondaire}
          onSelectDetail={(v) => {
            setIdSecondaire(v);
            open();
          }}
          withImmersion={immersion}
        />
      )}
    </Container>
  );
}

export default AppContainer;
