import { Anchor, Badge, Button, Card, Container, Group, List, Popover, Table, Text, Tooltip } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconAlertCircle,
  IconBike,
  IconCar,
  IconGridDots,
  IconInfoCircle,
  IconRoute,
  IconWalk,
} from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { ComputeResult, GeoLoc, getScoreGrid, School } from "./compute"
import FillIcon from "./FillIcon"
import { accessToken } from "./GeoAutoComplete"
import MapInspect from "./MapInspect"
import MinIndiceDisplay from "./MinIndiceDisplay"
import Score from "./Score"
import { round } from "./utils"

const Explanation = [
  {
    name: "Préférence",
    description:
      "Ce coefficient permet de tenir compte de l’ordre de vos préférences. Pour les 5 écoles secondaires de meilleure préférence, votre enfant va obtenir un coefficient préférentiel. Pour l’école secondaire de 1re préférence, vous obtenez la valeur maximale de 1,5.",
    scoreProperty: "coef_1",
  },
  {
    name: "Proximité école primaire",
    description:
      "Ce coefficient est déterminé par la proximité entre l’école primaire actuellement fréquentée par votre enfant et votre domicile. Plus précisément, ce coefficient est calculé sur base de l’ implantation fondamentale ou primaire dans laquelle il se rend. Plus l’école primaire est proche du domicile par rapport à d’autres écoles primaires du même réseau , plus le coefficient attribué est élevé.",
    scoreProperty: "coef_2",
    more: (result: ComputeResult) => {
      const schools = result.primarySchools.slice(0, result.score.rank_2)
      return (
        <Popover width={200} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Text fz="xs" fw={300} c="dimmed" style={{ display: "inline" }}>
              {" "}
              <Button variant="light" size="compact-sm">
                (n°{result.score.rank_2})
              </Button>
            </Text>
          </Popover.Target>
          <Popover.Dropdown>
            <List type="ordered">
              {schools.map(s => (
                <List.Item key={s.id}>{s.name}</List.Item>
              ))}
            </List>
          </Popover.Dropdown>
        </Popover>
      )
    },
  },
  {
    name: "Proximité école secondaire",
    description:
      "Ce coefficient est déterminé par la proximité entre l’école secondaire visée et votre domicile. Plus précisément, ce coefficient est calculé sur base de l’implantation  secondaire. Plus l’école secondaire est proche du domicile par rapport à d’autres écoles secondaires du même réseau , plus le coefficient attribué est élevé.",
    scoreProperty: "coef_3",
    more: (result: ComputeResult) => {
      const schools = result.secondarySchools
        .filter(s => s.network === result.school.network)
        .slice(0, result.score.rank_3)
      return (
        <Popover width={200} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Text fz="xs" fw={300} c="dimmed" style={{ display: "inline" }}>
              {" "}
              <Button variant="light" size="compact-sm">
                (n°{result.score.rank_3})
              </Button>
            </Text>
          </Popover.Target>
          <Popover.Dropdown>
            <List type="ordered">
              {schools.map(s => (
                <List.Item key={s.id}>{s.name}</List.Item>
              ))}
            </List>
          </Popover.Dropdown>
        </Popover>
      )
    },
  },
  {
    name: "Proximité Primaire-Secondaire",
    description:
      "Ce coefficient est déterminé par la proximité entre l’école primaire de votre enfant et l’école secondaire visée.",
    scoreProperty: "coef_4",
  },
  {
    name: "Immersion",
    description:
      "Si votre enfant suit l’immersion linguistique depuis la 3e année primaire au moins et que vous souhaitez qu’il poursuive dans cette filiÉre dans la même langue en secondaire, il bénéficie d’un coefficient de 1,18. Dans le cas contraire, le coefficient est égal à 1.",
    scoreProperty: "coef_5",
  },
  {
    name: "Offre scolaire",
    description:
      "Ce coefficient est déterminé par la présence ou l’absence d’écoles secondaires confessionnelles (liées à une religion) ou non confessionnelles dans la commune de l’école primaire de votre enfant.",
    scoreProperty: "coef_6",
  },
  {
    name: "Partenariat pédagogique",
    description:
      "Ce coefficient est déterminé par la présence ou l’absence d’écoles secondaires confessionnelles (liées à une religion) ou non confessionnelles dans la commune de l’école primaire de votre enfant.",
    scoreProperty: "coef_7",
  },
  {
    name: "Indice socio-économique",
    description:
      "Ce coefficient est déterminé sur base de la classe d’appartenance dans le cadre de l’enseignement différencié. Afin d'assurer à chaque élÉve des chances égales d'émancipation sociale dans un environnement pédagogique de qualité, la législation prévoit l’octroi de moyens humains et financiers complémentaires (encadrement différencié) en fonction de la classe d’appartenance des implantations maternelles, fondamentales, primaires ou secondaires.",
    scoreProperty: "coef_8",
    more: (result: ComputeResult) => {
      if (!result.primarySchool.ise) {
        return (
          <>
            {" "}
            <Button size="compact-sm" color="yellow" leftSection={<IconAlertCircle size="1rem" />}>
              Approximatif
            </Button>
          </>
        )
      }
    },
  },
]

function fetchRoute(profile: "driving" | "walking" | "cycling", from: GeoLoc, to: GeoLoc) {
  return fetch(
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from.lon},${from.lat};${to.lon},${to.lat}?access_token=${accessToken}`,
  )
}

const RouterDisplay = ({ from, to }: { from: GeoLoc; to: GeoLoc }) => {
  const [driveRoute, setDriveRoute] = useState(null)
  const [walkRoute, setWalkRoute] = useState(null)
  const [bikeRoute, setBikeRoute] = useState(null)
  useEffect(() => {
    const fetchDrive = async (profile: "driving" | "walking" | "cycling", setter) => {
      const rest = await fetchRoute(profile, from, to)
      const json = await rest.json()
      setter(json.routes[0])
    }
    fetchDrive("driving", setDriveRoute)
    fetchDrive("walking", setWalkRoute)
    fetchDrive("cycling", setBikeRoute)
  }, [from, to])
  return (
    <List>
      {bikeRoute && (
        <List.Item icon={<IconBike size="1rem" />}>
          durée: {round(bikeRoute.duration / 60)} min. distance: {round(bikeRoute.distance / 1000, 2)} km
        </List.Item>
      )}
      {walkRoute && (
        <List.Item icon={<IconWalk size="1rem" />}>
          durée: {round(walkRoute.duration / 60)} min. distance: {round(walkRoute.distance / 1000, 2)} km
        </List.Item>
      )}
      {driveRoute && (
        <List.Item icon={<IconCar size="1rem" />}>
          durée: {round(driveRoute.duration / 60)} min. distance: {round(driveRoute.distance / 1000, 2)} km
        </List.Item>
      )}
    </List>
  )
}
const SchoolDetail = ({
  school,
  scores,
  locHome,
  locInscription,
  date,
  immersion,
  ise,
  score2026,
  inscriptionSecondaryDate,
}: {
  school: School
  scores: ComputeResult[]
  locHome: GeoLoc
  locInscription: GeoLoc
  date: string
  immersion: boolean
  ise?: number
  score2026: boolean
  inscriptionSecondaryDate: string
}) => {
  let result: ComputeResult | undefined
  const [gridOpened, handlers] = useDisclosure(false)
  const [routeDisplay, routeHandlers] = useDisclosure(false)

  if (scores) {
    result = scores.find(s => s.school.id === school.id)
  }

  const gridResult = useMemo(() => {
    if (!gridOpened) return null
    console.time("getScoreGrid")
    const grid = getScoreGrid(
      school,
      result.primarySchool,
      locHome,
      locInscription,
      date,
      immersion,
      inscriptionSecondaryDate,
      ise,
      score2026,
    )
    console.timeEnd("getScoreGrid")
    return grid
  }, [
    school,
    result?.primarySchool,
    locHome,
    locInscription,
    date,
    immersion,
    gridOpened,
    inscriptionSecondaryDate,
    ise,
    score2026,
  ])

  return (
    <Container>
      <Card padding="md">
        {result && (
          <>
            <Card.Section withBorder inheritPadding py="xs">
              <Group>
                <Button variant="white" onClick={routeHandlers.toggle}>
                  <IconRoute />
                  Voir la Route
                </Button>
                <Anchor
                  href={`https://www.google.com/maps/dir/${result.school.geo?.lat},${result.school.geo?.lon}/${locHome.lat},${locHome.lon}/@${locHome.lat},${locHome.lon},13z/data=!3m1!4b1!4m2!4m1!3e3?entry=ttu`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Badge variant="outline" display="inline-block">
                    {round(result.distance, 2)} km
                  </Badge>
                </Anchor>
              </Group>
              {routeDisplay && <RouterDisplay from={locHome} to={school.geo} />}
            </Card.Section>
            <Card.Section withBorder inheritPadding py="xs">
              <div>
                <Text fw={700}>Resultat</Text>
                <List type="ordered">
                  {Explanation.map((d, idx) => {
                    return (
                      <List.Item
                        key={d.name}
                        icon={
                          <Tooltip
                            w={300}
                            multiline
                            withArrow
                            offset={30}
                            color="cyan"
                            transitionProps={{ duration: 200 }}
                            label={d.description}
                            withinPortal
                          >
                            <IconInfoCircle
                              size="1rem"
                              color={score2026 && d.scoreProperty === "coef_8" ? "#868e96" : undefined}
                            />
                          </Tooltip>
                        }
                      >
                        <Text c={score2026 && d.scoreProperty === "coef_8" ? "dimmed" : undefined} component="div">
                          {idx + 1}. {d.name}: {result?.score[d.scoreProperty]}
                          {d.more?.(result)}
                        </Text>
                      </List.Item>
                    )
                  })}
                </List>
                <em>TOTAL:</em> <Score score={result.score.total}>{result.score.total}</Score>
              </div>
              <div>
                <Anchor
                  target="_blank"
                  href={`http://www.enseignement.be/index.php?page=24797&etab_id=${result.school.id.split("/")[0]}`}
                  style={{ lineHeight: "1" }}
                >
                  Information sur l'école
                </Anchor>

                {school.fill && (
                  <Table mt="lg">
                    <Table.Caption>Historique de remplissage de l'école</Table.Caption>
                    <Table.Thead>
                      <Table.Tr>
                        {["2020", "2021", "2022", "2023", "2024", "2025"].map(year => (
                          <Table.Th key={year}>{year}</Table.Th>
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        {["2020", "2021", "2022", "2023", "2024", "2025"].map(year => (
                          <Table.Td key={year}>
                            <FillIcon level={school.fill[year]?.fill_number} />
                          </Table.Td>
                        ))}
                      </Table.Tr>
                      <Table.Tr>
                        {["2020", "2021", "2022", "2023", "2024", "2025"].map(year => (
                          <Table.Td key={year}>
                            {school.fill[year]?.declared === "-" ? "?" : school.fill[year]?.declared}&nbsp;ouvert /{" "}
                            {school.fill[year]?.received === "-" ? "?" : school.fill[year]?.received}&nbsp;inscrits
                            {school.fill[year]?.declared !== "-" && school.fill[year]?.received !== "-" && (
                              <Text fz="xs" c="dimmed">
                                ({round((school.fill[year].received / school.fill[year].declared) * 100, 2)}%)
                              </Text>
                            )}
                            {school.fill[year]?.min_indice && (
                              <div>
                                <MinIndiceDisplay
                                  school={{ ...school, fill: { [year]: school.fill[year] } }}
                                  currentScore={result.score.total}
                                  withYear={false}
                                />
                              </div>
                            )}
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                )}
              </div>
            </Card.Section>
          </>
        )}
      </Card>
      <Container w="100%">
        <Button size="compact-sm" variant="white" leftSection={<IconGridDots size="1rem" />} onClick={handlers.toggle}>
          Carte des scores
        </Button>
        {gridOpened && <MapInspect result={gridResult} home={locHome} secondary={school} />}
      </Container>
    </Container>
  )
}

export default SchoolDetail
