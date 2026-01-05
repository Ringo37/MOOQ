import { redirect } from "react-router";

import { requireUser } from "~/services/auth.server";
import { createPresignedGetUrl } from "~/services/storage.server";

import type { Route } from "./+types/file";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireUser(request);
  const { "*": key } = params;
  if (!key) {
    throw new Response("Bad Request", { status: 400 });
  }
  const url = await createPresignedGetUrl(key);

  return redirect(url);
}
