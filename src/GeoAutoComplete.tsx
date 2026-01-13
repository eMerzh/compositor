import { Autocomplete, AutocompleteProps, Button, CloseButton, Group, Text } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconHomeSearch, IconMap } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { GeoLoc } from "./compute"
import MapDisplay from "./MapDisplay"

export const accessToken = "pk.eyJ1IjoiZW1lcnpoIiwiYSI6ImNsbW5zbjV3NzA4MWoycm85d3A1OWFmZG8ifQ.vHHA1EhrIbEaeKHwa9KvmQ"

const MAPTILER_API = "https://api.maptiler.com/geocoding/"
const MAPTILER_API_KEY = "UVAKtN0Z84SNZiFO1wFP"

export type NamedLoc = GeoLoc & { name: string }

const useGeoCoding = (address: string) => {
  const [result, setResult] = useState<NamedLoc[]>([])
  useEffect(() => {
    if (!address) {
      return
    }
    fetch(
      `${MAPTILER_API}${address}.json?key=${MAPTILER_API_KEY}&language=fr&country=be&types=poi,address,road,place,neighbourhood,locality`,
    )
      .then(r => r.json())
      .then(r => {
        setResult(
          r.features.map(res => ({
            name: res.place_name || res.text,
            lon: res.center[0],
            lat: res.center[1],
          })),
        )
      })
  }, [address])

  return result
}

const renderAutocompleteOption: AutocompleteProps["renderOption"] = ({ option }) => {
  return (
    <Group>
      <Text>{option.value}</Text>
    </Group>
  )
}

interface Props {
  onSelect?: (loca: NamedLoc | null) => void
  value?: NamedLoc
  label: string
}
function GeoAutoComplete({ value, onSelect, label }: Props) {
  const [searchValue, setSearchValue] = useState(value?.name || "")
  const [debouncedSearch] = useDebouncedValue(searchValue, 200)
  const [showDetails, setShowDetails] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const results = useGeoCoding(debouncedSearch)

  useEffect(() => {
    if (ref.current) {
      ref.current.value = value?.name || ""
    }
  }, [value])

  return (
    <form>
      <Autocomplete
        label={label}
        description="Une adresse précise est préférable pour obtenir des résultats pertinents."
        leftSection={<IconHomeSearch size="1rem" color={value?.lat ? "green" : "#adb5bd"} />}
        placeholder="Domicile"
        ref={ref}
        mt={"md"}
        value={searchValue}
        data={results.map(r => ({
          ...r,
          value: r.name,
          label: r.name,
        }))}
        onChange={v => {
          const item = results.find(r => r.name === v)
          if (item) {
            onSelect?.({ lat: item.lat, lon: item.lon, name: item.name })
          }
          setSearchValue(v)
        }}
        renderOption={renderAutocompleteOption}
        rightSection={
          <CloseButton
            aria-label="Clear input"
            onClick={() => {
              onSelect?.(null)
            }}
            style={{ display: value ? undefined : "none" }}
          />
        }
        rightSectionWidth={40}
      />
      <Button
        variant="white"
        size="compact-sm"
        onClick={() => setShowDetails(!showDetails)}
        leftSection={<IconMap size="1rem" />}
      >
        {showDetails ? "Cacher" : "Afficher"} la carte
      </Button>
      {showDetails && (
        <MapDisplay
          initialLat={value?.lat || 50.527942}
          initialLon={value?.lon || 5.529293}
          setHomeLoc={(lat, lon) => {
            console.log("setHomeLoc", lat, lon)
            onSelect({ lat, lon, name: "Personnalisé" })
          }}
        />
      )}
    </form>
  )
}

export default GeoAutoComplete
