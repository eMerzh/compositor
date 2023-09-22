import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { GeoLoc, School } from "./compute";

interface MapProps {
  result: { grid: unknown; min: number; max: number };
  secondary: School;
  home: GeoLoc;
}
const MapInspect = ({ result, home, secondary }: MapProps) => {
  const { grid, min, max } = result;
  const mapContainer = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const secondaireRef = useRef<maplibregl.Marker>();
  const homeRef = useRef<maplibregl.Marker>();
  const mapRef = useRef<maplibregl.Map>();
  const [zoom] = useState(13);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) {
      return; //stops map from intializing more than once
    }
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/bright/style.json?key=UVAKtN0Z84SNZiFO1wFP`,
      center: [home.lon, home.lat],
      zoom: zoom,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({}), "top-right");
    homeRef.current = new maplibregl.Marker({ color: "#FF0000" }).setLngLat([home.lon, home.lat]);
    secondaireRef.current = new maplibregl.Marker({ color: "#382ef1" }).setLngLat([
      secondary.geo.lon,
      secondary.geo.lat,
    ]);

    homeRef.current.addTo(map);
    secondaireRef.current.addTo(map);
    map.on("load", () => {
      setLoaded(true);
    });

    map.on("click", "secondaries-circle", (e) => {
      // Copy coordinates array.
      if (e.features[0].geometry.type !== "Point") return;
      const coordinates = e.features[0].geometry.coordinates.slice() as [number, number];
      const description = e.features[0].properties.score;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new maplibregl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on("mouseenter", "secondaries-circle", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", "secondaries-circle", () => {
      map.getCanvas().style.cursor = "";
    });
  });

  useEffect(() => {
    if (mapRef.current && loaded) {
      mapRef.current.addSource("secondaries", {
        type: "geojson",
        data: grid,
      });

      mapRef.current.addLayer({
        id: "secondaries-circle",
        type: "circle",
        source: "secondaries",
        paint: {
          "circle-radius": 6,
          "circle-color": ["interpolate", ["linear"], ["get", "score"], min, "#b1092d", max, "#09b163"],
        },
        filter: ["==", "$type", "Point"],
      });
    }

    return () => {
      // cleanup layer
      if (!mapRef.current?.loaded()) return;
      if (!mapRef.current.getSource("secondaries")) return;
      mapRef.current.removeLayer("secondaries-circle");
      mapRef.current.removeSource("secondaries");
    };
  }, [grid, loaded, min, max]);

  return (
    <div
      className="map-wrap"
      style={{
        height: "80vh",
        width: "100%",
        marginBottom: "30px",
        marginTop: "30px",
      }}
    >
      <div
        ref={mapContainer}
        className="map"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "3px",
        }}
      />
    </div>
  );
};

export default MapInspect;
