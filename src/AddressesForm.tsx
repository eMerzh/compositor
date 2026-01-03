import { Alert, Paper, Switch, Tooltip } from "@mantine/core"
import { IconInfoCircle } from "@tabler/icons-react"
import { FC, Fragment, useState } from "react"
import GeoAutoComplete, { NamedLoc } from "./GeoAutoComplete"

interface Props {
  onSelectHome?: (loca: NamedLoc | null) => void
  valueHome?: NamedLoc
  onSelectInscription?: (loca: NamedLoc | null) => void
  valueInscription?: NamedLoc
}
const AddressesForm: FC<Props> = ({ valueHome, onSelectHome, valueInscription, onSelectInscription }) => {
  const [withSecondary, setWithSecondary] = useState(false)

  return (
    <Fragment>
      <GeoAutoComplete value={valueHome} onSelect={onSelectHome} label="Adresse du domicile" />
      <Tooltip
        multiline
        w={220}
        withArrow
        label="Il s'agit du domicile de l'un des parents au moment de l'entrée de l'enfant dans son école primaire actuelle (pas maternelle). Si vous choisissez d’indiquer ce domicile, il sera utilisé uniquement pour déterminer la proximité entre votre domicile et l’école primaire (coefficient n°2 de l’indice composite)."
        refProp="rootRef"
      >
        <Switch
          size="xs"
          checked={withSecondary}
          onChange={event => {
            setWithSecondary(event.currentTarget.checked)
            if (!event.currentTarget.checked) {
              onSelectInscription?.(null)
            }
          }}
          label="Autre domicile au moment de l'inscription en primaire"
        />
      </Tooltip>

      {withSecondary && (
        <Paper shadow="xs" p="sm" mt="sm">
          <Alert variant="light" color="blue" icon={<IconInfoCircle size="1rem" />}>
            Domicile de l'un des parents au moment de l'entrée de l'enfant dans son école primaire actuelle (pas
            maternelle). Si vous choisissez d’indiquer ce domicile, il sera utilisé uniquement pour déterminer la
            proximité entre votre domicile et l’école primaire (coefficient n°2 de l’indice composite).
            <br />
            <a
              href="https://inscription.cfwb.be/la-procedure-dinscription/le-formulaire-unique-dinscription-fui/volet-general-du-fui/#c11650"
              rel="noopener noreferrer"
              target="_blank"
            >
              Plus d'infos
            </a>
          </Alert>
          <GeoAutoComplete
            value={valueInscription}
            onSelect={onSelectInscription}
            label="Domicile au moment de l'inscription en primaire (actuelle)"
          />
        </Paper>
      )}
    </Fragment>
  )
}

export default AddressesForm
