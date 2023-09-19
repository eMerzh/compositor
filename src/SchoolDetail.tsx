import { Anchor, Badge, Card, Group, List, Table, Text, Tooltip } from "@mantine/core";
import { ComputeResult, GeoLoc, School } from "./compute";
import Score from "./Score";
import { round } from "./utils";
import FillIcon from "./FillIcon";

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
    more: (result: ComputeResult) => (
      <Text fz="xs" fw={300} c="dimmed" style={{ display: "inline" }}>
        {" "}
        (n°{result.score.rank_2})
      </Text>
    ),
  },
  {
    name: "Proximité école secondaire",
    description:
      "Ce coefficient est déterminé par la proximité entre l’école secondaire visée et votre domicile. Plus précisément, ce coefficient est calculé sur base de l’implantation  secondaire. Plus l’école secondaire est proche du domicile par rapport à d’autres écoles secondaires du même réseau , plus le coefficient attribué est élevé.",
    scoreProperty: "coef_3",
    more: (result: ComputeResult) => (
      <Text fz="xs" fw={300} c="dimmed" style={{ display: "inline" }}>
        {" "}
        (n°{result.score.rank_3})
      </Text>
    ),
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
  },
];

const SchoolDetail = ({ school, scores, locHome }: { school: School; scores: ComputeResult[]; locHome: GeoLoc }) => {
  let result: ComputeResult | undefined;
  if (scores && school) {
    result = scores.find((s) => s.school.id == school.id);
  }
  return (
    <Group>
      <Card
        padding="md"
        style={{
          height: "100vh",
        }}
      >
        {result && (
          <Card.Section withBorder inheritPadding py="xs">
            <div>
              <Text fw={700}>Resultat</Text>
              <ol>
                {Explanation.map((d) => {
                  return (
                    <li key={d.name}>
                      <Tooltip
                        width={300}
                        multiline
                        withArrow
                        offset={30}
                        color="cyan"
                        transitionProps={{ duration: 200 }}
                        label={d.description}
                        withinPortal
                      >
                        <span>
                          {d.name}: {result?.score[d.scoreProperty]}
                          {d.more?.(result)}
                        </span>
                      </Tooltip>
                    </li>
                  );
                })}
              </ol>
              <em>TOTAL:</em> <Score score={result.score.total}>{result.score.total}</Score>
            </div>
            <div>
              <Text fw={700} mt="md">
                Informations
              </Text>

              <List>
                <List.Item>
                  Distance:{" "}
                  <a
                    href={`https://www.google.com/maps/dir/${result.school.geo?.lat},${result.school.geo?.lon}/${locHome.lat},${locHome.lon}/@${locHome.lat},${locHome.lon},13z/data=!3m1!4b1!4m2!4m1!3e3?entry=ttu`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Badge variant="outline" display="inline-block">
                      {round(result.distance, 2)} km
                    </Badge>
                  </a>
                </List.Item>
                <List.Item>
                  <Anchor
                    target="blank"
                    href={`http://www.enseignement.be/index.php?page=24797&etab_id=${result.school.id.split("/")[0]}`}
                    style={{ lineHeight: "1" }}
                  >
                    Information sur l'école
                  </Anchor>
                </List.Item>
              </List>

              {school.fill && (
                <Table mt="lg">
                  <caption>Historique de remplissage de l'école</caption>
                  <thead>
                    <tr>
                      <th>2018</th>
                      <th>2019</th>
                      <th>2020</th>
                      <th>2021</th>
                      <th>2022</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <FillIcon level={school.fill[2018]} />
                      </td>
                      <td>
                        <FillIcon level={school.fill[2019]} />
                      </td>
                      <td>
                        <FillIcon level={school.fill[2020]} />
                      </td>
                      <td>
                        <FillIcon level={school.fill[2021]} />
                      </td>
                      <td>
                        <FillIcon level={school.fill[2022]} />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </div>
          </Card.Section>
        )}
      </Card>
    </Group>
  );
};

export default SchoolDetail;
