import type { NavGroup } from "~/components/navItems";
import {
  canEditCourseBySlug,
  getCourseBySlugWithCurriculum,
} from "~/models/course.server";
import { requireUser } from "~/services/auth.server";

import type { Route } from "../../coursesAdmin/edit/+types/permission";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const slug = params.slug;

  const canEdit = await canEditCourseBySlug(slug, user.id);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }

  const course = await getCourseBySlugWithCurriculum(slug);
  if (!course) {
    throw new Response("Not Found", { status: 404 });
  }

  const sidebarDataCourse: NavGroup[] = course.sections.map((section) => ({
    icon: "book",
    label: section.name,
    items: section.lectures.map((lecture) => ({
      title: lecture.name,
      link: `/courses/${course.slug}/${section.slug}/${lecture.slug}`,
    })),
  }));

  const sidebarDataPages: NavGroup = {
    icon: "page",
    label: "ページ一覧",
    items: course.sections.flatMap((section) =>
      section.lectures.flatMap((lecture) =>
        lecture.pages.map((page) => ({
          title: `${page.name} (${lecture.name})`,
          link: `/courses-admin/${course.slug}/${section.slug}/${lecture.slug}/${page.slug}`,
        })),
      ),
    ),
  };
  const sidebarData: NavGroup[] = [...sidebarDataCourse, sidebarDataPages];

  return { course, sidebarData };
}

export async function CoursesAdminEditPermission() {
  return null;
}
