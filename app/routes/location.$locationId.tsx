import { DataGrid } from "@mui/x-data-grid";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { LatLngTuple } from "leaflet";
import invariant from "tiny-invariant";

import { aroundme } from "~/aroundme.server";
import { ClientOnly } from "~/components/client-only";
import { Map } from "~/components/map.client";
import { GroupedPOIs } from "~/lib/aroundme";
import {
  Address,
  DistanceFromLocation,
  PointOfInterest,
} from "~/lib/aroundme/types";
import { getLocationById } from "~/models/location.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.locationId, "locationId not found");

  const location = await getLocationById(params.locationId);
  if (!location) {
    throw new Response("Not Found", { status: 404 });
  }
  const pois: PointOfInterest[] = [
    "restaurant",
    "bus stop",
    "tram stop",
    "ośrodek zdrowia",
    "przedszkole",
    "discount",
    "szkoła podstawowa",
    "food",
    "pizza",
  ];
  const address: Address = {
    address: location.name.split(",")[0],
    city: location.name.split(",")[1],
    country: "Poland",
  };

  const groupedPois = await aroundme.findAllNearbyPois(address, pois, 1000);
  // find landmarks for the city

  return json({ location, groupedPois });
};

const poiElement = (poi: PointOfInterest, places: DistanceFromLocation[]) => {
  const columns = Object.keys(places[0]).map((key) => {
    return {
      field: key,
      headerName: key,
      width: 150,
    };
  });
  const placesWithId = places.map((place, index) => {
    return {
      ...place,
      id: index,
    };
  });

  return (
    <div key={poi}>
      <h4 className="text-xl font-bold">{poi}</h4>
      <section
        id="DataGrid"
        style={{
          height: 350,
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <DataGrid
          rows={placesWithId}
          columns={columns}
          sx={{ backgroundColor: "#caffca" }}
        />
      </section>
    </div>
  );
};

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.8.0/dist/leaflet.css",
  },
];

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const pois: GroupedPOIs = data.groupedPois;

  // @todo fix it
  const geoLoc = Object.values(pois)[0][0].theReferenceGeoLoc as LatLngTuple;
  const foo = Object.keys(pois).map((poi) => {
    return poiElement(poi as PointOfInterest, pois[poi as PointOfInterest]);
  });
  const closestPlaces = Object.keys(pois).map((poi) => {
    const theFirstOne = pois[poi as PointOfInterest][0];
    return {
      geoLocation: theFirstOne.geoLocation as LatLngTuple,
      name: theFirstOne.name,
      poi: poi as PointOfInterest,
    };
  });

  const mapHeight = "500px";

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.location.name}</h3>
      <div className="grid grid-cols-1 gap-4">
        <ClientOnly
          fallback={
            <div
              id="skeleton"
              style={{ height: mapHeight, background: "#d1d1d1" }}
            />
          }
        >
          {() => (
            <Map
              height={mapHeight}
              position={geoLoc}
              zoom={16}
              markers={closestPlaces}
            />
          )}
        </ClientOnly>
      </div>
      <hr className="my-4" />
      <div className="grid grid-cols-1 gap-4">{foo}</div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
