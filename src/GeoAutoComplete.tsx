import { CloseButton, TextInput } from "@mantine/core";
import { AddressAutofill } from "@mapbox/search-js-react";
import { IconHomeSearch } from "@tabler/icons-react";
import { useState } from "react";
import { GeoLoc } from "./compute";

const accessToken = "pk.eyJ1IjoiZW1lcnpoIiwiYSI6ImNsbW5zbjV3NzA4MWoycm85d3A1OWFmZG8ifQ.vHHA1EhrIbEaeKHwa9KvmQ";

export type NamedLoc = GeoLoc & { name: string };

interface Props {
  onSelect?: (loca: NamedLoc | null) => void;
  value?: NamedLoc;
}
function GeoAutoComplete({ value, onSelect }: Props) {
  const [address, setAddress] = useState<string>(value?.name || "");

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
          console.log("oooo set ", feature.properties.feature_name);
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
    </form>
  );
}

export default GeoAutoComplete;
