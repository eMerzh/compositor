import { Alert, Box, Button, Container, Divider, Modal, Text } from "@mantine/core"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"
import { IconAlertCircle, IconCalculator, IconHeart } from "@tabler/icons-react"
import posthog from "posthog-js"
import { useMemo, useState } from "react"
import { BooleanParam, JsonParam, NumberParam, StringParam, useQueryParam, withDefault } from "use-query-params"
import { ComputeResult, computeAll, primarySchools, secondarySchools, UnexistingSchool } from "./compute"
import { NamedLoc } from "./GeoAutoComplete"
import { InputConfig } from "./InputConfig"
import ResultTable from "./ResultTable"
import SchoolDetail from "./SchoolDetail"

const Warning = () => {
  const [hide, setHide] = useLocalStorage({
    key: "hide-warning",
    defaultValue: false,
  })
  const [liked, setLiked] = useState(false)
  const onLike = () => {
    posthog.capture("like")
    setLiked(true)
  }
  if (hide) return <IconAlertCircle size="1rem" onClick={() => setHide(false)} />
  return (
    <Alert icon={<IconAlertCircle size="1rem" />} title="Compositor2000" withCloseButton onClose={() => setHide(true)}>
      Cet outil est un outil alternatif et ouvert de calcul de l'indice composite. Les données n'étant pas complètement
      ouvertes, il pourrait contenir des erreurs. N'oubliez par de vérifier le score obtenu sur le{" "}
      <a
        href="https://inscription.cfwb.be/nc/simulation-de-lindice-composite/"
        target="_blank"
        rel="noopener noreferrer"
      >
        calculateur officiel
      </a>
      , et de voir les disponibilités dans l'école de votre choix sur le{" "}
      <a
        href="https://monespace.fw-b.be/demarrer-demarche/?codeDemarche=ciriparent"
        target="_blank"
        rel="noopener noreferrer"
      >
        site adéquat
      </a>
      .
      <p>
        {liked ? (
          <>
            Merci beaucoup ! <IconHeart size="1rem" color="red" />
          </>
        ) : (
          <>
            {" "}
            Si ceci vous est utile, un{" "}
            <Button variant="outline" size="xs" compact onClick={onLike}>
              petit click
            </Button>{" "}
            pour la motivation
          </>
        )}
      </p>
    </Alert>
  )
}
function useConfiguration() {
  const [_, setRefresher] = useState(0)
  const refresh = () => setRefresher(Math.random())

  const [idPrimaire, setIdPrimaire] = useQueryParam("idPrim", StringParam)

  const [idSecondaire, setIdSecondaire] = useQueryParam("idSec", StringParam)

  const [locHome, setLocHome] = useQueryParam<NamedLoc | null>("homeloc", JsonParam)

  const [immersion, setImmersion] = useQueryParam("immersion", withDefault(BooleanParam, false))
  const [date, setDate] = useQueryParam("date", StringParam)
  const [secondaryYear, setSecondaryYear] = useQueryParam("secondaryYear", StringParam)
  const [ise, setIse] = useQueryParam("ise", withDefault(NumberParam, 10))
  const [score2026, setScore2026] = useQueryParam("score2026", withDefault(BooleanParam, true))

  return {
    idPrimaire,
    setIdPrimaire: (v: string) => {
      setIdPrimaire(v)
      refresh()
    },
    idSecondaire,
    setIdSecondaire: (v: string) => {
      setIdSecondaire(v)
      refresh()
    },
    locHome,
    setLocHome: (v: NamedLoc) => {
      setLocHome(v)
      refresh()
    },
    immersion,
    setImmersion: (v: boolean) => {
      setImmersion(v)
      refresh()
    },
    date,
    setDate: (v: string) => {
      setDate(v)
      const newYear = Number.parseInt(v, 10)
      setSecondaryYear(String(newYear + 6))
      refresh()
    },
    ise,
    setIse: (v: number) => {
      setIse(v)
      refresh()
    },
    setScore2026: (v: boolean) => {
      setScore2026(v)
      refresh()
    },
    score2026,
    secondaryYear,
    setSecondaryYear: (v: string) => {
      setSecondaryYear(v)
      refresh()
    },
  }
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
    score2026,
    setScore2026,
    secondaryYear,
    setSecondaryYear,
  } = useConfiguration()
  const [opened, { open, close }] = useDisclosure(false)
  const school_prim = primarySchools.find(school => school.id === idPrimaire)
  const detailsSecondaire = secondarySchools.find(school => school.id === idSecondaire)

  const scores = useMemo<ComputeResult[] | UnexistingSchool | null>(() => {
    if (!school_prim || !locHome || !date) return null
    try {
      const results = computeAll(secondarySchools, school_prim, locHome, date, immersion, secondaryYear, ise, score2026)
      return results
    } catch (e) {
      console.error(e)
      if (e instanceof UnexistingSchool) {
        return e
      }
    }
  }, [school_prim, locHome, immersion, date, ise, score2026, secondaryYear])

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
          score2026={score2026}
          setScore2026={setScore2026}
          secondaryYear={secondaryYear}
          setSecondaryYear={setSecondaryYear}
          isFaultyDate={scores instanceof UnexistingSchool}
        />
        {scores instanceof UnexistingSchool && (
          <Alert title="Erreur" color="red" mt={10} mb={10}>
            Selon les informations que vous avez entrées, l'école primaire n'existait pas au moment de l'inscription.
          </Alert>
        )}
      </Container>
    )
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
        isFaultyDate={false}
        score2026={score2026}
        setScore2026={setScore2026}
        secondaryYear={secondaryYear}
        setSecondaryYear={setSecondaryYear}
      />
      <Divider
        my="xs"
        variant="dashed"
        labelPosition="center"
        label={
          <>
            <IconCalculator size={12} />
            <Box ml={5}>Résultats</Box>
          </>
        }
      />
      <Modal
        size="xl"
        opened={opened}
        onClose={() => {
          close()
          setIdSecondaire(null)
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
            score2026={score2026}
            inscriptionSecondaryDate={secondaryYear}
          />
        )}
      </Modal>
      {scores && (
        <ResultTable
          scores={scores}
          secondarySchools={secondarySchools}
          selectedFase={idSecondaire}
          primarySchool={primarySchools.find(school => school.id === idPrimaire)}
          onSelectDetail={v => {
            setIdSecondaire(v)
            open()
          }}
          withImmersion={immersion}
        />
      )}
    </Container>
  )
}

export default AppContainer
