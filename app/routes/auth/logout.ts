import { redirect } from "react-router";

import { logout } from "~/services/auth.server";

import type { Route } from "./+types/logout";

export const action = async ({ request }: Route.LoaderArgs) => logout(request);

export const loader = async () => redirect("/");
