import { Alert, Box, Button, Container, Divider, Modal, Text } from "@mantine/core"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"
import { IconAlertCircle, IconCalculator, IconHeart } from "@tabler/icons-react"
import posthog from "posthog-js"
import { useEffect, useState } from "react"
import { BooleanParam, JsonParam, NumberParam, StringParam, useQueryParam, withDefault } from "use-query-params"
import { ComputeResult, primarySchools, secondarySchools, UnexistingSchool } from "./compute"
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
            <Button variant="outline" size="compact-xs" onClick={onLike}>
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
  const isFirstHalfOfYear = new Date().getMonth() < 6
  const [_, setRefresher] = useState(0)
  const refresh = () => setRefresher(Math.random())

  const [idPrimaire, setIdPrimaire] = useQueryParam("idPrim", StringParam)

  const [idSecondaire, setIdSecondaire] = useQueryParam("idSec", StringParam)

  const [locHome, setLocHome] = useQueryParam<NamedLoc | null>("homeloc", JsonParam)
  const [locInscription, setLocInscription] = useQueryParam<NamedLoc | null>("inscriptionloc", JsonParam)

  const [immersion, setImmersion] = useQueryParam("immersion", withDefault(BooleanParam, false))
  const [date, setDate] = useQueryParam(
    "date",
    withDefault(StringParam, `${new Date().getFullYear() - (isFirstHalfOfYear ? 6 : 5)}`),
  )
  const [secondaryYear, setSecondaryYear] = useQueryParam(
    "secondaryYear",
    withDefault(StringParam, `${new Date().getFullYear() + (isFirstHalfOfYear ? 0 : 1)}`),
  )
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
    locInscription,
    setLocInscription: (v: NamedLoc) => {
      setLocInscription(v)
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
    locInscription,
    setLocInscription,
  } = useConfiguration()
  const [opened, { open, close }] = useDisclosure(false)
  const selectedPrimarySchool = primarySchools.find(school => school.id === idPrimaire)
  const selectedSecondarySchool = secondarySchools.find(school => school.id === idSecondaire)
  const [isComputing, setIsComputing] = useState(false)
  const [scores, setScores] = useState<ComputeResult[] | UnexistingSchool | null>(null)

  // Use Web Worker for heavy computation
  useEffect(() => {
    if (!selectedPrimarySchool || !locHome || !date) {
      setScores(null)
      return
    }

    setIsComputing(true)
    // Keep old scores visible while computing

    // Defer worker creation to allow UI to update first
    const timeoutId = setTimeout(() => {
      // Create worker from separate file
      const worker = new Worker(new URL("./computeAllWorker.ts", import.meta.url), {
        type: "module",
      })

      // Send data to worker
      worker.postMessage({
        secondarySchools,
        primarySchool: selectedPrimarySchool,
        locHome,
        locInscription: locInscription || locHome,
        date,
        immersion,
        inscriptionSecondaryYear: secondaryYear,
        ise,
        score2026,
      })

      // Handle worker response
      worker.onmessage = (e: MessageEvent) => {
        if (e.data.success) {
          setScores(e.data.data)
        } else {
          console.error("Worker error:", e.data.error)
          if (e.data.isUnexistingSchool) {
            setScores(new UnexistingSchool(e.data.error))
          } else {
            setScores(null)
          }
        }
        setIsComputing(false)
        worker.terminate()
      }

      // Handle worker errors
      worker.onerror = error => {
        console.error("Worker error:", error)
        setScores(null)
        setIsComputing(false)
        worker.terminate()
      }
    }, 0)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
    }
  }, [selectedPrimarySchool, locHome, locInscription, immersion, date, ise, score2026, secondaryYear])

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
          locInscription={locInscription}
          setLocInscription={setLocInscription}
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
        locInscription={locInscription}
        setLocInscription={setLocInscription}
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
            <Box ml={5}>Résultats {isComputing && "(calcul en cours...)"}</Box>
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
        title={<Text fw="bolder">{selectedSecondarySchool?.name}</Text>}
      >
        {selectedSecondarySchool && (
          <SchoolDetail
            school={selectedSecondarySchool}
            scores={scores}
            locHome={locHome}
            locInscription={locInscription || locHome}
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
