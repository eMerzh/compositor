import { Alert, Container, Modal, Text } from "@mantine/core";
import { useMemo, useState } from "react";
import { BooleanParam, JsonParam, NumberParam, withDefault } from "use-query-params";
import { useQueryParam, StringParam } from "use-query-params";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";

import { ComputeResult, UnexistingSchool, computeAll, primarySchools, secondarySchools } from "./compute";
import { NamedLoc } from "./GeoAutoComplete";
import { InputConfig } from "./InputConfig";
import ResultTable from "./ResultTable";
import SchoolDetail from "./SchoolDetail";
import { IconAlertCircle } from "@tabler/icons-react";

const Warning = () => {
  const [hide, setHide] = useLocalStorage({ key: "hide-warning", defaultValue: false });
  if (hide) return <IconAlertCircle size="1rem" onClick={() => setHide(false)} />;
  return (
    <Alert icon={<IconAlertCircle size="1rem" />} title="Compositor2000" withCloseButton onClose={() => setHide(true)}>
      Cet outil est un outil alternatif de calcul de l'indice composite. Les données n'étant pas complètement ouvertes,
      il pourrait contenir des erreurs. N'oubliez par de vérifier le score obtenu sur le{" "}
      <a href="https://inscription.cfwb.be/nc/simulation-de-lindice-composite/" target="_blank" rel="noopener">
        calculateur officiel
      </a>
      , et de voir les disponibilités dans l'école de votre choix sur le{" "}
      <a href="https://monespace.fw-b.be/demarrer-demarche/?codeDemarche=ciriparent" target="_blank" rel="noopener">
        site adéquat
      </a>
      .
    </Alert>
  );
};
function useConfiguration() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setRefresher] = useState(0);
  const refresh = () => setRefresher(Math.random());

  const [idPrimaire, setIdPrimaire] = useQueryParam("idPrim", StringParam);

  const [idSecondaire, setIdSecondaire] = useQueryParam("idSec", StringParam);

  const [locHome, setLocHome] = useQueryParam<NamedLoc | null>("homeloc", JsonParam);

  const [immersion, setImmersion] = useQueryParam("immersion", BooleanParam);
  const [date, setDate] = useQueryParam("date", StringParam);
  const [ise, setIse] = useQueryParam("ise", withDefault(NumberParam, 10));

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
    ise,
    setIse: (v: number) => {
      setIse(v);
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
    ise,
    setIse,
  } = useConfiguration();
  const [opened, { open, close }] = useDisclosure(false);
  const school_prim = primarySchools.find((school) => school.id === idPrimaire);
  const detailsSecondaire = secondarySchools.find((school) => school.id === idSecondaire);

  const scores = useMemo<ComputeResult[] | UnexistingSchool | null>(() => {
    if (!school_prim || !locHome || !date) return null;
    try {
      const results = computeAll(secondarySchools, school_prim, locHome, date, immersion, ise);
      return results;
    } catch (e) {
      console.error(e);
      if (e instanceof UnexistingSchool) {
        return e;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school_prim?.id, locHome?.lat, locHome?.lon, immersion, date, ise]);

  if (!scores || scores instanceof UnexistingSchool) {
    return (
      <Container>
        <Warning />
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
          ise={ise}
          setIse={setIse}
          isFaultyDate={scores instanceof UnexistingSchool}
        />
        {scores instanceof UnexistingSchool && (
          <Alert title="Erreur" color="red" mt={10} mb={10}>
            Selon les informations que vous avez entrées, l'école primaire n'existait pas au moment de l'inscription.
          </Alert>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <Warning />
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
        ise={ise}
        setIse={setIse}
      />
      <hr />
      <Modal
        size="xl"
        opened={opened}
        onClose={() => {
          close();
          setIdSecondaire(null);
        }}
        title={<Text fw="bolder">{detailsSecondaire?.name}</Text>}
      >
        {detailsSecondaire && (
          <SchoolDetail
            school={detailsSecondaire}
            scores={scores}
            locHome={locHome}
            date={date}
            immersion={immersion}
            ise={ise}
          />
        )}
      </Modal>
      {scores && (
        <ResultTable
          scores={scores}
          secondarySchools={secondarySchools}
          selectedFase={idSecondaire}
          primarySchool={primarySchools.find((school) => school.id === idPrimaire)}
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
