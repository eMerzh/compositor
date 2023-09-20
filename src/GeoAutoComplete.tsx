import { Button, CloseButton, TextInput } from "@mantine/core";
import { AddressAutofill } from "@mapbox/search-js-react";
import { IconHomeSearch, IconMap } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { GeoLoc } from "./compute";
import Map from "./Map";

const accessToken = "pk.eyJ1IjoiZW1lcnpoIiwiYSI6ImNsbW5zbjV3NzA4MWoycm85d3A1OWFmZG8ifQ.vHHA1EhrIbEaeKHwa9KvmQ";

export type NamedLoc = GeoLoc & { name: string };

interface Props {
  onSelect?: (loca: NamedLoc | null) => void;
  value?: NamedLoc;
}
function GeoAutoComplete({ value, onSelect }: Props) {
  const [address, setAddress] = useState<string>(value?.name || "");
  const [showDetails, setShowDetails] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  console.log("value", value);
  useEffect(() => {
    if (ref.current) {
      ref.current.value = value?.name || "";
    }
  }, [value]);
  return (
    <form>
      <AddressAutofill
        accessToken={accessToken}
        options={{
          language: "fr",
          country: "BE",
        }}
        onRetrieve={(e) => {
          const feature = e.features[0];
          setAddress(feature.properties.feature_name);
          onSelect?.({
            lon: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
            name: feature.properties.feature_name,
          });
        }}
      >
        <TextInput
          label="Adresse du domicile"
          icon={<IconHomeSearch size="1rem" color={value?.lat ? "green" : "#adb5bd"} />}
          placeholder="Domicile"
          autoComplete="street-address"
          value={address}
          ref={ref}
          mt={"md"}
          onChange={(e) => setAddress(e.currentTarget.value)}
          rightSection={
            <CloseButton
              aria-label="Clear input"
              onClick={() => {
                setAddress("");
                onSelect?.(null);
              }}
              style={{ display: value ? undefined : "none" }}
            />
          }
        />
      </AddressAutofill>
      <Button variant="white" compact onClick={() => setShowDetails(!showDetails)} leftIcon={<IconMap size="1rem" />}>
        {showDetails ? "Cacher" : "Afficher"} la carte
      </Button>
      {showDetails && value && (
        <Map
          initialLat={value.lat}
          initialLon={value.lon}
          setHomeLoc={(lat, lon) => {
            onSelect({ lat, lon, name: "Personnalisé" });
          }}
        />
      )}
    </form>
  );
}

export default GeoAutoComplete;
