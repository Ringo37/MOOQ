import { Button, Container, Group, Tabs, Title } from "@mantine/core";
import { Book, Info, User } from "lucide-react";
import { Link, Outlet, useLocation, useParams } from "react-router";

import { canEditCourseBySlug, getCourseBySlug } from "~/models/course.server";
import { requireUser } from "~/services/auth.server";

import type { Route } from "./+types/layout";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const slug = params.slug;

  const canEdit = await canEditCourseBySlug(slug, user.id);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }

  const course = await getCourseBySlug(slug);
  if (!course) {
    throw new Response("Not Found", { status: 404 });
  }

  return { course };
}

export default function CoursesAdminEditLayout({
  loaderData,
}: Route.ComponentProps) {
  const { course } = loaderData;
  const location = useLocation();
  const params = useParams();

  const pathSegments = location.pathname.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];

  const isRoot = lastSegment === params.slug || lastSegment === "";

  let activeTab = "info";
  if (!isRoot) {
    if (lastSegment === "curriculum") activeTab = "curriculum";
    if (lastSegment === "permission") activeTab = "permission";
  }

  const formId =
    activeTab === "curriculum"
      ? "curriculum-form"
      : activeTab === "info"
        ? "info-form"
        : undefined;

  return (
    <Container size="full" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>コース編集 : {course.name}</Title>
        <Group>
          <Button type="submit" form={formId}>
            保存
          </Button>
          <Link to="/courses-admin">
            <Button color="green">コース管理トップ</Button>
          </Link>
        </Group>
      </Group>

      <Tabs value={activeTab}>
        <Tabs.List mb="md">
          <Link to={`/courses-admin/${course.slug}`}>
            <Tabs.Tab value="info" leftSection={<Info size={16} />}>
              情報設定
            </Tabs.Tab>
          </Link>
          <Link to={`/courses-admin/${course.slug}/curriculum`}>
            <Tabs.Tab value="curriculum" leftSection={<Book size={16} />}>
              カリキュラム
            </Tabs.Tab>
          </Link>
          <Link to={`/courses-admin/${course.slug}/permission`}>
            <Tabs.Tab value="permission" leftSection={<User size={16} />}>
              権限設定
            </Tabs.Tab>
          </Link>
        </Tabs.List>

        <Outlet />
      </Tabs>
    </Container>
  );
}
