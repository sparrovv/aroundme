import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { PointOfInterest } from "~/lib/aroundme/types";
import { getListings } from "~/models/listing.server";

// interface Listing {
//     id: number
//     language: string
//     location: {
//         name: string
//     }
//     description: string
//     included_pois: PointOfInterest[]
// }

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const listings = await getListings();
  return json({ listings });
};

export default function ListingPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Listings</Link>
        </h1>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Location Listing
          </Link>

          <hr />

          {data.listings.length === 0 ? (
            <p className="p-4">No Listings yet</p>
          ) : (
            <ol>
              {data.listings.map((listing) => (
                <li key={listing.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={listing.id.toString()}
                  > 
                   {listing.name} - {listing.createdAt}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
