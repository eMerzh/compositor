import { Affix, Badge, Card, CloseButton, Group, Text, Tooltip } from "@mantine/core";
import { ComputeResult, GeoLoc } from "./compute";
import Score from "./Score";
import { round } from "./utils";

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

const SchoolDetail = ({
  result,
  locHome,
  onClose,
}: {
  result: ComputeResult;
  locHome: GeoLoc;
  onClose: () => void;
}) => {
  return (
    <Affix>
      <Group mt="md" mb="xs">
        <Card shadow="sm" radius="md" padding="md" withBorder>
          <Card.Section inheritPadding>
            <Text weight={500}>{result.school.name}</Text>
            <a
              href={`https://www.google.com/maps/dir/${result.school.geo?.lat},${result.school.geo?.lon}/${locHome.lat},${locHome.lon}/@${locHome.lat},${locHome.lon},13z/data=!3m1!4b1!4m2!4m1!3e3?entry=ttu`}
              target="_blank"
              rel="noreferrer"
            >
              <Badge variant="outline">{round(result.distance, 2)} km</Badge>{" "}
            </a>
            <CloseButton title="Cacher" size="xl" iconSize={20} onClick={onClose} />
          </Card.Section>

          {result && (
            <Card.Section withBorder inheritPadding py="xs">
              <div>
                Resultat:
                <ol>
                  {Explanation.map((d) => {
                    return (
                      <li key={d.name}>
                        <Tooltip
                          width={300}
                          multiline
                          withArrow
                          position="right"
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
            </Card.Section>
          )}
        </Card>
      </Group>
    </Affix>
  );
};

export default SchoolDetail;
