import { AspectRatio } from "@mantine/core";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";

interface MapProps {
  initialLat: number;
  initialLon: number;
  setHomeLoc: (lat: number, lon: number) => void;
}
const Map = ({ initialLat, initialLon, setHomeLoc }: MapProps) => {
  const mapContainer = useRef(null);
  const pointRef = useRef<maplibregl.Marker>();
  const mapRef = useRef<maplibregl.Map>();
  const [lng] = useState<number>(initialLon);
  const [lat] = useState<number>(initialLat);
  const [zoom] = useState(13);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) {
      return; //stops map from intializing more than once
    }
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/bright/style.json?key=UVAKtN0Z84SNZiFO1wFP`,
      center: [lng, lat],
      zoom: zoom,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({}), "top-right");
    pointRef.current = new maplibregl.Marker({ color: "#FF0000", draggable: true }).setLngLat([lng, lat]);
    pointRef.current.on("dragend", () => {
      const lngLat = pointRef.current?.getLngLat();
      if (lngLat) {
        setHomeLoc(lngLat.lat, lngLat.lng);
      }
    });
    pointRef.current.addTo(map);
  }, [lat, lng, zoom, setHomeLoc]);
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [initialLon, initialLat],
      });
      pointRef.current?.setLngLat([initialLon, initialLat]);
    }
  }, [initialLat, initialLon]);

  return (
    <AspectRatio ratio={16 / 9}>
      <div
        ref={mapContainer}
        className="map"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "3px",
        }}
      />
    </AspectRatio>
  );
};

export default Map;
