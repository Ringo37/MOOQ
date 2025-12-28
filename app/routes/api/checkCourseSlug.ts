import { data } from "react-router";

import { getCourseBySlug } from "~/models/course.server";
import { requireUser } from "~/services/auth.server";

import type { Route } from "./+types/checkCourseSlug";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);

  if (!user || user.role === "USER") {
    return data({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return data({ ok: false, message: "slug is required" }, { status: 400 });
  }

  if (slug === "create") {
    return data(
      { ok: false, message: "Cannot use this word" },
      { status: 400 },
    );
  }

  const exists = await getCourseBySlug(slug);

  return data({
    ok: !exists,
  });
}
