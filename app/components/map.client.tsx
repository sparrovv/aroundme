import type { LatLngTuple } from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayerGroup,
  Circle,
  Tooltip,
} from "react-leaflet";

export function Map({
  mainLocation,
  height,
  zoom,
  markers,
}: {
  mainLocation: {
    name: string;
    latLng: LatLngTuple;
  };
  height: string;
  zoom: number;
  markers?: {
    geoLocation: LatLngTuple;
    name: string;
    durationInMinutes: number;
    poi: string;
  }[];
}) {
  const otherMarkers = markers?.map((marker, index) => {
    return (
      <Marker key={index} position={marker.geoLocation}>
        <Popup>
          {marker.poi} - {marker.name} - ({marker.durationInMinutes}m away)
        </Popup>
      </Marker>
    );
  });
  const fillBlueOptions = { fillColor: "blue" };

  return (
    <div style={{ height }}>
      <MapContainer
        style={{
          height: "100%",
        }}
        center={mainLocation.latLng}
        zoom={zoom}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayerGroup>
          <Circle
            center={mainLocation.latLng}
            pathOptions={fillBlueOptions}
            radius={10}
          >
            <Tooltip permanent>{mainLocation.name}</Tooltip>
          </Circle>
        </LayerGroup>
        {otherMarkers}
      </MapContainer>
    </div>
  );
}
