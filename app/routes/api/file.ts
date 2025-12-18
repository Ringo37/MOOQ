import { requireUser } from "~/services/auth.server";
import { createPresignedGetUrl } from "~/services/storage.server";

import type { Route } from "../api/+types/file";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireUser(request);
  const bucket = params.bucket;
  const key = params.key;
  if (!bucket || !key) {
    throw new Response("Bad Request", { status: 400 });
  }
  const url = await createPresignedGetUrl(bucket, key);

  return url;
}
