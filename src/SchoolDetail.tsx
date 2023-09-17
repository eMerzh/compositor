import { Badge, Card, CloseButton, Group, Text, Tooltip } from "@mantine/core";
import { ComputeResult, GeoLoc } from "./compute";
import Score from "./Score";
import { round } from "./utils";

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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group>
        <Text weight={500}>
          {result.school.nom_de_l_etablissement.toLowerCase()}
        </Text>
        <a
          href={`https://www.google.com/maps/dir/${result.school.geolocalisation?.lat},${result.school.geolocalisation?.lon}/${locHome.lat},${locHome.lon}/@${locHome.lat},${locHome.lon},13z/data=!3m1!4b1!4m2!4m1!3e3?entry=ttu`}
        >
          Google Maps
        </a>
        <Badge variant="outline">{round(result.distance, 2)} km</Badge>
        <CloseButton title="Cacher" size="xl" iconSize={20} onClick={onClose} />
      </Group>

      {result && (
        <Card.Section withBorder inheritPadding py="xs">
          <div>
            Resultat:
            <ul>
              <li>
                <Tooltip
                  width={300}
                  multiline
                  withArrow
                  position="right"
                  offset={30}
                  color="cyan"
                  transitionProps={{ duration: 200 }}
                  label="Ce coefficient permet de tenir compte de l’ordre de vos préférences. Pour les 5 écoles secondaires de meilleure préférence, votre enfant va obtenir un coefficient préférentiel. Pour l’école secondaire de 1re préférence, vous obtenez la valeur maximale de 1,5."
                >
                  <span>Préférence: {result?.score.coef_1}</span>
                </Tooltip>
              </li>
              <li>
                <Tooltip
                  width={300}
                  multiline
                  withArrow
                  position="right"
                  offset={20}
                  color="cyan"
                  transitionProps={{ duration: 200 }}
                  label="Ce coefficient est déterminé par la proximité entrl’école primaire actuellement fréquentée par votre enfant et votre domicile. Plus précisément, ce coefficient est calculé sur base de l’ implantation fondamentale ou primaire dans laquelle il se rend. Plus l’école primaire est proche du domicile par rapport à d’autres écoles primaires du même réseau , plus le coefficient attribué est élevé."
                >
                  <span>
                    Proximité école primaire: {result.score.coef_2}
                    (#{result.score.rank_2})
                  </span>
                </Tooltip>
              </li>
              <li>
                <Tooltip
                  width={300}
                  multiline
                  withArrow
                  position="right"
                  offset={20}
                  color="cyan"
                  transitionProps={{ duration: 200 }}
                  label="Ce coefficient est déterminé par la proximité entre l’école secondaire visée et votre domicile. Plus précisément, ce coefficient est calculé sur base de l’implantation  secondaire. Plus l’école secondaire est proche du domicile par rapport à d’autres écoles secondaires du même réseau , plus le coefficient attribué est élevé."
                >
                  <span>
                    Proximité école secondaire: {result.score.coef_3}
                    (#{result.score.rank_3})
                  </span>
                </Tooltip>
              </li>
              <li>
                <Tooltip
                  width={300}
                  multiline
                  withArrow
                  position="right"
                  offset={20}
                  color="cyan"
                  transitionProps={{ duration: 200 }}
                  label="Ce coefficient est déterminé par la proximité entre l’école primaire de votre enfant et l’école secondaire visée."
                >
                  <span>
                    Proximité Primaire-Secondaire: {result.score.coef_4}
                  </span>
                </Tooltip>
              </li>
              <li>
                <Tooltip
                  width={300}
                  multiline
                  withArrow
                  position="right"
                  offset={20}
                  color="cyan"
                  transitionProps={{ duration: 200 }}
                  label="Si votre enfant suit l’immersion linguistique depuis la 3e année primaire au moins et que vous souhaitez qu’il poursuive dans cette filiÉre dans la même langue en secondaire, il bénéficie d’un coefficient de 1,18. Dans le cas contraire, le coefficient est égal à 1."
                >
                  <span>Immersion: {result.score.coef_5}</span>
                </Tooltip>
              </li>
              <li>
                <Tooltip
                  width={300}
                  multiline
                  withArrow
                  position="right"
                  offset={20}
                  color="cyan"
                  transitionProps={{ duration: 200 }}
                  label="Ce coefficient est déterminé par la présence ou l’absence d’écoles secondaires confessionnelles (liées à une religion) ou non confessionnelles dans la commune de l’école primaire de votre enfant."
                >
                  <span>Offre scolaire: {result.score.coef_6}</span>
                </Tooltip>
              </li>
              <li>
                <Tooltip
                  width={300}
                  multiline
                  withArrow
                  position="right"
                  offset={20}
                  color="cyan"
                  transitionProps={{ duration: 200 }}
                  label="Ce coefficient est déterminé par la présence ou l’absence d’écoles secondaires confessionnelles (liées à une religion) ou non confessionnelles dans la commune de l’école primaire de votre enfant."
                >
                  <span>Partenariat pédagogique: {result.score.coef_7}</span>
                </Tooltip>
              </li>
              <li>
                <Tooltip
                  width={300}
                  multiline
                  withArrow
                  position="right"
                  offset={20}
                  color="cyan"
                  transitionProps={{ duration: 200 }}
                  label="Ce coefficient est déterminé sur base de la classe d’appartenance dans le cadre de l’enseignement différencié. Afin d'assurer à chaque élÉve des chances égales d'émancipation sociale dans un environnement pédagogique de qualité, la législation prévoit l’octroi de moyens humains et financiers complémentaires (encadrement différencié) en fonction de la classe d’appartenance des implantations maternelles, fondamentales, primaires ou secondaires."
                >
                  <span>Indice socio-économique: {result.score.coef_8}</span>
                </Tooltip>
              </li>
            </ul>
            <em>TOTAL:</em>{" "}
            <Score score={result.score.total}>{result.score.total}</Score>
          </div>
        </Card.Section>
      )}
    </Card>
  );
};

export default SchoolDetail;
