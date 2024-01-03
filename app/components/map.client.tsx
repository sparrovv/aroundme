import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayerGroup,
  Circle,
  Tooltip,
} from "react-leaflet";

export const pointsOfInterestWithEmojiIcon: Record<string, string> = {
  hospital: "https://openmoji.org/data/color/svg/1F3E5.svg",
  school: "https://openmoji.org/data/color/svg/1F3EB.svg",
  "primary school": "https://openmoji.org/data/color/svg/1F3EB.svg",
  kindergarten: "https://openmoji.org/data/color/svg/1F3EB.svg",
  "bus stop": "https://openmoji.org/data/color/svg/1F68C.svg",
  restaurant: "https://openmoji.org/data/color/svg/1F374.svg",
  supermarket: "https://openmoji.org/data/color/svg/1F6D2.svg",
  pharmacy: "https://openmoji.org/data/color/svg/1F48A.svg",
  park: "https://openmoji.org/data/color/svg/1F3DE.svg",
  gym: "https://openmoji.org/data/color/svg/1F3CB.svg",
  cinema: "https://openmoji.org/data/color/svg/1F3A6.svg",
  museum: "https://openmoji.org/data/color/svg/1F3E6.svg",
  "tram stop": "https://openmoji.org/data/color/svg/1F68B.svg",
  "ośrodek zdrowia": "https://openmoji.org/data/color/svg/1F3E5.svg",
  przedszkole: "https://openmoji.org/data/color/svg/1F3EB.svg",
  discount: "https://openmoji.org/data/color/svg/1F4B0.svg",
  "szkoła podstawowa": "https://openmoji.org/data/color/svg/1F3EB.svg",
  food: "https://openmoji.org/data/color/svg/1F374.svg",
  pizza: "https://openmoji.org/data/color/svg/1F355.svg",
  theatre: "https://openmoji.org/data/color/svg/1F3AD.svg",
};
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
    const i = new L.Icon({
      iconUrl:
        pointsOfInterestWithEmojiIcon[marker.poi] ||
        "https://openmoji.org/data/color/svg/1F603.svg",
      iconSize: [30, 46],
      iconAnchor: [12, 41],
    });

    return (
      <Marker key={index} position={marker.geoLocation} icon={i}>
        <Popup>
          {marker.poi} - {marker.name} - ({marker.durationInMinutes}m away)
        </Popup>
        <Tooltip>
          {marker.poi} - {marker.name} - ({marker.durationInMinutes}m away)
        </Tooltip>
      </Marker>
    );
  });
  // const fillBlueOptions = { fillColor: "blue" };

  const i = new L.Icon({
    iconUrl: "https://openmoji.org/data/color/svg/1F603.svg",
    iconSize: [50, 70],
    iconAnchor: [12, 41],
  });
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
          <Circle center={mainLocation.latLng} radius={55}>
            <Marker position={mainLocation.latLng} icon={i}>
              <Popup>{mainLocation.name}</Popup>
              {/* <Tooltip>{mainLocation.name}</Tooltip> */}
            </Marker>
          </Circle>
        </LayerGroup>
        {otherMarkers}
      </MapContainer>
    </div>
  );
}
