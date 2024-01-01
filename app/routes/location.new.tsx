import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { aroundme } from "~/aroundme.server";
import { LocationAddress } from "~/lib/aroundme/types";

import { createLocation, createLocationFromAddressLocation } from "~/models/location.server";

const validateLocation = (location: FormDataEntryValue | null) => {
  //it should be string with comma
  if (typeof location !== "string" || location.length === 0) {
    return false;
  } else if (location.split(",").length !== 2) {
    return false;
  } else {
    return true;
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const location = formData.get("location");

  if (validateLocation(location) === false) {
    return json(
      {
        errors: {
          body: null,
          location: "location is required, format 'street name $number, $city'",
        },
      },
      { status: 400 },
    );
  }
  const geoResults: LocationAddress = await aroundme.geoCode(
    location as string,
  );

  const loc = await createLocationFromAddressLocation(geoResults);

  return redirect(`/location/${loc.id}`);
};

export default function NewNotePage() {
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.location) {
      titleRef.current?.focus();
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
            ref={titleRef}
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
