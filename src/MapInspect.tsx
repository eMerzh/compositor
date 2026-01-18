import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useEffect, useRef, useState } from "react"
import { GeoLoc, School } from "./compute"

interface MapProps {
  result: { grid: GeoJSON.GeoJSON; min: number; max: number; lines: GeoJSON.GeoJSON }
  secondary: School
  home: GeoLoc
}
const MapInspect = ({ result, home, secondary }: MapProps) => {
  const { lines } = result
  const mapContainer = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const secondaireRef = useRef<maplibregl.Marker>(null)
  const homeRef = useRef<maplibregl.Marker>(null)
  const mapRef = useRef<maplibregl.Map>(null)
  const [zoom] = useState(13)

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) {
      return //stops map from intializing more than once
    }
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://api.maptiler.com/maps/bright/style.json?key=UVAKtN0Z84SNZiFO1wFP",
      center: [home.lon, home.lat],
      zoom: zoom,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({}), "top-right")

    homeRef.current = new maplibregl.Marker({
      color: "#ff6b6b",
    })
      .setLngLat([home.lon, home.lat])
      .setPopup(new maplibregl.Popup().setText("Home"))

    secondaireRef.current = new maplibregl.Marker({
      color: "#382ef1",
    })
      .setLngLat([secondary.geo.lon, secondary.geo.lat])
      .setPopup(new maplibregl.Popup().setText(secondary.name))

    homeRef.current.addTo(map)
    secondaireRef.current.addTo(map)
    map.on("load", () => {
      setLoaded(true)
    })

    map.on("click", "secondaries-circle", e => {
      if (!e.features[0]) return
      const coordinates = e.lngLat
      const score = e.features[0].properties?.score
      const formattedScore = score !== undefined ? score.toFixed(2) : "N/A"

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<div style="padding: 8px;"><strong>Score:</strong> ${formattedScore}</div>`)
        .addTo(map)
    })

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on("mouseenter", "secondaries-circle", () => {
      map.getCanvas().style.cursor = "pointer"
    })

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", "secondaries-circle", () => {
      map.getCanvas().style.cursor = ""
    })
  })

  useEffect(() => {
    if (mapRef.current && loaded) {
      // Check if source already exists and remove it before adding
      if (mapRef.current.getSource("secondaries")) {
        mapRef.current.removeLayer("secondaries-circle")
        mapRef.current.removeSource("secondaries")
      }

      mapRef.current.addSource("secondaries", {
        type: "geojson",
        data: lines,
      })

      mapRef.current.addLayer({
        id: "secondaries-circle",
        source: "secondaries",
        type: "fill",
        paint: {
          "fill-color": ["get", "fill"],
          "fill-opacity": ["get", "fill-opacity"],
        },
      })

      /**
       * if display the points grid directly

       mapRef.current.addLayer({
        id: "secondaries-circle",
        source: "secondaries",
        type: "circle",
        paint: {
          "circle-radius": 4,
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "score"],
            result.min,
            "#d73027",
            result.max,
            "#0a3266",
          ],
          "circle-opacity": 0.7,
        },
      })
       */
    }

    return () => {
      // cleanup layer
      if (!mapRef.current?.loaded()) return
      if (!mapRef.current.getSource("secondaries")) return
      mapRef.current.removeLayer("secondaries-circle")
      mapRef.current.removeSource("secondaries")
    }
  }, [loaded, lines])

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
  )
}

export default MapInspect
