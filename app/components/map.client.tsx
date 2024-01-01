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
  height,
  position,
  zoom,
  markers,
}: {
  height: string;
  position: LatLngTuple;
  zoom: number;
  markers?: {
    geoLocation: LatLngTuple;
    name: string;
    poi: string;
  }[];
}) {
  const otherMarkers = markers?.map((marker, index) => {
    return (
      <Marker key={index} position={marker.geoLocation}>
        <Popup>{marker.name}</Popup>
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
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayerGroup>
          <Circle center={position} pathOptions={fillBlueOptions} radius={10}>
            <Tooltip permanent>The Location</Tooltip>
          </Circle>
        </LayerGroup>
        {/* <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker> */}
        {otherMarkers}
      </MapContainer>
    </div>
  );
}
