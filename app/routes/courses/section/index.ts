import { redirect } from "react-router";

import { getCourseBySlugForUser } from "~/models/course.server";
import { getSectionBySlugForUser } from "~/models/section.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "./+types/index";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.courseSlug;
  const sectionSlug = params.sectionSlug;

  const course = await getCourseBySlugForUser(courseSlug, userId);
  if (!course) {
    return redirect("/courses");
  }
  const section = await getSectionBySlugForUser(sectionSlug, course.id);
  if (section?.lectures) {
    return redirect(`${section.lectures[0].slug}`);
  }
}
