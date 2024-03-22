import { LandMark } from "@prisma/client";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Either } from "effect";
import { useEffect, useRef } from "react";

import { aroundme } from "~/aroundme.server";
import { findOrCreateLandmarks } from "~/landmark-service";
import { pointOfInterest } from "~/lib/aroundme/poi";
import { getLandMarksByCityAndCountry } from "~/models/landMark.server";
import { createListingFromAddressListing } from "~/models/listing.server";
import {
  findOrCreateFromAddressLocation,
} from "~/models/location.server";

const validateLocation = (location: FormDataEntryValue | null) => {
  if (typeof location !== "string" || location.length === 0) {
    return false;
  } else if (location.split(",").length < 2) {
    return false;
  } else {
    return true;
  }
};

const getPOIsAsCheckbox = (pois: string[]) => {
  const groups = [];
  for (let i = 0; i < pois.length; i += 4) {
    const group = pois.slice(i, i + 4);
    groups.push(group);
  }

  return groups.map((group, index) => (
    <div key={index} style={{ marginBottom: "10px" }}>
      {group.map((poi) => (
        <label
          key={poi}
          style={{ display: "inline-block", marginRight: "10px" }}
        >
          <input type="checkbox" id="pois" name="pois" value={poi} /> {poi}
        </label>
      ))}
    </div>
  ));
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const location = formData.get("location");
  const pois = formData.getAll("pois");

  const formLandmarks = formData.getAll("landmarks");

  if (pois.length === 0) {
    return json(
      {
        predefinedLandmarks: null,
        errors: {
          body: null,
          pois: "at least one POI is required",
        },
      },
      { status: 400 },
    );
  }

  if (validateLocation(location) === false) {
    return json(
      {
        predefinedLandmarks: null,
        errors: {
          body: null,
          location: "location is required, format 'street name $number, $city'",
        },
      },
      { status: 400 },
    );
  }

  const geoResults = await aroundme.geoCode(location as string);

  if (Either.isLeft(geoResults)) {
    return json(
      {
        predefinedLandmarks: null,
        errors: {
          body: null,
          location: "cannot find location, try a different one",
        },
      },
      { status: 400 },
    );
  } else {
    const result = geoResults.right;

    const location = await findOrCreateFromAddressLocation(result);

    const landmarksInDb = await findOrCreateLandmarks(result.city, result.country, true)

    // const landmarksInDb = await getLandMarksByCityAndCountry(
    //   result.city,
    //   result.country,
    // );

    if (
      (formLandmarks && formLandmarks.length > 0) ||
      landmarksInDb.length == 0
    ) {
      // I might have everything, redirect
      // find or create listing

      const listing = await createListingFromAddressListing(
        location.name,
        location.id,
        pois as string[],
        formLandmarks as string[],
      );

      return redirect(`/listings/${listing.id}`);
    } else {
      return json(
        {
          predefinedLandmarks: landmarksInDb,
          errors: {
            body: null,
            location: null,
          },
        },
        { status: 400 },
      );
    }
  }
};

export const loader = () => {
  return json({
    pois: pointOfInterest,
  });
};

const landmarksCheckbox = (landmarks: LandMark[]) => {
  return landmarks.map((landmark) => (
    <label
      key={landmark.id}
      style={{ display: "inline-block", marginRight: "10px" }}
    >
      <input type="checkbox" id="landmarks" name="landmarks" value={landmark.id} />{" "}
      {landmark.name}
    </label>
  ));
};

export default function NewListingPage() {
  const actionData = useActionData<typeof action>();
  const locationRef = useRef<HTMLInputElement>(null);
  const data = useLoaderData<typeof loader>();

  const checkboxes = getPOIsAsCheckbox(data.pois);
  const landmarks = actionData?.predefinedLandmarks;

  useEffect(() => {
    if (actionData?.errors?.location) {
      locationRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Location: </span>
          <input
            ref={locationRef}
            name="location"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.location ? true : undefined}
            aria-errormessage={
              actionData?.errors?.location ? "location-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.location ? (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.location}
          </div>
        ) : null}
      </div>
      <div>
        <span>Get information about nearby locations: </span>
        {checkboxes}
        {actionData?.errors?.pois ? (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.pois}
          </div>
        ) : null}
      </div>

      {landmarks && landmarks.length > 0 ? (
        <div>
          <span>Pick landmarks: </span>
          {landmarksCheckbox(landmarks)}
          {/* {actionData?.errors?.landmarks ? (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.landmarks}
          </div>
        ) : null} */}
        </div>
      ) : null}

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
