import { redirect } from "react-router";

import type { NavGroup } from "~/components/navItems";
import { getCourseBySlugForUser } from "~/models/course.server";
import { getLectureBySlugForUser } from "~/models/lecture.server";
import { getPageBySlugForUser } from "~/models/page.server";
import { getSectionBySlugForUser } from "~/models/section.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "../../../../courses/section/lecture/page/+types/index";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.courseSlug;
  const sectionSlug = params.sectionSlug;
  const lectureSlug = params.lectureSlug;
  const pageSlug = params.pageSlug;

  const course = await getCourseBySlugForUser(courseSlug, userId);
  if (!course) {
    return redirect("/courses");
  }
  const section = await getSectionBySlugForUser(sectionSlug, course.id);
  if (!section) {
    return redirect(`/courses/${courseSlug}`);
  }
  const lecture = await getLectureBySlugForUser(lectureSlug, section.id);
  if (!lecture || !lecture.pages) {
    return redirect(`/courses/${courseSlug}`);
  }
  const page = await getPageBySlugForUser(pageSlug, lecture.id);

  const sidebarData: NavGroup[] = course.sections.map((section) => ({
    icon: "book",
    label: section.name,
    items: section.lectures.map((lecture) => ({
      title: lecture.name,
      link: `/courses/${course.slug}/${section.slug}/${lecture.slug}`,
    })),
  }));
  return { page, sidebarData };
}

export default function PageIndex() {
  return;
}
