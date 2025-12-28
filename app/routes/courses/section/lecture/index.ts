import { redirect } from "react-router";

import { getCourseBySlugForUser } from "~/models/course.server";
import { getLectureBySlugForUser } from "~/models/lecture.server";
import { getSectionBySlugForUser } from "~/models/section.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "./+types/index";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.courseSlug;
  const sectionSlug = params.sectionSlug;
  const lectureSlug = params.lectureSlug;

  const course = await getCourseBySlugForUser(courseSlug, userId);
  if (!course) {
    return redirect("/courses");
  }
  const section = await getSectionBySlugForUser(sectionSlug, course.id);
  if (!section) {
    return redirect(`/courses/${courseSlug}`);
  }
  const lecture = await getLectureBySlugForUser(lectureSlug, section.id);
  if (!lecture || !lecture.pages || lecture.pages.length === 0) {
    return redirect(`/courses/${courseSlug}`);
  }
  return redirect(lecture.pages[0].slug);
}
