import { Tooltip } from "@mantine/core"
import fill1 from "./assets/fill.1.png"
import fill2 from "./assets/fill.2.png"
import fill3 from "./assets/fill.3.png"
import fill4 from "./assets/fill.4.png"
import fill5 from "./assets/fill.5.png"

import { FillLevel } from "./compute"

const labels = {
  1: "L’école a reçu une demande supérieure à 102% des places disponibles. Un classement a dû être effectué pour départager les places.",
  2: "À la fin de la période d’inscription, entre 100% et 102% des places étaient occupées. L’école a pu satisfaire toutes les demandes d'inscription reçues durant la période d'inscription.",
  3: "À la fin de la période d’inscription, entre 80% et 100% des places étaient occupées. L’école a pu satisfaire toutes les demandes d'inscription reçues durant la période d'inscription.",
  4: "À la fin de la période d’inscription, moins de 80% des places étaient occupées. L’école a pu satisfaire toutes les demandes d'inscription reçues durant la période d'inscription.",
  5: "L’école n’était pas ouverte.",
}
const imageSrc = {
  1: fill1,
  2: fill2,
  3: fill3,
  4: fill4,
  5: fill5,
}
const FillIcon = ({ level }: { level: FillLevel }) => {
  return (
    <Tooltip label={labels[level]} multiline w={300} withArrow>
      <img width="25px" src={imageSrc[level]} alt={labels[level]} />
    </Tooltip>
  )
}

export default FillIcon
