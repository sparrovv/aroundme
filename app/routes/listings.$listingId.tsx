import { DataGrid, GridColDef } from "@mui/x-data-grid";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { cons } from "effect/List";
import { LatLngTuple } from "leaflet";
import { DistanceFromLandMark } from "packages/aroundme/src";
import { list } from "postcss";
import invariant from "tiny-invariant";

import { aroundme } from "~/aroundme.server";
import { ClientOnly } from "~/components/client-only";
import { Map } from "~/components/map.client";
import { GroupedPOIs, LandMark } from "~/lib/aroundme";
import {
  Address,
  DistanceFromLocation,
  PointOfInterest,
} from "~/lib/aroundme/types";
import { getLandMarksByIds } from "~/models/landMark.server";
import { getListingById } from "~/models/listing.server";
import { getLocationById } from "~/models/location.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.listingId, "listingId not found");

  const listing = await getListingById(params.listingId);
  if (!listing) {
    throw new Response("Not Found", { status: 404 });
  }

  const location = await getLocationById(listing.locationId); 
  if (!location) {
    throw new Response("Not Found", { status: 404 });
  }

  // landmarks should be ids
  const landmarksInDb = await getLandMarksByIds(
    listing.landmarks as string[],
  );

  const landmarks: LandMark[] = landmarksInDb.map((landmark) => {
    return {
      name: landmark.name,
      address: landmark.address,
      geoLocation: [landmark.latitude, landmark.longitude],
    };
  });


  const address: Address = {
    address: location.name.split(",")[0],
    city: location.city,
    country: location.country,
  };

  const groupedPois = await aroundme.findAllNearbyPois(
    address, 
    listing.pois as PointOfInterest[], 
    1000
    );

  const landMarksDistance = await aroundme.distanceFromLandmarks(
    address,
    landmarks,
  );

  return json({ location, groupedPois, landMarksDistance });
};

const poiElement = (
  poi: PointOfInterest,
  places: DistanceFromLocation[],
  columns: GridColDef[],
) => {
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
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <DataGrid
          rows={placesWithId}
          columns={columns}
          // sx={{ backgroundColor: "#caffca" }}
          pagination={true}
          pageSizeOptions={[{ value: 5, label: "5" }]}
          paginationModel={{
            page: 0,
            pageSize: 5,
          }}
          paginationMode="client"
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

const poiColumns = [
  { field: "name", headerName: "Name", width: 250, flex: 1 },
  {
    field: "walkingDurationInMinutes",
    headerName: "Walking Duration",
    width: 100,
    flex: 1,
  },
  { field: "rating", headerName: "Rating", width: 100, flex: 1 },
];
function getCentroid(coords: LatLngTuple[]): LatLngTuple {
  let latSum = 0;
  let lngSum = 0;

  coords.forEach(([lat, lng]) => {
    latSum += lat;
    lngSum += lng;
  });

  return [latSum / coords.length, lngSum / coords.length];
}

export default function LocationPage() {
  const data = useLoaderData<typeof loader>();
  const location = data.location;
  const pois: GroupedPOIs = data.groupedPois;
  const landmarks: DistanceFromLandMark[] = data.landMarksDistance;

  const geoLoc = [location.latitude, location.longitude] as LatLngTuple;

  const poisTables = Object.keys(pois).map((poi) => {
    return poiElement(
      poi as PointOfInterest,
      pois[poi as PointOfInterest],
      poiColumns,
    );
  });

  const landmarksMarkers = landmarks.map((landmark) => {
    console.log(landmark);
    return {
      geoLocation: landmark.landMark.geoLocation as LatLngTuple,
      name: landmark.landMark.name,
      poi: "landmark" as const,
      durationInMinutes: landmark.walkingDurationInMinutes,
    };
  });

  const closestPlacesMarkers = Object.keys(pois).map((poi) => {
    const theFirstOne = pois[poi as PointOfInterest][0];
    return {
      geoLocation: theFirstOne.geoLocation as LatLngTuple,
      name: theFirstOne.name,
      poi: poi as PointOfInterest,
      durationInMinutes: theFirstOne.walkingDurationInMinutes!,
    };
  });

  const foo = [...closestPlacesMarkers, ...landmarksMarkers];
  // const foo = closestPlacesMarkers;

  const mapHeight = "500px";
  const centroid = getCentroid(foo.map((marker) => marker.geoLocation));

  return (
    <div>
      <h3 className="text-2xl font-bold">{location.formattedAddress}</h3>
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
              mainLocation={{ name: location.formattedAddress, latLng: geoLoc }}
              center={centroid}
              height={mapHeight}
              zoom={13}
              markers={foo}
            />
          )}
        </ClientOnly>
      </div>
      <hr className="my-4" />
      <div className="grid grid-cols-1 gap-4">{poisTables}</div>
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
