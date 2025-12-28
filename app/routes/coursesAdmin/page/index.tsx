import { Button, Container, Divider, Group, Title } from "@mantine/core";
import { Link } from "react-router";

import { canEditCourseBySlug, getCourseBySlug } from "~/models/course.server";
import { getLectureBySlug } from "~/models/lecture.server";
import { getPageBySlug } from "~/models/page.server";
import { getSectionBySlug } from "~/models/section.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "../../coursesAdmin/page/+types/index";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.courseSlug;
  const sectionSlug = params.sectionSlug;
  const lectureSlug = params.lectureSlug;
  const pageSlug = params.pageSlug;
  const canEdit = await canEditCourseBySlug(courseSlug, userId);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }

  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    throw new Response("Not Found", { status: 404 });
  }
  const section = await getSectionBySlug(sectionSlug, course.id);
  if (!section) {
    throw new Response("Not Found", { status: 404 });
  }
  const lecture = await getLectureBySlug(lectureSlug, section.id);
  if (!lecture) {
    throw new Response("Not Found", { status: 404 });
  }
  const page = await getPageBySlug(pageSlug, lecture.id);
  return { page };
}

export default function CoursesAdminPageIndex({
  params,
  loaderData,
}: Route.ComponentProps) {
  const { page } = loaderData;
  return (
    <Container size="full" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>ページ編集 : {page?.name}</Title>
        <Group>
          <Button type="submit">保存</Button>
          <Link to={`/courses-admin/${params.courseSlug}/curriculum`}>
            <Button color="green">カリキュラム編集</Button>
          </Link>
        </Group>
      </Group>
      <Divider />
    </Container>
  );
}
