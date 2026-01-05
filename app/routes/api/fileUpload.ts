import { data } from "react-router";

import { uploadPublicFile } from "~/models/file.server";
import { requireUser } from "~/services/auth.server";

import type { Route } from "./+types/fileUpload";

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request);
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return data({ error: "file not found" }, { status: 400 });
  }
  const ext = file.name.split(".").pop();
  const key = `public/${crypto.randomUUID()}.${ext}`;
  const uploaded = await uploadPublicFile(file, key);
  return data({ url: uploaded.url });
}
