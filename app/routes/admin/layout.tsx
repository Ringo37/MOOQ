import { Outlet, redirect } from "react-router";

import { requireUser } from "~/services/auth.server";

import type { Route } from "../admin/+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  if (user.role !== "ADMIN") {
    return redirect("/");
  }
  return null;
}

export default function AdminLayout() {
  return <Outlet />;
}
